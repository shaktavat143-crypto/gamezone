// Authoritative category word datasets for Word Battle
// All words are normalized in lowercase for case-insensitive lookup

export const ANIMAL_DATASET = new Set([
  // S
  'snake', 'snakes', 'shark', 'sharks', 'sheep', 'sparrow', 'sparrows', 'swan', 'swans',
  'spider', 'spiders', 'scorpion', 'scorpions', 'seal', 'seals', 'sea lion', 'sea lions',
  'starfish', 'seahorse', 'seahorses', 'sloth', 'sloths', 'skunk', 'skunks', 'salamander',
  'salamanders', 'squid', 'squids', 'swallow', 'stork', 'storks', 'snail', 'snails', 'slug',
  'slugs', 'salmon', 'sardine', 'sardines', 'shrimp', 'shrimps', 'swordfish', 'stingray',
  'stingrays', 'squirrel', 'squirrels', 'starling', 'starlings', 'seahorse', 'sponge',
  'serval', 'springbok', 'stoat', 'stoats', 'sparrowhawk', 'seagull', 'seagulls', 'sea otter',
  'sea turtle', 'sea urchin', 'sand dollar', 'siamese cat', 'schnauzer', 'shih tzu', 'spaniel',
  'sable', 'saiga', 'sawfish', 'scallop', 'shrew', 'shrews', 'skink', 'skinks', 'sparrow',
  'snapping turtle', 'snow leopard', 'snowy owl', 'spider monkey', 'sunfish', 'suricate',
  // B
  'bear', 'bears', 'bat', 'bats', 'bird', 'birds', 'bee', 'bees', 'butterfly', 'butterflies',
  'beaver', 'beavers', 'bison', 'baboon', 'baboons', 'badger', 'badgers', 'bull', 'bulls',
  'beetle', 'beetles', 'bluejay', 'bluejays', 'bobcat', 'bobcats', 'buffalo', 'buzzard',
  'buzzards', 'boa', 'boas', 'barracuda', 'beluga', 'blackbird', 'blackbirds', 'boar', 'boars',
  'blowfish', 'blue whale', 'bonobo', 'bonobos', 'basset hound', 'beagle', 'beagles', 'bulldog',
  'bulldogs', 'border collie', 'boxer', 'boxers', 'bumblebee', 'bumblebees', 'bushbaby', 'bunting',
  'barn owl', 'bass', 'bullfrog', 'bullfrogs', 'bighorn sheep', 'blue shark', 'bowhead whale',
  // M
  'monkey', 'monkeys', 'mouse', 'mice', 'moose', 'mole', 'moles', 'moth', 'moths', 'magpie',
  'magpies', 'manatee', 'manatees', 'marmot', 'marmots', 'meerkat', 'meerkats', 'mink', 'minks',
  'macaw', 'macaws', 'mallard', 'mallards', 'mongoose', 'mantis', 'mule', 'mules', 'mosquito',
  'mosquitoes', 'mammoth', 'mammoths', 'mandrill', 'mantis shrimp', 'manta ray', 'marmot',
  'mastiff', 'meadowlark', 'mockingbird', 'mollusk', 'monarch butterfly', 'monitor lizard',
  'moray eel', 'mountain goat', 'mountain lion', 'myna', 'muskrat', 'muskox', 'muntjac',
  // R
  'rabbit', 'rabbits', 'rat', 'rats', 'raven', 'ravens', 'rhino', 'rhinos', 'rhinoceros',
  'rhinoceroses', 'raccoon', 'raccoons', 'reindeer', 'rattlesnake', 'rattlesnakes', 'robin',
  'robins', 'rooster', 'roosters', 'roach', 'roaches', 'red panda', 'red pandas', 'ram', 'rams',
  'ray', 'rays', 'red fox', 'rottweiler', 'retriever', 'roadrunner', 'rook', 'rhea', 'ringtail',
  'river otter', 'rockfish', 'rodent', 'roller', 'roughy', 'ruff', 'ruddy duck',
  // T
  'tiger', 'tigers', 'turtle', 'turtles', 'tortoise', 'tortoises', 'toucan', 'toucans', 'turkey',
  'turkeys', 'trout', 'tarantula', 'tarantulas', 'tapir', 'tapirs', 'toad', 'toads', 'tuna',
  'termite', 'termites', 'tasmanian devil', 'terrapin', 'thrush', 'tick', 'ticks', 'tree frog',
  'treefrog', 'tamarin', 'takin', 'tarpon', 'teal', 'tenrec', 'tern', 'tiger shark', 'titmouse',
  'treeshrew', 'triggerfish', 'tsetse fly', 'tuatara', 'tuna', 'turaco', 'tyrannosaurus',
  // C
  'cat', 'cats', 'cow', 'cows', 'camel', 'camels', 'cheetah', 'cheetahs', 'chimpanzee',
  'chimpanzees', 'chimp', 'chimps', 'crab', 'crabs', 'crocodile', 'crocodiles', 'crow', 'crows',
  'chameleon', 'chameleons', 'cobra', 'cobras', 'caterpillar', 'caterpillars', 'crane', 'cranes',
  'cricket', 'crickets', 'cougar', 'cougars', 'coyote', 'coyotes', 'carp', 'clam', 'clams',
  'cardinal', 'cardinals', 'cockatoo', 'chinchilla', 'chipmunk', 'chipmunks', 'chihuahua',
  'cocker spaniel', 'caiman', 'caribou', 'cassowary', 'catfish', 'centipede', 'cavy', 'chameleon',
  'chickadee', 'chicken', 'chickens', 'cicada', 'civet', 'clownfish', 'cockroach', 'condor',
  'coot', 'coral', 'cormorant', 'cuckoo', 'cuttlefish', 'capybara', 'capybaras',
  // P
  'pig', 'pigs', 'penguin', 'penguins', 'panther', 'panthers', 'parrot', 'parrots', 'pigeon',
  'pigeons', 'polar bear', 'polar bears', 'panda', 'pandas', 'peacock', 'peacocks', 'pelican',
  'pelicans', 'pony', 'ponies', 'platypus', 'porcupine', 'porcupines', 'puma', 'pumas', 'python',
  'pythons', 'perch', 'piranha', 'piranhas', 'pheasant', 'pheasants', 'poodle', 'pug', 'pugs',
  'porpoise', 'prairie dog', 'partridge', 'parakeet', 'pangolin', 'pangolins', 'possum',
  'peafowl', 'periwinkle', 'petrel', 'pike', 'pipit', 'poison dart frog', 'pomeranian', 'prawn',
  'prawns', 'praying mantis', 'puffin', 'puffins', 'potoroo', 'proboscis monkey',
  // L
  'lion', 'lions', 'leopard', 'leopards', 'llama', 'llamas', 'lizard', 'lizards', 'lemur',
  'lemurs', 'lobster', 'lobsters', 'leech', 'leeches', 'lynx', 'lark', 'larks', 'lamb', 'lambs',
  'locust', 'locusts', 'ladybug', 'ladybugs', 'labrador', 'lemming', 'lemmings', 'loon', 'loons',
  'loris', 'limpet', 'lionfish', 'lorikeet', 'lungfish', 'lamprey', 'langur', 'leatherback turtle',
  // A
  'ant', 'ants', 'ape', 'apes', 'anteater', 'anteaters', 'antelope', 'antelopes', 'alligator',
  'alligators', 'alpaca', 'alpacas', 'armadillo', 'armadillos', 'albatross', 'albatrosses',
  'aphid', 'aphids', 'anaconda', 'anacondas', 'aardvark', 'aardvarks', 'axolotl', 'axolotls',
  'anchovy', 'anchovies', 'angelfish', 'anole', 'argali', 'aye-aye', 'adder', 'asp', 'avocet',
  // D
  'dog', 'dogs', 'dolphin', 'dolphins', 'duck', 'ducks', 'deer', 'dove', 'doves', 'donkey',
  'donkeys', 'dingo', 'dingoes', 'dragonfly', 'dragonflies', 'dormouse', 'dodo', 'dodos',
  'dinosaur', 'dinosaurs', 'dalmatian', 'dachshund', 'dhole', 'dik-dik', 'dipper', 'dory',
  'drongo', 'dugong', 'dunlin', 'dungeness crab', 'dusky dolphin',
  // G
  'giraffe', 'giraffes', 'gorilla', 'gorillas', 'goat', 'goats', 'goose', 'geese', 'goldfish',
  'gazelle', 'gazelles', 'gecko', 'geckos', 'grasshopper', 'grasshoppers', 'gopher', 'gophers',
  'gull', 'gulls', 'groundhog', 'groundhogs', 'guinea pig', 'guinea pigs', 'grizzly bear',
  'gibbon', 'gibbons', 'gerbil', 'gerbils', 'golden retriever', 'great dane', 'grouse',
  'gannet', 'gar', 'gavial', 'gharial', 'glowworm', 'gnat', 'gnu', 'goldfinch', 'goshawk',
  'grackle', 'grebe', 'green turtle', 'greyhound', 'grizzly', 'guanaco', 'guppy',
  // F
  'fox', 'foxes', 'frog', 'frogs', 'fish', 'fishes', 'falcon', 'falcons', 'ferret', 'ferrets',
  'flamingo', 'flamingos', 'fly', 'flies', 'firefly', 'fireflies', 'finch', 'finches', 'flounder',
  'flea', 'fleas', 'fowl', 'fennec fox', 'flying squirrel', 'flying fish', 'field mouse',
  'frigatebird', 'fruit bat', 'frogmouth', 'fulmar', 'fiddler crab',
  // H
  'horse', 'horses', 'hawk', 'hawks', 'hedgehog', 'hedgehogs', 'hippo', 'hippos', 'hippopotamus',
  'hyena', 'hyenas', 'hummingbird', 'hummingbirds', 'hamster', 'hamsters', 'hare', 'hares',
  'heron', 'herons', 'hornet', 'hornets', 'hermit crab', 'halibut', 'husky', 'huskies',
  'harrier', 'harbor seal', 'hart', 'hartebeest', 'hawkbill', 'hellbender', 'herring',
  'hoopoe', 'hornbill', 'horseshoe crab', 'hound', 'howler monkey',
  // K
  'kangaroo', 'kangaroos', 'koala', 'koalas', 'kiwi', 'kiwis', 'kingfisher', 'kingfishers',
  'killer whale', 'kitten', 'kittens', 'krill', 'komodo dragon', 'kestrel', 'kestrels',
  'kudu', 'katydid', 'king crab', 'king cobra', 'kakapo', 'killdeer', 'kinkajou',
  // W
  'wolf', 'wolves', 'whale', 'whales', 'walrus', 'walruses', 'wombat', 'wombats', 'woodpecker',
  'woodpeckers', 'wasp', 'wasps', 'weasel', 'weasels', 'worm', 'worms', 'warthog', 'warthogs',
  'wildcat', 'wildcats', 'wildebeest', 'wildebeests', 'wolverine', 'wolverines', 'wren', 'wrens',
  'wallaby', 'wallabies', 'water buffalo', 'whippet', 'white tiger', 'wild boar', 'woodchuck',
  'waxwing', 'weaver', 'weevil', 'whale shark', 'whimbrel', 'willet', 'wolfhound', 'wrasse',
  // Others
  'echidna', 'emu', 'eagle', 'eels', 'eel', 'elephant', 'elephants', 'elk', 'ermine',
  'ibis', 'iguana', 'iguanas', 'impala', 'indri', 'inchworm', 'jackal', 'jackals', 'jaguar',
  'jaguars', 'jellyfish', 'jay', 'quail', 'quails', 'quokka', 'quoll', 'urchin', 'uakari',
  'vicuna', 'viper', 'vipers', 'vulture', 'vultures', 'vole', 'voles', 'zebra', 'zebras', 'zebu'
]);

