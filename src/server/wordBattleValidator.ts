// Server-side authoritative validation for Word Battle submissions

// Curated sets for proper noun categories
const COUNTRIES_AND_CITIES = new Set([
  'AFGHANISTAN', 'ALBANIA', 'ALGERIA', 'ANDORRA', 'ANGOLA', 'ARGENTINA', 'ARMENIA', 'AUSTRALIA',
  'AUSTRIA', 'AZERBAIJAN', 'BAHAMAS', 'BAHRAIN', 'BANGLADESH', 'BARBADOS', 'BELARUS', 'BELGIUM',
  'BELIZE', 'BENIN', 'BHUTAN', 'BOLIVIA', 'BOSNIA', 'BOTSWANA', 'BRAZIL', 'BRUNEI', 'BULGARIA',
  'BURKINA FASO', 'BURUNDI', 'CAMBODIA', 'CAMEROON', 'CANADA', 'CHILE', 'CHINA', 'COLOMBIA',
  'CONGO', 'COSTA RICA', 'CROATIA', 'CUBA', 'CYPRUS', 'CZECHIA', 'DENMARK', 'DJIBOUTI', 'DOMINICA',
  'ECUADOR', 'EGYPT', 'EL SALVADOR', 'ESTONIA', 'ETHIOPIA', 'FIJI', 'FINLAND', 'FRANCE', 'GABON',
  'GAMBIA', 'GEORGIA', 'GERMANY', 'GHANA', 'GREECE', 'GRENADA', 'GUATEMALA', 'GUINEA', 'GUYANA',
  'HAITI', 'HONDURAS', 'HUNGARY', 'ICELAND', 'INDIA', 'INDONESIA', 'IRAN', 'IRAQ', 'IRELAND',
  'ISRAEL', 'ITALY', 'JAMAICA', 'JAPAN', 'JORDAN', 'KAZAKHSTAN', 'KENYA', 'KIRIBATI', 'KOREA',
  'KUWAIT', 'KYRGYZSTAN', 'LAOS', 'LATVIA', 'LEBANON', 'LESOTHO', 'LIBERIA', 'LIBYA', 'LITHUANIA',
  'LUXEMBOURG', 'MADAGASCAR', 'MALAWI', 'MALAYSIA', 'MALDIVES', 'MALI', 'MALTA', 'MAURITANIA',
  'MAURITIUS', 'MEXICO', 'MICRONESIA', 'MOLDOVA', 'MONACO', 'MONGOLIA', 'MONTENEGRO', 'MOROCCO',
  'MOZAMBIQUE', 'MYANMAR', 'NAMIBIA', 'NAURU', 'NEPAL', 'NETHERLANDS', 'NEW ZEALAND', 'NICARAGUA',
  'NIGER', 'NIGERIA', 'NORWAY', 'OMAN', 'PAKISTAN', 'PALAU', 'PANAMA', 'PARAGUAY', 'PERU',
  'PHILIPPINES', 'POLAND', 'PORTUGAL', 'QATAR', 'ROMANIA', 'RUSSIA', 'RWANDA', 'SAMOA', 'SAN MARINO',
  'SAUDI ARABIA', 'SENEGAL', 'SERBIA', 'SEYCHELLES', 'SIERRA LEONE', 'SINGAPORE', 'SLOVAKIA',
  'SLOVENIA', 'SOLOMON ISLANDS', 'SOMALIA', 'SOUTH AFRICA', 'SPAIN', 'SRI LANKA', 'SUDAN', 'SURINAME',
  'SWEDEN', 'SWITZERLAND', 'SYRIA', 'TAIWAN', 'TAJIKISTAN', 'TANZANIA', 'THAILAND', 'TOGO', 'TONGA',
  'TRINIDAD', 'TUNISIA', 'TURKEY', 'TURKMENISTAN', 'TUVALU', 'UGANDA', 'UKRAINE', 'UAE', 'UNITED KINGDOM',
  'USA', 'UNITED STATES', 'URUGUAY', 'UZBEKISTAN', 'VANUATU', 'VATICAN', 'VENEZUELA', 'VIETNAM',
  'YEMEN', 'ZAMBIA', 'ZIMBABWE', 'PARIS', 'LONDON', 'TOKYO', 'ROME', 'BERLIN', 'MADRID', 'NEW YORK',
  'DELHI', 'MUMBAI', 'SYDNEY', 'TORONTO', 'DUBAI', 'CAIRO', 'BEIJING', 'SEOUL', 'BANGKOK', 'VIENNA',
  'AMSTERDAM', 'DUBLIN', 'CHICAGO', 'BOSTON', 'MIAMI', 'LOS ANGELES', 'SAN FRANCISCO', 'MOSCOW',
  'BARCELONA', 'VENICE', 'FLORENCE', 'MILAN', 'MUNICH', 'FRANKFURT', 'BRUSSELS', 'LISBON', 'ATHENS',
  'ISTANBUL', 'SINGAPORE', 'HONG KONG', 'SHANGHAI', 'KUALA LUMPUR', 'MANILA', 'JAKARTA', 'DOHA',
  'RIYADH', 'CAPE TOWN', 'JOHANNESBURG', 'NAIROBI', 'CASABLANCA', 'BUENOS AIRES', 'SANTIAGO', 'LIMA',
  'BOGOTA', 'RIO DE JANEIRO', 'SAO PAULO', 'MEXICO CITY', 'HAVANA', 'VANCOUVER', 'MONTREAL', 'MELBOURNE'
]);

