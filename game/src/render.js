// All drawing: the kitchen, the order board, the counter, the plate and the
// screens, painted on one canvas with plain shapes and gradients. No images,
// no fonts loaded over the network: every ingredient icon is drawn here.

import {
  BEST_KEY,
  FIELD,
  FONT,
  INGREDIENTS,
  INGREDIENT_BY_ID,
  LAYOUT,
  PALETTE,
  RECIPE_BY_ID,
} from './config.js';
import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';
import { binRect } from './input.js';

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, weight = 700, align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(value, x, y);
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function heart(ctx, x, y, size, filled) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 16, size / 16);
  ctx.beginPath();
  ctx.moveTo(8, 14);
  ctx.bezierCurveTo(0, 8, 0, 2, 4, 2);
  ctx.bezierCurveTo(6, 2, 8, 4, 8, 6);
  ctx.bezierCurveTo(8, 4, 10, 2, 12, 2);
  ctx.bezierCurveTo(16, 2, 16, 8, 8, 14);
  ctx.closePath();
  ctx.fillStyle = filled ? PALETTE.red : 'rgba(46,33,24,0.18)';
  ctx.fill();
  ctx.restore();
}

/** Draw one ingredient's icon centred at (x, y) inside a `size` box. */
export function drawIngredientIcon(ctx, id, x, y, size) {
  const half = size / 2;
  ctx.save();
  ctx.translate(x, y);
  if (id === 'bun') {
    ctx.fillStyle = INGREDIENT_BY_ID.bun.dark;
    roundRect(ctx, -half, half * 0.25, size, half * 0.55, half * 0.25);
    ctx.fill();
    ctx.fillStyle = INGREDIENT_BY_ID.bun.color;
    ctx.beginPath();
    ctx.arc(0, half * 0.25, half * 0.82, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d0';
    for (const [dx, dy] of [[-0.4, -0.45], [0, -0.62], [0.4, -0.45], [-0.2, -0.3], [0.22, -0.28]]) {
      ctx.beginPath();
      ctx.ellipse(dx * half, dy * half, half * 0.09, half * 0.06, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = INGREDIENT_BY_ID.patty.dark;
    roundRect(ctx, -half, -half * 0.35, size, half * 0.8, half * 0.3);
    ctx.fill();
    ctx.fillStyle = INGREDIENT_BY_ID.patty.color;
    roundRect(ctx, -half * 0.94, -half * 0.45, size * 0.94, half * 0.7, half * 0.28);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (const [dx, dy] of [[-0.5, -0.1], [0.1, 0.12], [0.55, -0.12]]) {
      ctx.beginPath();
      ctx.arc(dx * half, dy * half, half * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = INGREDIENT_BY_ID.lettuce.dark;
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI * 2;
      ctx.arc(Math.cos(angle) * half * 0.55, Math.sin(angle) * half * 0.4, half * 0.45, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.fillStyle = INGREDIENT_BY_ID.lettuce.color;
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const angle = (i / 5) * Math.PI * 2 + 0.3;
      ctx.arc(Math.cos(angle) * half * 0.45, Math.sin(angle) * half * 0.32, half * 0.38, 0, Math.PI * 2);
    }
    ctx.fill();
  } else if (id === 'tomato') {
    ctx.fillStyle = INGREDIENT_BY_ID.tomato.color;
    ctx.beginPath();
    ctx.arc(0, half * 0.1, half * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INGREDIENT_BY_ID.tomato.dark;
    ctx.beginPath();
    ctx.arc(-half * 0.25, -half * 0.15, half * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4f9e44';
    ctx.beginPath();
    ctx.moveTo(0, -half * 0.55);
    ctx.lineTo(-half * 0.35, -half * 0.85);
    ctx.lineTo(0, -half * 0.68);
    ctx.lineTo(half * 0.35, -half * 0.85);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = INGREDIENT_BY_ID.cheese.color;
    ctx.beginPath();
    ctx.moveTo(-half * 0.85, half * 0.5);
    ctx.lineTo(half * 0.85, half * 0.5);
    ctx.lineTo(0, -half * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = INGREDIENT_BY_ID.cheese.dark;
    for (const [dx, dy] of [[-0.25, 0.18], [0.3, 0.05], [0.05, 0.32]]) {
      ctx.beginPath();
      ctx.arc(dx * half, dy * half, half * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'onion') {
    ctx.strokeStyle = INGREDIENT_BY_ID.onion.dark;
    ctx.lineWidth = size * 0.09;
    for (const r of [0.82, 0.58, 0.34]) {
      ctx.beginPath();
      ctx.arc(0, 0, half * r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#efe6f7';
    ctx.beginPath();
    ctx.arc(0, 0, half * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, half * 0.95, half * 0.72, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6b73c';
    ctx.beginPath();
    ctx.arc(half * 0.08, 0, half * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e89b1e';
    ctx.beginPath();
    ctx.arc(half * 0.08, 0, half * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'bacon') {
    ctx.strokeStyle = INGREDIENT_BY_ID.bacon.color;
    ctx.lineWidth = size * 0.26;
    ctx.lineCap = 'round';
    for (const dy of [-0.35, 0.35]) {
      ctx.beginPath();
      ctx.moveTo(-half * 0.85, dy * half);
      ctx.bezierCurveTo(-half * 0.4, (dy - 0.35) * half, half * 0.4, (dy + 0.35) * half, half * 0.85, dy * half);
      ctx.stroke();
    }
    ctx.strokeStyle = '#e8a08e';
    ctx.lineWidth = size * 0.08;
    for (const dy of [-0.35, 0.35]) {
      ctx.beginPath();
      ctx.moveTo(-half * 0.85, dy * half);
      ctx.bezierCurveTo(-half * 0.4, (dy - 0.35) * half, half * 0.4, (dy + 0.35) * half, half * 0.85, dy * half);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** Draw one ingredient as a flat layer of the stack on the plate. */
function drawPlateLayer(ctx, id, x, y, w, h) {
  const ing = INGREDIENT_BY_ID[id];
  ctx.save();
  if (id === 'bun') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h, w / 2, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d0';
    for (const [dx, dy] of [[-0.28, -0.42], [0, -0.6], [0.28, -0.42]]) {
      ctx.beginPath();
      ctx.ellipse(x + w / 2 + dx * w, y + h + dy * h * 1.4, 4, 2.6, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = ing.dark;
    roundRect(ctx, x - 4, y, w + 8, h, h / 2);
    ctx.fill();
    ctx.fillStyle = ing.color;
    roundRect(ctx, x - 2, y - 2, w + 4, h - 2, h / 2);
    ctx.fill();
  } else if (id === 'lettuce') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    for (let i = 0; i <= 8; i += 1) {
      const px = x + (i / 8) * w;
      ctx.quadraticCurveTo(px + w / 16, y + (i % 2 === 0 ? -h * 0.4 : h * 0.9), px + w / 8, y + h * 0.4);
    }
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'tomato') {
    ctx.fillStyle = ing.color;
    roundRect(ctx, x + 6, y, w - 12, h, h / 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, x + 14, y + 2, w - 28, h * 0.35, h * 0.18);
    ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + h);
    ctx.lineTo(x + w - 2, y + h);
    ctx.lineTo(x + w * 0.82, y);
    ctx.lineTo(x + w * 0.18, y);
    ctx.closePath();
    ctx.fill();
  } else if (id === 'onion') {
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = 5;
    for (const inset of [2, 12, 22]) {
      roundRect(ctx, x + inset, y + 1, w - inset * 2, h - 2, 5);
      ctx.stroke();
    }
    ctx.fillStyle = '#efe6f7';
    roundRect(ctx, x + 26, y + 2, w - 52, h - 4, 4);
    ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, x + 4, y, w - 8, h, h / 2);
    ctx.fill();
    ctx.fillStyle = '#f6b73c';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, h * 0.42, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'bacon') {
    ctx.strokeStyle = ing.color;
    ctx.lineWidth = h * 0.42;
    ctx.lineCap = 'round';
    for (const dy of [0.28, 0.72]) {
      ctx.beginPath();
      ctx.moveTo(x + 6, y + h * dy);
      ctx.bezierCurveTo(x + w * 0.3, y + h * (dy - 0.25), x + w * 0.7, y + h * (dy + 0.25), x + w - 6, y + h * dy);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function createRenderer(canvas) {
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;
  const ctx = canvas.getContext('2d');

  function drawWall(time) {
    const grad = ctx.createLinearGradient(0, 0, 0, 452);
    grad.addColorStop(0, PALETTE.wallTop);
    grad.addColorStop(1, PALETTE.wallBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 56, FIELD.width, 396);
    // Tile wainscot.
    ctx.fillStyle = PALETTE.tile;
    ctx.fillRect(0, 380, FIELD.width, 72);
    ctx.strokeStyle = PALETTE.tileLine;
    ctx.lineWidth = 2;
    for (let x = 0; x <= FIELD.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 380);
      ctx.lineTo(x, 452);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(FIELD.width, 380);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 416);
    ctx.lineTo(FIELD.width, 416);
    ctx.stroke();
    // Floor.
    ctx.fillStyle = PALETTE.floor;
    ctx.fillRect(0, 568, FIELD.width, 152);
    ctx.fillStyle = PALETTE.floorDark;
    for (let x = -40; x < FIELD.width; x += 120) {
      ctx.fillRect(x, 640, 120, 4);
    }
    // Window with a sunny street view.
    const win = LAYOUT.window;
    ctx.fillStyle = '#7a5230';
    roundRect(ctx, win.x - 8, win.y - 8, win.w + 16, win.h + 16, 10);
    ctx.fill();
    const sky = ctx.createLinearGradient(win.x, win.y, win.x, win.y + win.h);
    sky.addColorStop(0, '#aee3f5');
    sky.addColorStop(1, '#e8f7d8');
    ctx.fillStyle = sky;
    ctx.fillRect(win.x, win.y, win.w, win.h);
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(win.x + 70, win.y + 55, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    for (const [cx, cy, s] of [[300, 60, 26], [330, 72, 18], [150, 110, 20]]) {
      ctx.beginPath();
      ctx.arc(win.x + cx, win.y + cy, s, 0, Math.PI * 2);
      ctx.arc(win.x + cx + s, win.y + cy + 4, s * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    // Little houses across the street.
    ctx.fillStyle = '#e8a94e';
    ctx.fillRect(win.x + 30, win.y + 150, 90, 70);
    ctx.fillStyle = '#c65a4a';
    ctx.beginPath();
    ctx.moveTo(win.x + 20, win.y + 150);
    ctx.lineTo(win.x + 75, win.y + 118);
    ctx.lineTo(win.x + 130, win.y + 150);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a9e6a';
    ctx.fillRect(win.x + 170, win.y + 160, 80, 60);
    ctx.fillStyle = '#4f7a4a';
    ctx.beginPath();
    ctx.moveTo(win.x + 164, win.y + 160);
    ctx.lineTo(win.x + 210, win.y + 132);
    ctx.lineTo(win.x + 256, win.y + 160);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6fbf4a';
    ctx.beginPath();
    ctx.arc(win.x + 300, win.y + 190, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(win.x + 296, win.y + 190, 8, 30);
    ctx.strokeStyle = '#7a5230';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(win.x + win.w / 2, win.y);
    ctx.lineTo(win.x + win.w / 2, win.y + win.h);
    ctx.moveTo(win.x, win.y + win.h / 2);
    ctx.lineTo(win.x + win.w, win.y + win.h / 2);
    ctx.stroke();
  }

  function drawStove(time) {
    const stove = LAYOUT.stove;
    // Shelf with jars above the stove.
    ctx.fillStyle = '#7a5230';
    ctx.fillRect(stove.x - 10, stove.y - 34, stove.w + 20, 12);
    const jarColors = ['#e8a94e', '#c65a4a', '#6fbf4a', '#c9a7e8'];
    jarColors.forEach((color, i) => {
      const jx = stove.x + 24 + i * 96;
      ctx.fillStyle = color;
      roundRect(ctx, jx, stove.y - 78, 52, 44, 8);
      ctx.fill();
      ctx.fillStyle = '#5a4028';
      ctx.fillRect(jx + 8, stove.y - 86, 36, 10);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(jx + 8, stove.y - 70, 8, 28);
    });
    // Stove body.
    ctx.fillStyle = '#5a4a3e';
    roundRect(ctx, stove.x, stove.y, stove.w, stove.h, 14);
    ctx.fill();
    ctx.fillStyle = '#2e2620';
    roundRect(ctx, stove.x + 14, stove.y + 14, stove.w - 28, 130, 10);
    ctx.fill();
    // Two burners with a pot and a pan.
    const flicker = 0.75 + 0.25 * Math.sin(time * 9);
    for (const [bx, by, r] of [[stove.x + 110, stove.y + 80, 62], [stove.x + 310, stove.y + 80, 56]]) {
      ctx.fillStyle = `rgba(255, ${Math.floor(140 + 60 * flicker)}, 60, ${0.55 * flicker})`;
      ctx.beginPath();
      ctx.arc(bx, by, r * 0.72, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1d1815';
      ctx.beginPath();
      ctx.arc(bx, by, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    // Pot with bubbling soup.
    const px = stove.x + 110;
    const py = stove.y + 80;
    ctx.fillStyle = '#3f3a35';
    roundRect(ctx, px - 58, py - 44, 116, 66, 10);
    ctx.fill();
    ctx.fillStyle = '#8a8078';
    roundRect(ctx, px - 58, py - 44, 116, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#e8862e';
    ctx.beginPath();
    ctx.ellipse(px, py - 40, 50, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i += 1) {
      const bx = px - 28 + i * 26 + Math.sin(time * 2 + i * 2) * 4;
      const by = py - 40 - ((time * 14 + i * 23) % 14);
      ctx.fillStyle = 'rgba(232,134,46,0.8)';
      ctx.beginPath();
      ctx.arc(bx, by, 4 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }
    // Steam curls.
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i += 1) {
      const sx = px - 30 + i * 30;
      const phase = (time * 0.7 + i * 0.33) % 1;
      ctx.globalAlpha = 0.7 * (1 - phase);
      ctx.beginPath();
      ctx.moveTo(sx, py - 52);
      ctx.bezierCurveTo(sx - 8, py - 78 - phase * 22, sx + 8, py - 92 - phase * 22, sx, py - 108 - phase * 22);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Frying pan with a sunny-side egg.
    const fx = stove.x + 310;
    const fy = stove.y + 80;
    ctx.fillStyle = '#22201e';
    ctx.beginPath();
    ctx.arc(fx, fy, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a3632';
    roundRect(ctx, fx + 52, fy - 7, 66, 14, 7);
    ctx.fill();
    drawIngredientIcon(ctx, 'egg', fx, fy, 64);
    // Oven door below.
    ctx.fillStyle = '#2e2620';
    roundRect(ctx, stove.x + 14, stove.y + 160, stove.w - 28, 64, 10);
    ctx.fill();
    ctx.fillStyle = '#ffcf5e';
    roundRect(ctx, stove.x + 40, stove.y + 178, stove.w - 80, 28, 6);
    ctx.fill();
  }

  function drawTopBar(state, best) {
    const bar = LAYOUT.topBar;
    ctx.fillStyle = '#3a2e22';
    ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
    // Chef hat logo.
    ctx.fillStyle = '#fff8e6';
    ctx.beginPath();
    ctx.arc(34, 26, 12, 0, Math.PI * 2);
    ctx.arc(50, 22, 13, 0, Math.PI * 2);
    ctx.arc(64, 28, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(28, 34, 42, 8);
    text(ctx, 'THE GOLDEN LADLE', 84, 36, 24, '#ffe9b0', 800);
    // Shift timer, centre.
    const low = state.timeLeft <= 30 && state.screen === SCREEN_PLAY;
    const timerColor = low ? '#ff7a6a' : '#fff8e6';
    text(ctx, 'SHIFT', 560, 24, 13, '#c9b18a', 700);
    text(ctx, formatTime(state.timeLeft), 560, 50, 26, timerColor, 800);
    // Coins and score: a drawn coin, not an emoji (headless fonts may lack emoji).
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.arc(772, 30, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b98a1e';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, '$', 772, 36, 16, '#8a6a1e', 800, 'center');
    text(ctx, `${state.coins}`, 792, 38, 22, '#ffd94d', 800);
    text(ctx, `SCORE ${state.score}`, 880, 30, 15, '#c9b18a', 700);
    text(ctx, `BEST ${Math.max(best, state.score)}`, 880, 50, 15, '#c9b18a', 700);
    // Hearts.
    for (let i = 0; i < 3; i += 1) {
      heart(ctx, 1020 + i * 30, 20, 22, i < state.lives);
    }
    // Combo.
    if (state.combo >= 2) {
      text(ctx, `COMBO ×${state.combo}`, 1264, 38, 20, '#ffb347', 800, 'right');
    }
  }

  function drawBoard(state, time) {
    const board = LAYOUT.board;
    ctx.fillStyle = PALETTE.board;
    roundRect(ctx, board.x, board.y, board.w, board.h, 12);
    ctx.fill();
    ctx.fillStyle = '#5a4632';
    roundRect(ctx, board.x + 8, board.y + 8, board.w - 16, 34, 8);
    ctx.fill();
    text(ctx, 'ORDER BOARD', board.x + 20, board.y + 32, 17, '#ffe9b0', 800);
    if (state.orders.length === 0) {
      text(ctx, 'No orders yet —', board.x + board.w / 2, board.y + 120, 16, '#c9b18a', 600, 'center');
      text(ctx, 'tickets arrive soon!', board.x + board.w / 2, board.y + 146, 16, '#c9b18a', 600, 'center');
      drawIngredientIcon(ctx, 'egg', board.x + board.w / 2, board.y + 210, 56);
    }
    state.orders.forEach((order, index) => {
      const ty = board.y + 52 + index * (LAYOUT.ticket.h + LAYOUT.ticket.gap);
      const frac = Math.max(0, order.patience / order.patienceMax);
      const urgent = frac < 0.3;
      const bob = urgent ? Math.sin(time * 10) * 2 : 0;
      ctx.save();
      ctx.translate(0, bob);
      ctx.fillStyle = urgent ? PALETTE.ticketHot : PALETTE.ticket;
      roundRect(ctx, board.x + 12, ty, LAYOUT.ticket.w, LAYOUT.ticket.h, 10);
      ctx.fill();
      ctx.strokeStyle = urgent ? '#d94f3d' : '#d8cbb2';
      ctx.lineWidth = urgent ? 3 : 2;
      ctx.stroke();
      text(ctx, `#${order.id}  ${order.name}`, board.x + 26, ty + 28, 18, PALETTE.text, 800);
      text(ctx, `$${order.price}`, board.x + LAYOUT.ticket.w - 2, ty + 28, 18, '#8a6a1e', 800, 'right');
      order.needs.forEach((ingredientId, i) => {
        drawIngredientIcon(ctx, ingredientId, board.x + 40 + i * 52, ty + 58, 34);
      });
      // Patience bar.
      ctx.fillStyle = '#e8ddc8';
      roundRect(ctx, board.x + 26, ty + 82, LAYOUT.ticket.w - 28, 10, 5);
      ctx.fill();
      ctx.fillStyle = frac > 0.5 ? '#4f9e44' : frac > 0.25 ? '#e8a94e' : '#d94f3d';
      roundRect(ctx, board.x + 26, ty + 82, (LAYOUT.ticket.w - 28) * frac, 10, 5);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawCounter(state, hover, time) {
    const counter = LAYOUT.counter;
    ctx.fillStyle = PALETTE.counterEdge;
    roundRect(ctx, counter.x, counter.y, counter.w, counter.h, 12);
    ctx.fill();
    ctx.fillStyle = PALETTE.counterTop;
    roundRect(ctx, counter.x, counter.y, counter.w, 34, 12);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(counter.x + 8, counter.y + 4, counter.w - 16, 4);
    // Label sits right of the order board, clear of its bottom edge.
    text(ctx, 'INGREDIENTS — click a bin or press 1–8', 340, counter.y - 8, 14, PALETTE.muted, 700);
    INGREDIENTS.forEach((ing, index) => {
      const bin = binRect(index);
      const isHover = hover.x >= bin.x && hover.x < bin.x + bin.w && hover.y >= bin.y && hover.y < bin.y + bin.h;
      ctx.fillStyle = isHover ? '#fff3d6' : '#fffaf0';
      roundRect(ctx, bin.x, bin.y, bin.w, bin.h, 10);
      ctx.fill();
      ctx.strokeStyle = isHover ? '#e8a94e' : '#d8cbb2';
      ctx.lineWidth = isHover ? 3 : 2;
      ctx.stroke();
      drawIngredientIcon(ctx, ing.id, bin.x + bin.w / 2, bin.y + 38, 52);
      text(ctx, ing.name, bin.x + bin.w / 2, bin.y + 78, 15, PALETTE.text, 700, 'center');
      ctx.fillStyle = '#8a6a1e';
      ctx.beginPath();
      ctx.arc(bin.x + bin.w - 16, bin.y + 16, 11, 0, Math.PI * 2);
      ctx.fill();
      text(ctx, ing.key, bin.x + bin.w - 16, bin.y + 21, 13, '#fff8e6', 800, 'center');
    });
  }

  function drawPlateArea(state, hover, time) {
    const plate = LAYOUT.plate;
    // Serving station mat.
    ctx.fillStyle = '#6e4522';
    roundRect(ctx, plate.x - 24, plate.y - 14, plate.w + 48, plate.h + 28, 16);
    ctx.fill();
    ctx.fillStyle = '#8a5a2e';
    roundRect(ctx, plate.x - 24, plate.y - 14, plate.w + 48, plate.h + 28, 16);
    ctx.fill();
    // The plate itself.
    const ready = state.plateMatch !== null;
    const glow = ready ? 0.6 + 0.4 * Math.sin(time * 6) : 0;
    if (ready) {
      ctx.save();
      ctx.shadowColor = '#ffd94d';
      ctx.shadowBlur = 30 * glow + 10;
      ctx.fillStyle = PALETTE.plate;
      ctx.beginPath();
      ctx.ellipse(plate.x + plate.w / 2, plate.y + plate.h - 26, 190, 34, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = PALETTE.plateRim;
    ctx.beginPath();
    ctx.ellipse(plate.x + plate.w / 2, plate.y + plate.h - 26, 190, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.plate;
    ctx.beginPath();
    ctx.ellipse(plate.x + plate.w / 2, plate.y + plate.h - 28, 172, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stacked ingredients on the plate.
    const layers = state.plate;
    const layerH = 15;
    const baseY = plate.y + plate.h - 30;
    layers.forEach((ingredientId, i) => {
      const y = baseY - (i + 1) * layerH - (ingredientId === 'bun' && i === layers.length - 1 ? 6 : 0);
      const w = 200 - Math.abs(i - (layers.length - 1) / 2) * 6;
      drawPlateLayer(ctx, ingredientId, plate.x + plate.w / 2 - w / 2, y - layerH, w, layerH + 4);
    });
    if (layers.length === 0) {
      text(ctx, 'Your plate — add ingredients!', plate.x + plate.w / 2, plate.y + 34, 16, '#c9b18a', 600, 'center');
    }
    if (ready) {
      const pulse = 1 + 0.06 * Math.sin(time * 6);
      ctx.save();
      ctx.translate(plate.x + plate.w / 2, plate.y - 2);
      ctx.scale(pulse, pulse);
      text(ctx, 'READY TO SERVE!', 0, 0, 19, '#ffd94d', 800, 'center');
      ctx.restore();
    } else if (layers.length > 0) {
      text(ctx, 'Keep building — match a ticket!', plate.x + plate.w / 2, plate.y - 2, 15, '#fff8e6', 600, 'center');
    }
    // Serve button.
    const serve = LAYOUT.serveButton;
    const serveHover = hover.x >= serve.x && hover.x < serve.x + serve.w && hover.y >= serve.y && hover.y < serve.y + serve.h;
    const serveOn = ready;
    ctx.fillStyle = serveOn ? '#e8a94e' : serveHover ? '#7ab648' : '#4f9e44';
    if (serveOn) {
      ctx.save();
      ctx.shadowColor = '#ffd94d';
      ctx.shadowBlur = 24;
      roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 14);
      ctx.fill();
      ctx.restore();
    } else {
      roundRect(ctx, serve.x, serve.y, serve.w, serve.h, 14);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    roundRect(ctx, serve.x + 6, serve.y + 6, serve.w - 12, 10, 5);
    ctx.fill();
    text(ctx, 'SERVE', serve.x + serve.w / 2, serve.y + 40, 24, '#ffffff', 800, 'center');
    text(ctx, 'Space', serve.x + serve.w / 2, serve.y + 68, 14, 'rgba(255,255,255,0.85)', 600, 'center');
    // Trash button.
    const trash = LAYOUT.trashButton;
    const trashHover = hover.x >= trash.x && hover.x < trash.x + trash.w && hover.y >= trash.y && hover.y < trash.y + trash.h;
    ctx.fillStyle = trashHover ? '#b8452f' : '#8a4a3a';
    roundRect(ctx, trash.x, trash.y, trash.w, trash.h, 14);
    ctx.fill();
    text(ctx, 'TRASH', trash.x + trash.w / 2, trash.y + 40, 22, '#ffffff', 800, 'center');
    text(ctx, 'Backspace', trash.x + trash.w / 2, trash.y + 68, 14, 'rgba(255,255,255,0.85)', 600, 'center');
    // Hint under the plate.
    text(ctx, 'Click the plate to take the top ingredient back off.', plate.x + plate.w / 2, plate.y + plate.h + 16, 13, '#fff8e6', 600, 'center');
  }

  function drawTitle(state, best, time) {
    ctx.fillStyle = 'rgba(46,33,24,0.55)';
    ctx.fillRect(0, 56, FIELD.width, 664);
    const panelX = 240;
    const panelY = 88;
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, panelX, panelY, 800, 536, 18);
    ctx.fill();
    ctx.strokeStyle = '#e8a94e';
    ctx.lineWidth = 4;
    ctx.stroke();
    // Chef hat above the title.
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(panelX + 340, panelY + 52, 16, 0, Math.PI * 2);
    ctx.arc(panelX + 364, panelY + 46, 18, 0, Math.PI * 2);
    ctx.arc(panelX + 388, panelY + 54, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8e0d0';
    ctx.fillRect(panelX + 330, panelY + 62, 68, 10);
    text(ctx, 'THE GOLDEN LADLE', panelX + 400, panelY + 112, 46, PALETTE.text, 800, 'center');
    text(ctx, 'A cozy little bistro cooking game', panelX + 400, panelY + 144, 20, PALETTE.muted, 600, 'center');
    const lines = [
      'Tickets arrive on the order board — each lists a dish and its ingredients.',
      'Click the ingredient bins (or press 1–8) to stack them on your plate.',
      'Match a ticket exactly, then hit SERVE (or Space) before patience runs out.',
    ];
    lines.forEach((line, i) => {
      text(ctx, `•  ${line}`, panelX + 56, panelY + 190 + i * 30, 16, PALETTE.text, 600);
    });
    // The menu: four recipe cards.
    text(ctx, 'TODAY’S MENU', panelX + 56, panelY + 300, 16, '#8a6a1e', 800);
    Object.values(RECIPE_BY_ID).forEach((recipe, index) => {
      const cardX = panelX + 40 + index * 186;
      const cardY = panelY + 312;
      ctx.fillStyle = '#fffdf4';
      roundRect(ctx, cardX, cardY, 174, 96, 10);
      ctx.fill();
      ctx.strokeStyle = '#d8cbb2';
      ctx.lineWidth = 2;
      ctx.stroke();
      text(ctx, recipe.name, cardX + 87, cardY + 24, 15, PALETTE.text, 800, 'center');
      text(ctx, `$${recipe.price}`, cardX + 87, cardY + 46, 14, '#8a6a1e', 800, 'center');
      recipe.needs.forEach((ingredientId, i) => {
        drawIngredientIcon(ctx, ingredientId, cardX + 34 + i * 38, cardY + 72, 28);
      });
    });
    const blink = 0.55 + 0.45 * Math.sin(time * 4);
    ctx.globalAlpha = blink;
    text(ctx, '▶  PRESS SPACE OR CLICK TO START  ◀', panelX + 400, panelY + 452, 23, '#c65a4a', 800, 'center');
    ctx.globalAlpha = 1;
    if (best > 0) text(ctx, `Best score: ${best}`, panelX + 400, panelY + 488, 18, '#8a6a1e', 700, 'center');
    text(ctx, 'P pause  ·  M mute  ·  Backspace trash  ·  one shift lasts 2 min 30 sec', panelX + 400, panelY + 516, 14, PALETTE.muted, 600, 'center');
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(46,33,24,0.6)';
    ctx.fillRect(0, 56, FIELD.width, 664);
    text(ctx, 'PAUSED', FIELD.width / 2, 340, 52, '#fff8e6', 800, 'center');
    text(ctx, 'Press P or click to keep cooking', FIELD.width / 2, 392, 20, '#ffe9b0', 600, 'center');
  }

  function drawOver(state, best) {
    ctx.fillStyle = 'rgba(46,33,24,0.6)';
    ctx.fillRect(0, 56, FIELD.width, 664);
    const panelX = 340;
    const panelY = 130;
    ctx.fillStyle = '#fff8e6';
    roundRect(ctx, panelX, panelY, 600, 430, 18);
    ctx.fill();
    ctx.strokeStyle = '#e8a94e';
    ctx.lineWidth = 4;
    ctx.stroke();
    const isBest = state.score >= best && state.score > 0;
    text(ctx, 'SHIFT OVER!', panelX + 300, panelY + 72, 40, PALETTE.text, 800, 'center');
    if (isBest) text(ctx, '★ NEW BEST SCORE! ★', panelX + 300, panelY + 112, 22, '#c65a4a', 800, 'center');
    const rows = [
      ['Coins earned', `$${state.coins}`],
      ['Dishes served', `${state.served}`],
      ['Orders lost', `${state.lost}`],
      ['Wrong serves', `${state.wrongServes}`],
      ['Final score', `${state.score}`],
      ['Best score', `${Math.max(best, state.score)}`],
    ];
    rows.forEach(([label, value], i) => {
      const ry = panelY + 152 + i * 36;
      text(ctx, label, panelX + 60, ry, 19, PALETTE.muted, 600);
      text(ctx, value, panelX + 540, ry, 19, PALETTE.text, 800, 'right');
    });
    text(ctx, 'Press SPACE or click to cook another shift', panelX + 300, panelY + 396, 18, '#c65a4a', 700, 'center');
  }

  function draw(state, screen, best, hover, muted, time) {
    ctx.save();
    if (state.shake > 0) {
      const mag = state.shake * 14;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }
    drawWall(time);
    drawStove(time);
    drawTopBar(state, best);
    drawBoard(state, time);
    drawCounter(state, hover, time);
    drawPlateArea(state, hover, time);
    if (screen === SCREEN_TITLE) drawTitle(state, best, time);
    else if (screen === SCREEN_PAUSED) drawPaused();
    else if (screen === SCREEN_OVER) drawOver(state, best);
    // Serve flash.
    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 217, 77, ${state.flash * 0.9})`;
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    }
    // Mute indicator.
    if (muted) text(ctx, 'muted (M)', FIELD.width - 16, 700, 14, 'rgba(255,248,230,0.8)', 600, 'right');
    ctx.restore();
  }

  return { draw, drawIngredientIcon };
}

export function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}
