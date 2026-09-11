import React, { useState, useEffect } from 'react';
import { X, Play, Clock, Sparkles, Sliders, ShieldCheck, Flame, Zap, HelpCircle, Plus, Minus } from 'lucide-react';
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

  const [roundsInput, setRoundsInput] = useState<string>(String(gameSettings?.rounds || 3));
  const [timeLimitInput, setTimeLimitInput] = useState<string>(String(gameSettings?.timeLimit || 45));

  // Sync with prop when opened or gameType changes
  useEffect(() => {
    if (isOpen) {
      let defaultRounds = 3;
      let defaultTime = 45;

      if (gameType === 'word_battle') {
        defaultRounds = 3;
        defaultTime = 45;
        setCustomParam(4);
      } else if (gameType === 'secret_battle') {
        defaultRounds = 3;
        defaultTime = 45;
      } else if (gameType === 'most_likely_to') {
        defaultRounds = 5;
        defaultTime = 25;
      } else if (gameType === 'memory_battle') {
        defaultRounds = 4;
        defaultTime = 25;
      } else if (gameType === 'solah_chits') {
        defaultRounds = 3;
        defaultTime = 10; // pass wave duration
        setCustomParam(8); // reaction slam window
      } else if (gameType === 'who_said_it') {
        defaultRounds = 3;
        defaultTime = 40;
      } else if (gameType === 'wordle') {
        defaultRounds = 3;
        defaultTime = 0; // Untimed
      }

      setRounds(defaultRounds);
      setRoundsInput(String(defaultRounds));
      setTimeLimit(defaultTime);
      setTimeLimitInput(String(defaultTime));
    }
  }, [isOpen, gameType]);

  if (!isOpen) return null;

  const onlinePlayersCount = (Object.values(players) as Player[]).filter((p) => p.isOnline).length;
  const canStart = onlinePlayersCount >= meta.minPlayers;

  const updateRounds = (val: number) => {
    const valid = Math.max(1, Math.min(100, val));
    setRounds(valid);
    setRoundsInput(String(valid));
    soundService.playClick();
  };

  const updateTimeLimit = (val: number) => {
    const valid = Math.max(5, Math.min(600, val));
    setTimeLimit(valid);
    setTimeLimitInput(String(valid));
    soundService.playClick();
  };

  const handleRoundsBlur = () => {
    const parsed = parseInt(roundsInput, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      updateRounds(parsed);
    } else {
      setRoundsInput(String(rounds));
    }
  };

  const handleTimeBlur = () => {
    const parsed = parseInt(timeLimitInput, 10);
    if (!isNaN(parsed) && parsed >= 5) {
      updateTimeLimit(parsed);
    } else {
      setTimeLimitInput(String(timeLimit));
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-violet-500/40 bg-zinc-950 p-4 sm:p-6 md:p-7 shadow-2xl max-h-[90vh] flex flex-col my-auto">
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-16 -left-16 h-40 w-40 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: meta.accentColor }}
        />

        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition cursor-pointer z-10"
          aria-label="Close Launch Modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-3.5 mb-4 sm:mb-6 shrink-0 pr-10">
          <div
            className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-lg border"
            style={{
              backgroundColor: `${meta.accentColor}20`,
              borderColor: `${meta.accentColor}50`
            }}
          >
            {meta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">{meta.title}</h2>
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
            <p className="text-xs text-zinc-400 mt-0.5 sm:mt-1">{meta.tagline}</p>
          </div>
        </div>

        {/* Game-Specific Settings Form (Scrollable) */}
        <div className="space-y-4 rounded-2xl bg-zinc-900/60 p-3.5 sm:p-4 border border-zinc-800/80 mb-4 sm:mb-5 overflow-y-auto flex-1 pr-1 overscroll-contain">
          <div className="flex items-center gap-2 text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">
            <Sliders className="h-3.5 w-3.5" />
            <span>Customize Rounds & Settings</span>
          </div>

          {/* 1. Rounds Configuration */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
              <span>Number of Rounds</span>
              <span className="text-violet-400 font-bold font-mono">{rounds} {rounds === 1 ? 'Round' : 'Rounds'}</span>
            </div>

            <div className="flex items-center gap-2 mb-2.5">
              <button
                type="button"
                onClick={() => updateRounds(rounds - 1)}
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700 active:scale-95"
                aria-label="Decrease rounds"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                max={100}
                value={roundsInput}
                onChange={(e) => setRoundsInput(e.target.value)}
                onBlur={handleRoundsBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleRoundsBlur()}
                className="flex-1 h-11 rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-center text-sm font-bold text-white font-mono focus:border-violet-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => updateRounds(rounds + 1)}
                className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700 active:scale-95"
                aria-label="Increase rounds"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {[1, 2, 3, 5, 8].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateRounds(num)}
                  className={`h-11 min-h-[44px] rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
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

          {/* 2. Time Limit Configuration / Untimed Wordle Display */}
          {gameType === 'wordle' ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  🟩
                </span>
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  Untimed Puzzle Mode
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Wordle has <strong className="text-emerald-400">no time limit</strong>. Players can take all the time they need to solve each word puzzle without any countdown timer pressure.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>{gameType === 'solah_chits' ? 'Pass Wave Timer' : 'Round Time Limit'}</span>
                <span className="text-violet-400 font-bold font-mono">{timeLimit} Seconds</span>
              </div>

              <div className="flex items-center gap-2 mb-2.5">
                <button
                  type="button"
                  onClick={() => updateTimeLimit(timeLimit - (gameType === 'solah_chits' ? 1 : 5))}
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700 active:scale-95"
                  aria-label="Decrease time limit"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min={5}
                  max={600}
                  step={gameType === 'solah_chits' ? 1 : 5}
                  value={timeLimitInput}
                  onChange={(e) => setTimeLimitInput(e.target.value)}
                  onBlur={handleTimeBlur}
                  onKeyDown={(e) => e.key === 'Enter' && handleTimeBlur()}
                  className="flex-1 h-11 rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-center text-sm font-bold text-white font-mono focus:border-violet-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => updateTimeLimit(timeLimit + (gameType === 'solah_chits' ? 1 : 5))}
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700 active:scale-95"
                  aria-label="Increase time limit"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {(gameType === 'solah_chits' ? [6, 8, 10, 12, 15, 20] : [15, 20, 30, 45, 60, 90, 120]).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => updateTimeLimit(sec)}
                    className={`h-11 min-h-[44px] min-w-[44px] px-3.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                      timeLimit === sec
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Game-Specific Extra Settings */}
          {gameType === 'word_battle' && (
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
                    className={`h-11 min-h-[44px] rounded-xl px-3 text-xs font-bold transition cursor-pointer flex items-center justify-center ${
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
          )}

          {gameType === 'solah_chits' && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-2">
                <span>Reaction Slam Window</span>
                <span className="text-amber-400 font-bold font-mono">{customParam}s</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sec: 5, label: '5s (Insane Flash ⚡)' },
                  { sec: 8, label: '8s (Standard 🎯)' },
                  { sec: 12, label: '12s (Relaxed ☕)' }
                ].map((opt) => (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => {
                      setCustomParam(opt.sec);
                      soundService.playClick();
                    }}
                    className={`h-11 min-h-[44px] rounded-xl px-1 text-center text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                      customParam === opt.sec
                        ? 'bg-amber-600 text-white shadow-md'
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
                    className={`min-h-[50px] rounded-xl p-3 text-left text-xs font-bold transition cursor-pointer flex flex-col justify-center ${
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
        </div>

        {/* Player Status Notice */}
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-4 px-1 shrink-0">
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
        <div className="flex items-center justify-end gap-3 pt-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-12 min-h-[44px] rounded-xl px-5 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer flex items-center justify-center"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={!canStart || !isHost}
            onClick={handleLaunch}
            className={`flex h-12 min-h-[44px] items-center gap-2 rounded-xl px-6 text-sm font-black text-white shadow-lg transition cursor-pointer ${
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
