// Server-side authoritative validation for Word Battle submissions
import {
  ANIMAL_DATASET,
  FOOD_AND_DRINK_DATASET,
  CLOTHING_AND_ACCESSORY_DATASET,
  SPORT_AND_GAME_DATASET,
  JOB_AND_PROFESSION_DATASET,
  KITCHEN_ITEM_DATASET,
  EVERYDAY_OBJECT_DATASET,
  SUPERPOWER_AND_SPELL_DATASET,
  COUNTRY_AND_CITY_DATASET,
  BRAND_AND_COMPANY_DATASET,
  MOVIE_AND_TV_DATASET,
  CELEBRITY_AND_CHARACTER_DATASET
} from '../data/wordBattleCategories.js';

export interface WordBattleValidationResult {
  valid: boolean;
  reason?: 'WRONG_STARTING_LETTER' | 'INVALID_WORD' | 'NOT_IN_CATEGORY' | 'CATEGORY_MISMATCH' | 'TOO_SHORT';
  details?: string;
}

// Map category search terms to dataset references
function getCategoryDataset(categoryName: string): { dataset: Set<string>; name: string } | null {
  const cat = categoryName.toLowerCase().trim();

  if (cat.includes('animal')) {
    return { dataset: ANIMAL_DATASET, name: 'Animal' };
  }
  if (cat.includes('food') || cat.includes('drink')) {
    return { dataset: FOOD_AND_DRINK_DATASET, name: 'Food or Drink' };
  }
  if (cat.includes('cloth') || cat.includes('accessory')) {
    return { dataset: CLOTHING_AND_ACCESSORY_DATASET, name: 'Clothing or Accessory' };
  }
  if (cat.includes('sport') || cat.includes('game')) {
    return { dataset: SPORT_AND_GAME_DATASET, name: 'Sport or Game' };
  }
  if (cat.includes('job') || cat.includes('profession')) {
    return { dataset: JOB_AND_PROFESSION_DATASET, name: 'Job or Profession' };
  }
  if (cat.includes('kitchen')) {
    return { dataset: KITCHEN_ITEM_DATASET, name: 'Kitchen Item' };
  }
  if (cat.includes('everyday') || cat.includes('object')) {
    return { dataset: EVERYDAY_OBJECT_DATASET, name: 'Everyday Object' };
  }
  if (cat.includes('superpower') || cat.includes('spell')) {
    return { dataset: SUPERPOWER_AND_SPELL_DATASET, name: 'Superpower or Spell' };
  }
  if (cat.includes('country') || cat.includes('city')) {
    return { dataset: COUNTRY_AND_CITY_DATASET, name: 'Country or City' };
  }
  if (cat.includes('brand') || cat.includes('company')) {
    return { dataset: BRAND_AND_COMPANY_DATASET, name: 'Brand or Company' };
  }
  if (cat.includes('movie') || cat.includes('show') || cat.includes('tv')) {
    return { dataset: MOVIE_AND_TV_DATASET, name: 'Movie or TV Show' };
  }
  if (cat.includes('celebrity') || cat.includes('character')) {
    return { dataset: CELEBRITY_AND_CHARACTER_DATASET, name: 'Celebrity or Character' };
  }

  return null;
}

// Known spam clusters that should never pass validation
const KEYBOARD_SPAM_PATTERNS = [
  /^[asdfghjkl]+$/i,
  /^[qwertyuiop]+$/i,
  /^[zxcvbnm]+$/i,
  /^[1234567890]+$/,
  /(.)\1{2,}/i, // 3+ identical characters in a row: aaa, bbb, zzz, sss
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i,
  /^[bcdfghjklmnpqrstvwxz]{4,}$/i // 4+ consecutive consonants without vowel/acronym
];

const VALID_SHORT_ACRONYMS = new Set(['UK', 'US', 'USA', 'UAE', 'NYC', 'LA', 'EU', 'UN', 'BMW', 'KFC', 'MGM', 'IBM', 'HP', 'LG', 'DJ', 'TV', 'OX']);

/**
 * Checks if string is blatant keyboard spam or gibberish
 */
function isObviousSpam(text: string): boolean {
  const clean = text.trim().toLowerCase();

  // Length sanity
  if (clean.length < 2) return true;
  if (clean.length > 50) return true;

  // Single unique letter repeated e.g. "aaaaaa", "ssssss", "zzzzzz"
  const lettersOnly = clean.replace(/[^a-z]/g, '');
  const uniqueChars = new Set(lettersOnly);
  if (uniqueChars.size <= 1 && clean.length > 2) return true;

  // Repetitive 2-char cycling e.g. "xyzxyz", "ababab", "asasas", "sksksk"
  if (clean.length >= 6) {
    const pair = clean.slice(0, 2);
    if (clean === pair.repeat(Math.floor(clean.length / 2))) {
      return true;
    }
  }

  // Common keyboard row smashing
  for (const pattern of KEYBOARD_SPAM_PATTERNS) {
    if (pattern.test(clean) && !VALID_SHORT_ACRONYMS.has(clean.toUpperCase())) {
      return true;
    }
  }

  // Must contain at least one vowel (a, e, i, o, u, y) unless in valid short acronyms
  const hasVowel = /[aeiouy]/i.test(clean);
  if (!hasVowel && !VALID_SHORT_ACRONYMS.has(clean.toUpperCase())) {
    return true;
  }

  return false;
}

