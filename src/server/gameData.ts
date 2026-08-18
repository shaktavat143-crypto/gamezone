// Comprehensive game question banks, categories, and word pairs for the 6 multiplayer games

export const WORD_BATTLE_LETTERS = ['S', 'B', 'M', 'R', 'T', 'C', 'P', 'L', 'A', 'D', 'G', 'F', 'H', 'K', 'W'];

export const WORD_BATTLE_CATEGORIES = [
  'Animal',
  'Country or City',
  'Food or Drink',
  'Everyday Object',
  'Movie or TV Show',
  'Celebrity or Character',
  'Brand or Company',
  'Job or Profession',
  'Sport or Game',
  'Superpower or Spell',
  'Clothing or Accessory',
  'Thing you find in a kitchen'
];

export const SECRET_BATTLE_PAIRS = [
  { category: 'Food & Drinks', majority: 'PIZZA', secret: 'BURGER' },
  { category: 'Food & Drinks', majority: 'COFFEE', secret: 'TEA' },
  { category: 'Food & Drinks', majority: 'ICE CREAM', secret: 'FROZEN YOGURT' },
  { category: 'Food & Drinks', majority: 'CHOCOLATE', secret: 'CANDY' },
  { category: 'Food & Drinks', majority: 'PANCAKES', secret: 'WAFFLES' },
  { category: 'Animals & Nature', majority: 'DOG', secret: 'CAT' },
  { category: 'Animals & Nature', majority: 'LION', secret: 'TIGER' },
  { category: 'Animals & Nature', majority: 'DOLPHIN', secret: 'SHARK' },
  { category: 'Animals & Nature', majority: 'EAGLE', secret: 'HAWK' },
  { category: 'Places & Travel', majority: 'BEACH', secret: 'SWIMMING POOL' },
  { category: 'Places & Travel', majority: 'AIRPORT', secret: 'TRAIN STATION' },
  { category: 'Places & Travel', majority: 'HOTEL', secret: 'CAMPING TENT' },
  { category: 'Places & Travel', majority: 'CINEMA', secret: 'LIVING ROOM' },
  { category: 'Gaming & Tech', majority: 'SMARTPHONE', secret: 'TABLET' },
  { category: 'Gaming & Tech', majority: 'PLAYSTATION', secret: 'XBOX' },
  { category: 'Gaming & Tech', majority: 'HEADPHONES', secret: 'SPEAKER' },
  { category: 'Gaming & Tech', majority: 'LAPTOP', secret: 'DESKTOP PC' },
  { category: 'Music & Arts', majority: 'GUITAR', secret: 'PIANO' },
  { category: 'Music & Arts', majority: 'ROCK MUSIC', secret: 'POP MUSIC' },
  { category: 'Music & Arts', majority: 'PAINTING', secret: 'SCULPTURE' },
  { category: 'Lifestyle', majority: 'SUNGLASSES', secret: 'READING GLASSES' },
  { category: 'Lifestyle', majority: 'BACKPACK', secret: 'SUITCASE' },
  { category: 'Lifestyle', majority: 'BICYCLE', secret: 'SKATEBOARD' }
];

export const MOST_LIKELY_TO_QUESTIONS = [
  { id: 'mlt_1', text: 'Who is most likely to accidentally become famous on TikTok?', category: 'Social Media' },
  { id: 'mlt_2', text: 'Who is most likely to survive a Zombie Apocalypse?', category: 'Survival' },
  { id: 'mlt_3', text: 'Who is most likely to laugh at the worst possible moment?', category: 'Personality' },
  { id: 'mlt_4', text: 'Who is most likely to spend all their money on gaming skins or snacks?', category: 'Habits' },
  { id: 'mlt_5', text: 'Who is most likely to forget their own birthday?', category: 'Funny' },
  { id: 'mlt_6', text: 'Who is most likely to win a reality TV show?', category: 'Entertainment' },
  { id: 'mlt_7', text: 'Who is most likely to stay up until 4:00 AM researching random conspiracy theories?', category: 'Late Night' },
  { id: 'mlt_8', text: 'Who is most likely to trip over nothing in broad daylight?', category: 'Clumsy' },
  { id: 'mlt_9', text: 'Who is most likely to rage-quit a board or video game?', category: 'Gaming' },
  { id: 'mlt_10', text: 'Who is most likely to become a billionaire and build an underground bunker?', category: 'Ambition' },
  { id: 'mlt_11', text: 'Who is most likely to order delivery food while already cooking dinner?', category: 'Food' },
  { id: 'mlt_12', text: 'Who is most likely to text "I am on my way" when they haven\'t even gotten out of bed?', category: 'Friendship' },
  { id: 'mlt_13', text: 'Who is most likely to cry during an animated kids movie?', category: 'Emotions' },
  { id: 'mlt_14', text: 'Who is most likely to adopt 10 stray dogs or cats?', category: 'Animals' },
  { id: 'mlt_15', text: 'Who is most likely to accidentally set something on fire while making microwave popcorn?', category: 'Cooking' },
  { id: 'mlt_16', text: 'Who is most likely to become a secret spy and never tell anyone?', category: 'Mystery' },
  { id: 'mlt_17', text: 'Who is most likely to binge-watch an entire 5-season TV series in one weekend?', category: 'Entertainment' },
  { id: 'mlt_18', text: 'Who is most likely to win an argument with pure nonsense and confidence?', category: 'Debate' },
  { id: 'mlt_19', text: 'Who is most likely to drop their phone in water or off a balcony?', category: 'Accidents' },
  { id: 'mlt_20', text: 'Who is most likely to write a bestselling mystery novel?', category: 'Creativity' }
];

export const WHO_SAID_IT_PROMPTS = [
  { id: 'wsi_1', text: 'What is the weirdest or most controversial food combination you secretly enjoy?', category: 'Food' },
  { id: 'wsi_2', text: 'If you had to change your legal name tomorrow, what would you choose?', category: 'Identity' },
  { id: 'wsi_3', text: 'What is a completely useless superpower that you would still love to have?', category: 'Fun' },
  { id: 'wsi_4', text: 'What is the most ridiculous excuse you\'ve used to get out of doing something?', category: 'Stories' },
  { id: 'wsi_5', text: 'If you won $10,000,000, what is the first ridiculous/silly purchase you would make?', category: 'Dreams' },
  { id: 'wsi_6', text: 'What is a popular movie, song, or trend that you secretly think is totally overrated?', category: 'Hot Takes' },
  { id: 'wsi_7', text: 'What is your go-to karaoke song when no one is judging?', category: 'Music' },
  { id: 'wsi_8', text: 'What was your most embarrassing childhood obsession or phase?', category: 'Throwback' },
  { id: 'wsi_9', text: 'If aliens invaded earth, what 1 item from your room would you show them to explain humanity?', category: 'Sci-Fi' },
  { id: 'wsi_10', text: 'What is a life rule or superstition that you follow even though it makes no sense?', category: 'Quirks' }
];

export const MEMORY_ICONS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🥑', '🍕', '🍔', '🚀', '⭐', '💎', '🎮', '👑', '🔥', '⚡', '🛸'];
export const MEMORY_COLORS = ['🟦', '🟨', '🟥', '🟩', '🟪', '🟧', '🟫', '⬛'];
