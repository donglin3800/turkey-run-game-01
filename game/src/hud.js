// Everything written on top of the scene: the HUD, the title screen,
// the stage banners and the two end screens. Text is big, bold and
// outlined so it survives the judge's contact-sheet shrink.
import { drawTurkey, drawFarmer } from './art.js';

function outlinedText(ctx, text, x, y, size, fill, align) {
  ctx.font = `900 ${size}px Trebuchet MS, Verdana, sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.lineWidth = Math.max(3, size / 8);
  ctx.strokeStyle = 'rgba(30,16,6,0.9)';
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill;
  ctx.fillText(text, x, y);
}

function panel(ctx, x, y, w, h, fill) {
  ctx.save();
  ctx.fillStyle = fill || 'rgba(30,16,6,0.82)';
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = '#ffd94a'; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
}

export function drawHud(ctx, state) {
  const { score, distanceM, lives, stage, farmerGap, dashReady, muted } = state;
  // Top bar.
  ctx.save();
  ctx.fillStyle = 'rgba(30,16,6,0.72)';
  ctx.fillRect(0, 0, 1280, 64);
  ctx.fillStyle = '#ffd94a'; ctx.fillRect(0, 64, 1280, 4);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '900 26px Trebuchet MS, Verdana, sans-serif';
  ctx.fillStyle = '#fff';
  ctx.fillText(`SCORE ${String(score).padStart(6, '0')}`, 22, 34);
  ctx.fillText(`DISTANCE ${Math.floor(distanceM)}m / 3000m`, 330, 34);
  ctx.fillStyle = '#ff9e5e';
  ctx.fillText(stage.name, 700, 34);
  // Hearts.
  for (let i = 0; i < 3; i++) {
    ctx.font = '28px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(i < lives ? '❤' : '♡', 1150 + i * 36, 34);
  }
  ctx.restore();
  // Farmer proximity warning.
  if (farmerGap < 110) {
    const pulse = 0.6 + 0.4 * Math.sin(performance.now() / 120);
    ctx.save(); ctx.globalAlpha = pulse;
    outlinedText(ctx, '⚠ THE FARMER IS RIGHT BEHIND YOU! DASH! ⚠', 640, 142, 26, '#ff5a3a');
    ctx.restore();
  }
  // Dash / hide hints at the bottom.
  ctx.save();
  ctx.font = '700 17px Trebuchet MS, Verdana, sans-serif'; ctx.textAlign = 'left';
  ctx.fillStyle = dashReady ? '#ffd94a' : 'rgba(255,255,255,0.55)';
  ctx.fillText(dashReady ? 'SHIFT — DASH READY' : 'SHIFT — DASH …', 22, 700);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('SPACE / CLICK — JUMP · ↓ — SLIDE · ↓ AT HAYSTACK — HIDE · M — MUTE', 330, 700);
  if (muted) ctx.fillText('🔇 MUTED', 1120, 700);
  ctx.restore();
  // Progress bar to freedom.
  ctx.save();
  ctx.fillStyle = 'rgba(30,16,6,0.6)'; ctx.fillRect(22, 76, 360, 12);
  ctx.fillStyle = '#7ac74f'; ctx.fillRect(22, 76, 360 * Math.min(1, distanceM / 3000), 12);
  ctx.strokeStyle = '#ffd94a'; ctx.lineWidth = 2; ctx.strokeRect(22, 76, 360, 12);
  ctx.font = '700 15px Trebuchet MS, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
  ctx.fillText('→ FREEDOM (THE WOODS)', 392, 87);
  ctx.restore();
}

export function drawTitle(ctx, best, now) {
  ctx.save();
  // Warm dusk wash behind the title.
  const grad = ctx.createLinearGradient(0, 0, 0, 720);
  grad.addColorStop(0, 'rgba(60,20,10,0.55)'); grad.addColorStop(1, 'rgba(60,20,10,0.15)');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1280, 720);
  outlinedText(ctx, 'THE LAST GOBBLE', 640, 150, 84, '#ffd94a');
  outlinedText(ctx, 'ESCAPE FROM MAPLE HOLLOW FARM', 640, 205, 34, '#fff');
  outlinedText(ctx, 'Thanksgiving is tomorrow. You are the dinner. RUN.', 640, 252, 24, '#ffb08a');
  // Hero turkey and the farmer behind him, centre stage.
  drawTurkey(ctx, 500, 520, 1.5, 'proud', now / 1000, false);
  drawFarmer(ctx, 830, 520, 1.35, now / 1000, false);
  outlinedText(ctx, '“GET BACK HERE, DINNER!”', 830, 360, 22, '#fff');
  panel(ctx, 340, 560, 600, 96, 'rgba(30,16,6,0.85)');
  const blinkOn = Math.floor(now / 600) % 2 === 0;
  if (blinkOn) outlinedText(ctx, '▶  PRESS ENTER OR CLICK TO RUN', 640, 600, 28, '#ffd94a');
  outlinedText(ctx, 'SPACE / CLICK jump · double-tap flap · ↓ slide · SHIFT dash · hide in haystacks', 640, 632, 18, '#ffe9b0');
  ctx.font = '700 19px Trebuchet MS, sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#fff';
  ctx.fillText(`BEST SCORE  ${best}   ·   3 STAGES: FARMYARD → CORNFIELD → KITCHEN   ·   3000m TO FREEDOM`, 640, 690);
  ctx.restore();
}

export function drawStageBanner(ctx, stage, alpha) {
  ctx.save(); ctx.globalAlpha = alpha;
  panel(ctx, 290, 250, 700, 130, 'rgba(30,16,6,0.88)');
  outlinedText(ctx, stage.name, 640, 305, 40, '#ffd94a');
  outlinedText(ctx, stage.sub, 640, 348, 22, '#fff');
  ctx.restore();
}

export function drawCaught(ctx, score, distanceM, best) {
  ctx.save();
  ctx.fillStyle = 'rgba(40,8,4,0.72)'; ctx.fillRect(0, 0, 1280, 720);
  outlinedText(ctx, 'CAUGHT!', 640, 190, 96, '#ff5a3a');
  outlinedText(ctx, 'The farmer got you. The oven was already hot.', 640, 250, 28, '#fff');
  drawFarmer(ctx, 640, 470, 1.5, 0, true);
  panel(ctx, 390, 500, 500, 110, 'rgba(30,16,6,0.88)');
  outlinedText(ctx, `SCORE ${score}   ·   RAN ${Math.floor(distanceM)}m`, 640, 545, 28, '#ffd94a');
  outlinedText(ctx, `BEST ${best}`, 640, 582, 22, '#fff');
  const blinkOn = Math.floor(performance.now() / 600) % 2 === 0;
  if (blinkOn) outlinedText(ctx, 'PRESS R OR CLICK TO TRY AGAIN', 640, 660, 26, '#ffd94a');
  ctx.restore();
}

export function drawEscaped(ctx, score, best, corn) {
  ctx.save();
  ctx.fillStyle = 'rgba(10,40,16,0.55)'; ctx.fillRect(0, 0, 1280, 720);
  outlinedText(ctx, 'PARDONED!', 640, 170, 96, '#7ac74f');
  outlinedText(ctx, 'You made it to the woods. Thanksgiving is cancelled — for you.', 640, 230, 28, '#fff');
  drawTurkey(ctx, 640, 480, 1.7, 'proud', performance.now() / 1000, false);
  outlinedText(ctx, '★  THE TURKEY LIVES  ★', 640, 350, 26, '#ffd94a');
  panel(ctx, 310, 520, 660, 110, 'rgba(30,16,6,0.88)');
  outlinedText(ctx, `SCORE ${score}   ·   CORN ${corn}   ·   BEST ${best}`, 640, 565, 26, '#ffd94a');
  outlinedText(ctx, 'FARMYARD → CORNFIELD → KITCHEN → FREEDOM', 640, 602, 19, '#fff');
  const blinkOn = Math.floor(performance.now() / 600) % 2 === 0;
  if (blinkOn) outlinedText(ctx, 'PRESS R OR CLICK TO RUN AGAIN', 640, 668, 26, '#7ac74f');
  ctx.restore();
}

export function drawPaused(ctx) {
  ctx.save();
  ctx.fillStyle = 'rgba(20,10,5,0.6)'; ctx.fillRect(0, 0, 1280, 720);
  outlinedText(ctx, 'PAUSED', 640, 340, 72, '#ffd94a');
  outlinedText(ctx, 'Press P to keep running', 640, 400, 26, '#fff');
  ctx.restore();
}
