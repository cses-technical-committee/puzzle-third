/**
 * TECHNOVA: PUZZLE ADVENTURE — Game Engine v5
 *
 * FLOW
 *  1. START  -> timer begins (0 se upar chalta rehta hai, koi limit nahi)
 *  2. MAP    -> 6 nodes on a winding road, ek ke baad ek unlock
 *  3. NODE   -> 3 questions, answers sirf SAVE hote hain (koi evaluation nahi)
 *  4. REVEAL -> node submit hote hi fullscreen mein 1 secret letter (random), tap = back to map
 *  5. VAULT  -> 6 letters yaad rakhke team word type/arrange karti hai (config.secretWord)
 *  6. RESULT -> vault khulte hi timer ruk jata hai, TAB answers evaluate hote hain, score dikhta hai
 *
 * Word badalna:      config.js  -> secretWord
 * Questions badalna: questions.js
 */
 
(function () {
  'use strict';
 
  const CFG = window.GAME_CONFIG || {};
  const LEVELS = window.PUZZLE_LEVELS || [];
  const WORD = String(CFG.secretWord || '').toUpperCase().replace(/[^A-Z]/g, '');
  const KEY = CFG.storageKey || 'technova_puzzle_set1';
  const TEAM_KEY = `${KEY}_team_name:${window.location.pathname}`;
  const N = LEVELS.length;
  const TOTAL_Q = LEVELS.reduce((s, l) => s + l.questions.length, 0);
  const ABC = 'ABCD';
 
  // ───────────── MAP LAYOUT (auto-generated from number of nodes) ─────────────
  const STEP = 120, VAULT_Y = 70;
  const MAP_W = 400;
  const MAP_H = VAULT_Y + N * STEP + 110;
  const VAULT = { x: 200, y: VAULT_Y };
  const NODES = LEVELS.map((_, i) => {
    let x = i === 0 ? 200 : (i % 2 === 1 ? 100 : 300);
    if (i === N - 1 && N > 1) x = 200;
    return { x, y: VAULT_Y + (N - i) * STEP };
  });
  const PTS = NODES.concat([VAULT]);
 
  function seg(a, b) {
    const m = (a.y + b.y) / 2;
    return `M${a.x},${a.y} C${a.x},${m} ${b.x},${m} ${b.x},${b.y}`;
  }
 
  // ───────────── helpers ─────────────
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => String(v).padStart(2, '0')).join(':');
  function snd(name) { try { if (CFG.enableSound !== false) window.soundManager?.[name]?.(); } catch (e) {} }
 
  // ───────────── state ─────────────
  let state = null;
  let timerId = null;
  let currentNode = -1;
  let revealOpenedAt = 0;
  let vaultBusy = false;
 
  function blank() {
    return {
      started: false, startTime: null, endTime: null, finished: false,
      completed: [], answers: {}, drafts: {}, letters: {},
      typed: '', vaultAttempts: 0
    };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function updateTeamName(name) {
    const hasName = Boolean(name);
    $('header-team-name').textContent = name;
    $('header-team-chip').hidden = !hasName;
  }
 
  // 6 letters ko randomly nodes mein baant do (word ke original order se alag)
  function makeLetterMap() {
    const letters = WORD.split('');
    const sh = letters.slice();
    const distinct = new Set(letters).size > 1;
    for (let t = 0; t < 60; t++) {
      for (let i = sh.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sh[i], sh[j]] = [sh[j], sh[i]];
      }
      if (!distinct || sh.join('') !== WORD) break;
    }
    const map = {};
    LEVELS.forEach((_, i) => { map[i] = sh[i] || '?'; });
    return map;
  }
 
  // ───────────── screens ─────────────
  const SCREENS = ['entry', 'map', 'node', 'vault', 'result', 'review'];
  function show(name) {
    SCREENS.forEach((s) => $('screen-' + s).classList.remove('active'));
    $('screen-' + name).classList.add('active');
    if (name !== 'map') window.scrollTo(0, 0);
  }
 
  // ───────────── timer ─────────────
  function showTimer() { $('timer-chip').style.display = 'flex'; }
  function tick() {
    if (!state || !state.startTime) return;
    const end = state.finished && state.endTime ? state.endTime : Date.now();
    $('timer-text').textContent = fmt(Math.max(0, Math.floor((end - state.startTime) / 1000)));
  }
  function startTimer() {
    stopTimer();
    showTimer();
    tick();
    if (state.finished) return;
    timerId = setInterval(tick, 500);
  }
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
 
  // ───────────── toast / confetti ─────────────
  function toast(msg, dur = 2800) {
    const c = $('toasts');
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, dur);
  }
  function confetti() {
    const ov = $('confetti');
    ov.innerHTML = '';
    const cols = ['#e07a2f', '#f5c842', '#6a9e7f', '#c0522b', '#f39853', '#ffffff', '#8ebfa4'];
    for (let i = 0; i < 90; i++) {
      const p = document.createElement('div');
      p.className = 'c-bit';
      const sz = 8 + Math.random() * 10;
      p.style.cssText = `left:${Math.random() * 100}%;width:${sz}px;height:${sz}px;` +
        `background:${cols[Math.floor(Math.random() * cols.length)]};` +
        `border-radius:${Math.random() > .5 ? '50%' : '2px'};` +
        `animation-duration:${1.6 + Math.random() * 2}s;animation-delay:${Math.random() * 1.4}s;`;
      ov.appendChild(p);
    }
    setTimeout(() => { ov.innerHTML = ''; }, 6500);
  }
 
  // ══════════════════════════════════════════════════════════════════════════
  //  MAP
  // ══════════════════════════════════════════════════════════════════════════
  function tree(x, y, s) {
    return `<g transform="translate(${x},${y}) scale(${s})">
      <ellipse cy="15" rx="14" ry="4" fill="rgba(107,66,38,.15)"/>
      <rect x="-3" y="0" width="6" height="15" rx="2" fill="#8a5a3a"/>
      <circle cy="-7" r="14" fill="#8ebfa4"/><circle cx="-9" cy="3" r="10" fill="#6a9e7f"/><circle cx="9" cy="3" r="10" fill="#6a9e7f"/>
    </g>`;
  }
  function cloud(x, y, s, d) {
    return `<g transform="translate(${x},${y}) scale(${s})"><g class="cloud-in" style="animation-delay:-${d}s">
      <ellipse rx="28" ry="10" fill="rgba(255,255,255,.88)"/><circle cx="-11" cy="-8" r="12" fill="rgba(255,255,255,.88)"/><circle cx="8" cy="-11" r="15" fill="rgba(255,255,255,.88)"/>
    </g></g>`;
  }
  function bush(x, y) {
    return `<g transform="translate(${x},${y})"><circle r="11" fill="#6a9e7f"/><circle cx="12" cy="3" r="9" fill="#8ebfa4"/><circle cx="-11" cy="4" r="8" fill="#8ebfa4"/></g>`;
  }
  function flower(x, y, c) {
    return `<g transform="translate(${x},${y})"><circle r="5" fill="${c}"/><circle r="2" fill="#fff6d8"/></g>`;
  }
  function decor() {
    const H = MAP_H;
    let s = '';
    // distant hills
    s += `<path d="M0,${H} L0,${H - 90} Q90,${H - 150} 200,${H - 100} T400,${H - 110} L400,${H} Z" fill="#d6e6cf"/>`;
    s += `<path d="M0,${H} L0,${H - 40} Q130,${H - 85} 250,${H - 45} T400,${H - 55} L400,${H} Z" fill="#bcd8bf"/>`;
    // clouds
    [[70, 40, 1, 0], [320, 120, .8, 6], [90, H * .3, .7, 3], [330, H * .52, .9, 9], [70, H * .72, .8, 12]]
      .forEach(([x, y, sc, d]) => { s += cloud(x, y, sc, d); });
    // trees along the edges (kept clear of the road)
    for (let y = 150; y < H - 140; y += 150) {
      s += tree(26, y + (y % 3) * 12, 1 + ((y / 50) % 3) * .08);
      s += tree(375, y + 70, 1.05 - ((y / 50) % 2) * .12);
    }
    s += bush(160, H - 30); s += bush(250, H - 22); s += bush(350, H - 110); s += bush(40, H - 160);
    [[135, H - 60, '#f39853'], [275, H - 48, '#f5c842'], [60, H - 100, '#f39853'], [345, H - 70, '#e8a0a0'],
     [30, 330, '#f5c842'], [372, 560, '#f39853']].forEach(([x, y, c]) => { s += flower(x, y, c); });
    return s;
  }
 
  function nextNodeIdx() { return LEVELS.findIndex((_, i) => !state.completed.includes(i)); }
 
  function renderMap() {
    const done = state.completed.length;
    $('map-prog-text').textContent = `${done} / ${N}`;
    $('map-prog-bar').style.width = `${Math.round((done / N) * 100)}%`;
 
    const allDone = done >= N;
    const cur = nextNodeIdx();
 
    let svg = `<svg class="map-svg" viewBox="0 0 ${MAP_W} ${MAP_H}" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Adventure map">`;
    svg += decor();
 
    // road
    let base = '';
    for (let i = 0; i < N; i++) base += seg(PTS[i], PTS[i + 1]);
    svg += `<path class="road-edge" d="${base}"/><path class="road-fill" d="${base}"/><path class="road-dash" d="${base}"/>`;
    for (let i = 0; i < N; i++) {
      if (state.completed.includes(i)) {
        const d = seg(PTS[i], PTS[i + 1]);
        svg += `<path class="road-done" d="${d}"/><path class="road-dash flow" d="${d}"/>`;
      }
    }
 
    // start ribbon
    const sy = NODES[0].y + 88;
    svg += `<rect class="start-ribbon" x="${NODES[0].x - 42}" y="${sy - 17}" width="84" height="26" rx="13"/>
            <text class="start-text" x="${NODES[0].x}" y="${sy + 1}">START</text>`;
 
    // nodes
    NODES.forEach((p, i) => {
      const lv = LEVELS[i];
      const isDone = state.completed.includes(i);
      const isCur = i === cur;
      const st = isDone ? 'done' : isCur ? 'current' : 'locked';
      const icon = isDone ? '✅' : isCur ? (lv.icon || '⭐') : '🔒';
      svg += `<g class="node ${st}" data-i="${i}" transform="translate(${p.x},${p.y})" tabindex="0" role="button"
                 aria-label="Node ${i + 1}: ${esc(lv.title)} (${st})">
        <ellipse class="nshadow" cx="0" cy="38" rx="30" ry="8"/>
        ${isCur ? '<circle class="pulse" r="34"/>' : ''}
        <g class="face">
          <circle class="ring" r="34"/>
          <path class="shine" d="M-22,-13 A27,27 0 0 1 8,-26"/>
          <text class="nicon" y="2">${icon}</text>
          <circle class="nbadge" cx="26" cy="-26" r="11.5"/>
          <text class="nnum" x="26" y="-25.5">${i + 1}</text>
        </g>
        <text class="nlabel" y="62">${esc(lv.title)}</text>
      </g>`;
    });
 
    // vault
    svg += `<g class="vault ${allDone ? 'ready' : 'locked'}" transform="translate(${VAULT.x},${VAULT.y})" tabindex="0" role="button"
               aria-label="Final vault (${allDone ? 'ready' : 'locked'})">
      <ellipse class="nshadow" cx="0" cy="44" rx="34" ry="9"/>
      ${allDone ? '<circle class="pulse gold" r="40"/>' : ''}
      <g class="face"><circle class="ring" r="40"/><text class="nicon big" y="3">${allDone ? '🔓' : '🔒'}</text></g>
      <text class="nlabel" y="70">FINAL VAULT</text>
    </g>`;
 
    // mascot (stands beside the current node)
    let mx, my;
    if (cur >= 0) { mx = NODES[cur].x + (NODES[cur].x < 200 ? -66 : 66); my = NODES[cur].y - 4; }
    else { mx = VAULT.x + 82; my = VAULT.y; }
    svg += `<g transform="translate(${mx},${my})" pointer-events="none"><g class="mbob">
      <clipPath id="mclip"><circle r="22"/></clipPath>
      <circle class="mring" r="25"/>
      <image class="mimg" href="${esc(CFG.mascotPath || '')}" x="-22" y="-22" width="44" height="44" clip-path="url(#mclip)" preserveAspectRatio="xMidYMid slice"/>
      <text class="mfallback" y="2" style="display:none">🦉</text>
    </g></g>`;
 
    svg += '</svg>';
 
    const stage = $('map-stage');
    stage.innerHTML = svg;
 
    // mascot image fallback
    const img = stage.querySelector('.mimg');
    const fb = stage.querySelector('.mfallback');
    if (img) img.addEventListener('error', () => { img.style.display = 'none'; if (fb) fb.style.display = 'block'; });
 
    // interactions
    stage.querySelectorAll('.node').forEach((g) => {
      const i = Number(g.dataset.i);
      const act = () => {
        if (g.classList.contains('locked')) { toast('🔒 Finish the previous node first!'); return; }
        if (g.classList.contains('done')) { toast('✅ Node already submitted.'); return; }
        snd('playButtonClick');
        openNode(i);
      };
      g.addEventListener('click', act);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
    const v = stage.querySelector('.vault');
    const vAct = () => {
      if (!allDone) { toast(`🔒 Complete all ${N} nodes to reach the vault!`); return; }
      snd('playVaultActivate');
      openVault();
    };
    v.addEventListener('click', vAct);
    v.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vAct(); } });
 
    // bring the active spot into view
    requestAnimationFrame(() => {
      const target = stage.querySelector('.node.current') || (allDone ? v : null);
      if (!target) return;
      const r = target.getBoundingClientRect();
      window.scrollTo({ top: Math.max(0, window.scrollY + r.top - window.innerHeight * 0.4), behavior: 'smooth' });
    });
  }
 
  function showMap() { show('map'); renderMap(); }
 
  // ══════════════════════════════════════════════════════════════════════════
  //  NODE (3 QUESTIONS — saved, NOT evaluated)
  // ══════════════════════════════════════════════════════════════════════════
  const qid = (i, q) => `${i}_${q}`;
 
  function openNode(i) {
    const lv = LEVELS[i];
    currentNode = i;
    snd('playLevelOpen');
 
    $('node-tag').textContent = `Node ${i + 1} of ${N}`;
    $('node-icon').textContent = lv.icon || '⭐';
    $('node-title').textContent = lv.title;
    $('node-desc').textContent = lv.description || '';
 
    const draft = state.drafts[i] || {};
    $('q-list').innerHTML = lv.questions.map((q, qi) => `
      <div class="q-card${draft[qi] ? ' answered' : ''}" data-q="${qi}">
        <span class="q-num-tag">Question ${qi + 1}</span>
        <div class="q-text">${esc(q.text)}</div>
        <div class="opts-list" role="radiogroup">
          ${q.options.map((o, oi) => `
            <button type="button" class="opt${draft[qi] === ABC[oi] ? ' sel' : ''}" data-k="${ABC[oi]}" role="radio"
                    aria-checked="${draft[qi] === ABC[oi]}">
              <span class="opt-key">${ABC[oi]}</span><span class="opt-text">${esc(o)}</span>
            </button>`).join('')}
        </div>
      </div>`).join('');
 
    $('q-list').querySelectorAll('.q-card').forEach((card) => {
      const qi = Number(card.dataset.q);
      card.querySelectorAll('.opt').forEach((btn) => {
        btn.addEventListener('click', () => {
          card.querySelectorAll('.opt').forEach((o) => { o.classList.remove('sel'); o.setAttribute('aria-checked', 'false'); });
          btn.classList.add('sel');
          btn.setAttribute('aria-checked', 'true');
          card.classList.add('answered');
          state.drafts[i] = state.drafts[i] || {};
          state.drafts[i][qi] = btn.dataset.k;
          save();
          snd('playAnswerSelect');
          updateNodeFooter();
        });
      });
    });
 
    updateNodeFooter();
    show('node');
  }
 
  function updateNodeFooter() {
    const lv = LEVELS[currentNode];
    const draft = state.drafts[currentNode] || {};
    const total = lv.questions.length;
    const n = lv.questions.filter((_, qi) => draft[qi]).length;
    $('node-answered').textContent = `${n} / ${total} answered`;
    $('node-dots').innerHTML = lv.questions.map((_, qi) => `<span class="dot${draft[qi] ? ' on' : ''}"></span>`).join('');
    const need = CFG.requireAllAnswered !== false;
    $('btn-submit-node').disabled = need ? n < total : false;
  }
 
  function submitNode() {
    const i = currentNode;
    if (i < 0 || state.completed.includes(i)) return;
    const lv = LEVELS[i];
    const draft = state.drafts[i] || {};
    const need = CFG.requireAllAnswered !== false;
    if (need && lv.questions.some((_, qi) => !draft[qi])) { toast('Answer all questions first.'); return; }
 
    // SAVE ONLY — no checking of right / wrong here
    lv.questions.forEach((_, qi) => { state.answers[qid(i, qi)] = draft[qi] || null; });
    delete state.drafts[i];
    state.completed.push(i);
    save();
    snd('playAnswerSubmit');
    showReveal(i);
  }
 
  // ══════════════════════════════════════════════════════════════════════════
  //  FULLSCREEN LETTER REVEAL
  // ══════════════════════════════════════════════════════════════════════════
  function spawnParticles() {
    const c = $('rv-particles');
    c.innerHTML = '';
    const cols = ['#f5c842', '#e07a2f', '#ffffff', '#6a9e7f', '#f39853', '#c0522b', '#8ebfa4'];
    for (let k = 0; k < 60; k++) {
      const p = document.createElement('div');
      const ang = Math.random() * Math.PI * 2;
      const dst = 80 + Math.random() * 260;
      const sz = 5 + Math.random() * 10;
      const del = Math.random() * 400;
      const dur = 800 + Math.random() * 800;
      p.style.cssText = `position:absolute;left:50%;top:45%;width:${sz}px;height:${sz}px;` +
        `background:${cols[Math.floor(Math.random() * cols.length)]};border-radius:${Math.random() > .5 ? '50%' : '3px'};` +
        `transform:translate(-50%,-50%) scale(1);opacity:1;` +
        `transition:transform ${dur}ms ease-out ${del}ms,opacity ${dur}ms ease-out ${del}ms;`;
      c.appendChild(p);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        p.style.transform = `translate(calc(-50% + ${Math.cos(ang) * dst}px), calc(-50% + ${Math.sin(ang) * dst}px)) scale(0)`;
        p.style.opacity = '0';
      }));
    }
  }
 
  function showReveal(i) {
    const letter = state.letters[i];
    const n = state.completed.length;
    $('rv-node').textContent = `Node ${i + 1} · ${LEVELS[i].title}`;
    $('rv-orb').textContent = letter;
    $('rv-count').textContent = `Letter ${n} of ${N} collected`;
    $('rv-note').innerHTML = n === 1
      ? '🧠 <b>Keep this letter in mind!</b><br>Remember it — you will need all your letters at the end.'
      : '✨ <b>Remember this letter too!</b>';
    spawnParticles();
    revealOpenedAt = Date.now();
    const ov = $('reveal');
    ov.classList.add('active');
    document.body.style.overflow = 'hidden';
    ov.focus({ preventScroll: true });
    snd('playLevelComplete');
    setTimeout(() => snd('playLetterReveal'), 350);
  }
 
  function closeReveal() {
    if (Date.now() - revealOpenedAt < 900) return; // accidental double-tap protection
    const ov = $('reveal');
    if (!ov.classList.contains('active')) return;
    ov.classList.remove('active');
    document.body.style.overflow = '';
    currentNode = -1;
    showMap();
    if (state.completed.length >= N) setTimeout(() => toast('🔓 The vault is ready — tap it!', 3800), 500);
  }
 
  // ══════════════════════════════════════════════════════════════════════════
  //  VAULT
  // ══════════════════════════════════════════════════════════════════════════
  function openVault() {
    if (state.completed.length < N) { toast('Finish all nodes first!'); return; }
    vaultBusy = false;
    $('toasts').innerHTML = '';
    $('vault-door').classList.remove('unlocked');
    $('vault-icon').textContent = '🔒';
    show('vault');
    renderVault();
  }
 
  function buildKeys() {
    $('vault-keys').innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => `<button type="button" class="key" data-c="${c}">${c}</button>`).join('');
    $('vault-keys').querySelectorAll('.key').forEach((b) => b.addEventListener('click', () => addLetter(b.dataset.c)));
  }
 
  function renderSlots() {
    const typed = state.typed || '';
    let h = '';
    for (let i = 0; i < WORD.length; i++) {
      const ch = typed[i];
      h += `<div class="vslot${ch ? ' filled' : ''}${i === typed.length ? ' next' : ''}"><span class="vslot-num">${i + 1}</span>${ch ? `<span class="vslot-let">${ch}</span>` : ''}</div>`;
    }
    $('vault-slots').innerHTML = h;
  }
 
  function renderVault() {
    renderSlots();
    setVaultMsg('', '');
    const wrap = $('vault-tray-wrap');
    if (CFG.showCollectedLettersInVault) {
      const letters = Object.values(state.letters).slice().sort(() => Math.random() - .5);
      $('vault-tray').innerHTML = letters.map((l) => `<button type="button" class="tray-tok" data-c="${l}">${l}</button>`).join('');
      $('vault-tray').querySelectorAll('.tray-tok').forEach((b) => b.addEventListener('click', () => addLetter(b.dataset.c)));
      wrap.style.display = 'block';
    } else {
      wrap.style.display = 'none';
    }
  }
 
  function setVaultMsg(cls, txt) {
    const m = $('vault-msg');
    m.className = 'vault-msg' + (cls ? ' ' + cls : '');
    m.textContent = txt;
  }
 
  function addLetter(ch) {
    if (state.finished || vaultBusy) return;
    if ((state.typed || '').length >= WORD.length) return;
    state.typed = (state.typed || '') + ch;
    save();
    renderSlots();
    setVaultMsg('', '');
    snd('playAnswerSelect');
  }
  function delLetter() {
    if (state.finished || vaultBusy) return;
    state.typed = (state.typed || '').slice(0, -1);
    save(); renderSlots(); setVaultMsg('', '');
  }
  function clearLetters() {
    if (state.finished || vaultBusy) return;
    state.typed = '';
    save(); renderSlots(); setVaultMsg('', '');
  }
 
  function unlockVault() {
    if (state.finished || vaultBusy) return;
    const typed = state.typed || '';
    if (typed.length < WORD.length) { setVaultMsg('info', `Fill all ${WORD.length} slots first.`); return; }
 
    if (typed === WORD) {
      vaultBusy = true;
      state.finished = true;
      state.endTime = Date.now();
      save();
      stopTimer(); tick();
      $('vault-door').classList.add('unlocked');
      $('vault-icon').textContent = '🔓';
      setVaultMsg('info', '🎉 Vault unlocked!');
      snd('playVaultUnlock');
      confetti();
      setTimeout(() => showResult(true), 2300);
    } else {
      state.vaultAttempts++;
      save();
      setVaultMsg('err', '❌ Not the right word. Rearrange your letters and try again!');
      snd('playIncorrect');
      const s = $('vault-slots');
      s.classList.remove('shake'); void s.offsetWidth; s.classList.add('shake');
    }
  }
 
  // ══════════════════════════════════════════════════════════════════════════
  //  RESULT — evaluation happens ONLY here
  // ══════════════════════════════════════════════════════════════════════════
  function evaluate() {
    let correct = 0, wrong = 0;
    LEVELS.forEach((lv, i) => lv.questions.forEach((q, qi) => {
      const a = state.answers[qid(i, qi)];
      if (!a) return;                       // skipped = 0 marks
      if (a === q.answer) correct++; else wrong++;
    }));
    const mc = CFG.marksCorrect ?? 4, mw = CFG.marksWrong ?? -1;
    return { correct, wrong, total: TOTAL_Q, score: correct * mc + wrong * mw, max: TOTAL_Q * mc };
  }
 
  function countUp(el, to, max) {
    const t0 = performance.now(), dur = 1000;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = `${Math.round(to * (1 - Math.pow(1 - k, 3)))} / ${max}`;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
 
  function showResult(animate) {
    show('result');
    const { score, max } = evaluate();
    const elapsed = Math.max(0, Math.floor(((state.endTime || Date.now()) - state.startTime) / 1000));
    $('res-team-name').textContent = state.teamName;
    $('res-time').textContent = fmt(elapsed);
    $('res-word').textContent = WORD;
    $('btn-review').style.display = CFG.showReview === false ? 'none' : '';
 
    const reveal = () => {
      $('res-eval').style.display = 'none';
      $('res-body').style.display = 'flex';
      $('res-score').textContent = `0 / ${max}`;
      countUp($('res-score'), score, max);
      if (animate) { confetti(); snd('playLevelComplete'); }
    };
    if (animate) {
      $('res-eval').style.display = 'flex';
      $('res-body').style.display = 'none';
      setTimeout(reveal, 2400);
    } else {
      reveal();
    }
  }
 
  function renderReview() {
    const { correct, wrong, score, max } = evaluate();
    $('review-team-name').textContent = `Team: ${state.teamName}`;
    $('review-badge').textContent = `${score} / ${max} marks · ✅ ${correct} · ❌ ${wrong}`;
    let h = '';
    LEVELS.forEach((lv, i) => {
      h += `<div class="rvw-level-title">${lv.icon || ''} Node ${i + 1} · ${esc(lv.title)}</div>`;
      lv.questions.forEach((q, qi) => {
        const mine = state.answers[qid(i, qi)];
        const ok = mine === q.answer;
        const cls = !mine ? 'skipped' : ok ? 'correct' : 'incorrect';
        const lbl = !mine ? 'Skipped' : ok ? '✅ Correct' : '❌ Incorrect';
        const mineTxt = mine ? `${mine}. ${esc(q.options[ABC.indexOf(mine)] || '')}` : 'Not answered';
        const rightTxt = `${q.answer}. ${esc(q.options[ABC.indexOf(q.answer)] || '')}`;
        h += `<div class="rvw-q ${cls}">
          <div class="rvw-q-top"><span class="q-num-tag">Q${qi + 1}</span><span class="rvw-result ${cls}">${lbl}</span></div>
          <div class="rvw-q-text">${esc(q.text)}</div>
          <div class="rvw-ans"><span class="rvw-yours">You: ${mineTxt}</span><span class="rvw-correct">Correct: ${rightTxt}</span></div>
        </div>`;
      });
    });
    $('review-list').innerHTML = h;
  }
 
  // ══════════════════════════════════════════════════════════════════════════
  //  START / BOOT
  // ══════════════════════════════════════════════════════════════════════════
  function configProblem() {
    if (!N) return 'No questions found in questions.js';
    if (WORD.length !== N) return `Config error: secretWord "${WORD}" has ${WORD.length} letters but there are ${N} nodes. They must match.`;
    return '';
  }
 
  function startGame() {
    if (configProblem()) return;
    const teamName = $('team-name').value.trim();
    if (!teamName) {
      $('team-name-error').textContent = 'Please enter your team name to continue.';
      $('team-name').focus();
      return;
    }
    $('team-name-error').textContent = '';
    state = blank();
    state.teamName = teamName;
    state.started = true;
    state.startTime = Date.now();
    state.letters = makeLetterMap();
    save();
    try { localStorage.setItem(TEAM_KEY, teamName); } catch (error) { console.error('Unable to save team name.', error); }
    updateTeamName(teamName);
    snd('playStartMission');
    startTimer();
    showMap();
  }
 
  function organizerReset() {
    const pass = prompt('Organizer passcode:');
    if (pass === null) return;
    if (pass !== (CFG.organizerPasscode || 'TECHNOVA2026')) { alert('Wrong passcode.'); return; }
    if (confirm('Reset this device and start from scratch?')) {
      try { localStorage.removeItem(KEY); } catch (e) {}
      try { localStorage.removeItem(TEAM_KEY); } catch (error) { console.error('Unable to clear saved team name.', error); }
      location.reload();
    }
  }
 
  function bind() {
    $('btn-start').addEventListener('click', startGame);
    $('team-name').addEventListener('input', () => {
      const name = $('team-name').value.trim();
      $('team-name-error').textContent = '';
      updateTeamName(name);
    });
    $('btn-sound').addEventListener('click', () => {
      try { const on = window.soundManager?.toggleSound(); $('btn-sound').classList.toggle('muted', !on); } catch (e) {}
    });
 
    $('node-back').addEventListener('click', () => { currentNode = -1; showMap(); });
    $('btn-submit-node').addEventListener('click', submitNode);
 
    const rv = $('reveal');
    rv.addEventListener('click', closeReveal);
 
    $('btn-vault-back').addEventListener('click', showMap);
    $('btn-vault-del').addEventListener('click', delLetter);
    $('btn-vault-clear').addEventListener('click', clearLetters);
    $('btn-vault-unlock').addEventListener('click', unlockVault);
 
    $('btn-review').addEventListener('click', () => { renderReview(); show('review'); });
    $('btn-review-back').addEventListener('click', () => show('result'));
 
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key && e.key.toLowerCase() === 'o') { e.preventDefault(); organizerReset(); return; }
      if ($('reveal').classList.contains('active')) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); closeReveal(); }
        return;
      }
      if ($('screen-vault').classList.contains('active') && state && !state.finished && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (/^[a-zA-Z]$/.test(e.key)) { addLetter(e.key.toUpperCase()); }
        else if (e.key === 'Backspace') { e.preventDefault(); delLetter(); }
        else if (e.key === 'Enter') { e.preventDefault(); unlockVault(); }
      }
    });
  }
 
  function boot() {
    state = blank();
    try { localStorage.removeItem(KEY); } catch (e) {}
    let savedTeamName = '';
    try { savedTeamName = localStorage.getItem(TEAM_KEY) || ''; } catch (error) { console.error('Unable to load saved team name.', error); }
    $('team-name').value = savedTeamName;
    updateTeamName(savedTeamName);
    bind();
    buildKeys();
 
    const problem = configProblem();
    if (problem) {
      $('cfg-warn').textContent = problem;
      $('cfg-warn').classList.add('show');
      $('btn-start').disabled = true;
    }
 
    if (state.started && !problem) {
      startTimer();
      if (state.finished) showResult(false);
      else showMap();
    } else {
      show('entry');
    }
  }
 
  boot();
})();