/**
 * Normalizes input word variants for dataset lookup
 */
function checkDatasetMatch(word: string, dataset: Set<string>): boolean {
  const clean = word.toLowerCase().trim().replace(/\s+/g, ' ');

  // Direct match
  if (dataset.has(clean)) return true;

  // Without hyphens / with spaces
  const withSpaces = clean.replace(/-/g, ' ');
  if (dataset.has(withSpaces)) return true;

  // Without punctuation
  const noPunct = clean.replace(/['",.?!]/g, '');
  if (dataset.has(noPunct)) return true;

  // Plural to singular normalization
  if (clean.endsWith('ies') && clean.length > 4) {
    const singular = clean.slice(0, -3) + 'y';
    if (dataset.has(singular)) return true;
  }
  if (clean.endsWith('es') && clean.length > 3) {
    const singular = clean.slice(0, -2);
    if (dataset.has(singular)) return true;
  }
  if (clean.endsWith('s') && clean.length > 2) {
    const singular = clean.slice(0, -1);
    if (dataset.has(singular)) return true;
  }

  // Singular to plural check
  if (dataset.has(clean + 's')) return true;
  if (dataset.has(clean + 'es')) return true;

  // Check without leading "the " (e.g. user typed "the matrix" -> "matrix" or vice versa)
  if (clean.startsWith('the ') && clean.length > 4) {
    const withoutThe = clean.slice(4).trim();
    if (dataset.has(withoutThe)) return true;
  } else {
    if (dataset.has('the ' + clean)) return true;
  }

  return false;
}

/**
 * Validates a word submitted in Word Battle
 * Authoritative 3-step check:
 * 1. Starting letter (case-insensitive)
 * 2. Real non-spam word
 * 3. Exact category match against category datasets
 *
 * @param rawWord The user's typed string
 * @param requiredLetter The target starting letter
 * @param category The category name
 * @returns WordBattleValidationResult
 */
export function validateWordBattleSubmission(
  rawWord: string,
  requiredLetter: string,
  category: string
): WordBattleValidationResult {
  if (!rawWord || typeof rawWord !== 'string') {
    return { valid: false, reason: 'INVALID_WORD', details: 'Empty submission' };
  }

  const trimmed = rawWord.trim();
  if (trimmed.length < 2) {
    return { valid: false, reason: 'TOO_SHORT', details: 'Word must be at least 2 characters' };
  }

  // A. STARTING LETTER CHECK
  // Extract first meaningful alphabetic letter
  const firstAlphaMatch = trimmed.match(/[a-zA-Z]/);
  if (!firstAlphaMatch) {
    return { valid: false, reason: 'INVALID_WORD', details: 'Contains no letters' };
  }

  const firstLetter = firstAlphaMatch[0].toUpperCase();
  const reqChar = requiredLetter.trim().toUpperCase();

  if (firstLetter !== reqChar) {
    return {
      valid: false,
      reason: 'WRONG_STARTING_LETTER',
      details: `Must start with "${reqChar}", but starts with "${firstLetter}"`
    };
  }

  // B. ANTI-SPAM & GIBBERISH FILTER
  if (isObviousSpam(trimmed)) {
    return {
      valid: false,
      reason: 'INVALID_WORD',
      details: 'Contains random gibberish or keyboard spam'
    };
  }

  // C. CATEGORY-AWARE DATASET VALIDATION
  const categoryMeta = getCategoryDataset(category);
  if (!categoryMeta) {
    // Unsupported dynamic category fallback: enforce standard English letters & vowel rules
    if (/^[a-zA-Z\s\-'.&]{2,50}$/.test(trimmed) && /[aeiouy]/i.test(trimmed)) {
      return { valid: true };
    }
    return { valid: false, reason: 'NOT_IN_CATEGORY', details: 'Invalid category word' };
  }

  // Check if answer is in target category dataset
  const inTargetCategory = checkDatasetMatch(trimmed, categoryMeta.dataset);

  if (inTargetCategory) {
    return { valid: true };
  }

  // If not in target category, check if it belongs to ANOTHER known category (e.g. Snake in Food, or Sandwich in Animal)
  const otherCategories = [
    { cat: 'Animal', ds: ANIMAL_DATASET },
    { cat: 'Food', ds: FOOD_AND_DRINK_DATASET },
    { cat: 'Clothing', ds: CLOTHING_AND_ACCESSORY_DATASET },
    { cat: 'Sport', ds: SPORT_AND_GAME_DATASET },
    { cat: 'Job', ds: JOB_AND_PROFESSION_DATASET },
    { cat: 'Kitchen', ds: KITCHEN_ITEM_DATASET },
    { cat: 'Object', ds: EVERYDAY_OBJECT_DATASET }
  ];

  for (const other of otherCategories) {
    if (other.ds !== categoryMeta.dataset && checkDatasetMatch(trimmed, other.ds)) {
      return {
        valid: false,
        reason: 'CATEGORY_MISMATCH',
        details: `"${trimmed}" is a ${other.cat}, not a ${categoryMeta.name}`
      };
    }
  }

  return {
    valid: false,
    reason: 'NOT_IN_CATEGORY',
    details: `"${trimmed}" is not a recognized ${categoryMeta.name}`
  };
}
