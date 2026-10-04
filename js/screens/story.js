const STORY_SCENES = [
  {
    id: "opening",
    title: "プロローグ：しゃべる巻物",
    lines: [
      { speaker: "{hero}", text: "道場のすみっこに巻物？こんなのあったっけ……。" },
      { speaker: "巻物", text: "ついに目覚める時が来た。心の影が世界を覆い、人々を惑わせている。" },
      { speaker: "{hero}", text: "えっ、巻物がしゃべった！？それに街が真っ暗だ！" },
      { speaker: "友だち", text: "大変！街の人たちが、黒い影みたいになって暴れてる！" },
      { speaker: "巻物", text: "影に操られた者を救うには、影のもとを祓うのだ。" },
      { speaker: "{hero}", text: "つまり、街を回って影を見つければいいんだね。よし、行こう！" }
    ]
  },
  {
    id: "stage-stage1",
    title: "第一章：いつもの自宅に",
    lines: [
      { speaker: "友だち", text: "昨日ゲームを始めたら止まらなくてさ。気づいたら宿題も、部屋の片づけもそっちのけ。全部あの黒いモヤのせいだと思う。" },
      { speaker: "{hero}", text: "いや、それは単に君がゲームにハマってるだけじゃないかな？" },
      { speaker: "友だち", text: "そんなことないよ！お風呂に入っている間もゲームが止められなかったんだ！" },
      {
        type: "choice",
        speaker: "友だち",
        text: "あの影、ゲーム機の中に逃げたみたい！一緒に追いかけてくれる？",
        options: [
          { id: "yes", label: "はい", lines: [{ speaker: "{hero}", text: "もちろん。ひとりで追うより、ふたりの方が心強いよ。" }, { speaker: "友だち", text: "よし、コントローラーは置いてくぞ！……あとで続きできるかな？" }] },
          { id: "no", label: "いいえ", lines: [{ speaker: "{hero}", text: "ちょっと待って。準備してから行こう。勢いだけで飛び込むのは、ゲームでも危ないしね。" }, { speaker: "友だち", text: "たしかに！回復アイテムも持ったし、今度こそ大丈夫。" }] }
        ]
      },
      { speaker: "友だち", text: "あっ、今度は影が家の中を走ってく！話の続きは、追いついてからだね。" },
      { speaker: "{hero}", text: "うん。みんなを元に戻すために、あの影を追おう！" }
    ]
  },
  {
    id: "stage-stage2",
    title: "第二章：影に曇る教室",
    lines: [
      { speaker: "友だち", text: "先生が廊下を走ってる！いつもは『廊下を走るな』って言うのに……。あれ、先生本人じゃないよね？" },
      { speaker: "{hero}", text: "あの黒いモヤに包まれてる。きっと操られてるんだ。まずは近づいてみよう！" },
      {
        type: "choice",
        speaker: "仲間",
        text: "先生に話しかける？それとも、やめておいて影がこっちに気づく前に近づく？",
        options: [
          { id: "yes", label: "はい", lines: [{ speaker: "{hero}", text: "話しかけてみよう。先生なら、いつもの呼びかけに反応するかも。「せんせーい！」" }, { speaker: "友だち", text: "やばい、先生が物凄い目をしながら襲いかかってきた！" }] },
          { id: "no", label: "いいえ", lines: [{ speaker: "{hero}", text: "今はそっと近づこう。驚かせたら、影が先生から離れるかもしれない。" }, { speaker: "仲間", text: "わかった。先生を傷つけないように、慎重に影だけを狙おう。" }] }
        ]
      },
      { speaker: "{hero}", text: "先生を助けるには影を祓うしかない。行こう！" }
    ]
  },
  {
    id: "stage-stage3",
    title: "第三章：誘惑のショッピングモール",
    lines: [
      { speaker: "仲間", text: "あっちの店も、こっちの店も『憧れの師範代のサイン』を売っているみたい。確かに良い商品だけど、1筆500万は流石に高すぎる！やはり、あの影の影響かな？" },
      { speaker: "{hero}", text: "たぶんね。「憧れの師範代のサイン」を買いたいという皆の心の隙につけ込んでいるんだよ。店の人たちも、あのモヤに操られてるみたいだ。" },
      {
        type: "choice",
        speaker: "仲間",
        text: "せっかくだし、追いかける前にあのお店をのぞいていかない？",
        options: [
          { id: "yes", label: "はい", lines: [{ speaker: "{hero}", text: "少しだけならいいよ。役に立つ道具があるかもしれないし。" }, { speaker: "仲間", text: "やった！……あれ？店員さんまで影に追いかけられてる！買い物どころじゃないね。" }] },
          { id: "no", label: "いいえ", lines: [{ speaker: "{hero}", text: "今は人を助けるのが先。買い物は影を祓ってからにしよう。" }, { speaker: "仲間", text: "そうだね。セールは逃げても、あの人たちは放っておけないもん。" }] }
        ]
      },
      { speaker: "仲間", text: "店の奥へ逃げていった！みんなを元に戻すために、追いかけよう。" }
    ]
  },
  {
    id: "stage-stage4",
    title: "第四章：学びの試練",
    lines: [
      { speaker: "仲間", text: "塾の人たちが、同じ問題をずっと解かされてる！あの影、先生まで操ってるよ。" },
      { speaker: "{hero}", text: "影が問題を増やしてるのかな……うわ、黒板いっぱいだ。" },
      {
        type: "choice",
        speaker: "仲間",
        text: "黒板の問題、解いてから行く？それとも影を追う？",
        options: [
          { id: "yes", label: "はい", lines: [{ speaker: "{hero}", text: "一問だけ挑戦しよう。……うん、これは解けた！" }, { speaker: "仲間", text: "すごい！でも、解いてる間に影が逃げていくよ！" }] },
          { id: "no", label: "いいえ", lines: [{ speaker: "{hero}", text: "ごめん、今は後回し。あの人たちを助けるのが先だ。" }, { speaker: "仲間", text: "賛成！問題なら、影を祓ってから一緒に考えよう。" }] }
        ]
      },
      { speaker: "{hero}", text: "まずは影を止めないとね。みんなを助けに行こう！" }
    ]
  },
  {
    id: "stage-stage5",
    title: "最終章：道場、そして己",
    lines: [
      { speaker: "仲間", text: "道場まで黒いモヤが広がってる……。あそこにいるの、みんなそっくりだよ！" },
      { speaker: "{hero}", text: "自分の影か。ずいぶん強そうだけど、自分の方が幾分か格好良いかな。" },
      {
        type: "choice",
        speaker: "仲間",
        text: "そんなこと言っている場合じゃないよ！無駄かもしれないけど、自分の姿だし声をかけてみる？",
        options: [
          { id: "yes", label: "はい", lines: [{ speaker: "{hero}", text: "もうひとりの自分、聞こえる？みんなを返してもらうよ！" }, { speaker: "仲間", text: "返事の代わりに構えたね……。やっぱり、戦って止めるしかなさそう。" }] },
          { id: "no", label: "いいえ", lines: [{ speaker: "{hero}", text: "どう見ても話を聞いてくれそうにない。油断せず、みんなで行こう。" }, { speaker: "仲間", text: "うん。ここまで一緒に来たんだもん。最後まで力を合わせよう！" }] }
        ]
      },
      { speaker: "{hero}", text: "影に勝って、操られた人たちを元に戻すんだ！" }
    ]
  },
  {
    id: "ending",
    title: "エンディング：明日への一歩",
    lines: [
      { speaker: "友だち", text: "影が消えて、みんな元に戻った！町もいつもの明るさだ！" },
      { speaker: "仲間", text: "あの影、結局なんだったんだろうね？" },
      { speaker: "{hero}", text: "よく分からないけど、もしかしたら皆の弱い心が生んだものかもしれないね。" },
      { speaker: "仲間", text: "道場に行けば、何かわかるかな？" },
      { speaker: "{hero}", text: "そうかもしれないね。あの巻物は何を尋ねても結局何も答えてくれなかったけど、他にも何か手がかりがあるかもしれないし。" },
      { speaker: "仲間", text: "師範代なら何か知ってるんじゃないかな？" },
      { speaker: "{hero}", text: "確かに！何で最初に思い浮かばなかったんだろう。" },
      { speaker: "{hero}", text: "よし！明日も稽古に行くか！" },
      { speaker: "巻物", text: "物語を最後まで読んだ君へ、秘密のキーワードを贈ろう。キーワードを憧れの師範代に伝えると、きっと良いことが君を待っているだろう。" },
      { speaker: "巻物", type: "keyword", text: "空手大好き" }
    ]
  }
];

