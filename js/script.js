/* ==========================================================================
   STATE & INITIALIZATION
   ========================================================================== */

let gameState = {
  char: { name: "押忍たろう", gender: "男", age: 15, avatar: "🥋" },
  companions: [],
  stats: { lv: 1, exp: 0, gold: 500, dojoCount: 0, selfCount: 0, lastDojoDate: "", lastSelfDate: "", lastGachaDate: "" },
  inventory: { items: {}, equips: [] },
  equipped: { "頭": null, "体": null, "武器": null, "装飾": null },
  favoriteSkills: [],
  settings: { bgmVol: 0.2, seVol: 0.3 }
};

let currentBattle = null;
let currentBgmStyle = null;

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
    } catch (e) { console.error(e); }
  } else {
    addEquipToInventory("e_b1");
    addEquipToInventory("e_w2");
  }
  checkCompanionUnlock(false);
  updateHeaderGold();
}

function updateHeaderGold() {
  const els = document.querySelectorAll("#header-gold-val, .val-gold");
  els.forEach(el => el.innerText = gameState.stats.gold);
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
    maxLv: 10,
    combineCount: 0
  };
  gameState.inventory.equips.push(newInst);
  return newInst;
}

/* ==========================================================================
   AUDIO SYNTHESIZER
   ========================================================================== */

let audioCtx = null;
let bgmInterval = null;

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

function startBGM(style) {
  initAudio();
  if (currentBgmStyle === style && bgmInterval) return;
  stopBGM();
  currentBgmStyle = style;
  if (gameState.settings.bgmVol <= 0) return;

  let notes = [261.63, 293.66, 329.63, 392.00, 440.00];
  let speed = 400;

  if (style === 'intense') {
    notes = [
      220.00, 246.94, 261.63, 293.66, 220.00, 261.63, 293.66, 329.63,
      349.23, 329.63, 293.66, 261.63, 246.94, 220.00, 196.00, 220.00
    ];
    speed = 170;
  } else if (style === 'epic') {
    notes = [
      220.00, 261.63, 293.66, 329.63, 220.00, 261.63, 293.66, 349.23,
      329.63, 293.66, 261.63, 220.00, 196.00, 220.00, 246.94, 261.63,
      293.66, 349.23, 392.00, 440.00, 349.23, 392.00, 440.00, 523.25,
      493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 329.63, 392.00
    ];
    speed = 130;
  }

  let idx = 0;
  bgmInterval = setInterval(() => {
    if (gameState.settings.bgmVol <= 0) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.type = style === 'mild' ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(notes[idx % notes.length], now);
    
    let volMul = (style === 'epic' && idx % notes.length >= 16) ? 0.22 : 0.15;
    gain.gain.setValueAtTime(gameState.settings.bgmVol * volMul, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (speed / 1000) * 0.9);

    osc.start(now);
    osc.stop(now + (speed / 1000) * 0.9);
    idx++;
  }, speed);
}

function stopBGM() {
  if (bgmInterval) { clearInterval(bgmInterval); bgmInterval = null; }
  currentBgmStyle = null;
}