export const FOOD_AND_DRINK_DATASET = new Set([
  // S
  'sandwich', 'sandwiches', 'soup', 'soups', 'salad', 'salads', 'sushi', 'steak', 'steaks',
  'sausage', 'sausages', 'spaghetti', 'strawberry', 'strawberries', 'salmon', 'spinach',
  'soda', 'sodas', 'smoothie', 'smoothies', 'sundae', 'sundaes', 'stew', 'stews', 'scone',
  'scones', 'samosa', 'samosas', 'shrimp', 'shrimps', 'sourdough', 'snack', 'snacks',
  'syrup', 'salt', 'sugar', 'sesame', 'sprite', 'sake', 'cider', 'soy milk', 'sponge cake',
  'sweet potato', 'scrambled eggs', 'salmon', 'sashimi', 'satay', 'sauerkraut', 'scallion',
  'scallops', 'seaweed', 'semolina', 'shallot', 'sherbet', 'shortbread', 'snickerdoodle',
  'sorbet', 'souffle', 'sour cream', 'soy sauce', 'spearmint', 'spices', 'spring roll',
  'squash', 'strudel', 'sub', 'subway', 'succotash', 'sugar cane', 'sunflower seeds', 'swiss cheese',
  // B
  'burger', 'burgers', 'bread', 'breads', 'bacon', 'butter', 'burrito', 'burritos', 'banana',
  'bananas', 'bagel', 'bagels', 'beef', 'beer', 'beers', 'biscuit', 'biscuits', 'broccoli',
  'blueberry', 'blueberries', 'blackberry', 'blackberries', 'brownie', 'brownies', 'bean',
  'beans', 'broth', 'brioche', 'basil', 'boba', 'bubble tea', 'brisket', 'bbq', 'barbecue',
  'baguette', 'baklava', 'bamboo shoots', 'barley', 'batter', 'beet', 'beets', 'beetroot',
  'bell pepper', 'berry', 'berries', 'biryani', 'bitters', 'black tea', 'bologna', 'bonbon',
  'borscht', 'bouillon', 'bourbon', 'boysenberry', 'bran', 'bratwurst', 'brie', 'broad beans',
  'bruschetta', 'brussels sprouts', 'buckwheat', 'bundt cake', 'butterscotch', 'buttermilk',
  // M
  'milk', 'muffin', 'muffins', 'mango', 'mangoes', 'meat', 'macaroni', 'mocha', 'melon',
  'melons', 'mushroom', 'mushrooms', 'milkshake', 'milkshakes', 'mustard', 'mayo', 'mayonnaise',
  'mozzarella', 'mutton', 'marshmallow', 'marshmallows', 'mint', 'matcha', 'mousse', 'meatball',
  'meatballs', 'miso', 'margarita', 'macaron', 'macarons', 'macadamia', 'mackerel', 'mandarin',
  'maple syrup', 'marinara', 'marmalade', 'mashed potatoes', 'matzo', 'mead', 'meatloaf',
  'meringue', 'mesclun', 'mimosa', 'mince', 'minestrone', 'mint tea', 'mirin', 'molasses',
  'mooncake', 'muesli', 'mulberry', 'mulled wine', 'muscat',
  // R
  'rice', 'ramen', 'roll', 'rolls', 'ravioli', 'radish', 'radishes', 'raspberry', 'raspberries',
  'roast', 'rib', 'ribs', 'rye', 'raisin', 'raisins', 'risotto', 'rum', 'red wine', 'root beer',
  'relish', 'roti', 'ranch', 'ragu', 'rainbow trout', 'rhubarb', 'ricotta', 'rigatoni',
  'roast beef', 'roast chicken', 'roe', 'romaine', 'rosemary', 'rotisserie chicken', 'rusk',
  'rutabaga', 'rye bread',
  // T
  'taco', 'tacos', 'toast', 'tea', 'teas', 'tomato', 'tomatoes', 'turkey', 'tuna', 'tart',
  'tarts', 'tofu', 'tequila', 'tiramisu', 'tempura', 'tangerine', 'tangerines', 'thyme',
  'tortilla', 'tortillas', 'trout', 'toffee', 'truffle', 'truffles', 'tabasco', 'tagliatelle',
  'tahini', 'tamale', 'tamales', 'tandoori chicken', 'tapas', 'tapioca', 'tarragon', 'tartar sauce',
  'tater tots', 'tea bag', 'tenderloin', 'teriyaki', 'toast', 'toddy', 'tom yum', 'tonic',
  'trail mix', 'treacle', 'tzatziki',
  // C
  'cake', 'cakes', 'cheese', 'cheeses', 'chicken', 'chocolate', 'chocolates', 'coffee',
  'cereal', 'cereals', 'cookie', 'cookies', 'croissant', 'croissants', 'carrot', 'carrots',
  'cucumber', 'cucumbers', 'cherry', 'cherries', 'candy', 'candies', 'cabbage', 'chips',
  'cider', 'cola', 'curry', 'curries', 'crab', 'cream', 'cinnamon', 'cauliflower', 'clam',
  'clams', 'cashew', 'cashews', 'coconut', 'coconuts', 'crepe', 'crepes', 'cappuccino',
  'chili', 'chowder', 'canola oil', 'cantaloupe', 'capers', 'caramel', 'caraway', 'cardamom',
  'carpaccio', 'casserole', 'catfish', 'caviar', 'celery', 'chai', 'chamomile', 'champagne',
  'cheddar', 'cheesecake', 'chia seeds', 'chickpeas', 'chimichanga', 'chives', 'churro', 'churros',
  'clam chowder', 'clementine', 'clove', 'cloves', 'cobbler', 'cocktail', 'cocoa', 'cod',
  'coleslaw', 'collard greens', 'compote', 'condensed milk', 'coriander', 'corn', 'cornbread',
  'cornflakes', 'cottage cheese', 'couscous', 'cranberry', 'crayfish', 'cream cheese', 'creme brulee',
  'crisps', 'croutons', 'cupcake', 'cupcakes', 'curd', 'custard',
  // P
  'pizza', 'pizzas', 'pasta', 'pastas', 'pancake', 'pancakes', 'pie', 'pies', 'potato',
  'potatoes', 'pork', 'peach', 'peaches', 'pear', 'pears', 'plum', 'plums', 'popcorn',
  'pickle', 'pickles', 'porridge', 'pudding', 'puddings', 'pretzel', 'pretzels', 'pepper',
  'peppers', 'pumpkin', 'pumpkins', 'papaya', 'papayas', 'peanut', 'peanuts', 'pistachio',
  'pistachios', 'pineapple', 'pineapples', 'prosciutto', 'pita', 'punch', 'pepsi', 'pastrami',
  'pecan', 'pecans', 'paella', 'pakora', 'paneer', 'panini', 'panna cotta', 'paprika',
  'parfait', 'parmesan', 'parsley', 'parsnip', 'passion fruit', 'pate', 'patty', 'pea', 'peas',
  'pecorino', 'peppermint', 'pepperoni', 'perch', 'pesto', 'phyllo', 'pilaf', 'pilsner',
  'pimento', 'pinot noir', 'pisco', 'pita bread', 'plantain', 'plum pudding', 'poached egg',
  'polenta', 'pomegranate', 'pomelo', 'popover', 'poppy seeds', 'popsicle', 'pork chop',
  'pot roast', 'potato chips', 'potsticker', 'poutine', 'praline', 'prawn', 'prawns',
  'prosecco', 'provolone', 'prune', 'pumpernickel', 'puree',
  // L
  'lemon', 'lemons', 'lime', 'limes', 'lasagna', 'lettuce', 'lobster', 'lobsters', 'latte',
  'lattes', 'lemonade', 'lamb', 'lentil', 'lentils', 'lollipop', 'lollipops', 'liqueur',
  'leek', 'leeks', 'linguine', 'lager', 'lychee', 'licorice', 'liver', 'loaf', 'loaves',
  'lobster tail', 'lox', 'lunch meat', 'limoncello', 'liverwurst',
  // A
  'apple', 'apples', 'avocado', 'avocados', 'apricot', 'apricots', 'almond', 'almonds',
  'artichoke', 'artichokes', 'asparagus', 'ale', 'anchovy', 'anchovies', 'appetizer',
  'arugula', 'alcohol', 'americano', 'apple juice', 'apple pie', 'apple cider', 'alfredo',
  'allspice', 'amaranth', 'amber ale', 'amaretto', 'angel food cake', 'anise', 'antipasto',
  'apple sauce', 'applesauce', 'aquavit', 'arrowroot', 'asian pear', 'asiago',
  // D
  'donut', 'donuts', 'doughnut', 'doughnuts', 'duck', 'dumpling', 'dumplings', 'dessert',
  'desserts', 'dip', 'drink', 'drinks', 'date', 'dates', 'dill', 'dark chocolate', 'daiquiri',
  'dragonfruit', 'dressing', 'danish', 'dahi', 'dal', 'dandelion greens', 'dashi', 'decaf',
  'deviled eggs', 'diet coke', 'dijon mustard', 'dim sum', 'dinner roll', 'dolma', 'dough',
  'dragon fruit', 'dried fruit', 'drumstick', 'dry martini',
  // G
  'grape', 'grapes', 'grapefruit', 'garlic', 'ginger', 'guacamole', 'gelato', 'gum',
  'gummy', 'gummies', 'goat cheese', 'gouda', 'granola', 'gravy', 'gin', 'green tea',
  'guava', 'goulash', 'ghee', 'gammon', 'garbanzo', 'garlic bread', 'gazpacho', 'gelatin',
  'gherkin', 'giblets', 'ginger ale', 'ginger beer', 'gingerbread', 'gnocchi', 'gooseberry',
  'gorgonzola', 'granita', 'grape juice', 'greek salad', 'greek yogurt', 'green beans',
  'green pepper', 'grits', 'gruyere', 'guinness',
  // F
  'fish', 'fry', 'fries', 'french fries', 'fruit', 'fruits', 'fudge', 'fig', 'figs',
  'fondue', 'flatbread', 'falafel', 'fajita', 'fajitas', 'fettuccine', 'feta', 'fillet',
  'frankfurter', 'frappuccino', 'frappe', 'fennel', 'fenugreek', 'filet mignon', 'fish and chips',
  'fish sauce', 'flan', 'flank steak', 'flaxseed', 'flour', 'focaccia', 'fontina', 'fortune cookie',
  'frittata', 'fritter', 'frozen yogurt', 'fruit salad', 'fruitcake',
  // H
  'hamburger', 'hamburgers', 'hot dog', 'hot dogs', 'honey', 'ham', 'hummus', 'hash brown',
  'hash browns', 'halibut', 'hazelnut', 'hazelnuts', 'hot chocolate', 'herbs', 'habanero',
  'hoagie', 'horseradish', 'herbal tea', 'haddock', 'haggis', 'halva', 'hard cider', 'hard boiled egg',
  'havarti', 'heavy cream', 'heirloom tomato', 'hemp seed', 'hibiscus tea', 'hollandaise',
  'honeydew', 'hot sauce', 'hot wings', 'huckleberry',
  // K
  'kiwi', 'kiwis', 'kebab', 'kebabs', 'kale', 'ketchup', 'kimchi', 'kombucha', 'kidney bean',
  'kidney beans', 'kumquat', 'kohlrabi', 'kit kat', 'knish', 'kahlua', 'kabob', 'kai-lan',
  'kaiser roll', 'kamut', 'kasha', 'kavass', 'kelp', 'ketjap', 'key lime pie', 'kippers',
  'kirsch', 'kiwifruit', 'kombu', 'kosher salt', 'kugel',
  // W
  'water', 'wine', 'wines', 'waffle', 'waffles', 'watermelon', 'watermelons', 'whiskey',
  'whisky', 'walnut', 'walnuts', 'wheat', 'wasabi', 'wonton', 'wontons', 'wrap', 'wraps',
  'white chocolate', 'whipped cream', 'watercress', 'wafer', 'wafers', 'walleye', 'water chestnut',
  'wax beans', 'welsh rarebit', 'wheat bread', 'wheatgrass', 'whey', 'whiskey sour', 'white bread',
  'white rice', 'white wine', 'wiener', 'wild rice', 'worcestershire sauce',
  // Others
  'egg', 'eggs', 'eggplant', 'éclair', 'edamame', 'espresso', 'enchilada', 'endive', 'evoo',
  'ice cream', 'ice', 'iced tea', 'iced coffee', 'irish coffee', 'jalapeno', 'juice', 'juices',
  'jam', 'jelly', 'jerky', 'jasmine rice', 'jambalaya', 'quiche', 'quinoa', 'quesadilla',
  'udon', 'ugli fruit', 'unagi', 'upside down cake', 'veal', 'venison', 'vinegar', 'vanilla',
  'vodka', 'vegetable', 'vegetables', 'yogurt', 'yolk', 'yam', 'yams', 'zucchini', 'ziti'
]);

