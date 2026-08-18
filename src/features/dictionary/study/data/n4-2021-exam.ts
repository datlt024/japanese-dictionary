// 2021年12月 日本語能力試験 N4 — 言語知識（文字・語彙）・文法・読解・聴解
// Explanations are stored in ./explanations/n4-2021.json and merged at export time.

import _explanations from "./explanations/n4-2021.json"

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
  script?: string
}

// ─── もんだい3 (q8): 文章の文法 ─────────────────────────────────────────────

const PASSAGE_Q8_N4 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">留学生のイワンさんは作文を書いて、クラスのみんなの前で読みました。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="text-align:center;font-weight:700;margin:0 0 4px;">町の図書館</p>
<p style="text-align:right;font-size:13px;color:#6b7280;margin:0 0 12px;">スミルノ フイワン</p>
<p style="margin:0 0 10px;">　みなさんはこの町にある森図書館を知っていますか。私は先月初めて知りました。日本人の<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">18</span>のです。</p>
<p style="margin:0 0 10px;">　森図書館には大学の図書館にはないものがあります。<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">19</span>、ようふくのざっしや映画のざっしです。私が好きな旅行のざっしもあります。ざっしの日本語は難しいです。でも、写真を見て、日本のことを知ることができるので、楽しいです。</p>
<p style="margin:0 0 10px;">　いろいろなCDやDVDもあります。先週借りたDVDは京都をしょうかいするDVDです。古いお寺や大きい橋がきれいでした。私はまだ京都に行ったことがありません。DVDを見たあと、京都を<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">20</span></p>
<p style="margin:0;">　森図書館には楽しめるものがたくさんあります。一度<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">21</span>。</p>
</div>`

// ─── もんだい4 (q9): 短文読解 ──────────────────────────────────────────────

const PASSAGE_Q9_N4_1 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">この紙が日本語学校にはってあります。</p>
<div style="border:1.5px solid #374151;border-radius:8px;overflow:hidden;font-size:14px;">
<div style="background:#374151;color:#fff;padding:8px 14px;text-align:center;font-weight:700;font-size:15px;">バスケットボールをしませんか</div>
<div style="padding:14px 16px;line-height:2;">
<p style="margin:0 0 10px;">　10月14日(日)の夜7時から9時まで、市の体育館でバスケットボールをしませんか。利用料金は2時間1,000円なので、10人集まれば、一人100円でできます。一緒にやりたい人は、今週中に私（ユン）のところに来て、クラスと名前を教えてください。</p>
<p style="text-align:right;margin:0;">10月1日(月)　ユン・ジホン（Aクラス）</p>
</div>
</div>`

const PASSAGE_Q9_N4_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0;">　私と妹はサッカークラブに入っています。毎日、授業のあとに練習があって、とても疲れますから、私は夜早く寝てしまいます。宿題をしないで学校に行ったこともあります。でも、妹は宿題が全部終わるまで寝ません。予習もします。すごいと思います。</p>
</div>`

const PASSAGE_Q9_N4_3 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">友だちからメールがきました。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 18px;font-size:14px;line-height:2;">
<p style="margin:0 0 8px;">田中さん</p>
<p style="margin:0 0 8px;">こんにちは。</p>
<p style="margin:0 0 8px;">仕事で日本へ2週間くらい行くことになりました。大阪に1週間いて、それから東京に行きます。</p>
<p style="margin:0 0 8px;">新東京ホテルにとまるので、いっしょにおすしを食べませんか。</p>
<p style="margin:0 0 8px;">ご都合を教えてください。</p>
<p style="text-align:right;margin:0;">リン</p>
</div>`

// ─── もんだい5 (q10): 長文読解 ─────────────────────────────────────────────

