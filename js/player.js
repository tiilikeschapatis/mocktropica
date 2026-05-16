// ─── player.js ── Character movement, physics, animation ────────────────────

const Player = (() => {
  const SPEED       = 200;   // px/s horizontal
  const JUMP_FORCE  = -520;  // px/s initial jump velocity
  const GRAVITY     = 1200;  // px/s²
  const MAX_FALL    = 700;   // terminal velocity

  // Sprite color palette (drawn procedurally — swap with real sprites later)
  const COLORS = {
    body:  '#4A90D9',
    skin:  '#FDBCB4',
    hair:  '#5C3317',
    shoes: '#333',
  };

  let state = {
    x: 80, y: 300,
    width: 32, height: 48,
    vx: 0, vy: 0,
    onGround: false,
    facingRight: true,
    animFrame: 0,
    animTimer: 0,
  };

  function reset(x, y) {
    state.x = x; state.y = y;
    state.vx = 0; state.vy = 0;
    state.onGround = false;
  }

  // ── Physics & Input update ────────────────────────────────────────────────
  function update(dt, platforms) {
    // Horizontal input
    const left  = Engine.isDown('ArrowLeft')  || Engine.isDown('KeyA');
    const right = Engine.isDown('ArrowRight') || Engine.isDown('KeyD');
    const jump  = Engine.isDown('ArrowUp')    || Engine.isDown('KeyW') || Engine.isDown('Space');

    if (left)       { state.vx = -SPEED; state.facingRight = false; }
    else if (right) { state.vx =  SPEED; state.facingRight = true;  }
    else            { state.vx = 0; }

    if (jump && state.onGround) {
      state.vy = JUMP_FORCE;
      state.onGround = false;
    }

    // Gravity
    state.vy = Math.min(state.vy + GRAVITY * dt, MAX_FALL);

    // Move X
    state.x += state.vx * dt;

    // Move Y then resolve platform collisions
    state.y += state.vy * dt;
    state.onGround = false;
    resolvePlatforms(platforms);

    // Animate walk cycle
    if (state.vx !== 0 && state.onGround) {
      state.animTimer += dt;
      if (state.animTimer > 0.12) {
        state.animFrame = (state.animFrame + 1) % 4;
        state.animTimer = 0;
      }
    } else {
      state.animFrame = 0;
      state.animTimer = 0;
    }
  }

  function resolvePlatforms(platforms) {
    for (const p of platforms) {
      const overlapX = state.x + state.width > p.x && state.x < p.x + p.width;
      if (!overlapX) continue;

      // Landing on top
      const prevBottom = state.y + state.height - state.vy * (1/60);
      const nowBottom  = state.y + state.height;
      if (prevBottom <= p.y && nowBottom >= p.y && state.vy >= 0) {
        state.y = p.y - state.height;
        state.vy = 0;
        state.onGround = true;
      }
      // Hitting ceiling
      if (prevBottom >= p.y + p.height && state.y <= p.y + p.height && state.vy < 0) {
        state.y = p.y + p.height;
        state.vy = 0;
      }
    }
  }

  // ── Procedural sprite rendering ───────────────────────────────────────────
  function draw(ctx) {
    const { x, y, width, height, facingRight, animFrame } = state;

    ctx.save();

    // Flip if facing left
    if (!facingRight) {
      ctx.translate(x + width / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(x + width / 2), 0);
    }

    // Leg bobbing
    const legOffset = state.onGround && state.vx !== 0
      ? Math.sin(animFrame * Math.PI / 2) * 4
      : 0;

    // Left leg
    ctx.fillStyle = COLORS.shoes;
    ctx.fillRect(x + 4, y + height - 10 + legOffset, 10, 10);
    // Right leg
    ctx.fillRect(x + 18, y + height - 10 - legOffset, 10, 10);

    // Body
    ctx.fillStyle = COLORS.body;
    ctx.fillRect(x + 4, y + 18, 24, 22);

    // Head
    ctx.fillStyle = COLORS.skin;
    ctx.fillRect(x + 6, y + 2, 20, 18);

    // Hair
    ctx.fillStyle = COLORS.hair;
    ctx.fillRect(x + 6, y + 2, 20, 6);

    // Eye
    ctx.fillStyle = '#1a0a2e';
    ctx.fillRect(x + 18, y + 10, 4, 4);

    ctx.restore();
  }

  function getState() { return state; }
  function getBounds() {
    return { x: state.x, y: state.y, width: state.width, height: state.height };
  }

  return { update, draw, reset, getState, getBounds };
})();