function updateVolume() {
  gameState.settings.bgmVol = parseFloat(document.getElementById("volume-bgm").value);
  gameState.settings.seVol = parseFloat(document.getElementById("volume-se").value);
  saveGame();
  if (gameState.settings.bgmVol <= 0) stopBGM();
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

function getNextExp(lv) { return Math.floor(100 * Math.pow(1.15, lv - 1)); }

function getMemberStats(compTarget = null) {
  const lv = gameState.stats.lv;
  let baseHp = 100 + (lv - 1) * 35;
  let baseMp = 30 + (lv - 1) * 8;
  let baseAtk = 15 + (lv - 1) * 12;
  let baseDef = 10 + (lv - 1) * 8;
  let baseSpd = 10 + (lv - 1) * 6;

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
    spd: baseSpd + equipBonus.spd
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

function requestAdminAccess() {
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
  const input = document.getElementById("admin-pass-input").value;
  if (input === "師範代LOVE") {
    closeModal();
    openScreen("screen-admin");
    renderAdminUI();
  } else {
    showToast("パスワードが違います");
  }
}

function renderAdminUI() {
  document.getElementById("adm-lv").value = gameState.stats.lv;
  document.getElementById("adm-gold").value = gameState.stats.gold;
  document.getElementById("adm-exp").value = gameState.stats.exp;
}

function saveAdminStats() {
  const newLv = Math.min(99, Math.max(1, parseInt(document.getElementById("adm-lv").value) || 1));
  const newGold = Math.max(0, parseInt(document.getElementById("adm-gold").value) || 0);
  const newExp = Math.max(0, parseInt(document.getElementById("adm-exp").value) || 0);

  gameState.stats.lv = newLv;
  gameState.stats.gold = newGold;
  gameState.stats.exp = newExp;

  checkCompanionUnlock(true);
  saveGame();
  showToast("管理者設定を保存しました");
}

function resetDailyLimits() {
  gameState.stats.lastDojoDate = "";
  gameState.stats.lastSelfDate = "";
  gameState.stats.lastGachaDate = "";
  saveGame();
  showToast("1日1回制限をリセットしました");
}

function resetAllData() {
  if (confirm("本当に全てのデータを初期化しますか？")) {
    localStorage.removeItem("karate_rpg_state_v5");
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

/* ==========================================================================
   NAVIGATION
   ========================================================================== */

function openScreen(screenId) {
  initAudio();

  if (screenId !== "screen-battle") {
    currentBattle = null;
    const bScreen = document.getElementById("screen-battle");
    if (bScreen) {
      bScreen.classList.remove("active");
    }
  }

  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
  });

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  }

  const btnBack = document.getElementById("btn-back");
  if (screenId === "screen-home") {
    btnBack.style.display = "none";
    startBGM("mild");
  } else {
    btnBack.style.display = "flex";
    if (screenId !== "screen-battle") {
      startBGM("mild");
    }
  }

  updateHeaderGold();

  if (screenId === "screen-home") updateHomeUI();
  if (screenId === "screen-status") updateStatusUI();
  if (screenId === "screen-fitting") renderFittingUI();
  if (screenId === "screen-item-shop") renderItemShopUI();
  if (screenId === "screen-equip-shop") renderEquipShopUI();
  if (screenId === "screen-sell-items") renderSellItemsUI();
  if (screenId === "screen-sell-equips") renderSellEquipsUI();
  if (screenId === "screen-lab-upgrade") renderLabUpgradeUI();
  if (screenId === "screen-lab-combine") renderLabCombineUI();
  if (screenId === "screen-char-edit") renderCharEditUI();
  if (screenId === "screen-stages") renderStagesUI();
}

function goHome() { openScreen("screen-home"); }

function updateHomeUI() {
  const pCount = 1 + gameState.companions.length;
  document.getElementById("home-avatar").innerText = gameState.char.avatar;
  document.getElementById("home-name").innerText = gameState.char.name;
  document.getElementById("home-title").innerText = getTitle(gameState.stats.lv);
  document.getElementById("home-lv").innerText = gameState.stats.lv;
  document.getElementById("home-party-count").innerText = pCount;

  const today = getTodayString();
  document.getElementById("btn-dojo").classList.toggle("disabled", gameState.stats.lastDojoDate === today);
  document.getElementById("btn-self").classList.toggle("disabled", gameState.stats.lastSelfDate === today);
  document.getElementById("btn-gacha").classList.toggle("disabled", gameState.stats.lastGachaDate === today);
}

function updateStatusUI() {
  const pTabs = document.getElementById("status-party-tabs");
  let tabsHtml = `<button class="tab-btn active" onclick="selectStatusMember('hero')">${gameState.char.name}</button>`;
  gameState.companions.forEach(c => {
    tabsHtml += `<button class="tab-btn" onclick="selectStatusMember(${c.id})">${c.name}</button>`;
  });
  pTabs.innerHTML = tabsHtml;

  renderStatusMemberDetail('hero');

  const skillsList = document.getElementById("status-skills-list");
  let unlocked = SKILLS_MASTER.filter(s => gameState.stats.lv >= s.lv);
  
  if(!gameState.favoriteSkills) gameState.favoriteSkills = [];

  if (currentSkillFilter === 'attack') {
    unlocked = unlocked.filter(s => s.type === 'attack');
  } else if (currentSkillFilter === 'defend') {
    unlocked = unlocked.filter(s => s.type === 'defend');
  } else if (currentSkillFilter === 'heal') {
    unlocked = unlocked.filter(s => s.type === 'heal');
  } else if (currentSkillFilter === 'fav') {
    unlocked = unlocked.filter(s => gameState.favoriteSkills.includes(s.id));
  }
  
  unlocked.sort((a, b) => {
    const isFavA = gameState.favoriteSkills.includes(a.id) ? 1 : 0;
    const isFavB = gameState.favoriteSkills.includes(b.id) ? 1 : 0;
    return isFavB - isFavA;
  });

  if (unlocked.length === 0) {
    skillsList.innerHTML = `<div style="text-align:center; color:var(--text-sub); padding:10px;">該当する技がありません</div>`;
    return;
  }

  skillsList.innerHTML = unlocked.map(s => {
    const isFav = gameState.favoriteSkills.includes(s.id);
    return `
      <div style="background:#0f172a; padding:6px; border-radius:6px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span class="fav-star" onclick="toggleFavoriteSkill('${s.id}')">${isFav ? '★' : '☆'}</span>
          <b style="color:var(--accent-gold);">${s.name}</b> (消費MP:${s.mp}) - ${s.desc}
        </div>
      </div>
    `;
  }).join("");
}

function renderStatusMemberDetail(targetId) {
  const container = document.getElementById("status-member-detail");
  let targetComp = null;
  let charName = gameState.char.name;
  let avatar = gameState.char.avatar;

  if (targetId !== 'hero') {
    targetComp = gameState.companions.find(c => c.id === targetId);
    if (targetComp) {
      charName = targetComp.name;
      avatar = targetComp.avatar;
    }
  }

  const st = getMemberStats(targetComp);
  const nextExp = getNextExp(gameState.stats.lv);

  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:8px;">
      <div style="font-size:2.5rem; background:#0f172a; border-radius:50%; width:50px; height:50px; display:flex; align-items:center; justify-content:center; border:1px solid var(--accent-gold);">${avatar}</div>
      <div>
        <div style="font-weight:bold; font-size:1rem;">${charName}</div>
        <div style="font-size:0.75rem; color:var(--accent-gold);">Lv. ${gameState.stats.lv} 【${getTitle(gameState.stats.lv)}】</div>
      </div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.75rem;">
      <div>HP: ${st.maxHp}</div>
      <div>MP: ${st.maxMp}</div>
      <div>攻撃力: ${st.atk}</div>
      <div>防御力: ${st.def}</div>
      <div>スピード: ${st.spd}</div>
      <div>累積経験値: ${gameState.stats.exp}</div>
      <div>次Lvまで: ${Math.max(0, nextExp - gameState.stats.exp)}</div>
      <div>道場稽古: ${gameState.stats.dojoCount}回</div>
      <div>自主稽古: ${gameState.stats.selfCount}回</div>
      <div>所持金: ${gameState.stats.gold}円</div>
    </div>
  `;

  const tabs = document.querySelectorAll("#status-party-tabs .tab-btn");
  tabs.forEach(t => t.classList.remove("active"));
  if (window.event && window.event.target && window.event.target.classList) {
    window.event.target.classList.add("active");
  }
}

function selectStatusMember(targetId) {
  renderStatusMemberDetail(targetId);
}

/* ==========================================================================
   Dojo & Self Training (XP Sources)
   ========================================================================== */

function addExp(amount) {
  gameState.stats.exp += amount;
  let oldLv = gameState.stats.lv;
  while (gameState.stats.lv < 99 && gameState.stats.exp >= getNextExp(gameState.stats.lv)) {
    gameState.stats.lv++;
  }
  if (gameState.stats.lv > oldLv) {
    showToast(`🌟 レベルアップ！ Lv.${gameState.stats.lv} になりました！`);
    checkCompanionUnlock(true);
  }
  saveGame();
  updateHomeUI();
}

function doDojoTraining() {
  const today = getTodayString();
  if (gameState.stats.lastDojoDate === today) {
    showToast("道場稽古は1日1回までです");
    return;
  }
  gameState.stats.lastDojoDate = today;
  gameState.stats.dojoCount++;
  const gainedExp = 120 + gameState.stats.lv * 20;
  addExp(gainedExp);
  playSE('win');
  showToast(`🥋 道場稽古完了！ 経験値 +${gainedExp} 獲得！`);
}

function doSelfTraining() {
  const today = getTodayString();
  if (gameState.stats.lastSelfDate === today) {
    showToast("自主稽古は1日1回までです");
    return;
  }
  gameState.stats.lastSelfDate = today;
  gameState.stats.selfCount++;
  const gainedExp = 80 + gameState.stats.lv * 15;
  addExp(gainedExp);
  playSE('win');
  showToast(`🔥 自主稽古完了！ 経験値 +${gainedExp} 獲得！`);
}

/* ==========================================================================
   CHAR EDIT
   ========================================================================== */

let selectedCharEditTarget = 'hero';

function renderCharEditUI() {
  const tabs = document.getElementById("char-edit-tabs");
  let tabsHtml = `<button class="tab-btn active" onclick="switchCharEditTarget('hero')">${gameState.char.name}</button>`;
  gameState.companions.forEach(c => {
    tabsHtml += `<button class="tab-btn" onclick="switchCharEditTarget(${c.id})">${c.name}</button>`;
  });
  tabs.innerHTML = tabsHtml;

  switchCharEditTarget('hero');
}

function switchCharEditTarget(targetId) {
  selectedCharEditTarget = targetId;

  let name = gameState.char.name;
  let gender = gameState.char.gender;
  let age = gameState.char.age;
  let avatar = gameState.char.avatar;

  if (targetId !== 'hero') {
    const c = gameState.companions.find(x => x.id === targetId);
    if (c) {
      name = c.name;
      gender = c.gender;
      age = c.age;
      avatar = c.avatar;
    }
  }

  document.getElementById("edit-name").value = name;
  document.getElementById("edit-gender").value = gender;
  document.getElementById("edit-age").value = age;

  const grid = document.getElementById("avatar-grid");
  grid.innerHTML = AVATARS.map(a => `
    <div onclick="selectAvatarIcon('${a}')" class="avatar-opt" style="font-size:1.8rem; text-align:center; padding:6px; background:#0f172a; border-radius:8px; cursor:pointer; border:1px solid ${a === avatar ? 'var(--accent-gold)' : 'var(--border-color)'}">
      ${a}
    </div>
  `).join("");

  const tabs = document.querySelectorAll("#char-edit-tabs .tab-btn");
  tabs.forEach(t => t.classList.remove("active"));
  if (window.event && window.event.target && window.event.target.classList) {
    window.event.target.classList.add("active");
  }
}

let tempSelectedAvatar = null;
function selectAvatarIcon(a) {
  tempSelectedAvatar = a;
  const opts = document.querySelectorAll(".avatar-opt");
  opts.forEach(opt => {
    opt.style.borderColor = (opt.innerText.trim() === a) ? 'var(--accent-gold)' : 'var(--border-color)';
  });
}

function saveCharSettings() {
  const newName = document.getElementById("edit-name").value.trim() || "無名";
  const newGender = document.getElementById("edit-gender").value;
  const newAge = parseInt(document.getElementById("edit-age").value) || 15;

  if (selectedCharEditTarget === 'hero') {
    gameState.char.name = newName;
    gameState.char.gender = newGender;
    gameState.char.age = newAge;
    if (tempSelectedAvatar) gameState.char.avatar = tempSelectedAvatar;
  } else {
    const c = gameState.companions.find(x => x.id === selectedCharEditTarget);
    if (c) {
      c.name = newName;
      c.gender = newGender;
      c.age = newAge;
      if (tempSelectedAvatar) c.avatar = tempSelectedAvatar;
    }
  }

  saveGame();
  showToast("キャラ設定を更新しました");
  tempSelectedAvatar = null;
  updateHomeUI();
}

/* ==========================================================================
   STAGES & ENEMIES
   ========================================================================== */

function renderStagesUI() {
  const list = document.getElementById("stage-list");
  list.innerHTML = STAGES_MASTER.map(s => `
    <div class="list-card" onclick="selectStage('${s.id}')" style="cursor:pointer;">
      <div class="list-card-main">
        <div class="list-card-left">
          <div class="list-icon">${s.icon}</div>
          <div class="list-details">
            <div class="list-title">${s.name}</div>
            <div class="list-meta" style="color:var(--accent-gold);">${s.stars}</div>
          </div>
        </div>
        <div style="font-size:0.8rem; color:var(--text-sub);">対戦可能 ➔</div>
      </div>
    </div>
  `).join("");
}

function selectStage(stageId) {
  const stg = STAGES_MASTER.find(s => s.id === stageId);
  if (!stg) return;

  document.getElementById("enemy-stage-title").innerText = `🎯 相手を選択 (${stg.name})`;
  const enemyList = document.getElementById("enemy-list");

  enemyList.innerHTML = stg.enemies.map((e, idx) => `
    <div class="list-card" onclick="startBattleWithEnemy('${stg.id}', ${idx})" style="cursor:pointer;">
      <div class="list-card-main">
        <div class="list-card-left">
          <div class="list-icon">${e.icon}</div>
          <div class="list-details">
            <div class="list-title">${e.name} ${e.isUnique ? '★' : ''}</div>
            <div class="list-meta">HP:${e.hp} / 攻撃:${e.atk} / 防御:${e.def}</div>
          </div>
        </div>
        <button class="btn btn-gold" style="font-size:0.75rem;">勝負！</button>
      </div>
    </div>
  `).join("");

  openScreen("screen-enemies");
}

/* ==========================================================================
   BATTLE ENGINE
   ========================================================================== */

function startBattleWithEnemy(stageId, enemyIdx) {
  const stg = STAGES_MASTER.find(s => s.id === stageId);
  if (!stg) return;
  const masterEnemy = stg.enemies[enemyIdx];

  const party = [];
  const heroSt = getMemberStats(null);
  party.push({
    id: 'hero',
    name: gameState.char.name,
    avatar: gameState.char.avatar,
    gender: gameState.char.gender,
    hp: heroSt.maxHp,
    maxHp: heroSt.maxHp,
    mp: heroSt.maxMp,
    maxMp: heroSt.maxMp,
    atk: heroSt.atk,
    def: heroSt.def,
    spd: heroSt.spd,
    isDefending: false,
    defCut: 0,
    counterMul: 0,
    tempAtkBuff: 0,
    tempDefBuff: 0,
    guardTurns: 0
  });

  gameState.companions.forEach(c => {
    const cSt = getMemberStats(c);
    party.push({
      id: c.id,
      name: c.name,
      avatar: c.avatar,
      gender: c.gender,
      hp: cSt.maxHp,
      maxHp: cSt.maxHp,
      mp: cSt.maxMp,
      maxMp: cSt.maxMp,
      atk: cSt.atk,
      def: cSt.def,
      spd: cSt.spd,
      isDefending: false,
      defCut: 0,
      counterMul: 0,
      tempAtkBuff: 0,
      tempDefBuff: 0,
      guardTurns: 0
    });
  });

  const enemies = [];
  let enemyCount = 1;
  if (!masterEnemy.isUnique) {
    enemyCount = Math.floor(Math.random() * 3) + 1;
  }

  for (let i = 0; i < enemyCount; i++) {
    const suffix = enemyCount > 1 ? String.fromCharCode(65 + i) : "";
    enemies.push({
      id: i,
      name: masterEnemy.name + (suffix ? ` ${suffix}` : ""),
      icon: masterEnemy.icon,
      hp: masterEnemy.hp,
      maxHp: masterEnemy.hp,
      atk: masterEnemy.atk,
      def: masterEnemy.def,
      spd: masterEnemy.spd,
      gold: masterEnemy.gold,
      pattern: masterEnemy.pattern,
      isDefending: false
    });
  }

  currentBattle = {
    stage: stg,
    enemies: enemies,
    party: party,
    turnIndex: 0,
    state: 'PLAYER_TURN',
    pendingAction: null,
    targetMode: null
  };

  openScreen("screen-battle");
  startBGM(stg.bgm);

  document.getElementById("battle-layer-bg").style.backgroundImage = `url('${stg.bgImg}')`;
  document.getElementById("battle-enemy-name").innerText = enemies.map(e => e.name).join(", ");

  renderBattle3D();
  renderBattleHUD();
  setBattleLog(`⚔️ ${enemies.map(e => e.name).join("たち")} が現れた！`);

  startTurn();
}

function renderBattle3D() {
  if (!currentBattle) return;

  const partyWrap = document.getElementById("battle-party-3d");
  partyWrap.innerHTML = currentBattle.party.map((m, idx) => `
    <div class="char-3d-member ${m.hp <= 0 ? 'defeated' : ''} ${m.gender === '男' ? 'gender-male' : 'gender-female'}" id="b-party-3d-${idx}">
      <div class="turn-arrow">▼</div>
      <div class="char-3d-avatar">${m.avatar}</div>
    </div>
  `).join("");

  const enemyContainer = document.getElementById("battle-enemies-3d-container");
  enemyContainer.innerHTML = currentBattle.enemies.map((e, idx) => `
    <div class="char-3d-enemy-wrap ${e.hp <= 0 ? 'defeated' : ''}" id="b-enemy-3d-${idx}" onclick="selectBattleTarget('enemy', ${idx})">
      <div class="char-3d-enemy">${e.icon}</div>
    </div>
  `).join("");
}

function renderBattleHUD() {
  if (!currentBattle) return;
  const statusRight = document.getElementById("battle-party-status-right");
  statusRight.innerHTML = currentBattle.party.map((m, idx) => {
    const hpPct = Math.max(0, Math.min(100, (m.hp / m.maxHp) * 100));
    const mpPct = Math.max(0, Math.min(100, (m.mp / m.maxMp) * 100));
    const activeClass = (currentBattle.state === 'PLAYER_TURN' && currentBattle.turnIndex === idx) ? 'active-turn' : '';
    const defeatedClass = m.hp <= 0 ? 'defeated' : '';

    return `
      <div class="hud-card ${activeClass} ${defeatedClass}" id="hud-card-${idx}">
        <div class="hud-name">
          <span>${m.avatar} ${m.name}</span>
          <span style="font-size:0.6rem; color:var(--text-sub);">${m.hp}/${m.maxHp}</span>
        </div>
        <div class="bar-group">
          <span class="bar-label label-hp">HP</span>
          <div class="bar-container" style="flex:1;">
            <div class="bar-fill bg-hp" style="width:${hpPct}%;"></div>
          </div>
        </div>
        <div class="bar-group">
          <span class="bar-label label-mp">MP</span>
          <div class="bar-container" style="flex:1;">
            <div class="bar-fill bg-mp" style="width:${mpPct}%;"></div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function setBattleLog(msg) {
  const log = document.getElementById("battle-log");
  if (log) {
    log.innerHTML += `<div>${msg}</div>`;
    log.scrollTop = log.scrollHeight;
  }
}

function startTurn() {
  if (!currentBattle) return;

  const aliveEnemies = currentBattle.enemies.filter(e => e.hp > 0);
  if (aliveEnemies.length === 0) {
    winBattle();
    return;
  }

  const aliveParty = currentBattle.party.filter(m => m.hp > 0);
  if (aliveParty.length === 0) {
    loseBattle();
    return;
  }

  while (currentBattle.turnIndex < currentBattle.party.length && currentBattle.party[currentBattle.turnIndex].hp <= 0) {
    currentBattle.turnIndex++;
  }

  if (currentBattle.turnIndex >= currentBattle.party.length) {
    currentBattle.state = 'ENEMY_TURN';
    renderBattle3D();
    renderBattleHUD();
    setTimeout(executeEnemyTurn, 600);
  } else {
    currentBattle.state = 'PLAYER_TURN';
    const curActor = currentBattle.party[currentBattle.turnIndex];
    if (curActor.guardTurns > 0) {
      curActor.guardTurns--;
      if (curActor.guardTurns === 0) {
        curActor.defCut = 0;
      }
    } else {
      curActor.isDefending = false;
      curActor.defCut = 0;
    }
    renderBattle3D();
    renderBattleHUD();
    updateCommandButtons();
  }
}

function updateCommandButtons() {
  const area = document.getElementById("battle-commands-area");
  if (!area || !currentBattle) return;
  const actor = currentBattle.party[currentBattle.turnIndex];

  area.innerHTML = `
    <button class="cmd-btn" onclick="executeBattleAction('attack')">🥊 通常攻撃</button>
    <button class="cmd-btn" onclick="openBattleSubMenu('attack_skill')">💥 攻撃技</button>
    <button class="cmd-btn" onclick="openBattleSubMenu('defend_skill')">🛡️ 防御技</button>
    <button class="cmd-btn" onclick="openBattleSubMenu('heal_skill')">✨ 回復技</button>
    <button class="cmd-btn" onclick="openBattleSubMenu('item')">🎒 道具</button>
    <button class="cmd-btn" onclick="executeBattleAction('run')">🏃 逃げる</button>
  `;
}

function openBattleSubMenu(type) {
  if (!currentBattle || currentBattle.state !== 'PLAYER_TURN') return;
  const actor = currentBattle.party[currentBattle.turnIndex];

  if (type === 'attack_skill' || type === 'defend_skill' || type === 'heal_skill') {
    let skillType = type.split('_')[0];
    let unlocked = SKILLS_MASTER.filter(s => gameState.stats.lv >= s.lv && s.type === skillType);

    let html = `
      <div class="card-title">📜 技選択</div>
      <div style="display:flex; gap:4px; margin-bottom:8px; overflow-x:auto;">
        <button class="tab-btn ${battleSkillFilter === 'all' ? 'active' : ''}" onclick="setBattleSkillFilter('all', '${type}')">すべて</button>
        <button class="tab-btn ${battleSkillFilter === 'fav' ? 'active' : ''}" onclick="setBattleSkillFilter('fav', '${type}')">★お気に入り</button>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">
    `;

    if (battleSkillFilter === 'fav') {
      unlocked = unlocked.filter(s => gameState.favoriteSkills.includes(s.id));
    }

    if (unlocked.length === 0) {
      html += `<div style="text-align:center; color:var(--text-sub); padding:10px;">使用可能な技がありません</div>`;
    } else {
      unlocked.forEach(s => {
        const canUse = actor.mp >= s.mp;
        const isFav = gameState.favoriteSkills.includes(s.id);
        html += `
          <button class="btn" style="text-align:left; display:flex; justify-content:space-between; align-items:center; opacity:${canUse ? 1 : 0.5}" ${canUse ? `onclick="selectBattleSkill('${s.id}')"` : ''}>
            <span><span class="fav-star" onclick="event.stopPropagation(); toggleFavoriteSkill('${s.id}'); openBattleSubMenu('${type}');">${isFav ? '★' : '☆'}</span>${s.name} (${s.desc})</span>
            <span>MP:${s.mp}</span>
          </button>
        `;
      });
    }

    html += `</div><button class="btn btn-red" onclick="closeModal()" style="margin-top:8px;">キャンセル</button>`;
    openModal(html);
  } else if (type === 'item') {
    let html = `<div class="card-title">🎒 道具選択</div><div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">`;
    let count = 0;
    Object.entries(gameState.inventory.items).forEach(([itemId, qty]) => {
      if (qty > 0) {
        const itemMaster = SHOP_ITEMS.find(i => i.id === itemId);
        if (itemMaster) {
          count++;
          html += `
            <button class="btn" style="text-align:left; display:flex; justify-content:space-between;" onclick="selectBattleItem('${itemMaster.id}')">
              <span>${itemMaster.icon} ${itemMaster.name} (${itemMaster.desc})</span>
              <span>x${qty}</span>
            </button>
          `;
        }
      }
    });

    if (count === 0) {
      html += `<div style="text-align:center; color:var(--text-sub); padding:10px;">所持道具がありません</div>`;
    }

    html += `</div><button class="btn btn-red" onclick="closeModal()" style="margin-top:8px;">キャンセル</button>`;
    openModal(html);
  }
}

let battleSkillFilter = 'all';
function setBattleSkillFilter(filter, type) {
  battleSkillFilter = filter;
  openBattleSubMenu(type);
}

function selectBattleSkill(skillId) {
  closeModal();
  const skill = SKILLS_MASTER.find(s => s.id === skillId);
  if (!skill) return;

  currentBattle.pendingAction = { type: 'skill', skill: skill };

  if (skill.type === 'attack') {
    if (skill.isAll) {
      executePendingAction(null);
    } else {
      const aliveEnemies = currentBattle.enemies.filter(e => e.hp > 0);
      if (aliveEnemies.length === 1) {
        executePendingAction(aliveEnemies[0].id);
      } else {
        startTargeting('enemy');
      }
    }
  } else if (skill.type === 'defend') {
    executePendingAction(null);
  } else if (skill.type === 'heal') {
    if (skill.target === 'self') {
      executePendingAction(currentBattle.turnIndex);
    } else if (skill.target === 'all') {
      executePendingAction(null);
    } else if (skill.target === 'single') {
      startTargeting('party');
    }
  }
}

function selectBattleItem(itemId) {
  closeModal();
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  currentBattle.pendingAction = { type: 'item', item: item };
  startTargeting('party');
}

function startTargeting(mode) {
  currentBattle.targetMode = mode;
  setBattleLog(`🎯 対象を選択してください`);

  if (mode === 'enemy') {
    currentBattle.enemies.forEach((e, idx) => {
      if (e.hp > 0) {
        const el = document.getElementById(`b-enemy-3d-${idx}`);
        if (el) el.classList.add("target-selectable");
      }
    });
  } else if (mode === 'party') {
    currentBattle.party.forEach((m, idx) => {
      if (m.hp > 0) {
        const el = document.getElementById(`b-party-3d-${idx}`);
        if (el) {
          el.classList.add("target-selectable");
          el.onclick = () => selectBattleTarget('party', idx);
        }
      }
    });
  }
}

function selectBattleTarget(type, idx) {
  if (!currentBattle || !currentBattle.targetMode) return;

  if (currentBattle.targetMode === 'enemy' && type === 'enemy') {
    if (currentBattle.enemies[idx].hp > 0) {
      clearTargeting();
      executePendingAction(idx);
    }
  } else if (currentBattle.targetMode === 'party' && type === 'party') {
    if (currentBattle.party[idx].hp > 0) {
      clearTargeting();
      executePendingAction(idx);
    }
  }
}

function clearTargeting() {
  currentBattle.targetMode = null;
  document.querySelectorAll(".target-selectable").forEach(el => {
    el.classList.remove("target-selectable");
    el.onclick = null;
  });
  renderBattle3D();
}

function executeBattleAction(actionType) {
  if (!currentBattle || currentBattle.state !== 'PLAYER_TURN') return;

  if (actionType === 'attack') {
    currentBattle.pendingAction = { type: 'attack' };
    const aliveEnemies = currentBattle.enemies.filter(e => e.hp > 0);
    if (aliveEnemies.length === 1) {
      executePendingAction(aliveEnemies[0].id);
    } else {
      startTargeting('enemy');
    }
  } else if (actionType === 'run') {
    if (Math.random() < 0.7) {
      setBattleLog(`🏃 逃げ出した！`);
      setTimeout(() => openScreen("screen-stages"), 1000);
    } else {
      setBattleLog(`🏃 逃げ切れなかった！`);
      currentBattle.turnIndex++;
      setTimeout(startTurn, 800);
    }
  }
}

function executePendingAction(targetIdx) {
  const actor = currentBattle.party[currentBattle.turnIndex];
  const act = currentBattle.pendingAction;
  if (!act) return;

  if (act.type === 'attack') {
    const target = currentBattle.enemies[targetIdx];
    playSE('attack');
    let damage = Math.max(1, Math.floor(actor.atk * 1.0 - target.def * 0.4 + (Math.random() * 4 - 2)));
    if (target.isDefending) damage = Math.max(1, Math.floor(damage * 0.5));

    target.hp = Math.max(0, target.hp - damage);
    setBattleLog(`👊 ${actor.name} の攻撃！ ${target.name} に ${damage} のダメージ！`);

    const eEl = document.getElementById(`b-enemy-3d-${targetIdx}`);
    if (eEl) eEl.classList.add("anim-hit-enemy");

  } else if (act.type === 'skill') {
    const s = act.skill;
    actor.mp -= s.mp;

    if (s.type === 'attack') {
      playSE('special');
      if (s.isAll) {
        setBattleLog(`💥 ${actor.name} の「${s.name}」！`);
        currentBattle.enemies.forEach((target, idx) => {
          if (target.hp > 0) {
            let damage = Math.max(1, Math.floor(actor.atk * s.power - target.def * 0.4));
            target.hp = Math.max(0, target.hp - damage);
            setBattleLog(`  ${target.name} に ${damage} のダメージ！`);
            const eEl = document.getElementById(`b-enemy-3d-${idx}`);
            if (eEl) eEl.classList.add("anim-hit-enemy");
          }
        });
      } else {
        const target = currentBattle.enemies[targetIdx];
        let damage = Math.max(1, Math.floor(actor.atk * s.power - target.def * 0.4));
        target.hp = Math.max(0, target.hp - damage);
        setBattleLog(`💥 ${actor.name} の「${s.name}」！ ${target.name} に ${damage} のダメージ！`);
        const eEl = document.getElementById(`b-enemy-3d-${targetIdx}`);
        if (eEl) eEl.classList.add("anim-hit-enemy");
      }
    } else if (s.type === 'defend') {
      playSE('special');
      actor.isDefending = true;
      actor.defCut = s.cut || 0.5;
      actor.counterMul = s.counter || 0;
      if (s.duration) actor.guardTurns = s.duration;
      if (s.buffAtk) actor.tempAtkBuff = s.buffAtk;
      if (s.buffDef) actor.tempDefBuff = s.buffDef;
      setBattleLog(`🛡️ ${actor.name} は「${s.name}」で身構えた！`);

    } else if (s.type === 'heal') {
      playSE('heal');
      if (s.target === 'self' || s.target === 'single') {
        const target = currentBattle.party[targetIdx];
        if (s.mode === 'hp') {
          target.hp = Math.min(target.maxHp, target.hp + s.val);
          setBattleLog(`✨ ${actor.name} の「${s.name}」！ ${target.name} のHPが ${s.val} 回復！`);
        } else {
          target.mp = Math.min(target.maxMp, target.mp + s.val);
          setBattleLog(`✨ ${actor.name} の「${s.name}」！ ${target.name} のMPが ${s.val} 回復！`);
        }
        const pEl = document.getElementById(`b-party-3d-${targetIdx}`);
        if (pEl) pEl.classList.add("anim-heal-member");
      } else if (s.target === 'all') {
        setBattleLog(`✨ ${actor.name} の「${s.name}」！`);
        currentBattle.party.forEach((target, idx) => {
          if (target.hp > 0) {
            target.hp = Math.min(target.maxHp, target.hp + s.val);
            setBattleLog(`  ${target.name} のHPが ${s.val} 回復！`);
            const pEl = document.getElementById(`b-party-3d-${idx}`);
            if (pEl) pEl.classList.add("anim-heal-member");
          }
        });
      }
    }
  } else if (act.type === 'item') {
    const item = act.item;
    gameState.inventory.items[item.id]--;
    const target = currentBattle.party[targetIdx];

    playSE('heal');
    if (item.type === 'hp') {
      target.hp = Math.min(target.maxHp, target.hp + item.val);
      setBattleLog(`🎒 ${actor.name} は ${item.name} をつかった！ ${target.name} のHPが ${item.val} 回復！`);
    } else if (item.type === 'mp') {
      target.mp = Math.min(target.maxMp, target.mp + item.val);
      setBattleLog(`🎒 ${actor.name} は ${item.name} をつかった！ ${target.name} のMPが ${item.val} 回復！`);
    }
    const pEl = document.getElementById(`b-party-3d-${targetIdx}`);
    if (pEl) pEl.classList.add("anim-heal-member");
  }

  currentBattle.pendingAction = null;
  renderBattle3D();
  renderBattleHUD();

  setTimeout(() => {
    currentBattle.turnIndex++;
    startTurn();
  }, 900);
}

function executeEnemyTurn() {
  if (!currentBattle || currentBattle.state !== 'ENEMY_TURN') return;

  const aliveEnemies = currentBattle.enemies.filter(e => e.hp > 0);
  const aliveParty = currentBattle.party.filter(m => m.hp > 0);

  if (aliveEnemies.length === 0 || aliveParty.length === 0) {
    startTurn();
    return;
  }

  aliveEnemies.forEach((enemy, enemyIdx) => {
    const target = aliveParty[Math.floor(Math.random() * aliveParty.length)];
    const targetIdx = currentBattle.party.findIndex(m => m.id === target.id);

    playSE('damage');

    let baseDmg = Math.max(1, Math.floor(enemy.atk * 1.0 - (target.def + target.tempDefBuff) * 0.4 + (Math.random() * 4 - 2)));
    if (target.isDefending) {
      baseDmg = Math.max(1, Math.floor(baseDmg * (1 - target.defCut)));
    }

    target.hp = Math.max(0, target.hp - baseDmg);
    setBattleLog(`😈 ${enemy.name} の攻撃！ ${target.name} に ${baseDmg} のダメージ！`);

    if (target.isDefending && target.counterMul > 0) {
      let counterDmg = Math.max(1, Math.floor(target.atk * target.counterMul));
      enemy.hp = Math.max(0, enemy.hp - counterDmg);
      setBattleLog(`  🛡️ ${target.name} のカウンター！ ${enemy.name} に ${counterDmg} のダメージ！`);
    }

    const overlay = document.getElementById("damage-overlay");
    if (overlay) {
      overlay.classList.add("damage-flash");
      setTimeout(() => overlay.classList.remove("damage-flash"), 400);
    }

    const pEl = document.getElementById(`b-party-3d-${targetIdx}`);
    if (pEl) pEl.classList.add("anim-hit-member");
  });

  renderBattle3D();
  renderBattleHUD();

  setTimeout(() => {
    currentBattle.turnIndex = 0;
    startTurn();
  }, 1000);
}

function winBattle() {
  playSE('win');
  let totalGold = 0;
  currentBattle.enemies.forEach(e => {
    totalGold += e.gold;
  });

  gameState.stats.gold += totalGold;

  setBattleLog(`🎉 勝利！ 獲得お金: +${totalGold}円！`);
  saveGame();

  setTimeout(() => {
    openModal(`
      <div style="text-align:center; padding:10px;">
        <h2 style="color:var(--accent-gold); margin-bottom:10px;">🎉 Victory!</h2>
        <p style="font-size:0.9rem; margin-bottom:6px;">獲得お金: <b>+${totalGold}円</b></p>
        <button class="btn btn-gold" style="width:100%; margin-top:12px;" onclick="closeModal(); openScreen('screen-stages');">ステージ選択へ</button>
      </div>
    `);
  }, 800);
}

function loseBattle() {
  setBattleLog(`💀 パーティは全滅した...`);
  setTimeout(() => {
    openModal(`
      <div style="text-align:center; padding:10px;">
        <h2 style="color:var(--accent-red); margin-bottom:10px;">💀 Defeat...</h2>
        <p style="font-size:0.85rem; margin-bottom:12px;">修行をし直して再挑戦しよう！</p>
        <button class="btn btn-red" style="width:100%;" onclick="closeModal(); openScreen('screen-home');">ホームへ戻る</button>
      </div>
    `);
  }, 800);
}

/* ==========================================================================
   FITTING (EQUIPMENT)
   ========================================================================== */

let selectedFittingMember = 'hero';
let fittingFilterSlot = 'all';

function renderFittingUI() {
  const pTabs = document.getElementById("fitting-member-tabs");
  let tabsHtml = `<button class="tab-btn active" onclick="switchFittingMember('hero')">${gameState.char.name}</button>`;
  gameState.companions.forEach(c => {
    tabsHtml += `<button class="tab-btn" onclick="switchFittingMember(${c.id})">${c.name}</button>`;
  });
  pTabs.innerHTML = tabsHtml;

  switchFittingMember('hero');
}

function switchFittingMember(targetId) {
  selectedFittingMember = targetId;

  let equippedObj = gameState.equipped;
  if (targetId !== 'hero') {
    const c = gameState.companions.find(x => x.id === targetId);
    if (c) equippedObj = c.equipped;
  }

  const slotsEl = document.getElementById("equipped-slots");
  const slots = ["頭", "体", "武器", "装飾"];

  slotsEl.innerHTML = slots.map(s => {
    const item = equippedObj[s];
    return `
      <div style="background:#0f172a; padding:6px 8px; border-radius:6px; border:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; font-size:0.75rem;">
        <div>
          <b style="color:var(--accent-gold);">${s}:</b> 
          ${item ? `${item.icon} ${item.name} (Lv.${item.lv})` : '<span style="color:var(--text-sub);">なし</span>'}
        </div>
        ${item ? `<button class="btn btn-red" style="font-size:0.65rem; padding:2px 6px;" onclick="unequipSlot('${s}')">外す</button>` : ''}
      </div>
    `;
  }).join("");

  renderFittingList();

  const tabs = document.querySelectorAll("#fitting-member-tabs .tab-btn");
  tabs.forEach(t => t.classList.remove("active"));
  if (window.event && window.event.target && window.event.target.classList) {
    window.event.target.classList.add("active");
  }
}

function filterFitting(slot) {
  fittingFilterSlot = slot;
  const tabs = document.querySelectorAll("#fitting-tabs .tab-btn");
  tabs.forEach(t => t.classList.remove("active"));
  if (window.event && window.event.target && window.event.target.classList) {
    window.event.target.classList.add("active");
  }
  renderFittingList();
}

function renderFittingList() {
  const list = document.getElementById("fitting-list");
  let equips = gameState.inventory.equips;

  if (fittingFilterSlot !== 'all') {
    equips = equips.filter(e => e.slot === fittingFilterSlot);
  }

  if (equips.length === 0) {
    list.innerHTML = `<div style="text-align:center; color:var(--text-sub); padding:10px;">該当する装備がありません</div>`;
    return;
  }

  list.innerHTML = equips.map(eq => `
    <div class="list-card">
      <div class="list-card-main">
        <div class="list-card-left">
          <div class="list-icon">${eq.icon}</div>
          <div class="list-details">
            <div class="list-title"><span class="rarity-${eq.rarity}">[${eq.rarity}]</span> ${eq.name} (Lv.${eq.lv}/${eq.maxLv})</div>
            <div class="list-meta">部位:${eq.slot} / HP+${eq.hp + (eq.lv-1)*5} / 攻+${eq.atk + (eq.lv-1)*3} / 防+${eq.def + (eq.lv-1)*2}</div>
          </div>
        </div>
        <button class="btn btn-gold" style="font-size:0.75rem;" onclick="equipItem('${eq.instId}')">装備</button>
      </div>
    </div>
  `).join("");
}

function equipItem(instId) {
  const eqIdx = gameState.inventory.equips.findIndex(e => e.instId === instId);
  if (eqIdx === -1) return;
  const eq = gameState.inventory.equips[eqIdx];

  let targetEquipped = gameState.equipped;
  if (selectedFittingMember !== 'hero') {
    const c = gameState.companions.find(x => x.id === selectedFittingMember);
    if (c) targetEquipped = c.equipped;
  }

  if (targetEquipped[eq.slot]) {
    gameState.inventory.equips.push(targetEquipped[eq.slot]);
  }

  targetEquipped[eq.slot] = eq;
  gameState.inventory.equips.splice(eqIdx, 1);

  saveGame();
  switchFittingMember(selectedFittingMember);
  showToast(`${eq.name} を装備しました`);
}

function unequipSlot(slot) {
  let targetEquipped = gameState.equipped;
  if (selectedFittingMember !== 'hero') {
    const c = gameState.companions.find(x => x.id === selectedFittingMember);
    if (c) targetEquipped = c.equipped;
  }

  const eq = targetEquipped[slot];
  if (!eq) return;

  gameState.inventory.equips.push(eq);
  targetEquipped[slot] = null;

  saveGame();
  switchFittingMember(selectedFittingMember);
  showToast(`${eq.name} を外しました`);
}

/* ==========================================================================
   LAB (UPGRADE & COMBINE)
   ========================================================================== */

function renderLabUpgradeUI() {
  const list = document.getElementById("upgrade-equip-list");
  const equips = gameState.inventory.equips;

  if (equips.length === 0) {
    list.innerHTML = `<div style="text-align:center; color:var(--text-sub); padding:10px;">強化可能な装備がありません</div>`;
    return;
  }

  list.innerHTML = equips.map(eq => `
    <div class="list-card">
      <div class="list-card-main">
        <div class="list-card-left">
          <div class="list-icon">${eq.icon}</div>
          <div class="list-details">
            <div class="list-title">${eq.name} (Lv.${eq.lv}/${eq.maxLv})</div>
            <div class="list-meta">1Lv向上 = 300円</div>
          </div>
        </div>
        <button class="btn btn-gold" style="font-size:0.75rem;" onclick="upgradeEquipItem('${eq.instId}')">強化</button>
      </div>
    </div>
  `).join("");
}

function upgradeEquipItem(instId) {
  const eq = gameState.inventory.equips.find(e => e.instId === instId);
  if (!eq) return;

  if (eq.lv >= eq.maxLv) {
    showToast("これ以上レベルを上げられません（限界突破が必要）");
    return;
  }

  const cost = 300;
  if (gameState.stats.gold < cost) {
    showToast("お金が足りません");
    return;
  }

  gameState.stats.gold -= cost;
  eq.lv++;
  saveGame();
  renderLabUpgradeUI();
  showToast(`✨ ${eq.name} が Lv.${eq.lv} に上がった！`);
}

let combineBase = null;
let combineMaterials = [];

function renderLabCombineUI() {
  document.getElementById("combine-base-display").innerText = combineBase ? `${combineBase.icon} ${combineBase.name} (Lv.${combineBase.lv}/${combineBase.maxLv})` : "未選択";
  document.getElementById("combine-material-display").innerText = combineMaterials.length > 0 ? combineMaterials.map(m => m.name).join(", ") : "未選択";
}

function openSelectCombineBaseModal() {
  const list = gameState.inventory.equips;
  let html = `<div class="card-title">① ベース装備を選択</div><div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">`;

  list.forEach(eq => {
    html += `
      <button class="btn" style="text-align:left;" onclick="setCombineBase('${eq.instId}')">
        ${eq.icon} ${eq.name} (Lv.${eq.lv}/${eq.maxLv}) [凸${eq.combineCount}/5]
      </button>
    `;
  });

  html += `</div><button class="btn btn-red" onclick="closeModal()" style="margin-top:8px;">キャンセル</button>`;
  openModal(html);
}

function setCombineBase(instId) {
  combineBase = gameState.inventory.equips.find(e => e.instId === instId);
  combineMaterials = [];
  closeModal();
  renderLabCombineUI();
}

function openSelectCombineMaterialModal() {
  if (!combineBase) {
    showToast("先にベース装備を選択してください");
    return;
  }

  const available = gameState.inventory.equips.filter(e => e.masterId === combineBase.masterId && e.instId !== combineBase.instId);
  let html = `<div class="card-title">② 素材装備を選択（複数可能）</div><div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">`;

  if (available.length === 0) {
    html += `<div style="text-align:center; color:var(--text-sub); padding:10px;">同じ装備の予備がありません</div>`;
  } else {
    available.forEach(eq => {
      const isSelected = combineMaterials.some(m => m.instId === eq.instId);
      html += `
        <button class="btn ${isSelected ? 'btn-green' : ''}" style="text-align:left;" onclick="toggleCombineMaterial('${eq.instId}')">
          ${isSelected ? '✓ ' : ''}${eq.icon} ${eq.name} (Lv.${eq.lv})
        </button>
      `;
    });
  }

  html += `</div><button class="btn btn-gold" onclick="closeModal()" style="margin-top:8px;">決定</button>`;
  openModal(html);
}

function toggleCombineMaterial(instId) {
  const idx = combineMaterials.findIndex(m => m.instId === instId);
  if (idx >= 0) {
    combineMaterials.splice(idx, 1);
  } else {
    const item = gameState.inventory.equips.find(e => e.instId === instId);
    if (item) combineMaterials.push(item);
  }
  openSelectCombineMaterialModal();
}

function executeCombine() {
  if (!combineBase || combineMaterials.length === 0) {
    showToast("ベースと素材を正しく選択してください");
    return;
  }

  if (combineBase.combineCount >= 5) {
    showToast("限界突破上限(5回)に達しています");
    return;
  }

  const addCount = Math.min(5 - combineBase.combineCount, combineMaterials.length);
  combineBase.combineCount += addCount;
  combineBase.maxLv += addCount * 5;

  combineMaterials.forEach(m => {
    const idx = gameState.inventory.equips.findIndex(e => e.instId === m.instId);
    if (idx >= 0) gameState.inventory.equips.splice(idx, 1);
  });

  combineBase = null;
  combineMaterials = [];

  saveGame();
  renderLabCombineUI();
  showToast(`🧬 合成完了！ 最大Lvが引き上げられました！`);
}

/* ==========================================================================
   SHOPS (ITEM & EQUIP)
   ========================================================================== */

function renderItemShopUI() {
  const list = document.getElementById("item-shop-list");
  list.innerHTML = SHOP_ITEMS.map(item => `
    <div class="list-card">
      <div class="list-card-main">
        <div class="list-card-left">
          <div class="list-icon">${item.icon}</div>
          <div class="list-details">
            <div class="list-title">${item.name}</div>
            <div class="list-meta">${item.desc} / <b>${item.price}円</b></div>
          </div>
        </div>
      </div>
      <div class="qty-control" style="justify-content:flex-end;">
        <input type="number" id="buy-qty-${item.id}" value="1" min="1" max="99" class="qty-input">
        <button class="btn btn-gold" style="font-size:0.75rem;" onclick="buyItem('${item.id}')">購入</button>
      </div>
    </div>
  `).join("");
}

function buyItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  const qtyInput = document.getElementById(`buy-qty-${itemId}`);
  const qty = parseInt(qtyInput.value) || 1;
  const totalPrice = item.price * qty;

  if (gameState.stats.gold < totalPrice) {
    showToast("お金が足りません");
    return;
  }

  gameState.stats.gold -= totalPrice;
  gameState.inventory.items[itemId] = (gameState.inventory.items[itemId] || 0) + qty;

  saveGame();
  updateHeaderGold();
  showToast(`🥖 ${item.name} x${qty} を購入しました！`);
}

let equipShopFilterSlot = 'all';

function filterEquipShop(slot) {
  equipShopFilterSlot = slot;
  const tabs = document.querySelectorAll("#equip-shop-tabs .tab-btn");
  tabs.forEach(t => t.classList.remove("active"));
  if (window.event && window.event.target && window.event.target.classList) {
    window.event.target.classList.add("active");
  }
  renderEquipShopUI();
}

function renderEquipShopUI() {
  const list = document.getElementById("equip-shop-list");
  let equips = SHOP_EQUIPS;

  if (equipShopFilterSlot !== 'all') {
    equips = equips.filter(e => e.slot === equipShopFilterSlot);
  }

  list.innerHTML = equips.map(eq => `
    <div class="list-card">
      <div class="list-card-main">
        <div class="list-card-left">
          <div class="list-icon">${eq.icon}</div>
          <div class="list-details">
            <div class="list-title"><span class="rarity-${eq.rarity}">[${eq.rarity}]</span> ${eq.name}</div>
            <div class="list-meta">部位:${eq.slot} / HP+${eq.hp} / 攻+${eq.atk} / 防+${eq.def} / <b>単価: ${eq.price}円</b></div>
            <div class="list-meta" style="color:var(--accent-gold); font-weight:bold;">合計金額: <span id="equip-total-${eq.id}">${eq.price}</span>円</div>
          </div>
        </div>
      </div>
      <div class="qty-control" style="justify-content:flex-end;">
        <input type="number" id="buy-equip-qty-${eq.id}" value="1" min="1" max="99" class="qty-input" oninput="updateEquipTotalPrice('${eq.id}', ${eq.price})">
        <button class="btn btn-gold" style="font-size:0.75rem;" onclick="buyEquip('${eq.id}')">購入</button>
      </div>
    </div>
  `).join("");
}

function updateEquipTotalPrice(equipId, unitPrice) {
  const qtyInput = document.getElementById(`buy-equip-qty-${equipId}`);
  const totalSpan = document.getElementById(`equip-total-${equipId}`);
  if (!qtyInput || !totalSpan) return;
  
  let qty = parseInt(qtyInput.value) || 1;
  if (qty < 1) qty = 1;
  totalSpan.innerText = unitPrice * qty;
}

function buyEquip(equipId) {
  const master = SHOP_EQUIPS.find(e => e.id === equipId);
  if (!master) return;

  const qtyInput = document.getElementById(`buy-equip-qty-${equipId}`);
  const qty = parseInt(qtyInput.value) || 1;
  const totalPrice = master.price * qty;

  if (gameState.stats.gold < totalPrice) {
    showToast("お金が足りません");
    return;
  }

  gameState.stats.gold -= totalPrice;
  for (let i = 0; i < qty; i++) {
    addEquipToInventory(equipId);
  }

  saveGame();
  updateHeaderGold();
  showToast(`🛍️ ${master.name} x${qty} を購入しました！`);
}

/* ==========================================================================
   FLEA MARKET (SELL)
   ========================================================================== */

function renderSellItemsUI() {
  const list = document.getElementById("sell-item-list");
  let html = "";
  let count = 0;

  Object.entries(gameState.inventory.items).forEach(([itemId, qty]) => {
    if (qty > 0) {
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      if (item) {
        count++;
        const sellPrice = Math.floor(item.price * 0.5);
        html += `
          <div class="list-card">
            <div class="list-card-main">
              <div class="list-card-left">
                <div class="list-icon">${item.icon}</div>
                <div class="list-details">
                  <div class="list-title">${item.name} (所持:${qty})</div>
                  <div class="list-meta">売却価格: <b>${sellPrice}円</b></div>
                </div>
              </div>
              <button class="btn btn-red" style="font-size:0.75rem;" onclick="sellItem('${item.id}')">1個売る</button>
            </div>
          </div>
        `;
      }
    }
  });

  if (count === 0) {
    html = `<div style="text-align:center; color:var(--text-sub); padding:10px;">売却可能な道具がありません</div>`;
  }

  list.innerHTML = html;
}

function sellItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item || !gameState.inventory.items[itemId]) return;

  const sellPrice = Math.floor(item.price * 0.5);
  gameState.inventory.items[itemId]--;
  gameState.stats.gold += sellPrice;

  saveGame();
  renderSellItemsUI();
  showToast(`💰 ${item.name} を ${sellPrice}円 で売却しました`);
}

