export type WordleTileStatus = 'correct' | 'present' | 'absent' | 'empty';

/**
 * Standard two-pass Wordle evaluation algorithm:
 * Pass 1: Mark exact matches GREEN ('correct') and decrement the target letter frequency.
 * Pass 2: Mark misplaced letters YELLOW ('present') if remaining frequency > 0, otherwise GRAY ('absent').
 * 
 * Handles duplicate letters with mathematical correctness.
 */
export function evaluateWordleGuess(guess: string, target: string): WordleTileStatus[] {
  const g = guess.trim().toUpperCase();
  const t = target.trim().toUpperCase();

  if (g.length !== 5 || t.length !== 5) {
    throw new Error(`Wordle guess and target must both be exactly 5 letters. Got guess="${g}" (len ${g.length}), target="${t}" (len ${t.length})`);
  }

  const result: WordleTileStatus[] = new Array(5).fill('absent');
  const targetLetterCounts: Record<string, number> = {};

  // Pass 1: Find all exact matches (GREEN)
  for (let i = 0; i < 5; i++) {
    if (g[i] === t[i]) {
      result[i] = 'correct';
    } else {
      const char = t[i];
      targetLetterCounts[char] = (targetLetterCounts[char] || 0) + 1;
    }
  }

  // Pass 2: Find misplaced letters (YELLOW) from remaining unmatched letter budget
  for (let i = 0; i < 5; i++) {
    if (result[i] !== 'correct') {
      const char = g[i];
      if (targetLetterCounts[char] && targetLetterCounts[char] > 0) {
        result[i] = 'present';
        targetLetterCounts[char]--;
      } else {
        result[i] = 'absent';
      }
    }
  }

  return result;
}

/**
 * Update virtual keyboard statuses based on newly evaluated guess.
 * Status priority: 'correct' (green) > 'present' (yellow) > 'absent' (gray).
 * Once a letter is green, it never downgrades to yellow or gray.
 * Once a letter is yellow, it can upgrade to green, but never downgrade to gray.
 */
export function updateKeyboardStatus(
  currentKeyboard: Record<string, WordleTileStatus>,
  guess: string,
  evaluations: WordleTileStatus[]
): Record<string, WordleTileStatus> {
  const updated: Record<string, WordleTileStatus> = { ...currentKeyboard };
  const g = guess.trim().toUpperCase();

  for (let i = 0; i < 5; i++) {
    const char = g[i];
    const newStatus = evaluations[i];
    const prevStatus = updated[char];

    if (!prevStatus) {
      updated[char] = newStatus;
    } else if (prevStatus === 'correct') {
      // Already at highest priority, keep it
      continue;
    } else if (prevStatus === 'present') {
      // Can only upgrade to correct
      if (newStatus === 'correct') {
        updated[char] = 'correct';
      }
    } else if (prevStatus === 'absent') {
      // Can upgrade to present or correct
      if (newStatus === 'correct' || newStatus === 'present') {
        updated[char] = newStatus;
      }
    }
  }

  return updated;
}
