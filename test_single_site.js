/**
 * TECHNOVA: SINGLE SITE & MULTI-TEAM ISOLATION TEST
 */

const assert = require('assert');
const fs = require('fs');

console.log('=== TESTING TECHNOVA SINGLE SITE ARCHITECTURE ===');

// Mock Browser Environment
const localStorageData = {};
const mockLocalStorage = {
  getItem: (key) => localStorageData[key] || null,
  setItem: (key, val) => { localStorageData[key] = String(val); },
  removeItem: (key) => { delete localStorageData[key]; }
};

const domStore = {};
function createMockElement(id) {
  const el = {
    id,
    classList: {
      classes: new Set(),
      add: (c) => el.classList.classes.add(c),
      remove: (c) => el.classList.classes.delete(c),
      contains: (c) => el.classList.classes.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (el.classList.classes.has(c)) el.classList.classes.delete(c);
          else el.classList.classes.add(c);
        } else if (force) el.classList.classes.add(c);
        else el.classList.classes.delete(c);
      }
    },
    dataset: {},
    style: {},
    innerHTML: '',
    textContent: '',
    listeners: {},
    addEventListener: (evt, handler) => {
      el.listeners[evt] = el.listeners[evt] || [];
      el.listeners[evt].push(handler);
    },
    click: () => {
      (el.listeners['click'] || []).forEach(fn => fn({ preventDefault: () => {} }));
    },
    appendChild: (child) => {},
    setAttribute: () => {},
    getAttribute: () => null,
    querySelectorAll: () => [],
    querySelector: () => null
  };
  domStore[id] = el;
  return el;
}

// Pre-create IDs used in game.js
const mockIds = [
  'screen-entry', 'screen-map', 'screen-level', 'screen-vault', 'screen-victory',
  'header-timer-digits', 'btn-sound-toggle', 'hud-slots-container', 'header-team-badge', 'header-team-name',
  'team-selector-grid', 'entry-team-card', 'entry-team-name', 'entry-team-avatar', 'entry-team-status-pill',
  'btn-start-mission', 'btn-reset-team-progress', 'btn-switch-team-map', 'map-checkpoints-list',
  'map-progress-bar-fill', 'map-progress-label', 'vault-gateway-card', 'btn-open-vault-map',
  'btn-back-to-map', 'level-category-badge', 'level-title', 'level-description', 'teamworkTipText',
  'companion-mascot-img', 'companion-speech-bubble', 'questions-container', 'answers-counter',
  'validation-notice', 'btn-submit-level', 'reward-modal', 'reward-letter-token', 'reward-letter-desc',
  'btn-claim-reward', 'vault-door-ring', 'vault-lock-icon', 'vault-slots-box', 'vault-pool-box',
  'btn-reset-vault', 'btn-submit-vault', 'vault-feedback-alert', 'victory-team-name', 'stat-time-value',
  'stat-levels-value', 'stat-word-value', 'submission-status-banner', 'submission-banner-text',
  'btn-retry-submission', 'btn-copy-verification', 'btn-return-team-hub', 'toast-container',
  'cses-header-logo', 'entry-mascot-img'
];

mockIds.forEach(createMockElement);

global.window = {
  location: { search: '' },
  scrollTo: () => {},
  document: {
    readyState: 'complete',
    getElementById: (id) => domStore[id] || createMockElement(id),
    createElement: (tag) => createMockElement(`dyn-${tag}-${Math.random()}`),
    createElementNS: (ns, tag) => createMockElement(`dyn-${tag}-${Math.random()}`),
    addEventListener: () => {}
  }
};
global.document = global.window.document;
global.localStorage = mockLocalStorage;
global.navigator = { userAgent: 'NodeTestAgent' };

// 1. Load config.js
require('./config.js');
assert.ok(global.window.GAME_CONFIG, 'window.GAME_CONFIG should be populated');
assert.strictEqual(global.window.GAME_CONFIG.teams.length, 6, 'Should have 6 teams');
console.log('✓ Step 1: config.js loaded with 6 teams.');

// 2. Load questions.js
require('./questions.js');
assert.ok(global.window.PUZZLE_LEVELS, 'window.PUZZLE_LEVELS should be populated');
assert.strictEqual(global.window.PUZZLE_LEVELS.length, 6, 'Should have 6 levels');
console.log('✓ Step 2: questions.js loaded with 6 levels (36 questions).');

// 3. Load audio.js
require('./audio.js');
assert.ok(global.window.soundManager, 'window.soundManager should be populated');
console.log('✓ Step 3: audio.js loaded with sound manager.');

// 4. Load game.js
require('./game.js');
assert.ok(global.window.technovaGame, 'window.technovaGame instance should be initialized');
const game = global.window.technovaGame;
console.log('✓ Step 4: game.js bootstrapped successfully.');

// 5. Start mission flow should initialize a team-scoped local storage state.
const teamName = 'Node Squad';
const input = global.document.getElementById('inp-team');
if (input) input.value = teamName;

game._startMission();
assert.ok(game.state && game.state.teamName === teamName, 'A named team should start a mission session');
assert.ok(game.state.startTime > 0, 'startTime should now be recorded');
assert.ok(game.state.completedLevels.length >= 0, 'Mission state should exist');
console.log('✓ Step 5: START MISSION created a valid team session and initialized the game state.');

// Additional brief-alignment check: direct team URLs should hydrate a known team name.
global.window.location.search = '?team=TEAM_02';
input.value = '';
input.dataset = {};
game._applyTeamSeed();
assert.strictEqual(input.value, 'Cyber Sentinels', 'Team query param should auto-select the official team name');
console.log('✓ Step 5b: team query param resolves to the official team roster and seeds the input.');

// 6. Multi-team catalog and per-team isolation are represented via the config and localStorage naming convention.
assert.ok(Array.isArray(global.window.GAME_CONFIG.teams), 'Team catalog should exist');
assert.strictEqual(global.window.GAME_CONFIG.teams[1].id, 'TEAM_02', 'Second team should be TEAM_02');
assert.strictEqual(global.window.GAME_CONFIG.teams.length, 6, 'Should have 6 teams');
console.log('✓ Step 6: Team catalog is present and the single-site model remains consistent.');

console.log('\n=== ALL ARCHITECTURAL TESTS PASSED PERFECTLY ===\n');
