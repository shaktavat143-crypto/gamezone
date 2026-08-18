import React, { useState, useEffect, useRef } from 'react';
import { Brain, Sparkles, CheckCircle2, XCircle, ArrowRight, Zap, Play, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { MemoryBattleRoundData, ClientPartyView } from '../../types.js';
import { socketService } from '../../services/socket.js';
import { soundService } from '../../services/sound.js';

interface MemoryBattleProps {
  party: ClientPartyView;
}

export const MemoryBattle: React.FC<MemoryBattleProps> = ({ party }) => {
  const state = party.gameState as MemoryBattleRoundData;
  const isReveal = party.gameStatus === 'round_reveal' || state?.phase === 'reveal';
  const myPlayerId = party.myPlayerId;
  const isHost = party.isHost;

  const [sequenceInput, setSequenceInput] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const answerStartTimeRef = useRef<number>(Date.now());

  const challenge = state?.challenge;
  const isReady = Boolean(state?.readyPlayers?.[myPlayerId]);

  // Reset answer states on new challenge or round
  useEffect(() => {
    setSequenceInput([]);
    setSelectedOption(null);
    setHasSubmitted(false);
    if (state?.phase === 'answer') {
      answerStartTimeRef.current = Date.now();
    }
  }, [state?.phase, party.currentRound]);

  if (!state || !challenge) return null;

  // Handle Ready click
  const handleReadyClick = () => {
    if (isReady) return;
    soundService.playReadyChime();
    socketService.sendGameAction('player_ready');
  };

  // Host force start memorization
  const handleForceStartMemorize = () => {
    soundService.playClick();
    socketService.sendGameAction('force_start_memorize');
  };

  // Handle choice submission
  const handleOptionSelect = (optionVal: string) => {
    if (hasSubmitted) return;
    setSelectedOption(optionVal);
    setHasSubmitted(true);
    const timeTaken = Date.now() - answerStartTimeRef.current;
    socketService.sendGameAction('submit_answer', {
      answer: optionVal,
      timeTakenMs: timeTaken
    });
    soundService.playClick();
  };

  // Handle sequence builder clicks
  const handleAddSequenceItem = (item: string) => {
    if (hasSubmitted) return;
    const nextSeq = [...sequenceInput, item];
    setSequenceInput(nextSeq);
    soundService.playClick();

    const targetLength = Array.isArray(challenge.correctAnswer) ? challenge.correctAnswer.length : 5;
    if (nextSeq.length >= targetLength) {
      setHasSubmitted(true);
      const timeTaken = Date.now() - answerStartTimeRef.current;
      socketService.sendGameAction('submit_answer', {
        answer: nextSeq,
        timeTakenMs: timeTaken
      });
    }
  };

  const handleClearSequence = () => {
    if (hasSubmitted) return;
    setSequenceInput([]);
    soundService.playClick();
  };

  const handleNextRound = () => {
    socketService.nextRound();
    soundService.playClick();
  };

  // Player custom chaos prompt if chaos round
  const myChaos = challenge.challengeType === 'chaos_round' && challenge.playerSpecificChaos
    ? challenge.playerSpecificChaos[myPlayerId]
    : null;

  // ----------------------------------------------------
  // PHASE 0: INSTRUCTION & READY CHECK
  // ----------------------------------------------------
  if (state.phase === 'ready') {
    const readyCount = Object.keys(state.readyPlayers || {}).length;
    const totalPlayers = Object.keys(party.players).filter(id => party.players[id].isOnline).length || Object.keys(party.players).length;

    return (
      <div id="memory-battle-ready-screen" className="mx-auto max-w-2xl space-y-6">
        {/* Instruction Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 p-6 sm:p-8 text-center shadow-2xl space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            Round {party.currentRound} of {party.totalRounds} • {challenge.title}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {challenge.instruction}
          </h2>

          <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Read the instructions carefully! Once all players click ready, the sequence will flash on screen for {challenge.memorizeDurationSeconds} seconds.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 py-2 px-4 rounded-xl max-w-md mx-auto">
            <Zap className="w-4 h-4" />
            <span>Speed Bonus: Faster correct answers score up to +75 extra points!</span>
          </div>

          {/* Large Interactive Ready Button */}
          <div className="pt-4">
            <motion.button
              id="memory-battle-ready-btn"
              whileHover={{ scale: isReady ? 1 : 1.03 }}
              whileTap={{ scale: isReady ? 1 : 0.97 }}
              onClick={handleReadyClick}
              disabled={isReady}
              className={`w-full max-w-md mx-auto py-4 px-6 rounded-2xl font-black text-lg sm:text-xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isReady
                  ? 'bg-emerald-600/90 text-white border-2 border-emerald-400 cursor-default'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30 border-2 border-emerald-300 animate-pulse'
              }`}
            >
              {isReady ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-white" />
                  YOU'RE READY! WAITING FOR OTHERS...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  I'M READY TO MEMORIZE! 🚀
                </>
              )}
            </motion.button>
          </div>

          {/* Host Fast Forward / Skip button */}
          {isHost && (
            <button
              onClick={handleForceStartMemorize}
              className="text-xs text-slate-400 hover:text-emerald-300 transition underline cursor-pointer mt-2"
            >
              Host: Skip ready countdown and start memorizing now ➔
            </button>
          )}
        </motion.div>

        {/* Players Readiness List */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              Players Ready ({readyCount} / {totalPlayers})
            </span>
            <span className="text-emerald-400 font-mono">Auto-starting in {party.roundTimeRemaining}s</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.keys(party.players).map(pid => {
              const p = party.players[pid];
              const playerReady = Boolean(state.readyPlayers?.[pid]);
              const isMe = pid === myPlayerId;

              return (
                <div
                  key={pid}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium ${
                    playerReady
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span>{p.avatar}</span>
                    <span className="truncate">{p.name} {isMe && '(You)'}</span>
                  </div>
                  {playerReady ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <span className="text-[10px] text-slate-500 shrink-0">Reading...</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Challenge Title Banner */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-zinc-950 p-6 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
          <Brain className="h-4 w-4" />
          <span>Round {party.currentRound} of {party.totalRounds} • {challenge.title}</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-white">
          {state.phase === 'memorize' ? challenge.instruction : (myChaos?.prompt || challenge.questionPrompt)}
        </h3>

        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-800/40">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>Speed Bonus Active: Faster answers score more!</span>
        </div>
      </div>

      {/* PHASE 1: MEMORIZE PHASE */}
      {state.phase === 'memorize' && (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center space-y-6 animate-in fade-in">
          {/* Display row of items */}
          {challenge.displayItems && challenge.displayItems.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {challenge.displayItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-zinc-800/90 text-3xl sm:text-4xl shadow-lg border border-zinc-700/80 animate-bounce"
                  style={{ animationDelay: `${idx * 100}ms`, animationIterationCount: 1 }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Grid display for position memory */}
          {challenge.gridItems && (
            <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
              {challenge.gridItems.map((cell, idx) => (
                <div
                  key={idx}
                  className="flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-800 text-2xl border border-zinc-700/60"
                >
                  {cell || ''}
                </div>
              ))}
            </div>
          )}

          {/* Number pairs display */}
          {challenge.numberPairs && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
              {challenge.numberPairs.map((pair, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center rounded-2xl bg-zinc-800 p-3 border border-zinc-700">
                  <span className="text-3xl">{pair.symbol}</span>
                  <span className="text-xs text-zinc-400 mt-1">=</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">{pair.num}</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-zinc-400 animate-pulse">
            Memorizing... Screen will hide in <strong className="text-white">{party.roundTimeRemaining}s</strong>
          </div>
        </div>
      )}

      {/* PHASE 2: ANSWER PHASE */}
      {state.phase === 'answer' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Sequence builder mode */}
          {(challenge.challengeType === 'sequence' || challenge.challengeType === 'reverse_sequence') ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-5 text-center">
              <div className="text-xs text-zinc-400">Your current entered sequence:</div>
              <div className="flex items-center justify-center gap-2 min-h-[60px] rounded-2xl bg-zinc-950 p-3 border border-zinc-800">
                {sequenceInput.length === 0 ? (
                  <span className="text-xs text-zinc-600">Tap items below to build the sequence</span>
                ) : (
                  sequenceInput.map((val, idx) => (
                    <span key={idx} className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-xl font-bold">
                      {val}
                    </span>
                  ))
                )}
              </div>

              {!hasSubmitted ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-center gap-2.5">
                    {(challenge.options || []).map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddSequenceItem(opt)}
                        className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-zinc-800 text-2xl font-bold hover:bg-zinc-700 hover:scale-105 transition cursor-pointer border border-zinc-700"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleClearSequence}
                    className="text-xs text-zinc-500 hover:text-zinc-300 underline cursor-pointer"
                  >
                    Clear Sequence
                  </button>
                </div>
              ) : (
                <div className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Sequence Submitted! Waiting for results...
                </div>
              )}
            </div>
          ) : challenge.challengeType === 'position' ? (
            /* 3x3 Grid position answer selection */
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 text-center space-y-4">
              <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((pos) => (
                  <button
                    key={pos}
                    disabled={hasSubmitted}
                    onClick={() => handleOptionSelect(String(pos))}
                    className={`flex h-16 w-16 items-center justify-center rounded-xl border text-sm font-bold transition cursor-pointer ${
                      selectedOption === String(pos)
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                        : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    Tile #{pos + 1}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Multi-choice options */
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(myChaos?.options || challenge.options || []).map((opt, idx) => {
                  const isSelected = selectedOption === opt;

                  return (
                    <button
                      key={idx}
                      disabled={hasSubmitted}
                      onClick={() => handleOptionSelect(opt)}
                      className={`flex items-center justify-center rounded-2xl p-4 border text-xl sm:text-2xl font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                          : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PHASE 3: REVEAL PHASE */}
      {isReveal && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h4 className="text-base font-black text-white">Round {party.currentRound} Results</h4>
              <p className="text-xs text-zinc-400">
                Correct Answer: <strong className="text-emerald-400">{Array.isArray(challenge.correctAnswer) ? challenge.correctAnswer.join(' ') : challenge.correctAnswer}</strong>
              </p>
            </div>

            {isHost && (
              <button
                onClick={handleNextRound}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition cursor-pointer shadow-md"
              >
                <span>{party.currentRound < party.totalRounds ? 'NEXT CHALLENGE' : 'SEE FINAL RESULTS'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(party.players).map((pid) => {
              const p = party.players[pid];
              const sub = state.submissions[pid];
              const isMe = pid === myPlayerId;

              return (
                <div
                  key={pid}
                  className={`rounded-2xl border p-4 ${
                    sub?.isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span>{p.avatar}</span>
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      {isMe && <span className="text-[9px] text-zinc-500">(YOU)</span>}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {sub?.isCorrect ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" /> +{sub.pointsEarned} pts
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-zinc-500">
                          <XCircle className="h-3.5 w-3.5 text-rose-500" /> 0 pts
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Answer: {sub?.answer ? (Array.isArray(sub.answer) ? sub.answer.join(' ') : String(sub.answer)) : 'No answer'}
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
