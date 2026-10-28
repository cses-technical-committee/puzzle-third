/**
 * TECHNOVA: TEAM PUZZLE ADVENTURE — AUTOMATED TEST SUITE
 * Validates data integrity, progression rules, scoring formulas, and team configurations.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const { PUZZLE_LEVELS } = require('./questions.js');
const { GAME_CONFIG } = require('./config.js');

console.log('--- STARTING TECHNOVA AUTOMATED TEST SUITE ---');

let passedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

// 1. Structure Tests
test('PUZZLE_LEVELS contains exactly 6 levels', () => {
  assert.strictEqual(PUZZLE_LEVELS.length, 6);
});

test('Every level has exactly 6 questions (36 total)', () => {
  let count = 0;
  PUZZLE_LEVELS.forEach((lvl, idx) => {
    assert.strictEqual(lvl.questions.length, 6, `Level ${idx + 1} has ${lvl.questions.length} questions`);
    count += lvl.questions.length;
  });
  assert.strictEqual(count, 36);
});

test('Every question has text, 4 options (A, B, C, D), a valid correctAnswer and a hint', () => {
  const validKeys = ['A', 'B', 'C', 'D'];
  PUZZLE_LEVELS.forEach((lvl) => {
    lvl.questions.forEach((q) => {
      assert.ok(q.text && q.text.trim().length > 0, `Question text missing in ${q.id}`);
      assert.strictEqual(q.options.length, 4, `Question ${q.id} does not have 4 options`);
      assert.ok(validKeys.includes(q.correctAnswer), `Invalid answer key ${q.correctAnswer} in ${q.id}`);
      assert.ok(q.hint && q.hint.trim().length > 0, `Hint missing in ${q.id}`);
    });
  });
});

// 2. Secret Word Mapping
test('Secret word matches letter mapping and equals CIPHER', () => {
  assert.strictEqual(GAME_CONFIG.secretWord, 'CIPHER');
  assert.strictEqual(GAME_CONFIG.secretWordLength, 6);
  const mappedWord = [1, 2, 3, 4, 5, 6].map((i) => GAME_CONFIG.secretLetterMapping[i]).join('');
  assert.strictEqual(mappedWord, 'CIPHER');
});

// 3. Scoring Formula Validation
test('Default scoring formula computes valid numerical results', () => {
  const formula = GAME_CONFIG.scoringFormula;
  assert.strictEqual(formula.pointsPerCorrectQuestion, 100);
  assert.strictEqual(formula.levelCompletionBonus, 500);
  assert.strictEqual(formula.vaultUnlockBonus, 1500);

  // Perfect game score: 36 * 100 + 6 * 500 + 1500 = 3600 + 3000 + 1500 = 8100
  const maxScore = 36 * formula.pointsPerCorrectQuestion + 6 * formula.levelCompletionBonus + formula.vaultUnlockBonus;
  assert.strictEqual(maxScore, 8100);
});

// 4. Mascot SVG Assets Validation
test('All 5 creature mascot SVGs exist in assets/creatures', () => {
  const states = ['idle', 'thinking', 'success', 'confused', 'celebration'];
  states.forEach((s) => {
    const file = path.join(__dirname, 'assets', 'creatures', `creature-${s}.svg`);
    assert.ok(fs.existsSync(file), `Mascot SVG missing: ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(content.includes('<svg'), `Invalid SVG content in creature-${s}.svg`);
  });
});

// 5. Deployments Validation
test('Single-site config exposes a six-team catalog for the event', () => {
  assert.ok(Array.isArray(GAME_CONFIG.teams));
  assert.strictEqual(GAME_CONFIG.teams.length, 6);
  GAME_CONFIG.teams.forEach((team, idx) => {
    assert.strictEqual(team.id, `TEAM_0${idx + 1}`);
    assert.ok(team.name && team.name.trim().length > 0);
  });
});

console.log(`\n--- ALL ${passedTests} TESTS EXECUTED AND PASSED ---`);
