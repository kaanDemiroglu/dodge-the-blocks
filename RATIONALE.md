# Dodge the Blocks — Design Rationale

<!-- RATIONALE-BODY-START -->
## Idea

Dodge the Blocks asks one question: what changes when the same action must be made in less time? The player only slides a blue square left or right, yet that single choice is judged against falling blocks that speed up the longer the run lasts. I kept the game small so the argument stays visible.

## Premise A and B: Agency and Temporality

Agency here means that input has a clear, visible effect: holding a key moves the square, and its position alone decides whether a block collides. Temporality means the run's own elapsed time, not a clock outside the game, raises obstacle speed by a fixed step at fixed milestones. The two depend on each other. Because of Agency, the participant can choose where to stand, and because of Temporality, that same choice must be made in a shrinking window. Normal and Fast differ only in starting speed, so the comparison isolates time pressure rather than adding a second mechanic. For the same reason spawn timing is identical in both modes, and an invisible safe path keeps every block avoidable.

## Theory

Wardrip-Fruin et al. (2009) argue that agency is not a feeling inside the player but something that happens when the actions a player wants are among the actions the system supports. This shaped my mapping: one input, one direct, visible result, so what the player wants (stand there) is always possible. A limit is that the paper concerns fictional worlds, and my agency is thin, because players choose only position, never risk or strategy. Sicart (2008) treats a mechanic as something a player does that acts on the state of the game. That led me to treat movement, collision, scoring and speed progression as one small connected set rather than a feature list. A counterpoint is that this definition says little about whether a mechanic feels fair, so I added a fairness check myself.

## What I learned

Checking the game at phone width showed the Mode box alone on its own row, so the layout looked broken before anyone played; I reworked the score panel. A later bot crash in Normal mode was the bot's steering, not the rules, which confirmed the safe path holds.
<!-- RATIONALE-BODY-END -->

## References

- Sicart, M. (2008). Defining Game Mechanics. *Game Studies, 8*(2). <https://gamestudies.org/0802/articles/sicart>
- Wardrip-Fruin, N., Mateas, M., Dow, S., & Sali, S. (2009). Agency Reconsidered. *DiGRA 2009*. <https://dl.digra.org/index.php/dl/article/view/369>

## Live game

**[TO COMPLETE]** `https://işeref15.github.io/dodge-the-blocks/` (not published yet; replace after GitHub Pages is live and tested)

