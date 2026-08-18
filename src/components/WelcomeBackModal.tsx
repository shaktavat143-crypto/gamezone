import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { soundService } from '../services/sound.js';

interface WelcomeBackModalProps {
  playerName: string;
  reconnectData: {
    gameName: string;
    round: number;
    totalRounds: number;
  } | null;
  onDismiss: () => void;
}

export const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({
  playerName,
  reconnectData,
  onDismiss
}) => {
  if (!reconnectData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-sm rounded-3xl border border-violet-500/40 bg-zinc-950 p-6 text-center shadow-2xl shadow-violet-500/10">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 text-2xl shadow-lg shadow-violet-500/20">
          👋
        </div>

        <h2 className="text-lg font-black tracking-tight text-white">
          WELCOME BACK, {playerName.toUpperCase()}
        </h2>

        <div className="my-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs text-zinc-400 mb-1">You were reconnected to:</p>
          <p className="text-sm font-bold text-violet-300 mb-1">{reconnectData.gameName}</p>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-950/60 px-3 py-1 text-xs font-semibold text-violet-300 border border-violet-800/40">
            Round {reconnectData.round} / {reconnectData.totalRounds}
          </div>
        </div>

        <button
          onClick={() => {
            soundService.playClick();
            onDismiss();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition cursor-pointer"
        >
          <span>REJOIN GAME</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
