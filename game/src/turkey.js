// The turkey: position, jumping, sliding, hiding and getting hurt.
// The turkey stays near x=300 while the world scrolls past; its real
// progress is measured in metres run, not pixels.
import { clamp } from './rng.js';

export const GROUND_Y = 600;

export class TurkeyPlayer {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 300;
    this.y = GROUND_Y;
    this.vy = 0;
    this.flapsLeft = 2;
    this.sliding = false;
    this.slidingUntil = 0;
    this.hidden = false;
    this.hiddenUntil = 0;
    this.lives = 3;
    this.invulnUntil = 0;
    this.dashUntil = 0;
    this.dashCooldownUntil = 0;
    this.flap = 0;
    this.blink = false;
    this.blinkUntil = 0;
    this.dead = false;
  }

  get onGround() { return this.y >= GROUND_Y; }
  get height() { return this.sliding ? 34 : 62; }
  get invulnerable() { return performance.now() < this.invulnUntil; }
  get dashing() { return performance.now() < this.dashUntil; }

  jump(now) {
    if (this.hidden) return false;
    if (this.onGround) {
      this.vy = -760; this.flapsLeft = 1; this.sliding = false; return true;
    }
    if (this.flapsLeft > 0) {
      this.vy = -560; this.flapsLeft -= 1; return true;
    }
    return false;
  }

  slide(now) {
    if (!this.onGround || this.hidden) return;
    this.sliding = true;
    this.slidingUntil = now + 650;
  }

  dash(now) {
    if (now < this.dashCooldownUntil || this.hidden) return false;
    this.dashUntil = now + 420;
    this.dashCooldownUntil = now + 2600;
    this.invulnUntil = Math.max(this.invulnUntil, now + 500);
    return true;
  }

  hide(now, nearHaystack) {
    if (!nearHaystack || !this.onGround) return false;
    this.hidden = true;
    this.hiddenUntil = now + 2200;
    return true;
  }

  hurt(now, farmerGapPenalty) {
    if (this.invulnerable || this.dead) return 0;
    this.lives -= 1;
    this.invulnUntil = now + 1400;
    if (this.lives <= 0) this.dead = true;
    return farmerGapPenalty;
  }

  move(dx) {
    if (this.hidden) return;
    this.x = clamp(this.x + dx, 170, 560);
  }

  update(dt, now, keys) {
    this.flap += dt;
    if (now > this.blinkUntil) { this.blink = !this.blink; this.blinkUntil = now + (this.blink ? 140 : 2600); }
    if (this.sliding && now > this.slidingUntil) this.sliding = false;
    if (this.hidden && now > this.hiddenUntil) this.hidden = false;
    // Gravity and landing.
    if (!this.onGround || this.vy < 0) {
      this.vy += 2100 * dt;
      this.y += this.vy * dt;
      if (this.y >= GROUND_Y) { this.y = GROUND_Y; this.vy = 0; this.flapsLeft = 2; }
    }
    if (keys.left) this.move(-260 * dt);
    if (keys.right) this.move(260 * dt);
  }

  pose() {
    if (this.hidden) return 'hide';
    if (this.sliding) return 'slide';
    if (!this.onGround) return 'jump';
    return 'run';
  }
}
