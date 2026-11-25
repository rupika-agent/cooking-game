// A small seeded random number generator (a 32-bit linear congruential generator
// with a Weyl-style increment): the same seed gives the same game, which is what
// makes the screenshot scenes repeatable.

export function createRandom(seed) {
  let state = (seed | 0) >>> 0;
  return function random() {
    // Numerical Recipes constants: a full-period LCG on 32 bits.
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Pick one element of `items` using `random`. */
export function pick(random, items) {
  return items[Math.floor(random() * items.length)];
}

/** A number in [min, max) using `random`. */
export function range(random, min, max) {
  return min + random() * (max - min);
}
