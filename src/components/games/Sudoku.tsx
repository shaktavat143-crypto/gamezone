import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Trophy, 
  Clock, 
  Eraser, 
  PenTool, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  Eye, 
  Medal,
  Flag,
  Zap,
  Trash2,
  Check,
  StopCircle
} from 'lucide-react';
import { 
  ClientPartyView, 
  SudokuRoundData, 
  SudokuPlayerState, 
  SudokuOpponentProgress 
} from '../../types.js';
import { socketService } from '../../services/socket.js';
import { soundService } from '../../services/sound.js';
import { PlayerAvatar } from '../PlayerAvatar.js';

interface SudokuProps {
  party: ClientPartyView;
}

export const Sudoku: React.FC<SudokuProps> = ({ party }) => {
  const gameState = party.gameState as (SudokuRoundData & {
    myState?: SudokuPlayerState;
    opponentsProgress?: SudokuOpponentProgress[];
    revealedSolution?: number[][];
    allFinalBoards?: Record<string, {
      playerName: string;
      playerAvatar: string;
      playerColor: string;
      board: number[][];
      isSolved: boolean;
      mistakes: number;
      score: number;
    }>;
  });

  const myPlayerId = party.myPlayerId;
  const myState = gameState?.myState || (gameState?.players && myPlayerId ? gameState.players[myPlayerId] : null);
  const isPlaying = gameState?.phase === 'playing' && party.gameStatus === 'in_game';
  const isReveal = gameState?.phase === 'reveal' || party.gameStatus === 'round_reveal';

  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 0]);
  const [isNotesMode, setIsNotesMode] = useState<boolean>(false);
  const [activeInspectPlayerId, setActiveInspectPlayerId] = useState<string | null>(null);
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);

  const isGameOverFromMistakes = Boolean((myState && myState.mistakes >= 3) || myState?.failedDueToMistakes);
  const isControlsDisabled = !isPlaying || !myState || myState.isFinished || isGameOverFromMistakes;

  // Audio cue when mistakes increase
  const prevMistakesRef = useRef<number>(myState?.mistakes || 0);
  useEffect(() => {
    if (myState && myState.mistakes > prevMistakesRef.current) {
      soundService.playWrong();
    }
    if (myState) {
      prevMistakesRef.current = myState.mistakes;
    }
  }, [myState?.mistakes]);

  // Elapsed time tracker for stopwatch
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    if (!gameState?.roundStartTime || !isPlaying) return;
    const interval = setInterval(() => {
      const sec = Math.max(0, Math.floor((Date.now() - gameState.roundStartTime) / 1000));
      setElapsedSeconds(sec);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState?.roundStartTime, isPlaying]);

  // Find first empty cell on game start
  useEffect(() => {
    if (myState && selectedCell === null) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (!myState.initialClues[r]?.[c]) {
            setSelectedCell([r, c]);
            return;
          }
        }
      }
      setSelectedCell([0, 0]);
    }
  }, [myState]);

  // Digits count remaining (1 through 9)
  const remainingCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 9, 7: 9, 8: 9, 9: 9 };
    if (!myState?.board) return counts;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = myState.board[r][c];
        if (val >= 1 && val <= 9) {
          counts[val] = Math.max(0, counts[val] - 1);
        }
      }
    }
    return counts;
  }, [myState?.board]);

  // Duplicate conflict detection across rows, columns, and 3x3 blocks
  const conflictCells = useMemo(() => {
    const conflicts = new Set<string>();
    if (!myState?.board) return conflicts;
    const board = myState.board;

    // Check rows
    for (let r = 0; r < 9; r++) {
      const seen: Record<number, number[]> = {};
      for (let c = 0; c < 9; c++) {
        const val = board[r][c];
        if (val >= 1 && val <= 9) {
          if (!seen[val]) seen[val] = [];
          seen[val].push(c);
        }
      }
      Object.values(seen).forEach((cols) => {
        if (cols.length > 1) {
          cols.forEach((c) => conflicts.add(`${r}-${c}`));
        }
      });
    }

    // Check columns
    for (let c = 0; c < 9; c++) {
      const seen: Record<number, number[]> = {};
      for (let r = 0; r < 9; r++) {
        const val = board[r][c];
        if (val >= 1 && val <= 9) {
          if (!seen[val]) seen[val] = [];
          seen[val].push(r);
        }
      }
      Object.values(seen).forEach((rows) => {
        if (rows.length > 1) {
          rows.forEach((r) => conflicts.add(`${r}-${c}`));
        }
      });
    }

    // Check 3x3 boxes
    for (let boxR = 0; boxR < 3; boxR++) {
      for (let boxC = 0; boxC < 3; boxC++) {
        const seen: Record<number, [number, number][]> = {};
        for (let r = boxR * 3; r < boxR * 3 + 3; r++) {
          for (let c = boxC * 3; c < boxC * 3 + 3; c++) {
            const val = board[r][c];
            if (val >= 1 && val <= 9) {
              if (!seen[val]) seen[val] = [];
              seen[val].push([r, c]);
            }
          }
        }
        Object.values(seen).forEach((cells) => {
          if (cells.length > 1) {
            cells.forEach(([r, c]) => conflicts.add(`${r}-${c}`));
          }
        });
      }
    }

    return conflicts;
  }, [myState?.board]);

  // Handle cell click
  const handleSelectCell = (r: number, c: number) => {
    setSelectedCell([r, c]);
    soundService.playClick();
  };

  // Perform a move
  const handleInputNumber = useCallback((val: number) => {
    if (isControlsDisabled || !selectedCell) return;
    const [r, c] = selectedCell;
    if (myState.initialClues[r]?.[c]) return;

    if (isNotesMode) {
      soundService.playClick();
      socketService.sendGameAction('sudoku_move', { row: r, col: c, value: val, isNote: true });
    } else {
      socketService.sendGameAction('sudoku_move', { row: r, col: c, value: val, isNote: false });
      soundService.playClick();
    }
  }, [isControlsDisabled, myState, selectedCell, isNotesMode]);

  // Handle erase
  const handleErase = useCallback(() => {
    if (isControlsDisabled || !selectedCell) return;
    const [r, c] = selectedCell;
    if (myState.initialClues[r]?.[c]) return;

    socketService.sendGameAction('sudoku_erase', { row: r, col: c });
    soundService.playClick();
  }, [isControlsDisabled, myState, selectedCell]);

  // Handle clear cell notes
  const handleClearCellNotes = useCallback(() => {
    if (isControlsDisabled || !selectedCell) return;
    const [r, c] = selectedCell;
    socketService.sendGameAction('sudoku_clear_notes', { row: r, col: c });
    soundService.playClick();
  }, [isControlsDisabled, selectedCell]);

  // Handle reset board
  const handleRestart = useCallback(() => {
    if (isControlsDisabled) return;
    socketService.sendGameAction('sudoku_restart');
    soundService.playClick();
  }, [isControlsDisabled]);

  // Handle finish individual player board
  const handleFinishMyBoard = useCallback(() => {
    if (!isPlaying || !myState || myState.isFinished) return;
    setShowFinishConfirm(false);
    socketService.sendGameAction('sudoku_finish');
    soundService.playCorrect();
  }, [isPlaying, myState]);

  // Anyone can finish game for all players at any position!
  const handleEndGameForAll = useCallback(() => {
    if (!isPlaying) return;
    setShowFinishConfirm(false);
    socketService.sendGameAction('sudoku_end_game');
    soundService.playCorrect();
  }, [isPlaying]);

  // Keyboard navigation & inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

      if (!isPlaying || !myState) return;

      // Arrow navigation is always available for inspection
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'].includes(e.key)) {
        e.preventDefault();
        setSelectedCell((prev) => {
          const [r, c] = prev || [0, 0];
          if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
            return [Math.max(0, r - 1), c];
          }
          if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
            return [Math.min(8, r + 1), c];
          }
          if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
            return [r, Math.max(0, c - 1)];
          }
          if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
            return [r, Math.min(8, c + 1)];
          }
          return [r, c];
        });
        return;
      }

      // Board modifications are blocked when finished or eliminated
      if (isControlsDisabled) return;

      // Numbers 1-9
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault();
        handleInputNumber(parseInt(e.key, 10));
        return;
      }

      // Erase
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        e.preventDefault();
        handleErase();
        return;
      }

      // Notes mode toggle
      if (e.key.toLowerCase() === 'n' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsNotesMode((prev) => !prev);
        soundService.playClick();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, myState, isControlsDisabled, handleInputNumber, handleErase]);

  // Value of currently selected cell
  const selectedValue = selectedCell && myState?.board ? myState.board[selectedCell[0]][selectedCell[1]] : 0;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const opponentList = gameState?.opponentsProgress || [];
  const isMultiplayer = opponentList.length > 0;

  // Render cell
  const renderCell = (
    r: number, 
    c: number, 
    board: number[][], 
    initialClues: boolean[][], 
    notes: number[][][] = []
  ) => {
    const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
    const isSameRowOrCol = selectedCell && (selectedCell[0] === r || selectedCell[1] === c);
    const isSameBox = selectedCell && (Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) && Math.floor(selectedCell[1] / 3) === Math.floor(c / 3));
    const cellValue = board[r]?.[c] || 0;
    const isSameNumber = cellValue > 0 && cellValue === selectedValue;
    const isClue = Boolean(initialClues[r]?.[c]);
    const cellNotes = notes[r]?.[c] || [];
    const isConflict = conflictCells.has(`${r}-${c}`);

    // Box boundary styling for 3x3 thick borders
    const isRightBoxBorder = (c === 2 || c === 5);
    const isBottomBoxBorder = (r === 2 || r === 5);

    let bgClass = 'bg-zinc-900/90 hover:bg-zinc-800/80 text-zinc-200';
    if (isSelected) {
      bgClass = isConflict 
        ? 'bg-rose-500/25 ring-2 ring-rose-400 z-10' 
        : 'bg-sky-500/30 ring-2 ring-sky-400 shadow-lg shadow-sky-500/20 z-10';
    } else if (isConflict) {
      bgClass = 'bg-rose-950/50 text-rose-300 ring-1 ring-rose-500/50';
    } else if (isSameNumber) {
      bgClass = 'bg-sky-500/25 font-black text-sky-200';
    } else if (isSameRowOrCol || isSameBox) {
      bgClass = 'bg-zinc-800/60 text-zinc-300';
    }

    return (
      <button
        key={`${r}-${c}`}
        type="button"
        onClick={() => handleSelectCell(r, c)}
        className={`relative aspect-square flex items-center justify-center text-lg sm:text-2xl font-bold transition-all cursor-pointer select-none ${bgClass} ${
          isRightBoxBorder ? 'border-r-2 sm:border-r-3 border-r-sky-400/70' : 'border-r border-r-zinc-800/80'
        } ${
          isBottomBoxBorder ? 'border-b-2 sm:border-b-3 border-b-sky-400/70' : 'border-b border-b-zinc-800/80'
        } ${c === 0 ? 'border-l border-l-zinc-800' : ''} ${r === 0 ? 'border-t border-t-zinc-800' : ''}`}
        aria-label={`Row ${r + 1} Col ${c + 1} ${cellValue ? 'value ' + cellValue : 'empty'}`}
      >
        {cellValue > 0 ? (
          <span
            className={`${
              isConflict
                ? 'font-black text-rose-400'
                : isClue
                ? 'font-black text-white'
                : 'font-extrabold text-sky-400'
            }`}
          >
            {cellValue}
          </span>
        ) : (
          /* Render pencil notes in standard 3x3 layout */
          cellNotes.length > 0 && (
            <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5 pointer-events-none">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const hasNote = cellNotes.includes(num);
                const isHighlight = hasNote && selectedValue === num;
                return (
                  <span
                    key={num}
                    className={`flex items-center justify-center text-[8px] sm:text-[10px] leading-none font-semibold ${
                      hasNote
                        ? isHighlight
                          ? 'text-sky-300 font-black bg-sky-500/20 rounded-full'
                          : 'text-zinc-400'
                        : 'text-transparent'
                    }`}
                  >
                    {hasNote ? num : ''}
                  </span>
                );
              })}
            </div>
          )
        )}

        {/* Small conflict warning dot indicator */}
        {isConflict && cellValue > 0 && (
          <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/80 pointer-events-none" />
        )}
      </button>
    );
  };

  // ----------------------------------------------------
  // RESULTS / REVEAL PHASE VIEW (Refined Marking Breakdown)
  // ----------------------------------------------------
  if (isReveal) {
    const roundScores = gameState?.roundScores || {};
    const rankedIds = Object.keys(roundScores).sort(
      (a, b) => (roundScores[a]?.rank || 999) - (roundScores[b]?.rank || 999)
    );
    const inspectedPlayerId = activeInspectPlayerId || myPlayerId || rankedIds[0];
    const inspectedBoard = inspectedPlayerId === 'solution'
      ? gameState.revealedSolution
      : gameState.allFinalBoards?.[inspectedPlayerId]?.board || myState?.board;

    const myScoreData = myPlayerId ? roundScores[myPlayerId] : null;

    return (
      <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
        {/* Victory / Completion Banner */}
        <div className="rounded-3xl border border-sky-500/40 bg-zinc-950 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Sudoku Round Results
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Difficulty: <span className="capitalize font-semibold text-sky-400">{gameState.difficulty}</span>
                  {myScoreData?.completionTimeMs && (
                    <> · Finished in {Math.floor(myScoreData.completionTimeMs / 1000)}s</>
                  )}
                </p>
              </div>
            </div>

            {/* My Score Badge */}
            {myScoreData && (
              <div className="flex items-center gap-3 bg-sky-950/60 border border-sky-500/40 px-5 py-2.5 rounded-2xl">
                <Medal className="h-6 w-6 text-amber-400" />
                <div className="text-right">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Your Final Score</div>
                  <div className="text-xl font-black text-white font-mono">
                    +{myScoreData.points} pts
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Refined Marking System Breakdown (For Current Player) */}
          {myScoreData && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-zinc-800/80">
              <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-3">
                <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Cells Solved</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  +{myScoreData.cellPoints || 0} pts
                </div>
                <div className="text-[10px] text-zinc-500">
                  {myScoreData.solvedCellsCount}/{myScoreData.totalCellsToSolve} cells
                </div>
              </div>

              <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-3">
                <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Completion Bonus</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  +{myScoreData.completionBonus || 0} pts
                </div>
                <div className="text-[10px] text-zinc-500">
                  {myScoreData.isSolved ? 'Completed puzzle' : 'Partial finish'}
                </div>
              </div>

              <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-3">
                <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-sky-400" />
                  <span>Speed Bonus</span>
                </div>
                <div className="text-base font-black text-white mt-1">
                  +{myScoreData.speedBonus || 0} pts
                </div>
                <div className="text-[10px] text-zinc-500">
                  {myScoreData.completionTimeMs ? `${Math.floor(myScoreData.completionTimeMs / 1000)}s` : 'N/A'}
                </div>
              </div>

              <div className="rounded-xl bg-zinc-900/70 border border-zinc-800 p-3">
                <div className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                  <span>Mistake Penalties</span>
                </div>
                <div className="text-base font-black text-rose-400 mt-1">
                  -{myScoreData.mistakePenalty || 0} pts
                </div>
                <div className="text-[10px] text-zinc-500">
                  {myScoreData.mistakes} errors (-15 pts each)
                </div>
              </div>
            </div>
          )}

          {/* Standings Table with Refined Marking */}
          <div className="mt-6 divide-y divide-zinc-800/80 rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            {rankedIds.map((pid, idx) => {
              const p = party.players[pid];
              const scoreData = roundScores[pid];
              const isMe = pid === myPlayerId;
              const solvedPct = scoreData?.totalCellsToSolve 
                ? Math.min(100, Math.round((scoreData.solvedCellsCount / scoreData.totalCellsToSolve) * 100))
                : 0;

              return (
                <div
                  key={pid}
                  className={`flex flex-wrap items-center justify-between p-3 sm:p-4 gap-3 ${
                    isMe ? 'bg-sky-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                        idx === 0
                          ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/30'
                          : idx === 1
                          ? 'bg-zinc-300 text-zinc-950'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {idx + 1}
                    </span>

                    {p && (
                      <PlayerAvatar
                        avatar={p.avatar}
                        color={p.color}
                        size="sm"
                        showCrown={p.isHost}
                      />
                    )}

                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>{p?.name || 'Player'}</span>
                        {isMe && (
                          <span className="text-[10px] rounded bg-sky-500/20 px-1.5 py-0.5 text-sky-400 font-semibold">
                            You
                          </span>
                        )}
                        {(scoreData?.mistakes >= 3 || scoreData?.failedDueToMistakes) && (
                          <span className="text-[10px] rounded bg-rose-500/20 border border-rose-500/30 px-1.5 py-0.5 text-rose-300 font-bold">
                            3/3 Mistakes · Game Over
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-400 flex items-center gap-2">
                        <span>{scoreData?.reason || (scoreData?.isSolved ? 'Solved successfully!' : 'Finished early')}</span>
                        <span className="text-zinc-600">·</span>
                        <span className="font-semibold text-zinc-300">{solvedPct}% coverage</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-base font-black text-sky-400 font-mono">
                        +{scoreData?.points || 0} pts
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        {scoreData?.mistakes || 0} mistakes · {scoreData?.solvedCellsCount || 0} cells
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Board Inspector / Solution Viewer */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="h-4 w-4 text-sky-400" />
              <span>Review Boards & Solution</span>
            </h3>

            {/* Toggle board pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setActiveInspectPlayerId(myPlayerId || null)}
                className={`h-9 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  inspectedPlayerId === myPlayerId
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <span>My Board</span>
              </button>

              {Object.entries(gameState.allFinalBoards || {}).map(([pid, bData]) => {
                if (pid === myPlayerId) return null;
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => setActiveInspectPlayerId(pid)}
                    className={`h-9 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      inspectedPlayerId === pid
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{bData.playerName}</span>
                  </button>
                );
              })}

              {gameState.revealedSolution && (
                <button
                  type="button"
                  onClick={() => setActiveInspectPlayerId('solution')}
                  className={`h-9 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    inspectedPlayerId === 'solution'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-zinc-800 text-zinc-400 hover:text-emerald-300'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Master Solution</span>
                </button>
              )}
            </div>
          </div>

          {/* Render 9x9 Review Board */}
          <div className="max-w-md mx-auto aspect-square rounded-2xl border-2 border-zinc-700 bg-zinc-950 p-1 shadow-2xl">
            <div className="grid grid-cols-9 grid-rows-9 w-full h-full rounded-xl overflow-hidden">
              {Array.from({ length: 9 }).map((_, r) =>
                Array.from({ length: 9 }).map((_, c) => {
                  const val = inspectedBoard?.[r]?.[c] || 0;
                  const isClue = Boolean(gameState.initialBoard?.[r]?.[c]);
                  const isRightBoxBorder = (c === 2 || c === 5);
                  const isBottomBoxBorder = (r === 2 || r === 5);

                  return (
                    <div
                      key={`rev-${r}-${c}`}
                      className={`flex items-center justify-center text-sm sm:text-base font-bold select-none border-zinc-800 bg-zinc-900/60 ${
                        isRightBoxBorder ? 'border-r-2 border-r-sky-500/50' : 'border-r'
                      } ${
                        isBottomBoxBorder ? 'border-b-2 border-b-sky-500/50' : 'border-b'
                      } ${
                        isClue
                          ? 'text-zinc-100 font-black'
                          : inspectedPlayerId === 'solution'
                          ? 'text-emerald-400'
                          : 'text-sky-400'
                      }`}
                    >
                      {val > 0 ? val : ''}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ACTIVE GAMEPLAY VIEW
  // ----------------------------------------------------
  if (!myState) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400">
        Waiting for puzzle initialization...
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Status & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4 shadow-lg">
        {/* Left: Difficulty Badge & Timer */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded-xl bg-sky-500/20 border border-sky-500/30 px-2.5 py-1 text-xs font-bold text-sky-400 uppercase tracking-wider">
            {gameState.difficulty}
          </span>

          <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-1 text-xs font-mono font-bold text-zinc-200 border border-zinc-800">
            <Clock className="h-3.5 w-3.5 text-sky-400" />
            <span>{party.roundTimeRemaining > 0 ? `${party.roundTimeRemaining}s left` : formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Center/Right: Progress & Mistakes */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
          {/* Solved Progress Counter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              Progress: <strong className="text-white">{myState.solvedCellsCount}/{myState.totalCellsToSolve}</strong>
            </span>
          </div>

          {/* Mistakes Counter */}
          <div
            id="sudoku-mistakes-counter"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-all ${
              myState.mistakes >= 3
                ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-md shadow-rose-950/50'
                : myState.mistakes === 2
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/70 animate-pulse'
                : myState.mistakes === 1
                ? 'bg-rose-950/40 text-rose-300 border-rose-500/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
            title="Sudoku ends after 3 mistakes"
          >
            <AlertTriangle className={`h-3.5 w-3.5 ${myState.mistakes >= 2 ? 'text-rose-400 animate-bounce' : 'text-rose-400'}`} />
            <span className="text-xs font-semibold">
              Mistakes: <strong className={myState.mistakes >= 3 ? 'text-rose-400 font-black' : myState.mistakes === 2 ? 'text-amber-300 font-bold' : 'text-white font-bold'}>{myState.mistakes}/3</strong>
            </span>
          </div>

          {/* Instant Finish Action: Anyone can finish game at any position */}
          {!myState.isFinished ? (
            <button
              type="button"
              onClick={() => setShowFinishConfirm(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer active:scale-95"
              title="Finish game at your current position"
            >
              <Flag className="h-3.5 w-3.5 text-amber-400" />
              <span>Finish Game</span>
            </button>
          ) : isGameOverFromMistakes ? (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
              <span>Game Over (3 Mistakes)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <Check className="h-3.5 w-3.5" />
              <span>Board Submitted</span>
            </span>
          )}
        </div>
      </div>

      {/* When player is finished early or game over from 3 mistakes */}
      {myState.isFinished && (
        isGameOverFromMistakes ? (
          <div className="rounded-2xl border border-rose-500/60 bg-rose-950/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl backdrop-blur-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-rose-200 flex items-center gap-2">
                  <span>Game Over — 3 Mistakes Reached!</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-bold">
                    3/3 Mistakes
                  </span>
                </div>
                <div className="text-xs text-zinc-300 mt-0.5">
                  You reached the 3-mistake limit. Your Sudoku game has ended and your board is locked ({myState.solvedCellsCount}/{myState.totalCellsToSolve} cells solved).
                </div>
              </div>
            </div>

            {/* Option to end game for all immediately without waiting */}
            <button
              type="button"
              onClick={handleEndGameForAll}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
            >
              <StopCircle className="h-4 w-4" />
              <span>End Match for Everyone</span>
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Your board is locked in!</div>
                <div className="text-xs text-zinc-400">
                  You solved {myState.solvedCellsCount}/{myState.totalCellsToSolve} cells ({Math.min(100, Math.round((myState.solvedCellsCount / myState.totalCellsToSolve) * 100))}%)
                </div>
              </div>
            </div>

            {/* Option to end game for all immediately without waiting */}
            <button
              type="button"
              onClick={handleEndGameForAll}
              className="flex items-center gap-2 h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer shadow-md active:scale-95 whitespace-nowrap"
            >
              <StopCircle className="h-4 w-4" />
              <span>End Match for Everyone</span>
            </button>
          </div>
        )
      )}

      {/* Multiplayer Live Race Track (Shown when 2+ players) */}
      {isMultiplayer && (
        <div className="rounded-2xl border border-sky-500/30 bg-zinc-950 p-3 sm:p-4">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-300 mb-2.5">
            <span className="flex items-center gap-1.5 text-sky-400">
              <Users className="h-4 w-4" />
              <span>Live Multiplayer Race</span>
            </span>
            <span className="text-zinc-500 font-normal">Real-time opponent progress</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {/* My progress card */}
            <div className="flex items-center justify-between rounded-xl bg-sky-950/30 border border-sky-500/40 p-2.5">
              <div className="flex items-center gap-2">
                <span className="text-sm">👤</span>
                <div className="leading-tight">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>You</span>
                    {myState.isSolved && <span className="text-amber-400">🏆</span>}
                    {myState.isFinished && !myState.isSolved && <span className="text-emerald-400">✓</span>}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {myState.isSolved
                      ? 'Solved!'
                      : myState.isFinished
                      ? 'Finished position'
                      : `${myState.solvedCellsCount}/${myState.totalCellsToSolve} solved`}
                  </div>
                </div>
              </div>

              <div className="w-20 sm:w-24">
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((myState.solvedCellsCount / (myState.totalCellsToSolve || 1)) * 100)
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Opponents' progress cards */}
            {opponentList.map((opp) => (
              <div
                key={opp.playerId}
                className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <PlayerAvatar
                    avatar={opp.playerAvatar}
                    color={opp.playerColor}
                    size="xs"
                  />
                  <div className="leading-tight">
                    <div className="text-xs font-bold text-zinc-200 flex items-center gap-1 truncate max-w-[90px]">
                      <span>{opp.playerName}</span>
                      {opp.isSolved && <span className="text-amber-400">🏆</span>}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {opp.isSolved
                        ? 'Solved!'
                        : opp.failedDueToMistakes || opp.mistakes >= 3
                        ? '3/3 Mistakes (Out)'
                        : opp.isFinished
                        ? 'Submitted'
                        : `${opp.solvedPercent}% · ${opp.mistakes}/3 errors`}
                    </div>
                  </div>
                </div>

                <div className="w-20 sm:w-24">
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        opp.isSolved ? 'bg-amber-400' : 'bg-violet-500'
                      }`}
                      style={{ width: `${opp.solvedPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Game Interface: Sudoku Grid + Controls */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* Sudoku 9x9 Board */}
        <div className="w-full max-w-[420px] sm:max-w-[480px] aspect-square rounded-3xl border-2 sm:border-3 border-sky-500/50 bg-zinc-950 p-2 shadow-2xl relative">
          <div className="grid grid-cols-9 grid-rows-9 w-full h-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
            {Array.from({ length: 9 }).map((_, r) =>
              Array.from({ length: 9 }).map((_, c) =>
                renderCell(r, c, myState.board, myState.initialClues, myState.notes)
              )
            )}
          </div>

          {/* Locked overlay if 3 mistakes */}
          {isGameOverFromMistakes && (
            <div className="absolute inset-2 rounded-2xl bg-zinc-950/80 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 z-20 text-center pointer-events-none">
              <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-2 shadow-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="text-base font-black text-rose-300">Game Over</div>
              <div className="text-xs text-zinc-300 max-w-[220px] mt-1">
                You reached 3 mistakes. Board locked.
              </div>
            </div>
          )}
        </div>

        {/* Right Side / Bottom: Controls Panel */}
        <div className="w-full max-w-[420px] sm:max-w-[480px] lg:max-w-xs space-y-4">
          {/* Action Tools: Notes toggle, Erase, Clear Cell Notes */}
          <div className="grid grid-cols-3 gap-2">
            {/* Notes Mode Toggle Button */}
            <button
              type="button"
              disabled={isControlsDisabled}
              onClick={() => {
                setIsNotesMode((prev) => !prev);
                soundService.playClick();
              }}
              className={`h-14 min-h-[44px] rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                isControlsDisabled
                  ? 'opacity-40 bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                  : isNotesMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-800'
              }`}
              title="Toggle pencil notes mode (N or P)"
            >
              <div className="flex items-center gap-1">
                <PenTool className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {isNotesMode ? 'ON' : 'OFF'}
                </span>
              </div>
              <span className="text-[11px]">Pencil Notes</span>
            </button>

            {/* Erase Cell Button */}
            <button
              type="button"
              disabled={isControlsDisabled}
              onClick={handleErase}
              className={`h-14 min-h-[44px] rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                isControlsDisabled
                  ? 'opacity-40 bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
              }`}
              title="Erase selected cell (Backspace)"
            >
              <Eraser className="h-4 w-4 text-rose-400" />
              <span className="text-[11px]">Erase</span>
            </button>

            {/* Clear Notes for Selected Cell */}
            <button
              type="button"
              disabled={isControlsDisabled}
              onClick={handleClearCellNotes}
              className={`h-14 min-h-[44px] rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                isControlsDisabled
                  ? 'opacity-40 bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800'
              }`}
              title="Clear all candidate notes in this cell"
            >
              <Trash2 className="h-4 w-4 text-zinc-400" />
              <span className="text-[11px]">Clear Notes</span>
            </button>
          </div>

          {/* Digits Pad 1-9 */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const remaining = remainingCounts[num] || 0;
                const isExhausted = remaining === 0;
                const isDisabled = isControlsDisabled || isExhausted;

                return (
                  <button
                    key={num}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleInputNumber(num)}
                    className={`h-14 min-h-[44px] rounded-2xl font-black text-xl flex flex-col items-center justify-center transition cursor-pointer active:scale-95 border ${
                      isDisabled
                        ? 'opacity-30 bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed'
                        : isNotesMode
                        ? 'bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 border-amber-500/30'
                        : 'bg-zinc-900 hover:bg-sky-950/40 text-white hover:text-sky-400 border-zinc-800 hover:border-sky-500/40 shadow-sm'
                    }`}
                  >
                    <span>{num}</span>
                    <span className="text-[9px] font-semibold text-zinc-500 -mt-1">
                      {isExhausted ? '✓' : `${remaining} left`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary Actions: Reset Board, Finish Board at Any Position */}
          <div className="flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              disabled={isControlsDisabled}
              onClick={handleRestart}
              className={`flex items-center gap-1.5 text-xs transition py-1 ${
                isControlsDisabled
                  ? 'text-zinc-600 cursor-not-allowed'
                  : 'text-zinc-400 hover:text-zinc-200 cursor-pointer'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset My Board</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFinishConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-amber-400/90 hover:text-amber-300 transition cursor-pointer py-1 font-semibold"
            >
              <Flag className="h-3.5 w-3.5" />
              <span>Finish Game</span>
            </button>
          </div>
        </div>
      </div>

      {/* Finish Game Modal (Allows finishing at any position for self or all) */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Flag className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Finish Game</h3>
                <p className="text-xs text-zinc-400">
                  You can lock in your board at any position.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-950 p-3.5 border border-zinc-800 space-y-1 text-xs">
              <div className="text-zinc-300 font-semibold">Your Current Position:</div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Cells Solved:</span>
                <span className="text-white font-bold">{myState.solvedCellsCount} / {myState.totalCellsToSolve}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Mistakes Recorded:</span>
                <span className="text-rose-400 font-bold">{myState.mistakes}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>Elapsed Time:</span>
                <span className="text-sky-400 font-bold font-mono">{formatTime(elapsedSeconds)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleFinishMyBoard}
                className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <Check className="h-4 w-4" />
                <span>Submit My Board Position</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFinishConfirm(false)}
                className="w-full h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition cursor-pointer"
              >
                Keep Playing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
