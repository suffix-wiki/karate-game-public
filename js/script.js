/* ==========================================================================
   STATE & INITIALIZATION
   ========================================================================== */

let gameState = {
  char: { name: "押忍たろう", gender: "男", age: 15, avatar: "🥋" },
  baseStats: null,
  companions: [],
  stats: { lv: 1, exp: 0, gold: 500, dojoCount: 0, selfCount: 0, dojoStreak: 0, bestDojoStreak: 0, lastDojoDate: "", lastSelfDate: "", lastDojoWeek: "", lastSelfMonth: "", lastGachaDate: "" },
  inventory: { items: {}, equips: [] },
  equipped: { "頭": null, "体": null, "武器": null, "装飾": null },
  favoriteSkills: [],
  story: { seen: [], completed: false },
  progress: { clearedEnemies: [], enemyWins: {}, claimedMissions: [], notifiedMissions: [] },
  adminOverrides: { unlimitedUses: false, unlockAllStages: false },
  settings: { bgmVol: 0.2, seVol: 0.3 }
};

let currentBattle = null;
let currentBgmStyle = null;
let desiredBgmStyle = null;

function getEquipMaxLevel(rarity, combineCount = 0) {
  const baseLevels = { N: 10, R: 15, SR: 20, SSR: 25, UR: 30 };
  return (baseLevels[rarity] || baseLevels.N) + Math.max(0, Number(combineCount) || 0) * 5;
}

function normalizeEquipMaxLevels() {
  const equips = [
    ...gameState.inventory.equips,
    ...Object.values(gameState.equipped),
    ...gameState.companions.flatMap(companion => Object.values(companion.equipped || {}))
  ];

  equips.forEach(equip => {
    if (!equip) return;
    equip.combineCount = Math.max(0, Number(equip.combineCount) || 0);
    equip.maxLv = Math.max(
      Number(equip.maxLv) || 0,
      getEquipMaxLevel(equip.rarity, equip.combineCount),
      Number(equip.lv) || 1
    );
  });
}

function saveGame() {
  localStorage.setItem("karate_rpg_state_v5", JSON.stringify(gameState));
  updateHeaderGold();
}

function loadGame() {
  const data = localStorage.getItem("karate_rpg_state_v5");
  if (data) {
    try { 
      gameState = JSON.parse(data);
      if(!gameState.favoriteSkills) gameState.favoriteSkills = [];
      if (!gameState.story || typeof gameState.story !== "object") {
        gameState.story = { seen: [], completed: false };
      }
      if (!Array.isArray(gameState.story.seen)) gameState.story.seen = [];
      if (typeof gameState.story.completed !== "boolean") gameState.story.completed = false;
      if (!gameState.progress || typeof gameState.progress !== "object") {
        gameState.progress = { clearedEnemies: [], enemyWins: {}, claimedMissions: [], notifiedMissions: [] };
      }
      if (!Array.isArray(gameState.progress.clearedEnemies)) gameState.progress.clearedEnemies = [];
      if (!gameState.progress.enemyWins || typeof gameState.progress.enemyWins !== "object") gameState.progress.enemyWins = {};
      if (!Array.isArray(gameState.progress.claimedMissions)) gameState.progress.claimedMissions = [];
      if (!Array.isArray(gameState.progress.notifiedMissions)) gameState.progress.notifiedMissions = [];
      if (!gameState.stats || typeof gameState.stats !== "object") gameState.stats = {};
      gameState.stats.dojoStreak = Math.max(0, Number(gameState.stats.dojoStreak) || 0);
      gameState.stats.bestDojoStreak = Math.max(0, Number(gameState.stats.bestDojoStreak) || 0);
      if (!gameState.adminOverrides || typeof gameState.adminOverrides !== "object") {
        gameState.adminOverrides = { unlimitedUses: false, unlockAllStages: false };
      }
      if (typeof gameState.adminOverrides.unlimitedUses !== "boolean") {
        gameState.adminOverrides.unlimitedUses = false;
      }
      if (typeof gameState.adminOverrides.unlockAllStages !== "boolean") {
        gameState.adminOverrides.unlockAllStages = false;
      }
      if (typeof gameState.adminOverrides.guaranteedGachaEquipId !== "string") {
        gameState.adminOverrides.guaranteedGachaEquipId = "";
      }
      if (!gameState.stats.lastDojoWeek && gameState.stats.lastDojoDate) {
        const lastDojoDate = parseStoredDate(gameState.stats.lastDojoDate);
        if (lastDojoDate) gameState.stats.lastDojoWeek = getWeekStringForDate(lastDojoDate);
      }
      if (!gameState.stats.lastSelfMonth && gameState.stats.lastSelfDate) {
        const lastSelfDate = parseStoredDate(gameState.stats.lastSelfDate);
        if (lastSelfDate) gameState.stats.lastSelfMonth = getMonthStringForDate(lastSelfDate);
      }
    } catch (e) { console.error(e); }
  } else {
    addEquipToInventory("e_b1");
    addEquipToInventory("e_w2");
  }
  normalizeEquipMaxLevels();
  checkCompanionUnlock(false);
  updateHeaderGold();
}

