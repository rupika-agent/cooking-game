// The game's rules and state, with no drawing and no browser in it: the shift
// clock, the order tickets, the plate, serving, combos, lives and the end of
// the shift. step() advances one fixed step and returns what happened as bit
// flags, so the caller can react (sounds, announcements) without the world
// knowing about screens or sound. Nothing here allocates after createWorld
// returns, except the small arrays a serve builds.

import {
  COMBO_BONUS,
  COMBO_WINDOW,
  INGREDIENTS,
  LIVES,
  ORDER,
  RECIPES,
  RECIPE_BY_ID,
  SHIFT_SECONDS,
} from './config.js';
import { pick, range } from './random.js';

export const SCREEN_TITLE = 0;
export const SCREEN_PLAY = 1;
export const SCREEN_PAUSED = 2;
export const SCREEN_OVER = 3;

export const EVENT_ORDER = 1;
export const EVENT_SERVE = 2;
export const EVENT_WRONG = 4;
export const EVENT_EXPIRED = 8;
export const EVENT_OVER = 16;
export const EVENT_TICK = 32;
export const EVENT_ADD = 64;

/** How many ingredients a plate can hold (every recipe needs four). */
const PLATE_CAPACITY = 4;

function sameMultiset(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const item of a) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of b) {
    const left = counts.get(item) ?? 0;
    if (left === 0) return false;
    counts.set(item, left - 1);
  }
  return true;
}

