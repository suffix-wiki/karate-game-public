/* ==========================================================================
   GAME DATA & CONSTANTS
   ========================================================================== */
const TITLES = [
  "白帯", "黄帯", "オレンジ帯", "緑帯", "水色帯", "紫帯", "茶帯",
  "黒帯", "黒帯(指導員)", "黒帯(師範代)", "黒帯(師範)", "黒帯(館長)", "達人", "超越者"
];

const AVATARS = [
  "🥋", "🥋🏻", "🥋🏽", "🥷", "🥊", "👦", "👧", "🧑‍🦱", "👩‍🦰", "🧔", 
  "🔥", "⚡", "🦁", "🐯", "🦅", "🤖", "👽", "👺", "👑", "💥"
];

const COMPANIONS_MASTER = [
  { id: 1, reqLv: 20, defaultName: "押忍さぶろう", gender: "男", age: 14, avatar: "🥊", hpMul: 0.9, atkMul: 1.0, defMul: 0.9, spdMul: 1.1 },
  { id: 2, reqLv: 40, defaultName: "押忍しろう", gender: "男", age: 15, avatar: "🥷", hpMul: 0.85, atkMul: 1.2, defMul: 0.8, spdMul: 1.3 },
  { id: 3, reqLv: 60, defaultName: "押忍ごろう", gender: "男", age: 16, avatar: "🔥", hpMul: 1.25, atkMul: 1.1, defMul: 1.2, spdMul: 0.85 }
];

/* 技マスターデータ */
const SKILLS_MASTER = [
  { id:"atk1", name:"前蹴り", type:"attack", isAll: false, isSpin: false, lv:1, mp:3, power:1.3, desc:"素早い直線的な蹴り", fx:"🦶" },
  { id:"atk2", name:"刻突", type:"attack", isAll: false, isSpin: false, lv:3, mp:4, power:1.1, priority:true, desc:"【先制】相手より先に突きを入れる", fx:"👊" },
  { id:"atk3", name:"逆突", type:"attack", isAll: false, isSpin: false, lv:5, mp:5, power:1.6, desc:"腰の回転をのせた強力な突き", fx:"💥" },
  { id:"atk4", name:"回し蹴り", type:"attack", isAll: true, isSpin: true, lv:8, mp:10, power:1.4, desc:"【全体・回転】遠心力で敵全体を一掃する", fx:"🌀" },
  { id:"atk5", name:"追突", type:"attack", isAll: false, isSpin: false, lv:12, mp:8, power:1.5, priority:true, desc:"【先制】一気に踏み込んで急襲", fx:"⚡" },
  { id:"atk6", name:"三日月蹴り", type:"attack", isAll: false, isSpin: false, lv:16, mp:10, power:2.8, risk:1.5, desc:"【単体大威力】激痛の蹴りだが隙ができる", fx:"🌙" },
  { id:"atk7", name:"旋風脚", type:"attack", isAll: true, isSpin: true, lv:22, mp:18, power:2.2, desc:"【全体・回転】鋭い回転で敵全員を薙ぎ払う", fx:"🌪️" },
  { id:"atk8", name:"二段蹴り", type:"attack", isAll: false, isSpin: false, lv:25, mp:15, power:1.7, hits:2, desc:"【2回連続】空中で二度連続蹴りを見舞う", fx:"👟" },
  { id:"atk9", name:"後ろ回し蹴り", type:"attack", isAll: false, isSpin: true, lv:30, mp:18, power:4.2, risk:2.0, desc:"【単体超絶威力】全身を一回転させ必殺一撃", fx:"🔥" },
  { id:"atk10", name:"百裂突き", type:"attack", isAll: true, isSpin: false, lv:40, mp:28, power:2.8, desc:"【全体】敵全体へ無数の突きの嵐を叩き込む", fx:"⚔️" },

  { id:"def1", name:"挙げ受け", type:"defend", lv:2, mp:3, cut:0.5, counter:0.3, desc:"上段攻撃を跳ね返し反撃", fx:"🛡️" },
  { id:"def2", name:"下段払い", type:"defend", lv:4, mp:4, cut:0.55, counter:0.35, desc:"蹴りを払い落としカウンター", fx:"✋" },
  { id:"def3", name:"内受け", type:"defend", lv:7, mp:5, cut:0.6, counter:0, buffAtk:0.4, desc:"攻撃を防ぎ次の攻撃力を大幅UP", fx:"🛡️" },
  { id:"def4", name:"外受け", type:"defend", lv:10, mp:6, cut:0.65, counter:0.45, desc:"外側から攻撃を受け流して反撃", fx:"✋" },
  { id:"def5", name:"手刀受け", type:"defend", lv:15, mp:8, cut:0.75, counter:0, duration:2, desc:"2ターン継続して高ガードを維持", fx:"🪓" },
  { id:"def6", name:"不動の構え", type:"defend", lv:18, mp:10, cut:0.8, counter:0, buffDef:0.5, desc:"防御力を高めダメージを大幅カット", fx:"🏯" },

  { id:"heal1", name:"息吹", type:"heal", target:"self", lv:6, mp:6, val:120, mode:"hp", desc:"呼吸を整え自身のHPを回復", fx:"✨" },
  { id:"heal2", name:"傷の手当", type:"heal", target:"single", lv:9, mp:8, val:180, mode:"hp", desc:"仲間一人のHPを回復する", fx:"🩹" },
  { id:"heal3", name:"瞑想", type:"heal", target:"self", lv:14, mp:0, val:40, mode:"mp", desc:"精神を統一し自身のMPを回復", fx:"🧘" },
  { id:"heal4", name:"応援", type:"heal", target:"single", lv:21, mp:10, val:35, mode:"mp", desc:"仲間一人を鼓舞しMPを回復させる", fx:"📣" },
  { id:"heal5", name:"気功回復", type:"heal", target:"all", lv:32, mp:22, val:250, mode:"hp", desc:"気流を放ち味方全員のHPを大きく回復", fx:"💚" }
];

