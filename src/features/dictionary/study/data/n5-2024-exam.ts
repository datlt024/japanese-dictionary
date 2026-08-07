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
  `<p style="font-size:13px;margin:0 0 6px;font-weight:600;">（１）ブラウンさんの さくぶん</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;margin-bottom:14px;">
<p style="margin:0;">　わたしの うちの ちかく <span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">14</span> 新しい えいがかんが できました。先週、その えいがかんに えいがを 見に 行きました。えいがは おもしろかったです。また <span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">15</span>。</p>
</div>
<p style="font-size:13px;margin:0 0 6px;font-weight:600;">（２）レーさんの さくぶん</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0;">　きのう、りょうりを しました。たまごと やさいを つかいました。たまごは やいて、やさいは <span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">16</span>、やさいの みそしるを 作りました。はじめて 作りましたが、みそしるは <span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">17</span>。</p>
</div>`

// ─── もんだい4 (q8) contexts ───────────────────────────────────────────────

const PASSAGE_Q8_2024_1 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">これは ムムさんが 大友さんに 書いた メールです。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 18px;font-size:14px;line-height:2;">
<p style="margin:0 0 10px;">大友さん</p>
<p style="margin:0 0 10px;">　先週、おかしを いただきました。とても おいしかったです。ありがとうございました。</p>
<p style="margin:0 0 10px;">　また こんど、いっしょに ごはんを 食べましょう。</p>
<p style="text-align:right;margin:0;">ムム</p>
</div>`

const PASSAGE_Q8_2024_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0;">　わたしは まいにち 電車で がっこうに いきます。電車の 中で、ともだちと いっしょの ときは、話します。一人の ときは、本を よみます。</p>
</div>`

// ─── もんだい5 (q9) passage ────────────────────────────────────────────────

const PASSAGE_Q9_2024 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0 0 8px;">　先月、青木山に のぼりました。</p>
<p style="margin:0 0 8px;">　青木山は 高くないですが、きれいな 山です。のぼりはじめると、木が たくさん あります。山の 中で、いろいろな 人と 会いました。みんな「こんにちは。」と 言って くれました。①うれしかったです。</p>
<p style="margin:0 0 8px;">　山の てっぺんに つきました。青木山の てっぺんから、ほかの 山や まちが 見えました。とても きれいでした。</p>
<p style="margin:0 0 8px;">　来月も また 行きたいです。②来月 行けば、さくらの 花が 見られます。</p>
<p style="margin:0;">　青木山に のぼって、よかったです。</p>
</div>`

// ─── もんだい6 (q10) advertisement table ────────────────────────────────────

const PASSAGE_Q10_2024 =
  `<div style="border:2px solid #374151;border-radius:8px;overflow:hidden;font-size:13px;">
