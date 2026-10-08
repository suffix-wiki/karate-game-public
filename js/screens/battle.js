/* ==========================================================================
   BATTLE ENGINE
   ========================================================================== */

function startBattleWithEnemy(stageId, enemyIdx) {
  const stg = STAGES_MASTER.find(s => s.id === stageId);
  if (!stg) return;
  const masterEnemy = stg.enemies[enemyIdx];
  if (!masterEnemy) return;
  if (gameState.stats.lv < masterEnemy.recommendedLv) {
    showToast(`「${masterEnemy.name}」との勝負はLv.${masterEnemy.recommendedLv}からです`);
    return;
  }
  const finalBoss = stg.id === "stage5" && masterEnemy.name === "自分";
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
    battleAtkBuff: 0,
    battleDefBuff: 0,
    nextDamageMultiplier: 1,
    guardTurns: 0,
    guardHeight: null,
    guardType: null
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
      battleAtkBuff: 0,
      battleDefBuff: 0,
      nextDamageMultiplier: 1,
      guardTurns: 0,
      guardHeight: null,
      guardType: null
    });
  });

  const enemies = [];
  if (finalBoss) {
    const mirrorSkills = SKILLS_MASTER.filter(skill =>
      skill.type === "attack" && gameState.stats.lv >= skill.lv
    );
    const totalHp = party.reduce((total, member) => total + member.maxHp, 0);
    let assignedHp = 0;
    party.forEach((member, index) => {
      const hp = index === party.length - 1
        ? masterEnemy.hp - assignedHp
        : Math.max(1, Math.floor(masterEnemy.hp * member.maxHp / totalHp));
      assignedHp += hp;
      enemies.push({
        id: index,
        name: `${member.name}の影`,
        icon: member.avatar,
        hp,
        maxHp: hp,
        atk: masterEnemy.atk / party.length,
        def: masterEnemy.def / party.length,
        spd: member.spd,
        gold: index === 0 ? masterEnemy.gold : 0,
        pattern: masterEnemy.pattern,
        attackStyle: masterEnemy.attackStyle || "mixed",
        chargeRate: masterEnemy.chargeRate || 0,
        weakTo: masterEnemy.weakTo || null,
        weakHeight: masterEnemy.weakHeight || null,
        chargedAttack: null,
        attackDamageMultiplier: 1,
        isUnique: true,
        isMirror: true,
        mirrorSkills,
        isDefending: false
      });
    });
  }
  let enemyCount = 1;
  if (!finalBoss && !masterEnemy.isUnique) {
    enemyCount = Math.floor(Math.random() * 3) + 1;
  }

  for (let i = 0; !finalBoss && i < enemyCount; i++) {
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
      attackStyle: masterEnemy.attackStyle || "mixed",
      chargeRate: masterEnemy.chargeRate || 0,
      weakTo: masterEnemy.weakTo || null,
      weakHeight: masterEnemy.weakHeight || null,
      chargedAttack: null,
      attackDamageMultiplier: 1,
      isUnique: masterEnemy.isUnique,
      isDefending: false
    });
  }

  currentBattle = {
    stage: stg,
    finalBoss,
    enemyProgressKey: getEnemyProgressKey(stageId, enemyIdx),
    enemies: enemies,
    party: party,
    turnIndex: 0,
    state: 'PLAYER_TURN',
    pendingAction: null,
    targetMode: null
  };

  const battleLog = document.getElementById("battle-log");
  if (battleLog) battleLog.innerHTML = "";

  openScreen("screen-battle");
  const enemyBgm = BGM_SETTINGS.enemies[masterEnemy.name] ||
    (masterEnemy.isUnique ? BGM_SETTINGS.defaultBoss : BGM_SETTINGS.defaultBattle);
  startBGM(enemyBgm);

  const battleBackground = document.getElementById("battle-layer-bg");
  battleBackground.classList.toggle("dojo-arena", stg.id === "stage5");
  battleBackground.style.backgroundImage = `url('${stg.bgImg}')`;
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
    <div class="char-3d-enemy-wrap ${e.hp <= 0 && !e.defeatPending ? 'defeated' : ''}" id="b-enemy-3d-${idx}" onclick="selectBattleTarget('enemy', ${idx})">
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
        </div>
        <div class="bar-group">
          <span class="bar-label label-hp">HP</span>
          <div class="bar-container" style="flex:1;">
            <div class="bar-fill bg-hp" style="width:${hpPct}%;"></div>
          </div>
          <span class="bar-value">${m.hp}/${m.maxHp}</span>
        </div>
        <div class="bar-group">
          <span class="bar-label label-mp">MP</span>
          <div class="bar-container" style="flex:1;">
            <div class="bar-fill bg-mp" style="width:${mpPct}%;"></div>
          </div>
          <span class="bar-value">${m.mp}/${m.maxMp}</span>
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

