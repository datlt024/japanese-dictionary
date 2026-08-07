// JLPT N5 July 2024 — 言語知識（文字・語彙）+ 言語知識（文法）・読解
// Explanations are stored in ./explanations/n5-2024.json and merged at export time.

import _explanations from "./explanations/n5-2024.json"

interface StaticQuestion {
  groupId: string
  sectionId: string
  type: "kanji_reading" | "kanji_writing" | "context_vocab" | "grammar_blank" | "listening_pic" | "listening_text" | "listening_scene"
  display: string
  reading?: string
  sentence?: string
  context?: string
  options: string[]
  correctIndex: number
  audioSrc?: string
  imageSrc?: string
  audioStart?: number
  audioEnd?: number
  explanation?: string
}

// ─── もんだい3 (q7) passages ───────────────────────────────────────────────

const PASSAGE_Q7_2024 =
  `<p style="font-size:13px;margin:0 0 4px;color:#374151;">りゅうがくせいの ブラウンさんと レーさんは さくぶんを 書いて、クラスの みんなの 前で 読みました。</p>
<p style="font-size:13px;margin:0 0 6px;font-weight:600;">（１）ブラウンさんの さくぶん</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;margin-bottom:14px;">
<p style="margin:0;">　先週の 日曜日に 私は はじめて 日本の えいがかんで えいがを 見ました。駅の 近く <span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">14</span> 新しい えいがかんで 見ました。えいがかんは 広くて、とても きれいでした。また <span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">15</span>。</p>
</div>
<p style="font-size:13px;margin:0 0 6px;font-weight:600;">（２）レーさんの さくぶん</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0;">　私は 先週の 土曜日に うちで ともだちと りょうりを しました。私たちは 二つの りょうりを 作りました。はじめは、おにぎりを 作りました。<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">16</span>、やさいの みそしるを 作りました。おにぎりは 少し むずかしかったです。でも、みそしるは <span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">17</span>。ともだちと 作った おにぎりと みそしるは おいしかったです。</p>
</div>`

// ─── もんだい4 (q8) contexts ───────────────────────────────────────────────

const PASSAGE_Q8_2024_1 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">（会社で）ムムさんは 同じ 会社の 大友さんに メールを しました。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 18px;font-size:14px;line-height:2;">
<p style="margin:0 0 10px;">大友さん</p>
<p style="margin:0 0 10px;">　机の 上の おかしを ありがとう。旅行は どうでしたか。</p>
<p style="margin:0 0 10px;">　今、大友さんの ところに 行きましたが、いませんでしたから、メールを しました。</p>
<p style="margin:0 0 10px;">　おいしかったです。ごちそうさまでした。</p>
<p style="text-align:right;margin:0;">ムム</p>
</div>`

const PASSAGE_Q8_2024_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0;">　学生の ころ、私は いつも 友だちと 話しながら 電車で 学校に 行っていました。今は 一人で 電車で 会社に 行きます。会社まで 1時間、本を 読みながら 行きます。今は 本が 私の 友だちです。</p>
</div>`

// ─── もんだい5 (q9) passage ────────────────────────────────────────────────

const PASSAGE_Q9_2024 =
  `<p style="font-size:13px;margin:0 0 4px;color:#374151;">これは ランさんが 書いた さくぶんです。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="text-align:center;margin:0 0 6px;font-weight:600;">青木山に のぼりました　　ラン</p>
<p style="margin:0 0 8px;">　きのう、はじめて 青木山に のぼりました。山の 上の さくらが 見たかったからです。</p>
<p style="margin:0 0 8px;">　山の 入り口から 山の 上まで 2時間 かかります。私は 15分ぐらい のぼって、すぐに つかれました。でも、山で 会った 人たちが みんな、私に 元気な 声で「こんにちは。」と 言いました。ちょっと <u>①うれしかった</u>です。</p>
<p style="margin:0 0 8px;">　1時ごろ 山の 上に 着きました。さくらの 木は ありましたが、花は ありませんでした。近くに いた 女の人に「さくらの 花は まだですか。」と 聞きました。女の人は「山の 上は 寒いですから、花は まだですよ。来月の はじめごろは きれいですよ。」と 言いました。</p>
<p style="margin:0;">　ですから、<u>②来月また行きたい</u>です。</p>
</div>`

