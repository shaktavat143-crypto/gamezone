import React, { useState } from 'react';
import { Settings, Lock, Unlock, Users, RotateCcw, AlertTriangle, X, Plus, Minus, Check } from 'lucide-react';
import { GameSettings, Player, GameType } from '../types.js';
import { socketService } from '../services/socket.js';
import { soundService } from '../services/sound.js';

interface HostControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLocked: boolean;
  gameSettings: GameSettings;
  players: Record<string, Player>;
  myPlayerId: string;
  gameStatus: string;
  currentGame?: GameType | null;
}

export const HostControlModal: React.FC<HostControlModalProps> = ({
  isOpen,
  onClose,
  isLocked,
  gameSettings,
  players,
  myPlayerId,
  gameStatus,
  currentGame
}) => {
  const [customRoundsInput, setCustomRoundsInput] = useState<string>(String(gameSettings.rounds || 3));
  const [customTimeInput, setCustomTimeInput] = useState<string>(String(gameSettings.timeLimit || 45));

  if (!isOpen) return null;

  const handleToggleLock = () => {
    socketService.toggleLock();
    soundService.playClick();
  };

  const handleUpdateRounds = (rounds: number) => {
    const valid = Math.max(1, Math.min(100, rounds));
    setCustomRoundsInput(String(valid));
    socketService.updateGameSettings({ rounds: valid });
    soundService.playClick();
  };

  const handleUpdateTimeLimit = (timeLimit: number) => {
    const valid = Math.max(5, Math.min(600, timeLimit));
    setCustomTimeInput(String(valid));
    socketService.updateGameSettings({ timeLimit: valid });
    soundService.playClick();
  };

  const handleRoundsBlur = () => {
    const val = parseInt(customRoundsInput, 10);
    if (!isNaN(val) && val >= 1) {
      handleUpdateRounds(val);
    } else {
      setCustomRoundsInput(String(gameSettings.rounds || 3));
    }
  };

  const handleTimeBlur = () => {
    const val = parseInt(customTimeInput, 10);
    if (!isNaN(val) && val >= 5) {
      handleUpdateTimeLimit(val);
    } else {
      setCustomTimeInput(String(gameSettings.timeLimit || 45));
    }
  };

  const handleReturnLobby = () => {
    if (confirm('Return everyone to the lobby? The active game will be stopped.')) {
      socketService.returnToLobby();
      soundService.playClick();
      onClose();
    }
  };

  const handleKick = (playerId: string, name: string) => {
    if (confirm(`Kick ${name} from the party?`)) {
      socketService.kickPlayer(playerId);
      soundService.playClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-zinc-950 p-4 sm:p-6 shadow-2xl max-h-[90vh] flex flex-col my-auto">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer z-10"
          aria-label="Close Host Controls"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 sm:mb-5 shrink-0 pr-10">
          <div className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Host Controls</h2>
            <p className="text-xs text-zinc-400">Manage room permissions, customizable rounds & time limits</p>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-5 overflow-y-auto flex-1 pr-1 overscroll-contain">
          {/* Party Lock Status */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl ${isLocked ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {isLocked ? <Lock className="h-5 w-5" /> : <Unlock className="h-5 w-5" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  {isLocked ? 'Party is Locked' : 'Party is Open'}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {isLocked ? 'New players cannot join with code' : 'Anyone with the code can join'}
                </div>
              </div>
            </div>
            <button
              onClick={handleToggleLock}
              className={`h-11 min-h-[44px] rounded-xl px-4 text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                isLocked
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-amber-600 text-white hover:bg-amber-500'
              }`}
            >
              {isLocked ? 'Unlock Room' : 'Lock Room'}
            </button>
          </div>

          {/* Game Settings */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-4">
            <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Custom Game Timing & Rounds
            </div>

            {/* Custom Rounds */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-400">Number of Rounds:</span>
                <span className="font-bold text-amber-400 font-mono">{gameSettings.rounds} Rounds</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2.5">
                <button
                  onClick={() => handleUpdateRounds((gameSettings.rounds || 3) - 1)}
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700 active:scale-95"
                  aria-label="Decrease rounds"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={customRoundsInput}
                  onChange={(e) => setCustomRoundsInput(e.target.value)}
                  onBlur={handleRoundsBlur}
                  onKeyDown={(e) => e.key === 'Enter' && handleRoundsBlur()}
                  className="flex-1 h-11 rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-center text-sm font-bold text-white font-mono focus:border-amber-400 focus:outline-none"
                />
                <button
                  onClick={() => handleUpdateRounds((gameSettings.rounds || 3) + 1)}
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700 active:scale-95"
                  aria-label="Increase rounds"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 5, 8, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleUpdateRounds(num)}
                    className={`h-11 min-h-[44px] min-w-[44px] px-3.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                      gameSettings.rounds === num
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-zinc-800/90 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time Limit / Untimed Wordle */}
            {currentGame === 'wordle' ? (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 flex items-center gap-2.5">
                <span className="text-xl">🟩</span>
                <div>
                  <div className="text-xs font-bold text-emerald-300">Wordle is Untimed</div>
                  <div className="text-[11px] text-zinc-400">Wordle has no countdown timer limit.</div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-zinc-400">Round Time Limit (Seconds):</span>
                  <span className="font-bold text-amber-400 font-mono">{gameSettings.timeLimit}s</span>
                </div>

                <div className="flex items-center gap-2 mb-2.5">
                  <button
                    onClick={() => handleUpdateTimeLimit((gameSettings.timeLimit || 45) - 5)}
                    className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700 active:scale-95"
                    aria-label="Decrease time limit"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={5}
                    max={600}
                    step={5}
                    value={customTimeInput}
                    onChange={(e) => setCustomTimeInput(e.target.value)}
                    onBlur={handleTimeBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleTimeBlur()}
                    className="flex-1 h-11 rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-center text-sm font-bold text-white font-mono focus:border-amber-400 focus:outline-none"
                  />
                  <button
                    onClick={() => handleUpdateTimeLimit((gameSettings.timeLimit || 45) + 5)}
                    className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700 active:scale-95"
                    aria-label="Increase time limit"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[10, 15, 20, 30, 45, 60, 90, 120, 180].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => handleUpdateTimeLimit(sec)}
                      className={`h-11 min-h-[44px] min-w-[44px] px-3.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                        gameSettings.timeLimit === sec
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-zinc-800/90 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Active Game Abort */}
          {gameStatus === 'in_game' && (
            <div className="rounded-2xl border border-rose-900/50 bg-rose-950/20 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Active Game in Progress
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  Stop the ongoing match and bring everyone back to party lobby.
                </div>
              </div>
              <button
                onClick={handleReturnLobby}
                className="h-11 min-h-[44px] rounded-xl bg-rose-700 hover:bg-rose-600 px-4 text-xs font-bold text-white transition cursor-pointer shrink-0 flex items-center justify-center"
              >
                End Game
              </button>
            </div>
          )}

          {/* Player Management List */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-zinc-400" />
                Party Members ({Object.keys(players).length})
              </span>
            </div>

            <div className="space-y-2">
              {(Object.values(players) as Player[]).map((p) => {
                const isMe = p.id === myPlayerId;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-950/60 p-2.5 text-xs border border-zinc-800/60"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg shrink-0">{p.avatar}</span>
                      <span className="font-semibold text-white truncate max-w-[140px]">{p.name}</span>
                      {p.isHost && (
                        <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 shrink-0">
                          HOST
                        </span>
                      )}
                      {isMe && <span className="text-[10px] text-zinc-500 shrink-0">(You)</span>}
                    </div>

                    {!isMe && (
                      <button
                        onClick={() => handleKick(p.id, p.name)}
                        className="h-11 min-h-[44px] px-3.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/80 transition cursor-pointer flex items-center justify-center"
                      >
                        Kick
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
