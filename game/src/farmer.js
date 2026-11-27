// The farmer: he never stops. He gains ground whenever the turkey
// stumbles, falls back when the turkey dashes or hides, and throws a
// carving knife when he gets close enough to smell dinner.
// gap is in pixels between the farmer and the turkey: 0 means caught.
export class FarmerChaser {
  constructor() {
    this.reset();
  }

  reset() {
    this.gap = 260;          // pixels behind the turkey
    this.speed = 0;          // closing speed, px/s
    this.state = 'chase';    // chase | search | throw
    this.stateUntil = 0;
    this.runPhase = 0;
    this.throwing = false;
    this.nextThrowAt = 9000;
    this.searches = 0;
  }

  get x() { return 300 - this.gap; }
  get caught() { return this.gap <= 6; }

  // The turkey stumbled: the farmer smells it and closes in.
  closeIn(px) { this.gap = Math.max(6, this.gap - px); }

  // The turkey got away cleanly: the farmer loses ground.
  fallBack(px) { this.gap = Math.min(420, this.gap + px); }

  // The turkey hid in a haystack: the farmer stops, looks around,
  // and loses the trail.
  startSearch(now) {
    this.state = 'search';
    this.stateUntil = now + 1800;
    this.searches += 1;
  }

  update(dt, now, turkeyHidden, turkeyDashing, difficulty) {
    this.runPhase += dt;
    if (this.state === 'search') {
      if (now > this.stateUntil) { this.state = 'chase'; this.gap = Math.min(420, this.gap + 130); }
      return 'search';
    }
    // Base closing pressure grows with difficulty; the farmer is
    // always a little slower than a clean run, faster than a stumble.
    const pressure = 26 + difficulty * 22;
    this.gap -= pressure * dt;
    if (turkeyDashing) this.gap += 190 * dt;
    if (turkeyHidden) this.gap += 60 * dt;
    this.gap = Math.max(6, Math.min(430, this.gap));
    // Throw a knife when close and the cooldown has passed.
    this.throwing = false;
    if (this.gap < 190 && now > this.nextThrowAt && this.state === 'chase') {
      this.state = 'throw';
      this.stateUntil = now + 520;
      this.throwing = true;
      this.nextThrowAt = now + 5200 - difficulty * 900;
      return 'throw';
    }
    if (this.state === 'throw' && now > this.stateUntil) this.state = 'chase';
    return this.state;
  }
}
