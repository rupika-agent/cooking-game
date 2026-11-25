// The Golden Ladle — tuning numbers, palette, ingredients and recipes in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** How long one shift (one game) lasts, in seconds. */
export const SHIFT_SECONDS = 150;

/** Orders: how often a new ticket arrives, how many can wait, how long a customer waits. */
export const ORDER = {
  firstAfter: 2,
  interval: 13,
  intervalJitter: 5,
  maxActive: 3,
  patience: 50,
  priceBonusMax: 6,
};

/** Combo: serving again within this many seconds of the last serve raises the combo. */
export const COMBO_WINDOW = 10;
export const COMBO_BONUS = 2;

export const LIVES = 3;

/** Ingredients, in counter order. `key` is the keyboard shortcut, `color` the icon's main tone. */
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', key: '1', color: '#e8a94e', dark: '#b97a28' },
  { id: 'patty', name: 'Patty', key: '2', color: '#7a4a26', dark: '#54331a' },
  { id: 'lettuce', name: 'Lettuce', key: '3', color: '#6fbf4a', dark: '#3f8a2c' },
  { id: 'tomato', name: 'Tomato', key: '4', color: '#e84a3c', dark: '#a92e24' },
  { id: 'cheese', name: 'Cheese', key: '5', color: '#f6c945', dark: '#c79a1e' },
  { id: 'onion', name: 'Onion', key: '6', color: '#c9a7e8', dark: '#8a63b8' },
  { id: 'egg', name: 'Egg', key: '7', color: '#fff6dd', dark: '#e8c96a' },
  { id: 'bacon', name: 'Bacon', key: '8', color: '#c65a4a', dark: '#8f3a30' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((ing) => [ing.id, ing]));

/** The menu: four dishes, each four ingredients. A plate matches a dish when its
 *  ingredient multiset equals the recipe's, in any order. */
export const RECIPES = [
  { id: 'classic', name: 'Classic Burger', price: 14, needs: ['bun', 'patty', 'lettuce', 'tomato'] },
  { id: 'melt', name: 'Cheese Melt', price: 16, needs: ['bun', 'patty', 'cheese', 'onion'] },
  { id: 'salad', name: 'Garden Salad', price: 12, needs: ['lettuce', 'tomato', 'onion', 'egg'] },
  { id: 'stack', name: 'Sunny Stack', price: 18, needs: ['bun', 'egg', 'bacon', 'cheese'] },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((recipe) => [recipe.id, recipe]));

/** Layout of the kitchen, in logical pixels. The renderer and the hit-testing share it. */
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1280, h: 56 },
  board: { x: 16, y: 68, w: 296, h: 372 },
  ticket: { w: 272, h: 100, gap: 8 },
  // The counter strip holding the ingredient bins.
  counter: { x: 16, y: 452, w: 1248, h: 116 },
  bin: { w: 138, h: 96, gap: 12 },
  // The serving station at the bottom: plate on the left, buttons on the right.
  plate: { x: 420, y: 584, w: 440, h: 104 },
  serveButton: { x: 900, y: 600, w: 170, h: 88 },
  trashButton: { x: 1090, y: 600, w: 170, h: 88 },
  // The stove and window on the back wall, right of the order board.
  stove: { x: 360, y: 190, w: 420, h: 240 },
  window: { x: 830, y: 84, w: 420, h: 220 },
};

export const PALETTE = {
  wallTop: '#f7e8c8',
  wallBottom: '#eecfa0',
  tile: '#dfe9d8',
  tileLine: '#b9cbb0',
  floor: '#8a5a34',
  floorDark: '#74492a',
  counterTop: '#b97a45',
  counterFront: '#8a5a2e',
  counterEdge: '#6e4522',
  board: '#3a2e22',
  boardPaper: '#fff8e6',
  ticket: '#fffdf4',
  ticketHot: '#ffe9c9',
  plate: '#f4f1ea',
  plateRim: '#c9c2b2',
  text: '#2e2118',
  muted: '#7a6a58',
  cream: '#fff8e6',
  gold: '#e8a94e',
  red: '#d94f3d',
  green: '#4f9e44',
  accent: '#c65a4a',
  shadow: 'rgba(46, 33, 24, 0.25)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'golden-ladle.best';
