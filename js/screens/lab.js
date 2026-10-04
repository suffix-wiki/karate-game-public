/* ==========================================================================
   LAB (UPGRADE & COMBINE)
   ========================================================================== */

let upgradeFilterSlot = "all";
let upgradeFilterRarity = "all";
let combineBaseFilterSlot = "all";
let combineBaseFilterRarity = "all";
let combineMaterialFilterSlot = "all";
let combineMaterialFilterRarity = "all";

function getAllEquipmentEntries() {
  const entries = gameState.inventory.equips.map(equip => ({ equip, owner: "所持" }));
  Object.entries(gameState.equipped).forEach(([slot, equip]) => {
    if (equip) entries.push({ equip, owner: gameState.char.name, slot });
  });
  gameState.companions.forEach(companion => {
    Object.entries(companion.equipped || {}).forEach(([slot, equip]) => {
      if (equip) entries.push({ equip, owner: companion.name, slot });
    });
  });
  return entries;
}

function removeEquipmentById(instId) {
  gameState.inventory.equips = gameState.inventory.equips.filter(equip => equip.instId !== instId);
  [gameState.equipped, ...gameState.companions.map(companion => companion.equipped || {})].forEach(slots => {
    Object.keys(slots).forEach(slot => {
      if (slots[slot]?.instId === instId) slots[slot] = null;
    });
  });
}

function renderLabUpgradeUI() {
  const list = document.getElementById("upgrade-equip-list");
  const filterContainer = document.getElementById("upgrade-equip-filters");
  if (filterContainer) {
    filterContainer.innerHTML = getEquipFilterMarkup("upgrade-filter", upgradeFilterSlot, upgradeFilterRarity, "filterLabUpgradeEquips");
  }
  const equips = getAllEquipmentEntries().filter(({ equip: eq }) =>
    (upgradeFilterSlot === "all" || eq.slot === upgradeFilterSlot) &&
    (upgradeFilterRarity === "all" || eq.rarity === upgradeFilterRarity)
  );

  if (equips.length === 0) {
    list.innerHTML = `<div style="text-align:center; color:var(--text-sub); padding:10px;">${getAllEquipmentEntries().length ? "条件に合う装備がありません" : "強化可能な装備がありません"}</div>`;
    return;
  }

  list.innerHTML = equips.map(({ equip: eq, owner }) => `
    <div class="list-card upgrade-card">
      <div class="list-card-main">
        <div class="list-card-left">
          <div class="list-icon">${eq.icon}</div>
          <div class="list-details">
            <div class="list-title">${getEquipProgressMarkup(eq)} ${eq.icon} ${eq.name} (Lv.${eq.lv}/${eq.maxLv})</div>
            <div class="list-meta">${owner === "所持" ? "所持品" : `${owner}が装備中`} / 1Lvあたり${formatGold(300)}円</div>
            <div class="list-meta upgrade-total">必要金額: <b id="upgrade-total-${eq.instId}">${formatGold(eq.lv < eq.maxLv ? 300 : 0)}</b>円</div>
          </div>
        </div>
        <div class="upgrade-controls">
          <input type="text" inputmode="numeric" pattern="[0-9]*" id="upgrade-qty-${eq.instId}" class="qty-input" value="${eq.lv < eq.maxLv ? 1 : 0}" min="${eq.lv < eq.maxLv ? 1 : 0}" max="${Math.max(0, eq.maxLv - eq.lv)}" aria-label="${eq.name}の強化レベル数" ${eq.lv >= eq.maxLv ? 'disabled' : ''} oninput="updateUpgradeTotalPrice('${eq.instId}')" onblur="normalizeQuantityInput(this, 1, ${Math.max(1, eq.maxLv - eq.lv)}); updateUpgradeTotalPrice('${eq.instId}')">
          <button class="btn btn-gold" style="font-size:0.75rem;" onclick="upgradeEquipItem('${eq.instId}')" ${eq.lv >= eq.maxLv ? 'disabled' : ''}>強化</button>
        </div>
      </div>
    </div>
  `).join("");
}

function filterLabUpgradeEquips() {
  upgradeFilterSlot = document.getElementById("upgrade-filter-slot").value;
  upgradeFilterRarity = document.getElementById("upgrade-filter-rarity").value;
  renderLabUpgradeUI();
}