const PASSAGE_Q10_N4 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0 0 10px;">　3歳になる私の娘は絵をかくのが大好きです。でも、私は絵が上手ではないので娘と一緒に絵をかいたことはありません。ですから、娘はいつも一人で絵をかいています。先週、母がうちに来たとき、娘と絵をかいて遊んでくれました。母と二人で絵をかいている娘は、いつもよりずっと楽そうでした。</p>
<p style="margin:0 0 10px;">　私も娘と一緒に絵をかいてあげたほうがいいかもしれないと考えていたとき、テレビで面白いものを見ました。「絵封筒」です。「絵封筒」は、封筒にはった切手の周りに自分で絵をかいて作ります。テレビで見た絵封筒の中には、上手な絵ではなくても、とてもいいものがありました。鳥の絵の切手の周りに、木をかいたものです。簡単にかいたものでしたが、かわいいと思いました。</p>
<p style="margin:0 0 10px;">　絵封筒なら、私にもできるかもしれないと思いました。ちょうど、母に娘の写真を送ろうと思っていたので、私もやってみました。犬の絵の切手をはって、周りに草や太陽をかきました。けっこううまくできました。</p>
<p style="margin:0;">　絵封筒みたいに、娘のかいている絵の周りに私が簡単に絵をかくやり方だったら、私でもできそうです。<u>娘はきっと喜んでくれるでしょう。</u></p>
</div>`

// ─── もんだい6 (q11): 情報検索 ─────────────────────────────────────────────

const PASSAGE_Q11_N4 =
  `<div style="border:2px solid #374151;border-radius:8px;overflow:hidden;font-size:13px;margin-bottom:10px;">
