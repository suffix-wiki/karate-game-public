/* ==========================================================================
   CHAR EDIT
   ========================================================================== */

let selectedCharEditTarget = 'hero';

function renderCharEditUI() {
  const tabs = document.getElementById("char-edit-tabs");
  let tabsHtml = `<button class="tab-btn active" onclick="switchCharEditTarget('hero')">${gameState.char.name}</button>`;
  gameState.companions.forEach(c => {
    tabsHtml += `<button class="tab-btn" onclick="switchCharEditTarget(${c.id})">${c.name}</button>`;
  });
  tabs.innerHTML = tabsHtml;

  switchCharEditTarget('hero');
}

function switchCharEditTarget(targetId) {
  selectedCharEditTarget = targetId;
  tempSelectedAvatar = null;

  let name = gameState.char.name;
  let gender = gameState.char.gender;
  let age = gameState.char.age;
  let avatar = gameState.char.avatar;

  if (targetId !== 'hero') {
    const c = gameState.companions.find(x => x.id === targetId);
    if (c) {
      name = c.name;
      gender = c.gender;
      age = c.age;
      avatar = c.avatar;
    }
  }

  document.getElementById("edit-name").value = name;
  document.getElementById("edit-gender").value = gender;
  document.getElementById("edit-age").value = age;

  const grid = document.getElementById("avatar-grid");
  grid.innerHTML = AVATARS.map(a => `
    <div onclick="selectAvatarIcon('${a}')" class="avatar-opt" style="font-size:1.8rem; text-align:center; padding:6px; background:#0f172a; border-radius:8px; cursor:pointer; border:1px solid ${a === avatar ? 'var(--accent-gold)' : 'var(--border-color)'}">
      ${a}
    </div>
  `).join("");

  const tabs = document.querySelectorAll("#char-edit-tabs .tab-btn");
  tabs.forEach(t => t.classList.remove("active"));
  if (window.event && window.event.target && window.event.target.classList) {
    window.event.target.classList.add("active");
  }
}

let tempSelectedAvatar = null;
function selectAvatarIcon(a) {
  tempSelectedAvatar = a;
  const opts = document.querySelectorAll(".avatar-opt");
  opts.forEach(opt => {
    opt.style.borderColor = (opt.innerText.trim() === a) ? 'var(--accent-gold)' : 'var(--border-color)';
  });
}

function saveCharSettings() {
  const newName = document.getElementById("edit-name").value.trim() || "無名";
  const newGender = document.getElementById("edit-gender").value;
  const newAge = parseInt(document.getElementById("edit-age").value) || 15;

  if (selectedCharEditTarget === 'hero') {
    gameState.char.name = newName;
    gameState.char.gender = newGender;
    gameState.char.age = newAge;
    if (tempSelectedAvatar) gameState.char.avatar = tempSelectedAvatar;
  } else {
    const c = gameState.companions.find(x => x.id === selectedCharEditTarget);
    if (c) {
      c.name = newName;
      c.gender = newGender;
      c.age = newAge;
      if (tempSelectedAvatar) c.avatar = tempSelectedAvatar;
    }
  }

  saveGame();
  showToast("キャラ設定を更新しました");
  tempSelectedAvatar = null;
  updateHomeUI();
}
