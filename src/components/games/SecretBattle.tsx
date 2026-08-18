import React, { useState } from 'react';
import { Eye, EyeOff, Send, CheckCircle2, AlertCircle, ArrowRight, UserCheck, HelpCircle } from 'lucide-react';
import { SecretBattleRoundData, ClientPartyView } from '../../types.js';
import { socketService } from '../../services/socket.js';
import { soundService } from '../../services/sound.js';

interface SecretBattleProps {
  party: ClientPartyView;
}

export const SecretBattle: React.FC<SecretBattleProps> = ({ party }) => {
  const state = party.gameState as SecretBattleRoundData;
  const myPlayerId = party.myPlayerId;
  const isHost = party.isHost;
  const privateData = party.privatePlayerData;

  const [clueInput, setClueInput] = useState('');
  const [impostorGuessInput, setImpostorGuessInput] = useState('');
  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  if (!state) return null;

  const myRole = privateData?.role || 'regular_player';
  const myWord = privateData?.myWord || '???';
  const isSecretPlayer = myRole === 'secret_player';

  const myClue = state.clues[myPlayerId];
  const myVote = state.votes[myPlayerId];

  const handleClueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueInput.trim()) return;
    socketService.sendGameAction('submit_clue', { clue: clueInput.trim() });
    soundService.playClick();
  };

  const handleVoteSubmit = (targetId: string) => {
    setSelectedVote(targetId);
    socketService.sendGameAction('submit_vote', { targetPlayerId: targetId });
    soundService.playClick();
  };

  const handleImpostorGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!impostorGuessInput.trim()) return;
    socketService.sendGameAction('impostor_guess', { guess: impostorGuessInput.trim() });
    soundService.playClick();
  };

  const handleNextRound = () => {
    socketService.nextRound();
    soundService.playClick();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Secret Word Card */}
      <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-zinc-950 to-zinc-950 p-5 sm:p-6 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">
          <span>Category: {state.category}</span>
        </div>

        <div className="my-2">
          <div className="text-xs text-zinc-400 mb-1">YOUR SECRET WORD:</div>
          <div className="inline-block rounded-2xl bg-violet-600/20 border-2 border-violet-500 px-6 py-3 text-2xl sm:text-3xl font-black text-violet-200 tracking-wider shadow-inner">
            {myWord}
          </div>
        </div>

        <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto">
          {isSecretPlayer ? (
            <span className="text-amber-300 font-medium">
              🕵️ You have a DIFFERENT word than everyone else! Give a subtle clue to blend in.
            </span>
          ) : (
            <span className="text-violet-300 font-medium">
              Give one clue that proves you know the secret word without making it too obvious for the impostor!
            </span>
          )}
        </p>
      </div>

      {/* PHASE 1: CLUES */}
      {state.phase === 'clues' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <h4 className="text-sm font-bold text-white mb-2">Step 1: Write Your One-Word / Short Clue</h4>
            {myClue ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-950/40 p-3 text-xs text-emerald-300 border border-emerald-800/40">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>You submitted: &quot;<strong>{myClue}</strong>&quot;. Waiting for other players...</span>
              </div>
            ) : (
              <form onSubmit={handleClueSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={clueInput}
                  onChange={(e) => setClueInput(e.target.value)}
                  placeholder="e.g. Cheese / Italian / Crispy..."
                  maxLength={50}
                  className="flex-1 rounded-xl bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 border border-zinc-800 focus:border-violet-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!clueInput.trim()}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-500 disabled:opacity-40 transition cursor-pointer"
                >
                  Send Clue
                </button>
              </form>
            )}
          </div>

          {/* Clues Live Board */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Submitted Clues</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.keys(party.players).map((pid) => {
                const p = party.players[pid];
                const clue = state.clues[pid];

                return (
                  <div key={pid} className="flex items-center justify-between rounded-xl bg-zinc-900/80 p-3 border border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <span>{p.avatar}</span>
                      <span className="text-xs font-semibold text-white">{p.name}</span>
                    </div>
                    <div>
                      {clue ? (
                        <span className="rounded-lg bg-violet-950/60 px-2.5 py-1 text-xs font-bold text-violet-300 border border-violet-800/40">
                          &quot;{clue}&quot;
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 italic">Thinking...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: VOTING */}
      {state.phase === 'voting' && (
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-base font-black text-white">Step 2: Who has the Secret Word?</h4>
            <p className="text-xs text-zinc-400">Review everyone&apos;s clues and cast your secret vote!</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(party.players).map((pid) => {
              const p = party.players[pid];
              const clue = state.clues[pid] || 'No clue';
              const isVotedByMe = (myVote || selectedVote) === pid;

              return (
                <button
                  key={pid}
                  onClick={() => handleVoteSubmit(pid)}
                  className={`flex flex-col text-left rounded-2xl p-4 border transition-all cursor-pointer ${
                    isVotedByMe
                      ? 'bg-amber-950/30 border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/30'
                      : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.avatar}</span>
                      <span className="text-xs font-bold text-white">{p.name}</span>
                    </div>
                    {isVotedByMe && (
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                        YOUR VOTE
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-300">
                    Clue: <strong className="text-violet-300">&quot;{clue}&quot;</strong>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PHASE 3: REVEAL & IMPOSTOR GUESS */}
      {state.phase === 'reveal_guess' && (
        <div className="rounded-2xl border border-amber-500/40 bg-zinc-900/80 p-6 text-center space-y-4">
          <div className="text-2xl">🚨</div>
          <h4 className="text-lg font-black text-white">The Impostor was identified!</h4>

          {isSecretPlayer ? (
            <div className="space-y-3 max-w-sm mx-auto">
              <p className="text-xs text-amber-300">
                You were caught! But you can still earn <strong className="text-emerald-400">+150 pts</strong> if you can guess what the group&apos;s secret word was!
              </p>
              <form onSubmit={handleImpostorGuess} className="flex gap-2">
                <input
                  type="text"
                  value={impostorGuessInput}
                  onChange={(e) => setImpostorGuessInput(e.target.value)}
                  placeholder="Guess majority word..."
                  className="flex-1 rounded-xl bg-zinc-950 px-3.5 py-2.5 text-xs text-white border border-zinc-800 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-500 transition cursor-pointer"
                >
                  Guess
                </button>
              </form>
            </div>
          ) : (
            <p className="text-xs text-zinc-400">
              The secret player is currently guessing the group&apos;s word to steal points...
            </p>
          )}
        </div>
      )}

      {/* PHASE 4: FINAL ROUND SCORES */}
      {state.phase === 'scores' && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h4 className="text-base font-black text-white">Secret Battle Reveal</h4>
              <p className="text-xs text-zinc-400">
                Majority Word: <strong className="text-violet-300">{state.majorityWord}</strong> | Impostor Word: <strong className="text-amber-300">{state.secretWord}</strong>
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
              const summary = state.roundScoreSummary?.[pid];
              const isImpostor = pid === state.secretPlayerId;

              return (
                <div
                  key={pid}
                  className={`rounded-2xl border p-4 ${
                    isImpostor ? 'bg-amber-950/20 border-amber-500/40' : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{p.avatar}</span>
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      {isImpostor && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30">
                          SECRET PLAYER
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs font-bold text-emerald-400">
                      +{summary?.points || 0} pts
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    {summary?.reason || 'Completed round.'}
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
