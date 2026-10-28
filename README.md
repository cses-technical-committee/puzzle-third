# TECHNOVA: TEAM PUZZLE ADVENTURE
### Computer Science Engineering Society (CSES) — JNGEC Sundernagar

A unified, single-site browser adventure puzzle game designed for competitive team gameplay. All 6 teams run independently on the same website with complete session, timer, and score isolation.

---

## 1. SINGLE-SITE MULTI-TEAM ARCHITECTURE

Instead of separate folders or installations, the entire application runs from a **single, unified website**:

- **Root Location**: [`index.html`](file:///c:/Users/Jigyasu/Desktop/Puzzle/index.html)
- **Official Society Emblem**: Features the official circular badge for the **Computer Science Engineering Society (CSES), JNGEC Sundernagar**, cleanly cropped with an antialiased circular glow.
- **Independent State Isolation**:
  When all 6 teams open the site simultaneously (whether on 6 different laptops or in multiple browser windows), each team's session is completely isolated under its own local storage key:
  `technova_team_TEAM_0X_state`
  - Team 1's timer only begins when Team 1 clicks **Start Mission**.
  - Questions solved, incorrect attempts, collected secret letters, and vault combinations are stored strictly per team.
  - Progress persists automatically if a team refreshes their browser.

---

## 2. HOW TEAMS JOIN & PLAY

### Method A: Interactive Team Hub (Recommended)
1. Open [`index.html`](file:///c:/Users/Jigyasu/Desktop/Puzzle/index.html) or `http://localhost:3000` on each team's laptop.
2. On the Entry Screen, click on your squad's card:
   - **Team 01**: Nova Vanguard *(Cyan Theme)*
   - **Team 02**: Cyber Sentinels *(Emerald Theme)*
   - **Team 03**: Quantum Pioneers *(Violet Theme)*
   - **Team 04**: Aether Knights *(Gold Theme)*
   - **Team 05**: Binary Titans *(Pink/Rose Theme)*
   - **Team 06**: Nexus Enigma *(Turquoise Theme)*
3. Click **START MISSION**. The mission timer begins and the Adventure Map opens!

### Method B: Direct Team URLs via Query Parameter
Organizers can provide direct links with the `?team=` parameter to automatically pre-select that team on their machine:
- Team 01: `http://localhost:3000/?team=1` (or `?team=TEAM_01`)
- Team 02: `http://localhost:3000/?team=2` (or `?team=TEAM_02`)
- Team 03: `http://localhost:3000/?team=3` (or `?team=TEAM_03`)
- Team 04: `http://localhost:3000/?team=4` (or `?team=TEAM_04`)
- Team 05: `http://localhost:3000/?team=5` (or `?team=TEAM_05`)
- Team 06: `http://localhost:3000/?team=6` (or `?team=TEAM_06`)

---

## 3. CORE FILE STRUCTURE

```
Puzzle/
├── index.html                   # Single Master Website (Entry, Map, Levels, Vault, Victory)
├── styles.css                   # Responsive design system with cosmic dark mode & glassmorphism
├── game.js                      # Multi-team game engine, state isolation, and timer
├── questions.js                 # Complete 36 questions across 6 levels (answers & hints)
├── config.js                    # Society configuration, 6 teams list, secret word (CIPHER)
├── audio.js                     # Synthesized Web Audio API sound effects
├── server.js                    # Optional local static HTTP server (Node)
├── test_single_site.js          # Automated multi-team isolation & gameplay test
├── deploy.js                    # Asset & logic integrity validator
└── assets/
    ├── logo/
    │   ├── cses-logo.png        # Official CSES circular emblem (cropped & antialiased)
    │   └── cses-logo.jpg        # Original society upload
    └── creatures/
        ├── creature-idle.svg
        ├── creature-thinking.svg
        ├── creature-success.svg
        ├── creature-confused.svg
        └── creature-celebration.svg
```

---

## 4. HOW TO RUN

### Local Dev Server:
```bash
node server.js
```
Visit: **[http://localhost:3000](http://localhost:3000)**

### Direct Opening:
Simply double-click [`index.html`](file:///c:/Users/Jigyasu/Desktop/Puzzle/index.html) in Windows Explorer to open it in Chrome, Edge, or Firefox.

---

## 5. TESTING & VERIFICATION

Run the multi-team simulation test:
```bash
node test_single_site.js
```
All tests verify:
1. `config.js` and `questions.js` bind cleanly to `window`.
2. START MISSION starts the timer and transitions smoothly to the Adventure Map.
3. Switching squads isolates state between all 6 teams.
4. Society emblem loads with circular cropped border.
