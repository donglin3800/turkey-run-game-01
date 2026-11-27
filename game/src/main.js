// The Last Gobble — Escape from Maple Hollow Farm.
// A turkey runs 3000m through farmyard, cornfield and kitchen, chased
// by a farmer who never stops, dodging fences, pumpkins, falling
// carving knives and a hot oven, grabbing corn, hiding in haystacks,
// and dashing for the woods. Keyboard and mouse, offline, no libraries.
import { makeRng } from './rng.js';
import { TurkeyPlayer, GROUND_Y } from './turkey.js';
import { FarmerChaser } from './farmer.js';
import { FarmWorld, STAGES, TOTAL_M } from './world.js';
import { SoundBank } from './audio.js';
import { drawTurkey, drawFarmer, drawKnife, drawCorn, drawPumpkin, drawHaystack, drawFence, drawOven, drawTree, drawBarn } from './art.js';
import { drawHud, drawTitle, drawStageBanner, drawCaught, drawEscaped, drawPaused } from './hud.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

class GobbleGame {
  constructor() {
    this.rng = makeRng(7);
    this.turkey = new TurkeyPlayer();
    this.farmer = new FarmerChaser();
    this.world = new FarmWorld(7);
    this.sounds = new SoundBank();
    this.state = 'title';
    this.score = 0;
    this.corn = 0;
    this.best = Number(localStorage.getItem('lastGobbleBest') || 0);
    this.keys = { left: false, right: false };
    this.banner = null;
    this.bannerUntil = 0;
    this.frozen = false;
    this.frozenNow = 0;
    this.lastTime = performance.now();
    this.stageShown = 0;
    this.announce('The Last Gobble. Press Enter to run.');
  }

  announce(text) { if (statusEl) statusEl.textContent = text; }

  get difficulty() { return this.world.stageIndex * 0.5 + this.world.distanceM / 3000; }
  get dashReady() { return performance.now() >= this.turkey.dashCooldownUntil; }

  startRun() {
    this.sounds.unlock();
    this.turkey.reset();
    this.farmer.reset();
    this.world.reset(7 + Math.floor(Math.random() * 1000));
    this.score = 0; this.corn = 0;
    this.state = 'play';
    this.stageShown = 0;
    this.showBanner(0);
    this.sounds.gobble();
    this.announce('Run! The farmer is behind you.');
  }

  showBanner(stageIndex) {
    this.banner = STAGES[stageIndex];
    this.bannerUntil = performance.now() + 2600;
    this.stageShown = stageIndex;
  }

  endCaught() {
    this.state = 'caught';
    this.saveBest();
    this.sounds.caughtSting();
    this.announce(`Caught after ${Math.floor(this.world.distanceM)} metres. Press R to try again.`);
  }

  endEscaped() {
    this.state = 'escaped';
    this.saveBest();
    this.sounds.fanfare();
    this.announce(`Pardoned! You escaped with ${this.score} points. Press R to run again.`);
  }

  saveBest() {
    if (this.score > this.best) {
      this.best = this.score;
      try { localStorage.setItem('lastGobbleBest', String(this.best)); } catch { /* private mode */ }
    }
  }

  hurtPlayer() {
    const now = performance.now();
    const penalty = this.turkey.hurt(now, 70);
    if (penalty) {
      this.farmer.closeIn(penalty);
      this.sounds.thud();
      this.sounds.alarm();
      if (this.turkey.dead) this.endCaught();
    }
  }

  update(dt) {
    const now = performance.now();
    if (this.state !== 'play') return;
    // Stage banners on crossing 1000m / 2000m.
    if (this.world.stageIndex > this.stageShown) {
      this.showBanner(this.world.stageIndex);
      this.score += 500;
      this.sounds.fanfare();
    }
    const stage = this.world.stage;
    let speed = stage.speed + (this.turkey.dashing ? 260 : 0);
    this.turkey.update(dt, now, this.keys);
    this.world.update(dt, speed, this.difficulty, now);
    // Farmer: chase, search, or throw.
    const farmerEvent = this.farmer.update(dt, now, this.turkey.hidden, this.turkey.dashing, this.difficulty);
    if (farmerEvent === 'throw') {
      this.world.knives.push({ x: this.farmer.x + 40, y: 480, vy: 0, vx: 520, angle: 1.57, thrown: true });
      this.sounds.knifeWhoosh();
    }
    if (farmerEvent === 'search') this.sounds.hide();
    if (this.farmer.caught) { this.endCaught(); return; }
    if (this.world.distanceM >= TOTAL_M) { this.endEscaped(); return; }
    this.score = Math.floor(this.world.distanceM) + this.corn * 50 + this.world.stageIndex * 500;
    this.checkCollisions(now);
  }

