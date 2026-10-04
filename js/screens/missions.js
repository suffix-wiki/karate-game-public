const MISSIONS_MASTER = [
  {
    id: "first-dojo",
    title: "道場稽古を始めよう",
    description: "道場稽古を1回行う",
    objective: "dojoCount",
    target: 1,
    reward: { type: "item", id: "i2", quantity: 2 }
  },
  {
    id: "dojo-streak-4",
    title: "稽古を4週続けよう",
    description: "道場稽古を4週連続で行う",
    objective: "bestDojoStreak",
    target: 4,
    reward: { type: "equip", id: "e_a2" }
  },
  {
    id: "dojo-streak-12",
    title: "黒帯への道",
    description: "道場稽古を12週連続で行う",
    objective: "bestDojoStreak",
    target: 12,
    reward: { type: "equip", id: "e_b5" }
  },
  {
    id: "dojo-streak-8",
    title: "稽古の習慣を育てよう",
    description: "道場稽古を8週連続で行う",
    objective: "bestDojoStreak",
    target: 8,
    reward: { type: "equip", id: "e_h3" }
  },
  {
    id: "dojo-streak-26",
    title: "半年間の精進",
    description: "道場稽古を26週連続で行う",
    objective: "bestDojoStreak",
    target: 26,
    reward: { type: "equip", id: "e_w3" }
  },
  {
    id: "dojo-streak-52",
    title: "一年皆勤の達人",
    description: "道場稽古を52週連続で行う",
    objective: "bestDojoStreak",
    target: 52,
    reward: { type: "equip", id: "e_a5" }
  },
  {
    id: "dojo-count-5",
    title: "道場に通おう",
    description: "道場稽古を合計5回行う",
    objective: "dojoCount",
    target: 5,
    reward: { type: "item", id: "i2", quantity: 5 }
  },
  {
    id: "dojo-count-10",
    title: "稽古十回達成",
    description: "道場稽古を合計10回行う",
    objective: "dojoCount",
    target: 10,
    reward: { type: "equip", id: "e_h4" }
  },
  {
    id: "dojo-count-25",
    title: "道場の顔",
    description: "道場稽古を合計25回行う",
    objective: "dojoCount",
    target: 25,
    reward: { type: "item", id: "i6", quantity: 5 }
  },
  {
    id: "dojo-count-50",
    title: "五十回の積み重ね",
    description: "道場稽古を合計50回行う",
    objective: "dojoCount",
    target: 50,
    reward: { type: "equip", id: "e_b5" }
  },
  {
    id: "self-count-1",
    title: "自主稽古デビュー",
    description: "自主稽古を1回行う",
    objective: "selfCount",
    target: 1,
    reward: { type: "item", id: "i3", quantity: 3 }
  },
  {
    id: "self-count-3",
    title: "自分との約束",
    description: "自主稽古を合計3回行う",
    objective: "selfCount",
    target: 3,
    reward: { type: "item", id: "i4", quantity: 3 }
  },
  {
    id: "self-count-6",
    title: "自主稽古を続けよう",
    description: "自主稽古を合計6回行う",
    objective: "selfCount",
    target: 6,
    reward: { type: "equip", id: "e_h3" }
  },
  {
    id: "self-count-12",
    title: "自主稽古十二回",
    description: "自主稽古を合計12回行う",
    objective: "selfCount",
    target: 12,
    reward: { type: "item", id: "i6", quantity: 10 }
  },
  {
    id: "self-count-24",
    title: "鍛錬の積み重ね",
    description: "自主稽古を合計24回行う",
    objective: "selfCount",
    target: 24,
    reward: { type: "equip", id: "e_w3" }
  },
  {
    id: "self-count-50",
    title: "自主稽古の極み",
    description: "自主稽古を合計50回行う",
    objective: "selfCount",
    target: 50,
    reward: { type: "equip", id: "e_a5" }
  },
  {
    id: "sleepy-five",
    title: "睡魔に打ち勝て",
    description: "自宅ステージで睡魔を5回倒す",
    objective: "enemyWins",
    enemyKey: "stage1-0",
    target: 5,
    reward: { type: "equip", id: "e_h4" }
  },
  {
    id: "principal-three",
    title: "校長先生に再挑戦",
    description: "教室ステージで校長先生を3回倒す",
    objective: "enemyWins",
    enemyKey: "stage2-4",
    target: 3,
    reward: { type: "equip", id: "e_w4" }
  }
];

