/**
 * TECHNOVA: TEAM PUZZLE ADVENTURE
 * Mascot Companion System ("Nova" - The Cyber Spirit Guide)
 *
 * Provides expressive, animated vector mascot states with graceful image fallback.
 * States: idle, thinking, success, confused, collect, victory.
 */

class MascotSystem {
  constructor(containerId = "mascot-companion") {
    this.containerId = containerId;
    this.currentState = "idle";
    this.useCustomImage = false;
    this.customImages = {
      idle: "./assets/creatures/creature-idle.png",
      thinking: "./assets/creatures/creature-thinking.png",
      success: "./assets/creatures/creature-success.png",
      confused: "./assets/creatures/creature-confused.png",
      celebration: "./assets/creatures/creature-celebration.png"
    };
  }

  /**
   * Sets the mascot state and updates DOM with smooth micro-animations.
   * @param {string} state - 'idle' | 'thinking' | 'success' | 'confused' | 'collect' | 'victory'
   * @param {string} speechText - Optional companion dialogue bubble
   */
  setState(state, speechText = "") {
    this.currentState = state;
    const containers = document.querySelectorAll(`.${this.containerId}, #${this.containerId}`);
    containers.forEach((el) => {
      el.className = `mascot-container mascot-state-${state}`;
      el.innerHTML = this.renderMascotHTML(state, speechText);
    });
  }

  renderMascotHTML(state, speechText) {
    const bubbleHTML = speechText
      ? `<div class="mascot-speech-bubble" role="status" aria-live="polite">
          <span class="speech-text">${speechText}</span>
          <div class="speech-arrow"></div>
        </div>`
      : "";

    // SVG Cyber-Owl / Companion Vector (Fully scalable, gorgeous gradients & animated elements)
    const svgContent = `
      <div class="mascot-avatar-wrapper">
        <svg class="mascot-svg" viewBox="0 0 160 160" width="100%" height="100%">
          <defs>
            <linearGradient id="owlBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38BDF8"/>
              <stop offset="50%" stop-color="#6366F1"/>
              <stop offset="100%" stop-color="#1E1B4B"/>
            </linearGradient>
            <linearGradient id="owlBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#E0E7FF"/>
              <stop offset="100%" stop-color="#A5B4FC"/>
            </linearGradient>
            <linearGradient id="eyeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#67E8F9"/>
              <stop offset="100%" stop-color="#38BDF8"/>
            </linearGradient>
            <radialGradient id="auraGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#63D9E8" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#63D9E8" stop-opacity="0"/>
            </radialGradient>
            <filter id="novaGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          </defs>

          <!-- Ambient Aura -->
          <circle cx="80" cy="85" r="60" fill="url(#auraGlow)" class="mascot-aura"/>

          <!-- Floating Antenna / Crest -->
          <g class="mascot-antenna">
            <line x1="80" y1="42" x2="80" y2="24" stroke="#63D9E8" stroke-width="3" stroke-linecap="round"/>
            <circle cx="80" cy="20" r="5" fill="#F5C66B" filter="url(#novaGlow)" class="antenna-orb"/>
          </g>

          <!-- Ears / Crest Tufts -->
          <polygon points="46,45 32,25 58,38" fill="#4F46E5" class="ear-left"/>
          <polygon points="114,45 128,25 102,38" fill="#4F46E5" class="ear-right"/>

          <!-- Body -->
          <ellipse cx="80" cy="90" rx="46" ry="50" fill="url(#owlBodyGrad)" stroke="#63D9E8" stroke-width="2" class="mascot-body"/>

          <!-- Wings -->
          <path d="M34,80 C24,92 26,115 42,118 C38,102 42,88 48,80 Z" fill="#4338CA" stroke="#63D9E8" stroke-width="1.5" class="mascot-wing wing-left"/>
          <path d="M126,80 C136,92 134,115 118,118 C122,102 118,88 112,80 Z" fill="#4338CA" stroke="#63D9E8" stroke-width="1.5" class="mascot-wing wing-right"/>

          <!-- Belly Shield -->
          <ellipse cx="80" cy="98" rx="28" ry="32" fill="url(#owlBellyGrad)" opacity="0.9" class="mascot-belly"/>
          <!-- Circuit pattern on belly -->
          <path d="M72,92 L80,98 L88,92 M80,98 L80,114" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round"/>

          <!-- Eye Plates -->
          <circle cx="62" cy="74" r="16" fill="#0F172A" stroke="#63D9E8" stroke-width="2"/>
          <circle cx="98" cy="74" r="16" fill="#0F172A" stroke="#63D9E8" stroke-width="2"/>

          <!-- Dynamic Eyes (Rendered based on state) -->
          ${this.getEyeMarkup(state)}

          <!-- Beak -->
          <polygon points="80,82 74,90 86,90" fill="#F5C66B" filter="url(#novaGlow)"/>

          <!-- Cheek Glows -->
          <circle cx="50" cy="90" r="4" fill="#F472B6" opacity="0.6"/>
          <circle cx="110" cy="90" r="4" fill="#F472B6" opacity="0.6"/>

          <!-- Micro Feet / Hover Base -->
          <ellipse cx="68" cy="138" rx="8" ry="4" fill="#F5C66B"/>
          <ellipse cx="92" cy="138" rx="8" ry="4" fill="#F5C66B"/>
        </svg>
      </div>
    `;

    return `
      ${bubbleHTML}
      ${svgContent}
    `;
  }

  getEyeMarkup(state) {
    if (state === "success" || state === "victory") {
      // Joyful arc eyes ^ ^
      return `
        <path d="M54,76 Q62,64 70,76" fill="none" stroke="#67E8F9" stroke-width="4" stroke-linecap="round" class="eye-happy"/>
        <path d="M90,76 Q98,64 106,76" fill="none" stroke="#67E8F9" stroke-width="4" stroke-linecap="round" class="eye-happy"/>
      `;
    }

    if (state === "confused") {
      // Tilted / Questioning eyes
      return `
        <circle cx="62" cy="74" r="7" fill="#F87171" class="eye-iris"/>
        <text x="94" y="80" font-family="'Inter', sans-serif" font-size="16" font-weight="900" fill="#F87171">?</text>
      `;
    }

    if (state === "thinking") {
      // Concentrated eyes looking upward/sideways
      return `
        <circle cx="65" cy="70" r="8" fill="#67E8F9" class="eye-iris eye-thinking"/>
        <circle cx="67" cy="68" r="3" fill="#FFFFFF"/>
        <circle cx="101" cy="70" r="8" fill="#67E8F9" class="eye-iris eye-thinking"/>
        <circle cx="103" cy="68" r="3" fill="#FFFFFF"/>
      `;
    }

    // Default Idle Eyes with gentle blink animation
    return `
      <g class="mascot-eyes-normal">
        <circle cx="62" cy="74" r="9" fill="url(#eyeGlow)" class="eye-iris"/>
        <circle cx="64" cy="72" r="3.5" fill="#FFFFFF"/>
        <circle cx="98" cy="74" r="9" fill="url(#eyeGlow)" class="eye-iris"/>
        <circle cx="100" cy="72" r="3.5" fill="#FFFFFF"/>
      </g>
    `;
  }
}

window.mascotSystem = new MascotSystem();