export const CLOTHING_AND_ACCESSORY_DATASET = new Set([
  // S
  'shirt', 'shirts', 'shorts', 'sweater', 'sweaters', 'skirt', 'skirts', 'socks', 'sock',
  'suit', 'suits', 'sandals', 'sandal', 'scarf', 'scarves', 'shoes', 'shoe', 'sneakers',
  'sneaker', 'slippers', 'slipper', 'sunglasses', 'swimsuit', 'swimsuits', 'suspenders',
  'sweatshirt', 'sweatshirts', 'shawl', 'shawls', 'sombrero', 'stockings', 'stocking',
  'slip', 'snapback', 'sarong', 'sari', 'saree', 'satin robe', 'sweatpants', 'stilettos',
  'stiletto', 'sunhat', 'sundress', 'scrubs', 'shrug', 'safety pin', 'sapphire ring',
  'signet ring', 'silk tie', 'snow boots', 'sombrero', 'spats', 'spectacles', 'sports bra',
  'stud earrings', 'swim trunks',
  // B
  'boots', 'boot', 'belt', 'belts', 'blouse', 'blouses', 'blazer', 'blazers', 'bracelet',
  'bracelets', 'beret', 'berets', 'bow tie', 'bow ties', 'bowtie', 'boxer', 'boxers',
  'bonnet', 'bonnets', 'bikini', 'bikinis', 'bandana', 'bandanas', 'brooch', 'brooches',
  'briefs', 'bathrobe', 'bathrobes', 'beanie', 'beanies', 'bell-bottoms', 'bangles', 'bangle',
  'button-down', 'buckle', 'buckles', 'ballgown', 'balaclava', 'baseball cap', 'bermuda shorts',
  'bib', 'biretta', 'bloomers', 'boa', 'bobby pin', 'bolero', 'bowler hat', 'braces', 'bustier',
  // M
  'mittens', 'mitten', 'muffler', 'mask', 'masks', 'miniskirt', 'miniskirts', 'moccasins',
  'moccasin', 'muumuu', 'monocle', 'mantle', 'military jacket', 'makeup', 'maxi dress',
  'muff', 'manchette', 'mail', 'mule', 'mules', 'maternity dress',
  // R
  'ring', 'rings', 'robe', 'robes', 'raincoat', 'raincoats', 'romper', 'rompers',
  'running shoes', 'rubber boots', 'ribbon', 'ribbons', 'roll-neck', 'riding boots',
  'ruby ring', 'rosette', 'ruffle', 'rain hat', 'running shorts',
  // T
  't-shirt', 't-shirts', 'tshirt', 'tshirts', 'tie', 'ties', 'trousers', 'tuxedo', 'tuxedos',
  'tights', 'top', 'tops', 'trench coat', 'tiara', 'tiaras', 'tank top', 'tank tops',
  'turban', 'turbans', 'tracksuit', 'tracksuits', 'track suit', 'trainers', 'trainer',
  'tote bag', 'turtleneck', 'turtlenecks', 'tunic', 'tunics', 'thong', 'thongs', 'top hat',
  'thermal underwear', 'tam', 'tap shoes', 'tassel', 'tee', 'tippet', 'toque', 'toga', 'tutu',
  // C
  'coat', 'coats', 'cap', 'caps', 'cardigan', 'cardigans', 'cloak', 'cloaks', 'collar',
  'collars', 'cufflink', 'cufflinks', 'corset', 'corsets', 'camisole', 'culottes', 'cape',
  'capes', 'crown', 'crowns', 'choker', 'chokers', 'clogs', 'clog', 'clutch', 'corduroys',
  'chemise', 'cravat', 'chinos', 'cuff', 'cuffs', 'cat suit', 'catsuit', 'chaps', 'chemisette',
  'coif', 'corsage', 'cowboy boots', 'cowboy hat', 'crinoline', 'crop top', 'cummerbund',
  // P
  'pants', 'pullover', 'pullovers', 'pajamas', 'pyjamas', 'poncho', 'ponchos', 'polo',
  'polo shirt', 'purse', 'purses', 'pocket square', 'petticoat', 'parka', 'parkas',
  'platform shoes', 'pendant', 'pendants', 'pinafore', 'peacoat', 'panties', 'pantyhose',
  'pearl necklace', 'pearls', 'peaked cap', 'pillbox hat', 'pith helmet', 'plaid shirt',
  'pocket watch', 'polo neck', 'pumps',
  // L
  'leggings', 'loafers', 'loafer', 'leotard', 'leotards', 'lingerie', 'locket', 'lockets',
  'leg warmers', 'leather jacket', 'lab coat', 'lederhosen', 'lace', 'lapel', 'lehenga',
  'lip ring', 'loungewear',
  // A
  'anorak', 'apron', 'aprons', 'anklet', 'anklets', 'ascot', 'armlet', 'activewear',
  'aviators', 'athletic shoes', 'amulet', 'armband', 'aglet', 'apple watch',
  // D
  'dress', 'dresses', 'denim', 'duffel coat', 'dungarees', 'diaper', 'dirndl', 'derby hat',
  'dog tag', 'diamond ring', 'deck shoes', 'diving suit', 'drawers', 'dressing gown',
  // G
  'gloves', 'glove', 'glasses', 'gown', 'gowns', 'goggles', 'girdle', 'gaiters', 'garters',
  'galoshes', 'gold chain', 'gauntlet', 'garment', 'gemstone ring', 'g-string', 'gillie',
  // F
  'fedora', 'fedoras', 'fleece', 'footwear', 'feather boa', 'flip-flops', 'flip flops',
  'fur coat', 'fascinator', 'fishnets', 'frock', 'flannel', 'flat cap', 'fanny pack',
  // H
  'hat', 'hats', 'hoodie', 'hoodies', 'headband', 'headbands', 'high heels', 'heels',
  'helmet', 'helmets', 'handkerchief', 'halter top', 'harem pants', 'hairband', 'hairclip',
  'hardhat', 'headscarf', 'homburg', 'hood', 'hotpants', 'hoop earrings',
  // K
  'kilt', 'kilts', 'kimono', 'kimonos', 'knee socks', 'kerchief', 'knit cap', 'knickers',
  'kaftan', 'khakis', 'knee pads',
  // W
  'watch', 'watches', 'windbreaker', 'waistcoat', 'wedge shoes', 'wetsuit', 'wellies',
  'wellington boots', 'wedding dress', 'wig', 'wigs', 'wristband', 'wristbands', 'wallet',
  'wool coat', 'wrap', 'waders', 'walking stick', 'wrist watch', 'wide-brim hat',
  // Others
  'earrings', 'earring', 'eyeliner', 'eyepatch', 'insole', 'iron mask', 'jacket', 'jackets',
  'jeans', 'jersey', 'jewelry', 'jumpsuit', 'overalls', 'overcoat', 'oxfords', 'umbrella',
  'underwear', 'undershirt', 'uniform', 'veil', 'vest', 'vests', 'visor', 'zipper'
]);

