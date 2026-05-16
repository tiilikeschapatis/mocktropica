// ─── scene.js ── Scene loading, rendering, triggers, transitions ─────────────

const SceneManager = (() => {
  let current = null;   // active scene data
  let onTransition = null;  // callback(exitId)

  // ── Built-in scenes ───────────────────────────────────────────────────────
  // In a real project, load these from islands/<name>/scenes.json via fetch()
  const SCENES = {
    'jungle-entry': {
      width: 1600,
      bgColor: '#1a3a1a',
      bgGradient: ['#0d2414', '#2d6a1a'],
      platforms: [
        { x: 0,    y: 420, width: 500,  height: 60,  color: '#3d7a2a' }, // ground L
        { x: 520,  y: 380, width: 200,  height: 20,  color: '#5a4a2a' }, // floating
        { x: 600,  y: 300, width: 180,  height: 20,  color: '#5a4a2a' },
        { x: 750,  y: 420, width: 600,  height: 60,  color: '#3d7a2a' }, // ground R
        { x: 900,  y: 340, width: 160,  height: 20,  color: '#5a4a2a' },
        { x: 1200, y: 420, width: 400,  height: 60,  color: '#3d7a2a' }, // far right ground
        { x: 1300, y: 330, width: 120,  height: 20,  color: '#5a4a2a' },
      ],
      npcs: [
        {
          id: 'elder',
          x: 300, y: 372, width: 32, height: 48,
          color: '#8B4513',
          name: 'Village Elder',
          dialogue: [
            'Welcome, young explorer!',
            'The Sacred Relic was stolen from our temple.',
            'Find it deep within the jungle ruins. Beware the traps!',
            'Take this map — it will guide you.',
          ],
          giveItem: { emoji: '🗺️', name: 'Ancient Map' },
        },
      ],
      decorations: [
        { type: 'tree', x: 50,   y: 280 },
        { type: 'tree', x: 200,  y: 260 },
        { type: 'tree', x: 800,  y: 270 },
        { type: 'tree', x: 1100, y: 265 },
        { type: 'tree', x: 1450, y: 275 },
        { type: 'ruins', x: 1150, y: 310 },
      ],
      exits: [
        { id: 'to-ruins', x: 1560, y: 300, width: 40, height: 120, label: '→ Ruins', toScene: 'jungle-ruins' },
      ],
      playerStart: { x: 60, y: 370 },
    },

    'jungle-ruins': {
      width: 1400,
      bgColor: '#110d1a',
      bgGradient: ['#110d1a', '#2a1f35'],
      platforms: [
        { x: 0,    y: 420, width: 300,  height: 60, color: '#4a3a2a' },
        { x: 100,  y: 330, width: 120,  height: 20, color: '#6a5a3a' },
        { x: 280,  y: 260, width: 140,  height: 20, color: '#6a5a3a' },
        { x: 450,  y: 340, width: 200,  height: 20, color: '#6a5a3a' },
        { x: 500,  y: 420, width: 600,  height: 60, color: '#4a3a2a' },
        { x: 680,  y: 280, width: 120,  height: 20, color: '#6a5a3a' },
        { x: 820,  y: 200, width: 160,  height: 20, color: '#6a5a3a' },  // relic platform
        { x: 1100, y: 420, width: 300,  height: 60, color: '#4a3a2a' },
      ],
      npcs: [
        {
          id: 'relic',
          x: 860, y: 152, width: 32, height: 48,
          color: '#ffd700',
          isItem: true,
          name: 'Sacred Relic',
          dialogue: [
            'You found the Sacred Relic! ✨',
            'Return it to the Village Elder to complete the island!',
          ],
          giveItem: { emoji: '🏺', name: 'Sacred Relic' },
          flag: 'relic_found',
        },
      ],
      decorations: [
        { type: 'pillar', x: 200,  y: 340 },
        { type: 'pillar', x: 560,  y: 340 },
        { type: 'pillar', x: 900,  y: 300 },
      ],
      exits: [
        { id: 'to-entry', x: 10, y: 300, width: 40, height: 120, label: '← Back', toScene: 'jungle-entry' },
      ],
      playerStart: { x: 80, y: 370 },
    },
  };

  // ── Load a scene ──────────────────────────────────────────────────────────
  function load(sceneId, fromExitId) {
    current = JSON.parse(JSON.stringify(SCENES[sceneId])); // deep clone
    current.id = sceneId;

    // Determine where player spawns
    let start = current.playerStart;
    if (fromExitId) {
      // Spawn near the matching exit on the new scene
      const exit = current.exits?.find(e => e.toScene === fromExitId || e.id === fromExitId);
      if (exit) start = { x: exit.x + exit.width + 10, y: exit.y };
    }
    Player.reset(start.x, start.y);
  }

  function setTransitionCallback(cb) { onTransition = cb; }

  // ── Update: check exit triggers ───────────────────────────────────────────
  function update() {
    if (!current?.exits) return;
    const p = Player.getBounds();
    for (const exit of current.exits) {
      if (
        p.x + p.width > exit.x && p.x < exit.x + exit.width &&
        p.y + p.height > exit.y && p.y < exit.y + exit.height
      ) {
        if (onTransition) onTransition(exit);
        return;
      }
    }
  }

  // ── Draw ──────────────────────────────────────────────────────────────────
  function draw(ctx) {
    if (!current) return;
    const W = current.width;
    const H = Engine.getHeight();

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, current.bgGradient[0]);
    grad.addColorStop(1, current.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorations (behind platforms)
    if (current.decorations) {
      for (const d of current.decorations) drawDecoration(ctx, d);
    }

    // Platforms
    for (const p of current.platforms) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.width, p.height);
      // Top edge highlight
      ctx.fillStyle = lighten(p.color, 30);
      ctx.fillRect(p.x, p.y, p.width, 4);
    }

    // Exits (door indicators)
    if (current.exits) {
      for (const exit of current.exits) {
        ctx.fillStyle = 'rgba(255,215,0,0.15)';
        ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(exit.x, exit.y, exit.width, exit.height);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(exit.label, exit.x + exit.width / 2, exit.y + exit.height / 2);
      }
    }

    // NPCs
    if (current.npcs) {
      for (const npc of current.npcs) {
        if (Flags.get(npc.flag) && npc.isItem) continue; // collected
        drawNPC(ctx, npc);
      }
    }

    // Player
    Player.draw(ctx);
  }

  function drawNPC(ctx, npc) {
    ctx.fillStyle = npc.color;
    ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
    // Simple face
    ctx.fillStyle = '#fff';
    ctx.fillRect(npc.x + 6, npc.y + 8, 6, 6);
    ctx.fillRect(npc.x + 20, npc.y + 8, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(npc.x + 8, npc.y + 10, 3, 3);
    ctx.fillRect(npc.x + 22, npc.y + 10, 3, 3);
    // Name tag
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(npc.name).width + 8;
    ctx.fillRoundedRect?.(npc.x + 16 - tw/2, npc.y - 20, tw, 16, 3);
    ctx.fillStyle = '#ffd700';
    ctx.fillText(npc.name, npc.x + npc.width / 2, npc.y - 7);
    // Interaction hint
    ctx.fillStyle = '#aaa';
    ctx.font = '10px monospace';
    ctx.fillText('[E] Talk', npc.x + npc.width / 2, npc.y - 22);
  }

  function drawDecoration(ctx, d) {
    if (d.type === 'tree') {
      // Trunk
      ctx.fillStyle = '#5C3317';
      ctx.fillRect(d.x + 14, d.y + 60, 12, 60);
      // Canopy layers
      ctx.fillStyle = '#2d6a1a';
      ctx.beginPath();
      ctx.ellipse(d.x + 20, d.y + 60, 35, 28, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3d8a2a';
      ctx.beginPath();
      ctx.ellipse(d.x + 20, d.y + 38, 28, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4da035';
      ctx.beginPath();
      ctx.ellipse(d.x + 20, d.y + 20, 18, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (d.type === 'ruins') {
      ctx.fillStyle = '#6a5a4a';
      ctx.fillRect(d.x, d.y, 80, 100);
      ctx.fillStyle = '#4a3a2a';
      ctx.fillRect(d.x + 20, d.y + 30, 40, 70); // doorway
      // Cracks
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(d.x+10, d.y+10); ctx.lineTo(d.x+25, d.y+50); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(d.x+60, d.y+20); ctx.lineTo(d.x+50, d.y+60); ctx.stroke();
    } else if (d.type === 'pillar') {
      ctx.fillStyle = '#7a6a5a';
      ctx.fillRect(d.x, d.y, 24, 80);
      ctx.fillStyle = '#8a7a6a';
      ctx.fillRect(d.x - 6, d.y, 36, 12); // capital
      ctx.fillRect(d.x - 6, d.y + 68, 36, 12); // base
    }
  }

  function lighten(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return `rgb(${r},${g},${b})`;
  }

  function getCurrent() { return current; }
  function getPlatforms() { return current?.platforms || []; }
  function getNPCs() { return current?.npcs || []; }

  return { load, update, draw, setTransitionCallback, getCurrent, getPlatforms, getNPCs };
})();