let sellEquipFilterSlot = 'all';

function filterSellEquips(slot) {
  sellEquipFilterSlot = slot;
  const tabs = document.querySelectorAll("#sell-equip-tabs .tab-btn");
  tabs.forEach(t => t.classList.remove("active"));
  if (window.event && window.event.target && window.event.target.classList) {
    window.event.target.classList.add("active");
  }
  renderSellEquipsUI();
}

function renderSellEquipsUI() {
  const list = document.getElementById("sell-equip-list");
  let equips = gameState.inventory.equips;

  if (sellEquipFilterSlot !== 'all') {
    equips = equips.filter(e => e.slot === sellEquipFilterSlot);
  }

  if (equips.length === 0) {
    list.innerHTML = `<div style="text-align:center; color:var(--text-sub); padding:10px;">売却可能な装備がありません</div>`;
    return;
  }

  list.innerHTML = equips.map(eq => {
    const sellPrice = Math.floor(eq.price * 0.5) + (eq.lv - 1) * 100;
    return `
      <div class="list-card">
        <div class="list-card-main">
          <div class="list-card-left">
            <div class="list-icon">${eq.icon}</div>
            <div class="list-details">
              <div class="list-title"><span class="rarity-${eq.rarity}">[${eq.rarity}]</span> ${eq.name} (Lv.${eq.lv})</div>
              <div class="list-meta">売却価格: <b>${sellPrice}円</b></div>
            </div>
          </div>
          <button class="btn btn-red" style="font-size:0.75rem;" onclick="sellEquip('${eq.instId}')">売る</button>
        </div>
      </div>
    `;
  }).join("");
}

