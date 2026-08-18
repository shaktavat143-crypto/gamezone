import React, { useState, useEffect } from 'react';
import { X, Play, Clock, Sparkles, Sliders, ShieldCheck, Flame, Zap, HelpCircle } from 'lucide-react';
import { GameType, GameSettings, ClientPartyView, Player } from '../types.js';
import { AVAILABLE_GAMES } from '../data/games.js';
import { socketService } from '../services/socket.js';
import { soundService } from '../services/sound.js';

interface GameLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: GameType;
  party: ClientPartyView;
}

export const GameLaunchModal: React.FC<GameLaunchModalProps> = ({
  isOpen,
  onClose,
  gameType,
  party
}) => {
  const meta = AVAILABLE_GAMES.find((g) => g.id === gameType) || AVAILABLE_GAMES[0];
  const { isHost, players, gameSettings } = party;

  // Local settings state initialized from party settings
  const [rounds, setRounds] = useState<number>(gameSettings?.rounds || 3);
  const [timeLimit, setTimeLimit] = useState<number>(gameSettings?.timeLimit || 45);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>(gameSettings?.difficulty || 'normal');
  const [customParam, setCustomParam] = useState<any>(gameSettings?.customParam ?? 4);

  // Sync with prop when opened or gameType changes
  useEffect(() => {
    if (isOpen) {
      if (gameType === 'number_guess') {
        setRounds(3);
        setTimeLimit(60);
        setDifficulty('normal');
      } else if (gameType === 'word_battle') {
        setRounds(3);
        setTimeLimit(45);
        setCustomParam(4);
      } else if (gameType === 'secret_battle') {
        setRounds(3);
        setTimeLimit(45);
      } else if (gameType === 'most_likely_to') {
        setRounds(5);
        setTimeLimit(25);
      } else if (gameType === 'memory_battle') {
        setRounds(4);
        setTimeLimit(15);
      } else if (gameType === 'who_said_it') {
        setRounds(3);
        setTimeLimit(40);
      }
    }
  }, [isOpen, gameType]);

  if (!isOpen) return null;

  const onlinePlayersCount = (Object.values(players) as Player[]).filter((p) => p.isOnline).length;
  const canStart = onlinePlayersCount >= meta.minPlayers;

  const handleLaunch = () => {
    if (!isHost || !canStart) return;

    const finalSettings: GameSettings = {
      rounds,
      timeLimit,
      difficulty,
      customParam
    };

    socketService.updateGameSettings(finalSettings);
    socketService.startGame(gameType);
    soundService.playGameStart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-violet-500/40 bg-zinc-950 p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-16 -left-16 h-40 w-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: meta.accentColor }}
        />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-6">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-lg border"
            style={{
              backgroundColor: `${meta.accentColor}20`,
              borderColor: `${meta.accentColor}50`
            }}
          >
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{meta.title}</h2>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: `${meta.accentColor}20`,
                  color: meta.accentColor,
                  borderColor: `${meta.accentColor}40`
                }}
              >
                Host Config
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{meta.tagline}</p>
          </div>
        </div>

        {/* Game-Specific Settings Form */}
        <div className="space-y-4 rounded-2xl bg-zinc-900/60 p-4 border border-zinc-800/80 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
            <Sliders className="h-3.5 w-3.5" />
            <span>Configure Game Rules</span>
          </div>

          {/* 1. Rounds Configuration */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
              <span>Number of Rounds</span>
              <span className="text-violet-400 font-bold">{rounds} {rounds === 1 ? 'Round' : 'Rounds'}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 5, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setRounds(num);
                    soundService.playClick();
                  }}
                  className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                    rounds === num
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {num} {num === 1 ? 'Rnd' : 'Rnds'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Game-Specific Setting Options */}
          {gameType === 'word_battle' && (
            <>
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                  <span>Round Duration</span>
                  <span className="text-violet-400 font-bold">{timeLimit} Seconds</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { sec: 30, label: '30s (Blitz)' },
                    { sec: 45, label: '45s (Standard)' },
                    { sec: 60, label: '60s (Casual)' }
                  ].map((opt) => (
                    <button
                      key={opt.sec}
                      type="button"
                      onClick={() => {
                        setTimeLimit(opt.sec);
                        soundService.playClick();
                      }}
                      className={`rounded-xl py-2 px-1 text-center text-xs font-bold transition cursor-pointer ${
                        timeLimit === opt.sec
                          ? 'bg-violet-600 text-white shadow-md'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                  <span>Categories per Round</span>
                  <span className="text-violet-400 font-bold">{customParam} Categories</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { count: 4, label: '4 Categories (Classic)' },
                    { count: 6, label: '6 Categories (Expert)' }
                  ].map((opt) => (
                    <button
                      key={opt.count}
                      type="button"
                      onClick={() => {
                        setCustomParam(opt.count);
                        soundService.playClick();
                      }}
                      className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                        customParam === opt.count
                          ? 'bg-violet-600 text-white shadow-md'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {gameType === 'number_guess' && (
            <>
              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                  <span>Target Number Range & Difficulty</span>
                  <span className="text-violet-400 font-bold capitalize">{difficulty}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { diff: 'easy' as const, label: '1 - 50', tag: 'Easy' },
                    { diff: 'normal' as const, label: '1 - 100', tag: 'Standard' },
                    { diff: 'hard' as const, label: '1 - 1000', tag: 'Extreme' }
                  ].map((item) => (
                    <button
                      key={item.diff}
                      type="button"
                      onClick={() => {
                        setDifficulty(item.diff);
                        soundService.playClick();
                      }}
                      className={`rounded-xl py-2 px-2 text-center text-xs font-bold transition cursor-pointer ${
                        difficulty === item.diff
                          ? 'bg-violet-600 text-white shadow-md'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      <div>{item.label}</div>
                      <div className="text-[10px] font-normal opacity-75">{item.tag}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                  <span>Round Time Limit</span>
                  <span className="text-violet-400 font-bold">{timeLimit}s</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { sec: 45, label: '45s' },
                    { sec: 60, label: '60s' },
                    { sec: 90, label: '90s' }
                  ].map((opt) => (
                    <button
                      key={opt.sec}
                      type="button"
                      onClick={() => {
                        setTimeLimit(opt.sec);
                        soundService.playClick();
                      }}
                      className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                        timeLimit === opt.sec
                          ? 'bg-violet-600 text-white shadow-md'
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {gameType === 'secret_battle' && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Clue Writing Time</span>
                <span className="text-violet-400 font-bold">{timeLimit}s</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sec: 30, label: '30s (Quick)' },
                  { sec: 45, label: '45s (Balanced)' },
                  { sec: 60, label: '60s (Thoughtful)' }
                ].map((opt) => (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => {
                      setTimeLimit(opt.sec);
                      soundService.playClick();
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                      timeLimit === opt.sec
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameType === 'most_likely_to' && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Voting Speed</span>
                <span className="text-violet-400 font-bold">{timeLimit}s per Prompt</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sec: 15, label: '15s (Speedy)' },
                  { sec: 25, label: '25s (Standard)' },
                  { sec: 40, label: '40s (Party)' }
                ].map((opt) => (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => {
                      setTimeLimit(opt.sec);
                      soundService.playClick();
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                      timeLimit === opt.sec
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameType === 'memory_battle' && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Memory Challenge Pacing</span>
                <span className="text-violet-400 font-bold capitalize">{difficulty}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { diff: 'normal' as const, label: 'Standard Pacing', desc: '4-5s memorize phase' },
                  { diff: 'hard' as const, label: 'Fast Flash ⚡', desc: '2-3s high-speed flashes' }
                ].map((item) => (
                  <button
                    key={item.diff}
                    type="button"
                    onClick={() => {
                      setDifficulty(item.diff);
                      soundService.playClick();
                    }}
                    className={`rounded-xl p-2.5 text-left text-xs font-bold transition cursor-pointer ${
                      difficulty === item.diff
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <div>{item.label}</div>
                    <div className="text-[10px] font-normal opacity-75">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameType === 'who_said_it' && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Secret Prompt Writing Time</span>
                <span className="text-violet-400 font-bold">{timeLimit}s</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sec: 30, label: '30s (Fast)' },
                  { sec: 45, label: '45s (Standard)' },
                  { sec: 60, label: '60s (Creative)' }
                ].map((opt) => (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => {
                      setTimeLimit(opt.sec);
                      soundService.playClick();
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                      timeLimit === opt.sec
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Player Status Notice */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-6 px-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white">{onlinePlayersCount}</span> online players
            <span className="text-zinc-500">·</span>
            <span>Needs min <strong className="text-white">{meta.minPlayers}</strong></span>
          </div>

          {!canStart ? (
            <span className="text-amber-400 font-medium">Need more players</span>
          ) : (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Ready to launch
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={!canStart || !isHost}
            onClick={handleLaunch}
            className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white shadow-lg transition cursor-pointer ${
              canStart && isHost
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/30 hover:scale-[1.02]'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Launch {meta.title}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
