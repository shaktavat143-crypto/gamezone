import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Check, Dices } from 'lucide-react';
import { DEFAULT_AVATARS, generateAvatarFromUsername } from '../utils/avatar.js';
import { socketService } from '../services/socket.js';
import { soundService } from '../services/sound.js';
import { PlayerAvatar } from './PlayerAvatar.js';

interface AvatarSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar: string;
  playerName: string;
  playerColor?: string;
  onAvatarChanged?: (newAvatar: string) => void;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  playerName,
  playerColor = '#8B5CF6',
  onAvatarChanged
}) => {
  const [selected, setSelected] = useState(currentAvatar || '🎮');

  if (!isOpen) return null;

  const handleSelect = (av: string) => {
    setSelected(av);
    soundService.playClick();
  };

  const handleGenerateFromName = () => {
    const gen = generateAvatarFromUsername(playerName);
    setSelected(gen);
    soundService.playClick();
  };

  const handleRandomize = () => {
    const randomIndex = Math.floor(Math.random() * DEFAULT_AVATARS.length);
    setSelected(DEFAULT_AVATARS[randomIndex]);
    soundService.playClick();
  };

  const handleSave = () => {
    socketService.updateAvatar(selected);
    if (onAvatarChanged) {
      onAvatarChanged(selected);
    }
    soundService.playWinner();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-violet-500/40 bg-zinc-950 p-6 sm:p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-900 hover:text-white transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <PlayerAvatar
            avatar={selected}
            name={playerName}
            color={playerColor}
            size="lg"
          />
          <div>
            <h3 className="text-lg font-black text-white">Customize Avatar</h3>
            <p className="text-xs text-zinc-400">Choose your party icon or generate one</p>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={handleGenerateFromName}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:border-violet-500/40 transition cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span>Generate for &quot;{playerName}&quot;</span>
          </button>
          <button
            type="button"
            onClick={handleRandomize}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:border-violet-500/40 transition cursor-pointer"
            title="Random Avatar"
          >
            <Dices className="h-4 w-4 text-pink-400" />
            <span>Random</span>
          </button>
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-6 gap-2.5 max-h-56 overflow-y-auto p-1 pr-2 scrollbar-none">
          {DEFAULT_AVATARS.map((av) => {
            const isChosen = selected === av;
            return (
              <button
                key={av}
                type="button"
                onClick={() => handleSelect(av)}
                className={`relative flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition cursor-pointer ${
                  isChosen
                    ? 'bg-violet-600/30 border-2 border-violet-500 scale-105 shadow-md shadow-violet-500/30'
                    : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:scale-105'
                }`}
              >
                <span>{av}</span>
                {isChosen && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-white text-[9px] shadow-sm">
                    <Check className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition cursor-pointer"
          >
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
};
