# Dodge the Blocks

**English** | [Türkçe](./README.tr.md)

**Course:** NMED 3203 — Interactive Media Applications
**Selected premises:** Agency (01) + Temporality (04)

**Experience in one line:** Slide a blue square to catch rewards and dodge the rest, and keep up as everything falls faster the longer you survive.

> **v2 "Items":** the falling blocks are now different items. See [SPEC.md](./SPEC.md) for the full rules. The Items card next to the game explains every icon.

## How to play

1. Choose **Normal** or **Fast** and press **Start Game**.
2. Move the blue square left and right. **Catch rewards** (rounded pills) and **dodge expenses** (striped blocks) and **bad mods** (octagons).
3. Items arrive at random moments, several at the same time. A way through the expenses always exists. Each expense or bad mod that passes you safely gives **1 point**.
4. You start with **0 hearts** (top left; max 3, earn them with **Extra life**). A heart saves you from one hit by a **Block** or a bomb (Small/Big expense). With no heart, a Block ends the run, and Small expense (−1) and Big expense (−5) come straight off your score. **Crash** ends the run even with lives. About half of everything that falls is the classic Block.
5. Rewards: **x2 Bonus**, **Extra life**, **Shield**, **Slow time**. Bad mods: **Speed x2**, **Reverse**, **Ghost** (you turn invisible for 5 s). Active effects show with a countdown (top right).
6. Every 10 seconds everything falls faster.
7. The run ends on a **Block** with no heart, or on a **Crash**. Press **Restart** to try again. The "−1" and "−5" items come straight off your score, which can even go below 0.

## Controls

| Action | Keyboard | Touch / mouse |
| --- | --- | --- |
| Move left | `←` or `A` | Hold the **Left** button |
| Move right | `→` or `D` | Hold the **Right** button |

- Holding left and right together cancels out (no movement).
- The on-screen buttons also work with the keyboard: focus one with `Tab`, then hold `Space` or `Enter`.
- Releasing a key, leaving the window or switching tabs stops movement.

## Premises

- **Agency:** Your input moves the player; your position decides whether a block hits you. Dodging earns points, a bad position ends the run.
- **Temporality:** The elapsed time of the run raises the block speed at fixed steps. The same distance takes a block less time to fall, so the same move must be made faster.
- **Interaction:** You keep full control of movement, but time changes how well that control can be used. Compare **Normal** and **Fast** (they differ only in starting speed), or compare the same dodge early and late in one run.

## GitHub Pages URL

`https://USERNAME.github.io/dodge-the-blocks/` — **not published yet.** Replace `USERNAME` after publishing and testing the link.

## Run locally

ES modules do not load from `file://`, so use a tiny local server:

```bash
cd dodge-the-blocks
python3 -m http.server 8000
# then open http://localhost:8000
```

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page structure: title, score panel, canvas, menus, on-screen buttons |
| `styles.css` | Layout, colours, focus styles, phone layout |
| `src/config.js` | **All rule settings and the `ITEMS` table. Edit here.** |
| `src/items.js` | How each item and icon is drawn (used by the game and the Items card) |
| `src/game.js` | Game state, update loop, random spawning, items and effects, collision, difficulty, drawing |
| `SPEC.md` | v2 rules |
| `src/scenery.js` | Pixel-art sky, clouds, city, trees and grass (drawn in code) |
| `src/main.js` | Buttons, keyboard and touch events, updates the page text |
| `RATIONALE.md` | Design rationale and references |

### Where to change the rules

Open `src/config.js`, change a number, save and refresh the page.

| Setting | Effect |
| --- | --- |
| `initialObstacleSpeedPxPerSecond` | How fast blocks fall at the start |
| `speedIncreasePxPerSecond` | How much faster they get at each milestone |
| `difficultyIntervalSeconds` | Time between milestones |
| `maximumObstacleSpeedPxPerSecond` | Speed cap |
| `playerSpeedPxPerSecond` | How fast the player moves (strength of agency) |
| `obstacleWidth` | Block width (room for successful choices) |
| `fastModeMultiplier` | Fast mode start speed = initial speed × this |
| `spawnDelayMinMilliseconds` / `spawnDelayMaxMilliseconds` | Random wait between blocks (smaller = more blocks) |
| `spawnSkipChance` | Chance that a moment brings no block |
| `safeGapMarginPx` | Extra room around the invisible safe path (bigger = easier) |
| `corridorSafetyFactor` | How fast the safe path may move (lower = easier) |
| `startingLives` / `maxLives` | Lives at the start and the cap |
| `ITEMS.<item>.weight` | How often an item appears (bigger = more often) |
| `ITEMS.<item>.duration` / `multiplier` / `penalty` | Length and strength of effects, cost of expenses |

If a setting could make the game impossible, a warning appears in the browser console (`checkFairness` in `src/game.js`).

## Rationale

See [RATIONALE.md](./RATIONALE.md).

## Credits

- Code, design and graphics: written for this course project. All graphics, including the pixel-art scenery, are drawn in code with the HTML canvas and CSS. No external images, libraries or fonts are used. The visual style was inspired by a pixel-art reference image supplied by the student.
- Readings (listed in [RATIONALE.md](./RATIONALE.md)): Wardrip-Fruin et al. (2009); Sicart (2008).
- Course lab materials: <https://mertseven.com/ima/lab/bibliography.html>

## AI use note

- **Tool:** Claude Code (Claude Sonnet 5.5, Anthropic) generated the first version of the code (`index.html`, `styles.css`, `src/*.js`), the README, the draft of RATIONALE.md and CLAUDE.md, following `SPEC.md`.
- **What I did myself:** I chose the two premises, reviewed the generated code, played and tuned the game through the settings in `src/config.js`, and edited the rationale and references.
- **Corrections made during the build (true):** After the first build, Claude Code checked the game at phone width in a browser. The score panel showed the "Mode" box alone on its own row, which looked broken, so the layout was corrected. Later, an automated test bot crashed in Normal mode; this turned out to be a mistake in the test bot (it steered toward the wrong row), not in the game rules, and the bot was fixed.
- **Example of a correction:** the generated phone layout left the "Mode" box alone on its own row, so I had it corrected. The first rationale draft also paraphrased Wardrip-Fruin et al. (2009) from memory; after opening the paper I rewrote that sentence to match what the paper says.