export const SPORT_AND_GAME_DATASET = new Set([
  // S
  'soccer', 'swimming', 'softball', 'snowboarding', 'skateboarding', 'skiing', 'squash',
  'sailing', 'surfing', 'sumo', 'sumo wrestling', 'snooker', 'scrabble', 'sudoku', 'solitaire',
  'street fighter', 'super mario', 'sonic', 'sim city', 'sledding', 'shooting', 'show jumping',
  'skydiving', 'scuba diving', 'shuffleboard', 'skeleton', 'steeplechase', 'speed skating',
  'synchronised swimming', 'synchronized swimming', 'sailboarding', 'sculling', 'short track',
  'skittles', 'slalom', 'snowshoeing', 'snorkeling', 'speedball', 'speedway', 'squash',
  'street hockey', 'subbuteo', 'super smash bros', 'star wars battlefront', 'skyrim', 'starcraft',
  // B
  'basketball', 'baseball', 'badminton', 'boxing', 'bowling', 'billiards', 'bobsled', 'bobsleigh',
  'biathlon', 'bocce', 'bodybuilding', 'bridge', 'backgammon', 'battleship', 'blackjack',
  'baccarat', 'bmx', 'breakdancing', 'bull riding', 'barefoot waterskiing', 'barre', 'base jumping',
  'baton twirling', 'beach volleyball', 'biathlon', 'bingo', 'bouldering', 'boules', 'bowls',
  'broomball', 'bungee jumping', 'bloodborne', 'bioshock', 'borderlands', 'baldur gate',
  // M
  'marathon', 'martial arts', 'motorsport', 'mountain biking', 'modern pentathlon', 'monopoly',
  'minecraft', 'mario kart', 'mahjong', 'mortal kombat', 'mountaineering', 'motocross',
  'motogp', 'mma', 'mixed martial arts', 'madden', 'mancala', 'minesweeper', 'monster hunter',
  'metal gear solid', 'mass effect', 'mario party', 'mad max',
  // R
  'rugby', 'running', 'rowing', 'roller skating', 'rock climbing', 'racquetball', 'rounders',
  'rodeo', 'ringette', 'raft racing', 'risk', 'roulette', 'roblox', 'rocket league',
  'roller derby', 'rhythmic gymnastics', 'rafting', 'rallying', 'racketlon', 'real tennis',
  'red dead redemption', 'resident evil', 'rayman',
  // T
  'tennis', 'table tennis', 'track and field', 'taekwondo', 'triathlon', 'tag', 'tetherball',
  'touch football', 'trampolining', 'tug of war', 'tic-tac-toe', 'tetris', 'trivia', 'twister',
  'target shooting', 'tchoukball', 'telemark skiing', 'ten-pin bowling', 'tibetan martial arts',
  'touch rugby', 'trail running', 'trap shooting', 'triple jump', 'tekken', 'the sims',
  'tomb raider', 'titanfall', 'total war',
  // C
  'cricket', 'chess', 'cycling', 'curling', 'canoeing', 'climbing', 'checkers', 'clue',
  'carrom', 'call of duty', 'candy land', 'connect four', 'croquet', 'cross-country',
  'cheerleading', 'combat', 'canoeing', 'canyoneering', 'capoeira', 'crossfit', 'canasta',
  'car racing', 'catan', 'civilization', 'cluedo', 'counter-strike', 'cyberpunk', 'crash bandicoot',
  // P
  'polo', 'poker', 'pool', 'parkour', 'pickleball', 'pilates', 'paintball', 'pole vault',
  'powerlifting', 'ping pong', 'pac-man', 'pokemon', 'pubg', 'paddleboarding', 'parachuting',
  'paddle tennis', 'padel', 'paragliding', 'paralympics', 'pentathlon', 'pesapallo', 'petanque',
  'pigeon racing', 'powerboating', 'pictionary', 'portal', 'persona', 'payday',
  // L
  'lacrosse', 'long jump', 'luge', 'lawn bowls', 'laser tag', 'ludo', 'league of legends',
  'limbo', 'line dancing', 'land sailing', 'longboarding', 'lawn tennis', 'left 4 dead',
  // A
  'archery', 'athletics', 'arm wrestling', 'aerobics', 'auto racing', 'air hockey',
  'among us', 'apex legends', 'animal crossing', 'aikido', 'alpinism', 'american football',
  'aquathlon', 'association football', 'assassin creed', 'ark survival',
  // D
  'darts', 'diving', 'dodgeball', 'downhill skiing', 'dressage', 'disc golf', 'disk golf',
  'dominoes', 'doom', 'dota', 'dungeons and dragons', 'decathlon', 'dance dance revolution',
  'dragon boat racing', 'drag racing', 'duathlon', 'demolition derby', 'dark souls', 'diablo',
  'destiny', 'donkey kong',
  // G
  'golf', 'gymnastics', 'gaming', 'gaelic football', 'grand theft auto', 'genshin impact',
  'go', 'gridiron', 'grappling', 'go-karting', 'geocaching', 'goalball', 'greyhound racing',
  'god of war', 'gran turismo', 'gears of war', 'guitar hero',
  // F
  'football', 'fencing', 'figure skating', 'fishing', 'frisbee', 'field hockey', 'foosball',
  'fortnite', 'fifa', 'final fantasy', 'formula one', 'f1', 'freediving', 'floorball',
  'flag football', 'fly fishing', 'footgolf', 'freestyle skiing', 'fall guys', 'forza', 'fallout',
  // H
  'hockey', 'handball', 'horse racing', 'hiking', 'high jump', 'hurdles', 'hunting', 'halo',
  'hearts', 'hopscotch', 'hang gliding', 'horseback riding', 'hurling', 'half marathon',
  'hammer throw', 'harness racing', 'heptathlon', 'hula hoop', 'hitman', 'hollow knight',
  'half-life', 'hearthstone',
  // K
  'karate', 'kayaking', 'kickboxing', 'kite surfing', 'korfball', 'kendo', 'kung fu',
  'karting', 'king of the hill', 'kiting', 'kabaddi', 'kingdom hearts', 'kirby',
  // W
  'wrestling', 'water polo', 'weightlifting', 'windsurfing', 'wakeboarding',
  'wheelchair basketball', 'warhammer', 'wordle', 'world of warcraft', 'wii sports',
  'water skiing', 'whitewater rafting', 'wallyball', 'water aerobics', 'witcher',
  'wolfenstein', 'warcraft',
  // Others
  'ice hockey', 'ice skating', 'inline skating', 'ironman', 'javelin', 'judo', 'jiu-jitsu',
  'jogging', 'juggling', 'jeopardy', 'jenga', 'ultimate frisbee', 'uno', 'unicycle', 'volleyball',
  'video game', 'valorant', 'zelda'
]);

export const JOB_AND_PROFESSION_DATASET = new Set([
  // S
  'scientist', 'scientists', 'soldier', 'soldiers', 'sailor', 'sailors', 'surgeon', 'surgeons',
  'singer', 'singers', 'software engineer', 'security guard', 'salesperson', 'salesman',
  'saleswoman', 'chef', 'stylist', 'secretary', 'student', 'senator', 'sheriff', 'shoemaker',
  'sculptor', 'sanitation worker', 'stuntman', 'stuntwoman', 'sommelier', 'surveyor',
  'songwriter', 'social worker', 'stonemason', 'statistician', 'sailmaker', 'scenographer',
  'seamstress', 'sergeant', 'shepherd', 'shipwright', 'shopkeeper', 'silversmith', 'skipper',
  'sociologist', 'specialist', 'speech therapist', 'spy', 'supervisor', 'swimmer', 'stockbroker',
  // B
  'baker', 'bakers', 'butcher', 'butchers', 'banker', 'bankers', 'barber', 'barbers',
  'builder', 'builders', 'biologist', 'biologists', 'bartender', 'bartenders', 'barrister',
  'botanist', 'bus driver', 'blacksmith', 'barista', 'baristas', 'bricklayer', 'bookkeeper',
  'bodyguard', 'broadcaster', 'bailiff', 'bishop', 'biochemist', 'blacksmith', 'boilermaker',
  'bookbinder', 'boxer', 'brewer', 'broker', 'bureaucrat', 'busker',
  // M
  'manager', 'managers', 'musician', 'musicians', 'mechanic', 'mechanics', 'model', 'models',
  'minister', 'mayor', 'mathematician', 'midwife', 'miner', 'miners', 'magician', 'magicians',
  'monk', 'mailman', 'mason', 'meteorologist', 'marine biologist', 'machinist', 'mortician',
  'merchant', 'maid', 'manicurist', 'marshal', 'masseur', 'masseuse', 'matron', 'mediator',
  'metallurgist', 'microbiologist', 'missionary', 'moderator', 'moneylender', 'motorcyclist',
  // R
  'receptionist', 'reporter', 'reporters', 'radiologist', 'roofer', 'roofers', 'researcher',
  'researchers', 'realtor', 'rabbi', 'referee', 'rancher', 'rescue worker', 'runner',
  'rock star', 'repairman', 'rigger', 'radiographer', 'ranger', 'real estate agent',
  'recording engineer', 'recruiter', 'referee', 'regulator', 'retailer', 'rower',
  // T
  'teacher', 'teachers', 'tailor', 'tailors', 'technician', 'technicians', 'therapist',
  'therapists', 'taxi driver', 'trucker', 'truck driver', 'translator', 'teller', 'tour guide',
  'typist', 'trainer', 'train driver', 'tutor', 'tile setter', 'taxonomist', 'tanner',
  'tax adviser', 'tax collector', 'taxidermist', 'telemarketer', 'teller', 'tester', 'tiler',
  'toll collector', 'toolmaker', 'town planner', 'trader', 'traumatologist', 'treasurer',
  // C
  'chef', 'chefs', 'carpenter', 'carpenters', 'chemist', 'chemists', 'cashier', 'cashiers',
  'clerk', 'clerks', 'coach', 'coaches', 'captain', 'comedian', 'comedians', 'consultant',
  'contractor', 'copywriter', 'chiropractor', 'counselor', 'cinematographer', 'conductor',
  'curator', 'cook', 'cooks', 'cop', 'cops', 'coder', 'coders', 'caretaker', 'cartoonist',
  'caterer', 'chauffeur', 'choreographer', 'civil engineer', 'clergy', 'clown', 'collector',
  'composer', 'concierge', 'coroner', 'councillor', 'courier', 'crane operator', 'criminologist',
  // P
  'pilot', 'pilots', 'police officer', 'policeman', 'policewoman', 'professor', 'professors',
  'painter', 'painters', 'plumber', 'plumbers', 'photographer', 'photographers', 'politician',
  'politicians', 'pharmacist', 'pharmacists', 'psychologist', 'psychologists', 'priest',
  'priests', 'programmer', 'programmers', 'paramedic', 'paramedics', 'poet', 'poets',
  'prosecutor', 'principal', 'physicist', 'physicists', 'potter', 'porter', 'palaeontologist',
  'paralegal', 'pastor', 'pathologist', 'pediatrician', 'performer', 'personal trainer',
  'philosopher', 'physician', 'pianist', 'plasterer', 'playwright', 'podiatrist', 'postman',
  // L
  'lawyer', 'lawyers', 'librarian', 'librarians', 'lifeguard', 'lifeguards', 'lecturer',
  'locksmith', 'landscaper', 'laborer', 'legislator', 'lobbyist', 'linguist', 'logger',
  'lyricist', 'lighting technician', 'laborer', 'landlord', 'laser technician', 'laundress',
  'lead singer', 'leatherworker', 'legal assistant', 'lithographer', 'loader',
  // A
  'actor', 'actors', 'actress', 'actresses', 'artist', 'artists', 'architect', 'architects',
  'accountant', 'accountants', 'astronaut', 'astronauts', 'author', 'authors', 'athlete',
  'athletes', 'archaeologist', 'attorney', 'attorneys', 'astronomer', 'animator', 'agent',
  'anesthesiologist', 'actuary', 'appraiser', 'acrobat', 'adjuster', 'administrator',
  'advisor', 'agronomist', 'air traffic controller', 'alchemist', 'analyst', 'anthropologist',
  // D
  'doctor', 'doctors', 'dentist', 'dentists', 'driver', 'drivers', 'detective', 'detectives',
  'dancer', 'dancers', 'designer', 'designers', 'diplomat', 'diplomats', 'director', 'directors',
  'diver', 'dietitian', 'developer', 'developers', 'disk jockey', 'dj', 'dog walker', 'draftsman',
  'dermatologist', 'dietician', 'dispatcher', 'dock worker', 'doorman', 'drainer', 'drummer',
  // G
  'guard', 'guards', 'gardener', 'gardeners', 'geologist', 'geologists', 'guide', 'grocer',
  'graphic designer', 'goldsmith', 'glassblower', 'governor', 'game developer', 'garbage collector',
  'glazier', 'gamekeeper', 'general', 'geneticist', 'geographer', 'greengrocer', 'gunsmith',
  // F
  'firefighter', 'firefighters', 'farmer', 'farmers', 'fisherman', 'fishermen', 'flight attendant',
  'florist', 'filmmaker', 'financial analyst', 'forensic scientist', 'factory worker',
  'fashion designer', 'founder', 'falconer', 'farrier', 'fencer', 'film producer', 'financier',
  'fireman', 'fishmonger', 'forester', 'fumigator', 'funeral director',
  // H
  'hair stylist', 'hairstylist', 'hairdresser', 'historian', 'hotel manager', 'housekeeper',
  'hygienist', 'hunter', 'herbalist', 'headmaster', 'handyman', 'horticulturalist',
  'health aide', 'haberdasher', 'headmistress', 'hematologist', 'homeopath', 'hospice worker',
  // K
  'karate instructor', 'kindergarten teacher', 'kitchen assistant', 'kennel worker',
  'keyboardist', 'king', 'knight',
  // W
  'waiter', 'waiters', 'waitress', 'waitresses', 'writer', 'writers', 'welder', 'welders',
  'web developer', 'watchmaker', 'woodworker', 'warden', 'weather forecaster', 'window cleaner',
  'wildlife biologist', 'wardrobe assistant', 'waterman', 'weaver', 'weightlifter', 'winemaker',
  // Others
  'electrician', 'engineer', 'economist', 'editor', 'entertainer', 'environmentalist',
  'instructor', 'investigator', 'illustrator', 'internist', 'immunologist', 'judge',
  'journalist', 'jeweler', 'janitor', 'optometrist', 'officer', 'operator', 'veterinarian', 'vet'
]);