function updateHeaderGold() {
  const els = document.querySelectorAll("#header-gold-val, .val-gold");
  els.forEach(el => el.innerText = formatGold(gameState.stats.gold));
}

function formatGold(amount) {
  return Math.floor(Number(amount) || 0).toLocaleString("ja-JP");
}

function getQuantityInputValue(input, min, max) {
  const rawValue = input?.value.trim();
  if (!rawValue || !/^\d+$/.test(rawValue)) return null;
  const value = Number(rawValue);
  if (!Number.isSafeInteger(value)) return null;
  return Math.min(max, Math.max(min, value));
}

function normalizeQuantityInput(input, min, max) {
  const value = getQuantityInputValue(input, min, max) ?? min;
  if (input) input.value = String(value);
  return value;
}

function checkCompanionUnlock(notify = true) {
  let added = false;
  COMPANIONS_MASTER.forEach(m => {
    if (gameState.stats.lv >= m.reqLv) {
      const exists = gameState.companions.some(c => c.id === m.id);
      if (!exists) {
        gameState.companions.push({
          id: m.id,
          name: m.defaultName,
          gender: m.gender,
          age: m.age,
          avatar: m.avatar,
          equipped: { "頭": null, "体": null, "武器": null, "装飾": null }
        });
        added = true;
        if (notify) {
          showToast(`🎉 仲間「${m.defaultName}」が加わりました！`);
        }
      }
    }
  });
  if (added) saveGame();
}

function addEquipToInventory(equipMasterId) {
  const master = SHOP_EQUIPS.find(e => e.id === equipMasterId);
  if (!master) return;
  const newInst = {
    instId: "eq_" + Date.now() + "_" + Math.floor(Math.random()*100000),
    masterId: master.id,
    name: master.name,
    slot: master.slot,
    icon: master.icon,
    rarity: master.rarity,
    price: master.price,
    hp: master.hp,
    def: master.def,
    atk: master.atk,
    spd: master.spd,
    lv: 1,
    maxLv: getEquipMaxLevel(master.rarity),
    combineCount: 0
  };
  gameState.inventory.equips.push(newInst);
  return newInst;
}

function getEquipProgressMarkup(equip) {
  const rarity = equip.rarity || "N";
  const combineCount = Math.max(0, Math.min(5, Number(equip.combineCount) || 0));
  const stars = `<span class="equip-combine-stars" aria-label="合成${combineCount}回">${"★".repeat(combineCount)}${"☆".repeat(5 - combineCount)}</span>`;
  return `<span class="equip-progress-badge rarity-${rarity}">[${rarity}]</span> ${stars}`;
}

function getEquipFilterMarkup(prefix, selectedSlot, selectedRarity, handler) {
  const slots = ["all", "頭", "体", "武器", "装飾"];
  const rarities = ["all", "N", "R", "SR", "SSR", "UR"];
  const slotLabels = { all: "全部位", "頭": "頭", "体": "体", "武器": "武器", "装飾": "装飾" };
  const rarityLabels = { all: "全レア度", N: "N", R: "R", SR: "SR", SSR: "SSR", UR: "UR" };

  return `
    <div class="equip-filter-row">
      <label><span class="filter-label">部位</span><select id="${prefix}-slot" aria-label="部位で絞り込み" onchange="${handler}()">
        ${slots.map(slot => `<option value="${slot}" ${slot === selectedSlot ? "selected" : ""}>${slotLabels[slot]}</option>`).join("")}
      </select></label>
      <label><span class="filter-label">レア度</span><select id="${prefix}-rarity" aria-label="レア度で絞り込み" onchange="${handler}()">
        ${rarities.map(rarity => `<option value="${rarity}" ${rarity === selectedRarity ? "selected" : ""}>${rarityLabels[rarity]}</option>`).join("")}
      </select></label>
    </div>
  `;
}

