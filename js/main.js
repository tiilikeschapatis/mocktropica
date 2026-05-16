// ─── main.js ── Game orchestrator ───────────────────────────────────────────

const canvas = Engine.getCanvas();
const hud    = document.getElementById('hud');
const islandSelectEl = document.getElementById('island-select');

// ── Island entry point (called from HTML buttons) ─────────────────────────
function startIsland(islandId) {
  islandSelectEl.style.display = 'none';
  hud.style.display = 'flex';
  canvas.style.display = 'block';

  SceneManager.setTransitionCallback(handleExit);
  SceneManager.load('jungle-entry');

  Engine.start(update, draw);
}

// ── Scene transition ──────────────────────────────────────────────────────
let transitioning = false;

function handleExit(exit) {
  if (transitioning || Dialogue.isActive()) return;
  transitioning = true;
  SceneManager.load(exit.toScene, exit.id);
  setTimeout(() => { transitioning = false; }, 300);
}

// ── NPC interaction ───────────────────────────────────────────────────────
let eWasDown = false;

function checkNPCInteraction() {
  const eDown = Engine.isDown('KeyE');
  if (!eDown || eWasDown || Dialogue.isActive()) {
    eWasDown = eDown;
    return;
  }
  eWasDown = true;

  const p = Player.getBounds();
  const REACH = 60;

  for (const npc of SceneManager.getNPCs()) {
    if (Flags.get(npc.flag) && npc.isItem) continue;

    const dx = Math.abs((p.x + p.width/2) - (npc.x + npc.width/2));
    const dy = Math.abs((p.y + p.height/2) - (npc.y + npc.height/2));

    if (dx < REACH && dy < REACH) {
      Dialogue.show(npc, () => {
        // After dialogue closes, give item if applicable
        if (npc.giveItem && !Inventory.has(npc.giveItem.name)) {
          Inventory.add(npc.giveItem);
          Flags.set(npc.flag);

          // Check win condition
          if (npc.giveItem.name === 'Sacred Relic') {
            setTimeout(showWin, 400);
          }
        }
      });
      break;
    }
  }
}

// ── Win screen ────────────────────────────────────────────────────────────
function showWin() {
  Engine.stop();
  const ctx = Engine.getCtx();
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, Engine.getWidth(), Engine.getHeight());
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 40px monospace';
  ctx.fillText('🏆 Island Complete!', Engine.getWidth()/2, 180);
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.fillText('You returned the Sacred Relic!', Engine.getWidth()/2, 240);
  ctx.font = '14px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('Refresh to play again', Engine.getWidth()/2, 290);
}

// ── Update ────────────────────────────────────────────────────────────────
function update(dt) {
  if (Dialogue.isActive()) return;
  Player.update(dt, SceneManager.getPlatforms());
  SceneManager.update();
  checkNPCInteraction();

  // Camera follows player within scene bounds
  const scene = SceneManager.getCurrent();
  if (scene) Engine.followTarget(Player.getState(), scene.width);
}

// ── Draw ──────────────────────────────────────────────────────────────────
function draw(ctx, applyCamera, resetCamera) {
  applyCamera();
  SceneManager.draw(ctx);
  resetCamera();

  // Draw controls hint (screen-space, not world-space)
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '12px monospace';
  ctx.textAlign = 'left';
  ctx.fillText('Arrow keys / WASD: Move & Jump   [E]: Interact', 10, Engine.getHeight() - 10);
}
