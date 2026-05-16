// ─── engine.js ── Core game loop, input handling, camera ────────────────────

const Engine = (() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  let lastTime = 0;
  let running = false;
  let updateFn = null;
  let drawFn = null;

  // ── Camera ────────────────────────────────────────────────────────────────
  const camera = { x: 0, y: 0 };

  function applyCamera() {
    ctx.save();
    ctx.translate(-Math.round(camera.x), -Math.round(camera.y));
  }

  function resetCamera() {
    ctx.restore();
  }

  function followTarget(target, sceneWidth) {
    const halfW = canvas.width / 2;
    camera.x = target.x + target.width / 2 - halfW;
    // Clamp so we don't scroll past scene edges
    camera.x = Math.max(0, Math.min(camera.x, sceneWidth - canvas.width));
    camera.y = 0;
  }

  // ── Input ─────────────────────────────────────────────────────────────────
  const keys = {};

  window.addEventListener('keydown', e => { keys[e.code] = true; });
  window.addEventListener('keyup',   e => { keys[e.code] = false; });

  function isDown(code) { return !!keys[code]; }

  // ── Loop ──────────────────────────────────────────────────────────────────
  function loop(timestamp) {
    if (!running) return;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (updateFn) updateFn(dt);
    if (drawFn)   drawFn(ctx, applyCamera, resetCamera);

    requestAnimationFrame(loop);
  }

  function start(update, draw) {
    updateFn = update;
    drawFn   = draw;
    running  = true;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  function stop() { running = false; }

  // ── Canvas helpers ────────────────────────────────────────────────────────
  function getCanvas() { return canvas; }
  function getCtx()    { return ctx; }
  function getWidth()  { return canvas.width; }
  function getHeight() { return canvas.height; }

  return { start, stop, isDown, camera, followTarget, getCanvas, getCtx, getWidth, getHeight };
})();