function sellEquip(instId) {
  const idx = gameState.inventory.equips.findIndex(e => e.instId === instId);
  if (idx === -1) return;

  const eq = gameState.inventory.equips[idx];
  const sellPrice = Math.floor(eq.price * 0.5) + (eq.lv - 1) * 100;

  gameState.inventory.equips.splice(idx, 1);
  gameState.stats.gold += sellPrice;

  saveGame();
  renderSellEquipsUI();
  showToast(`💰 ${eq.name} を ${sellPrice}円 で売却しました`);
}

/* ==========================================================================
   GACHA
   ========================================================================== */

function playGacha() {
  const today = getTodayString();
  if (gameState.stats.lastGachaDate === today) {
    showToast("ガチャは1日1回までです");
    return;
  }

  gameState.stats.lastGachaDate = today;

  const rand = Math.random() * 100;
  let selectedRarity = "N";
  if (rand < 2) selectedRarity = "UR";
  else if (rand < 10) selectedRarity = "SSR";
  else if (rand < 30) selectedRarity = "SR";
  else if (rand < 60) selectedRarity = "R";

  const pool = SHOP_EQUIPS.filter(e => e.rarity === selectedRarity);
  const winMaster = pool[Math.floor(Math.random() * pool.length)] || SHOP_EQUIPS[0];

  const newEquip = addEquipToInventory(winMaster.id);
  saveGame();
  updateHomeUI();

  playSE('win');
  openModal(`
    <div style="text-align:center; padding:10px;">
      <h2 style="color:var(--accent-gold); margin-bottom:10px;">🎰 ガチャ結果</h2>
      <div style="font-size:4rem; margin:10px 0;">${winMaster.icon}</div>
      <div style="font-size:1.1rem; font-weight:bold;" class="rarity-${winMaster.rarity}">[${winMaster.rarity}] ${winMaster.name}</div>
      <p style="font-size:0.8rem; color:var(--text-sub); margin-top:6px;">獲得した装備は更衣室で確認・装着できます。</p>
      <button class="btn btn-gold" style="width:100%; margin-top:12px;" onclick="closeModal()">閉じる</button>
    </div>
  `);
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

window.addEventListener("DOMContentLoaded", () => {
  loadGame();
  openScreen("screen-home");
});