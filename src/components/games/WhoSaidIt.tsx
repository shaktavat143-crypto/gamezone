import React, { useState } from 'react';
import { HelpCircle, Send, CheckCircle2, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { WhoSaidItRoundData, ClientPartyView, Player } from '../../types.js';
import { socketService } from '../../services/socket.js';
import { soundService } from '../../services/sound.js';

interface WhoSaidItProps {
  party: ClientPartyView;
}

export const WhoSaidIt: React.FC<WhoSaidItProps> = ({ party }) => {
  const state = party.gameState as WhoSaidItRoundData;
  const isReveal = party.gameStatus === 'round_reveal';
  const myPlayerId = party.myPlayerId;
  const isHost = party.isHost;

  const [myAnswerInput, setMyAnswerInput] = useState('');
  const [guessMap, setGuessMap] = useState<Record<string, string>>({}); // answerId -> guessedPlayerId

  if (!state) return null;

  const mySubmission = state.submissions?.[myPlayerId];

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myAnswerInput.trim()) return;
    socketService.sendGameAction('submit_answer', { answer: myAnswerInput.trim() });
    soundService.playClick();
  };

  const handleGuessChange = (answerId: string, guessedPid: string) => {
    const next = { ...guessMap, [answerId]: guessedPid };
    setGuessMap(next);
    socketService.sendGameAction('submit_guesses', { guesses: next });
    soundService.playClick();
  };

  const handleNextRound = () => {
    socketService.nextRound();
    soundService.playClick();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Prompt Banner */}
      <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/40 via-zinc-950 to-zinc-950 p-6 sm:p-8 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
          <Sparkles className="h-4 w-4" />
          <span>Category: {state.category}</span>
        </div>

        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
          &quot;{state.promptText}&quot;
        </h3>

        <p className="mt-3 text-xs text-zinc-400">
          {state.phase === 'writing'
            ? 'Write your anonymous secret answer! Try to make it funny, unique, or believable.'
            : state.phase === 'guessing'
            ? 'Answers have been shuffled! Guess which friend wrote each response.'
            : 'Dramatic reveal! See who wrote what and who guessed right.'}
        </p>
      </div>

      {/* PHASE 1: WRITING PHASE */}
      {state.phase === 'writing' && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
          <h4 className="text-sm font-bold text-white">Your Secret Answer</h4>
          {mySubmission ? (
            <div className="flex items-center gap-2 rounded-xl bg-cyan-950/40 p-3.5 text-xs text-cyan-300 border border-cyan-800/40">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
              <span>You submitted: &quot;<strong>{mySubmission}</strong>&quot;. Waiting for other players...</span>
            </div>
          ) : (
            <form onSubmit={handleAnswerSubmit} className="space-y-3">
              <textarea
                value={myAnswerInput}
                onChange={(e) => setMyAnswerInput(e.target.value)}
                placeholder="Write your secret answer here..."
                maxLength={200}
                rows={3}
                className="w-full rounded-xl bg-zinc-950 p-3.5 text-xs text-white placeholder-zinc-600 border border-zinc-800 focus:border-cyan-500 focus:outline-none resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!myAnswerInput.trim()}
                  className="rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 disabled:opacity-40 transition cursor-pointer"
                >
                  Submit Answer
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* PHASE 2: GUESSING PHASE */}
      {state.phase === 'guessing' && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Match Each Answer to its Author:
          </div>

          <div className="space-y-3">
            {state.anonymizedAnswers.map((item, idx) => {
              const currentGuess = guessMap[item.id] || '';

              return (
                <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="rounded-lg bg-cyan-950/80 px-2 py-1 text-xs font-mono font-bold text-cyan-300 border border-cyan-800/60">
                      #{idx + 1}
                    </span>
                    <p className="text-sm font-semibold text-white leading-relaxed">
                      &quot;{item.text}&quot;
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800/80">
                    <span className="text-xs text-zinc-400 mr-1">Who wrote this?</span>
                    {(Object.values(party.players) as Player[]).map((p) => {
                      const isSelected = currentGuess === p.id;

                      return (
                        <button
                          key={p.id}
                          onClick={() => handleGuessChange(item.id, p.id)}
                          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          <span>{p.avatar}</span>
                          <span>{p.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PHASE 3: REVEAL PHASE */}
      {isReveal && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h4 className="text-base font-black text-white">Round {party.currentRound} Reveal</h4>
              <p className="text-xs text-zinc-400">+100 for correct guesses, +50 for fooling others</p>
            </div>

            {isHost && (
              <button
                onClick={handleNextRound}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition cursor-pointer shadow-md"
              >
                <span>{party.currentRound < party.totalRounds ? 'NEXT PROMPT' : 'SEE FINAL RESULTS'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(party.players).map((pid) => {
              const p = party.players[pid];
              const score = state.roundScores?.[pid];
              const isMe = pid === myPlayerId;

              return (
                <div
                  key={pid}
                  className={`rounded-2xl border p-4 ${
                    isMe ? 'bg-cyan-950/20 border-cyan-500/40' : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{p.avatar}</span>
                      <span className="text-xs font-bold text-white">{p.name}</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-cyan-400">
                      +{score?.points || 0} pts
                    </div>
                  </div>

                  <div className="text-[11px] text-zinc-400 space-y-0.5">
                    <div>✓ {score?.correctGuesses || 0} correct guesses</div>
                    <div>🎭 Fooled {score?.fooledOthers || 0} players</div>
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
