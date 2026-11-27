# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/donglin3800/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/donglin3800/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

The Last Gobble is an original turkey escape game: a turkey runs 3000m from Maple Hollow Farm to the woods before Thanksgiving dinner, chased the whole way by the farmer. Three stages — the farmyard at dawn, the cornfield at dusk, the kitchen at night with a hot oven — with fences and pumpkins to jump, rolling pumpkins and falling carving knives to dodge, corn to grab, haystacks to hide in, and a dash to break away when the farmer closes in. Title screen, HUD of score, distance, lives and stage, and two end screens: caught, or pardoned. No libraries, no network requests: plain static files under `game/`, synthesised WebAudio sound, and four real screenshots of the game running.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. Space or click jumps (twice to flap), Down slides or hides in a haystack, Shift dashes, P pauses, R restarts, M mutes.

## Screenshots

The four screenshots in `screenshots/` are real renders of the game in a browser, staged deterministically with `?shot=start|play|kitchen|end&seed=1` (see `shots.json`): the title screen, a cornfield run with the farmer right behind, the kitchen stage with the oven and falling knives, and the pardoned end screen.

---

<sub>Entered on [make.fun](https://make.fun/?ref=frrbny3y&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
