# 🌴 Mocktropica

A fan-made, open-source browser recreation of the classic Poptropica adventure game — built with vanilla HTML5 Canvas, CSS, and JavaScript. No frameworks, no build tools, just open `index.html` and play.

> **Live Demo:** [tiilikeschapatis.github.io/mocktropica](https://tiilikeschapatis.github.io/mocktropica)

![Island Select Screen](assets/screenshots/island-select.png)

---

## How to Play

| Key | Action |
|-----|--------|
| `←` `→` or `A` `D` | Move left / right |
| `↑` or `W` or `Space` | Jump |
| `E` or `Enter` | Talk to NPC / advance dialogue |

Walk up to an NPC and press **E** to start a conversation. Collect items, explore scenes, and complete the island quest!

---

## Current Features

- Side-scrolling platformer physics (gravity, jump, collision)
- Multi-scene worlds with exit triggers and seamless transitions
- NPC dialogue system with multi-line conversations
- Item collection & inventory HUD
- Quest flag system (progress saved to `localStorage`)
- Procedurally drawn characters and environments (no image assets required)
- Camera that follows the player and clamps to scene bounds
- Island select screen

---

## Islands

| Island | Status | Quest |
|--------|--------|-------|
| 🌿 Jungle Island | ✅ Playable | Find the Sacred Relic in the ruins |
| 🌊 Ocean Island | 🚧 Coming soon | — |

---

## Project Structure

```
poptropica-mock/
├── index.html              # Entry point & island select UI
├── style.css               # All styles (HUD, dialogue, select screen)
├── js/
│   ├── engine.js           # Game loop, input, camera
│   ├── player.js           # Movement, physics, sprite rendering
│   ├── scene.js            # Scene loading, platform/NPC rendering, exit triggers
│   ├── dialogue.js         # NPC dialogue + persistent quest flags
│   ├── inventory.js        # Item collection & HUD slots
│   └── main.js             # Orchestrates all systems
├── islands/
│   └── jungle/
│       └── island.json     # Island metadata
└── assets/
    └── screenshots/
```

---

## Adding a New Island

### 1. Add scenes to `js/scene.js`

Inside the `SCENES` object, add your scene definitions:

```js
'my-island-main': {
  width: 1600,
  bgGradient: ['#001122', '#002244'],
  platforms: [
    { x: 0, y: 420, width: 600, height: 60, color: '#3a5a8a' },
    // ...
  ],
  npcs: [
    {
      id: 'sailor',
      x: 200, y: 372, width: 32, height: 48,
      color: '#4488aa',
      name: 'Old Sailor',
      dialogue: ['The treasure is hidden below deck!'],
      giveItem: { emoji: '🔑', name: 'Cabin Key' },
    }
  ],
  exits: [
    { id: 'to-docks', x: 1560, y: 300, width: 40, height: 120, label: '→ Docks', toScene: 'my-island-docks' }
  ],
  playerStart: { x: 60, y: 370 },
}
```

### 2. Add an island card to `index.html`

```html
<div class="island-card" data-island="ocean">
  <div class="island-icon">🌊</div>
  <h2>Ocean Island</h2>
  <p>Uncover the sunken treasure of the Old Sailor.</p>
  <button class="play-btn" onclick="startIsland('ocean')">Play</button>
</div>
```

### 3. Update `startIsland()` in `main.js`

Point it to your island's first scene:

```js
function startIsland(islandId) {
  const firstScene = { jungle: 'jungle-entry', ocean: 'my-island-main' }[islandId];
  SceneManager.load(firstScene);
  // ...
}
```

---

## Architecture Overview

```
Engine          → game loop, deltaTime, keyboard input, camera
Player          → physics (velocity, gravity, platform collision), sprite draw
SceneManager    → loads scene data, renders bg/platforms/NPCs/exits, fires exit triggers
Dialogue        → shows/advances NPC speech, calls item-give callback on close
Flags           → key-value booleans in localStorage (tracks quest progress)
Inventory       → array of collected items, renders emoji slots in HUD
main.js         → wires all systems together, handles NPC proximity & win condition
```

Each system is a self-contained IIFE module — no bundler needed. To extend the engine, just add methods to the relevant module.

---

## Recommended Tools

| Tool | Purpose |
|------|---------|
| [Tiled](https://www.mapeditor.org/) | Design tilemaps/collision layouts, export JSON |
| [Piskel](https://www.piskelapp.com/) | Free in-browser pixel art & sprite editor |
| [Aseprite](https://www.aseprite.org/) | Professional pixel art tool ($20) |
| [GitHub Pages](https://pages.github.com/) | Free hosting — just push to `gh-pages` |

---

## Deploying to GitHub Pages

1. Push your repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → `main` → `/ (root)`**
4. Your game will be live at `https://your-username.github.io/poptropica-mock`

---

## Contributing

Pull requests are welcome! Here are some good first issues to tackle:

- [ ] Sprite sheet loader (replace procedural drawing with real pixel art)
- [ ] Sound effects (Web Audio API)
- [ ] Moving platforms
- [ ] Enemy NPCs with patrol behavior
- [ ] Ocean Island — first scenes
- [ ] Mobile touch controls overlay

Please open an issue before starting large features so we can discuss the approach.

---

## Disclaimer

This is a fan project made for learning purposes. Poptropica is a trademark of Sandbox Networks, Inc. This project is not affiliated with or endorsed by the original creators.