function getSkillHealAmount(target, skill) {
  const proportionalAmount = Math.ceil(target.maxHp * (skill.hpRate || 0));
  return Math.max(skill.val || 0, proportionalAmount);
}

function showBattleSpriteEffect(targetType, targetIndex, effectType, icon) {
  const targetId = targetType === "party"
    ? `b-party-3d-${targetIndex}`
    : `b-enemy-3d-${targetIndex}`;
  const target = document.getElementById(targetId);
  if (!target) return;

  const animationClass = effectType === "heal"
    ? "anim-heal-member"
    : targetType === "party" ? "anim-hit-member" : "anim-hit-enemy";
  target.classList.remove(animationClass);
  void target.offsetWidth;
  target.classList.add(animationClass);

  const effect = document.createElement("div");
  effect.className = "hit-effect-overlay";
  effect.innerText = icon || (effectType === "heal" ? "✨" : "💥");
  target.appendChild(effect);

  window.setTimeout(() => {
    target.classList.remove(animationClass);
    effect.remove();
  }, effectType === "heal" ? 600 : 500);
}

function triggerBattleDamageFlash() {
  const overlay = document.getElementById("damage-overlay");
  const container = document.getElementById("app-container");

  [overlay, container].forEach((element, index) => {
    if (!element) return;
    const animationClass = index === 0 ? "damage-flash" : "shake-target";
    element.classList.remove(animationClass);
    void element.offsetWidth;
    element.classList.add(animationClass);
    window.setTimeout(() => element.classList.remove(animationClass), 500);
  });
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
        curActor.isDefending = false;
        curActor.defCut = 0;
        curActor.counterMul = 0;
        curActor.guardHeight = null;
        curActor.guardType = null;
      }
    } else {
      curActor.isDefending = false;
      curActor.defCut = 0;
      curActor.counterMul = 0;
      curActor.guardHeight = null;
      curActor.guardType = null;
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
        const attackTag = s.type === "attack"
          ? `<small style="color:var(--text-sub);">[${s.attackType === "foot" ? "足技" : "手技"}・${{ upper: "上段", middle: "中段", lower: "下段" }[s.attackHeight] || "中段"}]</small>`
          : "";
        html += `
          <button class="btn" style="text-align:left; display:flex; justify-content:space-between; align-items:center; opacity:${canUse ? 1 : 0.5}" ${canUse ? `onclick="selectBattleSkill('${s.id}')"` : ''}>
            <span><span class="fav-star" onclick="event.stopPropagation(); toggleFavoriteSkill('${s.id}'); openBattleSubMenu('${type}');">${isFav ? '★' : '☆'}</span>${s.name} ${attackTag} (${s.desc})</span>
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
  startTargeting(item.type.startsWith("debuff_") ? 'enemy' : 'party');
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

const ENEMY_ATTACK_STYLES = {
  upperHand: { heights: { upper: 0.72, middle: 0.23, lower: 0.05 }, types: { hand: 0.86, foot: 0.14 } },
  middleHand: { heights: { upper: 0.12, middle: 0.78, lower: 0.1 }, types: { hand: 0.82, foot: 0.18 } },
  lowerKick: { heights: { upper: 0.08, middle: 0.2, lower: 0.72 }, types: { hand: 0.12, foot: 0.88 } },
  mixed: { heights: { upper: 0.34, middle: 0.38, lower: 0.28 }, types: { hand: 0.52, foot: 0.48 } }
};

function chooseWeightedCombatValue(weights) {
  const entries = Object.entries(weights);
  const totalWeight = entries.reduce((total, [, weight]) => total + weight, 0);
  let roll = Math.random() * totalWeight;
  for (const [value, weight] of entries) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return entries[entries.length - 1][0];
}

function getEnemyAttackMove(enemy) {
  const style = ENEMY_ATTACK_STYLES[enemy.attackStyle] || ENEMY_ATTACK_STYLES.mixed;
  return {
    height: chooseWeightedCombatValue(style.heights),
    type: chooseWeightedCombatValue(style.types)
  };
}

function getAttackAffinity(target, attackType, attackHeight) {
  let multiplier = 1;
  if (target.weakTo && target.weakTo === attackType) multiplier += target.isUnique ? 0.12 : 0.3;
  if (target.weakHeight && target.weakHeight === attackHeight) multiplier += target.isUnique ? 0.08 : 0.2;
  return Math.min(multiplier, target.isUnique ? 1.2 : 1.45);
}

function getAttackEffectivenessText(target, attackType, attackHeight) {
  return getAttackAffinity(target, attackType, attackHeight) > 1 ? " 弱点を突いた！" : "";
}

function executePendingAction(targetIdx) {
  const actor = currentBattle.party[currentBattle.turnIndex];
  const act = currentBattle.pendingAction;
  if (!act) return;
  const effects = [];

  if (act.type === 'attack') {
    const target = currentBattle.enemies[targetIdx];
    playSE('attack');
    const attackPower = actor.atk + actor.tempAtkBuff + actor.battleAtkBuff;
    const attackType = "hand";
    const attackHeight = "middle";
    const affinity = getAttackAffinity(target, attackType, attackHeight);
    let damage = Math.max(1, Math.floor(attackPower * affinity - target.def * 0.4 + (Math.random() * 4 - 2)));
    if (target.isDefending) damage = Math.max(1, Math.floor(damage * 0.5));

    target.hp = Math.max(0, target.hp - damage);
    actor.tempAtkBuff = 0;
    target.defeatPending = target.hp <= 0;
    setBattleLog(`👊 ${actor.name} の攻撃！ ${target.name} に ${damage} のダメージ！${getAttackEffectivenessText(target, attackType, attackHeight)}`);

    effects.push({ targetType: "enemy", targetIndex: targetIdx, effectType: "hit", defeatAfter: target.defeatPending });

  } else if (act.type === 'skill') {
    const s = act.skill;
    actor.mp -= s.mp;

    if (s.type === 'attack') {
      playSE('special');
      const attackPower = actor.atk + actor.tempAtkBuff + actor.battleAtkBuff;
      const hits = Math.max(1, s.hits || 1);
      const attackType = s.attackType || "hand";
      const attackHeight = s.attackHeight || "middle";
      if (s.isAll) {
        setBattleLog(`💥 ${actor.name} の「${s.name}」！`);
        currentBattle.enemies.forEach((target, idx) => {
          if (target.hp > 0) {
            let totalDamage = 0;
            for (let hit = 0; hit < hits && target.hp > 0; hit++) {
              const affinity = getAttackAffinity(target, attackType, attackHeight);
              const damage = Math.max(1, Math.floor(attackPower * s.power * affinity - target.def * 0.4));
              target.hp = Math.max(0, target.hp - damage);
              totalDamage += damage;
              if (hits > 1) setBattleLog(`  ${target.name} に ${damage} のダメージ！（${hit + 1}撃目）`);
            }
            target.defeatPending = target.hp <= 0;
            if (hits === 1) setBattleLog(`  ${target.name} に ${totalDamage} のダメージ！${getAttackEffectivenessText(target, attackType, attackHeight)}`);
            else if (getAttackEffectivenessText(target, attackType, attackHeight)) setBattleLog(`  ${target.name} の弱点を突いた！`);
            effects.push({ targetType: "enemy", targetIndex: idx, effectType: "hit", icon: s.fx, defeatAfter: target.defeatPending });
          }
        });
      } else {
        const target = currentBattle.enemies[targetIdx];
        let totalDamage = 0;
        for (let hit = 0; hit < hits && target.hp > 0; hit++) {
          const affinity = getAttackAffinity(target, attackType, attackHeight);
          const damage = Math.max(1, Math.floor(attackPower * s.power * affinity - target.def * 0.4));
          target.hp = Math.max(0, target.hp - damage);
          totalDamage += damage;
          if (hits > 1) setBattleLog(`💥 ${actor.name} の「${s.name}」${hit + 1}撃目！ ${target.name} に ${damage} のダメージ！`);
        }
        target.defeatPending = target.hp <= 0;
        if (hits === 1) setBattleLog(`💥 ${actor.name} の「${s.name}」！ ${target.name} に ${totalDamage} のダメージ！${getAttackEffectivenessText(target, attackType, attackHeight)}`);
        else if (getAttackEffectivenessText(target, attackType, attackHeight)) setBattleLog(`  ${target.name} の弱点を突いた！`);
        effects.push({ targetType: "enemy", targetIndex: targetIdx, effectType: "hit", icon: s.fx, defeatAfter: target.defeatPending });
      }
      actor.tempAtkBuff = 0;
      if (s.risk > 1) actor.nextDamageMultiplier = Math.max(actor.nextDamageMultiplier, s.risk);
    } else if (s.type === 'defend') {
      playSE('special');
      actor.isDefending = true;
      actor.defCut = s.cut || 0.5;
      actor.counterMul = s.counter || 0;
      actor.guardHeight = s.guardHeight || null;
      actor.guardType = s.guardType || null;
      if (s.duration) actor.guardTurns = s.duration;
      setBattleLog(`🛡️ ${actor.name} は「${s.name}」で身構えた！`);

    } else if (s.type === 'heal') {
      playSE('heal');
      if (s.target === 'self' || s.target === 'single') {
        const target = currentBattle.party[targetIdx];
        if (s.mode === 'hp') {
          const recovered = Math.min(target.maxHp - target.hp, getSkillHealAmount(target, s));
          target.hp += recovered;
          setBattleLog(`✨ ${actor.name} の「${s.name}」！ ${target.name} のHPが ${recovered} 回復！`);
          effects.push({ targetType: "party", targetIndex: targetIdx, effectType: "heal", icon: s.fx });
        } else {
          target.mp = Math.min(target.maxMp, target.mp + s.val);
          setBattleLog(`✨ ${actor.name} の「${s.name}」！ ${target.name} のMPが ${s.val} 回復！`);
        }
      } else if (s.target === 'all') {
        setBattleLog(`✨ ${actor.name} の「${s.name}」！`);
        currentBattle.party.forEach((target, idx) => {
          if (target.hp > 0) {
            const recovered = Math.min(target.maxHp - target.hp, getSkillHealAmount(target, s));
            target.hp += recovered;
            setBattleLog(`  ${target.name} のHPが ${recovered} 回復！`);
            effects.push({ targetType: "party", targetIndex: idx, effectType: "heal", icon: s.fx });
          }
        });
      }
    }
  } else if (act.type === 'item') {
    const item = act.item;
    gameState.inventory.items[item.id]--;
    const isEnemyTarget = item.type.startsWith("debuff_");
    const target = isEnemyTarget ? currentBattle.enemies[targetIdx] : currentBattle.party[targetIdx];

    playSE('heal');
    if (item.type === 'hp') {
      target.hp = Math.min(target.maxHp, target.hp + item.val);
      setBattleLog(`🎒 ${actor.name} は ${item.name} をつかった！ ${target.name} のHPが ${item.val} 回復！`);
      effects.push({ targetType: "party", targetIndex: targetIdx, effectType: "heal", icon: item.icon });
    } else if (item.type === 'mp') {
      target.mp = Math.min(target.maxMp, target.mp + item.val);
      setBattleLog(`🎒 ${actor.name} は ${item.name} をつかった！ ${target.name} のMPが ${item.val} 回復！`);
    } else if (item.type === 'buff_atk') {
      const amount = item.rate
        ? Math.max(1, Math.floor(target.atk * item.rate))
        : item.val;
      target.battleAtkBuff += amount;
      setBattleLog(`🎒 ${actor.name} は ${item.name} をつかった！ ${target.name} の攻撃力が ${amount} 上昇！`);
    } else if (item.type === 'buff_def') {
      const amount = item.rate
        ? Math.max(1, Math.floor(target.def * item.rate))
        : item.val;
      target.battleDefBuff += amount;
      setBattleLog(`🎒 ${actor.name} は ${item.name} をつかった！ ${target.name} の防御力が ${amount} 上昇！`);
    } else if (item.type === 'debuff_atk') {
      target.attackDamageMultiplier = Math.max(0.1, (target.attackDamageMultiplier || 1) * (1 - item.rate));
      setBattleLog(`🎒 ${actor.name} は ${item.name} をつかった！ ${target.name} の攻撃力が下がった！`);
      effects.push({ targetType: "enemy", targetIndex: targetIdx, effectType: "hit", icon: item.icon });
    }
  }

  currentBattle.pendingAction = null;
  currentBattle.state = 'ACTION_ANIMATION';
  renderBattle3D();
  renderBattleHUD();
  effects.forEach(effect => showBattleSpriteEffect(
    effect.targetType,
    effect.targetIndex,
    effect.effectType,
    effect.icon
  ));
  if (effects.some(effect => effect.defeatAfter)) {
    window.setTimeout(() => {
      if (!currentBattle) return;
      currentBattle.enemies.forEach(enemy => {
        if (enemy.hp <= 0) enemy.defeatPending = false;
      });
      renderBattle3D();
    }, 520);
  }

  setTimeout(() => {
    if (!currentBattle) return;
    currentBattle.turnIndex++;
    startTurn();
  }, 900);
}

function executeEnemyTurn() {
  if (!currentBattle || currentBattle.state !== 'ENEMY_TURN') return;

  const aliveEnemies = currentBattle.enemies.filter(e => e.hp > 0);
  const aliveParty = currentBattle.party.filter(m => m.hp > 0);
  const enemyTurnEvents = [];

  if (aliveEnemies.length === 0 || aliveParty.length === 0) {
    startTurn();
    return;
  }

  for (const enemy of aliveEnemies) {
    if (enemy.hp <= 0) continue;
    if (currentBattle.party.every(member => member.hp <= 0)) break;
    enemy.isDefending = false;

    const pattern = enemy.pattern || "single";
    if (!enemy.chargedAttack && pattern === "defensive" && Math.random() < 0.25) {
      enemy.isDefending = true;
      enemyTurnEvents.push({ messages: [`😈 ${enemy.name} は身構えた！`] });
      continue;
    }

    const mirrorSkill = enemy.isMirror && enemy.mirrorSkills.length > 0 && Math.random() < 0.65
      ? enemy.mirrorSkills[Math.floor(Math.random() * enemy.mirrorSkills.length)]
      : null;
    let move = enemy.chargedAttack;
    let isChargedAttack = Boolean(move);
    if (move) {
      enemy.chargedAttack = null;
    } else if (enemy.chargeRate > 0 && Math.random() < enemy.chargeRate) {
      move = getEnemyAttackMove(enemy);
      enemy.chargedAttack = { ...move, damageRate: 2.1 };
      const heightLabel = { upper: "上段", middle: "中段", lower: "下段" }[move.height];
      const typeLabel = move.type === "foot" ? "蹴り" : "突き";
      enemyTurnEvents.push({ messages: [`😈 ${enemy.name} は力を溜めている！ 次は${heightLabel}の${typeLabel}が来る！`] });
      continue;
    }
    if (!move) {
      move = mirrorSkill
        ? { height: mirrorSkill.attackHeight || "middle", type: mirrorSkill.attackType || "hand" }
        : getEnemyAttackMove(enemy);
    }

    const isAllAttack = !isChargedAttack && (pattern === "all" ||
      (pattern === "all_prob" && Math.random() < 0.35) ||
      (pattern === "boss" && Math.random() < 0.4) ||
      Boolean(mirrorSkill?.isAll));
    const isDoubleAttack = !mirrorSkill && !isChargedAttack && pattern === "double";
    const strikeCount = mirrorSkill ? Math.max(1, mirrorSkill.hits || 1) : 1;
    const damageRate = isChargedAttack
      ? move.damageRate
      : mirrorSkill ? Math.min(1.3, 0.7 + Math.min(mirrorSkill.power, 3) * 0.2) / strikeCount
      : pattern === "heavy" ? 1.65 : pattern === "boss" && !isAllAttack ? 1.5 : isDoubleAttack ? 0.65 : isAllAttack ? 0.75 : 1;
    const attackTargets = isAllAttack
      ? currentBattle.party.map((member, idx) => ({ member, idx })).filter(({ member }) => member.hp > 0)
      : Array.from({ length: isDoubleAttack ? 2 : 1 }, () => {
          const remainingParty = currentBattle.party
            .map((member, idx) => ({ member, idx }))
            .filter(({ member }) => member.hp > 0);
          return remainingParty[Math.floor(Math.random() * remainingParty.length)];
        }).filter(Boolean);

    if (attackTargets.length === 0) continue;

    const heightLabel = { upper: "上段", middle: "中段", lower: "下段" }[move.height];
    const typeLabel = move.type === "foot" ? "蹴り" : "突き";
    let attackMessage;
    if (isChargedAttack) attackMessage = `💥 ${enemy.name} の溜めた${heightLabel}の${typeLabel}！`;
    else if (mirrorSkill) attackMessage = `🥋 ${enemy.name} の「${mirrorSkill.name}」！`;
    else if (isAllAttack) attackMessage = `😈 ${enemy.name} の${heightLabel}の全体攻撃！`;
    else if (isDoubleAttack) attackMessage = `😈 ${enemy.name} の連続攻撃！`;
    else if (pattern === "heavy" || pattern === "boss") attackMessage = `😈 ${enemy.name} の強打！`;
    else attackMessage = `😈 ${enemy.name} の${heightLabel}の${typeLabel}！`;

    let isFirstHit = true;
    const attackEvents = [];
    attackTargets.forEach(({ member: target, idx: targetIdx }) => {
      if (target.hp <= 0) return;
      for (let strike = 0; strike < strikeCount && target.hp > 0; strike++) {
        const messages = [];
        if (isFirstHit) {
          messages.push(attackMessage);
          isFirstHit = false;
        }
        let baseDmg = Math.max(1, Math.floor(enemy.atk * (enemy.attackDamageMultiplier || 1) * damageRate - (target.def + target.tempDefBuff + target.battleDefBuff) * 0.4 + (Math.random() * 4 - 2)));
        let matchedGuard = true;
        if (target.isDefending) {
          const hasSpecificGuard = target.guardHeight || target.guardType;
          matchedGuard = !hasSpecificGuard ||
            (target.guardHeight && target.guardHeight === move.height) ||
            (target.guardType && target.guardType === move.type);
          const effectiveCut = target.guardHeight || target.guardType
            ? matchedGuard ? Math.min(0.92, target.defCut + 0.25) : target.defCut * 0.55
            : target.defCut;
          if (matchedGuard) messages.push(`  🛡️ ${target.name} の受け技が攻撃を捉えた！`);
          else if (target.guardHeight || target.guardType) messages.push(`  ⚠️ ${target.name} の構えと攻撃が噛み合わない！`);
          baseDmg = Math.max(1, Math.floor(baseDmg * (1 - effectiveCut)));
        }
        baseDmg = Math.max(1, Math.floor(baseDmg * target.nextDamageMultiplier));
        target.nextDamageMultiplier = 1;

        target.hp = Math.max(0, target.hp - baseDmg);
        messages.push(`  ${target.name} に ${baseDmg} のダメージ！${strikeCount > 1 ? `（${strike + 1}撃目）` : ""}`);

        if (target.isDefending && target.counterMul > 0 && matchedGuard) {
          const counterDmg = Math.max(1, Math.floor(target.atk * target.counterMul));
          enemy.hp = Math.max(0, enemy.hp - counterDmg);
          messages.push(`  🛡️ ${target.name} のカウンター！ ${enemy.name} に ${counterDmg} のダメージ！`);
        }
        attackEvents.push({ targetIndex: targetIdx, messages });
      }
    });
    if (isAllAttack && attackEvents.length > 0) {
      enemyTurnEvents.push({
        targetIndexes: attackEvents.map(event => event.targetIndex),
        messages: attackEvents.flatMap(event => event.messages)
      });
    } else {
      enemyTurnEvents.push(...attackEvents);
    }
  }

  renderBattle3D();
  renderBattleHUD();
  const battle = currentBattle;
  const hitAnimationInterval = 1800;
  enemyTurnEvents.forEach((event, index) => {
    setTimeout(() => {
      if (currentBattle !== battle) return;
      event.messages.forEach(setBattleLog);
      if (event.targetIndexes?.length) {
        playSE('damage');
        triggerBattleDamageFlash();
        event.targetIndexes.forEach(targetIndex => {
          showBattleSpriteEffect("party", targetIndex, "hit", "💥");
        });
      } else if (event.targetIndex !== undefined) {
        playSE('damage');
        triggerBattleDamageFlash();
        showBattleSpriteEffect("party", event.targetIndex, "hit", "💥");
      }
    }, index * hitAnimationInterval);
  });

  setTimeout(() => {
    if (currentBattle !== battle) return;
    currentBattle.turnIndex = 0;
    startTurn();
  }, Math.max(1000, (enemyTurnEvents.length - 1) * hitAnimationInterval + 650));
}

function winBattle() {
  const playEnding = currentBattle.finalBoss;
  if (!playEnding) playSE('win');
  let totalGold = 0;
  currentBattle.enemies.forEach(e => {
    totalGold += e.gold;
  });

  gameState.stats.gold += totalGold;
  const clearedEnemies = gameState.progress.clearedEnemies;
  if (!clearedEnemies.includes(currentBattle.enemyProgressKey)) {
    clearedEnemies.push(currentBattle.enemyProgressKey);
  }
  const defeatedCount = currentBattle.finalBoss ? 1 : currentBattle.enemies.length;
  gameState.progress.enemyWins[currentBattle.enemyProgressKey] =
    (gameState.progress.enemyWins[currentBattle.enemyProgressKey] || 0) + defeatedCount;
  saveGame();
  checkMissionProgress();

  if (playEnding) {
    stopBGM();
    openScreen("screen-stages", { playBgm: false });
    startBGM(BGM_SETTINGS.ending);
    playStoryEvent("ending", () => openModal(`
      <div class="game-ending">
        <div class="ending-rank">THE END</div>
        <div class="ending-emblem">🥋</div>
        <h2>道場の頂点へ</h2>
        <p class="ending-copy">己に打ち克ち、すべての試練を乗り越えた。</p>
        <p class="ending-reward">今回の獲得報酬 <strong>+${formatGold(totalGold)}円</strong></p>
        <button class="btn btn-gold" onclick="closeModal(); openScreen('screen-home');">ホームへ戻る</button>
      </div>
    `));
    return;
  }

  setBattleLog(`🎉 勝利！ 獲得お金: +${formatGold(totalGold)}円！`);
  setTimeout(() => {
    openModal(`
      <div style="text-align:center; padding:10px;">
        <h2 style="color:var(--accent-gold); margin-bottom:10px;">🎉 Victory!</h2>
        <p style="font-size:0.9rem; margin-bottom:6px;">獲得お金: <b>+${formatGold(totalGold)}円</b></p>
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
