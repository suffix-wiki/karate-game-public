/* ==========================================================================
   GAME DATA & CONSTANTS
   ========================================================================== */
const BGM_SETTINGS = {
  opening: "sound/opening.mp3",
  ending: "sound/ending.mp3",
  defaultBattle: "sound/battle.mp3",
  defaultBoss: "sound/boss-jukusen.mp3",
  screens: {
    "screen-home": "sound/home-calm.mp3",
    "screen-stages": "sound/stage-select.mp3",
    "screen-enemies": {
      default: "sound/stage-select.mp3",
      "stage1-select": "sound/my-home.mp3",
      "stage2-select": "sound/school.mp3",
      "stage3-select": "sound/shopping.mp3",
      "stage4-select": "sound/juku.mp3",
      "stage5-select": "sound/dojo.mp3"
    },
    "screen-status": "sound/home-calm.mp3",
    "screen-missions": "sound/home-calm.mp3",
    "screen-char-edit": "sound/home-calm.mp3",
    "screen-fitting": "sound/item-and-equip.mp3",
    "screen-lab": "sound/lab.mp3",
    "screen-lab-upgrade": "sound/lab.mp3",
    "screen-lab-combine": "sound/lab.mp3",
    "screen-item-shop": "sound/item-and-equip.mp3",
    "screen-equip-shop": "sound/item-and-equip.mp3",
    "screen-fleamarket": "sound/item-and-equip.mp3",
    "screen-sell-items": "sound/item-and-equip.mp3",
    "screen-sell-equips": "sound/item-and-equip.mp3",
    "screen-gacha": "sound/gacha.mp3",
    "screen-admin": "sound/home-calm.mp3",
    "screen-settings": "sound/home-calm.mp3"
  },
  enemies: {
    "睡魔": "sound/battle.mp3",
    "ゲーム機": "sound/battle.mp3",
    "トイレ": "sound/battle.mp3",
    "甘やかしの影（父）": "sound/battle.mp3",
    "甘やかしの影（母）": "sound/battle.mp3",
    "同級生": "sound/battle.mp3",
    "学級委員長": "sound/battle.mp3",
    "担任の先生": "sound/battle.mp3",
    "教頭先生": "sound/battle.mp3",
    "校長先生": "sound/boss-kocho.mp3",
    "買い食いの誘惑": "sound/battle.mp3",
    "遊びの誘惑": "sound/battle.mp3",
    "詐欺師": "sound/battle.mp3",
    "不審者": "sound/battle.mp3",
    "他校の強豪空手部員": "sound/boss-tako.mp3",
    "宿題": "sound/battle.mp3",
    "抜き打ち小テスト": "sound/battle.mp3",
    "難解なテスト": "sound/battle.mp3",
    "浪人生": "sound/battle.mp3",
    "塾の先生": "sound/boss-jukusen.mp3",
    "指導員": "sound/battle.mp3",
    "師範代": "sound/boss-shihandai.mp3",
    "師範": "sound/boss-shihan.mp3",
    "館長": "sound/boss-kancho.mp3",
    "自分": "sound/boss-jibun.mp3"
  }
};

const TITLES = [
  "白帯", "黄帯", "オレンジ帯", "緑帯", "水色帯", "紫帯", "茶帯",
  "黒帯", "黒帯(指導員)", "黒帯(師範代)", "黒帯(師範)", "黒帯(館長)", "達人", "超越者"
];

const AVATARS = [
  "🥋", "😎", "😤", "🤗", "👸", "👦", "👧", "🧑‍🦱", "👩‍🦰", "🧔", 
  "👴", "👱‍♀️", "🥷", "🐯", "😾", "🦁", "🦅", "👺", "👽", "🤖"
];

const COMPANIONS_MASTER = [
  { id: 1, reqLv: 20, defaultName: "押忍はなこ", gender: "女", age: 14, avatar: "👧", hpMul: 0.9, atkMul: 1.0, defMul: 0.9, spdMul: 1.1 },
  { id: 2, reqLv: 40, defaultName: "押忍じろう", gender: "男", age: 18, avatar: "👦", hpMul: 0.85, atkMul: 1.2, defMul: 0.8, spdMul: 1.3 },
  { id: 3, reqLv: 60, defaultName: "押忍たま", gender: "男", age: 16, avatar: "😾", hpMul: 1.25, atkMul: 1.1, defMul: 1.2, spdMul: 0.85 }
];

