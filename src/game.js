// game.js — game state, update loop, spawning, collision and drawing.
//
// WHERE THE TWO PREMISES LIVE (find them quickly):
//   Agency      -> setMovement(), movePlayer(), checkCollision()   (input -> position -> hit or miss)
//   Temporality -> applyDifficulty()                               (elapsed time -> faster blocks)
//   Fairness    -> moveCorridor(), spawnObstacle(), checkFairness()
// Reads every rule from config.js. It never touches the page (HTML) directly:
// it talks to main.js through the "hooks" given to initGame().

import { CONFIG, THEME, ITEMS } from "./config.js";
import { createGameScenery } from "./scenery.js";
import { drawItem, heartPath, roundedRect } from "./items.js";

let canvas;
let ctx;
let hooks;
let state;
let frameId = null;   // id of the one running animation loop (null = no loop)
let lastTime = null;  // timestamp of the previous frame
let scenery;          // pixel-art background layers (see scenery.js)
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Which input sources currently hold each direction (keyboard keys, on-screen buttons).
const held = { left: new Set(), right: new Set() };

// ---------------------------------------------------------------- setup

export function initGame(canvasElement, uiHooks) {
  canvas = canvasElement;
  ctx = canvas.getContext("2d");
  hooks = uiHooks;

  // Sharp drawing on high-density screens; CSS scales the canvas to fit the page.
  const ratio = window.devicePixelRatio || 1;
  canvas.width = CONFIG.canvasWidth * ratio;
  canvas.height = CONFIG.canvasHeight * ratio;
  canvas.style.aspectRatio = `${CONFIG.canvasWidth} / ${CONFIG.canvasHeight}`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  scenery = createGameScenery(CONFIG.canvasWidth, CONFIG.canvasHeight, CONFIG.canvasHeight - CONFIG.playerBottomMarginPx);

  checkFairness().forEach((warning) => console.warn("[Dodge the Blocks]", warning));
  resetGame("normal");
}

export function getState() {
  return state;
}

// Speed at the start of a run. Fast mode differs from Normal ONLY here.
export function getStartSpeed(mode) {
  const multiplier = mode === "fast" ? CONFIG.fastModeMultiplier : 1;
  return Math.min(
    CONFIG.initialObstacleSpeedPxPerSecond * multiplier,
    CONFIG.maximumObstacleSpeedPxPerSecond
  );
}

// ---------------------------------------------------------------- run control

// Puts everything back to a clean, not-yet-started run (score 0, speed reset).
export function resetGame(mode = "normal") {
  stopLoop();
  state = {
    status: "ready",              // "ready" | "playing" | "gameover"
    mode,
    elapsed: 0,                   // simulation seconds survived (not wall-clock time)
    score: 0,
    level: 0,                     // how many speed milestones have been reached
    speed: getStartSpeed(mode),   // current obstacle speed in px/s
    spawnTimer: CONFIG.firstBlockDelayMilliseconds / 1000, // seconds until the next block may appear
    // Hidden "safe path": blocks never spawn on it, so a way through always exists.
    corridor: { x: CONFIG.canvasWidth / 2, target: CONFIG.canvasWidth / 2 },
    lives: CONFIG.startingLives,  // a life absorbs one expense hit (no score loss)
    effects: {},                  // active timed effects: item kind -> seconds left
    popups: [],                   // floating texts ("-5", "+1 life") drawn over the canvas
    endReason: null,              // "crash" | "block" once the run is over
    scroll: 0,                    // how far the clouds have drifted (only for the look of speed)
    obstacles: [],
    player: {
      size: CONFIG.playerSize,
      x: (CONFIG.canvasWidth - CONFIG.playerSize) / 2,
      y: CONFIG.canvasHeight - CONFIG.playerSize - CONFIG.playerBottomMarginPx
    }
  };
  draw();
  hooks.onUpdate(getHudInfo());
}

export function startGame(mode) {
  resetGame(mode);
  state.status = "playing";
  lastTime = null;
  frameId = requestAnimationFrame(loop);
}

function stopLoop() {
  if (frameId !== null) cancelAnimationFrame(frameId);
  frameId = null;
}