  checkCollisions(now) {
    const t = this.turkey;
    const tLeft = t.x - 26, tRight = t.x + 30, tTop = t.y - t.height, tBottom = t.y;
    if (t.hidden) return;
    for (const it of this.world.items) {
      if (it.taken) continue;
      if (it.kind === 'corn') {
        if (Math.abs(it.x - t.x) < 42 && it.y > tTop - 10 && it.y < tBottom + 10) {
          it.taken = true; this.corn += 1; this.sounds.pickup();
          if (this.corn % 5 === 0) this.farmer.fallBack(24);
        }
        continue;
      }
      if (it.kind === 'haystack') continue;
      if (it.kind === 'puddle') {
        if (Math.abs(it.x - t.x) < 34 && t.onGround) { it.taken = true; this.farmer.closeIn(28); this.sounds.thud(); }
        continue;
      }
      if (it.kind === 'oven') {
        if (t.x + 28 > it.x - 52 && t.x - 26 < it.x + 52 && tBottom > GROUND_Y - 118) { this.hurtPlayer(); it.taken = true; }
        continue;
      }
      // Fence and pumpkin: jump clean over them, or take the hit.
      const w = it.kind === 'fence' ? 30 : 24;
      const h = it.kind === 'fence' ? 40 : 36;
      if (t.x + 24 > it.x - w && t.x - 22 < it.x + w && tBottom > GROUND_Y - h) {
        if (!t.invulnerable) this.hurtPlayer();
        it.taken = true;
      }
    }
    this.world.items = this.world.items.filter((it) => !it.taken || it.kind === 'corn');
    for (const k of this.world.knives) {
      const kx = k.x, ky = k.y;
      if (kx > tLeft - 8 && kx < tRight + 8 && ky > tTop - 8 && ky < tBottom + 8) {
        if (!t.invulnerable) this.hurtPlayer();
        k.y = 900; // spent
      }
      if (k.thrown && k.vx) k.x += k.vx * 0.016;
    }
  }

