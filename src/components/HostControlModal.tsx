import React from 'react';
import { Settings, Lock, Unlock, Users, RotateCcw, AlertTriangle, X, ShieldAlert } from 'lucide-react';
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
  if (!isOpen) return null;

  const handleToggleLock = () => {
    socketService.toggleLock();
    soundService.playClick();
  };

  const handleUpdateRounds = (rounds: number) => {
    socketService.updateGameSettings({ rounds });
    soundService.playClick();
  };

  const handleUpdateTimeLimit = (timeLimit: number) => {
    socketService.updateGameSettings({ timeLimit });
    soundService.playClick();
  };

  const handleUpdateDifficulty = (difficulty: 'easy' | 'normal' | 'hard') => {
    socketService.updateGameSettings({ difficulty });
    soundService.playClick();
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
            <p className="text-xs text-zinc-400">Manage room permissions, players & game settings</p>
          </div>
        </div>

        <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
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
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 space-y-3.5">
            <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Default Game Settings
            </div>

            {/* Rounds */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Number of Rounds:</span>
                <span className="font-bold text-white font-mono">{gameSettings.rounds} Rounds</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 5, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleUpdateRounds(num)}
                    className={`rounded-lg py-1 text-xs font-bold transition cursor-pointer ${
                      gameSettings.rounds === num
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Round Time Limit:</span>
                <span className="font-bold text-white font-mono">{gameSettings.timeLimit}s</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[20, 30, 45, 60].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleUpdateTimeLimit(sec)}
                    className={`rounded-lg py-1 text-xs font-bold transition cursor-pointer ${
                      gameSettings.timeLimit === sec
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-zinc-400">Game Difficulty / Range:</span>
                <span className="font-bold text-white capitalize">{gameSettings.difficulty}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['easy', 'normal', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleUpdateDifficulty(diff)}
                    className={`rounded-lg py-1 text-xs font-bold capitalize transition cursor-pointer ${
                      gameSettings.difficulty === diff
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Manage Players / Kick */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5">
            <div className="text-xs font-bold text-zinc-200 uppercase tracking-wider mb-2">
              Manage Players ({Object.keys(players).length})
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {(Object.values(players) as Player[]).map((p) => {
                if (p.id === myPlayerId) return null;
                return (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-zinc-950 px-2.5 py-1.5 border border-zinc-800/80">
                    <div className="flex items-center gap-2">
                      <span>{p.avatar}</span>
                      <span className="text-xs font-medium text-white">{p.name}</span>
                    </div>
                    <button
                      onClick={() => handleKick(p.id, p.name)}
                      className="rounded bg-rose-950/40 px-2 py-1 text-[10px] font-semibold text-rose-400 hover:bg-rose-900/50 transition cursor-pointer"
                    >
                      Kick
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Return Everyone to Lobby Action */}
          {gameStatus !== 'lobby' && (
            <div className="rounded-xl border border-rose-900/30 bg-rose-950/20 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-300">
                <RotateCcw className="h-4 w-4 shrink-0" />
                <span className="text-xs font-semibold">Cancel Game & Return to Lobby</span>
              </div>
              <button
                onClick={handleReturnLobby}
                className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition cursor-pointer shadow-sm"
              >
                Return All
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