export function createWorld(random) {
  const state = {
    screen: SCREEN_TITLE,
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    lives: LIVES,
    combo: 0,
    comboTimer: 0,
    served: 0,
    lost: 0,
    wrongServes: 0,
    orders: [],
    plate: [],
    nextOrderIn: ORDER.firstAfter,
    orderSeq: 0,
    shake: 0,
    flash: 0,
    lastServeAt: -Infinity,
    lastTickSecond: -1,
    /** The order the last successful serve matched (for the serve animation). */
    servedOrder: null,
    serveAnim: 0,
    /** The dish the plate currently matches, if any (for the READY glow). */
    plateMatch: null,
  };

  function spawnOrder(recipeId = null) {
    const recipe = recipeId !== null ? RECIPE_BY_ID[recipeId] : pick(random, RECIPES);
    state.orderSeq += 1;
    state.orders.push({
      id: state.orderSeq,
      recipeId: recipe.id,
      name: recipe.name,
      price: recipe.price,
      needs: [...recipe.needs],
      patience: ORDER.patience,
      patienceMax: ORDER.patience,
      born: state.elapsed,
    });
    return state.orders[state.orders.length - 1];
  }

  function refreshPlateMatch() {
    state.plateMatch = null;
    if (state.plate.length === 0) return;
    for (const order of state.orders) {
      if (sameMultiset(state.plate, order.needs)) {
        state.plateMatch = order.id;
        return;
      }
    }
  }

  function reset() {
    state.screen = SCREEN_PLAY;
    state.elapsed = 0;
    state.timeLeft = SHIFT_SECONDS;
    state.score = 0;
    state.coins = 0;
    state.lives = LIVES;
    state.combo = 0;
    state.comboTimer = 0;
    state.served = 0;
    state.lost = 0;
    state.wrongServes = 0;
    state.orders.length = 0;
    state.plate.length = 0;
    state.nextOrderIn = ORDER.firstAfter;
    state.orderSeq = 0;
    state.shake = 0;
    state.flash = 0;
    state.lastServeAt = -Infinity;
    state.lastTickSecond = -1;
    state.servedOrder = null;
    state.serveAnim = 0;
    state.plateMatch = null;
  }

  /** Add one ingredient to the plate. Returns false when the plate is full. */
  function addIngredient(ingredientId) {
    if (state.plate.length >= PLATE_CAPACITY) return false;
    state.plate.push(ingredientId);
    refreshPlateMatch();
    return true;
  }

  /** Take the top ingredient back off the plate. */
  function removeTopIngredient() {
    const taken = state.plate.pop();
    refreshPlateMatch();
    return taken ?? null;
  }

  /** Throw the whole plate away. */
  function clearPlate() {
    state.plate.length = 0;
    refreshPlateMatch();
  }

  /**
   * Serve the plate. When it matches an open ticket the ticket leaves, coins
   * and score are paid (faster service pays more, combos pay more), and the
   * plate empties. Otherwise nothing is served. Returns an event flag.
   */
  function serve() {
    if (state.plate.length === 0) return 0;
    const orderIndex = state.orders.findIndex((order) => sameMultiset(state.plate, order.needs));
    if (orderIndex === -1) {
      state.wrongServes += 1;
      state.shake = 0.35;
      return EVENT_WRONG;
    }
    const order = state.orders[orderIndex];
    state.orders.splice(orderIndex, 1);
    const speedBonus = Math.round((order.patience / order.patienceMax) * ORDER.priceBonusMax);
    if (state.elapsed - state.lastServeAt <= COMBO_WINDOW) state.combo += 1;
    else state.combo = 1;
    state.comboTimer = COMBO_WINDOW;
    state.lastServeAt = state.elapsed;
    const comboBonus = (state.combo - 1) * COMBO_BONUS;
    const earned = order.price + speedBonus + comboBonus;
    state.coins += earned;
    state.score += earned * 10;
    state.served += 1;
    state.servedOrder = order;
    state.serveAnim = 0.9;
    state.flash = 0.25;
    state.plate.length = 0;
    state.plateMatch = null;
    return EVENT_SERVE;
  }

  /**
   * One fixed step of play. `actions` is a list of {type} intents the caller
   * collected since the last step ('add:<id>' | 'serve' | 'trash' | 'pop').
   * Returns event flags for the caller to react to.
   */
  function step(dt, actions) {
    let events = 0;
    if (state.screen !== SCREEN_PLAY) return events;
    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
    if (state.flash > 0) state.flash = Math.max(0, state.flash - dt);
    if (state.serveAnim > 0) state.serveAnim = Math.max(0, state.serveAnim - dt);
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 0;
    }

    for (const action of actions) {
      if (action.type === 'serve') events |= serve();
      else if (action.type === 'trash') clearPlate();
      else if (action.type === 'pop') removeTopIngredient();
      else if (action.type.startsWith('add:')) {
        if (addIngredient(action.type.slice(4))) events |= EVENT_ADD;
      }
    }

    state.elapsed += dt;
    state.timeLeft = Math.max(0, SHIFT_SECONDS - state.elapsed);

    const wholeSecond = Math.ceil(state.timeLeft);
    if (state.timeLeft <= 10 && wholeSecond !== state.lastTickSecond) {
      state.lastTickSecond = wholeSecond;
      events |= EVENT_TICK;
    }

    // New tickets arrive on a schedule while there is room on the board.
    state.nextOrderIn -= dt;
    if (state.nextOrderIn <= 0 && state.orders.length < ORDER.maxActive) {
      spawnOrder();
      events |= EVENT_ORDER;
      state.nextOrderIn = ORDER.interval + range(random, -ORDER.intervalJitter, ORDER.intervalJitter);
    } else if (state.nextOrderIn <= 0) {
      state.nextOrderIn = 2;
    }

    // Patience drains; a ticket that runs out walks out and costs a life.
    for (let index = state.orders.length - 1; index >= 0; index -= 1) {
      const order = state.orders[index];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(index, 1);
        state.lost += 1;
        state.lives -= 1;
        state.shake = 0.5;
        state.combo = 0;
        state.comboTimer = 0;
        events |= EVENT_EXPIRED;
        if (state.lives <= 0) {
          state.screen = SCREEN_OVER;
          events |= EVENT_OVER;
          return events;
        }
      }
    }

    if (state.timeLeft <= 0) {
      state.screen = SCREEN_OVER;
      events |= EVENT_OVER;
    }
    return events;
  }

  /** Put the world in a fixed state for a screenshot scene (see shots.js). */
  function stageScene(setup) {
    reset();
    state.screen = SCREEN_PLAY;
    state.elapsed = setup.elapsed ?? 0;
    state.timeLeft = setup.timeLeft ?? SHIFT_SECONDS;
    state.score = setup.score ?? 0;
    state.coins = setup.coins ?? 0;
    state.combo = setup.combo ?? 0;
    state.comboTimer = setup.combo > 0 ? COMBO_WINDOW : 0;
    state.served = setup.served ?? 0;
    for (const recipeId of setup.orders ?? []) {
      const order = spawnOrder(recipeId);
      order.patience = setup.patience ?? order.patienceMax;
    }
    for (const ingredientId of setup.plate ?? []) state.plate.push(ingredientId);
    refreshPlateMatch();
    state.nextOrderIn = 9999;
  }

  return {
    state,
    reset,
    step,
    addIngredient,
    removeTopIngredient,
    clearPlate,
    serve,
    spawnOrder,
    stageScene,
    ingredientIds: INGREDIENTS.map((ing) => ing.id),
  };
}