function endGame(reason) {
  state.status = "gameover";
  state.endReason = reason;
  stopLoop();
  draw(); // freeze the final frame
  hooks.onUpdate(getHudInfo());
  hooks.onGameOver(getHudInfo());
}

// ---------------------------------------------------------------- the loop

function loop(now) {
  // Delta time in seconds, capped so a paused tab cannot cause a giant jump.
  const seconds = lastTime === null ? 0 : (now - lastTime) / 1000;
  lastTime = now;
  update(Math.min(seconds, CONFIG.maxFrameSeconds));
  draw();
  hooks.onUpdate(getHudInfo());
  frameId = state.status === "playing" ? requestAnimationFrame(loop) : null;
}

function update(dt) {
  if (state.status !== "playing") return;

  state.elapsed += dt;
  tickEffects(dt);
  tickPopups(dt);
  const fallSpeed = state.speed * getSpeedMultiplier();
  state.scroll += fallSpeed * CONFIG.cloudScrollRatio * dt;
  applyDifficulty();
  movePlayer(dt);
  moveCorridor(dt);
  spawnBlocks(dt);

  for (const obstacle of state.obstacles) {
    obstacle.y += fallSpeed * dt;

    if (checkCollision(state.player, obstacle)) {
      obstacle.hit = true; // the item is used up when touched
      if (collectItem(obstacle)) return; // the run ended; nothing else updates
      continue;
    }

    // Temporality + Agency payoff: a harmful item got past the player without a hit.
    if (!obstacle.scored && obstacle.y > state.player.y + state.player.size) {
      obstacle.scored = true;
      if (ITEMS[obstacle.kind].group !== "reward") addScore(1);
    }
  }

  state.obstacles = state.obstacles.filter((o) => !o.hit && o.y < CONFIG.canvasHeight);
}

// ---------------------------------------------------------------- items and effects

// Points gained are doubled while the x2 Bonus is active (penalties too, see collectItem).
function addScore(points) {
  state.score += points * (isActive("double") ? ITEMS.double.multiplier : 1);
}

function isActive(kind) {
  return (state.effects[kind] || 0) > 0;
}

function startEffect(kind) {
  state.effects[kind] = ITEMS[kind].duration;
}

function tickEffects(dt) {
  for (const kind of Object.keys(state.effects)) {
    state.effects[kind] -= dt;
    if (state.effects[kind] <= 0) delete state.effects[kind];
  }
}

// How much faster/slower than the base speed things fall (Speed x2 and Slow time can cancel out).
function getSpeedMultiplier() {
  return (isActive("rush") ? ITEMS.rush.multiplier : 1) * (isActive("slow") ? ITEMS.slow.multiplier : 1);
}

function addPopup(text, color) {
  const p = state.player;
  state.popups.push({ text, color, x: p.x + p.size / 2, y: p.y - 6, age: 0 });
}

function tickPopups(dt) {
  state.popups.forEach((popup) => { popup.age += dt; });
  state.popups = state.popups.filter((popup) => popup.age < CONFIG.popupSeconds);
}

// The player touched an item. Returns true if this ended the run.
function collectItem(obstacle) {
  const item = ITEMS[obstacle.kind];

  if (item.group === "reward") {
    if (obstacle.kind === "life") {
      if (state.lives >= CONFIG.maxLives) {
        addPopup("Lives full", "#ffffff");
      } else {
        state.lives += 1;
        addPopup("+1 life", "#ff8ab8");
      }
    } else {
      startEffect(obstacle.kind);
      addPopup(item.name, "#fff176");
    }
    hooks.onEvent(`${item.name}!`);
    return false;
  }

  // Expenses and bad mods: a Shield blocks both.
  if (isActive("shield")) {
    addPopup("Blocked!", "#22d3ee");
    return false;
  }

  if (item.group === "mod") {
    startEffect(obstacle.kind);
    addPopup(item.name, "#e9b6ff");
    hooks.onEvent(`${item.name}!`);
    return false;
  }

  // Expense. Crash ends the run even if you have lives.
  if (item.ignoresLives) {
    endGame("crash");
    return true;
  }
  // Block, Small expense and Big expense: a heart takes the hit if you have one.
  if (state.lives > 0) {
    state.lives -= 1;
    addPopup("-1 life", "#ff8a8a");
    hooks.onEvent("Life lost!");
    return false;
  }
  // No heart left: the classic Block ends the run.
  if (item.fatal) {
    endGame("block");
    return true;
  }
  // "-1" and "-5" simply come off the score (it may even go below 0).
  // The x2 Bonus doubles this too, so -5 becomes -10.
  const cost = item.penalty * (isActive("double") ? ITEMS.double.multiplier : 1);
  state.score -= cost;
  addPopup(`-${cost}`, "#ff8a8a");
  return false;
}

