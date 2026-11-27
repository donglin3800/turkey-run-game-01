// The road out of Maple Hollow: three stages, farmyard to kitchen,
// each with its own sky, props and hazards. Obstacles, corn and
// haystacks are spawned ahead of the turkey and scrolled past.
import { makeRng, range, pick } from './rng.js';
import { GROUND_Y } from './turkey.js';

export const STAGES = [
  {
    name: 'STAGE 1 — THE FARMYARD', sub: 'Dawn. The farmer is up. Run!',
    sky: ['#ffd9a0', '#ff9e5e', '#c96f3b'], ground: '#8a6a3a', grass: '#5d8a3c',
    lengthM: 1000, speed: 300,
    kinds: ['fence', 'pumpkin', 'corn', 'haystack', 'puddle'],
  },
  {
    name: 'STAGE 2 — THE CORNFIELD', sub: 'Dusk. Tall corn, long shadows, no mercy.',
    sky: ['#ffe9b0', '#f7a44a', '#8e4a2e'], ground: '#7a5a2e', grass: '#6a7a2e',
    lengthM: 1000, speed: 360,
    kinds: ['fence', 'pumpkin', 'corn', 'haystack', 'knife', 'puddle'],
  },
  {
    name: 'STAGE 3 — THE KITCHEN', sub: 'Night. The oven is hot. The knife is out.',
    sky: ['#3a2b4d', '#6b3a4a', '#c96a3a'], ground: '#5a3a28', grass: '#4a5a3a',
    lengthM: 1000, speed: 420,
    kinds: ['fence', 'oven', 'corn', 'knife', 'pumpkin', 'haystack'],
  },
];

export const TOTAL_M = 3000;

export class FarmWorld {
  constructor(seed) {
    this.rng = makeRng(seed || 7);
    this.items = [];       // {kind, x, y, taken, passed}
    this.knives = [];      // falling / thrown knives {x, y, vy, angle}
    this.spawnX = 1400;
    this.nextSpawnM = 6;
    this.distanceM = 0;
    this.scenery = [];
    for (let i = 0; i < 14; i++) {
      this.scenery.push({
        x: this.rng() * 1400, layer: i % 3,
        kind: pick(this.rng, ['tree', 'barn', 'fencepost', 'pumpkinpatch', 'moon']),
        s: range(this.rng, 0.7, 1.3),
      });
    }
  }

  get stageIndex() { return Math.min(2, Math.floor(this.distanceM / 1000)); }
  get stage() { return STAGES[this.stageIndex]; }
  get stageProgress() { return (this.distanceM % 1000) / 1000; }

  reset(seed) {
    this.rng = makeRng(seed || 7);
    this.items = []; this.knives = [];
    this.spawnX = 1400; this.nextSpawnM = 6; this.distanceM = 0;
  }

  spawnAhead(stage, difficulty) {
    const kind = pick(this.rng, stage.kinds);
    const x = 1320;
    if (kind === 'corn') {
      const n = 3 + Math.floor(this.rng() * 3);
      for (let i = 0; i < n; i++) this.items.push({ kind: 'corn', x: x + i * 46, y: GROUND_Y - 46, taken: false });
    } else if (kind === 'knife') {
      this.knives.push({ x: range(this.rng, 500, 1100), y: -30, vy: 420 + difficulty * 120, angle: 0.5, thrown: false });
    } else if (kind === 'oven') {
      this.items.push({ kind: 'oven', x, y: GROUND_Y, taken: false, flame: 0 });
    } else if (kind === 'haystack') {
      this.items.push({ kind: 'haystack', x, y: GROUND_Y, taken: false });
    } else if (kind === 'pumpkin') {
      this.items.push({ kind: 'pumpkin', x, y: GROUND_Y - 18, taken: false, roll: 0 });
    } else if (kind === 'puddle') {
      this.items.push({ kind: 'puddle', x, y: GROUND_Y, taken: false });
    } else {
      this.items.push({ kind: 'fence', x, y: GROUND_Y, taken: false });
    }
  }

  update(dt, speed, difficulty, now) {
    this.distanceM += (speed * dt) / 14; // ~14 px per metre
    const stage = this.stage;
    if (this.distanceM >= this.nextSpawnM) {
      this.spawnAhead(stage, difficulty);
      this.nextSpawnM = this.distanceM + range(this.rng, 13, 20) - difficulty * 2;
    }
    const dx = speed * dt;
    for (const it of this.items) {
      it.x -= dx;
      if (it.kind === 'pumpkin') { it.roll += dt * 6; it.x -= 60 * dt; }
      if (it.kind === 'oven') it.flame += dt;
    }
    for (const k of this.knives) {
      k.y += k.vy * dt; k.x -= dx * 0.25; k.angle += dt * 3;
    }
    this.items = this.items.filter((it) => it.x > -160);
    this.knives = this.knives.filter((k) => k.y < 760);
    for (const s of this.scenery) {
      s.x -= dx * (0.15 + s.layer * 0.25);
      if (s.x < -160) { s.x = 1320 + this.rng() * 200; s.kind = pick(this.rng, ['tree', 'barn', 'fencepost', 'pumpkinpatch', 'moon']); }
    }
  }

  nearestHaystack(turkeyX) {
    let best = null;
    for (const it of this.items) {
      if (it.kind !== 'haystack') continue;
      const d = Math.abs(it.x - turkeyX);
      if (d < 90 && (!best || d < Math.abs(best.x - turkeyX))) best = it;
    }
    return best;
  }
}
