import React from 'react';
import { Trophy, X, Medal, Crown } from 'lucide-react';
import { Player } from '../types.js';
import { PlayerAvatar } from './PlayerAvatar.js';

interface OverallScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Record<string, Player>;
  myPlayerId: string;
}

export const OverallScoreboardModal: React.FC<OverallScoreboardModalProps> = ({
  isOpen,
  onClose,
  players,
  myPlayerId
}) => {
  if (!isOpen) return null;

  const sortedPlayers = (Object.values(players) as Player[]).sort((a, b) => b.totalScore - a.totalScore);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <span className="text-xl">🥇</span>;
      case 1:
        return <span className="text-xl">🥈</span>;
      case 2:
        return <span className="text-xl">🥉</span>;
      default:
        return <span className="text-xs font-mono font-bold text-zinc-500">{index + 1}.</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Overall Party Leaderboard</h2>
            <p className="text-xs text-zinc-400">Cumulative points earned across all games</p>
          </div>
        </div>

        <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {sortedPlayers.map((player, idx) => {
            const isMe = player.id === myPlayerId;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between rounded-2xl p-3 border transition ${
                  idx === 0
                    ? 'bg-amber-950/20 border-amber-500/30 shadow-sm'
                    : isMe
                    ? 'bg-violet-950/20 border-violet-500/30'
                    : 'bg-zinc-900/60 border-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex w-6 justify-center">{getRankBadge(idx)}</div>

                  <PlayerAvatar
                    avatar={player.avatar}
                    name={player.name}
                    color={player.color}
                    size="sm"
                    isHost={player.isHost}
                    isOnline={player.isOnline}
                    showStatus={true}
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white">
                        {player.name}
                      </span>
                      {isMe && (
                        <span className="rounded bg-violet-500/20 px-1 text-[9px] font-bold text-violet-300">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {player.wins || 0} {(player.wins === 1 ? 'game won' : 'games won')}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-sm font-bold text-amber-400">
                    {player.totalScore.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider">PTS</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