export const KITCHEN_ITEM_DATASET = new Set([
  // S
  'spoon', 'spoons', 'spatula', 'spatulas', 'strainer', 'strainers', 'skillet', 'skillets',
  'saucepan', 'saucepans', 'sink', 'sinks', 'stove', 'stoves', 'sponge', 'sponges',
  'shaker', 'shakers', 'silverware', 'saucer', 'saucers', 'scissors', 'scale', 'scales',
  'spice rack', 'steamer', 'slow cooker', 'sieve', 'sieves', 'salad spinner', 'soap',
  'squeeze bottle', 'salt shaker', 'soup spoon', 'stockpot', 'scrubber', 'serving spoon',
  'sheet pan', 'slotted spoon', 'souffle dish', 'spicemaster', 'spit', 'splash guard',
  'sponge holder', 'steak knife', 'straw', 'straws', 'sugar bowl',
  // B
  'bowl', 'bowls', 'blender', 'blenders', 'bottle', 'bottles', 'baking sheet', 'baking sheets',
  'breadbox', 'butter knife', 'bottle opener', 'burner', 'burners', 'basket', 'broom',
  'biscuit cutter', 'basting brush', 'butcher knife', 'beverage dispenser', 'broiler',
  'baster', 'baking dish', 'baking pan', 'barbecue tongs', 'beanpot', 'beer mug', 'beater',
  'bento box', 'blowtorch', 'boning knife', 'bread knife', 'bundt pan',
  // M
  'microwave', 'microwaves', 'mug', 'mugs', 'mixer', 'mixers', 'measuring cup', 'measuring cups',
  'measuring spoon', 'measuring spoons', 'muffin tin', 'muffin pan', 'mortar and pestle',
  'mortar', 'pestle', 'meat thermometer', 'mandoline', 'matches', 'mat', 'melon baller',
  'masher', 'meat cleaver', 'meat tenderizer', 'milk frother', 'mincer', 'mold', 'moka pot',
  // R
  'refrigerator', 'refrigerators', 'fridge', 'rolling pin', 'rolling pins', 'recipe book',
  'rack', 'racks', 'ramekin', 'ramekins', 'roaster', 'roasting pan', 'rice cooker',
  'rag', 'rags', 'range', 'rubber scraper', 'rubber spatula', 'reusable bag', 'ricer',
  // T
  'toaster', 'toasters', 'toaster oven', 'tongs', 'tea kettle', 'kettle', 'teapot', 'teapots',
  'teaspoon', 'teaspoons', 'tablespoon', 'tablespoons', 'tray', 'trays', 'trivet', 'trivets',
  'timer', 'timers', 'trash can', 'towel', 'towels', 'thermometer', 'toothpick', 'toothpicks',
  'tenderizer', 'tupperware', 'tea strainer', 'tea towel', 'thermal flask', 'tin opener',
  'toast rack', 'trash compactor', 'turkey baster',
  // C
  'cup', 'cups', 'corkscrew', 'corkscrews', 'coffee maker', 'colander', 'colanders',
  'cutting board', 'cutting boards', 'cutlery', 'cabinet', 'cabinets', 'can opener',
  'crockpot', 'casserole dish', 'cleaver', 'cleavers', 'counter', 'cake pan', 'cheese grater',
  'chopsticks', 'composter', 'cake stand', 'canister', 'carafe', 'carving knife', 'cast iron skillet',
  'cauldron', 'chafing dish', 'cheese board', 'cheese knife', 'cherry pitter', 'citrus juicer',
  'coffeepot', 'cookie cutter', 'cookie sheet', 'crepe pan', 'cruet', 'custard cup',
  // P
  'pan', 'pans', 'pot', 'pots', 'plate', 'plates', 'pitcher', 'pitchers', 'peeler', 'peelers',
  'parchment paper', 'pepper grinder', 'pepper mill', 'platter', 'platters', 'pot holder',
  'pot holders', 'plastic wrap', 'pizza cutter', 'pizza stone', 'pressure cooker', 'pantry',
  'processor', 'paring knife', 'pasta maker', 'pastry bag', 'pastry brush', 'pepper shaker',
  'pie dish', 'pie pan', 'potato masher', 'potato peeler', 'potholder',
  // L
  'ladle', 'ladles', 'lid', 'lids', 'lunchbox', 'lemon squeezer', 'lighter', 'loaf pan',
  'lazy susan', 'linen', 'liquid measuring cup',
  // A
  'apron', 'aprons', 'aluminum foil', 'tin foil', 'air fryer', 'apple corer', 'appliance',
  'adapter', 'aerator', 'all-clad pan',
  // D
  'dish', 'dishes', 'dishwasher', 'dish soap', 'dish towel', 'drainer', 'drawer',
  'dutch oven', 'decanter', 'dispenser', 'dough scraper', 'dip bowl', 'dishcloth', 'drying rack',
  // G
  'glass', 'glasses', 'grater', 'graters', 'grill', 'gloves', 'garbage disposal', 'garlic press',
  'goblet', 'gravy boat', 'griddle', 'gas stove', 'grease trap', 'grinder',
  // F
  'fork', 'forks', 'freezer', 'frying pan', 'food processor', 'funnel', 'funnels', 'foil',
  'fondue pot', 'fruit bowl', 'french press', 'flour sifter', 'faucet', 'fillet knife',
  'fondue set', 'food scale', 'food storage container',
  // H
  'honey dipper', 'hot pad', 'herb stripper', 'hand mixer', 'hob', 'hood', 'holder',
  'hook', 'hot plate',
  // K
  'knife', 'knives', 'kettle', 'kettles', 'kitchen towel', 'kitchen scale', 'kitchen timer',
  'knife block', 'knife sharpener', 'keurig', 'kitchen shears',
  // W
  'whisk', 'whisks', 'wok', 'woks', 'waffle maker', 'waffle iron', 'wine glass', 'wine glasses',
  'water filter', 'wrap', 'warming drawer', 'wooden spoon', 'wine opener', 'water pitcher',
  'wax paper', 'wine rack', 'wood cutting board'
]);