/* 敵データ */
const STAGES_MASTER = [
  { id:"stage1", name:"自宅", icon:"🏠", stars:"⭐︎", bgm:"intense", bgImg:"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiNYs8xSRASessx0O-RDjSrwd0X7WQmlRIaBYNqRo2vIAnx60hwV_hjpyXt4a_JXcdmzK50OK2TCarPT-ePhJyUYE32ZkZtdPJui36KL2epfO4KdtH7PoQ4ma4E-mBodQEdAkgSvD8h7gKy/s800/room_youshitsu.png", enemies:[
    { name:"睡魔", icon:"🥱", hp:60, atk:8, def:2, spd:5, gold:80, msg:"ウトウトしてきた...", pattern: "single", isUnique: false },
    { name:"ゲーム機", icon:"🎮", hp:110, atk:12, def:4, spd:8, gold:120, msg:"あと1分だけ...", pattern: "single", isUnique: false },
    { name:"トイレ", icon:"🚽", hp:150, atk:10, def:8, spd:2, gold:150, msg:"こもると快適...", pattern: "defensive", isUnique: false },
    { name:"お父さん", icon:"👨", hp:250, atk:18, def:10, spd:10, gold:300, msg:"宿題はおわったのか？", pattern: "all_prob", isUnique: true },
    { name:"お母さん", icon:"👩", hp:400, atk:25, def:12, spd:15, gold:500, msg:"部屋の掃除をしなさい！", pattern: "boss", isUnique: true }
  ]},
  { id:"stage2", name:"教室", icon:"🏫", stars:"⭐︎⭐︎", bgm:"intense", bgImg:"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPOhWDPVD9wMvDy4K74KNokVyjpJp6pacaFVWIYcrR1ROZ5ZATKt4gpOY-dZEsqoDxLbSEzF5OVzFUmuFjxYETZi0Y6JjYw5Ht6FOHa49SqRRkLz2l2HjlV4teevsk60RS4UdJHl-WTjU/s800/bg_school_room_back.jpg", enemies:[
    { name:"同級生", icon:"👦", hp:350, atk:22, def:10, spd:12, gold:350, msg:"放課後カラオケ行こうぜ！", pattern: "single", isUnique: false },
    { name:"学級委員長", icon:"👓", hp:550, atk:28, def:15, spd:14, gold:500, msg:"校則はしっかり守りましょう！", pattern: "all_prob", isUnique: true },
    { name:"担任の先生", icon:"👨‍🏫", hp:900, atk:38, def:20, spd:18, gold:900, msg:"そこ！廊下を走らない！", pattern: "all_prob", isUnique: true },
    { name:"教頭先生", icon:"👴", hp:1400, atk:50, def:30, spd:15, gold:1500, msg:"盆裁の手入れで忙しいんじゃ", pattern: "defensive", isUnique: true },
    { name:"校長先生", icon:"🧔‍♂️", hp:2200, atk:65, def:40, spd:20, gold:2500, msg:"皆さんが静かになるまで3分かかりました", pattern: "boss", isUnique: true }
  ]},
  { id:"stage3", name:"ショッピングモール", icon:"🛍️", stars:"⭐︎⭐︎⭐︎", bgm:"intense", bgImg:"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhK064xVNLQE2lv5Or82ysxYZs1apnxOPiXTNIz2FHFvIcv4LAcxWxXWzC6df1rUm_9yyz4pkLd2Hv1Zs1Tpjp5bs6JXLv40unRmOndysU1-KxUdf8ekzFv4_9_-Xt1zUHB4X-3Z5C4pxUq/s800/shopping_mall_ekinaka.png", enemies:[
    { name:"買い食いの誘惑", icon:"🍟", hp:2000, atk:55, def:25, spd:18, gold:1500, msg:"揚げたてポテトのいい香り...", pattern: "all_prob", isUnique: false },
    { name:"遊びの誘惑", icon:"🕹️", hp:3200, atk:75, def:30, spd:24, gold:2500, msg:"新作クレーンゲーム入荷！", pattern: "single", isUnique: false },
    { name:"詐欺師", icon:"🕶️", hp:4800, atk:95, def:40, spd:30, gold:4000, msg:"絶対儲かる話があるんだけど", pattern: "all_prob", isUnique: true },
    { name:"不審者", icon:"🥸", hp:6800, atk:120, def:50, spd:28, gold:6000, msg:"ちょっとお茶でもいかが？", pattern: "defensive", isUnique: true },
    { name:"他校の強豪空手部員", icon:"🥋", hp:9500, atk:150, def:65, spd:38, gold:9000, msg:"ウチの道場の看板、背負ってんだよ！", pattern: "boss", isUnique: true }
  ]},
  { id:"stage4", name:"学習塾", icon:"✏️", stars:"⭐︎⭐︎⭐︎⭐︎", bgm:"epic", bgImg:"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiQzJCIwUWlk4zNeTDKb509FD7uGjLT0I4k7JzJfLp2yv4ekXjkgT3Ubj6TwzlmkVc8_xyPn2uXIyzIxFNJpX4csWvByD2RtPTHkirxSAMGG6IZBkOE0rxocvd5Tpcc-QdEHYdtYiBGamyT/s800/schoo_room_shichoukakushitsu.png", enemies:[
    { name:"宿題", icon:"📝", hp:12000, atk:130, def:55, spd:25, gold:8000, msg:"提出期限は明日朝8時！", pattern: "single", isUnique: false },
    { name:"抜き打ち小テスト", icon:"📄", hp:18000, atk:165, def:70, spd:35, gold:12000, msg:"しまえ！今からテストを配る！", pattern: "all_prob", isUnique: false },
    { name:"難解なテスト", icon:"📐", hp:25000, atk:210, def:85, spd:38, gold:18000, msg:"極限値を求めよ...", pattern: "all_prob", isUnique: true },
    { name:"浪人生", icon:"🎒", hp:35000, atk:260, def:110, spd:45, gold:25000, msg:"背負っているものの重みが違う！", pattern: "defensive", isUnique: true },
    { name:"塾の先生", icon:"👨‍💻", hp:50000, atk:320, def:140, spd:50, gold:35000, msg:"この問題、過去問で5回やったぞ！", pattern: "boss", isUnique: true }
  ]},
  { id:"stage5", name:"道場", icon:"🥋", stars:"⭐︎⭐︎⭐︎⭐︎⭐︎", bgm:"epic", bgImg:"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhfPsz5-xMRkiUSrpWRsVX_f8QjyDB97GZXgxszd7weyyLSfXlMKgk0ogISbQVemnn4Pd2Tx3_4k-4_3TtK1C9weZk3aKtDG0hex3uhQ2Zh1HhvNHwLYE7iXRUhBI1OJLSuu58cfZJjAAX8/s2000/bg_doujou.jpg", enemies:[
    { name:"指導員", icon:"🥋", hp:65000, atk:380, def:160, spd:55, gold:45000, msg:"基本稽古千回！押忍！", pattern: "all_prob", isUnique: false },
    { name:"師範代", icon:"🥋🔥", hp:90000, atk:480, def:200, spd:65, gold:70000, msg:"我が拳の冴え、見切れるか！", pattern: "all_prob", isUnique: true },
    { name:"師範", icon:"🥋⚡", hp:130000, atk:600, def:260, spd:80, gold:100000, msg:"気合いが足りん！出直してこい！", pattern: "boss", isUnique: true },
    { name:"館長", icon:"🥋👑", hp:180000, atk:750, def:340, spd:95, gold:150000, msg:"道場百年の歴史、我が拳にあり！", pattern: "boss", isUnique: true },
    { name:"自分", icon:"🪞", hp:250000, atk:950, def:450, spd:115, gold:300000, msg:"己に打ち克つ者こそ、真の覇者！", pattern: "boss", isUnique: true }
  ]}
];

