import React, { useState } from 'react';
import { Target, ArrowUp, ArrowDown, CheckCircle2, ArrowRight, Sparkles, Flame } from 'lucide-react';
import { NumberGuessRoundData, ClientPartyView } from '../../types.js';
import { socketService } from '../../services/socket.js';
import { soundService } from '../../services/sound.js';

interface NumberGuessProps {
  party: ClientPartyView;
}

export const NumberGuess: React.FC<NumberGuessProps> = ({ party }) => {
  const state = party.gameState as NumberGuessRoundData;
  const isReveal = party.gameStatus === 'round_reveal';
  const myPlayerId = party.myPlayerId;
  const isHost = party.isHost;

  const [guessInput, setGuessInput] = useState('');

  if (!state) return null;

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(guessInput, 10);
    if (isNaN(val) || val < state.min || val > state.max) return;

    socketService.sendGameAction('submit_guess', { guess: val });
    soundService.playClick();
    setGuessInput('');
  };

  const handleNextRound = () => {
    socketService.nextRound();
    soundService.playClick();
  };

  const latestGuess = state.guesses[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Range & Temperature Banner */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-zinc-950 to-zinc-950 p-6 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
          <Target className="h-4 w-4" />
          <span>Guess the Secret Number</span>
        </div>

        <div className="my-3 flex items-center justify-center gap-4">
          <div className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-mono text-zinc-400 border border-zinc-800">
            Min: <span className="text-white font-bold text-lg">{state.currentRange[0]}</span>
          </div>

          <span className="text-zinc-600 font-bold">——</span>

          <div className="rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-mono text-zinc-400 border border-zinc-800">
            Max: <span className="text-white font-bold text-lg">{state.currentRange[1]}</span>
          </div>
        </div>

        {/* Latest Live Signal */}
        {latestGuess && !isReveal && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-5 py-2 text-sm font-bold border border-zinc-800 shadow-md animate-pulse">
            <span style={{ color: latestGuess.playerColor }}>{latestGuess.playerName}</span>
            <span>guessed</span>
            <span className="font-mono text-amber-300">{latestGuess.guess}</span>
            <span>→</span>
            {latestGuess.result === 'HIGHER' && (
              <span className="text-blue-400 flex items-center gap-1">
                <ArrowUp className="h-4 w-4 stroke-[3]" /> HIGHER!
              </span>
            )}
            {latestGuess.result === 'LOWER' && (
              <span className="text-rose-400 flex items-center gap-1">
                <ArrowDown className="h-4 w-4 stroke-[3]" /> LOWER!
              </span>
            )}
            {latestGuess.result === 'CORRECT' && (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> CORRECT! 🎉
              </span>
            )}
          </div>
        )}
      </div>

      {/* Playing Phase: Guess Input Form */}
      {!isReveal ? (
        <div className="space-y-5">
          <form onSubmit={handleGuessSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="number"
              min={state.min}
              max={state.max}
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder={`Enter a number between ${state.currentRange[0]} and ${state.currentRange[1]}...`}
              className="flex-1 rounded-2xl bg-zinc-950 px-4 py-3 text-base text-white placeholder-zinc-600 border border-zinc-800 focus:border-amber-500 focus:outline-none font-mono text-center"
            />
            <button
              type="submit"
              disabled={!guessInput}
              className="rounded-2xl bg-amber-500 px-6 py-3 text-xs font-bold text-zinc-950 hover:bg-amber-400 disabled:opacity-40 transition cursor-pointer shadow-md shadow-amber-500/20"
            >
              Guess
            </button>
          </form>

          {/* Real-time Guess Feed */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Live Guess Feed</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {state.guesses.length === 0 ? (
                <div className="text-center text-xs text-zinc-600 py-3">No guesses yet. Be the first to try!</div>
              ) : (
                state.guesses.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between rounded-xl bg-zinc-950 px-3.5 py-2 border border-zinc-800/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold" style={{ color: g.playerColor }}>{g.playerName}</span>
                      <span className="text-zinc-500 font-mono">guessed</span>
                      <span className="font-bold text-white font-mono">{g.guess}</span>
                    </div>

                    <div>
                      {g.result === 'HIGHER' && (
                        <span className="text-blue-400 font-bold flex items-center gap-0.5">
                          <ArrowUp className="h-3 w-3" /> HIGHER
                        </span>
                      )}
                      {g.result === 'LOWER' && (
                        <span className="text-rose-400 font-bold flex items-center gap-0.5">
                          <ArrowDown className="h-3 w-3" /> LOWER
                        </span>
                      )}
                      {g.result === 'CORRECT' && (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3" /> BINGO!
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Reveal Phase */
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h4 className="text-base font-black text-white">Round {party.currentRound} Results</h4>
              <p className="text-xs text-zinc-400">
                Target Number was: <strong className="text-amber-400 font-mono text-sm">{state.targetNumber}</strong>
              </p>
            </div>

            {isHost && (
              <button
                onClick={handleNextRound}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition cursor-pointer shadow-md"
              >
                <span>{party.currentRound < party.totalRounds ? 'NEXT ROUND' : 'SEE FINAL RESULTS'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(party.players).map((pid) => {
              const p = party.players[pid];
              const points = state.roundWinnerPoints?.[pid] || 0;
              const isWinner = pid === state.winnerPlayerId;

              return (
                <div
                  key={pid}
                  className={`flex items-center justify-between rounded-2xl p-4 border ${
                    isWinner ? 'bg-amber-950/30 border-amber-500/50 shadow-md' : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{p.avatar}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        {isWinner && (
                          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                            CRACKED CODE 🎉
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-xs font-bold text-emerald-400">
                    +{points} pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