// ---------------------------------------------------------------- Temporality

// Every difficultyIntervalSeconds of elapsed game time the speed goes up.
export function applyDifficulty() {
  const reachedLevel = Math.floor(state.elapsed / CONFIG.difficultyIntervalSeconds);
  if (reachedLevel <= state.level) return;

  state.level = reachedLevel;
  const newSpeed = Math.min(
    getStartSpeed(state.mode) + reachedLevel * CONFIG.speedIncreasePxPerSecond,
    CONFIG.maximumObstacleSpeedPxPerSecond
  );
  if (newSpeed > state.speed) {
    state.speed = newSpeed;
    hooks.onSpeedUp(getHudInfo());
  }
}

// ---------------------------------------------------------------- Agency

// source = who is pressing ("KeyA", "button"...), so two inputs can hold the same direction.
export function setMovement(direction, source, isPressed) {
  if (isPressed) held[direction].add(source);
  else held[direction].delete(source);
}

export function releaseAllMovement() {
  held.left.clear();
  held.right.clear();
}

// -1 = left, +1 = right, 0 = none. Holding both directions cancels out.
// The Reverse bad mod swaps left and right.
function getDirection() {
  const direction = (held.right.size > 0 ? 1 : 0) - (held.left.size > 0 ? 1 : 0);
  return isActive("reverse") ? -direction : direction;
}

function movePlayer(dt) {
  const player = state.player;
  player.x += getDirection() * CONFIG.playerSpeedPxPerSecond * dt;
  // Never leave the playfield.
  player.x = Math.max(0, Math.min(CONFIG.canvasWidth - player.size, player.x));
}

// ---------------------------------------------------------------- obstacles

// Blocks appear one by one at random moments. Nobody waits for the previous block to
// leave, and some moments simply have no block (spawnSkipChance).
function spawnBlocks(dt) {
  state.spawnTimer -= dt;
  while (state.spawnTimer <= 0) {
    const delayMs = CONFIG.spawnDelayMinMilliseconds +
      Math.random() * (CONFIG.spawnDelayMaxMilliseconds - CONFIG.spawnDelayMinMilliseconds);
    state.spawnTimer += delayMs / 1000;
    if (Math.random() >= CONFIG.spawnSkipChance) spawnObstacle();
  }
}

// Picks what falls next: a random item, more likely when its weight is bigger.
function pickItemKind() {
  const weights = Object.entries(ITEMS).map(([kind, item]) => [kind, item.weight]);
  let roll = Math.random() * weights.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [kind, weight] of weights) {
    roll -= weight;
    if (roll < 0) return kind;
  }
  return weights[0][0];
}

// Adds one item at a random valid x. Harmful items (expenses, bad mods) avoid the hidden
// safe path (fairness); rewards may land anywhere. Nothing spawns right on top of another item.
export function spawnObstacle() {
  const kind = pickItemKind();
  const harmful = ITEMS[kind].group !== "reward";
  const half = getCorridorHalfWidth();
  for (let attempt = 0; attempt < CONFIG.spawnPlacementAttempts; attempt++) {
    const x = Math.random() * (CONFIG.canvasWidth - CONFIG.obstacleWidth);

    const onSafePath = harmful && x < state.corridor.x + half && x + CONFIG.obstacleWidth > state.corridor.x - half;
    const touchesAnother = state.obstacles.some(
      (o) => o.y < CONFIG.minBlockSpacingPx && x < o.x + o.width && x + CONFIG.obstacleWidth > o.x
    );
    if (onSafePath || touchesAnother) continue;

    state.obstacles.push({
      kind,
      x,
      y: -CONFIG.obstacleHeight, // just above the top edge
      width: CONFIG.obstacleWidth,
      height: CONFIG.obstacleHeight,
      scored: false
    });
    return;
  }
  // No valid spot found this time: just skip this block.
}