const SHOP_ITEMS = [
  { id:"i1", name:"プロテイン", icon:"🥤", price:300, type:"hp", val:150, desc:"HPを150回復する" },
  { id:"i2", name:"サロンパス", icon:"🩹", price:500, type:"hp", val:350, desc:"HPを350回復する" },
  { id:"i3", name:"購買のパン", icon:"🥖", price:200, type:"mp", val:30, desc:"MPを30回復する" },
  { id:"i4", name:"エナジードリンク", icon:"⚡", price:600, type:"mp", val:70, desc:"MPを70回復する" },
  { id:"i5", name:"マウスピース", icon:"🦷", price:1200, type:"buff_def", val:10, desc:"戦闘中の防御力を高める" },
  { id:"i6", name:"バンテージ", icon:"🩹", price:1500, type:"buff_atk", val:10, desc:"戦闘中の攻撃力を高める" }
];

const SHOP_EQUIPS = [
  { id:"e_h1", slot:"頭", name:"ヘッドガード", icon:"🪖", rarity:"N", price:1000, hp:20, def:5, atk:0, spd:0 },
  { id:"e_h2", slot:"頭", name:"オシャレカチューシャ", icon:"🎀", rarity:"N", price:1500, hp:15, def:3, atk:0, spd:5 },
  { id:"e_h3", slot:"頭", name:"スポーツヘアバンド", icon:"🩹", rarity:"R", price:3000, hp:40, def:10, atk:0, spd:10 },
  { id:"e_h4", slot:"頭", name:"茶髪ウルフウィッグ", icon:"💇‍♂️", rarity:"SR", price:12000, hp:100, def:20, atk:10, spd:15 },
  { id:"e_h5", slot:"頭", name:"ミッキー風の被り物", icon:"🐭", rarity:"SSR", price:45000, hp:350, def:70, atk:30, spd:25 },

  { id:"e_b1", slot:"体", name:"部活ジャージ", icon:"👕", rarity:"N", price:1200, hp:30, def:8, atk:0, spd:5 },
  { id:"e_b2", slot:"体", name:"標準型学生服", icon:"👔", rarity:"R", price:4000, hp:80, def:18, atk:5, spd:0 },
  { id:"e_b3", slot:"体", name:"伝統のスクール水着", icon:"🩱", rarity:"SR", price:18000, hp:180, def:35, atk:10, spd:25 },
  { id:"e_b4", slot:"体", name:"黒帯特注稽古着", icon:"🥋", rarity:"SSR", price:55000, hp:550, def:110, atk:60, spd:10 },

  { id:"e_w1", slot:"武器", name:"使い古したチョーク", icon:"🖍️", rarity:"N", price:600, hp:0, def:1, atk:8, spd:3 },
  { id:"e_w2", slot:"武器", name:"スクールバッグ", icon:"👜", rarity:"R", price:3500, hp:20, def:5, atk:22, spd:2 },
  { id:"e_w3", slot:"武器", name:"掃除用具のモップ", icon:"🧹", rarity:"SR", price:15000, hp:50, def:15, atk:65, spd:10 },
  { id:"e_w4", slot:"武器", name:"鈍器並みに分厚い辞書", icon:"📕", rarity:"UR", price:85000, hp:150, def:40, atk:180, spd:-10 },

  { id:"e_a1", slot:"装飾", name:"ジャラジャラキーホルダー", icon:"🔑", rarity:"N", price:800, hp:10, def:2, atk:2, spd:6 },
  { id:"e_a2", slot:"装飾", name:"ワイヤレスイヤホン", icon:"🎧", rarity:"R", price:5000, hp:30, def:8, atk:12, spd:15 },
  { id:"e_a3", slot:"装飾", name:"最新スマートウォッチ", icon:"⌚", rarity:"SR", price:22000, hp:100, def:25, atk:25, spd:30 },
  { id:"e_a4", slot:"装飾", name:"ロケットペンダント(師範代の写真入り)", icon:"🖼️", rarity:"UR", price:99000, hp:500, def:100, atk:100, spd:50 }
];