export const EVERYDAY_OBJECT_DATASET = new Set([
  // S
  'smartphone', 'soap', 'scissors', 'scissor', 'shoe', 'shoes', 'spoon', 'sofa', 'sponge',
  'switch', 'stool', 'stapler', 'staple', 'screen', 'speaker', 'speakers', 'sock', 'socks',
  'suitcase', 'stamp', 'string', 'straw', 'salt', 'saucer', 'sheet', 'shampoo', 'sanitizer',
  'scale', 'sink', 'scarf', 'sunglasses', 'sweater', 'shirt', 'seat', 'spectacles', 'stand',
  'shovel', 'saw', 'screw', 'screwdriver', 'scooter', 'skateboard', 'sponge', 'staples',
  'stationery', 'stopwatch', 'stroller', 'stylus', 'syringe', 'sofa',
  // B
  'book', 'books', 'bottle', 'bottles', 'bag', 'bags', 'bed', 'beds', 'box', 'boxes',
  'brush', 'brushes', 'broom', 'button', 'buttons', 'battery', 'batteries', 'blanket',
  'basket', 'baskets', 'belt', 'bell', 'backpack', 'bin', 'bowl', 'bucket', 'bulb', 'bicycle',
  'binder', 'briefcase', 'bench', 'board', 'bracelet', 'bandage', 'bipod', 'blinds',
  // M
  'mirror', 'mirrors', 'mug', 'mugs', 'mat', 'mats', 'map', 'maps', 'match', 'matches',
  'marker', 'markers', 'mouse', 'mattress', 'mask', 'mop', 'magnet', 'magnets', 'monitor',
  'mobile', 'medal', 'magazine', 'magazines', 'microphone', 'microscope', 'mixer', 'motorcycle',
  // R
  'rug', 'rugs', 'ruler', 'rulers', 'rope', 'ropes', 'ring', 'rings', 'radio', 'radios',
  'razor', 'razors', 'rubber', 'remote', 'remotes', 'remote control', 'roller', 'ribbon',
  'rock', 'refrigerator', 'receiver', 'register', 'rake', 'revolver', 'rifle',
  // T
  'table', 'tables', 'television', 'tv', 'towel', 'towels', 'toothbrush', 'toothpaste',
  'telephone', 'ticket', 'tickets', 'torch', 'tire', 'tires', 'tray', 'pillow', 'pillows',
  'tap', 'toilet', 'tape measure', 'tape', 'tablet', 'tablets', 'timer', 'trash can',
  'thermometer', 'thread', 'thimble', 'thumbtack', 'toaster', 'tongs', 'tool', 'tools',
  // C
  'chair', 'chairs', 'clock', 'clocks', 'cup', 'cups', 'couch', 'camera', 'cameras',
  'comb', 'combs', 'coin', 'coins', 'candle', 'candles', 'charger', 'chargers', 'computer',
  'curtain', 'curtains', 'carpet', 'calendar', 'clip', 'clips', 'cord', 'cords', 'cushion',
  'calculator', 'card', 'cards', 'cap', 'car', 'cars', 'compass', 'canteen', 'crate',
  // P
  'pen', 'pens', 'pencil', 'pencils', 'paper', 'phone', 'phones', 'pillow', 'plate',
  'purse', 'plug', 'plugs', 'plant', 'pot', 'picture', 'pan', 'poster', 'posters',
  'pin', 'pins', 'padlock', 'package', 'pouch', 'printer', 'printers', 'projector',
  'paintbrush', 'paperclip', 'passport', 'penknife', 'pencil case',
  // L
  'lamp', 'lamps', 'laptop', 'laptops', 'lock', 'locks', 'light', 'lights', 'letter',
  'letters', 'ladder', 'ladders', 'lip balm', 'lotion', 'leash', 'luggage', 'leaf', 'lens',
  'lantern', 'lighter', 'lighters', 'lid', 'locket', 'loudspeaker',
  // A
  'alarm clock', 'adapter', 'adapters', 'ashtray', 'axe', 'atlas', 'album', 'armchair',
  'arrow', 'anchor', 'umbrella', 'air conditioner', 'air fryer', 'airpod', 'airpods', 'apron',
  // D
  'door', 'doors', 'desk', 'desks', 'doll', 'dolls', 'dish', 'dishes', 'drawer', 'drawers',
  'diary', 'duvet', 'drain', 'diaper', 'dumbbell', 'dumbbells', 'detector', 'dvd',
  'drill', 'dustpan', 'dictionary', 'doorknob', 'deck of cards',
  // G
  'glasses', 'glass', 'guitar', 'guitars', 'glue', 'glove', 'gloves', 'gate', 'generator',
  'grill', 'garden hose', 'garbage can', 'gavel', 'game', 'globe', 'goggles', 'grater',
  // F
  'fan', 'fans', 'fork', 'forks', 'frame', 'frames', 'flashlight', 'folder', 'folders',
  'faucet', 'fridge', 'flask', 'file', 'flute', 'flag', 'flags', 'freezer', 'flowerpot',
  'funnel', 'fuse', 'fireplace',
  // H
  'hammer', 'hammers', 'hanger', 'hangers', 'headphones', 'helmet', 'helmets', 'hat',
  'hats', 'hose', 'heater', 'handle', 'hairpin', 'hook', 'hooks', 'handkerchief',
  'headset', 'hairdryer', 'handbag', 'hairclip',
  // K
  'key', 'keys', 'knife', 'knives', 'keyboard', 'keyboards', 'kettle', 'kite', 'kites',
  'knob', 'kayak', 'keyring', 'kleenex',
  // W
  'wallet', 'wallets', 'watch', 'watches', 'window', 'windows', 'water bottle', 'wire',
  'wires', 'wheel', 'wheels', 'whistle', 'wrench', 'wardrobe', 'weight', 'weights',
  'whiteboard', 'wheelbarrow', 'watering can', 'wok'
]);

export const SUPERPOWER_AND_SPELL_DATASET = new Set([
  // S
  'super strength', 'super speed', 'shapeshifting', 'shape shifting', 'shield', 'shadow manipulation',
  'summoning', 'sonic scream', 'soul steal', 'sleep', 'stun', 'silence', 'slow motion',
  'shrinking', 'stone skin', 'solar beam', 'spark', 'storm', 'smite', 'spell', 'stealth',
  'telekinesis', 'sight', 'super hearing', 'spirit walk', 'static shock', 'shadow step',
  'stasis', 'shockwave', 'sand manipulation', 'super jump', 'sound blast', 'swordsmanship',
  // B
  'blizzard', 'blast', 'blink', 'bloodbending', 'blood bending', 'banish', 'bubble',
  'berserk', 'bound', 'beam', 'burn', 'barrier', 'bulletproof', 'burrowing', 'blessing',
  'black hole', 'banishment', 'breeze', 'binding', 'body manipulation', 'bone claws',
  // M
  'mind control', 'magic', 'magnetism', 'mind reading', 'mist form', 'multiplication',
  'moonlight', 'meteor', 'memory wipe', 'morphing', 'mirror image', 'metamorphosis',
  'matter manipulation', 'mana blast', 'microscopic vision', 'molecular reconstruction',
  // R
  'regeneration', 'resurrection', 'radiant blast', 'read minds', 'reality warp', 'reflection',
  'revival', 'rage', 'rock throw', 'root', 'radiation', 'reversal', 'recall', 'restoration',
  // T
  'teleportation', 'teleport', 'telepathy', 'telekinetic', 'time travel', 'time stop',
  'thunder', 'thunderbolt', 'transformation', 'transform', 'tornado', 'transfiguration',
  'truth spell', 'toxin', 'tremor', 'thermal vision', 'telekinesis', 'telekinesis wave',
  'tangibility', 'time manipulation',
  // C
  'charm', 'curse', 'clone', 'cloning', 'clairvoyance', 'camouflage', 'cure',
  'chain lightning', 'conjuration', 'combustion', 'cryokinesis', 'cyclone', 'counterspell',
  'chaos', 'chrono shift', 'containment', 'corrosion', 'cosmic power', 'control animals',
  // P
  'pyrokinesis', 'portal', 'portals', 'poison', 'paralysis', 'phase', 'phasing',
  'prophecy', 'purification', 'psionic blast', 'petrification', 'psychic', 'polymorph',
  'possession', 'power absorption', 'precognition', 'pestilence', 'photosynthesis',
  // L
  'levitation', 'lightning', 'lightning bolt', 'light beam', 'laser eyes', 'laser vision',
  'life drain', 'lunar beam', 'luminescence', 'lockpick', 'lullaby', 'lumos', 'light manipulation',
  // A
  'alchemy', 'animagus', 'astral projection', 'avada kedavra', 'accio', 'alohomora',
  'aura', 'aguamenti', 'acid splash', 'animal speech', 'armor', 'agility', 'antigravity',
  'aerokinesis', 'aqua jet',
  // D
  'dark magic', 'dimension hop', 'duplicate', 'duplication', 'disintegration', 'dream walk',
  'dazzle', 'decay', 'doom', 'divine shield', 'defense', 'death touch', 'dispel', 'dimension door',
  // G
  'gravity control', 'giant growth', 'glamour', 'gust of wind', 'guidance', 'ghost form',
  'geomancy', 'glowing', 'growth', 'god strength', 'gravitational pull',
  // F
  'flight', 'force field', 'freeze', 'fireball', 'fire breath', 'foresight', 'frostbite',
  'feather fall', 'flame', 'flare', 'fear', 'flying', 'frost', 'flamethrower', 'flash freeze',
  // H
  'healing', 'heat vision', 'hypnosis', 'hex', 'hurricane', 'holy light', 'haste',
  'hydromancy', 'hallucination', 'hyper speed', 'hover', 'healing touch', 'harm',
  // K
  'kinetic blast', 'karmic strike', 'knock', 'kamehameha', 'kinetic energy',
  // W
  'waterbending', 'wall crawling', 'wind blast', 'wish', 'web slinging', 'weather control',
  'ward', 'wither', 'whirlpool', 'warp', 'water blast', 'wind walk',
  // Others
  'invisibility', 'invulnerability', 'illusion', 'illusions', 'ice beam', 'immortality',
  'intransitive', 'omniscience', 'omnipotence', 'x-ray vision'
]);

