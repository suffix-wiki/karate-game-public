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
          <div class="list-card transaction-card">
            <div class="list-card-main">
              <div class="list-card-left">
                <div class="list-icon">${item.icon}</div>
                <div class="list-details transaction-details">
                  <div class="list-title">${item.name} (所持:${qty})</div>
                  <div class="list-meta">単価: ${formatGold(sellPrice)}円</div>
                  <div class="list-meta transaction-total">合計: <b id="sell-total-${item.id}">${formatGold(sellPrice)}</b>円</div>
                </div>
              </div>
              <div class="transaction-controls">
                <input type="number" id="sell-qty-${item.id}" value="1" min="1" max="${qty}" class="qty-input" aria-label="${item.name}の売却数" oninput="updateSellItemTotalPrice('${item.id}')">
                <button class="btn btn-red" style="font-size:0.75rem;" onclick="sellItem('${item.id}')">売却</button>
              </div>
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

function updateSellItemTotalPrice(itemId) {
  const item = SHOP_ITEMS.find(entry => entry.id === itemId);
  const qtyInput = document.getElementById(`sell-qty-${itemId}`);
  const total = document.getElementById(`sell-total-${itemId}`);
  if (!item || !qtyInput || !total) return;

  const owned = gameState.inventory.items[itemId] || 0;
  const qty = Math.min(owned, Math.max(1, parseInt(qtyInput.value, 10) || 1));
  qtyInput.value = qty;
  total.innerText = formatGold(Math.floor(item.price * 0.5) * qty);
}

function sellItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  const owned = gameState.inventory.items[itemId] || 0;
  const qtyInput = document.getElementById(`sell-qty-${itemId}`);
  if (!item || owned <= 0 || !qtyInput) return;

  const qty = Math.min(owned, Math.max(1, parseInt(qtyInput.value, 10) || 1));
  const sellPrice = Math.floor(item.price * 0.5) * qty;
  gameState.inventory.items[itemId] -= qty;
  gameState.stats.gold += sellPrice;

  saveGame();
  renderSellItemsUI();
  showToast(`💰 ${item.name} x${qty} を ${formatGold(sellPrice)}円 で売却しました`);
}

let sellEquipFilterSlot = 'all';
let sellEquipFilterRarity = 'all';

function filterSellEquips(slot) {
  sellEquipFilterSlot = document.getElementById("sell-equip-filter-slot").value;
  sellEquipFilterRarity = document.getElementById("sell-equip-filter-rarity").value;
  renderSellEquipsUI();
}

function renderSellEquipsUI() {
  const list = document.getElementById("sell-equip-list");
  const filters = document.getElementById("sell-equip-filters");
  if (filters) {
    filters.innerHTML = getEquipFilterMarkup(
      "sell-equip-filter",
      sellEquipFilterSlot,
      sellEquipFilterRarity,
      "filterSellEquips"
    );
  }
  const equips = gameState.inventory.equips.filter(equip =>
    (sellEquipFilterSlot === 'all' || equip.slot === sellEquipFilterSlot) &&
    (sellEquipFilterRarity === 'all' || equip.rarity === sellEquipFilterRarity)
  );

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
              <div class="list-title">${getEquipProgressMarkup(eq)} ${eq.icon} ${eq.name} (Lv.${eq.lv}/${eq.maxLv})</div>
              <div class="list-meta">売却価格: <b>${formatGold(sellPrice)}円</b></div>
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
  const warningReasons = getEquipmentWarningReasons(eq);
  if (warningReasons.length > 0 && !confirm(
    `【装備売却の確認】\n${eq.name} (${warningReasons.join("・")}) を売却します。\n売却後は装備を復元できません。続けますか？`
  )) return;

  const sellPrice = Math.floor(eq.price * 0.5) + (eq.lv - 1) * 100;

  gameState.inventory.equips.splice(idx, 1);
  gameState.stats.gold += sellPrice;

  saveGame();
  renderSellEquipsUI();
  showToast(`💰 ${eq.name} を ${formatGold(sellPrice)}円 で売却しました`);
}
