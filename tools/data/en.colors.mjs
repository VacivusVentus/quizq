// Source data for data/en/colors.json — colours and things whose colour is canonical.
// The answer space is a list of colour names, so only "item -> colour" questions are generated.
export default {
  lang: 'en',
  theme: 'Colors',
  seed: 71602,
  keyQuestions: 0,
  templates: {
    item: [
      'What color is {v}?',
      'Which color does {v} have?',
      'What color would you call {v}?',
      'Name the color of {v}.',
      'What is the usual color of {v}?',
      'Which of these colors describes {v}?',
    ],
  },
  groups: [
    ['red', 'blood', 'a ripe strawberry', 'a poppy', 'a ruby', 'a fly agaric mushroom', 'a ripe tomato', 'pomegranate seeds', 'a fire engine', 'a ripe cranberry', 'a ripe lingonberry'],
    ['orange', 'a carrot', 'a pumpkin', 'a ripe tangerine', 'a ripe persimmon', 'sea buckthorn berries', 'carrot juice', 'a traffic cone', 'a goldfish', 'a basketball'],
    ['yellow', 'a ripe lemon', 'the sun', 'a chick', 'a banana', 'a dandelion', 'a corn cob', 'an egg yolk', 'a sunflower', 'table mustard', 'a birch leaf in autumn'],
    ['green', 'summer foliage', 'summer grass', 'a cucumber', 'a grasshopper', 'peas in a pod', 'pine needles', 'an avocado', 'a plantain leaf', 'a celery stalk', 'a dill stalk'],
    ['blue', 'a clear daytime sky', 'a forget-me-not', 'a sapphire', 'a bilberry', 'ink in a fountain pen', 'denim fabric', 'a cornflower', 'a bog bilberry', 'water in the open ocean'],
    ['violet', 'an eggplant', 'a ripe plum', 'an amethyst', 'a dark bunch of grapes', 'a lavender flower head', 'plum jam', 'grape juice', 'chokeberry berries'],
    ['white', 'milk', 'fresh snow', 'sugar', 'a swan', 'school chalk', 'a cloud in clear weather', 'a daisy', 'table salt', 'wheat flour', 'boiled rice'],
    ['black', 'coal', 'soot', 'a raven', 'a moonless night', 'a panther', 'tar', 'a car tire', 'a mourning ribbon', 'a starless night sky'],
    ['brown', 'chocolate', 'ground coffee', 'oak bark', 'a ripe chestnut', 'mud after rain', 'cocoa powder', 'wet sand', 'a ripe acorn', 'dried tea leaves', 'a wine cork'],
    ['gray', 'ash', 'an elephant', 'a mouse', 'a rain cloud', 'a concrete wall', 'wet asphalt', 'campfire smoke', 'a pigeon', 'cement mortar'],
    ['pink', 'a flamingo', 'a piglet', 'cherry blossom in bloom', 'a blush on the cheeks', 'a dog rose petal', 'cotton candy'],
    ['turquoise', 'the water of a tropical lagoon', 'the sea near a coral reef', 'the shallow water off a sandy beach'],
  ],
};