export const COUNTRY_AND_CITY_DATASET = new Set([
  // S
  'spain', 'sweden', 'switzerland', 'singapore', 'south africa', 'south korea', 'saudi arabia',
  'serbia', 'slovakia', 'slovenia', 'syria', 'sudan', 'south sudan', 'somalia', 'senegal',
  'sri lanka', 'suriname', 'seychelles', 'sierra leone', 'samoa', 'san marino', 'solomon islands',
  'sydney', 'seoul', 'shanghai', 'san francisco', 'seattle', 'santiago', 'sao paulo', 'stockholm',
  'salzburg', 'sarajevo', 'stuttgart', 'strasbourg', 'sapporo', 'sendai', 'shenzhen', 'san diego',
  'san antonio', 'san jose', 'sacramento', 'salt lake city', 'suva', 'saint petersburg', 'split',
  'seville', 'santorini', 'shiraz', 'samarkand', 'st petersburg',
  // B
  'brazil', 'belgium', 'bangladesh', 'bahamas', 'bahrain', 'barbados', 'belarus', 'belize',
  'benin', 'bhutan', 'bolivia', 'bosnia', 'botswana', 'brunei', 'bulgaria', 'burkina faso',
  'burundi', 'berlin', 'beijing', 'bangkok', 'barcelona', 'brussels', 'budapest', 'buenos aires',
  'boston', 'baltimore', 'birmingham', 'bogota', 'brisbane', 'bordeaux', 'bologna', 'bern',
  'beirut', 'baku', 'belgrade', 'bratislava', 'bucharest', 'brasilia', 'belfast', 'bergen', 'basel',
  // M
  'mexico', 'malaysia', 'maldives', 'mali', 'malta', 'mauritania', 'mauritius', 'micronesia',
  'moldova', 'monaco', 'mongolia', 'montenegro', 'morocco', 'mozambique', 'myanmar', 'madagascar',
  'malawi', 'madrid', 'mumbai', 'munich', 'milan', 'moscow', 'manila', 'melbourne', 'montreal',
  'miami', 'marseille', 'manchester', 'minneapolis', 'memphis', 'macau', 'medellin', 'monterrey',
  'minsk', 'muscat', 'mogadishu', 'maputo', 'montevideo', 'managua', 'malmo',
  // R
  'russia', 'romania', 'rwanda', 'rome', 'rio de janeiro', 'riyadh', 'rotterdam', 'riga',
  'reykjavik', 'rabat', 'raleigh', 'richmond', 'rochester', 'rennes', 'rhodes',
  // T
  'thailand', 'turkey', 'taiwan', 'tanzania', 'togo', 'tonga', 'trinidad', 'trinidad and tobago',
  'tunisia', 'turkmenistan', 'tuvalu', 'tajikistan', 'tokyo', 'toronto', 'taipei', 'tashkent',
  'tbilisi', 'tehran', 'tel aviv', 'tripoli', 'tunis', 'turin', 'tampa', 'toulouse', 'tijuana',
  'the hague', 'tirana', 'thimphu',
  // C
  'canada', 'china', 'colombia', 'croatia', 'cuba', 'cyprus', 'czechia', 'czech republic',
  'chile', 'cameroon', 'cambodia', 'congo', 'costa rica', 'cairo', 'chicago', 'cape town',
  'copenhagen', 'calgary', 'casablanca', 'caracas', 'cologne', 'cannes', 'cambridge', 'cardiff',
  'chennai', 'calcutta', 'colombo', 'cancun', 'curitiba', 'cordoba', 'catania',
  // P
  'poland', 'portugal', 'pakistan', 'panama', 'paraguay', 'peru', 'philippines', 'palau',
  'papua new guinea', 'paris', 'prague', 'philadelphia', 'phoenix', 'pittsburgh', 'portland',
  'perth', 'porto', 'pisa', 'palermo', 'pattaya', 'phnom penh', 'pyongyang', 'puebla',
  // L
  'laos', 'latvia', 'lebanon', 'lesotho', 'liberia', 'libya', 'lithuania', 'luxembourg',
  'london', 'los angeles', 'lisbon', 'lima', 'lyon', 'liverpool', 'leeds', 'leipzig',
  'ljubljana', 'luanda', 'lusaka', 'las vegas', 'louisville', 'lahore', 'lausanne',
  // A
  'argentina', 'australia', 'austria', 'afghanistan', 'albania', 'algeria', 'andorra',
  'angola', 'armenia', 'azerbaijan', 'amsterdam', 'athens', 'auckland', 'atlanta',
  'austin', 'albuquerque', 'ankara', 'algiers', 'adelaide', 'alexandria', 'abu dhabi',
  'antwerp', 'almaty', 'asuncion', 'accra', 'addis ababa', 'amman',
  // D
  'denmark', 'djibouti', 'dominica', 'dominican republic', 'dubai', 'dublin', 'delhi',
  'dallas', 'denver', 'detroit', 'doha', 'dakar', 'damascus', 'dhaka', 'dresden', 'dusseldorf',
  'durban', 'darwin', 'dunedin',
  // G
  'germany', 'greece', 'ghana', 'guatemala', 'guinea', 'guyana', 'gabon', 'gambia', 'georgia',
  'grenada', 'guinea-bissau', 'geneva', 'glasgow', 'guangzhou', 'genoa', 'granada', 'gothenburg',
  'guadalajara', 'georgetown', 'gaza', 'gaborone',
  // F
  'france', 'finland', 'fiji', 'florence', 'frankfurt', 'fukuoka', 'faro', 'fort worth',
  'freetown', 'fukushima',
  // H
  'hungary', 'honduras', 'haiti', 'hong kong', 'helsinki', 'houston', 'havana', 'hanoi',
  'hamburg', 'hyderabad', 'ho chi minh city', 'harare', 'hobart', 'hiroshima',
  // K
  'kenya', 'kazakhstan', 'kuwait', 'kyrgyzstan', 'kiribati', 'korea', 'kyoto', 'kuala lumpur',
  'kiev', 'kyiv', 'kigali', 'kingston', 'katmandu', 'kathmandu', 'kaunas', 'karachi', 'kolkata',
  // W
  'wales', 'warsaw', 'washington', 'washington dc', 'wellington', 'wuhan', 'winnipeg',
  'windhoek', 'wroclaw', 'wolfsburg',
  // Others
  'india', 'indonesia', 'iran', 'iraq', 'ireland', 'israel', 'italy', 'iceland', 'istanbul',
  'islamabad', 'incheon', 'innsbruck', 'japan', 'jamaica', 'jordan', 'tokyo', 'johannesburg',
  'jakarta', 'jerusalem', 'jeddah', 'united kingdom', 'uk', 'united states', 'usa', 'uae',
  'uruguay', 'uzbekistan', 'uganda', 'ukraine', 'vienna', 'venice', 'vancouver', 'valencia',
  'vatican', 'vatican city', 'vietnam', 'venezuela', 'vanuatu', 'yemen', 'zambia', 'zimbabwe',
  'zagreb', 'zurich'
]);

export const BRAND_AND_COMPANY_DATASET = new Set([
  // S
  'sony', 'samsung', 'starbucks', 'spotify', 'subway', 'seiko', 'shell', 'siemens', 'snapchat',
  'shopify', 'salesforce', 'slack', 'spacex', 'sharp', 'suzuki', 'subaru', 'scania', 'saab',
  'skechers', 'swatch', 'supreme', 'sephora', 'steam', 'stella artois', 'smirnoff', 'sprite',
  'schweppes', 'skype', 'stripe', 'square', 'santander', 'standard chartered', 'sennheiser',
  'shure', 'sandisk', 'synology', 'sage', 'spar', 'safeway', 'sainsbury', 'suntory', 'shiseido',
  // B
  'bmw', 'burger king', 'boeing', 'bosch', 'bose', 'balenciaga', 'burberry', 'bentley',
  'bugatti', 'bridgestone', 'bacardi', 'budweiser', 'bud light', 'barclays', 'bnp paribas',
  'bayer', 'basf', 'brother', 'braun', 'beats', 'baskin robbins', 'ben and jerrys', 'blackberry',
  'blizzard', 'bioware', 'bethesda', 'bandai', 'bridgestone', 'banamex', 'badoo', 'bally',
  // M
  'microsoft', 'meta', 'mcdonalds', 'mercedes', 'mercedes-benz', 'mazda', 'michelin', 'mastercard',
  'marriott', 'monster', 'motorola', 'mitsubishi', 'maserati', 'mclaren', 'mini', 'marlboro',
  'moncler', 'miu miu', 'maybelline', 'mac', 'mac cosmetics', 'milka', 'mars', 'm&ms',
  'moet', 'morgan stanley', 'mozilla', 'micro-star', 'msi', 'man', 'mobil', 'mustang',
  // R
  'rolex', 'reebok', 'red bull', 'renault', 'rolls-royce', 'ray-ban', 'ralph lauren', 'razer',
  'roche', 'ricoh', 'rolex', 'ryanair', 'roku', 'reddit', 'riot games', 'rockstar games',
  'roblox', 'revlon', 'rimowa', 'ritter sport', 'rolex',
  // T
  'tesla', 'toyota', 'target', 'tiktok', 'twitter', 't-mobile', 'tag heuer', 'tiffany',
  'timberland', 'tommy hilfiger', 'tudor', 'tata', 'toshiba', 'tcl', 'tripadvisor', 'tinder',
  'twitch', 'total', 'texaco', 'tropicana', 'twix', 'tuborg', 'tsmc',
  // C
  'coca cola', 'coca-cola', 'coke', 'canon', 'chanel', 'cartier', 'chevrolet', 'chevy',
  'citroen', 'chrysler', 'cadillac', 'colgate', 'crest', 'converse', 'calvin klein',
  'coach', 'costco', 'carrefour', 'cisco', 'capgemini', 'citigroup', 'chase', 'corona',
  'carlsberg', 'campbells', 'cadbury', 'cheetos', 'clorox', 'canon', 'casio', 'crayola',
  // P
  'pepsi', 'puma', 'prada', 'porsche', 'peugeot', 'panasonic', 'philips', 'paypal',
  'playstation', 'pampers', 'pantene', 'patagonia', 'patek philippe', 'pillsbury', 'pringles',
  'pizzahut', 'pizza hut', 'polaroid', 'penta', 'pinterest', 'petrobras', 'pfizer', 'pubg',
  // L
  'lego', 'lg', 'lenovo', 'lamborghini', 'land rover', 'lexus', 'louis vuitton', 'levis',
  'levi strauss', 'lorealis', 'loreal', 'lays', 'lipton', 'linkedin', 'logitech', 'lucasfilm',
  'lacoste', 'longines', 'lululemon', 'lush', 'luftansa', 'lufthansa',
  // A
  'apple', 'adidas', 'amazon', 'audi', 'asus', 'acer', 'amd', 'airbnb', 'armani',
  'aston martin', 'alfa romeo', 'asics', 'adobe', 'accenture', 'allianz', 'axa', 'american express',
  'amex', 'abercrombie', 'aeropostale', 'airbus', 'audi', 'aviva', 'avon', 'activision',
  // D
  'disney', 'dell', 'dominos', 'dior', 'ducati', 'dodge', 'dyson', 'danone', 'dove',
  'duracell', 'diesel', 'dolce gabbana', 'dr pepper', 'doritos', 'dunlop', 'dunkin', 'dunkin donuts',
  'dropbox', 'discovery', 'deloitte', 'dhl',
  // G
  'google', 'gucci', 'gap', 'gillette', 'gatorade', 'generalelectric', 'general electric', 'ge',
  'general motors', 'gm', 'garmin', 'gopro', 'godiva', 'guinness', 'glock', 'givenchy',
  'gamestop', 'givaudan', 'glaxosmithkline', 'gsk',
  // F
  'ford', 'ferrari', 'fiat', 'fendi', 'facebook', 'fedex', 'fila', 'fujitsu', 'fujifilm',
  'fossil', 'fox', 'fanta', 'ferrero', 'fisher-price', 'foot locker', 'firestone',
  // H
  'honda', 'hyundai', 'hp', 'hewlett packard', 'hermes', 'h&m', 'heineken', 'harley-davidson',
  'harley', 'hitachi', 'huawei', 'haier', 'hasbro', 'hersheys', 'heinz', 'hilton', 'hyatt',
  'hollister', 'honda', 'hublot', 'hulu',
  // K
  'kfc', 'kia', 'kelloggs', 'kraft', 'kit kat', 'kleenex', 'kroger', 'kobo', 'kingston',
  'kawasaki', 'ktm', 'kenzo', 'kering', 'kPMG',
  // W
  'walmart', 'volkswagen', 'vw', 'volvo', 'warner bros', 'wendys', 'walgreens', 'whirlpool',
  'western digital', 'waze', 'whatsapp', 'wework', 'woolworths', 'wolverine', 'wrangler',
  // Others
  'ikea', 'intel', 'ibm', 'instagram', 'infiniti', 'isuzu', 'jaguar', 'jeep', 'john deere',
  'johnson & johnson', 'jpmorgan', 'jordan', 'uber', 'uniqlo', 'unilever', 'under armour',
  'nintendo', 'nike', 'netflix', 'nvidia', 'nissan', 'nestle', 'nokia', 'new balance',
  'nespresso', 'nutella', 'visa', 'verizon', 'vodafone', 'vans', 'versace', 'vale', 'valentino',
  'rolex', 'zara', 'zenith', 'zoom'
]);