// ─── もんだい6 (q10) advertisement ─────────────────────────────────────────

const PASSAGE_Q10_2024 =
  `<div style="border:2px solid #374151;border-radius:8px;overflow:hidden;font-size:13px;">
<div style="background:#374151;color:#fff;padding:8px 14px;text-align:center;font-weight:700;font-size:14px;">なかいの町　今週の 安い 店</div>
<div style="padding:6px 14px;text-align:center;border-bottom:1px solid #e5e7eb;line-height:1.8;font-size:13px;">
12月 13日（金）・14日（土）・15日（日）<br>
今週は 下の 四つの 店が 安いですよ
</div>
<table style="width:100%;border-collapse:collapse;font-size:13px;">
<tbody>
<tr>
<td style="padding:10px;border:1px solid #d1d5db;vertical-align:top;width:50%;">
<div style="font-weight:600;text-align:center;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:6px;">① 六八くだもの<br><span style="font-weight:400;font-size:12px;">電話：722-7868</span></div>
<div><b>13日（金）</b></div>
<div style="display:flex;justify-content:space-between;">みかん <span>198円</span></div>
<div><b>14日（土）</b></div>
<div style="display:flex;justify-content:space-between;">バナナ <span>89円</span></div>
<div><b>15日（日）</b></div>
<div style="display:flex;justify-content:space-between;">いちご <span>300円</span></div>
</td>
<td style="padding:10px;border:1px solid #d1d5db;vertical-align:top;width:50%;">
<div style="font-weight:600;text-align:center;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:6px;">② とりの たかだ<br><span style="font-weight:400;font-size:12px;">電話：722-0193</span></div>
<div><b>13日（金）</b></div>
<div style="display:flex;justify-content:space-between;">とり肉 <span>150円</span></div>
<div><b>14日（土）</b></div>
<div style="display:flex;justify-content:space-between;">たまご <span>99円</span></div>
<div><b>15日（日）</b></div>
<div style="display:flex;justify-content:space-between;">とり肉 <span>150円</span></div>
</td>
</tr>
<tr>
<td style="padding:10px;border:1px solid #d1d5db;vertical-align:top;background:#f9fafb;">
<div style="font-weight:600;text-align:center;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:6px;">③ すずきスーパー<br><span style="font-weight:400;font-size:12px;">電話：725-8531</span></div>
<div><b>13日（金）</b></div>
<div style="display:flex;justify-content:space-between;">ジュース <span>50円</span></div>
<div><b>14日（土）</b></div>
<div style="display:flex;justify-content:space-between;">とうふ <span>48円</span></div>
<div><b>15日（日）</b></div>
<div style="display:flex;justify-content:space-between;">チョコレート <span>88円</span></div>
</td>
<td style="padding:10px;border:1px solid #d1d5db;vertical-align:top;background:#f9fafb;">
<div style="font-weight:600;text-align:center;border-bottom:1px solid #e5e7eb;padding-bottom:4px;margin-bottom:6px;">④ スーパーやまだ<br><span style="font-weight:400;font-size:12px;">電話：721-9040</span></div>
<div><b>13日（金）</b></div>
<div style="display:flex;justify-content:space-between;">りんご <span>50円</span></div>
<div><b>14日（土）</b></div>
<div style="display:flex;justify-content:space-between;">ぎゅうにゅう <span>120円</span></div>
<div><b>15日（日）</b></div>
<div style="display:flex;justify-content:space-between;">アイスクリーム <span>80円</span></div>
</td>
</tr>
</tbody>
</table>
</div>`

const _explanationsMap = _explanations as Record<string, string>

