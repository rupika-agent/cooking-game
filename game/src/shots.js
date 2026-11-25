// The screenshot scenes behind ?shot=kitchen|assembly|serve. Each one stages a
// fixed moment of a real shift through the world's own state (orders, plate,
// clock), so the frame is what a short game really looks like and the same
// seed always gives the same frame.

import { SCREEN_PLAY } from './world.js';

/**
 * Stage the named scene on `world` and return the screen to draw over it.
 * Unknown names stage the kitchen scene.
 */
export function stageShot(name, world) {
  if (name === 'assembly') {
    // A Classic Burger three layers in, its ticket waiting with most of its
    // patience left: the dish mid-assembly.
    world.stageScene({
      elapsed: 62,
      timeLeft: 88,
      score: 360,
      coins: 36,
      served: 2,
      orders: ['classic', 'melt', 'salad'],
      patience: 38,
      plate: ['bun', 'patty', 'lettuce'],
    });
  } else if (name === 'serve') {
    // A finished Classic Burger on the plate, its ticket still open: the
    // plate ready to serve, with the serve button lit.
    world.stageScene({
      elapsed: 78,
      timeLeft: 72,
      score: 580,
      coins: 58,
      served: 3,
      combo: 2,
      orders: ['classic', 'stack', 'salad'],
      patience: 30,
      plate: ['bun', 'patty', 'lettuce', 'tomato'],
    });
  } else {
    // The kitchen at the start of a shift: three tickets on the board, the
    // counter full of ingredients, the clock running, the plate empty.
    world.stageScene({
      elapsed: 15,
      timeLeft: 135,
      score: 240,
      coins: 24,
      served: 1,
      orders: ['classic', 'melt', 'salad'],
      patience: 44,
      plate: [],
    });
  }
  return { screen: SCREEN_PLAY };
}