const BRANDS_AND_COMPANIES = new Set([
  'APPLE', 'NIKE', 'ADIDAS', 'GOOGLE', 'MICROSOFT', 'AMAZON', 'SONY', 'SAMSUNG', 'TESLA', 'TOYOTA',
  'HONDA', 'FORD', 'PEPSI', 'COCA COLA', 'GUCCI', 'PRADA', 'ZARA', 'NETFLIX', 'DISNEY', 'MCDONALDS',
  'STARBUCKS', 'UBER', 'PUMA', 'REEBOK', 'CHANEL', 'ROLEX', 'BMW', 'MERCEDES', 'AUDI', 'PORSCHE',
  'VOLKSWAGEN', 'FERRARI', 'LAMBORGHINI', 'NISSAN', 'HYUNDAI', 'KIA', 'CHEVROLET', 'INTEL', 'AMD',
  'NVIDIA', 'META', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'TIKTOK', 'SPOTIFY', 'YOUTUBE', 'EBAY',
  'PAYPAL', 'VISA', 'MASTERCARD', 'KFC', 'BURGER KING', 'SUBWAY', 'DOMINOS', 'PIZZA HUT', 'TARGET',
  'WALMART', 'COSTCO', 'IKEA', 'LEGO', 'NINTENDO', 'PLAYSTATION', 'XBOX', 'CANON', 'NIKON', 'DELL',
  'HP', 'LENOVO', 'ASUS', 'ACER', 'LG', 'PANASONIC', 'PHILIPS', 'BOEING', 'AIRBUS', 'HONDA', 'MAZDA'
]);

const MOVIES_AND_SHOWS = new Set([
  'AVATAR', 'BATMAN', 'BARBIE', 'INCEPTION', 'TITANIC', 'GLADIATOR', 'MATRIX', 'STAR WARS',
  'HARRY POTTER', 'AVENGERS', 'SPIDERMAN', 'SPIDER-MAN', 'FRIENDS', 'BREAKING BAD', 'GAME OF THRONES',
  'STRANGER THINGS', 'SIMPSONS', 'THE OFFICE', 'SHREK', 'FROZEN', 'LION KING', 'ALADDIN', 'MULAN',
  'TARZAN', 'CINDERELLA', 'MOANA', 'COCO', 'ENCANTO', 'UP', 'WALL-E', 'CARS', 'FINDING NEMO',
  'TOY STORY', 'MONSTERS INC', 'RATATOUILLE', 'INCREDIBLES', 'BRAVE', 'TANGLED', 'JOKER', 'IRON MAN',
  'THOR', 'CAPTAIN AMERICA', 'BLACK PANTHER', 'DOCTOR STRANGE', 'GUARDIANS OF THE GALAXY', 'SUPERMAN',
  'WONDER WOMAN', 'AQUAMAN', 'FLASH', 'DEADPOOL', 'X-MEN', 'WOLVERINE', 'JURASSIC PARK', 'JAWS',
  'INDIANA JONES', 'BACK TO THE FUTURE', 'TERMINATOR', 'ALIEN', 'PREDATOR', 'ROCKY', 'RAMBO',
  'DIE HARD', 'MISSION IMPOSSIBLE', 'TOP GUN', 'GODFATHER', 'GOODFELLAS', 'SCARFACE', 'PULP FICTION',
  'FIGHT CLUB', 'FORREST GUMP', 'INTERSTELLAR', 'OPPENHEIMER', 'DUNE', 'LORD OF THE RINGS', 'HOBBIT'
]);

const CELEBRITIES_AND_CHARACTERS = new Set([
  'BRAD PITT', 'TOM CRUISE', 'LEONARDO DICAPRIO', 'TAYLOR SWIFT', 'BEYONCE', 'RIHANNA', 'DRAKE',
  'EMINEM', 'MESSI', 'RONALDO', 'LEBRON JAMES', 'MICHAEL JORDAN', 'ELON MUSK', 'BILL GATES',
  'STEVE JOBS', 'EINSTEIN', 'NEWTON', 'SHAKESPEARE', 'BATMAN', 'SUPERMAN', 'SPIDERMAN', 'IRON MAN',
  'HULK', 'THOR', 'CAPTAIN AMERICA', 'WOLVERINE', 'JOKER', 'HARRY POTTER', 'HERMIONE', 'RON WEASLEY',
  'VOLDEMORT', 'DUMBLEDORE', 'FRODO', 'GANDALF', 'LEGOLAS', 'ARAGORN', 'DARTH VADER', 'LUKE SKYWALKER',
  'YODA', 'HAN SOLO', 'MARIO', 'LUIGI', 'BOWSER', 'PEACH', 'SONIC', 'PIKACHU', 'ASH KETCHUM', 'ZELDA',
  'LINK', 'MICKEY MOUSE', 'DONALD DUCK', 'GOOFY', 'BUGS BUNNY', 'DAFFY DUCK', 'HOMER SIMPSON',
  'BART SIMPSON', 'SPONGEBOB', 'PATRICK STAR', 'SQUIDWARD', 'SHREK', 'DONKEY', 'FIONA', 'ELSA',
  'ANNA', 'OLAF', 'SIMBA', 'MUFASA', 'SCAR', 'ALADDIN', 'GENIE', 'JASMIN', 'MULAN', 'POCAHONTAS'
]);

