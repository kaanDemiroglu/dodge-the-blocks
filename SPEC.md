# SPEC: v2 "Items"

Falling things are now different items: rewards to catch, and expenses or bad mods to dodge. Simple and fun.

## Rules
- Start with 0 hearts (max 3, earn them with Extra life). Score starts at 0.
- Letting an expense or bad mod pass without a hit: +1 point.
- Touching an item uses it up.
- Block, Small expense and Big expense: a heart takes the hit if you have one.
- With no heart: Block ends the run; Small expense (-1) and Big expense (-5) come straight off the score, which may go below 0.
- Crash: ends the run even with hearts (only a Shield stops it).
- The classic Block is about half of all spawns; the other items share the rest.
- Every 10 s everything falls faster (as in v1).

## Items (all numbers live in `src/config.js` -> `ITEMS`)
| Group | Item | Effect |
|---|---|---|
| Reward | x2 Bonus | points AND penalties count double, 8 s (so -5 becomes -10) |
| Reward | Extra life | +1 life (max 3) |
| Reward | Shield | expenses and bad mods do nothing, 5 s |
| Reward | Slow time | things fall at half speed, 5 s |
| Expense | Block (classic) | takes a heart, or ends the run |
| Expense | Small expense | -1 score (or a heart) |
| Expense | Big expense | -5 score (or a heart) |
| Expense | Crash | game over, even with a life |
| Bad mod | Speed x2 | things fall twice as fast, 5 s (cancels Slow time) |
| Bad mod | Reverse | left/right swap, 5 s |
| Bad mod | Ghost | the player is invisible, 5 s |

## Fairness (kept)
- Expenses and bad mods never spawn on the invisible safe path; rewards may.
- Shape shows the group (stripes = expense, pill = reward, octagon = bad mod), plus an icon or text per item.

## Screen
- On the canvas: lives (top left), active effects with countdown (top right), floating texts like "-5".
- Right side: Items card with the same icons as the game.
- Normal / Fast modes are unchanged (start speed only).