export const MOVIE_AND_TV_DATASET = new Set([
  // S
  'star wars', 'stranger things', 'simpsons', 'shrek', 'spiderman', 'spider-man', 'superman',
  'scarface', 'seinfeld', 'sopranos', 'squid game', 'south park', 'succession', 'sherlock',
  'schindler list', 'shawshank redemption', 'spirited away', 'saving private ryan', 'scream',
  'saw', 'shining', 'shutter island', 'skyfall', 'spectre', 'silence of the lambs', 'sound of music',
  'snow white', 'sleeping beauty', 'star trek', 'spiderman no way home', 'scary movie', 'sin city',
  'snatch', 'superbad', 'step brothers', 'shaun of the dead', 'scott pilgrim', 'suits', 'severance',
  'scandal', 'sons of anarchy', 'smallville', 'spongebob', 'scooby doo', 'sailor moon', 'sesame street',
  // B
  'batman', 'barbie', 'breaking bad', 'blade runner', 'back to the future', 'braveheart',
  'black panther', 'bohemian rhapsody', 'big bang theory', 'better call saul', 'bridgerton',
  'buffy the vampire slayer', 'black mirror', 'brooklyn nine-nine', 'bojack horseman',
  'bambi', 'beauty and the beast', 'brave', 'bugs life', 'big hero 6', 'beetlejuice',
  'blade', 'bourne identity', 'boyhood', 'birdman', 'bad boys', 'blood diamond',
  // M
  'matrix', 'the matrix', 'mulan', 'moana', 'monsters inc', 'mad max', 'memento',
  'mission impossible', 'men in black', 'mean girls', 'modern family', 'mad men',
  'mandalorian', 'marvel', 'moonlight', 'midnight in paris', 'million dollar baby',
  'money heist', 'mindhunter', 'mr bean', 'monk', 'malcolm in the middle', 'macgyver',
  // R
  'ratatouille', 'rocky', 'rambo', 'raiders of the lost ark', 'reservoir dogs', 'requiem for a dream',
  'rush hour', 'rio', 'robbots', 'rick and morty', 'riverdale', 'rome', 'rupaul',
  // T
  'titanic', 'the office', 'the godfather', 'toy story', 'tangled', 'tarzan', 'thor',
  'top gun', 'terminator', 'the dark knight', 'the lion king', 'the prestige', 'the departed',
  'the shining', 'the truman show', 'the avengers', 'ted lasso', 'true detective', 'twin peaks',
  'the crown', 'the boys', 'the witcher', 'twilight', 'transformers', 'tron', 'taxi driver',
  // C
  'cinderella', 'coco', 'cars', 'captain america', 'casablanca', 'citizen kane', 'chinatown',
  'clockwork orange', 'clueless', 'coraline', 'chicago', 'cast away', 'chernobyl', 'community',
  'criminal minds', 'columbo', 'charmed', 'cobra kai', 'cowboy bebop', 'castlevania',
  // P
  'pulp fiction', 'parasite', 'psycho', 'pirates of the caribbean', 'pan labyrinth', 'pinocchio',
  'pocahontas', 'peter pan', 'pokemon', 'peaky blinders', 'parks and recreation', 'prison break',
  'pretty little liars', 'phantom of the opera', 'predator', 'platoon', 'poltergeist',
  // L
  'lion king', 'lord of the rings', 'la la land', 'leon', 'legally blonde', 'life of pi',
  'little mermaid', 'luca', 'loki', 'lost', 'lucifer', 'law and order', 'looney tunes',
  // A
  'avatar', 'avengers', 'aladdin', 'alien', 'aliens', 'apocalypse now', 'amadeus', 'arrival',
  'american beauty', 'american psycho', 'aquaman', 'ant-man', 'arrow', 'arcane', 'archer',
  'american dad', 'adventure time', 'attack on titan', 'animaniacs',
  // D
  'die hard', 'django unchained', 'dune', 'deadpool', 'doctor strange', 'dumbo', 'dracula',
  'district 9', 'donnie darko', 'dexter', 'downton abbey', 'daredevil', 'dragon ball', 'doctor who',
  // G
  'gladiator', 'godfather', 'goodfellas', 'guardians of the galaxy', 'gone with the wind',
  'groundhog day', 'good will hunting', 'get out', 'ghostbusters', 'grease', 'game of thrones',
  'gilmore girls', 'gossip girl', 'grey anatomy', 'glee', 'gravity falls',
  // F
  'frozen', 'finding nemo', 'finding dory', 'fight club', 'forrest gump', 'fargo', 'fantasia',
  'fast and furious', 'ferris bueller', 'frasier', 'friends', 'fleabag', 'family guy', 'futurama',
  'full house', 'fawlty towers', 'firefly',
  // H
  'harry potter', 'hobbit', 'hercules', 'how to train your dragon', 'home alone', 'halloween',
  'heat', 'hulk', 'hannibal', 'house', 'homeland', 'how i met your mother', 'heroes',
  // K
  'kill bill', 'king kong', 'kung fu panda', 'karate kid', 'knives out', 'king richard',
  'killing eve', 'kim possible', 'king of the hill', 'knight rider',
  // W
  'wall-e', 'wolverine', 'wonder woman', 'whiplash', 'wizard of oz', 'westworld', 'wednesday',
  'walking dead', 'wheel of time', 'white lotus', 'wanda vision', 'wire', 'the wire',
  // Others
  'inception', 'interstellar', 'indiana jones', 'iron man', 'it', 'invincible', 'i love lucy',
  'jaws', 'joker', 'jurassic park', 'jurassic world', 'jumanji', 'jackass', 'jeopardy',
  'up', 'umbrella academy', 'ozark', 'orange is the new black', 'x-men', 'yellowstone', 'zootopia'
]);

export const CELEBRITY_AND_CHARACTER_DATASET = new Set([
  // S
  'spiderman', 'spider-man', 'superman', 'shrek', 'simba', 'scar', 'sonic', 'spongebob',
  'squidward', 'snoopy', 'scooby doo', 'shaggy', 'steve jobs', 'stephen hawking', 'shakespeare',
  'snoop dogg', 'selena gomez', 'sandra bullock', 'steve carell', 'samuel l jackson', 'sylvester stallone',
  'stephen king', 'scarlett johansson', 'shakira', 'shawn mendes', 'steph curry', 'stephen curry',
  'steve rogers', 'supergirl', 'sailor moon', 'sasuke', 'sanji', 'saruman', 'sauron', 'severus snape',
  'sirius black', 'snow white', 'sleeping beauty', 'stewie griffin', 'stan smith', 'stan lee',
  // B
  'batman', 'brad pitt', 'beyonce', 'bill gates', 'barack obama', 'bruce lee', 'bruce willis',
  'bruce wayne', 'bob marley', 'britney spears', 'billie eilish', 'ben affleck', 'benjamin franklin',
  'bugs bunny', 'bart simpson', 'bowser', 'buzz lightyear', 'bilbo baggins', 'boba fett', 'blade',
  'black widow', 'black panther', 'barbie', 'betty boop', 'beethoven', 'bach',
  // M
  'mickey mouse', 'mario', 'michael jackson', 'michael jordan', 'messi', 'lionel messi',
  'madonna', 'marilyn monroe', 'morgan freeman', 'matt damon', 'meryl streep', 'muhammad ali',
  'mark zuckerberg', 'miley cyrus', 'macaulay culkin', 'mufasa', 'mulan', 'moana', 'magneto',
  'morpheus', 'maleficent', 'morty', 'meg griffin', 'mozart', 'michelangelo',
  // R
  'ronaldo', 'cristiano ronaldo', 'rihanna', 'robert downey jr', 'ryan reynolds', 'ryan gosling',
  'robin williams', 'keanu reeves', 'ron weasley', 'robin hood', 'robin', 'raphael', 'rick sanchez',
  'raiden', 'ryu', 'red skull', 'riddler', 'remus lupin', 'rapunzel', 'rene descartes',
  // T
  'taylor swift', 'tom cruise', 'tom hanks', 'tom holland', 'tom hardy', 'tiger woods',
  'tupac', 'timothee chalamet', 'thor', 'thanos', 'tony stark', 'tarzan', 'tinkerbell',
  'tweety', 'taz', 'terminator', 't-800', 'toad', 'tyrion lannister', 'tesla', 'nikola tesla',
  // C
  'captain america', 'charles chaplin', 'charlie chaplin', 'clint eastwood', 'chris hemsworth',
  'chris evans', 'chris pratt', 'cillian murphy', 'celine dion', 'cardi b', 'cinderella',
  'catwoman', 'chewbacca', 'chun-li', 'cloud strife', 'captain hook', 'captain jack sparrow',
  'cleopatra', 'caesar', 'julius caesar', 'columbus',
  // P
  'pikachu', 'patrick star', 'peter pan', 'peter parker', 'popeye', 'pluto', 'pinocchio',
  'paul mccartney', 'prince', 'pedro pascal', 'pete davidson', 'post malone', 'pablo picasso',
  'poison ivy', 'penguin', 'palpatine', 'princess leia', 'princess peach', 'pumbaa',
  // L
  'leonardo dicaprio', 'lebron james', 'lady gaga', 'luke skywalker', 'legolas', 'luigi',
  'link', 'loki', 'lara croft', 'lex luthor', 'lucy', 'lisa simpson', 'leonardo da vinci',
  'lincoln', 'abraham lincoln', 'ludwig van beethoven',
  // A
  'ariana grande', 'adele', 'angelina jolie', 'arnold schwarzenegger', 'al pacino',
  'albert einstein', 'aristotle', 'ash ketchum', 'aladdin', 'alice in wonderland', 'aragorn',
  'aquaman', 'ant-man', 'anakin skywalker', 'arthur', 'king arthur', 'achilles', 'ariel',
  // D
  'drake', 'dwayne johnson', 'the rock', 'david beckham', 'david bowie', 'daniel radcliffe',
  'denzel washington', 'donald duck', 'daffy duck', 'donkey', 'donatello', 'darth vader',
  'darth maul', 'dracula', 'deadpool', 'dumbledore', 'daenerys targaryen', 'dr strange', 'darwin',
  // G
  'gordon ramsay', 'george clooney', 'gal gadot', 'gandalf', 'gollum', 'groot', 'goofy',
  'garfield', 'goku', 'geralt of rivia', 'green lantern', 'green goblin', 'ginny weasley',
  'george washington', 'galileo', 'ghandi', 'gandhi',
  // F
  'frodo', 'frodo baggins', 'flash', 'the flash', 'freddy krueger', 'frankenstein', 'fiona',
  'frank sinatra', 'freddie mercury', 'forrest gump', 'frodobaggins',
  // H
  'harry potter', 'hermione granger', 'hermione', 'homer simpson', 'hulk', 'han solo',
  'harley quinn', 'hawkeye', 'hercules', 'harry styles', 'harrison ford', 'hugh jackman',
  'homer', 'he-man', 'hades',
  // K
  'kanye west', 'katy perry', 'keanu reeves', 'kendrick lamar', 'kylie jenner', 'kim kardashian',
  'kobe bryant', 'kirby', 'kratos', 'kakashi', 'kylo ren', 'katniss everdeen',
  // W
  'wolverine', 'wonder woman', 'woody', 'winnie the pooh', 'will smith', 'walt disney',
  'walter white', 'wednesday addams', 'willy wonka', 'winston churchill', 'wolfgang mozart',
  // Others
  'iron man', 'indiana jones', 'elton john', 'emma watson', 'elon musk', 'eminem',
  'elvis presley', 'elvis', 'ed sheeran', 'elsa', 'joker', 'john wick', 'jack sparrow',
  'johnny depp', 'justin bieber', 'jennifer aniston', 'jennifer lopez', 'james bond',
  'oprah winfrey', 'optimus prime', 'yoda', 'yoshi', 'zelda', 'zorro'
]);