const _RAW: StaticQuestion[] = [

  // ════════════════════════════════════════════════════════════════════════
  // 言語知識（文字・語彙）
  // ════════════════════════════════════════════════════════════════════════

  // ─── 問題1 (q1): 漢字の読み (7問) ────────────────────────────────────

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "店", sentence: "いま[店]の まえに います。",
    options: ["いえ", "えき", "みせ", "へや"], correctIndex: 2
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "外国", sentence: "たなかさんは いま[外国]に います。",
    options: ["がいしゃ", "かいしゃ", "かいこく", "がいこく"], correctIndex: 3
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "話", sentence: "さとうさんは[話]が じょうずです。",
    options: ["うた", "はなし", "え", "じ"], correctIndex: 1
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "読んで", sentence: "はやしさんも[読んで]ください。",
    options: ["あそんで", "ならんで", "よんで", "えらんで"], correctIndex: 2
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "北がわ", sentence: "あたらしい こうえんは まちの[北がわ]に あります。",
    options: ["ひがしがわ", "みなみがわ", "にしがわ", "きたがわ"], correctIndex: 3
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "九月", sentence: "わたしは[九月]に けっこんします。",
    options: ["くがつ", "きゅうがつ", "くげつ", "きゅうげつ"], correctIndex: 0
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "来なかった", sentence: "きのう[来なかった]ひとは だれですか。",
    options: ["きなかった", "こなかった", "いなかった", "ねなかった"], correctIndex: 1
  },

  // ─── 問題2 (q2): 漢字の書き (5問) ────────────────────────────────────

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "てんき", sentence: "[てんき]が わるいですから、うちに いましょう。",
    options: ["天汽", "矢気", "天気", "矢汽"], correctIndex: 2
  },
  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "そら", sentence: "あちらの[そら]を みて ください。",
    options: ["犬", "花", "山", "空"], correctIndex: 3
  },
  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "たって", sentence: "さとうさんも[たって]ください。",
    options: ["立って", "食って", "位って", "喰って"], correctIndex: 0
  },
  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "がくせい", sentence: "[がくせい]は なんにん いますか。",
    options: ["先生", "学生", "学主", "先主"], correctIndex: 1
  },
  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "おりて", sentence: "かいだんを[おりて]ください。",
    options: ["上りて", "止りて", "不りて", "下りて"], correctIndex: 3
  },

  // ─── 問題3 (q3): 文脈規定 (6問) ──────────────────────────────────────

  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "えいがの（　　）を 2まい かいました。",
    sentence: "えいがの[　　]を 2まい かいました。",
    options: ["ケーキ", "チケット", "ギター", "タクシー"], correctIndex: 1
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "びょういんは うちから（　　）ですから、バスで いきます。",
    sentence: "びょういんは うちから[　　]ですから、バスで いきます。",
    options: ["ながい", "おおい", "おそい", "とおい"], correctIndex: 3
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "きょうは いもうとの 12（　　）のたんじょうびです。",
    sentence: "きょうは いもうとの 12[　　]のたんじょうびです。",
    options: ["ねん", "さい", "だい", "えん"], correctIndex: 1
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "（　　）を わすれましたから、おかねを もって いません。",
    sentence: "[　　]を わすれましたから、おかねを もって いません。",
    options: ["かぎ", "とけい", "さいふ", "かさ"], correctIndex: 2
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "りょこうの ときは くろい くつを（　　）。",
    sentence: "りょこうの ときは くろい くつを[　　]。",
    options: ["はきます", "つけます", "かけます", "かぶります"], correctIndex: 0
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "きょうは じゅぎょうの あと、すぐ いえに（　　）。",
    sentence: "きょうは じゅぎょうの あと、すぐ いえに[　　]。",
    options: ["かえります", "すみます", "あるきます", "でかけます"], correctIndex: 0
  },

  // ─── 問題4 (q4): 言い換え類義 (3問) ──────────────────────────────────

  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "けさ、はやしさんに あいました。",
    sentence: "<u>けさ、はやしさんに あいました。</u>",
    options: [
      "きのうの あさ、はやしさんに あいました。",
      "きょうの ひる、はやしさんに あいました。",
      "きょうの あさ、はやしさんに あいました。",
      "きのうの ひる、はやしさんに あいました。",
    ], correctIndex: 2
  },
  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "この かんじは かんたんです。",
    sentence: "<u>この かんじは かんたんです。</u>",
    options: [
      "この かんじは やさしいです。",
      "この かんじは むずかしいです。",
      "この かんじは おもしろいです。",
      "この かんじは つまらないです。",
    ], correctIndex: 0
  },
  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "たなかさんは リーさんに さくぶんを おしえました。",
    sentence: "<u>たなかさんは リーさんに さくぶんを おしえました。</u>",
    options: [
      "リーさんは たなかさんに さくぶんを わたしました。",
      "たなかさんは リーさんに さくぶんを ならいました。",
      "たなかさんは リーさんに さくぶんを わたしました。",
      "リーさんは たなかさんに さくぶんを ならいました。",
    ], correctIndex: 3
  },

  // ════════════════════════════════════════════════════════════════════════
  // 言語知識（文法）・読解
  // ════════════════════════════════════════════════════════════════════════

  // ─── 問題1 (q5): 文法空欄補充 (9問) ──────────────────────────────────

  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "私は 一か月（　）2回、ギターを 習っています。",
    sentence: "私は 一か月[　]2回、ギターを 習っています。",
    options: ["も", "が", "を", "に"], correctIndex: 3
  },
  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "日曜日に 買い物（　）さんぽを します。",
    sentence: "日曜日に 買い物[　]さんぽを します。",
    options: ["へ", "も", "や", "ぐらい"], correctIndex: 2
  },
  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "私の 母は 銀行（　）はたらいています。",
    sentence: "私の 母は 銀行[　]はたらいています。",
    options: ["が", "で", "へ", "に"], correctIndex: 1
  },
  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "私は 新しい カメラ（　）ほしいです。",
    sentence: "私は 新しい カメラ[　]ほしいです。",
    options: ["で", "か", "に", "が"], correctIndex: 3
  },
  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "きのう 私は デパートに 行きましたが、（　）買いませんでした。",
    sentence: "きのう 私は デパートに 行きましたが、[　]買いませんでした。",
    options: ["何を", "何も", "何か", "何に"], correctIndex: 1
  },
  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "A食堂の ラーメンは、大学の 食堂の ラーメンより（　）おいしいです。",
    sentence: "A食堂の ラーメンは、大学の 食堂の ラーメンより[　]おいしいです。",
    options: ["あまり", "すぐ", "ずっと", "いちばん"], correctIndex: 2
  },
  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "（店で）\nA「この ペンは（　）ですか。」\nB「100円です。」",
    sentence: "（店で）\nA「この ペンは[　]ですか。」\nB「100円です。」",
    options: ["いくら", "いくつ", "どれ", "どうして"], correctIndex: 0
  },
  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "きのうの 夜、（　）前に 本を 読みました。",
    sentence: "きのうの 夜、[　]前に 本を 読みました。",
    options: ["ねる", "ねて", "ねた", "ねている"], correctIndex: 0
  },
  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "リー「林さん、にもつが 多いですね。少し（　）。」\n林「あ、すみません。おねがいします。」",
    sentence: "リー「林さん、にもつが 多いですね。少し[　]。」\n林「あ、すみません。おねがいします。」",
    options: ["持っていませんか", "持たないでください", "もちましたね", "持ちましょうか"], correctIndex: 3
  },

  // ─── 問題2 (q6): 文の組み立て（★）(4問) ─────────────────────────────

  // Q10 — 私はたんじょうびにそふがくれたカメラを毎日使っています
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "私は たんじょうびに ___ ★ ___ ___ 使っています。",
    sentence: "私は たんじょうびに ___ [★] ___ ___ 使っています。",
    options: ["くれた", "毎日", "カメラを", "そふが"],
    correctIndex: 0
  },

  // Q11 — こうえんには鳥がたくさんいます
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "こうえん ___ ___ ★ ___ たくさん います。",
    sentence: "こうえん ___ ___ [★] ___ たくさん います。",
    options: ["鳥", "に", "は", "が"],
    correctIndex: 0
  },

  // Q12 — 今年の夏は海ではなくて山に行きます
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "今年の 夏 ___ ___ ★ ___ 山に 行きます。",
    sentence: "今年の 夏 ___ ___ [★] ___ 山に 行きます。",
    options: ["海", "では", "は", "なくて"],
    correctIndex: 1
  },

  // Q13 — 私は毎朝へやをそうじしてから家を出ます
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "私は 毎朝 へやを ___ ___ ★ ___ 出ます。",
    sentence: "私は 毎朝 へやを ___ ___ [★] ___ 出ます。",
    options: ["を", "から", "家", "そうじして"],
    correctIndex: 2
  },

  // ─── 問題3 (q7): 文章の文法 — 空欄補充 (4問) ────────────────────────

  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（14）",
    sentence: "（14）に入るものを選んでください。",
    context: PASSAGE_Q7_2024,
    options: ["も", "は", "の", "と"],
    correctIndex: 2
  },
  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（15）",
    sentence: "（15）に入るものを選んでください。",
    context: PASSAGE_Q7_2024,
    options: ["行ってください", "行きたいです", "来てください", "来たいです"],
    correctIndex: 1
  },
  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（16）",
    sentence: "（16）に入るものを選んでください。",
    context: PASSAGE_Q7_2024,
    options: ["いつも", "もう", "しかし", "それから"],
    correctIndex: 3
  },
  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（17）",
    sentence: "（17）に入るものを選んでください。",
    context: PASSAGE_Q7_2024,
    options: ["かんたんでした", "かんたんだったからです", "かんたんでは ありませんでした", "かんたんでは なかったからです"],
    correctIndex: 0
  },

  // ─── 問題4 (q8): 短文読解 (2問) ─────────────────────────────────────

  {
    groupId: "q8", sectionId: "grammar", type: "grammar_blank",
    display: "このメールで、ムムさんは 大友さんに 何が 言いたいですか。",
    sentence: "このメールで、ムムさんは 大友さんに 何が 言いたいですか。",
    context: PASSAGE_Q8_2024_1,
    options: [
      "おかしを ありがとうございます。",
      "わたしも 旅行に 行きたいです。",
      "今、大友さんは どこに いますか。",
      "わたしも おかしが 好きです。",
    ], correctIndex: 0
  },
  {
    groupId: "q8", sectionId: "grammar", type: "grammar_blank",
    display: "「私」は 今、電車の 中で 何を しますか。",
    sentence: "「私」は 今、電車の 中で 何を しますか。",
    context: PASSAGE_Q8_2024_2,
    options: [
      "友だちと 話します。",
      "友だちと 本を 読みます。",
      "一人で 本を 読みます。",
      "会社の 人と 話します。",
    ], correctIndex: 2
  },

  // ─── 問題5 (q9): 長文読解 (2問) ─────────────────────────────────────

  {
    groupId: "q9", sectionId: "grammar", type: "grammar_blank",
    display: "どうして ①うれしかったですか。",
    sentence: "どうして ①うれしかったですか。",
    context: PASSAGE_Q9_2024,
    options: [
      "はじめて 青木山に のぼったから。",
      "山で ぜんぜん つかれなかったから。",
      "山で 会った 人たちと いっしょに 山に のぼったから。",
      "山で 会った 人たちが 「私」に「こんにちは。」と 言ったから。",
    ], correctIndex: 3
  },
  {
    groupId: "q9", sectionId: "grammar", type: "grammar_blank",
    display: "どうして ②来月また行きたいですか。",
    sentence: "どうして ②来月また行きたいですか。",
    context: PASSAGE_Q9_2024,
    options: [
      "さくらの 花が 見たいから。",
      "さくらではない ほかの 花も 見たいから。",
      "山で 会った 女の人に また会いたいから。",
      "山で もっと たくさんの 人と 話したいから。",
    ], correctIndex: 0
  },

  // ─── 問題6 (q10): 情報検索 (1問) ────────────────────────────────────

  {
    groupId: "q10", sectionId: "grammar", type: "grammar_blank",
    display: "ダトさんは、たまごと りんごを 安い日に 買いたいです。いつ どの店へ 行きますか。",
    sentence: "ダトさんは、たまごと りんごを 安い日に 買いたいです。いつ どの店へ 行きますか。",
    context: PASSAGE_Q10_2024,
    options: [
      "13日に④、14日に②",
      "13日に④、15日に①",
      "14日に②、15日に①",
      "14日に②、15日に④",
    ], correctIndex: 0
  },

  // ════════════════════════════════════════════════════════════════════════
  // 聴解
  // ════════════════════════════════════════════════════════════════════════
  // audioStart / audioEnd: giây trong file /exams/n5-2024/audio/listening.m4a
  // correctIndex: điền sau khi có audio

  // ─── もんだい1 (lq1): 7問 — 絵4枚から正しいものを選ぶ ─────────────────

  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "1ばん", options: ["1", "2", "3", "4"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq1_q1.png",
  },
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "2ばん", options: ["みどり", "あお", "きいろ", "ちゃいろ"], correctIndex: 1,
  },
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "3ばん", options: ["かようび", "すいようび", "もくようび", "きんようび"], correctIndex: 0,
  },
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "4ばん", options: ["300えん", "500えん", "600えん", "800えん"], correctIndex: 0,
  },
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "5ばん", options: ["1", "2", "3", "4"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq1_q5.png",
  },
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "6ばん", options: ["ノートとペン", "ノートとひるごはん", "ペンとのみもの", "のみものとひるごはん"], correctIndex: 0,
  },
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "7ばん", options: ["1", "2", "3", "4"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq1_q7.png",
  },

  // ─── もんだい2 (lq2): 6問 — 絵4枚から正しいものを選ぶ ─────────────────

  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "1ばん", options: ["1", "2", "3", "4"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq2_q1.png",
  },
  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "2ばん", options: ["1", "2", "3", "4"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq2_q2.png",
  },
  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "3ばん", options: ["1", "2", "3", "4"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq2_q3.png",
  },
  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "4ばん", options: ["かいしゃのしょくどう", "ラーメンや", "うどんや", "カレーや"], correctIndex: 0,
  },
  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "5ばん", options: ["1", "2", "3", "4"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq2_q5.png",
  },
  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "6ばん", options: ["だい4かい", "だい5かい", "だい6かい", "だい7かい"], correctIndex: 0,
  },

  // ─── もんだい3 (lq3): 5問 — 絵を見ながら答える ───────────────────────

  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "1ばん", options: ["1", "2", "3"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq3_q1.png",
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "2ばん", options: ["1", "2", "3"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq3_q2.png",
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "3ばん", options: ["1", "2", "3"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq3_q3.png",
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "4ばん", options: ["1", "2", "3"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq3_q4.png",
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "5ばん", options: ["1", "2", "3"], correctIndex: 0,
    imageSrc: "/exams/n5-2024/listening/lq3_q5.png",
  },

  // ─── もんだい4 (lq4): 6問 — 絵なし、文を聞いて返事を選ぶ ───────────────

  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "1ばん", options: ["1", "2", "3"], correctIndex: 0,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "2ばん", options: ["1", "2", "3"], correctIndex: 0,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "3ばん", options: ["1", "2", "3"], correctIndex: 0,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "4ばん", options: ["1", "2", "3"], correctIndex: 0,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "5ばん", options: ["1", "2", "3"], correctIndex: 0,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "6ばん", options: ["1", "2", "3"], correctIndex: 0,
  },

]

export const N5_2024_QUESTIONS: StaticQuestion[] = _RAW.map(q => {
  const key = `${q.groupId}:${q.display}`
  const json = _explanationsMap[key]
  return json ? { ...q, explanation: json } : q
})

export const N5_2024_COUNTS = {
    vocab:     N5_2024_QUESTIONS.filter(q => q.sectionId === "vocab").length,
    grammar:   N5_2024_QUESTIONS.filter(q => q.sectionId === "grammar").length,
    listening: N5_2024_QUESTIONS.filter(q => q.sectionId === "listening").length,
    get total() { return this.vocab + this.grammar + this.listening },
}
