/* ==========================================================================
   FITTING (EQUIPMENT)
   ========================================================================== */

let selectedFittingMember = 'hero';
let fittingFilterSlot = 'all';
let fittingFilterRarity = 'all';

function renderFittingUI() {
  document.getElementById("fitting-filters").innerHTML = getEquipFilterMarkup(
    "fitting-filter",
    fittingFilterSlot,
    fittingFilterRarity,
    "filterFitting"
  );
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
          ${item ? `${getEquipProgressMarkup(item)} ${item.icon} ${item.name} (Lv.${item.lv})` : '<span style="color:var(--text-sub);">なし</span>'}
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

function filterFitting() {
  fittingFilterSlot = document.getElementById("fitting-filter-slot").value;
  fittingFilterRarity = document.getElementById("fitting-filter-rarity").value;
  renderFittingList();
}

function renderFittingList() {
  const list = document.getElementById("fitting-list");
  let equips = gameState.inventory.equips;

  equips = equips.filter(e =>
    (fittingFilterSlot === 'all' || e.slot === fittingFilterSlot) &&
    (fittingFilterRarity === 'all' || e.rarity === fittingFilterRarity)
  );

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
            <div class="list-title">${getEquipProgressMarkup(eq)} ${eq.icon} ${eq.name} (Lv.${eq.lv}/${eq.maxLv})</div>
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