/* ==========================================================================
   AUDIO SYNTHESIZER
   ========================================================================== */

let audioCtx = null;
let bgmInterval = null;
let bgmAudio = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSE(type) {
  initAudio();
  if (gameState.settings.bgmVol <= 0 && gameState.settings.seVol <= 0) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(gameState.settings.seVol, now);

  if (type === 'attack') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc.start(now); osc.stop(now + 0.15);
  } else if (type === 'damage') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);
    gain.gain.setValueAtTime(gameState.settings.seVol * 1.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
  } else if (type === 'special') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.1);
    osc.frequency.linearRampToValueAtTime(200, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
  } else if (type === 'heal') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.start(now); osc.stop(now + 0.25);
  } else if (type === 'win') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.setValueAtTime(659, now + 0.1);
    osc.frequency.setValueAtTime(783, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now); osc.stop(now + 0.4);
  }
}

function playGachaRaritySE(rarity) {
  initAudio();
  if (gameState.settings.seVol <= 0) return;

  const now = audioCtx.currentTime;
  const isUltraRare = rarity === "UR";
  const notes = isUltraRare
    ? [440, 554.37, 659.25, 880, 1108.73]
    : [523.25, 659.25, 783.99, 1046.5];
  const spacing = isUltraRare ? 1 : 0.75;
  const duration = isUltraRare ? 2.1 : 1.25;
  const volume = gameState.settings.seVol * (isUltraRare ? 0.72 : 0.58);

  notes.forEach((frequency, index) => {
    const start = now + index * spacing;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    oscillator.type = isUltraRare ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(volume / (1 + index * 0.12), start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(audioCtx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  });

  if (isUltraRare) {
    const now = audioCtx.currentTime;
    [659.25, 830.61, 987.77].forEach(frequency => {
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + 2.1);
      gain.gain.setValueAtTime(0.0001, now + 2.1);
      gain.gain.linearRampToValueAtTime(volume * 0.32, now + 2.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 6.4);
      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start(now + 2.1);
      oscillator.stop(now + 6.4);
    });
  }
}

function startBGM(style) {
  initAudio();
  desiredBgmStyle = style;
  if (currentBgmStyle === style && (bgmInterval || bgmAudio)) return;
  stopBGM();
  currentBgmStyle = style;
  if (gameState.settings.bgmVol <= 0) return;

  const synthStyle = style.startsWith("synth:")
    ? style.slice("synth:".length)
    : style;
  const isRemoteAudioUrl = /^(https?:)?\/\//i.test(style);
  const isAudioFilePath = /\.(mp3|ogg|wav|m4a)(\?|$)/i.test(style);
  if (isRemoteAudioUrl || isAudioFilePath) {
    bgmAudio = new Audio(style);
    const audio = bgmAudio;
    bgmAudio.loop = true;
    bgmAudio.preload = "auto";
    bgmAudio.volume = Math.max(0, Math.min(1, gameState.settings.bgmVol));
    bgmAudio.addEventListener("error", event => {
      console.error(`BGMの読み込みに失敗しました: ${style}`, event);
    }, { once: true });
    const playback = bgmAudio.play();
    if (playback?.catch) {
      playback.catch(error => {
        console.error(`BGMを再生できません: ${style}`, error);
        if (bgmAudio !== audio) return;
        audio.pause();
        bgmAudio = null;
        currentBgmStyle = null;
        const resumeAfterInteraction = () => {
          document.removeEventListener("pointerdown", resumeAfterInteraction);
          document.removeEventListener("keydown", resumeAfterInteraction);
          if (desiredBgmStyle && !bgmAudio && gameState.settings.bgmVol > 0) {
            startBGM(desiredBgmStyle);
          }
        };
        document.addEventListener("pointerdown", resumeAfterInteraction, { once: true });
        document.addEventListener("keydown", resumeAfterInteraction, { once: true });
      });
    }
    return;
  }

  let notes = [261.63, 293.66, 329.63, 392.00, 440.00];
  let speed = 400;

  if (synthStyle === 'intense') {
    notes = [
      220.00, 246.94, 261.63, 293.66, 220.00, 261.63, 293.66, 329.63,
      349.23, 329.63, 293.66, 261.63, 246.94, 220.00, 196.00, 220.00
    ];
    speed = 170;
  } else if (synthStyle === 'epic') {
    notes = [
      220.00, 261.63, 293.66, 329.63, 220.00, 261.63, 293.66, 349.23,
      329.63, 293.66, 261.63, 220.00, 196.00, 220.00, 246.94, 261.63,
      293.66, 349.23, 392.00, 440.00, 349.23, 392.00, 440.00, 523.25,
      493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 329.63, 392.00
    ];
    speed = 130;
  } else if (synthStyle === 'ending') {
    notes = [
      261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 349.23,
      392.00, 523.25, 493.88, 440.00, 392.00, 349.23, 329.63, 261.63
    ];
    speed = 320;
  }

  let idx = 0;
  bgmInterval = setInterval(() => {
    if (gameState.settings.bgmVol <= 0) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = synthStyle === 'mild' || synthStyle === 'ending' ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(notes[idx % notes.length], now);
    
    let volMul = (synthStyle === 'epic' && idx % notes.length >= 16) ? 0.22 : synthStyle === 'ending' ? 0.18 : 0.15;
    gain.gain.setValueAtTime(gameState.settings.bgmVol * volMul, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (speed / 1000) * 0.9);

    osc.start(now);
    osc.stop(now + (speed / 1000) * 0.9);
    idx++;
  }, speed);
}

function stopBGM() {
  if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; }
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio.currentTime = 0;
    bgmAudio = null;
  }
  currentBgmStyle = null;
}

