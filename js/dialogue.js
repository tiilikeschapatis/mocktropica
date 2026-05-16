// ─── dialogue.js ── NPC dialogue, quest flags, item giving ──────────────────

const Dialogue = (() => {
  const box      = document.getElementById('dialogue-box');
  const speaker  = document.getElementById('dialogue-speaker');
  const textEl   = document.getElementById('dialogue-text');
  const nextBtn  = document.getElementById('dialogue-next');

  let lines   = [];
  let idx     = 0;
  let active  = false;
  let onClose = null;

  function show(npc, afterClose) {
    lines   = npc.dialogue;
    idx     = 0;
    active  = true;
    onClose = afterClose || null;

    speaker.textContent = npc.name;
    textEl.textContent  = lines[0];
    nextBtn.textContent = lines.length > 1 ? 'Next ▶' : 'Close ✕';
    box.classList.remove('hidden');
  }

  function next() {
    if (!active) return;
    idx++;
    if (idx >= lines.length) {
      close();
    } else {
      textEl.textContent  = lines[idx];
      nextBtn.textContent = idx === lines.length - 1 ? 'Close ✕' : 'Next ▶';
    }
  }

  function close() {
    active = false;
    box.classList.add('hidden');
    if (onClose) onClose();
  }

  function isActive() { return active; }

  nextBtn.addEventListener('click', next);

  // Also advance with E or Enter
  window.addEventListener('keydown', e => {
    if (!active) return;
    if (e.code === 'KeyE' || e.code === 'Enter') {
      e.preventDefault();
      next();
    }
  });

  return { show, close, isActive };
})();

// ─── Flags ── Simple persistent boolean flags via localStorage ───────────────
const Flags = (() => {
  const KEY = 'poptropica_flags';
  let data = {};

  function load() {
    try { data = JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch { data = {}; }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function set(flag, value = true) {
    if (!flag) return;
    data[flag] = value;
    save();
  }

  function get(flag) {
    return !!data[flag];
  }

  function reset() {
    data = {};
    save();
  }

  load();
  return { set, get, reset };
})();