function getStoryEvents() {
  return STORY_SCENES;
}

function isStoryEventSeen(eventId) {
  return Array.isArray(gameState.story?.seen) && gameState.story.seen.includes(eventId);
}

function getEnemyProgressKey(stageId, enemyIndex) {
  return `${stageId}-${enemyIndex}`;
}

function isEnemyCleared(stageId, enemyIndex) {
  return gameState.progress.clearedEnemies.includes(getEnemyProgressKey(stageId, enemyIndex));
}

function isStageUnlocked(stageIndex) {
  if (stageIndex < 0 || stageIndex >= STAGES_MASTER.length) return false;
  if (gameState.adminOverrides.unlockAllStages || stageIndex === 0) return true;
  const previousStage = STAGES_MASTER[stageIndex - 1];
  const bossIndex = previousStage.enemies.length - 1;
  return bossIndex >= 0 && isEnemyCleared(previousStage.id, bossIndex);
}

function areAllStagesCleared() {
  return STAGES_MASTER.every(stage => stage.enemies.every((_, index) => isEnemyCleared(stage.id, index)));
}

function storyEscapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

let activeStoryPlayback = null;

function playStoryEvent(eventId, onComplete = null) {
  const scene = getStoryEvents().find(event => event.id === eventId);
  if (!scene) {
    console.error(`ストーリーイベントが見つかりません: ${eventId}`);
    return;
  }
  if (scene.id.startsWith("stage-")) {
    const stageId = scene.id.slice("stage-".length);
    const bgm = getStageSelectionBgm(stageId);
    if (bgm) startBGM(bgm);
  } else if (scene.id === "opening") {
    startBGM(BGM_SETTINGS.opening);
  }
  activeStoryPlayback = { scene, lines: scene.lines.map(line => ({ ...line })), index: 0, onComplete };
  renderStoryDialogue();
}