/* 技マスターデータ */
const SKILLS_MASTER = [
  { id:"atk1", name:"前蹴り", type:"attack", attackType:"foot", attackHeight:"middle", isAll: false, isSpin: false, lv:1, mp:3, power:1.3, desc:"素早い直線的な蹴り", fx:"🦶" },
  { id:"atk2", name:"刻突", type:"attack", attackType:"hand", attackHeight:"middle", isAll: false, isSpin: false, lv:3, mp:4, power:1.1, priority:true, desc:"【先制】相手より先に突きを入れる", fx:"👊" },
  { id:"atk3", name:"逆突", type:"attack", attackType:"hand", attackHeight:"middle", isAll: false, isSpin: false, lv:5, mp:5, power:1.6, desc:"腰の回転をのせた強力な突き", fx:"💥" },
  { id:"atk4", name:"回し蹴り", type:"attack", attackType:"foot", attackHeight:"middle", isAll: true, isSpin: true, lv:8, mp:10, power:1.4, desc:"【全体・回転】遠心力で敵全体を一掃する", fx:"🌀" },
  { id:"atk5", name:"追突", type:"attack", attackType:"hand", attackHeight:"middle", isAll: false, isSpin: false, lv:12, mp:8, power:1.5, priority:true, desc:"【先制】一気に踏み込んで急襲", fx:"⚡" },
  { id:"atk6", name:"三日月蹴り", type:"attack", attackType:"foot", attackHeight:"upper", isAll: false, isSpin: false, lv:16, mp:10, power:2.8, risk:1.5, desc:"【単体大威力】激痛の蹴りだが隙ができる", fx:"🌙" },
  { id:"atk11", name:"回り込み追突", type:"attack", attackType:"hand", attackHeight:"middle", isAll: false, isSpin: false, lv:20, mp:12, power:1.8, priority:true, desc:"相手の側面へ回り込んで鋭く突く", fx:"💨" },
  { id:"atk7", name:"旋風脚", type:"attack", attackType:"foot", attackHeight:"middle", isAll: true, isSpin: true, lv:22, mp:18, power:2.2, desc:"【全体・回転】鋭い回転で敵全員を薙ぎ払う", fx:"🌪️" },
  { id:"atk8", name:"二段蹴り", type:"attack", attackType:"foot", attackHeight:"middle", isAll: false, isSpin: false, lv:25, mp:15, power:1.7, hits:2, desc:"【2回連続】空中で二度連続蹴りを見舞う", fx:"👟" },
  { id:"atk9", name:"後ろ回し蹴り", type:"attack", attackType:"foot", attackHeight:"upper", isAll: false, isSpin: true, lv:30, mp:18, power:4.2, risk:2.0, desc:"【単体超絶威力】全身を一回転させ必殺一撃", fx:"🔥" },
  { id:"atk12", name:"足払い流し突き逆突", type:"attack", attackType:"hand", attackHeight:"middle", isAll: false, isSpin: false, lv:35, mp:24, power:1.5, hits:2, desc:"足払いから流れるように二連撃を放つ", fx:"🥋" },
  { id:"atk10", name:"百裂突き", type:"attack", attackType:"hand", attackHeight:"middle", isAll: true, isSpin: false, lv:40, mp:28, power:2.8, desc:"【全体】敵全体へ無数の突きの嵐を叩き込む", fx:"⚔️" },

  { id:"def1", name:"挙げ受け", type:"defend", lv:2, mp:3, cut:0.5, counter:0.3, guardHeight:"upper", desc:"上段攻撃を特に防ぎ、反撃する", fx:"🛡️" },
  { id:"def2", name:"下段払い", type:"defend", lv:4, mp:4, cut:0.55, counter:0.35, guardHeight:"lower", guardType:"foot", desc:"下段や蹴りを払い、反撃する", fx:"✋" },
  { id:"def3", name:"内受け", type:"defend", lv:7, mp:5, cut:0.6, counter:0, guardHeight:"middle", desc:"中段攻撃を内側から受ける", fx:"🛡️" },
  { id:"def4", name:"外受け", type:"defend", lv:10, mp:6, cut:0.65, counter:0.45, guardHeight:"middle", desc:"中段攻撃を外へ受け流して反撃", fx:"✋" },
  { id:"def5", name:"手刀受け", type:"defend", lv:15, mp:8, cut:0.75, counter:0, duration:2, guardHeight:"middle", desc:"中段攻撃を受け流し、構えを保つ", fx:"🪓" },
  { id:"def6", name:"不動の構え", type:"defend", lv:18, mp:10, cut:0.8, counter:0, desc:"攻撃の段を問わず、全身で受け止める", fx:"🏯" },

  { id:"heal1", name:"息吹", type:"heal", target:"self", lv:6, mp:6, val:120, hpRate:0.25, mode:"hp", desc:"呼吸を整え自身のHPを回復", fx:"✨" },
  { id:"heal2", name:"傷の手当", type:"heal", target:"single", lv:9, mp:8, val:180, hpRate:0.4, mode:"hp", desc:"仲間一人のHPを回復する", fx:"🩹" },
  { id:"heal3", name:"瞑想", type:"heal", target:"self", lv:14, mp:0, val:40, mode:"mp", desc:"精神を統一し自身のMPを回復", fx:"🧘" },
  { id:"heal4", name:"応援", type:"heal", target:"single", lv:21, mp:10, val:35, mode:"mp", desc:"仲間一人を鼓舞しMPを回復させる", fx:"📣" },
  { id:"heal5", name:"気功回復", type:"heal", target:"all", lv:32, mp:22, val:250, hpRate:0.3, mode:"hp", desc:"気流を放ち味方全員のHPを大きく回復", fx:"💚" }
];

