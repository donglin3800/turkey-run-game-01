// All of the game's art, drawn in code: no image files, no network.
// Every creature and prop is a set of canvas shapes with a thick dark
// outline, so the scene still reads when the judge shrinks it down.
// Palette: autumn — pumpkin orange, barn red, corn gold, leaf green.

export const PALETTE = {
  skyDawn: ['#ffd9a0', '#ff9e5e', '#c96f3b'],
  skyDusk: ['#ffe9b0', '#f7a44a', '#8e4a2e'],
  skyNight: ['#3a2b4d', '#6b3a4a', '#c96a3a'],
  ground: '#7a5230',
  grass: '#5d8a3c',
  leaf: '#3f7a34',
};

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}

function circle(ctx, x, y, r) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}

// The hero: a plump brown turkey with a fanned tail, red wattle and a
// panicked-but-determined eye. pose: 'run' | 'jump' | 'slide' | 'hide' | 'proud'
export function drawTurkey(ctx, x, y, s, pose, flap, blink) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = 3 * s; ctx.lineJoin = 'round'; ctx.strokeStyle = '#3a2410';
  const bob = pose === 'run' ? Math.sin(flap * 14) * 3 * s : 0;
  // Fanned tail behind the body.
  ctx.fillStyle = '#8a5a2b';
  for (let i = -2; i <= 2; i++) {
    ctx.save(); ctx.rotate(i * 0.42);
    ctx.beginPath(); ctx.ellipse(-26 * s, -34 * s, 9 * s, 30 * s, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = '#c98a3d';
  for (let i = -2; i <= 2; i++) {
    ctx.save(); ctx.rotate(i * 0.42);
    ctx.beginPath(); ctx.ellipse(-26 * s, -34 * s, 5 * s, 22 * s, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
  }
  // Wings.
  const wingLift = pose === 'jump' ? -14 * s : Math.sin(flap * 14) * 5 * s;
  ctx.fillStyle = '#6e4423';
  ctx.beginPath(); ctx.ellipse(-4 * s, -14 * s + wingLift * 0.4, 22 * s, 12 * s, -0.5, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // Body.
  const bodyRy = pose === 'slide' ? 20 * s : 30 * s;
  const bodyY = pose === 'slide' ? -16 * s : -28 * s + bob;
  ctx.fillStyle = '#7a4a22';
  ellipse(ctx, 0, bodyY, 30 * s, bodyRy);
  ctx.fillStyle = '#9c6a35';
  ellipse(ctx, 6 * s, bodyY + 6 * s, 20 * s, bodyRy * 0.62);
  // Head and neck.
  const neckH = pose === 'slide' ? 10 * s : 26 * s;
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(14 * s, bodyY - neckH, 12 * s, neckH + 8 * s);
  ctx.strokeRect(14 * s, bodyY - neckH, 12 * s, neckH + 8 * s);
  circle(ctx, 22 * s, bodyY - neckH - 4 * s, 13 * s);
  ctx.fillStyle = '#8a5a2b';
  // Beak.
  ctx.fillStyle = '#e8a13a';
  ctx.beginPath(); ctx.moveTo(32 * s, bodyY - neckH - 8 * s); ctx.lineTo(46 * s, bodyY - neckH - 2 * s); ctx.lineTo(32 * s, bodyY - neckH + 2 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Wattle and snood.
  ctx.fillStyle = '#d23b2e';
  ellipse(ctx, 30 * s, bodyY - neckH + 8 * s, 5 * s, 9 * s);
  ctx.fillStyle = '#c22e22';
  ctx.beginPath(); ctx.moveTo(30 * s, bodyY - neckH - 12 * s); ctx.lineTo(36 * s, bodyY - neckH - 2 * s); ctx.lineTo(28 * s, bodyY - neckH - 4 * s); ctx.closePath(); ctx.fill();
  // Eye: wide with panic, or a proud closed happy arc on the win screen.
  if (pose === 'proud') {
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 2.5 * s;
    ctx.beginPath(); ctx.arc(24 * s, bodyY - neckH - 6 * s, 5 * s, Math.PI, 0); ctx.stroke();
  } else if (!blink) {
    ctx.fillStyle = '#fff'; circle(ctx, 25 * s, bodyY - neckH - 6 * s, 5 * s);
    ctx.fillStyle = '#1c1006'; circle(ctx, 27 * s, bodyY - neckH - 6 * s, 2.6 * s);
  } else {
    ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(20 * s, bodyY - neckH - 6 * s); ctx.lineTo(30 * s, bodyY - neckH - 6 * s); ctx.stroke();
  }
  // Legs, pumping when running.
  ctx.strokeStyle = '#e8a13a'; ctx.lineWidth = 4 * s; ctx.lineCap = 'round';
  const legSwing = pose === 'run' ? Math.sin(flap * 14) * 10 * s : pose === 'jump' ? 8 * s : 0;
  ctx.beginPath(); ctx.moveTo(-8 * s, bodyY + bodyRy - 4 * s); ctx.lineTo(-8 * s + legSwing, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8 * s, bodyY + bodyRy - 4 * s); ctx.lineTo(8 * s - legSwing, 0); ctx.stroke();
  ctx.restore();
}

// The farmer: red overalls, straw hat, rolling pin in one hand and a
// carving knife in the other, always a few steps behind.
export function drawFarmer(ctx, x, y, s, runPhase, throwing) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineWidth = 3 * s; ctx.lineJoin = 'round'; ctx.strokeStyle = '#2b1a10';
  const swing = Math.sin(runPhase * 12) * 8 * s;
  // Legs in blue overalls.
  ctx.strokeStyle = '#2e4a7a'; ctx.lineWidth = 9 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4 * s, -34 * s); ctx.lineTo(-4 * s + swing, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(6 * s, -34 * s); ctx.lineTo(6 * s - swing, 0); ctx.stroke();
  // Body: red shirt, blue overalls.
  ctx.fillStyle = '#b8352c';
  ctx.beginPath(); ctx.roundRect(-18 * s, -72 * s, 38 * s, 42 * s, 8 * s); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2e4a7a';
  ctx.fillRect(-14 * s, -52 * s, 30 * s, 24 * s); ctx.strokeRect(-14 * s, -52 * s, 30 * s, 24 * s);
  // Arms: one reaching forward, one raised with the knife when throwing.
  ctx.strokeStyle = '#b8352c'; ctx.lineWidth = 8 * s;
  ctx.beginPath(); ctx.moveTo(14 * s, -64 * s); ctx.lineTo(34 * s, -52 * s + swing * 0.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-14 * s, -64 * s); ctx.lineTo(throwing ? -30 * s : -26 * s, throwing ? -92 * s : -48 * s); ctx.stroke();
  if (throwing) drawKnife(ctx, -30 * s, -96 * s, 1.1 * s, -0.7);
  // Head, moustache, straw hat.
  ctx.fillStyle = '#f0c08a'; circle(ctx, 2 * s, -84 * s, 14 * s);
  ctx.fillStyle = '#5a3a1a';
  ctx.beginPath(); ctx.ellipse(4 * s, -76 * s, 10 * s, 3.5 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff'; circle(ctx, 7 * s, -88 * s, 2.5 * s); ctx.fillStyle = '#1c1006'; circle(ctx, 8 * s, -88 * s, 1.2 * s);
  ctx.fillStyle = '#e8c85a';
  ctx.beginPath(); ctx.ellipse(2 * s, -94 * s, 24 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(2 * s, -100 * s, 13 * s, 8 * s, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
  ctx.restore();
}

export function drawKnife(ctx, x, y, s, angle) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  ctx.lineWidth = 2 * s; ctx.strokeStyle = '#222';
  ctx.fillStyle = '#dfe6ea';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(26 * s, -4 * s); ctx.lineTo(30 * s, 0); ctx.lineTo(26 * s, 4 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-12 * s, -3 * s, 12 * s, 6 * s); ctx.strokeRect(-12 * s, -3 * s, 12 * s, 6 * s);
  ctx.restore();
}

export function drawCorn(ctx, x, y, s, bob) {
  ctx.save(); ctx.translate(x, y + bob);
  ctx.lineWidth = 2 * s; ctx.strokeStyle = '#3a5a1a';
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath(); ctx.ellipse(0, 0, 10 * s, 18 * s, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#d8a91e'; ctx.lineWidth = 1.5 * s;
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 5 * s, -14 * s); ctx.lineTo(i * 5 * s, 14 * s); ctx.stroke(); }
  ctx.fillStyle = '#5d8a3c';
  ctx.beginPath(); ctx.moveTo(-8 * s, 12 * s); ctx.lineTo(0, 26 * s); ctx.lineTo(8 * s, 12 * s); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

export function drawPumpkin(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y);
  ctx.lineWidth = 2.5 * s; ctx.strokeStyle = '#7a3a10';
  ctx.fillStyle = '#e87a1e';
  ellipse(ctx, 0, 0, 22 * s, 18 * s);
  ctx.strokeStyle = '#c85a10'; ctx.lineWidth = 2 * s;
  ctx.beginPath(); ctx.ellipse(0, 0, 11 * s, 18 * s, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#3f7a34'; ctx.lineWidth = 4 * s;
  ctx.beginPath(); ctx.moveTo(0, -18 * s); ctx.quadraticCurveTo(4 * s, -26 * s, 10 * s, -24 * s); ctx.stroke();
  ctx.fillStyle = '#1c1006';
  ctx.beginPath(); ctx.moveTo(-12 * s, -4 * s); ctx.lineTo(-7 * s, 2 * s); ctx.lineTo(-12 * s, 6 * s); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(12 * s, -4 * s); ctx.lineTo(7 * s, 2 * s); ctx.lineTo(12 * s, 6 * s); ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function drawHaystack(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y);
  ctx.lineWidth = 2.5 * s; ctx.strokeStyle = '#8a6a1a';
  ctx.fillStyle = '#e8c85a';
  ctx.beginPath(); ctx.moveTo(-34 * s, 0); ctx.quadraticCurveTo(-30 * s, -46 * s, 0, -48 * s); ctx.quadraticCurveTo(30 * s, -46 * s, 34 * s, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#c8a83a'; ctx.lineWidth = 1.5 * s;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 12 * s, -8 * s); ctx.lineTo(i * 8 * s, -38 * s); ctx.stroke(); }
  ctx.restore();
}

export function drawFence(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y);
  ctx.lineWidth = 3 * s; ctx.strokeStyle = '#6e4423'; ctx.fillStyle = '#9c6a35';
  ctx.fillRect(-30 * s, -34 * s, 60 * s, 6 * s); ctx.strokeRect(-30 * s, -34 * s, 60 * s, 6 * s);
  ctx.fillRect(-30 * s, -16 * s, 60 * s, 6 * s); ctx.strokeRect(-30 * s, -16 * s, 60 * s, 6 * s);
  ctx.fillRect(-26 * s, -40 * s, 7 * s, 40 * s); ctx.strokeRect(-26 * s, -40 * s, 7 * s, 40 * s);
  ctx.fillRect(19 * s, -40 * s, 7 * s, 40 * s); ctx.strokeRect(19 * s, -40 * s, 7 * s, 40 * s);
  ctx.restore();
}

export function drawOven(ctx, x, y, s, flame) {
  ctx.save(); ctx.translate(x, y);
  ctx.lineWidth = 3 * s; ctx.strokeStyle = '#2b1a10';
  // Body.
  ctx.fillStyle = '#4a4a52';
  ctx.beginPath(); ctx.roundRect(-52 * s, -118 * s, 104 * s, 118 * s, 8 * s); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2e2e34';
  ctx.beginPath(); ctx.roundRect(-44 * s, -108 * s, 88 * s, 66 * s, 6 * s); ctx.fill(); ctx.stroke();
  // Flames inside the window, licking up.
  const flick = Math.sin(flame * 9) * 4 * s;
  ctx.fillStyle = '#ff7a1e';
  ctx.beginPath(); ctx.moveTo(-38 * s, -46 * s);
  ctx.quadraticCurveTo(-30 * s, -84 * s + flick, -18 * s, -50 * s);
  ctx.quadraticCurveTo(-8 * s, -88 * s - flick, 2 * s, -50 * s);
  ctx.quadraticCurveTo(14 * s, -80 * s + flick, 24 * s, -50 * s);
  ctx.quadraticCurveTo(34 * s, -76 * s - flick, 38 * s, -46 * s);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd94a';
  ctx.beginPath(); ctx.moveTo(-24 * s, -46 * s); ctx.quadraticCurveTo(-12 * s, -70 * s, 0, -46 * s); ctx.quadraticCurveTo(12 * s, -68 * s, 24 * s, -46 * s); ctx.closePath(); ctx.fill();
  // Control knobs above the window.
  ctx.fillStyle = '#e8e8e8';
  for (let i = 0; i < 3; i++) { circle(ctx, -28 * s + i * 28 * s, -112 * s, 5 * s); }
  ctx.fillStyle = '#d23b2e';
  ctx.beginPath(); ctx.roundRect(-30 * s, -136 * s, 60 * s, 18 * s, 4 * s); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = `bold ${11 * s}px sans-serif`; ctx.textAlign = 'center';
  ctx.fillText('HOT! HOT!', 0, -123 * s);
  ctx.restore();
}

export function drawTree(ctx, x, y, s, hue) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#6e4423'; ctx.fillRect(-6 * s, -70 * s, 12 * s, 70 * s);
  ctx.fillStyle = hue;
  circle(ctx, 0, -92 * s, 34 * s); circle(ctx, -24 * s, -72 * s, 22 * s); circle(ctx, 24 * s, -72 * s, 22 * s);
  ctx.restore();
}

export function drawBarn(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y);
  ctx.lineWidth = 3 * s; ctx.strokeStyle = '#5a1a10';
  ctx.fillStyle = '#b8352c';
  ctx.fillRect(-70 * s, -110 * s, 140 * s, 110 * s); ctx.strokeRect(-70 * s, -110 * s, 140 * s, 110 * s);
  ctx.beginPath(); ctx.moveTo(-78 * s, -108 * s); ctx.lineTo(0, -150 * s); ctx.lineTo(78 * s, -108 * s); ctx.closePath();
  ctx.fillStyle = '#7a2a20'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-26 * s, -70 * s, 52 * s, 70 * s); ctx.strokeRect(-26 * s, -70 * s, 52 * s, 70 * s);
  ctx.strokeStyle = '#5a1a10'; ctx.lineWidth = 2 * s;
  ctx.beginPath(); ctx.moveTo(-26 * s, -70 * s); ctx.lineTo(26 * s, 0); ctx.moveTo(26 * s, -70 * s); ctx.lineTo(-26 * s, 0); ctx.stroke();
  ctx.fillStyle = '#ffd94a'; ctx.fillRect(-58 * s, -96 * s, 18 * s, 18 * s); ctx.strokeRect(-58 * s, -96 * s, 18 * s, 18 * s);
  ctx.restore();
}
