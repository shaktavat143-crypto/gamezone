import React, { useState } from 'react';
import { Vote, Trophy, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { MostLikelyToRoundData, ClientPartyView } from '../../types.js';
import { socketService } from '../../services/socket.js';
import { soundService } from '../../services/sound.js';

interface MostLikelyToProps {
  party: ClientPartyView;
}

export const MostLikelyTo: React.FC<MostLikelyToProps> = ({ party }) => {
  const state = party.gameState as MostLikelyToRoundData;
  const isReveal = party.gameStatus === 'round_reveal';
  const myPlayerId = party.myPlayerId;
  const isHost = party.isHost;

  const [selectedVote, setSelectedVote] = useState<string | null>(null);

  if (!state) return null;

  const myVote = state.votes[myPlayerId] || selectedVote;

  const handleVote = (targetPlayerId: string) => {
    setSelectedVote(targetPlayerId);
    socketService.sendGameAction('submit_vote', { targetPlayerId });
    soundService.playClick();
  };

  const handleNextRound = () => {
    socketService.nextRound();
    soundService.playClick();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Question Card */}
      <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-zinc-950 to-zinc-950 p-6 sm:p-8 text-center shadow-xl">
        <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">
          <Sparkles className="h-4 w-4" />
          <span>Category: {state.category}</span>
        </div>

        <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight">
          &quot;{state.questionText}&quot;
        </h3>

        <p className="mt-3 text-xs text-zinc-400">
          {!isReveal
            ? 'Cast your secret vote for the player that fits this prompt best!'
            : 'Votes tallied! Check out who the room chose.'}
        </p>
      </div>

      {/* Voting Phase */}
      {!isReveal ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.keys(party.players).map((pid) => {
              const player = party.players[pid];
              const isSelected = myVote === pid;
              const isMe = pid === myPlayerId;

              return (
                <button
                  key={pid}
                  onClick={() => handleVote(pid)}
                  className={`flex items-center gap-3 rounded-2xl p-4 border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/40'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl shadow-inner"
                    style={{
                      backgroundColor: `${player.color}20`,
                      border: `1px solid ${player.color}50`
                    }}
                  >
                    {player.avatar || '🎮'}
                  </div>

                  <div className="text-left min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {player.name}
                      </span>
                      {isMe && (
                        <span className="rounded bg-zinc-800 px-1 text-[9px] text-zinc-400">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      {isSelected ? (
                        <span className="text-blue-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3 inline" /> Voted
                        </span>
                      ) : (
                        'Tap to vote'
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-center text-xs text-zinc-500">
            {myVote ? 'Your vote is locked in. Waiting for the rest of the party...' : 'Select a player above to cast your vote.'}
          </div>
        </div>
      ) : (
        /* Reveal Phase */
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h4 className="text-base font-black text-white">Round {party.currentRound} Results</h4>
              <p className="text-xs text-zinc-400">+100 for winning title, +50 for voting with majority</p>
            </div>

            {isHost && (
              <button
                onClick={handleNextRound}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition cursor-pointer shadow-md"
              >
                <span>{party.currentRound < party.totalRounds ? 'NEXT QUESTION' : 'SEE FINAL RESULTS'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {Object.keys(party.players)
              .sort((a, b) => {
                const countA = state.results?.voteCounts?.[a] || 0;
                const countB = state.results?.voteCounts?.[b] || 0;
                return countB - countA;
              })
              .map((pid) => {
                const player = party.players[pid];
                const votes = state.results?.voteCounts?.[pid] || 0;
                const isWinner = state.results?.winners?.includes(pid);
                const points = state.results?.pointsEarned?.[pid] || 0;
                const totalVotes = Object.values(state.results?.voteCounts || {}).reduce((a, b) => a + b, 0) || 1;
                const percentage = Math.round((votes / totalVotes) * 100);

                return (
                  <div
                    key={pid}
                    className={`rounded-2xl border p-4 transition ${
                      isWinner
                        ? 'bg-blue-950/30 border-blue-500/50 shadow-md shadow-blue-500/10'
                        : 'bg-zinc-900/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{player.avatar}</span>
                        <span className="text-xs font-bold text-white">{player.name}</span>
                        {isWinner && (
                          <span className="flex items-center gap-1 rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                            <Trophy className="h-3 w-3 text-blue-400" />
                            MOST LIKELY
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-zinc-300">
                          {votes} {votes === 1 ? 'vote' : 'votes'}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          +{points} pts
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isWinner ? 'bg-gradient-to-r from-blue-500 to-indigo-400' : 'bg-zinc-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
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