function updateVolume() {
  gameState.settings.bgmVol = parseFloat(document.getElementById("volume-bgm").value);
  gameState.settings.seVol = parseFloat(document.getElementById("volume-se").value);
  saveGame();
  if (gameState.settings.bgmVol <= 0) stopBGM();
  else if (bgmAudio) bgmAudio.volume = Math.max(0, Math.min(1, gameState.settings.bgmVol));
  else if (desiredBgmStyle && !bgmInterval) startBGM(desiredBgmStyle);
}

/* ==========================================================================
   HELPERS & STATS
   ========================================================================== */

function getTitle(lv) {
  if (lv >= 99) return TITLES[13];
  if (lv >= 90) return TITLES[12];
  if (lv >= 80) return TITLES[11];
  if (lv >= 70) return TITLES[10];
  if (lv >= 60) return TITLES[9];
  if (lv >= 50) return TITLES[8];
  if (lv >= 40) return TITLES[7];
  if (lv >= 25) return TITLES[6];
  if (lv >= 20) return TITLES[5];
  if (lv >= 15) return TITLES[4];
  if (lv >= 12) return TITLES[3];
  if (lv >= 8) return TITLES[2];
  if (lv >= 4) return TITLES[1];
  return TITLES[0];
}

function getNextExp(lv) {
  const level = Math.max(1, Math.floor(lv));
  return Math.floor(level * 40 + 0.75 * level * (level - 1));
}

function getMemberStats(compTarget = null) {
  const lv = gameState.stats.lv;
  let baseHp = gameState.baseStats?.hp ?? 100 + (lv - 1) * 60;
  let baseMp = gameState.baseStats?.mp ?? 30 + (lv - 1) * 8;
  let baseAtk = gameState.baseStats?.atk ?? 15 + (lv - 1) * 30;
  let baseDef = gameState.baseStats?.def ?? 10 + (lv - 1) * 20;
  let baseSpd = gameState.baseStats?.spd ?? 10 + (lv - 1) * 6;

  let equippedObj = gameState.equipped;

  if (compTarget) {
    const m = COMPANIONS_MASTER.find(x => x.id === compTarget.id);
    if (m) {
      baseHp = Math.floor(baseHp * m.hpMul);
      baseAtk = Math.floor(baseAtk * m.atkMul);
      baseDef = Math.floor(baseDef * m.defMul);
      baseSpd = Math.floor(baseSpd * m.spdMul);
    }
    equippedObj = compTarget.equipped || {};
  }

  let equipBonus = { hp: 0, atk: 0, def: 0, spd: 0 };
  Object.values(equippedObj).forEach(eq => {
    if (eq) {
      equipBonus.hp += eq.hp + (eq.lv - 1) * 5;
      equipBonus.atk += eq.atk + (eq.lv - 1) * 3;
      equipBonus.def += eq.def + (eq.lv - 1) * 2;
      equipBonus.spd += eq.spd + (eq.lv - 1) * 2;
    }
  });

  return {
    maxHp: baseHp + equipBonus.hp,
    maxMp: baseMp,
    atk: baseAtk + equipBonus.atk,
    def: baseDef + equipBonus.def,
    spd: baseSpd + equipBonus.spd,
    equipBonus
  };
}

