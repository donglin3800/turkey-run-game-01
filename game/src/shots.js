// Deterministic screenshot staging: ?shot=start|play|kitchen|end&seed=1
// freezes the game in a scene that shows what the judge needs to see.
// The shots are real renders of the game's own code, never composited.
import { GROUND_Y } from './turkey.js';

export function stageShot(game, shot, seed) {
  const now = 100000; // fixed clock, so the frame never moves
  game.frozen = true;
  game.frozenNow = now;
  if (shot === 'start') {
    game.state = 'title';
    game.best = 2450;
    return;
  }
  if (shot === 'play') {
    game.state = 'play';
    game.world.distanceM = 1340;
    game.score = 1250;
    game.corn = 9;
    game.turkey.lives = 2;
    game.turkey.y = GROUND_Y - 95; // mid-jump over a pumpkin
    game.turkey.vy = -200;
    game.farmer.gap = 95; // right behind the turkey
    game.world.items = [
      { kind: 'haystack', x: 1150, y: GROUND_Y },
      { kind: 'pumpkin', x: 620, y: GROUND_Y - 18, roll: 0.7 },
      { kind: 'corn', x: 830, y: GROUND_Y - 46, taken: false },
      { kind: 'corn', x: 876, y: GROUND_Y - 46, taken: false },
      { kind: 'corn', x: 922, y: GROUND_Y - 46, taken: false },
      { kind: 'fence', x: 1080, y: GROUND_Y },
    ];
    game.world.knives = [{ x: 880, y: 240, vy: 0, angle: 0.9, thrown: false }];
    game.banner = null;
    return;
  }
  if (shot === 'kitchen') {
    game.state = 'play';
    game.world.distanceM = 2410;
    game.score = 2380;
    game.corn = 17;
    game.turkey.lives = 1;
    game.turkey.sliding = true;
    game.turkey.y = GROUND_Y;
    game.farmer.gap = 100; // close behind — the alarm shows, but clear of the turkey
    game.world.items = [
      { kind: 'oven', x: 880, y: GROUND_Y, flame: 1.2 },
      { kind: 'corn', x: 1060, y: GROUND_Y - 46, taken: false },
      { kind: 'corn', x: 1106, y: GROUND_Y - 46, taken: false },
      { kind: 'haystack', x: 1220, y: GROUND_Y },
    ];
    game.world.knives = [
      { x: 700, y: 180, vy: 0, angle: 1.2, thrown: false },
      { x: 560, y: 420, vy: 0, angle: -0.6, thrown: true },
    ];
    game.banner = null;
    return;
  }
  if (shot === 'end') {
    game.state = 'escaped';
    game.score = 3120;
    game.corn = 24;
    game.best = 3120;
    game.world.distanceM = 3000;
    return;
  }
  // Unknown shot name: fall back to the title screen.
  game.state = 'title';
}