function updateUpgradeTotalPrice(instId) {
  const eq = getAllEquipmentEntries().find(entry => entry.equip.instId === instId)?.equip;
  const qtyInput = document.getElementById(`upgrade-qty-${instId}`);
  const total = document.getElementById(`upgrade-total-${instId}`);
  if (!eq || !qtyInput || !total) return;

  const maxLevels = Math.max(0, eq.maxLv - eq.lv);
  qtyInput.min = maxLevels === 0 ? 0 : 1;
  qtyInput.max = maxLevels;
  if (maxLevels === 0) {
    total.innerText = formatGold(0);
    return;
  }
  const levels = getQuantityInputValue(qtyInput, 1, maxLevels);
  if (levels === null) {
    total.innerText = "—";
    return;
  }
  total.innerText = formatGold(levels * 300);
}

function upgradeEquipItem(instId) {
  const eq = getAllEquipmentEntries().find(entry => entry.equip.instId === instId)?.equip;
  if (!eq) return;

  if (eq.lv >= eq.maxLv) {
    showToast("これ以上レベルを上げられません（限界突破が必要）");
    return;
  }

  const qtyInput = document.getElementById(`upgrade-qty-${instId}`);
  const maxLevels = eq.maxLv - eq.lv;
  if (!qtyInput) return;
  const levels = normalizeQuantityInput(qtyInput, 1, maxLevels);
  const cost = levels * 300;
  if (gameState.stats.gold < cost) {
    showToast("お金が足りません");
    return;
  }

  gameState.stats.gold -= cost;
  eq.lv += levels;
  saveGame();
  renderLabUpgradeUI();
  showToast(`✨ ${eq.name} が Lv.${eq.lv} に上がりました！（${formatGold(cost)}円）`);
}

let combineBase = null;
let combineMaterials = [];

function renderLabCombineUI() {
  const baseOwner = combineBase && getAllEquipmentEntries().find(entry => entry.equip.instId === combineBase.instId)?.owner;
  document.getElementById("combine-base-display").innerText = combineBase ? `${combineBase.icon} ${combineBase.name} (Lv.${combineBase.lv}/${combineBase.maxLv}) / ${baseOwner || "装備"}` : "未選択";
  document.getElementById("combine-material-display").innerText = combineMaterials.length > 0
    ? `${combineMaterials.map(m => m.name).join(", ")} (${combineMaterials.length}個)`
    : "未選択";
}

function openSelectCombineBaseModal() {
  const list = getAllEquipmentEntries().filter(({ equip: eq }) =>
    (combineBaseFilterSlot === "all" || eq.slot === combineBaseFilterSlot) &&
    (combineBaseFilterRarity === "all" || eq.rarity === combineBaseFilterRarity)
  );
  let html = `<div class="card-title">① ベース装備を選択</div>${getEquipFilterMarkup("combine-base-filter", combineBaseFilterSlot, combineBaseFilterRarity, "filterCombineBaseOptions")}<div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">`;

  list.forEach(({ equip: eq, owner }) => {
    html += `
      <button class="btn" style="text-align:left;" onclick="setCombineBase('${eq.instId}')">
        ${getEquipProgressMarkup(eq)} ${eq.icon} ${eq.name} (Lv.${eq.lv}/${eq.maxLv}) / ${owner}
      </button>
    `;
  });

  if (list.length === 0) html += `<div style="text-align:center; color:var(--text-sub); padding:10px;">条件に合う装備がありません</div>`;

  html += `</div><button class="btn btn-red" onclick="closeModal()" style="margin-top:8px;">キャンセル</button>`;
  openModal(html);
}

function filterCombineBaseOptions() {
  combineBaseFilterSlot = document.getElementById("combine-base-filter-slot").value;
  combineBaseFilterRarity = document.getElementById("combine-base-filter-rarity").value;
  openSelectCombineBaseModal();
}

function setCombineBase(instId) {
  combineBase = getAllEquipmentEntries().find(entry => entry.equip.instId === instId)?.equip || null;
  combineMaterials = [];
  closeModal();
  renderLabCombineUI();
}

