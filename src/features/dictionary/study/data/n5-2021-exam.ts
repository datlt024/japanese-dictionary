// 2021年12月 日本語能力試験 N5 — 言語知識（文字・語彙）・読解
// Explanations are stored in ./explanations/n5-2021.json and merged at export time.
// Run `npm run exam:enrich n5-2021` to auto-generate explanations via Claude API.

import _explanations from "./explanations/n5-2021.json"

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
  audioStart?: number   // giây bắt đầu câu trong file listening.mp3 (dùng cho chức năng nghe lại)
  audioEnd?: number     // giây kết thúc câu (tự dừng audio khi đến đây)
  explanation?: string  // giải thích đáp án, hiển thị trong màn hình kết quả
}

// ─── もんだい3 (q7) passages ───────────────────────────────────────────────

const PASSAGE_Q7_2021 =
  `<p style="font-size:13px;margin:0 0 6px;font-weight:600;">（１）サンホさんの さくぶん</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;margin-bottom:14px;">
<p style="margin:0 0 10px;">　私は まいばん 本を 読みます。本は いつも としょかんで かります。毎日、ばんごはんを 食べて、しゅくだいを してから、本を 読みます。きのうは しゅくだいが ありませんでした。私は <span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">14</span> すぐ 本を 読みました。</p>
<p style="margin:0;">　せんしゅう かりた本は ぜんぶ 読みました。今日の ゆうがた、本を <span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">15</span> 行きます。そして、また ほかの 本を かります。</p>
</div>
<p style="font-size:13px;margin:0 0 6px;font-weight:600;">（２）ジョイさんの さくぶん</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0;">　私の いえの ちかくに「みなみコーヒー」があります。「みなみコーヒー」の コーヒーは はやくて おいしいです。<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">16</span>、私は まいあさ 行きます。「みなみコーヒー」で コーヒーを 飲んでから、学校に 行きます。ときどき、夜も「みなみコーヒー」で コーヒーを <span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">17</span>。</p>
</div>`

// ─── もんだい4 (q8) contexts ───────────────────────────────────────────────

const PASSAGE_Q8_2021_1 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0;">　10年前は、えきの ちかくに 小さい みせが たくさん あって、みんなは 小さい店で かいものを しました。今は えきの ちかくに みせが あまり ありませんから、えきから とおくて 大きい みせで かいものを します。</p>
</div>`

const PASSAGE_Q8_2021_2 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">これは ユンさんが クラスメートの ダニエラさんに 書いた メールです。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 18px;font-size:14px;line-height:2;">
<p style="margin:0 0 10px;">ダニエラさん</p>
<p style="margin:0 0 10px;">　きのうの よるから あたまが とても いたいです。いまから びょういんに いきますから、ごぜんの クラスは やすみます。ごごから がっこうに いきます。</p>
<p style="margin:0 0 10px;">　すみませんが、かわぐちせんせいに いって ください。</p>
<p style="text-align:right;margin:0;">ユン</p>
</div>`

// ─── もんだい5 (q9) passage ────────────────────────────────────────────────

const PASSAGE_Q9_2021 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0 0 8px;">　せんしゅう きょうとへ 一人で りょこうに 行きました。</p>
<p style="margin:0 0 8px;">　ホテルは きょうとえきの まえに ある 大きな ホテルでした。私は へやに にもつを おいて、小さな かばんに さいふや パスポートを いれて、ゆうめいな にわを 見に 行きました。ホテルから にわまで タクシーに のりました。いけには さかなが およいで いて、さくらが きれいでした。</p>
<p style="margin:0 0 8px;">　それから、きょうとの まちを あるいて ざっしで みた おかしを かいに いきました。みせで かばんから さいふを だしましたが、かばんには パスポートが ありませんでした。</p>
<p style="margin:0 0 8px;">　わたしは すぐに ホテルに かえりました。</p>
<p style="margin:0 0 8px;">　パスポートは ホテルに ありました。とても うれしかったです。ホテルの 人が「タクシーがいしゃの ひとが もって きましたよ。」と いいました。</p>
<p style="margin:0;">　きょうとは いいまち でした。</p>
</div>`

// ─── もんだい6 (q10) context ───────────────────────────────────────────────

const PASSAGE_Q10_2021 =
  `<div style="border:2px solid #374151;border-radius:8px;overflow:hidden;font-size:13px;">
