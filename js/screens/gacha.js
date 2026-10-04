/* ==========================================================================
   GACHA
   ========================================================================== */

function playGacha() {
  const today = getTodayString();
  if (!gameState.adminOverrides.unlimitedUses && gameState.stats.lastGachaDate === today) {
    showToast("ガチャは1日1回までです");
    return;
  }

  const guaranteedEquipId = gameState.adminOverrides.guaranteedGachaEquipId;
  const guaranteedEquip = guaranteedEquipId
    ? SHOP_EQUIPS.find(equip => equip.id === guaranteedEquipId)
    : null;
  if (guaranteedEquipId && !guaranteedEquip) {
    console.error(`指定されたガチャアイテムが見つかりません: ${guaranteedEquipId}`);
    showToast("指定されたガチャアイテムが見つからないため、ガチャを実行できません");
    return;
  }

  let winMaster = guaranteedEquip;
  if (!winMaster) {
    const rand = Math.random() * 100;
    let selectedRarity = "N";
    if (rand < 2) selectedRarity = "UR";
    else if (rand < 10) selectedRarity = "SSR";
    else if (rand < 30) selectedRarity = "SR";
    else if (rand < 60) selectedRarity = "R";

    const pool = SHOP_EQUIPS.filter(e => e.rarity === selectedRarity);
    winMaster = pool[Math.floor(Math.random() * pool.length)] || SHOP_EQUIPS[0];
  }

  gameState.stats.lastGachaDate = today;
  const newEquip = addEquipToInventory(winMaster.id);
  if (!newEquip) {
    console.error(`ガチャ景品をインベントリに追加できませんでした: ${winMaster.id}`);
    showToast("ガチャ景品を追加できなかったため、ガチャ結果を保存できませんでした");
    return;
  }
  if (guaranteedEquip) gameState.adminOverrides.guaranteedGachaEquipId = "";
  saveGame();
  updateHomeUI();

  const rarityClass = `gacha-result-${winMaster.rarity || "N"}`;
  const rarityLabel = winMaster.rarity || "N";
  if (rarityLabel === "UR" || rarityLabel === "SSR") {
    playGachaRaritySE(rarityLabel);
  } else {
    playSE('win');
  }
  openModal(`
    <div class="gacha-result ${rarityClass}">
      <h2>🎰 ガチャ結果</h2>
      <div class="gacha-result-rarity">${rarityLabel}</div>
      <div class="gacha-result-icon">${winMaster.icon}</div>
      <div class="gacha-result-name">[${rarityLabel}] ${winMaster.name}</div>
      <p>獲得した装備は更衣室で確認・装着できます。</p>
      <button class="btn btn-gold" style="width:100%; margin-top:12px;" onclick="closeModal()">閉じる</button>
    </div>
  `);
}
