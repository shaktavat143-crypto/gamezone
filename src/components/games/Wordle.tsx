import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Trophy, ArrowRight, AlertCircle, CheckCircle2, Delete, CornerDownLeft } from 'lucide-react';
import { WordleRoundData, ClientPartyView, WordleTileStatus } from '../../types.js';
import { socketService } from '../../services/socket.js';
import { soundService } from '../../services/sound.js';
import { isValidWordleWord } from '../../data/wordleWords.js';

interface WordleProps {
  party: ClientPartyView;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export const Wordle: React.FC<WordleProps> = ({ party }) => {
  const state = party.gameState as WordleRoundData;
  const isReveal = party.gameStatus === 'round_reveal' || state?.phase === 'reveal';
  const isHost = party.isHost;

  const [currentInput, setCurrentInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState(false);

  // My player state
  const myState = state?.myState || {
    guesses: [],
    keyboardStatus: {},
    isSolved: false,
    isFinished: false,
    score: 0
  };

  const isFinished = myState.isFinished;
  const guesses = myState.guesses || [];
  const maxGuesses = state?.maxGuesses || 6;

  // Flash error toast with auto-hide
  const triggerError = useCallback((msg: string) => {
    setErrorMessage(msg);
    setShakeRow(true);
    soundService.playError();
    setTimeout(() => setShakeRow(false), 600);
    setTimeout(() => setErrorMessage(null), 2000);
  }, []);

  // Handle submitting a guess
  const handleSubmitGuess = useCallback(() => {
    if (isFinished || isReveal) return;

    const trimmed = currentInput.trim().toUpperCase();
    if (trimmed.length !== 5) {
      triggerError('Word must be 5 letters');
      return;
    }

    // In Wordle, same word cannot be written/guessed twice
    const alreadyGuessed = guesses.some(g => g.word.toUpperCase() === trimmed);
    if (alreadyGuessed) {
      triggerError('Word already entered');
      return;
    }

    // Client-side dictionary pre-validation
    if (!isValidWordleWord(trimmed)) {
      triggerError('Not in word list');
      return;
    }

    // Submit to authoritative server
    socketService.sendGameAction('submit_guess', { guess: trimmed });
    soundService.playClick();
    setCurrentInput('');
  }, [currentInput, isFinished, isReveal, guesses, triggerError]);

  // Handle typing a letter
  const handleAddLetter = useCallback((letter: string) => {
    if (isFinished || isReveal) return;
    if (currentInput.length < 5) {
      setCurrentInput(prev => prev + letter.toUpperCase());
      soundService.playClick();
    }
  }, [currentInput.length, isFinished, isReveal]);

  // Handle backspace
  const handleDeleteLetter = useCallback(() => {
    if (isFinished || isReveal) return;
    if (currentInput.length > 0) {
      setCurrentInput(prev => prev.slice(0, -1));
      soundService.playClick();
    }
  }, [currentInput.length, isFinished, isReveal]);

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when focusing input or modal
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitGuess();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteLetter();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleAddLetter(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmitGuess, handleDeleteLetter, handleAddLetter]);

  if (!state) return null;

  const handleNextRound = () => {
    socketService.nextRound();
    soundService.playClick();
  };

  // Tile background color resolver
  const getTileStyle = (status: WordleTileStatus) => {
    switch (status) {
      case 'correct':
        return 'bg-emerald-600 border-emerald-500 text-white font-black shadow-lg shadow-emerald-900/30';
      case 'present':
        return 'bg-amber-500 border-amber-400 text-white font-black shadow-lg shadow-amber-900/30';
      case 'absent':
        return 'bg-zinc-700/80 border-zinc-600 text-zinc-300 font-bold';
      default:
        return 'bg-zinc-900/40 border-zinc-800 text-white';
    }
  };

  // Keyboard key color resolver
  const getKeyStyle = (key: string) => {
    const status = myState.keyboardStatus?.[key];
    switch (status) {
      case 'correct':
        return 'bg-emerald-600 text-white border-emerald-500';
      case 'present':
        return 'bg-amber-500 text-white border-amber-400';
      case 'absent':
        return 'bg-zinc-800 text-zinc-500 border-zinc-700 opacity-60';
      default:
        return 'bg-zinc-700/80 hover:bg-zinc-600 active:bg-zinc-500 text-white border-zinc-600';
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* REVEAL PHASE BANNER */}
      {isReveal && (
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/50 via-zinc-950 to-zinc-950 p-6 text-center shadow-xl space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
            <Trophy className="h-4 w-4" />
            <span>Round Results</span>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-zinc-400 uppercase font-bold tracking-wider">The secret word was</p>
            <div className="flex items-center justify-center gap-2">
              {(state.revealedSecretWord || '?????').split('').map((letter, i) => (
                <div
                  key={i}
                  className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-emerald-600 border-2 border-emerald-400 text-2xl sm:text-3xl font-black text-white shadow-lg shadow-emerald-600/40 animate-bounce"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {letter}
                </div>
              ))}
            </div>
          </div>

          {/* Host Next Round Button */}
          {isHost && (
            <div className="pt-2">
              <button
                onClick={handleNextRound}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 font-bold text-white shadow-lg shadow-emerald-500/30 hover:opacity-95 active:scale-95 transition-all"
              >
                <span>{party.currentRound < party.totalRounds ? 'Next Round' : 'View Final Standings'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE GUESSING STATUS BANNER */}
      {!isReveal && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-300">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>
              Guess <strong className="text-white">{Math.min(guesses.length + (isFinished ? 0 : 1), maxGuesses)}</strong> of <strong className="text-white">{maxGuesses}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {myState.isSolved ? (
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Solved in {myState.guesses.length} {myState.guesses.length === 1 ? 'guess' : 'guesses'}!
              </span>
            ) : isFinished ? (
              <span className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-bold text-zinc-400">
                Out of guesses
              </span>
            ) : (
              <span className="text-xs text-zinc-400">
                Type 5 letters and hit <strong className="text-zinc-200">Enter</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ERROR TOAST */}
      {errorMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-xl shadow-rose-950 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* MAIN PLAY AREA: Grid + Opponents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* WORDLE BOARD (Takes 2 cols on lg) */}
        <div className="lg:col-span-2 flex flex-col items-center space-y-4">
          {/* 6x5 Wordle Tiles Grid */}
          <div className="p-4 sm:p-6 rounded-3xl border border-zinc-800 bg-zinc-950/70 shadow-2xl backdrop-blur-md">
            <div className="grid grid-rows-6 gap-2 sm:gap-2.5">
              {Array.from({ length: maxGuesses }).map((_, rowIdx) => {
                const guessObj = guesses[rowIdx];
                const isCurrentRow = !isFinished && !isReveal && rowIdx === guesses.length;

                return (
                  <div
                    key={rowIdx}
                    className={`grid grid-cols-5 gap-2 sm:gap-2.5 transition-transform duration-200 ${
                      isCurrentRow && shakeRow ? 'translate-x-[-8px] animate-shake' : ''
                    }`}
                  >
                    {Array.from({ length: 5 }).map((__, colIdx) => {
                      let letter = '';
                      let tileStatus: WordleTileStatus = 'empty';

                      if (guessObj) {
                        letter = guessObj.word[colIdx] || '';
                        tileStatus = guessObj.evaluations[colIdx] || 'absent';
                      } else if (isCurrentRow) {
                        letter = currentInput[colIdx] || '';
                      }

                      const hasLetter = letter.length > 0;

                      return (
                        <div
                          key={colIdx}
                          className={`flex h-11 w-11 xs:h-12 xs:w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border-2 text-lg xs:text-xl sm:text-2xl font-black transition-all select-none ${
                            guessObj
                              ? getTileStyle(tileStatus)
                              : hasLetter
                              ? 'border-zinc-300 bg-zinc-900 text-white scale-105 shadow-md shadow-zinc-900/50'
                              : 'border-zinc-800/80 bg-zinc-900/20 text-zinc-600'
                          }`}
                        >
                          {letter}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warning when current 5-letter input has already been used */}
          {!isFinished && !isReveal && currentInput.length === 5 && guesses.some(g => g.word.toUpperCase() === currentInput.toUpperCase()) && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3.5 py-2 text-xs font-bold text-amber-300 animate-pulse">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>You already entered "{currentInput.toUpperCase()}". The same word cannot be used twice!</span>
            </div>
          )}

          {/* VIRTUAL KEYBOARD */}
          {!isReveal && (
            <div className="w-full max-w-lg space-y-1.5 px-1 sm:px-2 select-none">
              {KEYBOARD_ROWS.map((row, rIdx) => (
                <div key={rIdx} className="flex justify-center gap-0.5 sm:gap-1.5 w-full">
                  {row.map(key => {
                    const isEnter = key === 'ENTER';
                    const isBack = key === 'BACKSPACE';

                    return (
                      <button
                        key={key}
                        onClick={() => {
                          if (isEnter) handleSubmitGuess();
                          else if (isBack) handleDeleteLetter();
                          else handleAddLetter(key);
                        }}
                        disabled={isFinished}
                        className={`h-11 sm:h-13 rounded-lg border font-bold transition-all active:scale-95 flex items-center justify-center shrink-0 ${
                          isEnter || isBack
                            ? 'flex-[1.4] min-w-[36px] sm:min-w-[52px] px-1 text-[10px] sm:text-xs'
                            : 'flex-1 min-w-[24px] max-w-[40px] text-xs sm:text-sm'
                        } ${getKeyStyle(key)}`}
                      >
                        {isBack ? <Delete className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : isEnter ? <CornerDownLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : key}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MULTIPLAYER / OPPONENTS SIDEBAR */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>Multiplayer Progress</span>
            </h3>

            {/* If Solo, show helpful message */}
            {(!state.opponentsProgress || state.opponentsProgress.length === 0) && (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-center">
                <span className="text-2xl mb-1 block">🎯</span>
                <p className="text-xs font-bold text-zinc-300">Solo Wordle Mode</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Invite friends anytime with party code <strong className="text-white font-mono">{party.code}</strong> to race in multiplayer!
                </p>
              </div>
            )}

            {/* List Opponents */}
            {state.opponentsProgress && state.opponentsProgress.length > 0 && (
              <div className="space-y-2.5">
                {state.opponentsProgress.map(opp => (
                  <div
                    key={opp.playerId}
                    className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold shadow-inner"
                        style={{ backgroundColor: `${opp.playerColor}25`, border: `1px solid ${opp.playerColor}60` }}
                      >
                        <span>{opp.playerAvatar}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{opp.playerName}</p>
                        <p className="text-[10px] text-zinc-400">
                          {opp.guessesUsed}/{opp.maxGuesses} guesses
                        </p>
                      </div>
                    </div>

                    <div>
                      {opp.isSolved ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                          Solved 🟩
                        </span>
                      ) : opp.isFinished ? (
                        <span className="inline-flex items-center rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                          Finished ⬛
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                          Guessing...
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ROUND SCORES (Shown during reveal) */}
          {isReveal && state.roundScores && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl backdrop-blur-md">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-400" />
                <span>Round Points</span>
              </h3>

              <div className="space-y-2">
                {Object.entries(state.roundScores)
                  .sort((a, b) => b[1].points - a[1].points)
                  .map(([pid, rScore]) => {
                    const p = party.players[pid];
                    if (!p) return null;
                    return (
                      <div
                        key={pid}
                        className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-2.5"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-mono font-bold text-zinc-400">#{rScore.rank}</span>
                          <span className="text-sm">{p.avatar}</span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white truncate block">{p.name}</span>
                            <span className="text-[10px] text-zinc-500">{rScore.reason}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-400">+{rScore.points} pts</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ALL BOARDS COMPARISON (Shown during reveal) */}
          {isReveal && state.allFinalBoards && Object.keys(state.allFinalBoards).length > 1 && (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl backdrop-blur-md space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                All Players' Boards
              </h3>

              <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                {Object.entries(state.allFinalBoards).map(([pid, board]) => (
                  <div key={pid} className="rounded-xl border border-zinc-850 bg-zinc-900/40 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-white">
                        <span>{board.playerAvatar}</span>
                        <span>{board.playerName}</span>
                      </span>
                      <span className={board.isSolved ? 'text-emerald-400' : 'text-zinc-500'}>
                        {board.isSolved ? `${board.guesses.length}/6 Solved` : 'X/6'}
                      </span>
                    </div>

                    {/* Mini board tiles */}
                    <div className="space-y-1">
                      {board.guesses.map((g, gIdx) => (
                        <div key={gIdx} className="flex gap-1 justify-start">
                          {g.evaluations.map((ev, lIdx) => (
                            <div
                              key={lIdx}
                              className={`h-5 w-5 rounded text-[10px] flex items-center justify-center font-bold text-white ${
                                ev === 'correct'
                                  ? 'bg-emerald-600'
                                  : ev === 'present'
                                  ? 'bg-amber-500'
                                  : 'bg-zinc-700'
                              }`}
                            >
                              {g.word[lIdx]}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
