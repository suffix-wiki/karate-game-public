/* ==========================================================================
   SHOPS (ITEM & EQUIP)
   ========================================================================== */

function renderItemShopUI() {
  const list = document.getElementById("item-shop-list");
  list.innerHTML = SHOP_ITEMS.map(item => `
    <div class="list-card transaction-card">
      <div class="list-card-main">
        <div class="list-card-left">
          <div class="list-icon">${item.icon}</div>
          <div class="list-details transaction-details">
            <div class="list-title">${item.name}</div>
            <div class="list-meta">${item.desc}</div>
            <div class="list-meta">単価: ${formatGold(item.price)}円</div>
            <div class="list-meta transaction-total">合計: <b id="buy-total-${item.id}">${formatGold(item.price)}</b>円</div>
          </div>
        </div>
        <div class="transaction-controls">
          <input type="text" inputmode="numeric" pattern="[0-9]*" id="buy-qty-${item.id}" value="1" min="1" max="99" class="qty-input" aria-label="${item.name}の購入数" oninput="updateItemTotalPrice('${item.id}')" onblur="normalizeQuantityInput(this, 1, 99); updateItemTotalPrice('${item.id}')">
          <button class="btn btn-gold" style="font-size:0.75rem;" onclick="buyItem('${item.id}')">購入</button>
        </div>
      </div>
    </div>
  `).join("");
}

function updateItemTotalPrice(itemId) {
  const item = SHOP_ITEMS.find(entry => entry.id === itemId);
  const qtyInput = document.getElementById(`buy-qty-${itemId}`);
  const total = document.getElementById(`buy-total-${itemId}`);
  if (!item || !qtyInput || !total) return;

  const qty = getQuantityInputValue(qtyInput, 1, 99);
  if (qty === null) {
    total.innerText = "—";
    return;
  }
  total.innerText = formatGold(item.price * qty);
}

function buyItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  if (!item) return;

  const qtyInput = document.getElementById(`buy-qty-${itemId}`);
  if (!qtyInput) return;
  const qty = normalizeQuantityInput(qtyInput, 1, 99);
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
let equipShopFilterRarity = 'all';

function filterEquipShop(slot) {
  if (slot) equipShopFilterSlot = slot;
  equipShopFilterRarity = document.getElementById("equip-shop-rarity-filter").value;
  const tabs = document.querySelectorAll("#equip-shop-tabs .tab-btn");
  tabs.forEach(tab => tab.classList.toggle("active", tab.getAttribute("onclick")?.includes(`'${equipShopFilterSlot}'`)));
  renderEquipShopUI();
}

function renderEquipShopUI() {
  const list = document.getElementById("equip-shop-list");
  const equips = SHOP_EQUIPS.filter(equip =>
    (equipShopFilterSlot === 'all' || equip.slot === equipShopFilterSlot) &&
    (equipShopFilterRarity === 'all' || equip.rarity === equipShopFilterRarity)
  );

  list.innerHTML = equips.map(eq => `
    <div class="list-card transaction-card">
      <div class="list-card-main">
        <div class="list-card-left">
          <div class="list-icon">${eq.icon}</div>
          <div class="list-details transaction-details">
            <div class="list-title"><span class="rarity-${eq.rarity}">[${eq.rarity}]</span> ${eq.name}</div>
            <div class="list-meta">部位:${eq.slot} / HP+${eq.hp} / 攻+${eq.atk} / 防+${eq.def} / <b>単価: ${formatGold(eq.price)}円</b></div>
            <div class="list-meta transaction-total">合計金額: <span id="equip-total-${eq.id}">${formatGold(eq.price)}</span>円</div>
          </div>
        </div>
        <div class="transaction-controls">
          <input type="text" inputmode="numeric" pattern="[0-9]*" id="buy-equip-qty-${eq.id}" value="1" min="1" max="99" class="qty-input" aria-label="${eq.name}の購入数" oninput="updateEquipTotalPrice('${eq.id}', ${eq.price})" onblur="normalizeQuantityInput(this, 1, 99); updateEquipTotalPrice('${eq.id}', ${eq.price})">
          <button class="btn btn-gold" style="font-size:0.75rem;" onclick="buyEquip('${eq.id}')">購入</button>
        </div>
      </div>
    </div>
  `).join("");
}

function updateEquipTotalPrice(equipId, unitPrice) {
  const qtyInput = document.getElementById(`buy-equip-qty-${equipId}`);
  const totalSpan = document.getElementById(`equip-total-${equipId}`);
  if (!qtyInput || !totalSpan) return;

  const qty = getQuantityInputValue(qtyInput, 1, 99);
  if (qty === null) {
    totalSpan.innerText = "—";
    return;
  }
  totalSpan.innerText = formatGold(unitPrice * qty);
}

function buyEquip(equipId) {
  const master = SHOP_EQUIPS.find(e => e.id === equipId);
  if (!master) return;

  const qtyInput = document.getElementById(`buy-equip-qty-${equipId}`);
  if (!qtyInput) return;
  const qty = normalizeQuantityInput(qtyInput, 1, 99);
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