function renderStoryDialogue() {
  if (!activeStoryPlayback) return;
  const { scene, lines, index } = activeStoryPlayback;
  const line = lines[index];
  if (line.type === "keyword") {
    openModal(`
      <div class="game-ending story-keyword-ending">
        <div class="ending-rank">THE END</div>
        <div class="ending-emblem">🥋</div>
        <h2>秘密のキーワード</h2>
        <div class="ending-secret">
          <span>秘密のキーワード</span>
          <strong>${storyEscapeHtml(line.text)}</strong>
        </div>
        <button class="btn btn-gold" onclick="advanceStoryEvent()">読み終える</button>
      </div>
    `);
    return;
  }
  const speaker = line.speaker.replaceAll("{hero}", gameState.char.name);
  const text = line.text.replaceAll("{hero}", gameState.char.name);
  const avatar = getStorySpeakerAvatar(line.speaker);
  const lastLine = index === lines.length - 1;
  const actions = line.type === "choice"
    ? line.options.map((option, optionIndex) => `
        <button class="btn btn-gold" onclick="chooseStoryBranch(${optionIndex})">${storyEscapeHtml(option.label)}</button>
      `).join("")
    : `<button class="btn btn-gold" onclick="advanceStoryEvent()">${lastLine ? "読み終える" : "次へ"}</button>`;

  openModal(`
    <div class="story-dialogue">
      <div class="card-title"><span>${storyEscapeHtml(scene.title)}</span><span>${index + 1}/${lines.length}</span></div>
      <div class="story-line-layout">
        <div class="story-speaker-avatar" aria-hidden="true">${storyEscapeHtml(avatar)}</div>
        <div class="story-bubble">
          <div class="story-speaker">${storyEscapeHtml(speaker)}</div>
          <p class="story-line">${storyEscapeHtml(text)}</p>
        </div>
      </div>
      <div class="story-actions">
        <button class="btn btn-red" onclick="skipStoryEvent()">スキップ</button>
        ${actions}
      </div>
    </div>
  `);
}

function chooseStoryBranch(optionIndex) {
  if (!activeStoryPlayback) return;
  const playback = activeStoryPlayback;
  const choice = playback.lines[playback.index];
  if (choice?.type !== "choice") return;
  const option = Number.isInteger(optionIndex) ? choice.options[optionIndex] : null;
  if (!option) {
    console.error(`ストーリー分岐が見つかりません: ${optionIndex}`);
    return;
  }
  playback.lines.splice(playback.index, 1, ...option.lines.map(line => ({ ...line })));
  renderStoryDialogue();
}

function getStorySpeakerAvatar(speaker) {
  if (speaker === "{hero}") return gameState.char.avatar || "🥋";
  if (speaker === "巻物") return "📜";
  if (speaker === "友だち") return "🧑‍🎓";
  if (speaker === "仲間") return gameState.companions[0]?.avatar || "🥋";
  return "👤";
}

function advanceStoryEvent() {
  if (!activeStoryPlayback) return;
  if (activeStoryPlayback.index < activeStoryPlayback.lines.length - 1) {
    activeStoryPlayback.index++;
    renderStoryDialogue();
    return;
  }
  finishStoryEvent();
}

function skipStoryEvent() {
  if (!activeStoryPlayback) return;
  if (activeStoryPlayback.scene.id === "ending") {
    activeStoryPlayback.index = activeStoryPlayback.lines.length - 1;
    renderStoryDialogue();
    return;
  }
  finishStoryEvent();
}

function finishStoryEvent() {
  const playback = activeStoryPlayback;
  if (!playback) return;

  if (!gameState.story.seen.includes(playback.scene.id)) {
    gameState.story.seen.push(playback.scene.id);
  }
  if (playback.scene.id === "ending") gameState.story.completed = true;
  activeStoryPlayback = null;
  saveGame();
  closeModal();
  if (playback.onComplete) playback.onComplete();
}

function renderStoryArchive() {
  const archive = document.getElementById("story-archive");
  const seenEvents = getStoryEvents().filter(event => isStoryEventSeen(event.id));
  archive.innerHTML = seenEvents.length
    ? seenEvents.map(event => `
      <button class="story-archive-entry" onclick="playStoryEvent('${event.id}')">
        <span>${storyEscapeHtml(event.title)}</span><span aria-hidden="true">›</span>
      </button>
    `).join("")
    : '<p class="story-empty">物語はまだ始まっていません。「冒険へ」進んで物語を体験しましょう。</p>';
}