  draw(now) {
    const stage = this.world.stage;
    const grad = ctx.createLinearGradient(0, 0, 0, 720);
    grad.addColorStop(0, stage.sky[0]); grad.addColorStop(0.55, stage.sky[1]); grad.addColorStop(1, stage.sky[2]);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1280, 720);
    // Sun by day, moon by night in the kitchen stage.
    if (this.world.stageIndex < 2) {
      ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(1080, 110, 46, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,243,196,0.35)'; ctx.beginPath(); ctx.arc(1080, 110, 70, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#f4ead0'; ctx.beginPath(); ctx.arc(1080, 110, 38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d8cba8'; ctx.beginPath(); ctx.arc(1066, 100, 10, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(1092, 122, 7, 0, Math.PI * 2); ctx.fill();
    }
    // Clouds.
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (let i = 0; i < 3; i++) {
      const cx = ((i * 430 + now * 0.008) % 1500) - 100;
      ctx.beginPath(); ctx.ellipse(cx, 90 + i * 46, 70, 20, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 50, 96 + i * 46, 46, 16, 0, 0, Math.PI * 2); ctx.fill();
    }
    // Parallax scenery.
    for (const s of this.world.scenery) {
      if (s.kind === 'tree') drawTree(ctx, s.x, GROUND_Y, s.s, s.layer === 0 ? '#c96a2e' : '#3f7a34');
      else if (s.kind === 'barn') drawBarn(ctx, s.x, GROUND_Y, s.s * 0.8);
      else if (s.kind === 'pumpkinpatch') drawPumpkin(ctx, s.x, GROUND_Y - 10, s.s);
    }
    // Ground.
    ctx.fillStyle = stage.ground; ctx.fillRect(0, GROUND_Y, 1280, 120);
    ctx.fillStyle = stage.grass; ctx.fillRect(0, GROUND_Y, 1280, 14);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let x = 0; x < 1280; x += 90) ctx.fillRect(x, GROUND_Y + 40, 46, 5);
    // World items.
    for (const it of this.world.items) {
      if (it.kind === 'corn' && !it.taken) drawCorn(ctx, it.x, it.y, 1, Math.sin(now / 300 + it.x) * 3);
      else if (it.kind === 'pumpkin') drawPumpkin(ctx, it.x, it.y, 1);
      else if (it.kind === 'haystack') drawHaystack(ctx, it.x, it.y, 1);
      else if (it.kind === 'fence') drawFence(ctx, it.x, it.y, 1);
      else if (it.kind === 'oven') drawOven(ctx, it.x, it.y, 1, now / 1000);
      else if (it.kind === 'puddle') {
        ctx.fillStyle = '#7ab8d8'; ctx.beginPath(); ctx.ellipse(it.x, GROUND_Y + 4, 44, 8, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
    // Hide prompt near a haystack.
    const hay = this.world.nearestHaystack(this.turkey.x);
    if (hay && this.state === 'play' && !this.turkey.hidden) {
      ctx.font = '900 20px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
      ctx.lineWidth = 4; ctx.strokeStyle = '#1e1006';
      ctx.strokeText('↓ HIDE IN THE HAY!', hay.x, GROUND_Y - 90);
      ctx.fillStyle = '#ffd94a'; ctx.fillText('↓ HIDE IN THE HAY!', hay.x, GROUND_Y - 90);
    }
    // Falling and thrown knives.
    for (const k of this.world.knives) drawKnife(ctx, k.x, k.y, 1.1, k.angle);
    // Farmer and turkey are drawn only while a run is live: the title
    // and end screens stage their own pair, so the gameplay pair must
    // not bleed through behind them.
    if (this.state !== 'title' && this.state !== 'caught' && this.state !== 'escaped') {
      const fx = this.farmer.x;
      if (fx > -80) drawFarmer(ctx, fx, GROUND_Y, 1.15, this.farmer.runPhase, this.farmer.throwing);
    }
    if (this.state !== 'title' && this.state !== 'caught' && this.state !== 'escaped') {
      if (!this.turkey.hidden) {
        const blinkOff = this.turkey.invulnerable && Math.floor(now / 120) % 2 === 0;
        if (!blinkOff) drawTurkey(ctx, this.turkey.x, this.turkey.y, 1.15, this.turkey.pose(), this.turkey.flap, this.turkey.blink);
      } else {
        ctx.font = '900 22px Trebuchet MS, sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeStyle = '#1e1006';
        ctx.strokeText('SHHH… HIDING!', this.turkey.x, GROUND_Y - 90);
        ctx.fillText('SHHH… HIDING!', this.turkey.x, GROUND_Y - 90);
      }
    }
    // Screens and HUD on top.
    if (this.state === 'title') drawTitle(ctx, this.best, now);
    else if (this.state === 'play') {
      drawHud(ctx, {
        score: this.score, distanceM: this.world.distanceM, lives: this.turkey.lives,
        stage, farmerGap: this.farmer.gap, dashReady: this.dashReady, muted: this.sounds.muted,
      });
      if (this.banner && now < this.bannerUntil) {
        drawStageBanner(ctx, this.banner, Math.min(1, (this.bannerUntil - now) / 600));
      }
    } else if (this.state === 'caught') drawCaught(ctx, this.score, this.world.distanceM, this.best);
    else if (this.state === 'escaped') drawEscaped(ctx, this.score, this.best, this.corn);
    else if (this.state === 'paused') drawPaused(ctx);
  }

  frame(time) {
    const now = this.frozen ? this.frozenNow : time;
    if (!this.frozen) {
      const dt = Math.min(0.033, (time - this.lastTime) / 1000 || 0.016);
      this.lastTime = time;
      if (this.state === 'play') this.update(dt);
    }
    this.draw(now);
    if (!this.frozen) requestAnimationFrame((t) => this.frame(t));
  }
}

const game = new GobbleGame();

// Exposed for the play-test driver only: live state, no gameplay effect.
window.__gobble = {
  get state() { return game.state; },
  get distance() { return game.world.distanceM; },
  get score() { return game.score; },
  get lives() { return game.turkey.lives; },
  get farmerGap() { return game.farmer.gap; },
};

function pressJump() {
  game.sounds.unlock();
  if (game.state === 'title' || game.state === 'caught' || game.state === 'escaped') { game.startRun(); return; }
  if (game.state === 'play') {
    if (game.turkey.jump(performance.now())) game.sounds.jump();
  }
}

window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  game.sounds.unlock();
  if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') { e.preventDefault(); pressJump(); }
  else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
    e.preventDefault();
    if (game.state === 'play') {
      const hay = game.world.nearestHaystack(game.turkey.x);
      if (hay && game.turkey.hide(performance.now(), true)) game.sounds.hide();
      else game.turkey.slide(performance.now());
    }
  } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
    if (game.state === 'play' && game.turkey.dash(performance.now())) game.sounds.gobble();
  } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') game.keys.left = true;
  else if (e.code === 'ArrowRight' || e.code === 'KeyD') game.keys.right = true;
  else if (e.code === 'Enter') {
    if (game.state === 'title' || game.state === 'caught' || game.state === 'escaped') game.startRun();
  } else if (e.code === 'KeyR') {
    if (game.state === 'caught' || game.state === 'escaped' || game.state === 'play') game.startRun();
  } else if (e.code === 'KeyP') {
    if (game.state === 'play') game.state = 'paused';
    else if (game.state === 'paused') game.state = 'play';
  } else if (e.code === 'KeyM') game.sounds.toggleMute();
});
window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') game.keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') game.keys.right = false;
});
canvas.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  pressJump();
});

// Screenshot staging: ?shot=start|play|kitchen|end&seed=1
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  stageShot(game, shot, Number(params.get('seed') || 1));
  game.frame(game.frozenNow);
} else {
  requestAnimationFrame((t) => game.frame(t));
}