/* 敵データ */
const STAGES_MASTER = [
  { id:"stage1", name:"自宅", recommendedLv:"1〜20", icon:"🏠", stars:"⭐︎", bgm:"intense", bgImg:"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiNYs8xSRASessx0O-RDjSrwd0X7WQmlRIaBYNqRo2vIAnx60hwV_hjpyXt4a_JXcdmzK50OK2TCarPT-ePhJyUYE32ZkZtdPJui36KL2epfO4KdtH7PoQ4ma4E-mBodQEdAkgSvD8h7gKy/s800/room_youshitsu.png", enemies:[
    { name:"睡魔", icon:"🥱", recommendedLv:1, hp:60, atk:8, def:2, spd:5, gold:80, msg:"ウトウトしてきた...", pattern: "single", attackStyle:"upperHand", weakTo:"foot", weakHeight:"middle", isUnique: false },
    { name:"ゲーム機", icon:"🎮", recommendedLv:5, hp:400, atk:35, def:20, spd:8, gold:120, msg:"あと1分だけ...", pattern: "single", attackStyle:"middleHand", weakTo:"foot", weakHeight:"upper", isUnique: false },
    { name:"トイレ", icon:"🚽", recommendedLv:9, hp:1000, atk:70, def:50, spd:2, gold:150, msg:"こもると快適...", pattern: "defensive", attackStyle:"lowerKick", weakTo:"hand", weakHeight:"upper", isUnique: false },
    { name:"甘やかしの影（父）", icon:"👨", recommendedLv:13, hp:2200, atk:115, def:100, spd:10, gold:300, msg:"宿題なんてしなくていい。ずっと遊んでいなさい……", pattern: "double", attackStyle:"lowerKick", weakTo:"hand", isUnique: true },
    { name:"甘やかしの影（母）", icon:"👩", recommendedLv:17, hp:5000, atk:170, def:180, spd:15, gold:500, msg:"片づけも明日の準備もしなくていい。何もしなくていいのよ……", pattern: "boss", attackStyle:"mixed", weakTo:"hand", isUnique: true }
  ]},
  { id:"stage2", name:"教室", recommendedLv:"21〜40", icon:"🏫", stars:"⭐︎⭐︎", bgm:"intense", bgImg:"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPOhWDPVD9wMvDy4K74KNokVyjpJp6pacaFVWIYcrR1ROZ5ZATKt4gpOY-dZEsqoDxLbSEzF5OVzFUmuFjxYETZi0Y6JjYw5Ht6FOHa49SqRRkLz2l2HjlV4teevsk60RS4UdJHl-WTjU/s800/bg_school_room_back.jpg", enemies:[
    { name:"同級生", icon:"👦", recommendedLv:21, hp:4500, atk:380, def:200, spd:12, gold:350, msg:"放課後カラオケ行こうぜ！", pattern: "double", attackStyle:"lowerKick", weakTo:"hand", weakHeight:"upper", isUnique: false },
    { name:"学級委員長", icon:"👓", recommendedLv:25, hp:6500, atk:470, def:280, spd:14, gold:500, msg:"校則はしっかり守りましょう！", pattern: "all_prob", attackStyle:"upperHand", weakTo:"foot", isUnique: true },
    { name:"担任の先生", icon:"👨‍🏫", recommendedLv:29, hp:9000, atk:580, def:360, spd:18, gold:900, msg:"そこ！廊下を走らない！", pattern: "boss", attackStyle:"upperHand", chargeRate:0.45, weakTo:"foot", isUnique: true },
    { name:"教頭先生", icon:"👴", recommendedLv:33, hp:12000, atk:660, def:440, spd:15, gold:1500, msg:"盆裁の手入れで忙しいんじゃ", pattern: "defensive", attackStyle:"middleHand", weakTo:"foot", isUnique: true },
    { name:"校長先生", icon:"🧔‍♂️", recommendedLv:37, hp:16000, atk:750, def:520, spd:20, gold:2500, msg:"皆さんが静かになるまで3分かかりました", pattern: "boss", attackStyle:"mixed", weakTo:"foot", isUnique: true }
  ]},
  { id:"stage3", name:"ショッピングモール", recommendedLv:"41〜60", icon:"🛍️", stars:"⭐︎⭐︎⭐︎", bgm:"intense", bgImg:"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhK064xVNLQE2lv5Or82ysxYZs1apnxOPiXTNIz2FHFvIcv4LAcxWxXWzC6df1rUm_9yyz4pkLd2Hv1Zs1Tpjp5bs6JXLv40unRmOndysU1-KxUdf8ekzFv4_9_-Xt1zUHB4X-3Z5C4pxUq/s800/shopping_mall_ekinaka.png", enemies:[
    { name:"買い食いの誘惑", icon:"🍟", recommendedLv:41, hp:6500, atk:650, def:450, spd:18, gold:1500, msg:"揚げたてポテトのいい香り...", pattern: "all_prob", attackStyle:"lowerKick", weakTo:"hand", weakHeight:"upper", isUnique: false },
    { name:"遊びの誘惑", icon:"🕹️", recommendedLv:45, hp:9500, atk:800, def:520, spd:24, gold:2500, msg:"新作クレーンゲーム入荷！", pattern: "double", attackStyle:"lowerKick", weakTo:"hand", isUnique: false },
    { name:"詐欺師", icon:"🕶️", recommendedLv:49, hp:13000, atk:1000, def:620, spd:30, gold:4000, msg:"絶対儲かる話があるんだけど", pattern: "heavy", attackStyle:"upperHand", weakTo:"foot", isUnique: true },
    { name:"不審者", icon:"🥸", recommendedLv:53, hp:17000, atk:1150, def:720, spd:28, gold:6000, msg:"ちょっとお茶でもいかが？", pattern: "defensive", attackStyle:"mixed", weakTo:"hand", isUnique: true },
    { name:"他校の強豪空手部員", icon:"😈", recommendedLv:57, hp:23000, atk:1350, def:850, spd:38, gold:9000, msg:"ウチの道場の看板、背負ってんだよ！", pattern: "boss", attackStyle:"mixed", chargeRate:0.38, weakHeight:"lower", isUnique: true }
  ]},
  { id:"stage4", name:"学習塾", recommendedLv:"61〜70", icon:"✏️", stars:"⭐︎⭐︎⭐︎⭐︎", bgm:"epic", bgImg:"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQzJCIwUWlk4zNeTDKb509FD7uGjLT0I4k7JzJfLp2yv4ekXjkgT3Ubj6TwzlmkVc8_xyPn2uXIyzIxFNJpX4csWvByD2RtPTHkirxSAMGG6IZBkOE0rxocvd5Tpcc-QdEHYdtYiBGamyT/s800/schoo_room_shichoukakushitsu.png", enemies:[
    { name:"宿題", icon:"📝", recommendedLv:61, hp:13000, atk:1000, def:800, spd:25, gold:8000, msg:"提出期限は明日朝8時！", pattern: "single", attackStyle:"middleHand", weakTo:"foot", isUnique: false },
    { name:"抜き打ち小テスト", icon:"📄", recommendedLv:63, hp:18500, atk:1200, def:950, spd:35, gold:12000, msg:"しまえ！今からテストを配る！", pattern: "double", attackStyle:"lowerKick", weakTo:"hand", weakHeight:"upper", isUnique: false },
    { name:"難解なテスト", icon:"📐", recommendedLv:65, hp:24000, atk:1400, def:1100, spd:38, gold:18000, msg:"極限値を求めよ...", pattern: "all_prob", attackStyle:"middleHand", weakTo:"foot", isUnique: true },
    { name:"浪人生", icon:"🎒", recommendedLv:67, hp:30000, atk:1600, def:1250, spd:45, gold:25000, msg:"背負っているものの重みが違う！", pattern: "defensive", attackStyle:"mixed", weakTo:"foot", isUnique: true },
    { name:"塾の先生", icon:"👨‍💻", recommendedLv:69, hp:40000, atk:1800, def:1450, spd:50, gold:35000, msg:"この問題、過去問で5回やったぞ！", pattern: "boss", attackStyle:"mixed", chargeRate:0.35, weakTo:"hand", isUnique: true }
  ]},
  { id:"stage5", name:"道場", recommendedLv:"71〜80", icon:"🥋", stars:"⭐︎⭐︎⭐︎⭐︎⭐︎", bgm:"epic", bgImg:"image/dojo-battle.svg", enemies:[
    { name:"指導員", icon:"👨", recommendedLv:71, hp:22000, atk:1600, def:1350, spd:55, gold:45000, msg:"基本稽古千回！押忍！", pattern: "all_prob", attackStyle:"upperHand", weakTo:"foot", isUnique: false },
    { name:"師範代", icon:"😎", recommendedLv:73, hp:32000, atk:1850, def:1500, spd:65, gold:70000, msg:"我が拳の冴え、見切れるか！", pattern: "heavy", attackStyle:"mixed", weakTo:"foot", isUnique: true },
    { name:"師範", icon:"👴", recommendedLv:75, hp:45000, atk:2100, def:1650, spd:80, gold:100000, msg:"気合いが足りん！出直してこい！", pattern: "double", attackStyle:"mixed", weakTo:"hand", isUnique: true },
    { name:"館長", icon:"😾", recommendedLv:77, hp:60000, atk:2350, def:1800, spd:95, gold:150000, msg:"道場百年の歴史、我が拳にあり！", pattern: "boss", attackStyle:"mixed", chargeRate:0.32, weakHeight:"lower", isUnique: true },
    { name:"自分", icon:"🪞", recommendedLv:79, hp:80000, atk:2600, def:1950, spd:115, gold:300000, msg:"己に打ち克つ者こそ、真の覇者！", pattern: "boss", attackStyle:"mixed", weakTo:"hand", isUnique: true }
  ]}
];

