import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, LayoutGrid, ArrowRight, Crown } from 'lucide-react';
import { GameResultItem, GameType } from '../types.js';
import { socketService } from '../services/socket.js';
import { soundService } from '../services/sound.js';

interface GameResultsModalProps {
  gameResults: GameResultItem[] | null;
  currentGame: GameType | null;
  isHost: boolean;
  myPlayerId: string;
  onChooseAnotherGame?: () => void;
}

export const GameResultsModal: React.FC<GameResultsModalProps> = ({
  gameResults,
  currentGame,
  isHost,
  myPlayerId,
  onChooseAnotherGame
}) => {
  if (!gameResults || gameResults.length === 0) return null;

  useEffect(() => {
    // Fire festive confetti burst
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      soundService.playWinner();
    } catch {}
  }, []);

  const handlePlayAgain = () => {
    socketService.restartGame();
    soundService.playGameStart();
  };

  const handleReturnLobby = () => {
    socketService.returnToLobby();
    soundService.playClick();
  };

  const getGameTitle = (t: GameType | null) => {
    const titles: Record<GameType, string> = {
      word_battle: 'Word Battle',
      secret_battle: 'Secret Battle',
      most_likely_to: 'Most Likely To',
      memory_battle: 'Memory Battle',
      solah_chits: 'Solah Chits',
      who_said_it: 'Who Said It?'
    };
    return t ? titles[t] || 'Game' : 'Game';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-violet-500/40 bg-zinc-950 p-6 sm:p-8 text-center shadow-2xl shadow-violet-500/20 max-h-[90vh] overflow-y-auto">
        {/* Podium Icon */}
        <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-zinc-950 text-3xl shadow-lg shadow-amber-500/30">
          🏆
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
          Game Results
        </h2>
        <p className="text-xs font-semibold text-violet-400 mt-0.5">
          {getGameTitle(currentGame)} Finished!
        </p>

        {/* Player Rankings List */}
        <div className="my-6 space-y-2.5 text-left">
          {gameResults.map((res, index) => {
            const isMe = res.playerId === myPlayerId;
            const medals = ['🥇', '🥈', '🥉'];

            return (
              <div
                key={res.playerId}
                className={`flex items-center justify-between rounded-2xl p-3.5 border transition ${
                  index === 0
                    ? 'bg-amber-950/30 border-amber-500/40 shadow-sm'
                    : isMe
                    ? 'bg-violet-950/30 border-violet-500/40'
                    : 'bg-zinc-900/60 border-zinc-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex w-7 justify-center text-lg">
                    {index < 3 ? medals[index] : <span className="font-mono text-xs font-bold text-zinc-500">{index + 1}.</span>}
                  </div>

                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold shadow-inner"
                    style={{
                      backgroundColor: `${res.playerColor}20`,
                      border: `1px solid ${res.playerColor}50`
                    }}
                  >
                    {res.playerAvatar || '🎮'}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate max-w-[130px]">
                        {res.playerName}
                      </span>
                      {index === 0 && <Crown className="h-3 w-3 text-amber-400" />}
                      {isMe && (
                        <span className="rounded bg-violet-500/20 px-1 py-0.5 text-[9px] font-bold text-violet-300">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      Total: {res.newTotalScore.toLocaleString()} pts
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-sm font-black text-emerald-400">
                    +{res.score.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-wider">PTS THIS GAME</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        {isHost ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={handlePlayAgain}
              className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-violet-600/30 hover:bg-violet-500 transition cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>PLAY AGAIN</span>
            </button>

            <button
              onClick={handleReturnLobby}
              className="flex items-center justify-center gap-2 rounded-xl bg-zinc-800 px-4 py-3 text-xs font-bold text-zinc-200 hover:bg-zinc-700 hover:text-white transition cursor-pointer"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>BACK TO LOBBY</span>
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-zinc-900/60 p-3 text-xs text-zinc-400 border border-zinc-800/80">
            Waiting for Host to choose next action...
          </div>
        )}
      </div>
    </div>
  );
};
