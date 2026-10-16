// Smooth 3D hover for a card. Pure DOM (no React) so it is easy to test.
// A requestAnimationFrame loop eases the card toward the mouse instead of
// restarting a CSS transition on every pointermove, which looks jerky in Chrome.
const MAX_TILT = 14; // degrees
const LIFT_Z = 0; // px toward the viewer (this is what causes the "zoom"; 0 = none)
const LIFT_Y = 6; // px up
const TAU = 70; // ms, smaller = snappier follow

export function createTilt(card, tilt) {
  // Hover tilt is triggered by the person, so it stays on even with "reduce motion",
  // just gentler. Only automatic animations are switched off for those users.
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const amp = reduce ? 0.5 : 1;
  const v = { rx: 0, ry: 0, l: 0, trx: 0, try: 0, tl: 0 };
  let raf = 0;
  let last = 0;
  let hover = false;
  let locked = false; // true while the card is flipped

  const apply = () => {
    tilt.style.transform =
      v.rx || v.ry || v.l
        ? `translate3d(0, ${(-LIFT_Y * amp * v.l).toFixed(2)}px, ${(LIFT_Z * amp * v.l).toFixed(2)}px) rotateX(${v.rx.toFixed(2)}deg) rotateY(${v.ry.toFixed(2)}deg)`
        : '';
  };

  const tick = (t) => {
    const dt = Math.min(t - (last || t), 50);
    last = t;
    const k = 1 - Math.exp(-dt / TAU); // frame-rate independent easing
    v.rx += (v.trx - v.rx) * k;
    v.ry += (v.try - v.ry) * k;
    v.l += (v.tl - v.l) * k;
    const done =
      Math.abs(v.trx - v.rx) < 0.02 && Math.abs(v.try - v.ry) < 0.02 && Math.abs(v.tl - v.l) < 0.001;
    if (done) {
      v.rx = v.trx;
      v.ry = v.try;
      v.l = v.tl;
    }
    apply();
    if (done) {
      raf = 0;
      last = 0;
    } else {
      raf = requestAnimationFrame(tick);
    }
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const flat = () => {
    v.trx = 0;
    v.try = 0;
    v.tl = 0;
    kick();
  };

  const ok = (e) => e.pointerType === 'mouse';

  const onMove = (e) => {
    if (!ok(e) || locked) return;
    const r = card.getBoundingClientRect(); // the button itself never moves, so no hover feedback loop
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    hover = true;
    v.trx = (0.5 - py) * 2 * MAX_TILT * amp;
    v.try = (px - 0.5) * 2 * MAX_TILT * amp;
    v.tl = 1;
    card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    kick();
  };
  const onLeave = () => {
    hover = false;
    flat();
  };
  const onDown = (e) => {
    if (!ok(e) || locked) return;
    v.tl = 0.3; // pressed in
    kick();
  };
  const onUp = (e) => {
    if (!ok(e) || locked) return;
    v.tl = hover ? 1 : 0;
    kick();
  };

  card.addEventListener('pointermove', onMove);
  card.addEventListener('pointerleave', onLeave);
  card.addEventListener('pointercancel', onLeave);
  card.addEventListener('pointerdown', onDown);
  card.addEventListener('pointerup', onUp);

  return {
    // Called when the card flips: lay flat, and ignore the mouse until it flips back.
    setLocked(value) {
      locked = value;
      if (value) flat();
    },
    destroy() {
      cancelAnimationFrame(raf);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
      card.removeEventListener('pointercancel', onLeave);
      card.removeEventListener('pointerdown', onDown);
      card.removeEventListener('pointerup', onUp);
      tilt.style.transform = '';
    },
  };
}
