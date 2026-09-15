import React, { useEffect, useState } from 'react';
import { Clock, Trophy, X, RotateCcw, Play } from 'lucide-react';
import { ClientPartyView, GameType, Player } from '../types.js';
import { soundService } from '../services/sound.js';
import { socketService } from '../services/socket.js';
import { ConfirmModal } from './ConfirmModal.js';
import { WordBattle } from './games/WordBattle.js';
import { SecretBattle } from './games/SecretBattle.js';
import { MostLikelyTo } from './games/MostLikelyTo.js';
import { MemoryBattle } from './games/MemoryBattle.js';
import { SolahChits } from './games/SolahChits.js';
import { WhoSaidIt } from './games/WhoSaidIt.js';
import { Wordle } from './games/Wordle.js';
import { Sudoku } from './games/Sudoku.js';

interface GameContainerProps {
  party: ClientPartyView;
}

export const GameContainer: React.FC<GameContainerProps> = ({ party }) => {
  const { currentGame, currentRound, totalRounds, roundTimeRemaining, isHost, gameSettings } = party;
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Sound effects on timer countdown (Wordle and untimed Sudoku have no countdown alarm)
  useEffect(() => {
    const isUntimed = currentGame === 'wordle' || (currentGame === 'sudoku' && roundTimeRemaining === 0);
    if (!isUntimed && roundTimeRemaining > 0 && roundTimeRemaining <= 5 && party.gameStatus === 'in_game') {
      soundService.playTick();
    }
  }, [roundTimeRemaining, party.gameStatus, currentGame]);

  const getGameHeader = (type: GameType | null) => {
    switch (type) {
      case 'word_battle':
        return { title: 'Word Battle', icon: '🔤', color: '#EC4899' };
      case 'secret_battle':
        return { title: 'Secret Battle', icon: '🕵️', color: '#8B5CF6' };
      case 'most_likely_to':
        return { title: 'Most Likely To', icon: '🗳️', color: '#3B82F6' };
      case 'memory_battle':
        return { title: 'Memory Battle', icon: '🧠', color: '#10B981' };
      case 'solah_chits':
        return { title: 'Solah Chits', icon: '🃏', color: '#F59E0B' };
      case 'who_said_it':
        return { title: 'Who Said It?', icon: '🎭', color: '#06B6D4' };
      case 'wordle':
        return { title: 'Wordle', icon: '🟩', color: '#22C55E' };
      case 'sudoku':
        return { title: 'Sudoku Battle', icon: '🔢', color: '#0EA5E9' };
      default:
        return { title: 'Game', icon: '🎮', color: '#8B5CF6' };
    }
  };

  const header = getGameHeader(currentGame);

  // Leader in current game
  const playerList: Player[] = Object.values(party.players || {});
  const currentLeader = playerList.sort((a, b) => b.gameScore - a.gameScore)[0];

  const handleGameAction = (action: string, data?: any) => {
    socketService.sendGameAction(action, data);
  };

  const renderGameContent = () => {
    switch (currentGame) {
      case 'word_battle':
        return <WordBattle party={party} />;
      case 'secret_battle':
        return <SecretBattle party={party} />;
      case 'most_likely_to':
        return <MostLikelyTo party={party} />;
      case 'memory_battle':
        return <MemoryBattle party={party} />;
      case 'solah_chits':
        return <SolahChits party={party} onAction={handleGameAction} isHost={isHost} />;
      case 'who_said_it':
        return <WhoSaidIt party={party} />;
      case 'wordle':
        return <Wordle party={party} />;
      case 'sudoku':
        return <Sudoku party={party} />;
      default:
        return <div>Unknown game selected.</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Game Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 sm:px-6 sm:py-3.5 backdrop-blur-md">
        {/* Game Icon & Round */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-xl shadow-inner"
            style={{
              backgroundColor: `${header.color}20`,
              border: `1px solid ${header.color}50`
            }}
          >
            <span>{header.icon}</span>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-black text-white">{header.title}</h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
              <span>Round {currentRound} of {totalRounds}</span>
            </div>
          </div>
        </div>

        {/* Timer Bar & Leader Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Timer Pill / Untimed Wordle or Sudoku Badge */}
          {party.gameStatus === 'in_game' && (
            (currentGame === 'wordle' || (currentGame === 'sudoku' && roundTimeRemaining === 0)) ? (
              <div
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-xl px-3 sm:px-3.5 font-sans text-xs font-bold bg-sky-950/40 text-sky-300 border border-sky-500/30 shadow-sm"
                title="Untimed puzzle — solve at your own pace!"
              >
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                <span>Untimed</span>
              </div>
            ) : (
              <div
                className={`flex h-11 min-h-[44px] items-center gap-1.5 rounded-xl px-3 sm:px-3.5 font-mono text-xs font-bold border ${
                  roundTimeRemaining <= 5
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse'
                    : 'bg-zinc-950 text-white border-zinc-800'
                }`}
              >
                <Clock className="h-4 w-4 text-zinc-400" />
                <span>{roundTimeRemaining}s</span>
              </div>
            )
          )}

          {/* Current Leader */}
          {currentLeader && (
            <div className="hidden sm:flex h-11 min-h-[44px] items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 text-xs text-amber-300">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span className="font-semibold">{currentLeader.name}</span>
              <span className="font-mono text-[11px] text-amber-400">({currentLeader.gameScore} pts)</span>
            </div>
          )}

          {/* Cancel/Return to Lobby Button */}
          <button
            id="cancel-game-btn"
            onClick={() => {
              soundService.playClick();
              setShowCancelModal(true);
            }}
            className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-700/50 text-zinc-400 hover:text-rose-300 px-3 transition cursor-pointer"
            title="Cancel Game"
            aria-label="Cancel Game"
          >
            <X className="h-4 w-4 text-zinc-400 group-hover:text-rose-400" />
            <span className="text-xs font-bold hidden sm:inline">Cancel Game</span>
          </button>
        </div>
      </div>

      {/* Main Game Surface */}
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-6 md:p-8 backdrop-blur-md shadow-2xl overflow-x-hidden">
        {renderGameContent()}
      </div>

      {/* In-App Cancel Game Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Game?"
        description="Are you sure you want to cancel the active match? All players will be returned to the party lobby."
        confirmText="Return to Lobby"
        cancelText="Resume Match"
        variant="danger"
        icon={<X className="h-6 w-6" />}
        onConfirm={() => {
          soundService.playClick();
          setShowCancelModal(false);
          socketService.returnToLobby();
        }}
        onClose={() => setShowCancelModal(false)}
      />
    </div>
  );
};