function showToast(msg) {
  const container = document.getElementById("toast-container");
  const t = document.createElement("div");
  t.className = "toast";
  t.innerText = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

function closeModal() {
  document.getElementById("modal-overlay").classList.remove("active");
}

function openModal(html) {
  const box = document.getElementById("modal-box");
  box.innerHTML = html;
  document.getElementById("modal-overlay").classList.add("active");
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function parseStoredDate(value) {
  const parts = String(value).split("-").map(Number);
  if (parts.length !== 3 || parts.some(part => !Number.isFinite(part))) return null;
  const [year, month, day] = parts;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(year, month - 1, day);
}

function getWeekStringForDate(date) {
  const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
  return `${weekStart.getFullYear()}-${weekStart.getMonth() + 1}-${weekStart.getDate()}`;
}

function getCurrentWeekString() {
  return getWeekStringForDate(new Date());
}

function getMonthStringForDate(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}`;
}

function getCurrentMonthString() {
  return getMonthStringForDate(new Date());
}

function requestAdminAccess() {
  if (localStorage.getItem("karate_admin_authenticated") === "true") {
    openAdminScreen();
    return;
  }

  openModal(`
    <div class="card-title">🔒 管理画面認証</div>
    <p style="font-size:0.8rem; margin:6px 0;">合言葉（パスワード）を入力してください。</p>
    <input type="text" id="admin-pass-input" class="password-style" placeholder="パスワードを入力">
    <div style="display:flex; gap:8px; margin-top:10px;">
      <button class="btn btn-gold" style="flex:1;" onclick="checkAdminPassword()">認証</button>
      <button class="btn btn-red" style="flex:1;" onclick="closeModal()">キャンセル</button>
    </div>
  `);
}

function checkAdminPassword() {
  const input = document.getElementById("admin-pass-input")?.value;
  if (input === "師範代LOVE") {
    localStorage.setItem("karate_admin_authenticated", "true");
    openAdminScreen();
  } else {
    showToast("パスワードが違います");
  }
}

function openAdminScreen() {
  closeModal();
  openScreen("screen-admin");
  renderAdminUI();
}

function getEquipmentWarningReasons(equip) {
  const reasons = [];
  if (["SR", "SSR", "UR"].includes(equip.rarity)) reasons.push(`${equip.rarity}レア装備`);
  if ((Number(equip.combineCount) || 0) >= 2) reasons.push(`合成${equip.combineCount}回`);
  return reasons;
}

function renderAdminUI() {
  const baseStats = gameState.baseStats || {
    hp: 100 + (gameState.stats.lv - 1) * 60,
    mp: 30 + (gameState.stats.lv - 1) * 8,
    atk: 15 + (gameState.stats.lv - 1) * 30,
    def: 10 + (gameState.stats.lv - 1) * 20,
    spd: 10 + (gameState.stats.lv - 1) * 6
  };
  document.getElementById("adm-lv").value = gameState.stats.lv;
  document.getElementById("adm-gold").value = gameState.stats.gold;
  document.getElementById("adm-exp").value = gameState.stats.exp;
  document.getElementById("adm-dojo-count").value = gameState.stats.dojoCount;
  document.getElementById("adm-self-count").value = gameState.stats.selfCount;
  Object.entries(baseStats).forEach(([stat, value]) => {
    const input = document.getElementById(`adm-stat-${stat}`);
    if (input) input.value = value;
  });
  document.getElementById("adm-unlimited-toggle").innerText = gameState.adminOverrides.unlimitedUses
    ? "稽古・ガチャの無制限使用：有効（クリックで解除）"
    : "稽古・ガチャを無制限使用にする";
  document.getElementById("adm-stage-unlock-toggle").innerText = gameState.adminOverrides.unlockAllStages
    ? "全ステージ開放：有効（クリックで解除）"
    : "全ステージを開放する";
  const gachaEquipSelect = document.getElementById("adm-gacha-equip");
  gachaEquipSelect.innerHTML = `
    <option value="">指定なし（通常抽選）</option>
    ${SHOP_EQUIPS.map(equip => {
      const rarity = equip.rarity || "N";
      return `<option value="${equip.id}">[${rarity}] ${equip.icon} ${equip.name}</option>`;
    }).join("")}
  `;
  gachaEquipSelect.value = gameState.adminOverrides.guaranteedGachaEquipId || "";
}

function saveAdminStats() {
  const newLv = Math.min(99, Math.max(1, parseInt(document.getElementById("adm-lv").value) || 1));
  const newGold = Math.max(0, parseInt(document.getElementById("adm-gold").value) || 0);
  const newExp = Math.max(0, parseInt(document.getElementById("adm-exp").value) || 0);
  const readNonNegative = id => Math.max(0, parseInt(document.getElementById(id).value, 10) || 0);

  gameState.stats.lv = newLv;
  gameState.stats.gold = newGold;
  gameState.stats.exp = newExp;
  gameState.stats.dojoCount = readNonNegative("adm-dojo-count");
  gameState.stats.selfCount = readNonNegative("adm-self-count");
  gameState.baseStats = {
    hp: readNonNegative("adm-stat-hp"),
    mp: readNonNegative("adm-stat-mp"),
    atk: readNonNegative("adm-stat-atk"),
    def: readNonNegative("adm-stat-def"),
    spd: readNonNegative("adm-stat-spd")
  };

  checkCompanionUnlock(true);
  saveGame();
  showToast("管理者設定を保存しました");
}

function resetDailyLimits() {
  gameState.stats.lastDojoDate = "";
  gameState.stats.lastSelfDate = "";
  gameState.stats.lastDojoWeek = "";
  gameState.stats.lastSelfMonth = "";
  gameState.stats.lastGachaDate = "";
  saveGame();
  showToast("稽古・ガチャの利用制限をリセットしました");
}

function toggleUnlimitedUses() {
  gameState.adminOverrides.unlimitedUses = !gameState.adminOverrides.unlimitedUses;
  saveGame();
  renderAdminUI();
  updateHomeUI();
  showToast(gameState.adminOverrides.unlimitedUses
    ? "道場稽古・自主稽古・ガチャを無制限にしました"
    : "道場稽古・自主稽古・ガチャの利用制限を有効にしました");
}

function toggleAllStagesUnlocked() {
  gameState.adminOverrides.unlockAllStages = !gameState.adminOverrides.unlockAllStages;
  saveGame();
  renderAdminUI();
  renderStagesUI();
  showToast(gameState.adminOverrides.unlockAllStages
    ? "全ステージを開放しました"
    : "ステージの順次解放を有効にしました");
}

function setGuaranteedGachaEquip() {
  const selectedId = document.getElementById("adm-gacha-equip").value;
  if (selectedId && !SHOP_EQUIPS.some(equip => equip.id === selectedId)) {
    showToast("選択したガチャアイテムが見つかりません");
    return;
  }

  gameState.adminOverrides.guaranteedGachaEquipId = selectedId;
  saveGame();
  showToast(selectedId
    ? "指定アイテムを次回のガチャに設定しました"
    : "ガチャの指定アイテムを解除しました");
}

function resetAllData() {
  if (confirm("本当に全てのデータを初期化しますか？")) {
    localStorage.removeItem("karate_rpg_state_v5");
    localStorage.removeItem("karate_admin_authenticated");
    location.reload();
  }
}

/* お気に入り切り替え機能 */
function toggleFavoriteSkill(skillId) {
  if (!gameState.favoriteSkills) gameState.favoriteSkills = [];
  const idx = gameState.favoriteSkills.indexOf(skillId);
  if (idx >= 0) {
    gameState.favoriteSkills.splice(idx, 1);
  } else {
    gameState.favoriteSkills.push(skillId);
  }
  saveGame();
  if (document.getElementById("screen-status").classList.contains("active")) {
    updateStatusUI();
  }
}

let currentSkillFilter = 'all';
function setSkillFilter(filter) {
  currentSkillFilter = filter;
  ['all', 'attack', 'defend', 'heal', 'fav'].forEach(f => {
    const el = document.getElementById(`skill-filter-${f}`);
    if (el) {
      if (f === filter) el.classList.add('active');
      else el.classList.remove('active');
    }
  });
  updateStatusUI();
}