<div style="background:#374151;color:#fff;padding:8px 14px;text-align:center;font-weight:700;font-size:15px;">なかい町の今週の安い店</div>
<div style="padding:8px 14px;text-align:center;border-bottom:1px solid #e5e7eb;line-height:1.8;font-size:13px;">
12月13日（金）・14日（土）・15日（日）
</div>
<table style="width:100%;border-collapse:collapse;font-size:13px;">
<thead>
<tr style="background:#f3f4f6;">
<th style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;width:25%;">みせ</th>
<th style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">13日（金）</th>
<th style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">14日（土）</th>
<th style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">15日（日）</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">①六八くだもの<br><span style="font-weight:400;font-size:12px;">722-7868</span></td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">みかん<br>198円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">バナナ<br>89円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">いちご<br>300円</td>
</tr>
<tr style="background:#f9fafb;">
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">②とりのたかだ<br><span style="font-weight:400;font-size:12px;">728-0193</span></td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">とり肉<br>150円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">たまご<br>99円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">とり肉<br>150円</td>
</tr>
<tr>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">③すずきスーパー<br><span style="font-weight:400;font-size:12px;">725-8531</span></td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">ジュース<br>50円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">とうふ<br>48円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">チョコレート<br>88円</td>
</tr>
<tr style="background:#f9fafb;">
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">④スーパーやまだ<br><span style="font-weight:400;font-size:12px;">721-9040</span></td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">りんご<br>50円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">ぎゅうにゅう<br>120円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">アイスクリーム<br>80円</td>
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
    display: "店", sentence: "いま [店]の まえに います。",
    options: ["いえ", "えき", "みせ", "へや"], correctIndex: 2
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "外国", sentence: "たなかさんは いま [外国]に います。",
    options: ["がいしゃ", "かいしゃ", "かいこく", "がいこく"], correctIndex: 3
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "話", sentence: "さとうさんは [話]が じょうずです。",
    options: ["うた", "はなし", "え", "じ"], correctIndex: 1
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "読んで", sentence: "はやしさんも [読んで] ください。",
    options: ["あそんで", "ならんで", "よんで", "えらんで"], correctIndex: 2
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "北がわ", sentence: "こうえんは まちの [北がわ]に あります。",
    options: ["ひがしがわ", "みなみがわ", "にしがわ", "きたがわ"], correctIndex: 3
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "九月", sentence: "わたしは [九月]に けっこんします。",
    options: ["くがつ", "きゅうがつ", "くげつ", "きゅうげつ"], correctIndex: 0
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "来なかった", sentence: "きのう [来なかった]ひとは だれですか。",
    options: ["きなかった", "こなかった", "いなかった", "ねなかった"], correctIndex: 1
  },

  // ─── 問題2 (q2): 漢字の書き (5問) ────────────────────────────────────

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "てんき", sentence: "[てんき]が わるいですから。",
    options: ["天汽", "矢気", "天気", "矢汽"], correctIndex: 2
  },

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "そら", sentence: "あちらの [そら]を みて ください。",
    options: ["犬", "花", "山", "空"], correctIndex: 3
  },

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "たって", sentence: "さとうさんも [たって] ください。",
    options: ["立って", "食って", "位って", "喰って"], correctIndex: 0
  },

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "がくせい", sentence: "[がくせい]は なんにん いますか。",
    options: ["先生", "学生", "学主", "先主"], correctIndex: 1
  },

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "おりて", sentence: "かいだんを [おりて] ください。",
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
    display: "いもうとの 12（　　）の たんじょうびです。",
    sentence: "いもうとの 12[　　]の たんじょうびです。",
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
    display: "くろい くつを（　　）。",
    sentence: "くろい くつを[　　]。",
    options: ["はきます", "つけます", "かぶります", "かけます"], correctIndex: 0
  },

  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "じゅぎょうの あと、すぐ いえに（　　）。",
    sentence: "じゅぎょうの あと、すぐ いえに[　　]。",
    options: ["かえります", "すみます", "あるきます", "でかけます"], correctIndex: 0
  },

  // ─── 問題4 (q4): 言い換え類義 (3問) ──────────────────────────────────

  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "けさ、はやしさんに あいました。",
    sentence: "<u>けさ、はやしさんに あいました。</u>",
    options: [
      "きのうの あさ、はやしさんに あいました。",
      "きのうの よる、はやしさんに あいました。",
      "きょうの あさ、はやしさんに あいました。",
      "きょうの よる、はやしさんに あいました。",
    ], correctIndex: 2
  },

  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "この かんじは かんたんです。",
    sentence: "<u>この かんじは かんたんです。</u>",
    options: [
      "この かんじは やさしいです。",
      "この かんじは むずかしいです。",
      "この かんじは おおきいです。",
      "この かんじは ちいさいです。",
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
    options: ["へ", "も", "や", "は"], correctIndex: 2
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
    display: "（店で）A「この ペンは（　）ですか。」B「100円です。」",
    sentence: "（店で）A「この ペンは[　]ですか。」B「100円です。」",
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
    display: "リー「葉さん、にもつが 多いですね。少し（　）。」\n葉「あ、すみません。おねがいします。」",
    sentence: "リー「葉さん、にもつが 多いですね。少し[　]。」\n葉「あ、すみません。おねがいします。」",
    options: ["持っていませんか", "持たないでください", "持ちましたね", "持ちましょうか"], correctIndex: 3
  },

  // ─── 問題2 (q6): 文の組み立て（★）(4問) ─────────────────────────────

  // GQ10 — 正しい文: 私はたんじょうびにそふがくれたカメラを毎日使っています
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "私は たんじょうびに ___ ★ ___ ___ 使っています。",
    sentence: "私は たんじょうびに ___ [★] ___ ___ 使っています。",
    options: ["くれた", "毎日", "カメラを", "そふが"], correctIndex: 0
  },

  // GQ11 — 正しい文: こうえんに は 鳥 が たくさんいます
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "こうえん ___ ★ ___ たくさん います。",
    sentence: "こうえん ___ [★] ___ たくさん います。",
    options: ["鳥", "に", "は", "が"], correctIndex: 0
  },

  // GQ12 — 正しい文: 今年の夏は海では なくて山に行きます
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "今年の 夏 ___ ★ ___ 山に 行きます。",
    sentence: "今年の 夏 ___ [★] ___ 山に 行きます。",
    options: ["海", "では", "は", "なくて"], correctIndex: 1
  },

  // GQ13 — 正しい文: 私は毎朝へやをそうじしてから家を出ます
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "私は 毎朝 へやを ___ ★ ___ 出ます。",
    sentence: "私は 毎朝 へやを ___ [★] ___ 出ます。",
    options: ["を", "から", "家", "そうじして"], correctIndex: 2
  },

  // ─── 問題3 (q7): 文章の文法 — 空欄補充 (4問) ────────────────────────

  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（14）",
    sentence: "（14）に入るものを選んでください。",
    context: PASSAGE_Q7_2024,
    options: ["が", "も", "の", "で"], correctIndex: 2
  },

  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（15）",
    sentence: "（15）に入るものを選んでください。",
    context: PASSAGE_Q7_2024,
    options: ["見ました", "行きたいです", "行きました", "見たいです"], correctIndex: 1
  },

  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（16）",
    sentence: "（16）に入るものを選んでください。",
    context: PASSAGE_Q7_2024,
    options: ["だから", "でも", "それから", "そして"], correctIndex: 3
  },

  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（17）",
    sentence: "（17）に入るものを選んでください。",
    context: PASSAGE_Q7_2024,
    options: ["かんたんでした", "むずかしかったです", "おいしかったです", "まずかったです"], correctIndex: 0
  },

  // ─── 問題4 (q8): 短文読解 (2問) ─────────────────────────────────────

  {
    groupId: "q8", sectionId: "grammar", type: "grammar_blank",
    display: "このメールで、ムムさんは 大友さんに 何が 言いたいですか。",
    sentence: "このメールで、ムムさんは 大友さんに 何が 言いたいですか。",
    context: PASSAGE_Q8_2024_1,
    options: [
      "おかしを ありがとうございます。",
      "おかしを 送ります。",
      "いっしょに ごはんを 食べました。",
      "またいっしょに えいがを 見ましょう。",
    ], correctIndex: 0
  },

  {
    groupId: "q8", sectionId: "grammar", type: "grammar_blank",
    display: "「私」は 今、電車の 中で 何を しますか。",
    sentence: "「私」は 今、電車の 中で 何を しますか。",
    context: PASSAGE_Q8_2024_2,
    options: [
      "ともだちと 話します。",
      "ともだちを 待ちます。",
      "一人で 本を 読みます。",
      "一人で 音楽を 聞きます。",
    ], correctIndex: 2
  },

  // ─── 問題5 (q9): 長文読解 (2問) ─────────────────────────────────────

  {
    groupId: "q9", sectionId: "grammar", type: "grammar_blank",
    display: "どうして ①うれしかったですか。",
    sentence: "どうして ①うれしかったですか。",
    context: PASSAGE_Q9_2024,
    options: [
      "青木山が とても 高かったから",
      "山の てっぺんから まちが 見えたから",
      "はじめて 一人で 山に のぼったから",
      "山で 会った 人たちが「こんにちは。」と 言ったから",
    ], correctIndex: 3
  },

  {
    groupId: "q9", sectionId: "grammar", type: "grammar_blank",
    display: "どうして ②来月 また 行きたいですか。",
    sentence: "どうして ②来月 また 行きたいですか。",
    context: PASSAGE_Q9_2024,
    options: [
      "さくらの 花が 見たいから",
      "山の てっぺんに また 行きたいから",
      "ほかの 山も 見たいから",
      "友だちと いっしょに 行きたいから",
    ], correctIndex: 0
  },

  // ─── 問題6 (q10): 情報検索 (1問) ────────────────────────────────────

  {
    groupId: "q10", sectionId: "grammar", type: "grammar_blank",
    display: "ダトさんは たまごと りんごを 安い 日に 買いたいです。13日に どの みせに 行きますか。14日は どの みせに 行きますか。",
    sentence: "ダトさんは たまごと りんごを 安い 日に 買いたいです。13日に どの みせに 行きますか。14日は どの みせに 行きますか。",
    context: PASSAGE_Q10_2024,
    options: [
      "13日は ①、14日は ②",
      "13日は ④、14日は ②",
      "13日は ②、14日は ④",
      "13日は ③、14日は ①",
    ], correctIndex: 1
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
