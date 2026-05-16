// ─── inventory.js ── Item collection and HUD display ────────────────────────

const Inventory = (() => {
  const slotsEl = document.getElementById('inventory-slots');
  const MAX_SLOTS = 6;

  let items = [];

  function add(item) {
    if (items.length >= MAX_SLOTS) return false;
    if (items.find(i => i.name === item.name)) return false; // no duplicates
    items.push(item);
    render();
    return true;
  }

  function has(name) {
    return !!items.find(i => i.name === name);
  }

  function render() {
    slotsEl.innerHTML = '';
    for (let i = 0; i < MAX_SLOTS; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot';
      if (items[i]) {
        slot.textContent = items[i].emoji;
        slot.title = items[i].name;
      }
      slotsEl.appendChild(slot);
    }
  }

  render(); // init empty slots

  return { add, has };
})();