function recordDojoTrainingStreak() {
  const currentWeek = getCurrentWeekString();
  if (gameState.stats.lastDojoWeek === currentWeek) return;

  const previousWeek = new Date();
  previousWeek.setDate(previousWeek.getDate() - 7);
  const previousWeekKey = getWeekStringForDate(previousWeek);
  gameState.stats.dojoStreak = gameState.stats.lastDojoWeek === previousWeekKey
    ? (gameState.stats.dojoStreak || 0) + 1
    : 1;
  gameState.stats.bestDojoStreak = Math.max(
    gameState.stats.bestDojoStreak || 0,
    gameState.stats.dojoStreak
  );
}

function getMissionProgress(mission) {
  if (mission.objective === "dojoCount") return gameState.stats.dojoCount || 0;
  if (mission.objective === "selfCount") return gameState.stats.selfCount || 0;
  if (mission.objective === "bestDojoStreak") return gameState.stats.bestDojoStreak || 0;
  if (mission.objective === "enemyWins") return gameState.progress.enemyWins[mission.enemyKey] || 0;
  return 0;
}

function getActiveDojoStreak() {
  const previousWeek = new Date();
  previousWeek.setDate(previousWeek.getDate() - 7);
  const lastWeek = gameState.stats.lastDojoWeek;
  return lastWeek === getCurrentWeekString() || lastWeek === getWeekStringForDate(previousWeek)
    ? gameState.stats.dojoStreak || 0
    : 0;
}

function getMissionRewardLabel(reward) {
  if (reward.type === "item") {
    const item = SHOP_ITEMS.find(entry => entry.id === reward.id);
    return item ? `${item.icon} ${item.name} ×${reward.quantity || 1}` : "アイテム";
  }
  const equip = SHOP_EQUIPS.find(entry => entry.id === reward.id);
  return equip ? `${equip.icon} ${equip.name}` : "装備";
}

function renderMissionUI() {
  const list = document.getElementById("mission-list");
  if (!list) return;

  const streakSummary = document.getElementById("mission-streak-summary");
  if (streakSummary) {
    streakSummary.textContent = `道場稽古の連続記録：現在 ${getActiveDojoStreak()}週 / 最高 ${gameState.stats.bestDojoStreak || 0}週`;
  }
  const claimed = gameState.progress.claimedMissions;
  list.innerHTML = MISSIONS_MASTER.map(mission => {
    const progress = getMissionProgress(mission);
    const completed = progress >= mission.target;
    const isClaimed = claimed.includes(mission.id);
    const buttonClass = isClaimed ? "is-claimed" : completed ? "is-completed" : "is-in-progress";
    const buttonText = isClaimed ? "受取済み" : completed ? "報酬を受け取る" : "挑戦中";
    return `
      <article class="card mission-card">
        <div>
          <div class="list-title">${mission.title}</div>
          <div class="list-meta">${mission.description}</div>
          <div class="mission-progress">${completed ? "達成！" : "進行度"} ${Math.min(progress, mission.target)}/${mission.target}</div>
          <div class="mission-reward">報酬: ${getMissionRewardLabel(mission.reward)}</div>
        </div>
        <button class="btn mission-action ${buttonClass}" onclick="claimMissionReward('${mission.id}')" ${!completed || isClaimed ? "disabled" : ""}>${buttonText}</button>
      </article>
    `;
  }).join("");
}

function checkMissionProgress() {
  let newlyCompleted = false;
  MISSIONS_MASTER.forEach(mission => {
    if (getMissionProgress(mission) < mission.target ||
        gameState.progress.claimedMissions.includes(mission.id) ||
        gameState.progress.notifiedMissions.includes(mission.id)) return;
    gameState.progress.notifiedMissions.push(mission.id);
    showToast(`🏅 ミッション達成！「${mission.title}」の報酬を受け取ろう`);
    newlyCompleted = true;
  });
  if (newlyCompleted) saveGame();
}

function claimMissionReward(missionId) {
  const mission = MISSIONS_MASTER.find(entry => entry.id === missionId);
  if (!mission || gameState.progress.claimedMissions.includes(missionId)) return;
  if (getMissionProgress(mission) < mission.target) {
    showToast("ミッションの条件を達成していません");
    return;
  }

  const { reward } = mission;
  if (reward.type === "item") {
    if (!SHOP_ITEMS.some(item => item.id === reward.id)) {
      showToast("報酬アイテムが見つかりません");
      return;
    }
    gameState.inventory.items[reward.id] = (gameState.inventory.items[reward.id] || 0) + (reward.quantity || 1);
  } else if (reward.type === "equip") {
    if (!SHOP_EQUIPS.some(equip => equip.id === reward.id)) {
      showToast("報酬装備が見つかりません");
      return;
    }
    addEquipToInventory(reward.id);
  } else {
    showToast("報酬の種類が正しくありません");
    return;
  }

  gameState.progress.claimedMissions.push(missionId);
  saveGame();
  playSE("win");
  showToast(`🎁 ${getMissionRewardLabel(reward)}を獲得しました`);
  renderMissionUI();
}
