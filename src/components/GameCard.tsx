import React from 'react';
import { Users, Clock, Check, Sparkles } from 'lucide-react';
import { GameMetadata } from '../types.js';
import { soundService } from '../services/sound.js';

interface GameCardProps {
  game: GameMetadata;
  isSelected: boolean;
  isHost: boolean;
  onSelect: () => void;
  playerCount: number;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isSelected,
  isHost,
  onSelect,
  playerCount
}) => {
  const isPlayerCountWarning = playerCount < game.minPlayers;

  const handleClick = () => {
    if (isHost) {
      soundService.playClick();
      onSelect();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
        isSelected
          ? 'bg-zinc-900/90 border-violet-500 shadow-lg shadow-violet-500/10 ring-2 ring-violet-500/30'
          : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/90 hover:bg-zinc-900/60'
      } ${isHost ? 'cursor-pointer hover:scale-[1.01]' : 'cursor-default'}`}
    >
      {/* Top row: Icon & Time badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-inner transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${game.accentColor}15`,
              border: `1px solid ${game.accentColor}40`
            }}
          >
            <span>{game.icon}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-lg bg-zinc-800/80 px-2 py-1 text-[11px] font-medium text-zinc-300">
              <Clock className="h-3 w-3 text-zinc-400" />
              {game.estimatedTime}
            </span>
            {isSelected && (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
            )}
          </div>
        </div>

        {/* Title & Tagline */}
        <h3 className="text-base font-bold text-white tracking-tight group-hover:text-violet-300 transition-colors">
          {game.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
          {game.tagline}
        </p>
      </div>

      {/* Bottom row: Player constraint & Select CTA */}
      <div className="mt-4 pt-3.5 border-t border-zinc-800/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Users className="h-3.5 w-3.5 text-zinc-500" />
          <span className={isPlayerCountWarning ? 'text-amber-400 font-medium' : ''}>
            {game.minPlayers}–{game.maxPlayers} players
          </span>
        </div>

        {isHost ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              isSelected
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
            }`}
          >
            {isSelected ? 'SELECTED' : 'SELECT'}
          </button>
        ) : (
          <span className="text-[11px] font-medium text-zinc-500">
            {isSelected ? '👑 Host Selected' : ''}
          </span>
        )}
      </div>
    </div>
  );
};
