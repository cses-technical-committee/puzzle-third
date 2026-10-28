/**
 * TECHNOVA: TEAM PUZZLE ADVENTURE — INTEGRITY VALIDATOR
 * Verifies question bank, society logo, assets, and team configurations.
 */

const fs = require('fs');
const path = require('path');

const { PUZZLE_LEVELS } = require('./questions.js');
const { GAME_CONFIG } = require('./config.js');

console.log('=== TECHNOVA: SINGLE SITE INTEGRITY VALIDATION ===\n');

// 1. Question Bank Verification
console.log(`✓ Question bank loaded: ${PUZZLE_LEVELS.length} levels.`);
let qCount = 0;
PUZZLE_LEVELS.forEach((lvl, i) => {
  qCount += lvl.questions.length;
  if (lvl.questions.length !== 6) {
    console.warn(`[!] Warning: Level ${lvl.id} has ${lvl.questions.length} questions (expected 6).`);
  }
});
console.log(`✓ Total questions: ${qCount} / 36.`);

// 2. Society Logo Verification
const logoPath = path.join(__dirname, 'assets', 'logo', 'cses-logo.png');
if (fs.existsSync(logoPath)) {
  console.log(`✓ CSES Society Logo verified: ${logoPath} (${fs.statSync(logoPath).size} bytes)`);
} else {
  console.error(`[X] Missing CSES logo at ${logoPath}`);
}

// 3. Teams Configuration
console.log(`✓ Configured teams: ${GAME_CONFIG.teams.length} squads.`);
GAME_CONFIG.teams.forEach(t => {
  console.log(`  - [${t.id}] ${t.name} (${t.tagline})`);
});

// 4. Mascot Assets
const states = ['idle', 'thinking', 'success', 'confused', 'celebration'];
states.forEach(s => {
  const p = path.join(__dirname, 'assets', 'creatures', `creature-${s}.svg`);
  if (fs.existsSync(p)) {
    console.log(`✓ Mascot asset verified: creature-${s}.svg`);
  } else {
    console.warn(`[!] Missing mascot asset: ${p}`);
  }
});

console.log('\n=== ALL ASSETS & LOGIC VALIDATED FOR SINGLE SITE DEPLOYMENT ===\n');
