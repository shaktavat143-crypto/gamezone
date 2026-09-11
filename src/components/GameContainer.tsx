import React, { useEffect } from 'react';
import { Clock, Trophy, X, RotateCcw, Play } from 'lucide-react';
import { ClientPartyView, GameType, Player } from '../types.js';
import { soundService } from '../services/sound.js';
import { socketService } from '../services/socket.js';
import { WordBattle } from './games/WordBattle.js';
import { SecretBattle } from './games/SecretBattle.js';
import { MostLikelyTo } from './games/MostLikelyTo.js';
import { MemoryBattle } from './games/MemoryBattle.js';
import { SolahChits } from './games/SolahChits.js';
import { WhoSaidIt } from './games/WhoSaidIt.js';
import { Wordle } from './games/Wordle.js';

interface GameContainerProps {
  party: ClientPartyView;
}

export const GameContainer: React.FC<GameContainerProps> = ({ party }) => {
  const { currentGame, currentRound, totalRounds, roundTimeRemaining, isHost, gameSettings } = party;

  // Sound effects on timer countdown (Wordle is untimed)
  useEffect(() => {
    if (currentGame !== 'wordle' && roundTimeRemaining > 0 && roundTimeRemaining <= 5 && party.gameStatus === 'in_game') {
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
          {/* Live Timer Pill / Untimed Wordle Badge */}
          {party.gameStatus === 'in_game' && (
            currentGame === 'wordle' ? (
              <div
                className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-xl px-3 sm:px-3.5 font-sans text-xs font-bold bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 shadow-sm"
                title="Wordle is untimed — solve at your own pace!"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
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

          {/* Host Cancel/End Game */}
          {isHost && (
            <button
              onClick={() => {
                if (confirm('Cancel active game and return all players to the lobby?')) {
                  socketService.returnToLobby();
                }
              }}
              className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-zinc-800 text-zinc-400 hover:bg-rose-950 hover:text-rose-400 transition cursor-pointer"
              title="Cancel Game"
              aria-label="Cancel Game"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Game Surface */}
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 sm:p-6 md:p-8 backdrop-blur-md shadow-2xl overflow-x-hidden">
        {renderGameContent()}
      </div>
    </div>
  );
};