<div style="background:#374151;color:#fff;padding:8px 14px;text-align:center;font-weight:700;font-size:15px;">ケーキ屋「マロン」</div>
<div style="padding:10px 14px;text-align:center;border-bottom:1px solid #e5e7eb;line-height:1.8;">
<div>たかやま町 235-8　電話：013-579-2468</div>
<div>休み：日よう日</div>
<div>こんしゅう（9月7日〜9月12日）の やすい もの</div>
</div>
<table style="width:100%;border-collapse:collapse;font-size:13px;">
<tbody>
<tr style="background:#f3f4f6;">
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">7日（月）</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">8日（火）</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">9日（水）</td>
</tr>
<tr>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">いちごの ケーキ<br>450円 → 350円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">チョコレートの ケーキ<br>400円 → 300円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">バナナの ケーキ<br>350円 → 250円</td>
</tr>
<tr style="background:#f3f4f6;">
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">10日（木）</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">11日（金）</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;font-weight:600;">12日（土）</td>
</tr>
<tr>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">いちごの ケーキ<br>450円 → 350円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">チョコレートの ケーキ<br>400円 → 300円</td>
<td style="padding:8px 10px;text-align:center;border:1px solid #d1d5db;">バナナの ケーキ<br>350円 → 250円</td>
</tr>
</tbody>
</table>
<div style="padding:10px 14px;border-top:1px solid #e5e7eb;font-size:12.5px;">
まいしゅう、水よう日・木よう日・金よう日は クッキーも やすいです。ぜんぶ 100円です。
</div>
</div>`

const _explanationsMap = _explanations as Record<string, string>

const _RAW: StaticQuestion[] = [

  // ════════════════════════════════════════════════════════════════════════
  // 言語知識（文字・語彙）
  // ════════════════════════════════════════════════════════════════════════

  // ─── 問題1 (q1): 漢字の読み (7問) ────────────────────────────────────

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "国", sentence: "らいげつ [国]へ かえります。",
    options: ["くに", "ごく", "ぐに", "こく"], correctIndex: 0
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "お父さん", sentence: "あそこに いるのは リーさんの [お父さん]です。",
    options: ["おねえさん", "おかあさん", "おにいさん", "おとうさん"], correctIndex: 3
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "百人", sentence: "がくせいが [百人] います。",
    options: ["はくにん", "びゃくにん", "ひゃくにん", "ぴゃくにん"], correctIndex: 2
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "立って", sentence: "あそこに やまださんが [立って] います。",
    options: ["まって", "たって", "きって", "もって"], correctIndex: 1
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "五分", sentence: "ぜんぶで [五分]くらい あります。",
    options: ["ごほん", "さんぷん", "ごふん", "さんぽん"], correctIndex: 2
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "少ない", sentence: "きょうは くるまが [少ない] ですね。",
    options: ["すくない", "すこない", "すきない", "すかない"], correctIndex: 0
  },

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "出て", sentence: "すぐ そとに [出て] ください。",
    options: ["だして", "でて", "でして", "だて"], correctIndex: 1
  },

  // ─── 問題2 (q2): 漢字の書き (5問) ────────────────────────────────────

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "でんしゃ", sentence: "ここで [でんしゃ]に のります。",
    options: ["電東", "雷東", "電車", "雷車"], correctIndex: 2
  },

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "て", sentence: "あさから [て]が いたいです。",
    options: ["手", "足", "耳", "目"], correctIndex: 0
  },

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "かようび", sentence: "おとといは [かようび]でした。",
    options: ["月よう日", "木よう日", "金よう日", "火よう日"], correctIndex: 3
  },

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "やすい", sentence: "これが いちばん [やすい] です。",
    options: ["高い", "安い", "古い", "多い"], correctIndex: 1
  },

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "はなして", sentence: "いま、はやしさんが [はなして] います。",
    options: ["読して", "語して", "話して", "説して"], correctIndex: 2
  },

  // ─── 問題3 (q3): 文脈規定 (6問) ──────────────────────────────────────

  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "さとうさん：「すきな（　　）は なんですか。」\nたなかさん：「おすしです。」",
    sentence: "さとうさん：「すきな[　　]は なんですか。」\nたなかさん：「おすしです。」",
    options: ["かいもの", "たべもの", "のみもの", "くだもの"], correctIndex: 1
  },

  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "きょねんの なつ、バスで にほんを（　　）しました。",
    sentence: "きょねんの なつ、バスで にほんを[　　]しました。",
    options: ["りょうり", "さんぽ", "れんしゅう", "りょこう"], correctIndex: 3
  },

  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "わたしは この（　　）の 2かいに すんで います。",
    sentence: "わたしは この[　　]の 2かいに すんで います。",
    options: ["アパート", "エレベーター", "タクシー", "トイレ"], correctIndex: 0
  },

  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "へやが あついですから、まどを（　　）。",
    sentence: "へやが あついですから、まどを[　　]。",
    options: ["おしましょう", "けしましょう", "あけましょう", "おりましょう"], correctIndex: 2
  },

  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "さとうさんは かみのけが（　　）です。",
    sentence: "さとうさんは かみのけが[　　]です。",
    options: ["ながい", "おおきい", "ちかい", "ひろい"], correctIndex: 0
  },

  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "いえでは くつを（　　）ください。",
    sentence: "いえでは くつを[　　]ください。",
    options: ["しめて", "かぶって", "きて", "ぬいで"], correctIndex: 3
  },

  // ─── 問題4 (q4): 言い換え類義 (3問) ──────────────────────────────────

  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "ともだちと きっさてんへ いきました。",
    sentence: "<u>ともだちと きっさてんへ いきました。</u>",
    options: [
      "ともだちと えいがを みに いきました。",
      "ともだちと コーヒーを のみに いきました。",
      "ともだちと ざっしを かいに いきました。",
      "ともだちと ケーキを つくりに いきました。",
    ], correctIndex: 1
  },

  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "へやの そうじを しました。",
    sentence: "<u>へやの そうじを しました。</u>",
    options: [
      "へやは あたらしいです。",
      "へやは あたらしくないです。",
      "へやは きれいです。",
      "へやは きたないです。",
    ], correctIndex: 2
  },

  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "それは かるいです。",
    sentence: "<u>それは かるいです。</u>",
    options: [
      "それは あまくありません。",
      "それは むずかしくありません。",
      "それは つめたくありません。",
      "それは おもくありません。",
    ], correctIndex: 3
  },

  // ════════════════════════════════════════════════════════════════════════
  // 言語知識（文法）・読解
  // ════════════════════════════════════════════════════════════════════════

  // ─── 問題1 (q5): 文法空欄補充 (9問) ──────────────────────────────────

  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "きのう 学校で 先生（　）会いました。",
    sentence: "きのう 学校で 先生[　]会いました。",
    options: ["で", "に", "を", "へ"], correctIndex: 1
  },

  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "わたしの アパートから 学校まで 30分（　）かかります。",
    sentence: "わたしの アパートから 学校まで 30分[　]かかります。",
    options: ["を", "ごろ", "が", "ぐらい"], correctIndex: 3
  },

  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "わたしは 毎朝 シャワー（　）あびます。",
    sentence: "わたしは 毎朝 シャワー[　]あびます。",
    options: ["で", "を", "に", "が"], correctIndex: 1
  },

  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "雨が まど（　）入ります。しめて ください。",
    sentence: "雨が まど[　]入ります。しめて ください。",
    options: ["へ", "から", "まで", "で"], correctIndex: 1
  },

  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "中山「アンさんは りょうりを しますか。」\nアン「はい。でも、いそがしい 日（　）しません。」",
    sentence: "中山「アンさんは りょうりを しますか。」\nアン「はい。でも、いそがしい 日[　]しません。」",
    options: ["は", "を", "で", "も"], correctIndex: 0
  },

  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "A「すみません、田中さんは いますか。」\nB「いいえ、（　）かえりましたよ。」",
    sentence: "A「すみません、田中さんは いますか。」\nB「いいえ、[　]かえりましたよ。」",
    options: ["よく", "まだ", "もう", "あまり"], correctIndex: 2
  },

  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "（　）とき、本を 読んだり えいがを 見たり します。",
    sentence: "[　]とき、本を 読んだり えいがを 見たり します。",
    options: ["ひま", "ひまだ", "ひまな", "ひまで"], correctIndex: 2
  },

  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "A「あしたは 山田さんの たんじょうびですね。何を（　）か。」\nB「花は どうですか。」\nA「いいですね。」",
    sentence: "A「あしたは 山田さんの たんじょうびですね。何を[　]か。」\nB「花は どうですか。」\nA「いいですね。」",
    options: ["もらいます", "あげます", "もらいました", "あげました"], correctIndex: 1
  },

  {
    groupId: "q5", sectionId: "grammar", type: "grammar_blank",
    display: "（タクシーで）\nタクシーの 人「どこまで 行きますか。」\n西川「東京駅まで（　）。」\nタクシーの 人「はい、わかりました。」",
    sentence: "（タクシーで）\nタクシーの 人「どこまで 行きますか。」\n西川「東京駅まで[　]。」\nタクシーの 人「はい、わかりました。」",
    options: ["してください", "ほしいです", "いかがですか", "おねがいします"], correctIndex: 3
  },

  // ─── 問題2 (q6): 文の組み立て（★）(4問) ─────────────────────────────

  // Q10 — 正しい文: このかばんはかるくてじょうぶだからりょこうのときべんりです
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "この ___ ★ ___ ___ とき べんりです。",
    sentence: "この ___ [★] ___ ___ とき べんりです。",
    options: ["りょこうの", "じょうぶだから", "かばんは", "かるくて"],
    correctIndex: 3
  },

  // Q11 — 正しい文: れいぞうこの中にぎゅうにゅうが3本あります
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "れいぞうこの ___ ___ ★ ___ 3本あります。",
    sentence: "れいぞうこの ___ ___ [★] ___ 3本あります。",
    options: ["に", "中", "ぎゅうにゅう", "が"],
    correctIndex: 2
  },

  // Q12 — 正しい文: たんじょうびにはどんなプレゼントがほしいですか
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "たんじょうびには ___ ___ ★ ___ ですか。",
    sentence: "たんじょうびには ___ ___ [★] ___ ですか。",
    options: ["ほしい", "どんな", "が", "プレゼント"],
    correctIndex: 2
  },

  // Q13 — 正しい文: きのう山下さんといっしょにもりさんのいえに行きました
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "きのう 山下さん ___ ___ ★ ___ いえに 行きました。",
    sentence: "きのう 山下さん ___ ___ [★] ___ いえに 行きました。",
    options: ["もりさん", "いっしょに", "の", "と"],
    correctIndex: 0
  },

  // ─── 問題3 (q7): 文章の文法 — 空欄補充 (4問) ────────────────────────

  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（14）",
    sentence: "（14）に入るものを選んでください。",
    context: PASSAGE_Q7_2021,
    options: ["ねるまえに", "かりる まえに", "しゅくだいの あと", "ばんごはんの あと"],
    correctIndex: 3
  },

  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（15）",
    sentence: "（15）に入るものを選んでください。",
    context: PASSAGE_Q7_2021,
    options: ["かしに", "かして", "かえしに", "かえして"],
    correctIndex: 2
  },

  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（16）",
    sentence: "（16）に入るものを選んでください。",
    context: PASSAGE_Q7_2021,
    options: ["だから", "それから", "では", "でも"],
    correctIndex: 0
  },

  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "（17）",
    sentence: "（17）に入るものを選んでください。",
    context: PASSAGE_Q7_2021,
    options: ["のんで います", "のんで いるからです", "のんで いません", "のんで いないからです"],
    correctIndex: 0
  },

  // ─── 問題4 (q8): 短文読解 (2問) ─────────────────────────────────────

  {
    groupId: "q8", sectionId: "grammar", type: "grammar_blank",
    display: "10年前、みんなは どこで かいものを しましたか。",
    sentence: "10年前、みんなは どこで かいものを しましたか。",
    context: PASSAGE_Q8_2021_1,
    options: [
      "えきの ちかくの 大きい みせ",
      "えきの ちかくの 小さい みせ",
      "えきから とおくて 大きい みせ",
      "えきから とおくて 小さい みせ",
    ], correctIndex: 1
  },

  {
    groupId: "q8", sectionId: "grammar", type: "grammar_blank",
    display: "ダニエラさんは かわぐちせんせいに 何と いいますか。",
    sentence: "ダニエラさんは かわぐちせんせいに 何と いいますか。",
    context: PASSAGE_Q8_2021_2,
    options: [
      "「ユンさんは びょういんに いますから、きょう がっこうを やすみます。」",
      "「ユンさんは びょういんに いって、ごごから がっこうに きます。」",
      "「ユンさんは ごご びょういんに いって、それから がっこうに きます。」",
      "「ユンさんは びょういんに いってから、ごぜんの クラスに きます。」",
    ], correctIndex: 1
  },

  // ─── 問題5 (q9): 長文読解 (2問) ─────────────────────────────────────

  {
    groupId: "q9", sectionId: "grammar", type: "grammar_blank",
    display: "「わたし」は ホテルを でた あとで、はじめに なにを しましたか。",
    sentence: "「わたし」は ホテルを でた あとで、はじめに なにを しましたか。",
    context: PASSAGE_Q9_2021,
    options: [
      "あるいて きょうとえきに いきました。",
      "タクシーで きょうとえきに いきました。",
      "あるいて ゆうめいな にわを みに いきました。",
      "タクシーで ゆうめいな にわを みに いきました。",
    ], correctIndex: 3
  },

  {
    groupId: "q9", sectionId: "grammar", type: "grammar_blank",
    display: "どうして とても うれしかったですか。",
    sentence: "どうして とても うれしかったですか。",
    context: PASSAGE_Q9_2021,
    options: [
      "はじめて 一人で タクシーに のったから",
      "ホテルの ひとの にほんごが わかったから",
      "パスポートが ホテルに あったから",
      "とても きれいで いい ホテルだったから",
    ], correctIndex: 2
  },

  // ─── 問題6 (q10): 情報検索 (1問) ────────────────────────────────────

  {
    groupId: "q10", sectionId: "grammar", type: "grammar_blank",
    display: "テオさんは、バナナの ケーキが やすい 日に みせに いきたいです。クッキーも やすい 日が いいです。いつ いきますか。",
    sentence: "テオさんは、バナナの ケーキが やすい 日に みせに いきたいです。クッキーも やすい 日が いいです。いつ いきますか。",
    context: PASSAGE_Q10_2021,
    options: ["9日（水）", "9日（水）か 10日（木）か 11日（金）", "9日（水）か 12日（土）", "12日（土）"],
    correctIndex: 0
  },

  // ════════════════════════════════════════════════════════════════════════
  // 聴解
  // ════════════════════════════════════════════════════════════════════════
  // audioStart / audioEnd: giây trong file /exams/n5-2021/audio/listening.mp3
  // Cách xác định: mở file bằng audio editor (Audacity / QuickTime), nghe và
  // ghi lại mốc bắt đầu câu hỏi (sau khi đọc số câu) và kết thúc (khi im lặng).
  // Khi điền xong, nút "Nghe lại" sẽ xuất hiện trên từng câu trong trang Xem đáp án.

  // ─── もんだい1 (lq1): 7問 — 絵4枚から正しいものを選ぶ ─────────────────

  // 1ばん: 料理の場面（野菜を切る・混ぜる・焼くなど）
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "1ばん", options: ["1", "2", "3", "4"], correctIndex: 2,
    imageSrc: "/exams/n5-2021/listening/lq1_q1.png",
    audioStart: 30, audioEnd: 76,
    explanation: "Đáp án 3. [Điền giải thích nội dung audio tại đây]"
  },

  // 2ばん: お店・人の場面
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "2ばん", options: ["1", "2", "3", "4"], correctIndex: 3,
    imageSrc: "/exams/n5-2021/listening/lq1_q2.jpg",
    audioStart: 86, audioEnd: 142,
    explanation: "Đáp án 4. [Điền giải thích nội dung audio tại đây]"
  },

  // 3ばん: 部屋の中の家具の位置
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "3ばん", options: ["1", "2", "3", "4"], correctIndex: 0,
    imageSrc: "/exams/n5-2021/listening/lq1_q3.jpg",
    audioStart: 153, audioEnd: 204,
    explanation: "Đáp án 1. [Điền giải thích nội dung audio tại đây]"
  },

  // 4ばん: 大学周辺の地図（カフェの場所）
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "4ばん", options: ["1", "2", "3", "4"], correctIndex: 3,
    imageSrc: "/exams/n5-2021/listening/lq1_q4.jpg",
    audioStart: 216, audioEnd: 265,
    explanation: "Đáp án 4. [Điền giải thích nội dung audio tại đây]"
  },

  // 5ばん: 教室番号
  {
    groupId: "lq1", sectionId: "listening", type: "listening_text",
    display: "5ばん",
    options: ["101きょうしつ", "102きょうしつ", "201きょうしつ", "202きょうしつ"], correctIndex: 0,
    audioStart: 276, audioEnd: 330,
    explanation: "Đáp án: 101きょうしつ. [Điền giải thích nội dung audio tại đây]"
  },

  // 6ばん: 色
  {
    groupId: "lq1", sectionId: "listening", type: "listening_text",
    display: "6ばん",
    options: ["あか", "きいろ", "あお", "くろ"], correctIndex: 1,
    audioStart: 342, audioEnd: 407,
    explanation: "Đáp án: きいろ (màu vàng). [Điền giải thích nội dung audio tại đây]"
  },

  // 7ばん: 買うものの組み合わせ（ア=お金 イ=ジャケット ウ=ギフト）
  {
    groupId: "lq1", sectionId: "listening", type: "listening_scene",
    display: "7ばん",
    options: ["アイ", "アウ", "イウ", "アイウ"], correctIndex: 0,
    imageSrc: "/exams/n5-2021/listening/lq1_q7.jpg",
    audioStart: 419, audioEnd: 477,
    explanation: "Đáp án: アイ. [Điền giải thích nội dung audio tại đây]"
  },

  // ─── もんだい2 (lq2): 6問 — 質問を聞いて絵から答えを選ぶ ──────────────

  // 1ばん: 人物の行動（教室・図書館など）
  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "1ばん", options: ["1", "2", "3", "4"], correctIndex: 1,
    imageSrc: "/exams/n5-2021/listening/lq2_q1.jpg",
    audioStart: 515, audioEnd: 573,
    explanation: "Đáp án 2. [Điền giải thích nội dung audio tại đây]"
  },

  // 2ばん: 人物の行動（オフィス・カフェなど）
  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "2ばん", options: ["1", "2", "3", "4"], correctIndex: 3,
    imageSrc: "/exams/n5-2021/listening/lq2_q2.jpg",
    audioStart: 585, audioEnd: 629,
    explanation: "Đáp án 4. [Điền giải thích nội dung audio tại đây]"
  },

  // 3ばん: カレンダー（3月）から日付を選ぶ
  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "3ばん", options: ["1", "2", "3", "4"], correctIndex: 3,
    imageSrc: "/exams/n5-2021/listening/lq2_q3.jpg",
    audioStart: 640, audioEnd: 685,
    explanation: "Đáp án 4. [Điền giải thích nội dung audio tại đây]"
  },

  // 4ばん: 風景写真（花・海岸・山・橋）
  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "4ばん", options: ["1", "2", "3", "4"], correctIndex: 0,
    imageSrc: "/exams/n5-2021/listening/lq2_q4.jpg",
    audioStart: 696, audioEnd: 747,
    explanation: "Đáp án 1. [Điền giải thích nội dung audio tại đây]"
  },

  // 5ばん: 日付
  {
    groupId: "lq2", sectionId: "listening", type: "listening_text",
    display: "5ばん",
    options: ["5がつ 28にち", "5がつ 29にち", "5がつ 30にち", "5がつ 31にち"], correctIndex: 2,
    audioStart: 758, audioEnd: 807,
    explanation: "Đáp án: 5がつ30にち (ngày 30 tháng 5). [Điền giải thích nội dung audio tại đây]"
  },

  // 6ばん: スポーツ（バスケット・水泳・テニス・サッカー）
  {
    groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "6ばん", options: ["1", "2", "3", "4"], correctIndex: 3,
    imageSrc: "/exams/n5-2021/listening/lq2_q6.jpg",
    audioStart: 818, audioEnd: 880,
    explanation: "Đáp án 4. [Điền giải thích nội dung audio tại đây]"
  },

  // ─── もんだい3 (lq3): 5問 — 絵を見て矢印の人のセリフを選ぶ ─────────────

  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "1ばん", options: ["1", "2", "3"], correctIndex: 0,
    imageSrc: "/exams/n5-2021/listening/lq3_q1.jpg",
    audioStart: 914, audioEnd: 944,
    explanation: "Đáp án 1. [Điền giải thích nội dung audio tại đây]"
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "2ばん", options: ["1", "2", "3"], correctIndex: 1,
    imageSrc: "/exams/n5-2021/listening/lq3_q2.jpg",
    audioStart: 953, audioEnd: 976,
    explanation: "Đáp án 2. [Điền giải thích nội dung audio tại đây]"
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "3ばん", options: ["1", "2", "3"], correctIndex: 1,
    imageSrc: "/exams/n5-2021/listening/lq3_q3.jpg",
    audioStart: 985, audioEnd: 1008,
    explanation: "Đáp án 2. [Điền giải thích nội dung audio tại đây]"
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "4ばん", options: ["1", "2", "3"], correctIndex: 2,
    imageSrc: "/exams/n5-2021/listening/lq3_q4.jpg",
    audioStart: 1017, audioEnd: 1046,
    explanation: "Đáp án 3. [Điền giải thích nội dung audio tại đây]"
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "5ばん", options: ["1", "2", "3"], correctIndex: 1,
    imageSrc: "/exams/n5-2021/listening/lq3_q5.jpg",
    audioStart: 1055, audioEnd: 1081,
    explanation: "Đáp án 2. [Điền giải thích nội dung audio tại đây]"
  },

  // ─── もんだい4 (lq4): 6問 — 絵なし、文を聞いて返事を選ぶ ───────────────

  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "1ばん", options: ["1", "2", "3"], correctIndex: 2,
    audioStart: 1365, audioEnd: 1385,
    explanation: "Đáp án 3. [Điền giải thích nội dung audio tại đây]"
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "2ばん", options: ["1", "2", "3"], correctIndex: 1,
    audioStart: 1390, audioEnd: 1411,
    explanation: "Đáp án 2. [Điền giải thích nội dung audio tại đây]"
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "3ばん", options: ["1", "2", "3"], correctIndex: 1,
    audioStart: 1416, audioEnd: 1439,
    explanation: "Đáp án 2. [Điền giải thích nội dung audio tại đây]"
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "4ばん", options: ["1", "2", "3"], correctIndex: 2,
    audioStart: 1443, audioEnd: 1466,
    explanation: "Đáp án 3. [Điền giải thích nội dung audio tại đây]"
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "5ばん", options: ["1", "2", "3"], correctIndex: 0,
    audioStart: 1474, audioEnd: 1499,
    explanation: "Đáp án 1. [Điền giải thích nội dung audio tại đây]"
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "6ばん", options: ["1", "2", "3"], correctIndex: 2,
    audioStart: 1506, audioEnd: 1534,
    explanation: "Đáp án 3. [Điền giải thích nội dung audio tại đây]"
  },
]

export const N5_2021_QUESTIONS: StaticQuestion[] = _RAW.map(q => {
  const key = `${q.groupId}:${q.display}`
  const json = _explanationsMap[key]
  return json ? { ...q, explanation: json } : q
})