<div style="background:#374151;color:#fff;padding:8px 14px;text-align:center;font-weight:700;font-size:15px;">パソコン教室のお知らせ</div>
<div style="padding:12px 16px;font-size:13.5px;line-height:1.9;">
<p style="margin:0 0 6px;">外国人のみなさんに、やさしい日本語でパソコンの使い方を説明します。</p>
<p style="margin:0 0 3px;">月・日：9月8日(木)、15日(木)、22日(木)（全部で3回）</p>
<p style="margin:0 0 3px;">時間：18:00〜20:00</p>
<p style="margin:0 0 3px;">場所：山名中学校（コンピューター教室）</p>
<p style="margin:0 0 10px;">料金：1500円（3回）</p>
<p style="margin:0 0 5px;font-style:italic;font-weight:600;">どんな人がパソコン教室で勉強できますか？</p>
<div style="border:1px solid #9ca3af;border-radius:4px;padding:8px 12px;margin:0 0 10px;background:#f9fafb;">
<p style="margin:0 0 3px;">・日本語を100時間以上勉強したことがある人</p>
<p style="margin:0 0 3px;">・3回全部出られる人</p>
<p style="margin:0;font-size:12px;">※パソコンを持っていない人は、教室のパソコンが使えます。</p>
</div>
<p style="margin:0 0 5px;font-style:italic;font-weight:600;">パソコン教室で勉強したい人は、どうしますか？</p>
<div style="border:1px solid #9ca3af;border-radius:4px;padding:8px 12px;background:#f9fafb;">
<p style="margin:0 0 3px;">・8月24日(水)までに電話で予約してください。</p>
<p style="margin:0 0 3px;">・9月1日(木)18時から、山名中学校で説明会を行います。説明会に出られない人は、予約のときに言ってください。</p>
<p style="margin:0;">・料金は説明会のときに集めます。説明会に出られない人は、9月7日(水)までに払ってください。</p>
</div>
</div>
</div>
<table style="width:100%;border-collapse:collapse;font-size:12.5px;">
<thead>
<tr style="background:#f3f4f6;">
<th style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;"></th>
<th style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">日本語を勉強した<br>時間</th>
<th style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">教室に行けない日</th>
<th style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">自分のパソコン</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">ジェムさん</td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">150時間</td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;"></td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">ありません</td>
</tr>
<tr style="background:#f9fafb;">
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">マリオさん</td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">50時間</td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;"></td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">あります</td>
</tr>
<tr>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">ソニアさん</td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">200時間</td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">15日</td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">あります</td>
</tr>
<tr style="background:#f9fafb;">
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">リナさん</td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">120時間</td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">22日</td>
<td style="padding:6px 8px;border:1px solid #d1d5db;text-align:center;">あります</td>
</tr>
</tbody>
</table>`

const _explanationsMap = _explanations as Record<string, string>

const _RAW: StaticQuestion[] = [

  // ════════════════════════════════════════════════════════════════════════
  // もじ・ごい
  // ════════════════════════════════════════════════════════════════════════

  // ─── 問題1 (q1): 漢字の読み (7問) ──────────────────────────────────────

  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "出発", sentence: "バスが8時に[出発]します。",
    options: ["しゅっはつ", "しゅうはつ", "しゅっぱつ", "しゅうぱつ"], correctIndex: 2
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "答えて", sentence: "すぐに、[答えて]ください。",
    options: ["おぼえて", "おしえて", "かんがえて", "こたえて"], correctIndex: 3
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "心", sentence: "あの人は[心]がきれいです。",
    options: ["きもち", "あたま", "かたち", "こころ"], correctIndex: 3
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "最後", sentence: "[最後]のページを見てください。",
    options: ["さいしょ", "さいご", "せいご", "せいしょ"], correctIndex: 1
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "遠い", sentence: "このみちを行くと、少し[遠い]です。",
    options: ["おそい", "ちかい", "とおい", "はやい"], correctIndex: 2
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "冬", sentence: "おととしの[冬]、日本を旅行しました。",
    options: ["あき", "ふゆ", "なつ", "はる"], correctIndex: 1
  },
  {
    groupId: "q1", sectionId: "vocab", type: "kanji_reading",
    display: "予習", sentence: "あしたのじゅぎょうの[予習]をします。",
    options: ["よしゅう", "ようしゅう", "よしゅ", "ようしゅ"], correctIndex: 0
  },

  // ─── 問題2 (q2): 漢字の書き (4問) ──────────────────────────────────────

  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "えいが", sentence: "としょかんで[えいが]の本をかりました。",
    options: ["映語", "英語", "英画", "映画"], correctIndex: 3
  },
  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "つくって", sentence: "すずきさんは何を[つくって]いますか。",
    options: ["送って", "使って", "作って", "売って"], correctIndex: 2
  },
  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "うんどう", sentence: "たくさん[うんどう]をしたので、つかれました。",
    options: ["運動", "連動", "運勤", "連働"], correctIndex: 0
  },
  {
    groupId: "q2", sectionId: "vocab", type: "kanji_writing",
    display: "ふね", sentence: "あそこに大きな[ふね]が見えます。",
    options: ["寺", "船", "鳥", "雲"], correctIndex: 1
  },

  // ─── 問題3 (q3): 文脈規定 (8問) ──────────────────────────────────────────

  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "たくさん話したので（　）がいたいです。",
    sentence: "たくさん話したので[　]がいたいです。",
    options: ["のど", "ひげ", "ゆび", "うで"], correctIndex: 0
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "のった電車はとても（　）いたので、すわれませんでした。",
    sentence: "のった電車はとても[　]いたので、すわれませんでした。",
    options: ["あつまって", "こんで", "たりて", "くりかえして"], correctIndex: 1
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "日本に行ったとき、きものをきたり、まつりでおどったり、いろいろな（　）をしました。",
    sentence: "日本に行ったとき、きものをきたり、まつりでおどったり、いろいろな[　]をしました。",
    options: ["けいけん", "しゅうかん", "きょうみ", "けっか"], correctIndex: 0
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "どんなまんががすきか、小学生に（　）をしました。",
    sentence: "どんなまんががすきか、小学生に[　]をしました。",
    options: ["コンサート", "コンピューター", "アンケート", "アルコール"], correctIndex: 2
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "わたしがかりているアパートの（　）は1か月7万円です。",
    sentence: "わたしがかりているアパートの[　]は1か月7万円です。",
    options: ["ふりこみ", "ちょきん", "おつり", "やちん"], correctIndex: 3
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "このしゃしんに（　）いるのはわたしのりょうしんです。",
    sentence: "このしゃしんに[　]いるのはわたしのりょうしんです。",
    options: ["かかって", "ついて", "うつって", "とどいて"], correctIndex: 2
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "しんかんせんのきっぷは、かたみちなら1万円、（　）なら2万円です。",
    sentence: "しんかんせんのきっぷは、かたみちなら1万円、[　]なら2万円です。",
    options: ["かいてん", "おうふく", "うんてん", "あんない"], correctIndex: 1
  },
  {
    groupId: "q3", sectionId: "vocab", type: "context_vocab",
    display: "ひっこしのとき、さらはかみで（　）はこに入れます。",
    sentence: "ひっこしのとき、さらはかみで[　]はこに入れます。",
    options: ["ひろって", "かたづけて", "つかまえて", "つつんで"], correctIndex: 3
  },

  // ─── 問題4 (q4): 言い換え類義 (4問) ──────────────────────────────────────

  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "この話はひみつつです。",
    sentence: "<u>この話はひみつです。</u>",
    options: [
      "この話をみんなにはなしてください。",
      "この話はだれにも言わないでください。",
      "この話をみんなにも聞かせましょう。",
      "この話はだれもしりたくないです。",
    ], correctIndex: 1
  },
  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "もりさんはにこにこしていました。",
    sentence: "<u>もりさんはにこにこしていました。</u>",
    options: [
      "もりさんはやすんでいました。",
      "もりさんはあそんでいました。",
      "もりさんはうたっていました。",
      "もりさんはわらっていました。",
    ], correctIndex: 3
  },
  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "たなかさんはどくしんです。",
    sentence: "<u>たなかさんはどくしんです。</u>",
    options: [
      "たなかさんはけっこんしています。",
      "たなかさんはけっこんしていません。",
      "たなかさんはひとりですんでいます。",
      "たなかさんははたらいていません。",
    ], correctIndex: 1
  },
  {
    groupId: "q4", sectionId: "vocab", type: "context_vocab",
    display: "これはやわらかいですね。",
    sentence: "<u>これはやわらかいですね。</u>",
    options: [
      "これはかたくないですね。",
      "これはにがくないですね。",
      "これはつめたくないですね。",
      "これはきたなくないですね。",
    ], correctIndex: 0
  },

  // ─── 問題5 (q5): 用法 (4問) ──────────────────────────────────────────────

  {
    groupId: "q5", sectionId: "vocab", type: "context_vocab",
    display: "れんらく",
    sentence: "次のことばのつかいかたでいちばんいいものをえらんでください。「れんらく」",
    options: [
      "きこくしたら、おれいのてがみをやまださんにれんらくします。",
      "アルバイトに行く日をカレンダーにれんらくしておきます。",
      "はじめて会った人にめいしをれんらくして、あいさつをしました。",
      "あしたのかいぎの時間をはやしさんにれんらくしました。",
    ], correctIndex: 3
  },
  {
    groupId: "q5", sectionId: "vocab", type: "context_vocab",
    display: "むしあつい",
    sentence: "次のことばのつかいかたでいちばんいいものをえらんでください。「むしあつい」",
    options: [
      "ゆうべはむしあつくて、あまりねられませんでした。",
      "あのひとはむしあついので、すきではありません。",
      "このりょうりはむしあついほうがおいしいです。",
      "このコートはむしあつくて、きやすいです。",
    ], correctIndex: 0
  },
  {
    groupId: "q5", sectionId: "vocab", type: "context_vocab",
    display: "けいかく",
    sentence: "次のことばのつかいかたでいちばんいいものをえらんでください。「けいかく」",
    options: [
      "ひこうきのチケットは電話かメールでけいかくができます。",
      "あしたはゆうがたから雨がふるけいかくです。",
      "来月行くりょこうのけいかくがまだきまっていません。",
      "来週はしごとがいそがしくなるけいかくです。",
    ], correctIndex: 2
  },
  {
    groupId: "q5", sectionId: "vocab", type: "context_vocab",
    display: "そだてる",
    sentence: "次のことばのつかいかたでいちばんいいものをえらんでください。「そだてる」",
    options: [
      "母がそだてた花がきれいにさきました。",
      "外国に行きたいので、お金をそだてています。",
      "おきゃくさんが来るので、あさからごちそうをそだてました。",
      "1年前からそだてているビルがもうすぐできます。",
    ], correctIndex: 0
  },

  // ════════════════════════════════════════════════════════════════════════
  // ぶんぽう・どっかい
  // ════════════════════════════════════════════════════════════════════════

  // ─── 問題1 (q6): 文法空欄補充 (13問) ────────────────────────────────────

  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "わたしもピアノを習うこと（　）しました。",
    sentence: "わたしもピアノを習うこと[　]しました。",
    options: ["へ", "が", "に", "で"], correctIndex: 2
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "山田「ジョンさんは日本にどのくらいいる予定ですか。」\nジョン「ざんねんですが、一週間（　）いられません。」",
    sentence: "山田「ジョンさんは日本にどのくらいいる予定ですか。」\nジョン「ざんねんですが、一週間[　]いられません。」",
    options: ["だけ", "しか", "くらい", "でも"], correctIndex: 1
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "今日は午後から雨が降る（　）聞いたので、かさを持ってきました。",
    sentence: "今日は午後から雨が降る[　]聞いたので、かさを持ってきました。",
    options: ["は", "を", "の", "と"], correctIndex: 3
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "私の兄は、テニスもサッカー（　）上手です。",
    sentence: "私の兄は、テニスもサッカー[　]上手です。",
    options: ["が", "も", "で", "を"], correctIndex: 1
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "A「きのうの夜、（　）電話に出なかったんですか。」\nB「ごめんなさい。おふろに入っていました。」",
    sentence: "A「きのうの夜、[　]電話に出なかったんですか。」\nB「ごめんなさい。おふろに入っていました。」",
    options: ["どう", "どやって", "どんな", "どうして"], correctIndex: 3
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "父は朝ごはんの前に（　）新聞を読む。",
    sentence: "父は朝ごはんの前に[　]新聞を読む。",
    options: ["もうすぐ", "かならず", "なかなか", "だんだん"], correctIndex: 1
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "このアニメは世界（　）の子どもたちに人気がある。",
    sentence: "このアニメは世界[　]の子どもたちに人気がある。",
    options: ["など", "ずつ", "間", "中"], correctIndex: 3
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "このパソコンは何回（　）またすぐこわれる。",
    sentence: "このパソコンは何回[　]またすぐこわれる。",
    options: ["なおすまえ", "なおすとき", "なおしても", "なおしてから"], correctIndex: 2
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "田中さんは先生に作文を（　）よろこんでいました。",
    sentence: "田中さんは先生に作文を[　]よろこんでいました。",
    options: ["ほめて", "ほめてしまって", "ほめられて", "ほめさせて"], correctIndex: 2
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "私は医者に（　）ためにいっしょうけんめい勉強しています。",
    sentence: "私は医者に[　]ためにいっしょうけんめい勉強しています。",
    options: ["なる", "なり", "なれる", "なって"], correctIndex: 2
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "A「すみません。山田さんのけいたい電話のばんごうを（　）。」\nB「いいですよ。090-11-1111です。」",
    sentence: "A「すみません。山田さんのけいたい電話のばんごうを[　]。」\nB「いいですよ。090-11-1111です。」",
    options: ["教えてくれませんか", "教えましょうか", "教えてもいいです", "教えましょう"], correctIndex: 0
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "田中さんのけっこんパーティーが、今週の土曜日に（　）。",
    sentence: "田中さんのけっこんパーティーが、今週の土曜日に[　]。",
    options: ["開きます", "開きましょう", "開くでしょう", "開かれます"], correctIndex: 3
  },
  {
    groupId: "q6", sectionId: "grammar", type: "grammar_blank",
    display: "（学校で）\n西山「森さんがアルバイトを始めたそうですよ。」\n中田「ああ、だから最近じゅぎょうのあと急いで（　）ね。」",
    sentence: "（学校で）\n西山「森さんがアルバイトを始めたそうですよ。」\n中田「ああ、だから最近じゅぎょうのあと急いで[　]ね。」",
    options: ["帰っているんです", "帰っていることです", "帰っているからです", "帰っているところです"], correctIndex: 0
  },

  // ─── 問題2 (q7): 文の組み立て（★）(4問) ──────────────────────────────────

  // Q14: 山下さんが今どこにいるかわかりますか
  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "A「すみません。山下さんが今 ___ ___ ★ ___ わかりますか。」\nB「となりのへやにいますよ。」",
    sentence: "A「すみません。山下さんが今 ___ ___ [★] ___ わかりますか。」",
    options: ["か", "に", "いる", "どこ"],
    correctIndex: 2
  },

  // Q15: 来週、友だちがうちにとまりに来ることになりました
  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "来週、友だちがうちに ___ ___ ___ ★ になりました。",
    sentence: "来週、友だちがうちに ___ ___ ___ [★] になりました。",
    options: ["とまり", "来る", "に", "こと"],
    correctIndex: 3
  },

  // Q16: じしょを持ってくるのを忘れないようにしてください
  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "先生「日本語Aのじゅぎょうの日は、じしょを ___ ___ ★ ___ ようにしてください。」",
    sentence: "先生「日本語Aのじゅぎょうの日は、じしょを ___ ___ [★] ___ ようにしてください。」",
    options: ["持ってくる", "忘れない", "を", "の"],
    correctIndex: 2
  },

  // Q17: コーヒーはさとうを入れないで飲むが、ときどきあまいコーヒーも飲みたくなる
  {
    groupId: "q7", sectionId: "grammar", type: "grammar_blank",
    display: "私はいつもコーヒーは ___ ___ ___ ★ コーヒーも飲みたくなる。",
    sentence: "私はいつもコーヒーは ___ ___ ___ [★] コーヒーも飲みたくなる。",
    options: ["ときどき", "さとうを入れないで", "あまい", "飲むが"],
    correctIndex: 2
  },

  // ─── 問題3 (q8): 文章の文法 (4問) ──────────────────────────────────────

  {
    groupId: "q8", sectionId: "grammar", type: "grammar_blank",
    display: "（18）",
    sentence: "（18）に入るものを選んでください。",
    context: PASSAGE_Q8_N4,
    options: ["ともだちが教えてあげた", "ともだちが教えてくれた", "ともだちに教えてあった", "ともだちに教えておいた"],
    correctIndex: 1
  },
  {
    groupId: "q8", sectionId: "grammar", type: "grammar_blank",
    display: "（19）",
    sentence: "（19）に入るものを選んでください。",
    context: PASSAGE_Q8_N4,
    options: ["たとえば", "ですから", "それに", "しかし"],
    correctIndex: 2
  },
  {
    groupId: "q8", sectionId: "grammar", type: "grammar_blank",
    display: "（20）",
    sentence: "（20）に入るものを選んでください。",
    context: PASSAGE_Q8_N4,
    options: ["旅行したところです", "旅行するようになりました", "旅行したくなりました", "旅行していました"],
    correctIndex: 2
  },
  {
    groupId: "q8", sectionId: "grammar", type: "grammar_blank",
    display: "（21）",
    sentence: "（21）に入るものを選んでください。",
    context: PASSAGE_Q8_N4,
    options: ["行ってみるそうです", "行ってみるかもしれません", "行ってみたほうがいいですか", "行ってみてください"],
    correctIndex: 3
  },

  // ─── 問題4 (q9): 短文読解 (3問) ──────────────────────────────────────────

  {
    groupId: "q9", sectionId: "grammar", type: "grammar_blank",
    display: "ユンさんと一緒にバスケットボールをしたい人は、まずどうしなければなりませんか。",
    sentence: "ユンさんと一緒にバスケットボールをしたい人は、まずどうしなければなりませんか。",
    context: PASSAGE_Q9_N4_1,
    options: [
      "今週中に、バスケットボールをしたい人を10人集めます。",
      "今週中に、ユンさんのところに行ってクラスと名前を言います。",
      "10月14日(日)までに、ユンさんに100円を払います。",
      "10月14日(日)の夜7時までに、体育館に行きます。",
    ], correctIndex: 1
  },
  {
    groupId: "q9", sectionId: "grammar", type: "grammar_blank",
    display: "なぜ「私」は妹をすごいと思っていますか。",
    sentence: "なぜ「私」は妹をすごいと思っていますか。",
    context: PASSAGE_Q9_N4_2,
    options: [
      "妹は早起きをして、宿題と予習をしているから。",
      "妹は毎日、夜遅くまでサッカーの練習をしているから。",
      "妹は「私」より宿題を遅く始めても、いつも早く終わるから。",
      "妹はサッカーの練習のあとでも、宿題と予習をしてから寝るから。",
    ], correctIndex: 3
  },
  {
    groupId: "q9", sectionId: "grammar", type: "grammar_blank",
    display: "田中さんはリンさんに返事を書きたいと思っていますが、こまっています。どうしてですか。",
    sentence: "田中さんはリンさんに返事を書きたいと思っていますが、こまっています。どうしてですか。",
    context: PASSAGE_Q9_N4_3,
    options: [
      "リンさんが東京にいつ来るかわからないから。",
      "リンさんが東京になぜ来たのかわからないから。",
      "リンさんが東京でどこにとまるかわからないから。",
      "リンさんが東京で何を食べたいかわからないから。",
    ], correctIndex: 0
  },

  // ─── 問題5 (q10): 長文読解 (3問) ─────────────────────────────────────────

  {
    groupId: "q10", sectionId: "grammar", type: "grammar_blank",
    display: "娘は絵をかくとき、いつもどうしていましたか。",
    sentence: "娘は絵をかくとき、いつもどうしていましたか。",
    context: PASSAGE_Q10_N4,
    options: [
      "一人でかいていました。",
      "母と二人でかいていました。",
      "「私」と二人でかいていました。",
      "「私」と母と三人でかいていました。",
    ], correctIndex: 0
  },
  {
    groupId: "q10", sectionId: "grammar", type: "grammar_blank",
    display: "テレビを見たあと、「私」はどうやって絵封筒を作りましたか。",
    sentence: "テレビを見たあと、「私」はどうやって絵封筒を作りましたか。",
    context: PASSAGE_Q10_N4,
    options: [
      "封筒に鳥と木の絵をかきました。",
      "封筒に犬の絵の切手と、草と太陽の絵の切手をはりました。",
      "封筒にはった鳥の絵の切手の周りに、木の絵をかきました。",
      "封筒にはった犬の絵の切手の周りに、草や太陽の絵をかきました。",
    ], correctIndex: 3
  },
  {
    groupId: "q10", sectionId: "grammar", type: "grammar_blank",
    display: "「娘はきっと喜んでくれるでしょう」とありますが、どうして「私」は娘が喜ぶと思っていますか。",
    sentence: "「娘はきっと喜んでくれるでしょう」とありますが、どうして「私」は娘が喜ぶと思っていますか。",
    context: PASSAGE_Q10_N4,
    options: [
      "「私」の絵が上手になったから。",
      "「私」がきれいな封筒を作ったから。",
      "これからは「私」が娘と一緒に絵をかくから。",
      "これからは「私」が娘に絵を教えるから。",
    ], correctIndex: 1
  },

  // ─── 問題6 (q11): 情報検索 (2問) ─────────────────────────────────────────

  {
    groupId: "q11", sectionId: "grammar", type: "grammar_blank",
    display: "次の4人の中で、パソコン教室で勉強できる人はだれですか。",
    sentence: "次の4人の中で、パソコン教室で勉強できる人はだれですか。",
    context: PASSAGE_Q11_N4,
    options: ["ジェムさん", "マリオさん", "ソニアさん", "リナさん"],
    correctIndex: 0
  },
  {
    groupId: "q11", sectionId: "grammar", type: "grammar_blank",
    display: "ジェーンさんは、パソコン教室で勉強したいと思っていますが、9月1日の説明会にジェーンさんは出られません。ジェーンさんは、いつまでにお金を払う必要がありますか。",
    sentence: "ジェーンさんは、いつまでにお金を払う必要がありますか。",
    context: PASSAGE_Q11_N4,
    options: ["8月24日", "9月1日", "9月7日", "9月8日"],
    correctIndex: 2
  },

  // ════════════════════════════════════════════════════════════════════════
  // 聴解
  // ════════════════════════════════════════════════════════════════════════
  // audioSrc: /exams/n4/audio/listening.m4a (trimmed 1m26s from start)
  // audioStart / audioEnd: giây trong file listening.m4a — điền sau khi nghe audio

  // ─── もんだい1 (lq1): 8問 — まず質問を聞いてから話を聞き、答えを選ぶ ─────

  // 1ばん: テキスト選択 — 野菜を買うシーン
  {
    groupId: "lq1", sectionId: "listening", type: "listening_text",
    display: "1ばん",
    options: ["パン", "やさい", "みず", "しょうゆ"], correctIndex: 1,
  },
  // 2ばん: 絵選択 — サンダルの絵 (M/L, 白/黒)
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "2ばん",
    imageSrc: "/exams/n4/images/lq1-2.png",
    options: ["1", "2", "3", "4"], correctIndex: 3,
  },
  // 3ばん: 絵選択 — 女性の行動 (買い物/掃除機/料理/洗い物)
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "3ばん",
    imageSrc: "/exams/n4/images/lq1-3.png",
    options: ["1", "2", "3", "4"], correctIndex: 0,
  },
  // 4ばん: 絵選択 — 店でのやりとり (洋服/靴/レジ無バッグ/レジ有バッグ)
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "4ばん",
    imageSrc: "/exams/n4/images/lq1-4.png",
    options: ["1", "2", "3", "4"], correctIndex: 0,
  },
  // 5ばん: テキスト選択 — 場所
  {
    groupId: "lq1", sectionId: "listening", type: "listening_text",
    display: "5ばん",
    options: ["じぶんのうち", "としょかん", "きょうしつ", "じむしょ"], correctIndex: 2,
  },
  // 6ばん: 絵選択 — 机の上の物の位置 (1〜4番)
  {
    groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "6ばん",
    imageSrc: "/exams/n4/images/lq1-6.png",
    options: ["1", "2", "3", "4"], correctIndex: 2,
  },
  // 7ばん: テキスト選択 — 冊数
  {
    groupId: "lq1", sectionId: "listening", type: "listening_text",
    display: "7ばん",
    options: ["1さつ", "2さつ", "3さつ", "4さつ"], correctIndex: 1,
  },
  // 8ばん: テキスト選択 — 時間帯
  {
    groupId: "lq1", sectionId: "listening", type: "listening_text",
    display: "8ばん",
    options: [
      "午前6時から 午前10時まで",
      "午前6時から 午後1時まで",
      "午前10時から 午後1時まで",
      "午前10時から 午後5時まで",
    ], correctIndex: 1,
  },

  // ─── もんだい2 (lq2): 7問 — 質問を聞いてから話を聞き、答えを選ぶ ─────────

  // 1ばん: カラオケ断る理由
  {
    groupId: "lq2", sectionId: "listening", type: "listening_text",
    display: "1ばん",
    options: [
      "ようじがあるから",
      "カラオケがきらいだから",
      "今週しけんがあるから",
      "のどがいたいから",
    ], correctIndex: 3,
  },
  // 2ばん: 試合前にすること
  {
    groupId: "lq2", sectionId: "listening", type: "listening_text",
    display: "2ばん",
    options: [
      "かいじょうのじゅんびをすること",
      "しあい前にれんしゅうをすること",
      "かいじょうをかりること",
      "しあいをさんかんすること",
    ], correctIndex: 0,
  },
  // 3ばん: 夕食を食べない理由
  {
    groupId: "lq2", sectionId: "listening", type: "listening_text",
    display: "3ばん",
    options: [
      "すしがすきじゃないから",
      "ぐあいがわるいから",
      "ひるごはんがおそかったから",
      "ダイエットしているから",
    ], correctIndex: 2,
  },
  // 4ばん: 移動手段
  {
    groupId: "lq2", sectionId: "listening", type: "listening_text",
    display: "4ばん",
    options: [
      "バスにのって行った",
      "車をうんてんして行った",
      "あるいて行った",
      "じてんしゃで行った",
    ], correctIndex: 1,
  },
  // 5ばん: 授業の曜日
  {
    groupId: "lq2", sectionId: "listening", type: "listening_text",
    display: "5ばん",
    options: [
      "火ようびと水ようび",
      "火ようびと金ようび",
      "水ようびと金ようび",
      "火ようびと水ようびと金ようび",
    ], correctIndex: 0,
  },
  // 6ばん: 天気予報
  {
    groupId: "lq2", sectionId: "listening", type: "listening_text",
    display: "6ばん",
    options: [
      "一日中雨",
      "一日中はれ",
      "午前ははれ、午後は雨",
      "午前は雨、午後ははれ",
    ], correctIndex: 1,
  },
  // 7ばん: いつ日本語を勉強し始めたか
  {
    groupId: "lq2", sectionId: "listening", type: "listening_text",
    display: "7ばん",
    options: [
      "小学生のとき",
      "中学生のとき",
      "高校生のとき",
      "大学生のとき",
    ], correctIndex: 3,
  },

  // ─── もんだい3 (lq3): 5問 — 絵を見て矢印の人のセリフを選ぶ ───────────────

  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "1ばん", imageSrc: "/exams/n4/images/lq3-1.png",
    options: ["1", "2", "3"], correctIndex: 1,
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "2ばん", imageSrc: "/exams/n4/images/lq3-2.png",
    options: ["1", "2", "3"], correctIndex: 2,
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "3ばん", imageSrc: "/exams/n4/images/lq3-3.png",
    options: ["1", "2", "3"], correctIndex: 0,
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "4ばん", imageSrc: "/exams/n4/images/lq3-4.png",
    options: ["1", "2", "3"], correctIndex: 0,
  },
  {
    groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "5ばん", imageSrc: "/exams/n4/images/lq3-5.png",
    options: ["1", "2", "3"], correctIndex: 2,
  },

  // ─── もんだい4 (lq4): 8問 — 絵なし、文を聞いて返事を選ぶ ───────────────────

  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "1ばん", options: ["1", "2", "3"], correctIndex: 0,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "2ばん", options: ["1", "2", "3"], correctIndex: 1,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "3ばん", options: ["1", "2", "3"], correctIndex: 2,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "4ばん", options: ["1", "2", "3"], correctIndex: 1,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "5ばん", options: ["1", "2", "3"], correctIndex: 2,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "6ばん", options: ["1", "2", "3"], correctIndex: 1,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "7ばん", options: ["1", "2", "3"], correctIndex: 0,
  },
  {
    groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "8ばん", options: ["1", "2", "3"], correctIndex: 2,
  },
]

export const N4_2021_QUESTIONS: StaticQuestion[] = _RAW.map(q => {
  const key = `${q.groupId}:${q.display}`
  return { ...q, explanation: _explanationsMap[key] ?? undefined, script: _explanationsMap[`${key}:script`] ?? undefined }
})

export const N4_2021_COUNTS = {
  vocab:     N4_2021_QUESTIONS.filter(q => q.sectionId === "vocab").length,
  grammar:   N4_2021_QUESTIONS.filter(q => q.sectionId === "grammar").length,
  listening: N4_2021_QUESTIONS.filter(q => q.sectionId === "listening").length,
  get total() { return this.vocab + this.grammar + this.listening },
}
