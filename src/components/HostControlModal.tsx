import React, { useState } from 'react';
import { Settings, Lock, Unlock, Users, RotateCcw, AlertTriangle, X, Plus, Minus, Check } from 'lucide-react';
import { GameSettings, Player } from '../types.js';
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
}

export const HostControlModal: React.FC<HostControlModalProps> = ({
  isOpen,
  onClose,
  isLocked,
  gameSettings,
  players,
  myPlayerId,
  gameStatus
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/30 bg-zinc-950 p-5 sm:p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Host Controls</h2>
            <p className="text-xs text-zinc-400">Manage room permissions, customizable rounds & time limits</p>
          </div>
        </div>

        <div className="space-y-5 max-h-[460px] overflow-y-auto pr-1">
          {/* Party Lock Status */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isLocked ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
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
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                isLocked
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-amber-600 text-white hover:bg-amber-500'
              }`}
            >
              {isLocked ? 'Unlock Room' : 'Lock Room'}
            </button>
          </div>

          {/* Game Settings */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-4">
            <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Custom Game Timing & Rounds
            </div>

            {/* Custom Rounds */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Number of Rounds:</span>
                <span className="font-bold text-amber-400 font-mono">{gameSettings.rounds} Rounds</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => handleUpdateRounds((gameSettings.rounds || 3) - 1)}
                  className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700"
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
                  className="flex-1 h-9 rounded-lg bg-zinc-900 border border-zinc-700 px-3 text-center text-sm font-bold text-white font-mono focus:border-amber-400 focus:outline-none"
                />
                <button
                  onClick={() => handleUpdateRounds((gameSettings.rounds || 3) + 1)}
                  className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[1, 2, 3, 5, 8, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleUpdateRounds(num)}
                    className={`rounded-lg py-1 px-2.5 text-xs font-bold transition cursor-pointer ${
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

            {/* Custom Time Limit */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Round Time Limit (Seconds):</span>
                <span className="font-bold text-amber-400 font-mono">{gameSettings.timeLimit}s</span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => handleUpdateTimeLimit((gameSettings.timeLimit || 45) - 5)}
                  className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700"
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
                  className="flex-1 h-9 rounded-lg bg-zinc-900 border border-zinc-700 px-3 text-center text-sm font-bold text-white font-mono focus:border-amber-400 focus:outline-none"
                />
                <button
                  onClick={() => handleUpdateTimeLimit((gameSettings.timeLimit || 45) + 5)}
                  className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition cursor-pointer border border-zinc-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[10, 15, 20, 30, 45, 60, 90, 120, 180].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleUpdateTimeLimit(sec)}
                    className={`rounded-lg py-1 px-2.5 text-xs font-bold transition cursor-pointer ${
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
          </div>

          {/* Active Game Abort */}
          {gameStatus === 'in_game' && (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-3.5 flex items-center justify-between">
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
                className="rounded-xl bg-rose-700 hover:bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer shrink-0 ml-2"
              >
                End Game
              </button>
            </div>
          )}

          {/* Player Management List */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-zinc-400" />
                Party Members ({Object.keys(players).length})
              </span>
            </div>

            <div className="space-y-1.5">
              {(Object.values(players) as Player[]).map((p) => {
                const isMe = p.id === myPlayerId;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-zinc-950/60 p-2 text-xs border border-zinc-800/60"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{p.avatar}</span>
                      <span className="font-semibold text-white truncate max-w-[120px]">{p.name}</span>
                      {p.isHost && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-300">
                          HOST
                        </span>
                      )}
                      {isMe && <span className="text-[10px] text-zinc-500">(You)</span>}
                    </div>

                    {!isMe && (
                      <button
                        onClick={() => handleKick(p.id, p.name)}
                        className="rounded px-2 py-1 text-[10px] font-bold text-rose-400 hover:bg-rose-950/80 transition cursor-pointer"
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
