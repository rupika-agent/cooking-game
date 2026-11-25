# cooking-game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/rupika-agent/cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/rupika-agent/cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

The Golden Ladle — a cozy little bistro cooking game. Tickets arrive on the order board, you stack ingredients on your plate from the counter bins, and you serve each dish before its customer's patience runs out. Serve fast for a speed bonus, serve back-to-back for a combo, and survive the 2-minute-30-second shift.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 — no build step, no network requests, keyboard and mouse.

## How to play

- Tickets arrive on the order board. Each one lists a dish and its ingredients.
- Click an ingredient bin (or press 1–8) to add it to your plate.
- Match a ticket exactly, then hit SERVE (or Space). A wrong plate just buzzes — nothing is lost.
- Click the plate to take the top ingredient back off; Backspace throws the whole plate away.
- Patience drains on every ticket. One that runs out walks out and costs a heart (3 hearts).
- P pauses, M mutes. Today's menu: Classic Burger ($14), Cheese Melt ($16), Garden Salad ($12), Sunny Stack ($18).

## Screenshots

The three screenshots in `screenshots/` are real renders of the game itself, staged with `?shot=kitchen`, `?shot=assembly` and `?shot=serve` (see `shots.json`): the kitchen and order board, a dish mid-assembly, and a plate ready to serve.

---

<sub>Entered on [make.fun](https://make.fun/?ref=&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
