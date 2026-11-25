// Keyboard and pointer input. One-shot presses (start, serve, pause, mute) are
// queued as action objects and taken once by the loop, so a press between two
// frames is never lost and never counted twice. Clicks are hit-tested against
// the kitchen layout: ingredient bins, the plate, and the serve/trash buttons.

import { FIELD, INGREDIENTS, LAYOUT } from './config.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_TAP = 'tap';
export const ACTION_PAUSE = 'pause';
export const ACTION_MUTE = 'mute';

const BIN_KEYS = new Map(INGREDIENTS.map((ing) => [`Digit${ing.key}`, ing.id]));
const TRASH_KEYS = new Set(['Backspace', 'KeyX']);
const PAUSE_KEYS = new Set(['KeyP', 'Escape']);
const MUTE_KEYS = new Set(['KeyM']);
const CONFIRM_KEYS = new Set(['Enter', 'Space']);

/** Logical rect of the n-th ingredient bin (bins are centred in the counter). */
export function binRect(index) {
  const total = INGREDIENTS.length * LAYOUT.bin.w + (INGREDIENTS.length - 1) * LAYOUT.bin.gap;
  const startX = LAYOUT.counter.x + (LAYOUT.counter.w - total) / 2;
  return {
    x: startX + index * (LAYOUT.bin.w + LAYOUT.bin.gap),
    y: LAYOUT.counter.y + 10,
    w: LAYOUT.bin.w,
    h: LAYOUT.bin.h,
  };
}

function inside(rect, x, y) {
  return x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h;
}

/** What a click at logical (x, y) does: an action object, or null. */
export function actionAt(x, y) {
  for (let index = 0; index < INGREDIENTS.length; index += 1) {
    if (inside(binRect(index), x, y)) return { type: `add:${INGREDIENTS[index].id}` };
  }
  if (inside(LAYOUT.serveButton, x, y)) return { type: 'serve' };
  if (inside(LAYOUT.trashButton, x, y)) return { type: 'trash' };
  if (inside(LAYOUT.plate, x, y)) return { type: 'pop' };
  return null;
}

export function createInput(canvas, onAction) {
  const hover = { x: -1, y: -1 };

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / FIELD.width, rect.height / FIELD.height);
    const offsetX = (rect.width - FIELD.width * scale) / 2;
    const offsetY = (rect.height - FIELD.height * scale) / 2;
    return {
      x: (event.clientX - rect.left - offsetX) / scale,
      y: (event.clientY - rect.top - offsetY) / scale,
    };
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (BIN_KEYS.has(event.code)) {
      onAction({ type: `add:${BIN_KEYS.get(event.code)}` });
      event.preventDefault();
    } else if (TRASH_KEYS.has(event.code)) {
      onAction({ type: 'trash' });
      event.preventDefault();
    } else if (PAUSE_KEYS.has(event.code)) {
      onAction({ type: ACTION_PAUSE });
      event.preventDefault();
    } else if (MUTE_KEYS.has(event.code)) {
      onAction({ type: ACTION_MUTE });
    } else if (CONFIRM_KEYS.has(event.code)) {
      onAction({ type: ACTION_CONFIRM });
      event.preventDefault();
    }
  });

  canvas.addEventListener('pointermove', (event) => {
    const point = toLogical(event);
    hover.x = point.x;
    hover.y = point.y;
  });
  canvas.addEventListener('pointerleave', () => {
    hover.x = -1;
    hover.y = -1;
  });
  canvas.addEventListener('pointerdown', (event) => {
    const point = toLogical(event);
    const action = actionAt(point.x, point.y);
    if (action !== null) onAction(action);
    // A tap on empty space only starts / resumes; it never serves.
    else onAction({ type: ACTION_TAP });
    event.preventDefault();
  });

  return { hover };
}