// Axis-aligned rectangle overlap.
export function checkCollision(player, obstacle) {
  return (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.size > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.size > obstacle.y
  );
}

// ---------------------------------------------------------------- info for the page

function getHudInfo() {
  const maxed = state.speed >= CONFIG.maximumObstacleSpeedPxPerSecond;
  const intoInterval = state.elapsed % CONFIG.difficultyIntervalSeconds;
  const speedRange = CONFIG.maximumObstacleSpeedPxPerSecond - getStartSpeed(state.mode);
  return {
    status: state.status,
    mode: state.mode,
    score: state.score,
    elapsed: state.elapsed,
    level: state.level,
    lives: state.lives,
    endReason: state.endReason,
    maxLevel: Math.max(1, Math.ceil(speedRange / Math.max(1, CONFIG.speedIncreasePxPerSecond))),
    speed: state.speed,
    maxed,
    secondsToNextSpeedUp: CONFIG.difficultyIntervalSeconds - intoInterval,
    progressToNextSpeedUp: maxed ? 1 : intoInterval / CONFIG.difficultyIntervalSeconds
  };
}

// ---------------------------------------------------------------- fairness

// IDEA: the "safe path" is an invisible lane that wanders left and right. Blocks never
// spawn on it. It moves slower than the player can run (even when blocks are at their
// fastest), so the player can always follow it: every block is avoidable.

function getSlowestSpeed() {
  return Math.min(CONFIG.initialObstacleSpeedPxPerSecond, CONFIG.maximumObstacleSpeedPxPerSecond);
}

// Fastest the safe path may move sideways (px per second).
function getCorridorSpeed() {
  const catchUpRatio = getSlowestSpeed() / CONFIG.maximumObstacleSpeedPxPerSecond;
  return CONFIG.playerSpeedPxPerSecond * catchUpRatio * CONFIG.corridorSafetyFactor;
}

// Half of the no-block zone around the safe path: the player's body, a margin, and the
// distance the path drifts while a block (plus the player) passes by.
function getCorridorHalfWidth() {
  const drift =
    (CONFIG.playerSpeedPxPerSecond * CONFIG.corridorSafetyFactor *
      (CONFIG.obstacleHeight + CONFIG.playerSize)) / CONFIG.maximumObstacleSpeedPxPerSecond;
  return CONFIG.playerSize / 2 + CONFIG.safeGapMarginPx + drift;
}

// Moves the safe path toward a random target, never faster than getCorridorSpeed().
function moveCorridor(dt) {
  const path = state.corridor;
  const step = getCorridorSpeed() * dt;
  const distance = path.target - path.x;
  if (Math.abs(distance) <= step) {
    path.x = path.target;
    const half = getCorridorHalfWidth();
    const low = Math.min(half, CONFIG.canvasWidth / 2);
    const high = Math.max(CONFIG.canvasWidth - half, CONFIG.canvasWidth / 2);
    path.target = low + Math.random() * (high - low);
  } else {
    path.x += Math.sign(distance) * step;
  }
}

// Returns a list of warnings (empty = fair). Edit CONFIG and look at the console.
export function checkFairness() {
  const c = CONFIG;
  const warnings = [];

  if (getCorridorHalfWidth() * 2 + c.obstacleWidth > c.canvasWidth) {
    warnings.push(
      "The safe path is too wide for the playfield. Lower safeGapMarginPx, playerSpeedPxPerSecond or the " +
      "maximum speed, or widen the canvas."
    );
  }
  if (c.spawnDelayMinMilliseconds > c.spawnDelayMaxMilliseconds) {
    warnings.push("spawnDelayMinMilliseconds must not be larger than spawnDelayMaxMilliseconds.");
  }
  if (c.corridorSafetyFactor <= 0 || c.corridorSafetyFactor > 1) {
    warnings.push("corridorSafetyFactor should be between 0 and 1.");
  }
  if (c.maxFrameSeconds * c.maximumObstacleSpeedPxPerSecond * ITEMS.rush.multiplier >= c.obstacleHeight + c.playerSize) {
    warnings.push("maxFrameSeconds is too large: fast blocks could pass through the player.");
  }
  return warnings;
}

// ---------------------------------------------------------------- drawing

