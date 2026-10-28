/**
 * TECHNOVA: PUZZLE ADVENTURE
 * Master Configuration File
 *
 * Har nayi website / naye set ke liye sirf yahan ke 2 cheezein badalni hain:
 *   1) secretWord   -> final unscrambled word (letters ki ginti = levels ki ginti = 6)
 *   2) storageKey   -> har website ke liye alag naam (progress save hone ke liye)
 * Questions badalne ke liye questions.js kholo.
 */
 
const GAME_CONFIG = {
  // Branding
  eventName: "TECHNOVA 2026",
  eventSubtitle: "ANNUAL TECHNICAL SYMPOSIUM",
  gameName: "PUZZLE ADVENTURE",
  societyName: "Computer Science Engineering Society (CSES)",
  institution: "JNGEC Sundernagar",
  logoPath: "./assets/logo/cses-logo.png",
  mascotPath: "./assets/mascot.jpg",
 
  // ===== YAHAN WORD BADLO (unscrambled form mein likho) =====
  secretWord: "VECTOR",
 
  // Har website ke liye alag rakho (e.g. set2, set3 ...)
  storageKey: "technova_puzzle_set1",
 
  // Vault mein collected letters ka hint tray dikhana hai? (false = team ko yaad rakhna hai)
  showCollectedLettersInVault: false,
 
  // Node submit karne se pehle teeno questions ka answer zaroori?
  requireAllAnswered: true,
 
  // Result screen par "View Answers" button dikhana hai?
  showReview: true,
 
  // Organizer shortcut: Ctrl+Shift+O -> passcode -> session reset
  organizerPasscode: "TECHNOVA2026",
 
  // Marking scheme: sahi answer = +4, galat answer = -1, skip = 0
  marksCorrect: 4,
  marksWrong: -1,
 
  enableSound: true
};
 
if (typeof window !== "undefined") {
  window.GAME_CONFIG = GAME_CONFIG;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { GAME_CONFIG };
}