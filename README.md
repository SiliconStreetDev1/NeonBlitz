# ⚡ Neon Blitz ⚡

**Neon Blitz** is a fast-paced, cyberpunk-themed hacking puzzle game built entirely with Vanilla JavaScript and HTML5 Canvas. **This project was created to showcase the [RLO Audio Engine](https://github.com/SiliconStreetDev1/rlo-engine)**—an optimized compiler and procedural Web Audio engine designed specifically for web-based games. Trace paths, break encryption, and survive hazardous grid anomalies while bathing in responsive visual effects and generative synthwave music synthesized dynamically at runtime!

🎮 **[PLAY NEON BLITZ DIRECTLY IN YOUR BROWSER HERE!](https://siliconstreetdev1.github.io/NeonBlitz/)** 🎮

## 🌟 Features

- **Fast-Paced Puzzle Action:** Swipe across the grid to connect targets, manage your time, and push for high scores through a progressive difficulty curve.
- **Procedural Audio Engine:** Powered by the RLO Audio Engine. It converts sequence files into 1D numerical arrays and synthesizes audio at runtime using pure mathematics and the native Web Audio API, entirely bypassing external audio samples. Features real-time generative synthesizers, drum machines, and dynamic sound effects synced directly to gameplay.
- **Modular VFX System:** Tracks are mapped to different genres with custom particle and shader-like canvas plugins (e.g., Matrix Rain, Retro CRT, Warp Speed, Angelic Light).
- **Dynamic Hazards:** Face ever-evolving board mechanics including EMP blasts, Chameleon blocks, Phasing nodes, Encrypted locks, and Memory Leaks.
- **Progressive Web App (PWA):** 100% offline-capable. Installable directly to your device's home screen with Service Worker caching for instant load times.
- **Mobile First:** Designed with a smooth, forgiving touch-interaction model, preventing iOS zooming, and supporting orientation locks.

## 🚀 Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/SiliconStreetDev1/NeonBlitz.git
   cd neon-blitz
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The game will be available at `http://localhost:5173`.

### Building for Production

To create an optimized, minified production build:

```bash
npm run build
```

You can preview the built files locally with:

```bash
npm run preview
```

## 🛠️ Tech Stack

- **Vite:** Next-generation frontend tooling for rapid development and optimized builds.
- **Vanilla JS (ES Modules):** Zero heavy frameworks. High-performance, class-based architecture.
- **HTML5 Canvas:** Custom-built rendering loop and particle system for 60fps+ visual effects.
- **Web Audio API:** Procedural synthesis handled entirely by the RLO Audio Engine.
- **PWA:** Manifest and Service Worker integration for standalone, offline mobile play.

## 📂 Project Structure

```
Neon-Blitz/
├── public/                     # Static assets served at the root ("/")
│   ├── Audio/Tracks/           # JSON level data for generative music
│   ├── manifest.json           # PWA web manifest
│   ├── sw.js                   # PWA Service Worker
│   └── icon-*.png              # App icons
├── src/
│   ├── Audio/                  # Audio managers and procedural sound logic
│   ├── Plugins/                # Modular visual effects plugins (MatrixRain, WarpSpeed, etc.)
│   ├── UI/                     # Component managers (HUD, Modals, Grid)
│   ├── engine.js               # Core game loop and state orchestrator
│   ├── board.js                # Grid and strand-weaving path generation
│   ├── particles.js            # Base canvas particle system
│   ├── *-manifest.json         # Progression, VFX, and audio mapping configs
│   └── main.js                 # App entry point
├── index.html                  # Main HTML template
├── package.json                # Project dependencies and scripts
└── vite.config.js              # Vite build configuration
```

## ⚠️ Hazards Overview

As you progress, the core system fights back:

- **Fog of War (Lvl 10):** Plunges the grid into darkness, offering only a small spotlight.
- **Chameleon (Lvl 15):** Blocks rapidly flash decoy colors.
- **EMP (Lvl 20):** High-voltage shockwaves destroy your active connection line.
- **Phasing (Lvl 25):** Quantum blocks fade in and out of reality.
- **Encrypted Nodes (Lvl 30):** Specific nodes require you to hold your trace to decrypt them.
- **Short Circuit (Lvl 35):** Trace too slowly and your line overloads.
- **Memory Leak (Lvl 45):** Grid blacks out the moment you touch the screen.

## 🔊 About the RLO Audio Engine

This game was built from the ground up to showcase the capabilities of the **RLO Audio Engine**. Instead of relying on heavy, bandwidth-consuming MP3s or OGGs, the game's entire soundtrack and sound effects library is stored as tiny numerical sequence files.

The engine interprets these arrays and constructs mathematical waveforms in real-time. This provides an incredibly small bundle footprint, zero garbage-collection overhead, and tight dynamic integration (like analyzing the beat pulse to perfectly sync visual glitches and screen shakes to the music).

## ⚙️ JSON Configuration

Neon Blitz is built with a data-driven architecture, making it easy to mod or tweak without diving into the core JavaScript. All configuration files are located in `src/` and are natively bundled by Vite:

- **`engine-tuning.json`**: Core game variables including starting time, time decay rates, swipe penalties, and device vibration intensities.
- **`level-config.json`**: Defines the grid dimensions and the master list of available block colors/hex codes.
- **`progression-manifest.json`**: Controls the difficulty curve, target obfuscation thresholds, and specifies exactly which levels unlock specific hazards.
- **`vfx-manifest.json`**: Maps individual level audio tracks to specific Canvas particle plugins and thematic genres.
- **`audio-manifest.json`**: Registers level tracks and routes procedural synthesizers to their respective instrument ranges.

## 📜 License

MIT License

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.
