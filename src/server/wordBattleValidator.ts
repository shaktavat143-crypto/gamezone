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
export function getCategoryDataset(categoryName: string): { dataset: Set<string>; name: string } | null {
  const cat = categoryName.toLowerCase().trim();

  if (cat.includes('animal') || cat.includes('creature') || cat.includes('beast') || cat.includes('pet')) {
    return { dataset: ANIMAL_DATASET, name: 'Animal' };
  }
  if (
    cat.includes('food') ||
    cat.includes('drink') ||
    cat.includes('fruit') ||
    cat.includes('vegetable') ||
    cat.includes('meal') ||
    cat.includes('beverage') ||
    cat.includes('dish') ||
    cat.includes('snack')
  ) {
    return { dataset: FOOD_AND_DRINK_DATASET, name: 'Food or Drink' };
  }
  if (cat.includes('cloth') || cat.includes('accessory') || cat.includes('wear') || cat.includes('apparel')) {
    return { dataset: CLOTHING_AND_ACCESSORY_DATASET, name: 'Clothing or Accessory' };
  }
  if (cat.includes('sport') || cat.includes('game') || cat.includes('athletics')) {
    return { dataset: SPORT_AND_GAME_DATASET, name: 'Sport or Game' };
  }
  if (cat.includes('job') || cat.includes('profession') || cat.includes('career') || cat.includes('occupation')) {
    return { dataset: JOB_AND_PROFESSION_DATASET, name: 'Job or Profession' };
  }
  if (cat.includes('kitchen')) {
    return { dataset: KITCHEN_ITEM_DATASET, name: 'Kitchen Item' };
  }
  if (cat.includes('everyday') || cat.includes('object') || cat.includes('item') || cat.includes('household')) {
    return { dataset: EVERYDAY_OBJECT_DATASET, name: 'Everyday Object' };
  }
  if (cat.includes('superpower') || cat.includes('spell') || cat.includes('power') || cat.includes('magic')) {
    return { dataset: SUPERPOWER_AND_SPELL_DATASET, name: 'Superpower or Spell' };
  }
  if (cat.includes('country') || cat.includes('city') || cat.includes('place') || cat.includes('nation') || cat.includes('capital') || cat.includes('state')) {
    return { dataset: COUNTRY_AND_CITY_DATASET, name: 'Country or City' };
  }
  if (cat.includes('brand') || cat.includes('company') || cat.includes('corporation') || cat.includes('logo')) {
    return { dataset: BRAND_AND_COMPANY_DATASET, name: 'Brand or Company' };
  }
  if (cat.includes('movie') || cat.includes('film') || cat.includes('tv') || cat.includes('show') || cat.includes('series') || cat.includes('cinema')) {
    return { dataset: MOVIE_AND_TV_DATASET, name: 'Movie or TV Show' };
  }
  if (cat.includes('celebrity') || cat.includes('character') || cat.includes('famous') || cat.includes('actor') || cat.includes('star')) {
    return { dataset: CELEBRITY_AND_CHARACTER_DATASET, name: 'Celebrity or Character' };
  }

  return null;
}

// Known blatant keyboard spam patterns
const KEYBOARD_SPAM_PATTERNS = [
  /^[1234567890]+$/,
  /(.)\1{3,}/i, // 4+ identical characters in a row: aaaa, bbbb, zzzz
  /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+$/i,
  /^[bcdfghjklmnpqrstvwxz]{5,}$/i // 5+ consecutive consonants without vowel/acronym
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
  if (!lettersOnly) return true;
  const uniqueChars = new Set(lettersOnly);
  if (uniqueChars.size <= 1 && clean.length > 2) return true;

  // Repetitive 2-char cycling e.g. "xyzxyz", "ababab", "asasas", "sksksk"
  if (clean.length >= 6) {
    const pair = clean.slice(0, 2);
    if (clean === pair.repeat(Math.floor(clean.length / 2))) {
      return true;
    }
  }

  // Common keyboard row smashing sequences
  const spamSequences = ['asdf', 'fdsa', 'asdfg', 'gfdsa', 'qwer', 'rewq', 'qwerty', 'zxcv', 'vcxz', 'zxcvb', 'jkl;', ';lkj'];
  for (const seq of spamSequences) {
    if (clean.includes(seq)) {
      return true;
    }
  }

  // Obvious spam pattern check
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

  // Strip leading articles "the ", "a ", "an "
  if (clean.startsWith('the ') && clean.length > 4) {
    const without = clean.slice(4).trim();
    if (dataset.has(without)) return true;
  } else if (clean.startsWith('a ') && clean.length > 2) {
    const without = clean.slice(2).trim();
    if (dataset.has(without)) return true;
  } else if (clean.startsWith('an ') && clean.length > 3) {
    const without = clean.slice(3).trim();
    if (dataset.has(without)) return true;
  } else {
    if (dataset.has('the ' + clean)) return true;
  }

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
    // If category is unrecognized, strictly reject rather than accepting all English words
    return {
      valid: false,
      reason: 'NOT_IN_CATEGORY',
      details: `Category "${category}" is not recognized`
    };
  }

  // Check if answer is in target category dataset
  const inTargetCategory = checkDatasetMatch(trimmed, categoryMeta.dataset);

  if (inTargetCategory) {
    return { valid: true };
  }

  // If not in target category, check if it belongs to ANOTHER known category (e.g. Snake in Food, or Sandwich in Animal)
  const allKnownCategories = [
    { cat: 'Animal', ds: ANIMAL_DATASET },
    { cat: 'Food or Drink', ds: FOOD_AND_DRINK_DATASET },
    { cat: 'Clothing or Accessory', ds: CLOTHING_AND_ACCESSORY_DATASET },
    { cat: 'Sport or Game', ds: SPORT_AND_GAME_DATASET },
    { cat: 'Job or Profession', ds: JOB_AND_PROFESSION_DATASET },
    { cat: 'Kitchen Item', ds: KITCHEN_ITEM_DATASET },
    { cat: 'Everyday Object', ds: EVERYDAY_OBJECT_DATASET },
    { cat: 'Country or City', ds: COUNTRY_AND_CITY_DATASET },
    { cat: 'Brand or Company', ds: BRAND_AND_COMPANY_DATASET },
    { cat: 'Movie or TV Show', ds: MOVIE_AND_TV_DATASET },
    { cat: 'Celebrity or Character', ds: CELEBRITY_AND_CHARACTER_DATASET },
    { cat: 'Superpower or Spell', ds: SUPERPOWER_AND_SPELL_DATASET }
  ];

  for (const other of allKnownCategories) {
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