export function draw() {
  // Layers from back to front: sky + clouds, city + grass, items, player, popups, HUD on the canvas.
  scenery.drawSky(ctx, reduceMotion ? 0 : state.scroll);
  scenery.drawGround(ctx);
  state.obstacles.forEach((o) => drawItem(ctx, ITEMS[o.kind], o.x, o.y, o.width, o.height));
  // Ghost mode: the player cannot be seen (it still moves and still gets hit).
  if (!isActive("ghost")) {
    drawPlayer(state.player);
    if (isActive("shield")) drawShieldRing(state.player);
  }
  drawPopups();
  drawLives();
  drawEffectBadges();
}

function drawShieldRing(p) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x + p.size / 2, p.y + p.size / 2, p.size * 0.85, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = ITEMS.shield.color;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.restore();
}

function drawPopups() {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = '800 18px "Avenir Next", "Segoe UI", system-ui, sans-serif';
  ctx.lineJoin = "round";
  ctx.lineWidth = 4;
  ctx.strokeStyle = THEME.obstacleOutline;
  for (const popup of state.popups) {
    const t = popup.age / CONFIG.popupSeconds;
    ctx.globalAlpha = 1 - t * t;
    const y = popup.y - t * 34;
    ctx.strokeText(popup.text, popup.x, y);
    ctx.fillStyle = popup.color;
    ctx.fillText(popup.text, popup.x, y);
  }
  ctx.restore();
}

// Top left: one heart per possible life. Full = a life you have, faded outline = an empty slot.
function drawLives() {
  const size = 22;
  const gap = 6;
  const pad = 6;
  const width = CONFIG.maxLives * size + (CONFIG.maxLives - 1) * gap + pad * 2;
  ctx.save();
  roundedRect(ctx, 8, 8, width, size + pad * 2, 8);
  ctx.fillStyle = "rgba(6, 27, 69, 0.7)";
  ctx.fill();
  for (let i = 0; i < CONFIG.maxLives; i++) {
    heartPath(ctx, 8 + pad + size / 2 + i * (size + gap), 8 + pad + size / 2, size);
    if (i < state.lives) {
      ctx.fillStyle = ITEMS.life.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Top right: one badge per active timed effect, with a bar that drains as time runs out.
function drawEffectBadges() {
  const width = 104;
  const height = 28;
  const x = CONFIG.canvasWidth - width - 8;
  let row = 0;
  ctx.save();
  for (const [kind, item] of Object.entries(ITEMS)) {
    if (!isActive(kind) || !item.duration) continue;
    const y = 8 + row * (height + 5);
    roundedRect(ctx, x, y, width, height, 8);
    ctx.fillStyle = "rgba(6, 27, 69, 0.78)";
    ctx.fill();
    drawItem(ctx, item, x + 4, y + 5, 36, 18);
    ctx.fillStyle = "#ffffff";
    ctx.font = '700 12px "Avenir Next", "Segoe UI", system-ui, sans-serif';
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${item.name} ${Math.ceil(state.effects[kind])}s`, x + 44, y + 11, width - 48);
    ctx.fillStyle = item.color;
    ctx.fillRect(x + 6, y + height - 5, (width - 12) * (state.effects[kind] / item.duration), 3);
    row += 1;
  }
  ctx.restore();
}

function drawPlayer(p) {
  // Small shadow on the grass.
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(p.x + 4, p.y + p.size, p.size - 8, 4);

  // Blue rounded square with a dark outline, a white inner line and two eyes.
  roundedRectPath(p.x, p.y, p.size, p.size, 9);
  ctx.fillStyle = THEME.player;
  ctx.fill();
  ctx.strokeStyle = THEME.playerOutline;
  ctx.lineWidth = 4;
  ctx.stroke();
  roundedRectPath(p.x + 3, p.y + 3, p.size - 6, p.size - 6, 6);
  ctx.strokeStyle = THEME.playerHighlight;
  ctx.lineWidth = 2;
  ctx.stroke();

  const eyeY = p.y + p.size * 0.42;
  for (const eyeX of [p.x + p.size * 0.33, p.x + p.size * 0.67]) {
    ctx.fillStyle = THEME.playerHighlight;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, p.size * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = THEME.playerOutline;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, p.size * 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
}

function roundedRectPath(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
