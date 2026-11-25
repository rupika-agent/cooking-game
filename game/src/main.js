// Boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps (several in a slow frame, none in a fast one), and the renderer
// paints what is there. The game moves between four screens: title, play,
// paused and shift over.
//
// ?seed=N fixes the order pattern. ?shot=kitchen|assembly|serve (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.

import { STEP } from './config.js';
import { createRandom } from './random.js';
import { createAudio } from './audio.js';
import {
  EVENT_ADD,
  EVENT_EXPIRED,
  EVENT_OVER,
  EVENT_SERVE,
  EVENT_TICK,
  EVENT_WRONG,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  createWorld,
} from './world.js';
import { ACTION_CONFIRM, ACTION_MUTE, ACTION_PAUSE, ACTION_TAP, createInput } from './input.js';
import { createRenderer, readBest, saveBest } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, 0, { x: -1, y: -1 }, false, 1.7);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let muted = false;
  let accumulator = 0;
  let last = performance.now();
  let pending = [];

  const input = createInput(canvas, (action) => {
    audio.unlock();
    if (action.type === ACTION_MUTE) {
      muted = audio.toggleMute();
      return;
    }
    if (action.type === ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        audio.stopSizzle();
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        audio.startSizzle();
        announce('Playing.');
      }
      return;
    }
    if (action.type === ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
      else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        audio.startSizzle();
        announce('Playing.');
      } else if (screen === SCREEN_PLAY) {
        // Space / Enter serves while playing.
        pending.push({ type: 'serve' });
      }
      return;
    }
    if (action.type === ACTION_TAP) {
      // A tap on empty space only starts / resumes; it never serves.
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) startGame();
      else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        audio.startSizzle();
        announce('Playing.');
      }
      return;
    }
    if (screen === SCREEN_PLAY) pending.push(action);
  });

  // Screen readers (and anyone watching the page's text) hear the screen changes.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    screen = SCREEN_PLAY;
    accumulator = 0;
    pending = [];
    audio.startSizzle();
    announce(`Playing. ${world.state.lives} hearts. Serve the tickets before patience runs out.`);
  }

  function endGame() {
    screen = SCREEN_OVER;
    audio.stopSizzle();
    audio.jingle();
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(
      `Shift over. ${world.state.served} dishes served, ${world.state.coins} coins, score ${world.state.score}. Best ${best}.`,
    );
  }

  function react(events) {
    if (events & EVENT_ADD) audio.pop();
    if (events & EVENT_SERVE) {
      audio.ding();
      announce(`Served! ${world.state.coins} coins, combo ${world.state.combo}.`);
    }
    if (events & EVENT_WRONG) {
      audio.buzz();
      announce('That plate matches no ticket. Check the order board.');
    }
    if (events & EVENT_EXPIRED) {
      audio.thud();
      announce(`An order walked out. ${world.state.lives} hearts left.`);
    }
    if (events & EVENT_TICK) audio.tick();
    if (events & EVENT_OVER) endGame();
  }

  function step() {
    if (screen !== SCREEN_PLAY) return;
    const actions = pending;
    pending = [];
    react(world.step(STEP, actions));
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    if (screen === SCREEN_TITLE) {
      // The kitchen simmers behind the title: tickets arrive and patience
      // drains, but nothing is served and no sound plays. If three tickets
      // walk out while nobody is playing, the backdrop quietly restarts.
      world.state.screen = SCREEN_PLAY;
      world.step(STEP, []);
      if (world.state.screen === SCREEN_OVER) world.reset();
      world.state.screen = SCREEN_TITLE;
      accumulator = 0;
    } else if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        step();
        accumulator -= STEP;
        if (screen !== SCREEN_PLAY) {
          accumulator = 0;
          break;
        }
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, input.hover, muted, now / 1000);
  }

  // Leaving the tab pauses a running game rather than letting tickets expire unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      audio.stopSizzle();
      announce('Paused.');
    }
  });

  announce('The Golden Ladle. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
