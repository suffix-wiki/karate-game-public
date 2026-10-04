/* ==========================================================================
   STAGES & ENEMIES
   ========================================================================== */

function renderStagesUI() {
  const list = document.getElementById("stage-list");
  list.innerHTML = STAGES_MASTER.map((s, index) => {
    const unlocked = isStageUnlocked(index);
    return `
    <div class="list-card ${unlocked ? "" : "stage-locked"}" ${unlocked ? `onclick="selectStage('${s.id}')"` : 'aria-disabled="true"'} style="cursor:${unlocked ? "pointer" : "not-allowed"};">
      <div class="list-card-main">
        <div class="list-card-left">
          <div class="list-icon">${s.icon}</div>
          <div class="list-details">
            <div class="list-title">${s.name}</div>
            <div class="list-meta" style="color:var(--accent-gold);">${s.stars}</div>
            <div class="list-meta">推奨Lv.${s.recommendedLv}（装備なし）</div>
            <div class="list-meta">影を祓った相手：${s.enemies.filter((_, index) => isEnemyCleared(s.id, index)).length}/${s.enemies.length}</div>
            ${unlocked ? "" : `<div class="list-meta">🔒 ${STAGES_MASTER[index - 1].name}のボスを倒すと解放</div>`}
          </div>
        </div>
        <div style="font-size:0.8rem; color:var(--text-sub);">${unlocked ? "対戦可能 ➔" : "ロック中"}</div>
      </div>
    </div>
  `;
  }).join("");
}

function selectStage(stageId) {
  const stg = STAGES_MASTER.find(s => s.id === stageId);
  if (!stg) return;
  const stageIndex = STAGES_MASTER.findIndex(stage => stage.id === stageId);
  if (!isStageUnlocked(stageIndex)) {
    showToast(`${STAGES_MASTER[stageIndex - 1].name}のボスを倒すと解放されます`);
    return;
  }

  const showEnemies = () => renderStageEnemies(stg);
  const storyId = `stage-${stg.id}`;
  if (!isStoryEventSeen(storyId)) {
    playStoryEvent(storyId, showEnemies);
    return;
  }
  showEnemies();
}

function renderStageEnemies(stg) {
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
            ${isEnemyCleared(stg.id, idx) ? '<div class="list-meta" style="color:var(--accent-green);">✓ 影を祓った</div>' : ''}
          </div>
        </div>
        <button class="btn btn-gold" style="font-size:0.75rem;">勝負！</button>
      </div>
    </div>
  `).join("");

  openScreen("screen-enemies", {
    bgm: getStageSelectionBgm(stg.id)
  });
}
