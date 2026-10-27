/** Web Audio ses efektleri */
window.SFX = (function () {
  let ctx = null;
  let enabled = true;

  function ac() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function beep(freq, dur, type, vol) {
    if (!enabled) return;
    try {
      const c = ac();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type || "sine";
      o.frequency.value = freq;
      g.gain.value = vol || 0.05;
      o.connect(g); g.connect(c.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.stop(c.currentTime + dur + 0.02);
    } catch (_) {}
  }

  return {
    setEnabled(v) { enabled = !!v; },
    key() { beep(660, 0.04, "triangle", 0.04); },
    error() { beep(180, 0.12, "square", 0.05); },
    star() { beep(880, 0.08, "sine", 0.06); setTimeout(() => beep(1175, 0.12, "sine", 0.05), 80); },
    done() { beep(523, 0.1, "sine", 0.06); setTimeout(() => beep(659, 0.1, "sine", 0.06), 100); setTimeout(() => beep(784, 0.18, "sine", 0.06), 200); }
  };
})();
