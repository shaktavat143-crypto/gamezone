import React from 'react';
import { Crown, Wifi, WifiOff, UserX, Trophy, Sparkles, Smile } from 'lucide-react';
import { Player } from '../types.js';
import { socketService } from '../services/socket.js';
import { soundService } from '../services/sound.js';
import { PlayerAvatar } from './PlayerAvatar.js';

interface PlayerListProps {
  players: Record<string, Player>;
  hostId: string;
  myPlayerId: string;
  isHost: boolean;
  onOpenAvatarModal?: () => void;
}

export const PlayerList: React.FC<PlayerListProps> = ({
  players,
  hostId,
  myPlayerId,
  isHost,
  onOpenAvatarModal
}) => {
  const playerArray = (Object.values(players) as Player[]).sort((a, b) => {
    // Host first, then online players, then score
    if (a.id === hostId) return -1;
    if (b.id === hostId) return 1;
    if (a.isOnline && !b.isOnline) return -1;
    if (!a.isOnline && b.isOnline) return 1;
    return b.totalScore - a.totalScore;
  });

  const handleKick = (playerId: string, _name: string) => {
    socketService.kickPlayer(playerId);
    soundService.playClick();
  };

  return (
    <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-4 sm:p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
          <h2 className="text-sm font-bold text-zinc-200">
            Players in Lobby ({playerArray.filter(p => p.isOnline).length}/{playerArray.length})
          </h2>
        </div>

        {onOpenAvatarModal && (
          <button
            type="button"
            onClick={onOpenAvatarModal}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 px-3 py-1.5 text-xs font-semibold text-violet-300 hover:bg-violet-600/30 hover:text-white transition cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            <span>Customize Avatar</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {playerArray.map((player) => {
          const isCurrentPlayerHost = player.id === hostId;
          const isMe = player.id === myPlayerId;

          return (
            <div
              key={player.id}
              className={`relative flex items-center justify-between rounded-2xl p-3 border transition-all ${
                isMe
                  ? 'bg-violet-950/30 border-violet-500/50 ring-1 ring-violet-500/30 shadow-md shadow-violet-950/30'
                  : 'bg-zinc-900/80 border-zinc-800/80 hover:border-zinc-700/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar with click to edit if it's me */}
                <div
                  className={`relative ${isMe && onOpenAvatarModal ? 'cursor-pointer group' : ''}`}
                  onClick={isMe && onOpenAvatarModal ? onOpenAvatarModal : undefined}
                  title={isMe ? 'Click to change your avatar' : player.name}
                >
                  <PlayerAvatar
                    avatar={player.avatar}
                    name={player.name}
                    color={player.color}
                    size="md"
                    isHost={isCurrentPlayerHost}
                    isOnline={player.isOnline}
                    showStatus={true}
                  />
                  {isMe && onOpenAvatarModal && (
                    <div className="absolute -bottom-1 -right-1 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[9px] text-white">
                      ✎
                    </div>
                  )}
                </div>

                {/* Name & Badges */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white truncate max-w-[120px]">
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="rounded-full bg-violet-500/20 px-2 py-0.2 text-[9px] font-black text-violet-300 border border-violet-500/30">
                        YOU
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 mt-0.5">
                    {/* Status */}
                    <div className="flex items-center gap-1">
                      {player.isOnline ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                          Online
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-rose-400">
                          Offline
                        </span>
                      )}
                    </div>

                    {/* Total Score */}
                    <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-0.5">
                      <Trophy className="h-2.5 w-2.5 text-amber-400/80" />
                      {player.totalScore} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons: Change avatar for me, or host kick action */}
              <div className="flex items-center gap-1">
                {isMe && onOpenAvatarModal && (
                  <button
                    type="button"
                    onClick={onOpenAvatarModal}
                    className="rounded-lg bg-zinc-800/80 px-2 py-1 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition cursor-pointer"
                  >
                    Avatar
                  </button>
                )}

                {isHost && !isMe && (
                  <button
                    onClick={() => handleKick(player.id, player.name)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 hover:bg-rose-950/40 hover:text-rose-400 transition cursor-pointer"
                    title={`Remove ${player.name}`}
                  >
                    <UserX className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
