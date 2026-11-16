// config.js — ALL live-edit settings live here.
// Change a number, save, refresh the browser. Nothing else needs to be touched.

export const CONFIG = {
  // --- Playfield (pixels) ---
  canvasWidth: 640,
  canvasHeight: 520,

  // --- Player (Agency) ---
  playerSize: 36,                 // width and height of the blue square
  playerSpeedPxPerSecond: 320,    // how fast the player slides left/right
  playerBottomMarginPx: 24,       // gap between the player and the bottom edge

  // --- Lives and feedback (v2: items) ---
  startingLives: 0,               // hearts at the start of a run (earn them with Extra life)
  maxLives: 3,                    // lives never go above this
  popupSeconds: 0.9,              // how long floating texts like "-5" stay visible
  eventMessageSeconds: 1.2,       // how long the top banner ("x2 Bonus!") stays visible

  // --- Obstacles (every falling item uses this size) ---
  obstacleWidth: 55,
  obstacleHeight: 30,
  minBlockSpacingPx: 12,          // new blocks never spawn closer than this to the block above them

  // --- Spawning: blocks arrive one by one at random moments, never in fixed rows ---
  spawnDelayMinMilliseconds: 100, // shortest wait before the next block may appear
  spawnDelayMaxMilliseconds: 450, // longest wait
  spawnSkipChance: 0.2,           // 0-1: chance that a moment brings NO block (0 = never skip)
  firstBlockDelayMilliseconds: 200, // wait before the very first block of a run
  spawnPlacementAttempts: 25,     // tries to find a free spot for a new block before skipping it

  // --- Fairness: an invisible safe path always stays free of blocks ---
  safeGapMarginPx: 14,            // extra room around the safe path (bigger = easier)
  corridorSafetyFactor: 0.8,      // 0-1: how fast the safe path may move (lower = easier)

  // --- Time pressure (Temporality) ---
  initialObstacleSpeedPxPerSecond: 180,
  speedIncreasePxPerSecond: 20,   // added at every milestone
  difficultyIntervalSeconds: 10,  // time between milestones
  maximumObstacleSpeedPxPerSecond: 360,
  fastModeMultiplier: 1.5,        // Fast mode = initial speed x this number

  // --- Technical / feedback ---
  maxFrameSeconds: 0.05,          // cap one frame's time step (stops giant jumps after a tab pause)
  speedMessageSeconds: 1.5,       // how long the "Speed increased!" banner stays visible
  cloudScrollRatio: 0.35          // background clouds drift down at this share of the block speed
};

// ITEMS — every falling thing. Edit a number, save, refresh.
//   group: "reward"  = catch it (touch it)
//          "expense" = dodge it (bomb: costs score, a life, or ends the run)
//          "mod"     = dodge it (bad mode: a timed penalty)
//   weight:      how often it appears (bigger = more often)
//   duration / multiplier: for timed effects
//   fatal:        true = touching it takes a heart, and with no heart left it ends the run (the classic block)
//   ignoresLives: true = it ends the run even if you have lives (only a Shield stops it)
// The shape tells the group (stripes = expense, pill = reward, octagon = bad mod),
// and every item also has its own icon or text, so colour is never the only clue.
// The plain "Block" is the classic block from v1: about half of everything that falls.
export const ITEMS = {
  block:   { group: "expense", name: "Block", effect: "Classic block: takes a heart, or ends the run",
             fatal: true, weight: 50, color: "#e5484d" },
  small:   { group: "expense", name: "Small expense", effect: "-1 score (or a heart)", penalty: 1,
             weight: 14, color: "#f97316", text: "-1" },
  big:     { group: "expense", name: "Big expense", effect: "-5 score (or a heart)", penalty: 5,
             weight: 7, color: "#d6336c", text: "-5" },
  crash:   { group: "expense", name: "Crash", effect: "Game over, even with a life",
             ignoresLives: true, weight: 2, color: "#1f2937", icon: "skull" },

  double:  { group: "reward", name: "x2 Bonus", effect: "Points and penalties count double for 8 s",
             duration: 8, multiplier: 2, weight: 5, color: "#facc15", text: "x2" },
  life:    { group: "reward", name: "Extra life", effect: "+1 life (max 3)",
             weight: 3, color: "#ec4899", icon: "heart" },
  shield:  { group: "reward", name: "Shield", effect: "Expenses and bad mods do nothing for 5 s",
             duration: 5, weight: 4, color: "#22d3ee", icon: "shield" },
  slow:    { group: "reward", name: "Slow time", effect: "Blocks fall at half speed for 5 s",
             duration: 5, multiplier: 0.5, weight: 4, color: "#a3e635", icon: "clock" },

  rush:    { group: "mod", name: "Speed x2", effect: "Blocks fall twice as fast for 5 s",
             duration: 5, multiplier: 2, weight: 5, color: "#a855f7", text: ">>" },
  reverse: { group: "mod", name: "Reverse", effect: "Left and right swap for 5 s",
             duration: 5, weight: 4, color: "#d946ef", icon: "arrows" },
  ghost:   { group: "mod", name: "Ghost", effect: "You turn invisible for 5 s. Play by feel!",
             duration: 5, weight: 4, color: "#6366f1", icon: "ghost" }
};

// Headings for the Items card on the page, in display order.
export const ITEM_GROUPS = [
  { id: "reward", title: "Rewards: catch them" },
  { id: "expense", title: "Expenses: dodge them" },
  { id: "mod", title: "Bad mods: dodge them" }
];

// Canvas colours for the player and the item outlines (the scenery colours live in scenery.js).
export const THEME = {
  player: "#2f6cf0",
  playerOutline: "#0a1f4d",
  playerHighlight: "#ffffff",
  obstacleStripe: "rgba(0, 0, 0, 0.3)",
  obstacleLight: "rgba(255, 255, 255, 0.35)",
  obstacleShade: "rgba(0, 0, 0, 0.25)",
  obstacleOutline: "#0a1f4d"
};
