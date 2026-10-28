/**
 * TECHNOVA: PUZZLE ADVENTURE — Question Bank (SET 2)
 *
 * Is file ko questions.js naam se save karke use karo.
 * 6 nodes x 3 questions = 18 questions.
 *
 * Format:
 *   options : 4 options ka text (A, B, C, D order mein)
 *   answer  : sahi option ka letter ("A" / "B" / "C" / "D")
 */

const PUZZLE_LEVELS = [
  {
    title: "Logical Reasoning",
    icon: "🧠",
    description: "Clues dekho, relations samjho, aur sahi deduction nikalo.",
    questions: [
      {
        text: "No poets are careless. Some writers are poets. Which conclusion follows?",
        options: [
          "Some writers are not careless",
          "All writers are poets",
          "Some poets are careless",
          "No writers are poets"
        ],
        answer: "A"
      },
      {
        text: "A woman points to a boy and says, “He is the son of my mother's only daughter.” If she has no sisters, who is the boy?",
        options: ["Brother", "Nephew", "Son", "Cousin"],
        answer: "C"
      },
      {
        text: "A is the brother of B. B is the sister of C. How is A related to C?",
        options: ["Brother", "Sister", "Cousin", "Cannot be determined"],
        answer: "A"
      }
    ]
  },
  {
    title: "Pattern & Sequence",
    icon: "🔢",
    description: "Numbers aur letters ke pattern pehchano.",
    questions: [
      {
        text: "Find the next number: 81, 27, 9, 3, ___",
        options: ["0", "1", "2", "6"],
        answer: "B"
      },
      {
        text: "Find the next number: 7, 14, 12, 24, 22, 44, ___",
        options: ["40", "42", "46", "48"],
        answer: "B"
      },
      {
        text: "Find the next pair: AB, DE, GH, JK, ___",
        options: ["LM", "MN", "NO", "OP"],
        answer: "B"
      }
    ]
  },
  {
    title: "Problem Solving",
    icon: "⚙️",
    description: "Calculation lagao aur sahi value tak pahuncho.",
    questions: [
      {
        text: "A father is three times as old as his son. In 12 years, he will be twice as old as his son. How old is the son now?",
        options: ["8 years", "10 years", "12 years", "14 years"],
        answer: "C"
      },
      {
        text: "A code lock has a three-digit code. Each digit can be 0–9, repetition is allowed, and leading zeroes are allowed. How many possible codes exist?",
        options: ["100", "720", "900", "1,000"],
        answer: "D"
      },
      {
        text: "You have a 3-litre jug and a 5-litre jug, neither marked. What is the smallest positive amount of water you can measure exactly using these jugs?",
        options: ["1 litre", "2 litres", "3 litres", "4 litres"],
        answer: "A"
      }
    ]
  },
  {
    title: "Data Interpretation",
    icon: "📊",
    description: "Rates, percentages aur data ko sahi padho.",
    questions: [
      {
        text: "Machine A produces 120 units in 4 hours. Machine B produces 150 units in 5 hours. If both operate together for 3 hours at these rates, how many units do they produce?",
        options: ["150", "165", "180", "210"],
        answer: "C"
      },
      {
        text: "A test's pass rate rises from 40% to 50%. What is the relative percentage increase in the pass rate?",
        options: ["10%", "20%", "25%", "50%"],
        answer: "C"
      },
      {
        text: "A student scores 70 in a test worth 40% of the final grade and 90 in a test worth 60%. What is the weighted average?",
        options: ["78", "80", "82", "84"],
        answer: "C"
      }
    ]
  },
  {
    title: "Constraint Satisfaction",
    icon: "🧩",
    description: "Har condition check karo, phir valid option chuno.",
    questions: [
      {
        text: "A three-digit number uses digits 1, 2, and 3 exactly once. The hundreds digit must be greater than the tens digit. Which is the smallest valid number?",
        options: ["123", "213", "312", "132"],
        answer: "B"
      },
      {
        text: "A team must contain exactly one student from each of three groups: G1, G2, and G3. Which selection satisfies the constraint?",
        options: [
          "Two from G1, one from G2",
          "One from each group",
          "Three from G3",
          "Two from G2, one from G3"
        ],
        answer: "B"
      },
      {
        text: "Three switches must each be assigned a different color from red, green, and blue. How many valid assignments are possible?",
        options: ["3", "6", "9", "27"],
        answer: "B"
      }
    ]
  },
  {
    title: "Encoding & Decoding",
    icon: "🔐",
    description: "Code ka rule pakdo aur use apply karo.",
    questions: [
      {
        text: "If COMPUTER is written as DPNQVUFS, how is MONITOR written using the same rule?",
        options: ["NPOJUPS", "NPOJUTS", "LNMHSNQ", "NQOJUPS"],
        answer: "A"
      },
      {
        text: "A code changes each letter to the previous letter and reverses the result. What is the code for GAME?",
        options: ["DLZF", "FZLD", "DLFZ", "EALF"],
        answer: "A"
      },
      {
        text: "If each letter moves one place backward, how is MANGO encoded?",
        options: ["LZMFN", "LZNGN", "MZMFN", "KZMFN"],
        answer: "A"
      }
    ]
  }
];

if (typeof window !== "undefined") {
  window.PUZZLE_LEVELS = PUZZLE_LEVELS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PUZZLE_LEVELS };
}
