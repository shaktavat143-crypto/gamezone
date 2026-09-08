import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { WordBattleRoundData, ClientPartyView } from '../../types.js';
import { socketService } from '../../services/socket.js';
import { soundService } from '../../services/sound.js';

interface WordBattleProps {
  party: ClientPartyView;
}

export const WordBattle: React.FC<WordBattleProps> = ({ party }) => {
  const state = party.gameState as WordBattleRoundData;
  const isReveal = party.gameStatus === 'round_reveal';
  const myPlayerId = party.myPlayerId;
  const isHost = party.isHost;

  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset inputs when round letter changes
  useEffect(() => {
    setInputs({});
    setHasSubmitted(false);
  }, [state?.letter, party.currentRound]);

  if (!state) return null;

  const handleInputChange = (category: string, value: string) => {
    const next = { ...inputs, [category]: value };
    setInputs(next);
    // Auto-sync answer to server on change
    socketService.sendGameAction('submit_words', { words: next });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    socketService.sendGameAction('submit_words', { words: inputs });
    soundService.playClick();
    setHasSubmitted(true);
  };

  const handleNextRound = () => {
    socketService.nextRound();
    soundService.playClick();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Starting Letter Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-950/40 via-zinc-950 to-zinc-950 p-6 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-pink-400 mb-2">
          <Sparkles className="h-4 w-4" />
          <span>Starting Letter for this Round</span>
        </div>

        <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-pink-500/20 border-2 border-pink-500 text-5xl font-black text-pink-300 shadow-lg shadow-pink-500/30">
          {state.letter}
        </div>

        <p className="mt-3 text-xs text-zinc-400">
          Enter a valid word starting with &quot;<span className="text-pink-300 font-bold">{state.letter}</span>&quot; for each category.
          Unique words score <span className="text-emerald-400 font-bold">+10 pts</span>, shared words score <span className="text-amber-400 font-bold">+5 pts</span>!
        </p>
      </div>

      {/* Playing Phase: Input Form */}
      {!isReveal ? (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {state.categories.map((category, index) => {
              const currentVal = inputs[category] || '';
              const startsWithLetter = currentVal.trim().toUpperCase().startsWith(state.letter.toUpperCase());

              return (
                <div
                  key={category}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all focus-within:border-pink-500/50"
                >
                  <label className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-2">
                    <span>{category}</span>
                    {currentVal && (
                      <span className={`text-[10px] font-mono font-semibold ${startsWithLetter ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {startsWithLetter ? '✓ Starts with ' + state.letter : 'Must start with ' + state.letter}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={currentVal}
                    onChange={(e) => handleInputChange(category, e.target.value)}
                    placeholder={`e.g. ${state.letter}...`}
                    className="w-full rounded-xl bg-zinc-950 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 border border-zinc-800 focus:border-pink-500 focus:outline-none transition"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-zinc-400">
              {hasSubmitted ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Answers saved & synced
                </span>
              ) : (
                'Answers auto-sync in real time.'
              )}
            </div>

            <button
              type="submit"
              className="rounded-xl bg-pink-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-pink-500 transition cursor-pointer shadow-md shadow-pink-600/30"
            >
              Confirm Answers
            </button>
          </div>
        </form>
      ) : (
        /* Reveal Phase: Show all submissions and awarded points */
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h4 className="text-base font-black text-white">Round {party.currentRound} Results</h4>
              <p className="text-xs text-zinc-400">Scored based on valid words & uniqueness</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(party.players).map((pid) => {
              const player = party.players[pid];
              const playerRes = state.validatedResults?.[pid];
              const isMe = pid === myPlayerId;

              return (
                <div
                  key={pid}
                  className={`rounded-2xl border p-4 ${
                    isMe
                      ? 'bg-violet-950/20 border-violet-500/40 ring-1 ring-violet-500/20'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{player.avatar}</span>
                      <span className="text-xs font-bold text-white">{player.name}</span>
                      {isMe && (
                        <span className="rounded bg-violet-500/20 px-1 text-[9px] font-bold text-violet-300">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs font-bold text-pink-400">
                      +{playerRes?.totalRoundScore || 0} pts
                    </div>
                  </div>

                  <div className="space-y-2">
                    {state.categories.map((cat) => {
                      const item = playerRes?.words?.[cat];
                      return (
                        <div key={cat} className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400">{cat}:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{item?.word || '—'}</span>
                            {item?.valid ? (
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                  item.unique
                                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                                    : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                }`}
                              >
                                {item.unique ? '+10 Unique' : '+5 Shared'}
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {item?.reason && (
                                  <span
                                    title={item.details || ''}
                                    className="rounded bg-rose-950/70 text-rose-300 border border-rose-800/50 px-1.5 py-0.5 text-[8px] font-semibold tracking-wide uppercase"
                                  >
                                    {item.reason === 'WRONG_STARTING_LETTER'
                                      ? 'Wrong Letter'
                                      : item.reason === 'CATEGORY_MISMATCH'
                                      ? 'Wrong Category'
                                      : item.reason === 'NOT_IN_CATEGORY'
                                      ? 'Not In Category'
                                      : 'Invalid Word'}
                                  </span>
                                )}
                                <span className="rounded bg-zinc-800/90 text-zinc-500 border border-zinc-700/40 px-1.5 py-0.5 text-[9px] font-medium">
                                  0 pts
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