// Known spam clusters that should never pass validation
const KEYBOARD_SPAM_PATTERNS = [
  /^[asdfghjkl]+$/i,
  /^[qwertyuiop]+$/i,
  /^[zxcvbnm]+$/i,
  /^[1234567890]+$/,
  /(.)\1{2,}/i, // 3+ identical characters in a row: aaa, bbb, zzz
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

  // Single unique letter repeated e.g. "aaaaaa", "bbbb"
  const uniqueChars = new Set(clean.replace(/[^a-z]/g, ''));
  if (uniqueChars.size <= 1 && clean.length > 2) return true;

  // Repetitive 2-char cycling e.g. "xyzxyz", "ababab", "asasas"
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
 * Validates a word submitted in Word Battle
 * @param rawWord The user's typed string
 * @param requiredLetter The target starting letter
 * @param category The category name
 * @returns { valid: boolean, reason?: string }
 */
export function validateWordBattleSubmission(
  rawWord: string,
  requiredLetter: string,
  category: string
): { valid: boolean; reason?: string } {
  if (!rawWord || typeof rawWord !== 'string') {
    return { valid: false, reason: 'Empty submission' };
  }

  const trimmed = rawWord.trim();
  if (trimmed.length < 2) {
    return { valid: false, reason: 'Word too short (min 2 letters)' };
  }

  const reqChar = requiredLetter.trim().toUpperCase();
  if (!trimmed.toUpperCase().startsWith(reqChar)) {
    return { valid: false, reason: `Must start with "${reqChar}"` };
  }

  // Anti-spam check applies to all categories
  if (isObviousSpam(trimmed)) {
    return { valid: false, reason: 'Invalid word format or keyboard spam' };
  }

  const cat = category.toLowerCase();
  const upper = trimmed.toUpperCase();

  // PROPER NOUN CATEGORIES
  if (cat.includes('country') || cat.includes('city')) {
    if (COUNTRIES_AND_CITIES.has(upper)) {
      return { valid: true };
    }
    // Plausible proper noun check (letters, spaces, hyphens, min 3 chars or short acronym)
    if (/^[a-zA-Z\s\-'.]{2,40}$/.test(trimmed) && /[aeiouy]/i.test(trimmed)) {
      return { valid: true };
    }
    return { valid: false, reason: 'Not a recognized country or city' };
  }

  if (cat.includes('brand') || cat.includes('company')) {
    if (BRANDS_AND_COMPANIES.has(upper)) {
      return { valid: true };
    }
    if (/^[a-zA-Z0-9\s\-'.&]{2,35}$/.test(trimmed)) {
      return { valid: true };
    }
    return { valid: false, reason: 'Not a recognized brand or company' };
  }

  if (cat.includes('movie') || cat.includes('show') || cat.includes('tv')) {
    if (MOVIES_AND_SHOWS.has(upper)) {
      return { valid: true };
    }
    if (/^[a-zA-Z0-9\s\-':,!?]{2,50}$/.test(trimmed) && /[aeiouy]/i.test(trimmed)) {
      return { valid: true };
    }
    return { valid: false, reason: 'Not a recognized title' };
  }

  if (cat.includes('celebrity') || cat.includes('character')) {
    if (CELEBRITIES_AND_CHARACTERS.has(upper)) {
      return { valid: true };
    }
    if (/^[a-zA-Z\s\-'.]{2,40}$/.test(trimmed) && /[aeiouy]/i.test(trimmed)) {
      return { valid: true };
    }
    return { valid: false, reason: 'Not a recognized name or character' };
  }

  // COMMON NOUN CATEGORIES (Animal, Food or Drink, Everyday Object, Job, Sport, Clothing, Kitchen, etc.)
  // Format check: strictly alphabetical + spaces or hyphens (e.g. "polar bear", "t-shirt")
  if (!/^[a-zA-Z\s\-']{2,30}$/.test(trimmed)) {
    return { valid: false, reason: 'Contains invalid characters' };
  }

  // Must have plausible consonant/vowel structure
  const cleanAlpha = trimmed.toLowerCase().replace(/[^a-z]/g, '');
  if (cleanAlpha.length < 2) {
    return { valid: false, reason: 'Too short' };
  }

  // Reject excessive consonants or vowels in a row (e.g. "wrthjk", "aeiouae")
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(cleanAlpha)) {
    return { valid: false, reason: 'Invalid consonant combination' };
  }
  if (/[aeiou]{4,}/i.test(cleanAlpha)) {
    return { valid: false, reason: 'Invalid vowel combination' };
  }

  return { valid: true };
}
