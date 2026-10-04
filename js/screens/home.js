/* ==========================================================================
   NAVIGATION
   ========================================================================== */

function openScreen(screenId, options = {}) {
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
  } else {
    btnBack.style.display = "flex";
  }

  if (options.playBgm !== false) {
    const screenBgm = BGM_SETTINGS.screens[screenId] || BGM_SETTINGS.screens["screen-home"];
    const track = options.bgm || (screenId === "screen-battle"
      ? null
      : typeof screenBgm === "string" ? screenBgm : screenBgm.default);
    if (track) startBGM(track);
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
  if (screenId === "screen-story") renderStoryArchive();
  if (screenId === "screen-missions") renderMissionUI();
}

function getStageSelectionBgm(stageId) {
  const stageTracks = BGM_SETTINGS.screens["screen-enemies"];
  return stageTracks[`${stageId}-select`] || stageTracks.default;
}

function goHome() { openScreen("screen-home"); }

let dailyTrainingRefreshTimer = null;

function scheduleDailyTrainingRefresh() {
  clearTimeout(dailyTrainingRefreshTimer);

  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  dailyTrainingRefreshTimer = setTimeout(() => {
    updateHomeUI();
  }, Math.max(0, nextMidnight.getTime() - now.getTime()) + 25);
}

function refreshDailyTrainingAvailability() {
  if (document.visibilityState === "visible") updateHomeUI();
}

document.addEventListener("visibilitychange", refreshDailyTrainingAvailability);
window.addEventListener("focus", refreshDailyTrainingAvailability);
window.addEventListener("pageshow", refreshDailyTrainingAvailability);

function updateHomeUI() {
  if (!document.getElementById("home-avatar")) return;

  const pCount = 1 + gameState.companions.length;
  document.getElementById("home-avatar").innerText = gameState.char.avatar;
  document.getElementById("home-name").innerText = gameState.char.name;
  document.getElementById("home-title").innerText = getTitle(gameState.stats.lv);
  document.getElementById("home-lv").innerText = gameState.stats.lv;
  document.getElementById("home-party-count").innerText = pCount;

  const dojoDisabled = !gameState.adminOverrides.unlimitedUses && gameState.stats.lastDojoWeek === getCurrentWeekString();
  const selfDisabled = !gameState.adminOverrides.unlimitedUses && gameState.stats.lastSelfMonth === getCurrentMonthString();
  const today = getTodayString();
  const gachaDisabled = !gameState.adminOverrides.unlimitedUses && gameState.stats.lastGachaDate === today;

  [
    ["btn-dojo", dojoDisabled],
    ["btn-self", selfDisabled],
    ["btn-gacha", gachaDisabled]
  ].forEach(([id, disabled]) => {
    const button = document.getElementById(id);
    button.classList.toggle("disabled", disabled);
    button.setAttribute("aria-disabled", String(disabled));
  });

  scheduleDailyTrainingRefresh();
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
  const equipped = targetComp ? targetComp.equipped || {} : gameState.equipped;
  const equippedBonusRows = Object.values(equipped).filter(Boolean).map(equip => `
    <div style="padding:3px 0; border-bottom:1px solid var(--border-color);">
      <div>${equip.icon} ${equip.name} (Lv.${equip.lv})</div>
      <div>HP +${equip.hp + (equip.lv - 1) * 5} / 攻 +${equip.atk + (equip.lv - 1) * 3} / 防 +${equip.def + (equip.lv - 1) * 2} / 速 +${equip.spd + (equip.lv - 1) * 2}</div>
    </div>
  `).join("");
  const equipBonus = st.equipBonus;

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
      <div>所持金: ${formatGold(gameState.stats.gold)}円</div>
    </div>
    <div style="margin-top:10px; font-size:0.75rem;">
      <div style="font-weight:bold; color:var(--accent-gold); margin-bottom:4px;">装備補正</div>
      ${equippedBonusRows || '<div style="color:var(--text-sub);">装備なし</div>'}
      <div style="padding-top:5px; font-weight:bold;">合計: HP +${equipBonus.hp} / 攻 +${equipBonus.atk} / 防 +${equipBonus.def} / 速 +${equipBonus.spd}</div>
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
