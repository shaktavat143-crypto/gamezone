import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Trophy,
  Flame,
  ArrowRight,
  Zap,
  CheckCircle,
  Clock,
  Crown,
  Shuffle
} from 'lucide-react';
import { ClientPartyView, SolahChitsRoundData, SolahChitsCard } from '../../types.js';
import { soundService } from '../../services/sound.js';

interface SolahChitsProps {
  party: ClientPartyView;
  onAction: (action: string, data?: any) => void;
  isHost: boolean;
}

export const SolahChits: React.FC<SolahChitsProps> = ({ party, onAction, isHost }) => {
  const state = party.gameState as SolahChitsRoundData | null;
  const myPlayerId = party.myPlayerId;
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hasSlammed, setHasSlammed] = useState<boolean>(false);

  if (!state) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Preparing Solah Chits deck...
      </div>
    );
  }

  // Get my cards
  const myHand: SolahChitsCard[] = (state.hands && state.hands[myPlayerId]) || [];

  // Determine circular neighbor
  const playerOrder = state.playerOrder || Object.keys(party.players);
  const myIndex = playerOrder.indexOf(myPlayerId);
  const nextPlayerId = myIndex !== -1 ? playerOrder[(myIndex + 1) % playerOrder.length] : null;
  const prevPlayerId = myIndex !== -1 ? playerOrder[(myIndex - 1 + playerOrder.length) % playerOrder.length] : null;

  const nextPlayer = nextPlayerId ? party.players[nextPlayerId] : null;
  const prevPlayer = prevPlayerId ? party.players[prevPlayerId] : null;

  // Count matching types in hand
  const typeCounts: Record<string, number> = {};
  myHand.forEach(c => {
    typeCounts[c.typeId] = (typeCounts[c.typeId] || 0) + 1;
  });

  const maxCount = Object.values(typeCounts).length > 0 ? Math.max(...Object.values(typeCounts)) : 0;
  const matchingTypeId = Object.keys(typeCounts).find(k => typeCounts[k] === maxCount);
  const hasCompleteSet = maxCount === 4;

  const pendingPassId = state.pendingPasses?.[myPlayerId] || selectedCardId;
  const hasPassed = Boolean(state.pendingPasses?.[myPlayerId]);

  // Audio trigger on bingo slam phase
  useEffect(() => {
    if (state.phase === 'bingo_slam') {
      soundService.playBingoAlert();
    }
  }, [state.phase]);

  // Reset local state when pass occurs
  useEffect(() => {
    setSelectedCardId(null);
  }, [state.passCount]);

  const handleSelectCard = (cardId: string) => {
    if (state.phase !== 'passing' || hasPassed) return;
    setSelectedCardId(cardId);
    soundService.playTick();
    onAction('pass_card', { cardId });
  };

  const handleTriggerBingo = () => {
    if (!hasCompleteSet || state.phase !== 'passing') return;
    soundService.playBingoSlam();
    onAction('trigger_bingo');
  };

  const handleSlamBingo = () => {
    if (state.phase !== 'bingo_slam' || hasSlammed) return;
    setHasSlammed(true);
    soundService.playBingoSlam();
    onAction('slam_bingo');
  };

  const mySlam = state.reactionSlams?.find(s => s.playerId === myPlayerId);

  // ----------------------------------------------------
  // 1. REVEAL / ROUND RESULTS PHASE
  // ----------------------------------------------------
  if (state.phase === 'reveal' || party.gameStatus === 'round_reveal') {
    const winnerSlam = state.reactionSlams?.[0];
    return (
      <div id="solah-chits-reveal" className="max-w-4xl mx-auto space-y-6">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 rounded-2xl p-6 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mb-3">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Round {party.currentRound} Complete!
          </h2>
          <p className="text-amber-300 font-medium">
            {winnerSlam
              ? `${winnerSlam.playerName} was the first to collect 4 chits and call BINGO! 🏆`
              : 'Round completed!'}
          </p>
        </motion.div>

        {/* Reaction Podium Leaderboard */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Bingo Slam Reaction Standings
          </h3>

          <div className="space-y-3">
            {state.reactionSlams && state.reactionSlams.length > 0 ? (
              state.reactionSlams.map((slam, idx) => (
                <motion.div
                  key={slam.playerId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center justify-between p-3.5 rounded-xl border ${
                    slam.rank === 1
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                      : slam.rank === 2
                      ? 'bg-slate-700/60 border-slate-600/60 text-slate-200'
                      : slam.rank === 3
                      ? 'bg-amber-900/20 border-amber-800/40 text-amber-400'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-sm rounded-lg bg-slate-800/80 border border-slate-700">
                      {slam.rank === 1 ? '🥇' : slam.rank === 2 ? '🥈' : slam.rank === 3 ? '🥉' : `#${slam.rank}`}
                    </div>
                    <span className="text-xl">{slam.playerAvatar}</span>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        {slam.playerName}
                        {slam.playerId === myPlayerId && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        {slam.rank === 1 ? 'Achieved 4 Matching Chits' : `Reaction Time: ${(slam.reactionMs / 1000).toFixed(2)}s`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-bold text-lg text-emerald-400">
                    +{slam.points} pts
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 text-sm">
                No reaction slams registered this round.
              </div>
            )}
          </div>
        </div>

        {/* All Players' Final Hands Revealed */}
        {state.hands && Object.keys(state.hands).length > 0 && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-indigo-400" />
              All Players' Final Chits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(state.hands).map(([pid, hand]) => {
                const player = party.players[pid];
                if (!player) return null;
                const isAllSame = hand.length === 4 && hand.every(c => c.typeId === hand[0].typeId);

                return (
                  <div
                    key={pid}
                    className={`p-4 rounded-xl border ${
                      isAllSame
                        ? 'bg-amber-500/10 border-amber-500/40'
                        : 'bg-slate-900/50 border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{player.avatar}</span>
                        <span className="font-semibold text-white text-sm">{player.name}</span>
                      </div>
                      {isAllSame && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium">
                          4x Match! ✨
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {hand.map((card, cIdx) => (
                        <div
                          key={`${card.id}_${cIdx}`}
                          className="bg-slate-800/90 border border-slate-700 rounded-lg p-2 text-center"
                        >
                          <div className="text-xl mb-1">{card.icon}</div>
                          <div className="text-[11px] font-bold text-white truncate">{card.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. HIGH-URGENCY BINGO SLAM PHASE
  // ----------------------------------------------------
  if (state.phase === 'bingo_slam') {
    const caller = state.bingoWinnerId ? party.players[state.bingoWinnerId] : null;
    const isCaller = state.bingoWinnerId === myPlayerId;

    return (
      <div id="solah-chits-slam-phase" className="max-w-2xl mx-auto space-y-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="bg-gradient-to-r from-red-600/30 via-orange-600/30 to-amber-600/30 border-2 border-red-500/60 rounded-3xl p-8 shadow-2xl shadow-red-500/20"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 text-red-400 mb-4 animate-bounce">
            <Flame className="w-10 h-10" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-2 uppercase">
            BINGO CALLED! 🔥
          </h1>

          <p className="text-lg text-amber-200 font-semibold mb-6">
            {isCaller
              ? 'You called BINGO! Hold on while everyone races to slam!'
              : `${caller ? caller.name : 'Someone'} completed 4 matching chits! SLAM NOW!`}
          </p>

          {/* Emergency Countdown */}
          <div className="flex items-center justify-center gap-2 text-red-400 font-mono font-bold text-lg mb-8">
            <Clock className="w-5 h-5 animate-spin" />
            <span>Time Left: {party.roundTimeRemaining}s</span>
          </div>

          {/* Massive Reaction Button */}
          {!isCaller ? (
            <motion.button
              id="solah-chits-slam-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSlamBingo}
              disabled={Boolean(mySlam) || hasSlammed}
              className={`w-full py-6 rounded-2xl text-2xl sm:text-3xl font-black shadow-xl tracking-wider transition-all ${
                mySlam || hasSlammed
                  ? 'bg-slate-700/80 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-white border-2 border-amber-300 shadow-red-500/50 cursor-pointer animate-pulse'
              }`}
            >
              {mySlam || hasSlammed ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                  SLAMMED! Rank #{mySlam?.rank || '—'}
                </span>
              ) : (
                '💥 SLAM BINGO BUTTON! 💥'
              )}
            </motion.button>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xl">
              👑 You are #1! (+100 pts)
            </div>
          )}
        </motion.div>

        {/* Live Reaction Slams Feed */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-left">
          <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-3">
            Live Slams ({state.reactionSlams?.length || 0} / {playerOrder.length})
          </div>
          <div className="space-y-2">
            {state.reactionSlams?.map((slam, idx) => (
              <div
                key={slam.playerId}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-400">#{idx + 1}</span>
                  <span>{slam.playerAvatar}</span>
                  <span className="text-white font-medium">{slam.playerName}</span>
                </div>
                <span className="text-emerald-400 font-mono font-semibold">
                  {slam.rank === 1 ? '1st (Caller)' : `+${(slam.reactionMs / 1000).toFixed(2)}s`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 3. MAIN PASSING PHASE
  // ----------------------------------------------------
  return (
    <div id="solah-chits-passing-phase" className="max-w-4xl mx-auto space-y-6">
      {/* Header bar: Pass counter & timer */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
            🃏
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Round {party.currentRound} of {party.totalRounds} • Pass Wave #{state.passCount + 1}
            </div>
            <div className="text-sm text-slate-300 font-medium">
              Collect 4 of a kind, then smash the Bingo button!
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 font-mono text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className={party.roundTimeRemaining <= 5 ? 'text-red-400 font-bold animate-pulse' : 'text-slate-200 font-bold'}>
              {party.roundTimeRemaining}s
            </span>
          </div>
        </div>
      </div>

      {/* Circular Direction & Passing Tracker */}
      <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-300 mb-2">
          {prevPlayer && (
            <span className="text-slate-400">
              Receiving from <strong className="text-white">{prevPlayer.name}</strong>
            </span>
          )}
          <ArrowRight className="w-4 h-4 text-amber-400" />
          {nextPlayer && (
            <span className="text-slate-200">
              Passing to <strong className="text-amber-300">{nextPlayer.name}</strong>
            </span>
          )}
        </div>

        {/* Circular Player Avatars indicator */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {playerOrder.map((pid, idx) => {
            const p = party.players[pid];
            if (!p) return null;
            const hasSelected = Boolean(state.pendingPasses?.[pid]);
            const isMe = pid === myPlayerId;

            return (
              <div
                key={pid}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isMe
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                    : hasSelected
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
                {hasSelected ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-600 animate-ping" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress & Target Matching status */}
      <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">Matching Progress:</span>
          <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs border ${
            hasCompleteSet
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
              : maxCount === 3
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-700 text-slate-300 border-slate-600'
          }`}>
            {maxCount} / 4 {matchingTypeId ? state.cardTypes.find(t => t.typeId === matchingTypeId)?.name : 'Matching'}
          </span>
        </div>

        {/* BINGO TRIGGER BUTTON */}
        {hasCompleteSet ? (
          <motion.button
            id="solah-chits-call-bingo-btn"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            onClick={handleTriggerBingo}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white font-black text-base shadow-lg shadow-amber-500/30 border border-amber-300 flex items-center gap-2 cursor-pointer"
          >
            <Crown className="w-5 h-5 text-amber-200" />
            CALL BINGO NOW! 🏆
          </motion.button>
        ) : (
          <div className="text-xs text-slate-400">
            {hasPassed ? 'Card selected! Waiting for other players to pass...' : 'Select a card below to pass to the next player'}
          </div>
        )}
      </div>

      {/* My 4 Chits (Cards in Hand) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Your Chits (Select 1 to pass to {nextPlayer?.name || 'next player'})
          </h3>
          {pendingPassId && (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Chit locked for pass
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {myHand.map((card, idx) => {
            const isSelected = pendingPassId === card.id;
            const cardMatches = typeCounts[card.typeId] > 1;

            return (
              <motion.button
                key={card.id}
                id={`solah-chit-card-${idx}`}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelectCard(card.id)}
                disabled={hasPassed}
                className={`relative p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-between text-center min-h-[190px] cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/40'
                    : cardMatches
                    ? 'bg-slate-800/90 border-amber-500/40 hover:border-amber-400'
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                }`}
              >
                {/* Count badge */}
                {typeCounts[card.typeId] > 1 && (
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    {typeCounts[card.typeId]}x Match
                  </div>
                )}

                <div className="text-4xl my-auto drop-shadow-md">
                  {card.icon}
                </div>

                <div className="w-full mt-2">
                  <div className="text-base font-bold text-white tracking-wide">
                    {card.name}
                  </div>
                  <div className="text-xs text-amber-300/90 font-medium">
                    {card.hindiName}
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                    Selected to Pass ➔
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