function openSelectCombineMaterialModal() {
  if (!combineBase) {
    showToast("先にベース装備を選択してください");
    return;
  }

  const maxMaterials = Math.max(0, 5 - (combineBase.combineCount || 0));
  const allMaterials = getAllEquipmentEntries().filter(({ equip }) =>
    equip.masterId === combineBase.masterId && equip.instId !== combineBase.instId
  );
  const available = allMaterials.filter(({ equip }) =>
    (combineMaterialFilterSlot === "all" || equip.slot === combineMaterialFilterSlot) &&
    (combineMaterialFilterRarity === "all" || equip.rarity === combineMaterialFilterRarity)
  );
  let html = `<div class="card-title">② 素材装備を選択 (${combineMaterials.length}/${maxMaterials})</div>${getEquipFilterMarkup("combine-material-filter", combineMaterialFilterSlot, combineMaterialFilterRarity, "filterCombineMaterialOptions")}<div style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;">`;

  if (maxMaterials === 0) {
    html += `<div style="text-align:center; color:var(--text-sub); padding:10px;">この装備は合成上限に達しています</div>`;
  } else if (allMaterials.length === 0) {
    html += `<div style="text-align:center; color:var(--text-sub); padding:10px;">同じ装備の予備がありません</div>`;
  } else if (available.length === 0) {
    html += `<div style="text-align:center; color:var(--text-sub); padding:10px;">部位・レア度の条件に合う素材がありません</div>`;
  } else {
    available.forEach(({ equip: eq, owner }) => {
      const isSelected = combineMaterials.some(m => m.instId === eq.instId);
      const disabled = !isSelected && combineMaterials.length >= maxMaterials;
      html += `
        <button class="btn ${isSelected ? 'btn-green' : ''}" style="text-align:left;" onclick="toggleCombineMaterial('${eq.instId}')" ${disabled ? 'disabled' : ''}>
          ${isSelected ? '✓ ' : ''}${getEquipProgressMarkup(eq)} ${eq.icon} ${eq.name} (Lv.${eq.lv}) / ${owner}
        </button>
      `;
    });
  }

  html += `</div><button class="btn btn-gold" onclick="closeModal()" style="margin-top:8px;">決定</button>`;
  openModal(html);
}

function filterCombineMaterialOptions() {
  combineMaterialFilterSlot = document.getElementById("combine-material-filter-slot").value;
  combineMaterialFilterRarity = document.getElementById("combine-material-filter-rarity").value;
  openSelectCombineMaterialModal();
}

function toggleCombineMaterial(instId) {
  const idx = combineMaterials.findIndex(m => m.instId === instId);
  if (idx >= 0) {
    combineMaterials.splice(idx, 1);
  } else {
    const maxMaterials = combineBase ? Math.max(0, 5 - (combineBase.combineCount || 0)) : 0;
    if (combineMaterials.length >= maxMaterials) {
      showToast(`素材は最大${maxMaterials}個まで選択できます`);
      return;
    }
    const item = getAllEquipmentEntries().find(entry => entry.equip.instId === instId)?.equip;
    if (item && combineBase && item.masterId === combineBase.masterId && item.instId !== combineBase.instId) {
      combineMaterials.push(item);
    }
  }
  renderLabCombineUI();
  openSelectCombineMaterialModal();
}

function executeCombine() {
  if (!combineBase || combineMaterials.length === 0) {
    showToast("ベースと素材を正しく選択してください");
    return;
  }

  const maxMaterials = Math.max(0, 5 - (combineBase.combineCount || 0));
  if (maxMaterials === 0) {
    showToast("限界突破上限(5回)に達しています");
    return;
  }

  if (combineMaterials.length > maxMaterials) {
    showToast(`素材は最大${maxMaterials}個まで選択できます`);
    return;
  }

  const currentEquipmentIds = new Set(getAllEquipmentEntries().map(({ equip }) => equip.instId));
  if (!currentEquipmentIds.has(combineBase.instId) || combineMaterials.some(item => !currentEquipmentIds.has(item.instId))) {
    showToast("装備状態が変わりました。選択し直してください");
    combineBase = null;
    combineMaterials = [];
    renderLabCombineUI();
    return;
  }

  const valuableMaterials = combineMaterials.filter(material => getEquipmentWarningReasons(material).length > 0);
  if (valuableMaterials.length > 0) {
    const materialSummary = valuableMaterials.map(material =>
      `・${material.name} (Lv.${material.lv}, ${getEquipmentWarningReasons(material).join("・")})`
    ).join("\n");
    if (!confirm(
      `【合成素材の確認】\n以下の装備は合成後に消失し、レベルや合成回数も引き継がれません。\n${materialSummary}\nこの素材で合成を続けますか？`
    )) return;
  }

  const addCount = combineMaterials.length;
  combineBase.combineCount = combineBase.combineCount || 0;
  combineBase.combineCount += addCount;
  combineBase.maxLv += addCount * 5;

  combineMaterials.forEach(material => removeEquipmentById(material.instId));

  combineBase = null;
  combineMaterials = [];

  saveGame();
  renderLabCombineUI();
  showToast(`🧬 合成完了！ 最大Lvが引き上げられました！`);
}