const SHOP_ITEMS = [
  { id:"i1", name:"プロテイン", icon:"🥤", price:300, type:"hp", val:150, desc:"HPを150回復する" },
  { id:"i2", name:"絆創膏", icon:"🩹", price:500, type:"hp", val:350, desc:"HPを350回復する" },
  { id:"i3", name:"購買のパン", icon:"🥖", price:200, type:"mp", val:30, desc:"MPを30回復する" },
  { id:"i4", name:"エナジードリンク", icon:"⚡", price:600, type:"mp", val:70, desc:"MPを70回復する" },
  { id:"i5", name:"マウスピース", icon:"🦷", price:1200, type:"buff_def", val:10, rate:0.35, desc:"戦闘中、対象の防御力を35%上げる" },
  { id:"i6", name:"サプリメント", icon:"💊", price:1500, type:"buff_atk", val:10, rate:0.25, desc:"戦闘中、対象の攻撃力を25%上げる" },
  { id:"i7", name:"目くらまし粉", icon:"🌫️", price:1800, type:"debuff_atk", rate:0.25, desc:"敵1体の攻撃力を戦闘中25%下げる" }
];

const SHOP_EQUIPS = [
  { id:"e_h1", slot:"頭", name:"野球帽", icon:"🧢", rarity:"N", price:1000, hp:20, def:5, atk:0, spd:0 },
  { id:"e_h2", slot:"頭", name:"オシャレカチューシャ", icon:"🎀", rarity:"N", price:1500, hp:15, def:3, atk:0, spd:5 },
  { id:"e_h3", slot:"頭", name:"茶髪ウィッグ", icon:"💇‍♂️", rarity:"R", price:3000, hp:40, def:10, atk:0, spd:10 },
  { id:"e_h4", slot:"頭", name:"学位授与式の帽子", icon:"🎓", rarity:"SR", price:12000, hp:100, def:20, atk:10, spd:15 },
  { id:"e_h5", slot:"頭", name:"ミッキー風の被り物", icon:"🐭", rarity:"", price:45000, hp:350, def:70, atk:30, spd:25 },
  { id:"e_h6", slot:"頭", name:"気合いの鉢巻", icon:"🎗️", rarity:"UR", price:60000, hp:450, def:80, atk:40, spd:30 },

  { id:"e_b1", slot:"体", name:"部活ジャージ", icon:"👕", rarity:"N", price:1200, hp:30, def:8, atk:0, spd:5 },
  { id:"e_b2", slot:"体", name:"標準型学生服", icon:"👔", rarity:"R", price:4000, hp:80, def:18, atk:5, spd:0 },
  { id:"e_b3", slot:"体", name:"お洒落なドレス", icon:"👗", rarity:"SR", price:10000, hp:120, def:32, atk:7, spd:15 },
  { id:"e_b4", slot:"体", name:"伝統のスクール水着", icon:"🩱", rarity:"SSR", price:18000, hp:180, def:35, atk:10, spd:25 },
  { id:"e_b5", slot:"体", name:"黒帯特注稽古着", icon:"🥋", rarity:"UR", price:55000, hp:550, def:110, atk:60, spd:10 },

  { id:"e_w1", slot:"武器", name:"使い古したチョーク", icon:"🖍️", rarity:"N", price:600, hp:0, def:1, atk:8, spd:3 },
  { id:"e_w2", slot:"武器", name:"スクールバッグ", icon:"👜", rarity:"R", price:3500, hp:20, def:5, atk:22, spd:2 },
  { id:"e_w3", slot:"武器", name:"掃除用具のモップ", icon:"🧹", rarity:"SR", price:15000, hp:50, def:15, atk:65, spd:10 },
  { id:"e_w4", slot:"武器", name:"鈍器並みに分厚い辞書", icon:"📕", rarity:"SSR", price:60000, hp:100, def:30, atk:130, spd:-10 },
  { id:"e_w5", slot:"武器", name:"サイ", icon:"⚔️", rarity:"UR", price:85000, hp:150, def:40, atk:180, spd:-10 },

  { id:"e_a1", slot:"装飾", name:"キーホルダー", icon:"🔑", rarity:"N", price:800, hp:10, def:2, atk:2, spd:6 },
  { id:"e_a2", slot:"装飾", name:"ワイヤレスイヤホン", icon:"🎧", rarity:"R", price:5000, hp:30, def:8, atk:12, spd:15 },
  { id:"e_a3", slot:"装飾", name:"最新スマートウォッチ", icon:"⌚", rarity:"SR", price:22000, hp:100, def:25, atk:25, spd:30 },
  { id:"e_a4", slot:"装飾", name:"ピンキーリング", icon:"💍", rarity:"SSR", price:42000, hp:300, def:45, atk:45, spd:35 },
  { id:"e_a5", slot:"装飾", name:"ロケットペンダント(師範代の写真入り)", icon:"🖼️", rarity:"UR", price:99000, hp:500, def:100, atk:100, spd:50 }
];