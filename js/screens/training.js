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
  const week = getCurrentWeekString();
  if (!gameState.adminOverrides.unlimitedUses && gameState.stats.lastDojoWeek === week) {
    updateHomeUI();
    showToast("道場稽古は週1回までです");
    return;
  }
  recordDojoTrainingStreak();
  gameState.stats.lastDojoWeek = week;
  gameState.stats.lastDojoDate = getTodayString();
  gameState.stats.dojoCount++;
  const gainedExp = 200;
  addExp(gainedExp);
  playSE('win');
  showToast(`🥋 道場稽古完了！ 経験値 +${gainedExp} 獲得！`);
  checkMissionProgress();
}

function doSelfTraining() {
  const month = getCurrentMonthString();
  if (!gameState.adminOverrides.unlimitedUses && gameState.stats.lastSelfMonth === month) {
    updateHomeUI();
    showToast("自主稽古は月1回までです");
    return;
  }
  gameState.stats.lastSelfMonth = month;
  gameState.stats.lastSelfDate = getTodayString();
  gameState.stats.selfCount++;
  const gainedExp = 100;
  addExp(gainedExp);
  playSE('win');
  showToast(`🔥 自主稽古完了！ 経験値 +${gainedExp} 獲得！`);
  checkMissionProgress();
}
