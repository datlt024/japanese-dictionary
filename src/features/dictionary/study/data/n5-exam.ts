type QType = "kanji_reading" | "kanji_writing" | "context_vocab" | "grammar_blank"
           | "listening_pic" | "listening_text" | "listening_scene"

export interface StaticQuestion {
    groupId: string
    sectionId: string
    type: QType
    display: string
    reading?: string
    sentence?: string
    context?: string
    options: string[]
    correctIndex: number
    difficulty?: number  // 1=dễ · 2=trung bình · 3=khó · 4=rất khó
    imageSrc?: string
    audioStart?: number
    audioEnd?: number
    explanation?: string
}

// ─── もんだい3: 文章の文法 — 2つのさくぶん ─────────────────────────────────
const PASSAGE_Q7 =
`<p>ニンさんとメイさんは「私の好きな飲み物」のさくぶんを書いて、クラスのみんなの前で読みます。</p>
<p style="margin-top:16px;font-weight:600;">（１）ニンさんのさくぶん</p>
<p>　私の好きな飲み物はくだもののジュースです。大好きなジュースはすいかジュースです。私の国ではいろいろな店にあります。（22）、日本では売っている店を知りません。日本で好きなジュースはりんごジュースです。毎日飲みます。</p>
<p>　みなさんは何のジュースが好きですか。好きなジュースを（23）。</p>
<p style="margin-top:20px;font-weight:600;">（２）メイさんのさくぶん</p>
<p>　私はきっさてんで飲むコーヒーが大好きです。先週もきっさてんでおいしいコーヒーを飲みました。</p>
<p>　先週の土曜日はいい天気でした。昼に買い物をしてから、きっさてんに（24）。名前は「はな」です。「はな」（25）コーヒーは安かったです。私は２はい飲みました。来週も「はな」にコーヒーを（26）。</p>`

// ─── もんだい5: 読解 — チンさんの話（まちがえました） ────────────────────────
const PASSAGE_Q9 =
`<p style="text-align:center;font-size:15px;font-weight:700;letter-spacing:0.04em;">まちがえました</p>
<p style="text-align:right;margin-top:4px;margin-bottom:14px;">チン・シュン</p>
<p>　わたしは きのうの 日曜日、友だちと サッカーを しました。朝から ゆうがたまで しましたから、とても つかれました。ゆうべは ばんご飯を 食べた あとで、すぐに ねました。ですから、今日の かんじテストの べんきょうが できませんでした。</p>
<p>　けさは ５時に <u>①起きました</u>。シャワーを あびて、朝ご飯を 食べました。それから、すぐ かんじの テキストの 41ページから 60ページまで べんきょうしました。それから 学校へ 行きました。とても いそがしい 朝でした。</p>
<p>　しかし、きょうしつで かんじを べんきょうしている 人は いませんでした。<u>②まちがえました</u>。テストは 今日ではなくて、あしたでした。</p>`

export const N5_QUESTIONS: StaticQuestion[] = [
    // ─── 問題1: 漢字の読み (7問) ─────────────────────────────────────────
    // Bỏ: 雨(d=1), 書いて(d=1), 中に(d=1), 小さい(d=1), 魚(d=1)

    { groupId: "q1", sectionId: "vocab", type: "kanji_reading",
      display: "火よう日", sentence: "あしたは [火よう日]です。",
      options: ["どようび", "すいようび", "かようび", "にちようび"], correctIndex: 2,
      difficulty: 2 },

    { groupId: "q1", sectionId: "vocab", type: "kanji_reading",
      display: "空", sentence: "きれいな [空]ですね。",
      options: ["いえ", "うみ", "にわ", "そら"], correctIndex: 3,
      difficulty: 2 },

    { groupId: "q1", sectionId: "vocab", type: "kanji_reading",
      display: "百人", sentence: "せいとは [百人] います。",
      options: ["ひゃくにん", "びゃくにん", "ひゃくじん", "びゃくじん"], correctIndex: 0,
      difficulty: 3 },

    { groupId: "q1", sectionId: "vocab", type: "kanji_reading",
      display: "半分", sentence: "パンを [半分] ともだちに あげました。",
      options: ["はんふん", "はんぶん", "ほんぶん", "ほんふん"], correctIndex: 1,
      difficulty: 3 },

    { groupId: "q1", sectionId: "vocab", type: "kanji_reading",
      display: "間に", sentence: "ぎんこうと スーパーの [間に] ほそい みちが あります。",
      options: ["あいた", "となり", "あいだ", "どなり"], correctIndex: 2,
      difficulty: 3 },

    { groupId: "q1", sectionId: "vocab", type: "kanji_reading",
      display: "三つ", sentence: "たまごを [三つ] とって ください。",
      options: ["いつつ", "みっつ", "さんつ", "ごつ"], correctIndex: 1,
      difficulty: 2 },

    { groupId: "q1", sectionId: "vocab", type: "kanji_reading",
      display: "元気が", sentence: "きょうは [元気が] いいですね。",
      options: ["けんき", "げんき", "でんき", "てんき"], correctIndex: 1,
      difficulty: 3 },

    // ─── 問題2: 漢字の書き (5問) ──────────────────────────────────────────
    // Bỏ: かわ=川(d=1), みて=見て(d=1), たかい=高い(d=1)

    { groupId: "q2", sectionId: "vocab", type: "kanji_writing",
      display: "わいしゃつ", sentence: "この [わいしゃつ]を ください。",
      options: ["ウイシャソ", "ウイシャツ", "ワイシャソ", "ワイシャツ"], correctIndex: 3,
      difficulty: 2 },

    { groupId: "q2", sectionId: "vocab", type: "kanji_writing",
      display: "がっこう", sentence: "ヤンさんの [がっこう]は どこですか。",
      options: ["宇校", "学校", "宇枚", "学枚"], correctIndex: 1,
      difficulty: 2 },

    { groupId: "q2", sectionId: "vocab", type: "kanji_writing",
      display: "かいしゃ", sentence: "きのうは [かいしゃ]を やすみました。",
      options: ["公仕", "公社", "会仕", "会社"], correctIndex: 3,
      difficulty: 3 },

    { groupId: "q2", sectionId: "vocab", type: "kanji_writing",
      display: "いわないで", sentence: "まだ [いわないで] ください。",
      options: ["行わないで", "立わないで", "言わないで", "食わないで"], correctIndex: 2,
      difficulty: 3 },

    { groupId: "q2", sectionId: "vocab", type: "kanji_writing",
      display: "らいげつ", sentence: "[らいげつ] けっこんします。",
      options: ["今月", "来月", "来週", "今週"], correctIndex: 1,
      difficulty: 3 },

    // ─── 問題3 (q3): 文脈規定 — 空欄補充 (6問) ─────────────────────────────
    // Bỏ: 2かい(d=1), ナイフきって(d=1), プール(d=1), あまい(d=1)

    { groupId: "q3", sectionId: "vocab", type: "context_vocab",
      display: "（　　）を わすれましたから、じかんが わかりません。",
      sentence: "[　　]を わすれましたから、じかんが わかりません。",
      options: ["じしょ", "ちず", "とけい", "さいふ"], correctIndex: 2,
      difficulty: 2 },

    { groupId: "q3", sectionId: "vocab", type: "context_vocab",
      display: "わたしの うちは えきに ちかいですから、（　　）です。",
      sentence: "わたしの うちは えきに ちかいですから、[　　]です。",
      options: ["べんり", "じょうぶ", "いっぱい", "へた"], correctIndex: 0,
      difficulty: 2 },

    { groupId: "q3", sectionId: "vocab", type: "context_vocab",
      display: "しらない ことばが ありましたから、せんせいに（　　）しました。",
      sentence: "しらない ことばが ありましたから、せんせいに[　　]しました。",
      options: ["しつもん", "べんきょう", "れんしゅう", "じゅぎょう"], correctIndex: 0,
      difficulty: 3 },

    { groupId: "q3", sectionId: "vocab", type: "context_vocab",
      display: "この へやは あついですから、（　　）を あけましょう。",
      sentence: "この へやは あついですから、[　　]を あけましょう。",
      options: ["おふろ", "まど", "エアコン", "テーブル"], correctIndex: 1,
      difficulty: 2 },

    { groupId: "q3", sectionId: "vocab", type: "context_vocab",
      display: "きのうは がっこうで たくさん かんじを（　　）。",
      sentence: "きのうは がっこうで たくさん かんじを[　　]。",
      options: ["うりました", "もちました", "おぼえました", "こまりました"], correctIndex: 2,
      difficulty: 2 },

    { groupId: "q3", sectionId: "vocab", type: "context_vocab",
      display: "つよい かぜが（　　）います。",
      sentence: "つよい かぜが[　　]います。",
      options: ["ふいて", "いそいで", "とんで", "はしって"], correctIndex: 0,
      difficulty: 3 },

    // ─── 問題4 (q4): 言い換え類義 (3問) ─────────────────────────────────────
    // Bỏ: りょうしん(d=1), やさしい=かんたん(d=1)

    { groupId: "q4", sectionId: "vocab", type: "context_vocab",
      display: "ふくを せんたくしました。",
      sentence: "<u>ふくを せんたくしました。</u>",
      options: [
        "ふくを ぬぎました。",
        "ふくを わたしました。",
        "ふくを あらいました。",
        "ふくを きました。",
      ], correctIndex: 2,
      difficulty: 2 },

    { groupId: "q4", sectionId: "vocab", type: "context_vocab",
      display: "この へやは くらいですね。",
      sentence: "<u>この へやは くらいですね。</u>",
      options: [
        "この へやは あかるいですね。",
        "この へやは あかるくないですね。",
        "この へやは しずかじゃ ないですね。",
        "この へやは しずかですね。",
      ], correctIndex: 1,
      difficulty: 2 },

    { groupId: "q4", sectionId: "vocab", type: "context_vocab",
      display: "リーさんは もりさんに ペンを かしました。",
      sentence: "<u>リーさんは もりさんに ペンを かしました。</u>",
      options: [
        "リーさんは もりさんに ペンを もらいました。",
        "もりさんは リーさんに ペンを もらいました。",
        "リーさんは もりさんに ペンを かりました。",
        "もりさんは リーさんに ペンを かりました。",
      ], correctIndex: 1,
      difficulty: 3 },

    // ─── 問題1 (q5): 文法空欄補充 (10問) ────────────────────────────────────
    // Bỏ: で(ひこうき), に(田中会う), ください(ケーキ屋), きのうは/今日は, そこ, また

    { groupId: "q5", sectionId: "grammar", type: "grammar_blank",
      display: "先週 デパートで かばん（　）くつなどを 買いました。",
      sentence: "先週 デパートで かばん[　]くつなどを 買いました。",
      options: ["は", "も", "へ", "や"], correctIndex: 3,
      difficulty: 2 },

    { groupId: "q5", sectionId: "grammar", type: "grammar_blank",
      display: "私は 毎朝 7時ごろ 家（　）出ます。",
      sentence: "私は 毎朝 7時ごろ 家[　]出ます。",
      options: ["を", "と", "が", "で"], correctIndex: 0,
      difficulty: 2 },

    { groupId: "q5", sectionId: "grammar", type: "grammar_blank",
      display: "私の うちの ほんだなは、きょねん 父（　）作りました。",
      sentence: "私の うちの ほんだなは、きょねん 父[　]作りました。",
      options: ["や", "が", "を", "で"], correctIndex: 1,
      difficulty: 2 },

    { groupId: "q5", sectionId: "grammar", type: "grammar_blank",
      display: "今日 やおやで りんごを 買いました。五つ（　）300円でした。",
      sentence: "今日 やおやで りんごを 買いました。五つ[　]300円でした。",
      options: ["に", "と", "で", "や"], correctIndex: 2,
      difficulty: 3 },

    { groupId: "q5", sectionId: "grammar", type: "grammar_blank",
      display: "南町は、海が きれい（　）、静かです。",
      sentence: "南町は、海が きれい[　]、静かです。",
      options: ["も", "や", "で", "と"], correctIndex: 2,
      difficulty: 3 },

    { groupId: "q5", sectionId: "grammar", type: "grammar_blank",
      display: "A「先週 はじめて スキーを しました。」\nB「そうですか。（　）でしたか。」\nA「とても 楽しかったです。」",
      sentence: "A「先週 はじめて スキーを しました。」\nB「そうですか。[　]でしたか。」\nA「とても 楽しかったです。」",
      options: ["いくつ", "いかが", "どなた", "どちら"], correctIndex: 1,
      difficulty: 2 },

    { groupId: "q5", sectionId: "grammar", type: "grammar_blank",
      display: "森「ケンさん、大学の じゅぎょうは 始まりましたか。」\nケン「いいえ、（　）です。来週 始まります。」",
      sentence: "森「ケンさん、大学の じゅぎょうは 始まりましたか。」\nケン「いいえ、[　]です。来週 始まります。」",
      options: ["よく", "もう", "ちょっと", "まだ"], correctIndex: 3,
      difficulty: 2 },

    { groupId: "q5", sectionId: "grammar", type: "grammar_blank",
      display: "父は 毎朝 コーヒーを（　）ながら 新聞を 読みます。",
      sentence: "父は 毎朝 コーヒーを[　]ながら 新聞を 読みます。",
      options: ["飲む", "飲み", "飲んで", "飲んだ"], correctIndex: 1,
      difficulty: 3 },

    { groupId: "q5", sectionId: "grammar", type: "grammar_blank",
      display: "私は 小さいとき、なっとうが 好き（　）でした。",
      sentence: "私は 小さいとき、なっとうが 好き[　]でした。",
      options: ["ない", "じゃない", "ありません", "じゃありません"], correctIndex: 3,
      difficulty: 3 },

    { groupId: "q5", sectionId: "grammar", type: "grammar_blank",
      display: "リー「日曜日に、私の 家で アンさんと べんきょうを します。キムさんも（　）。」\nキム「あ、行きたいです。」",
      sentence: "リー「日曜日に、私の 家で アンさんと べんきょうを します。キムさんも[　]。」\nキム「あ、行きたいです。」",
      options: ["来ませんか", "来て いますか", "来ませんでしたか", "来て いましたか"], correctIndex: 0,
      difficulty: 2 },

    // ─── 問題2 (q6): 文の組み立て（★） (4問) ─────────────────────────────────
    // Bỏ: Q17 右にまがって(d=2) — đơn giản nhất trong nhóm

    { groupId: "q6", sectionId: "grammar", type: "grammar_blank",
      display: "私は 日曜日に 兄 ___ ___ ★ ___ 出かけました。",
      sentence: "私は 日曜日に 兄 ___ ___ [★] ___ 出かけました。",
      options: ["の", "と", "子ども", "いっしょに"],
      correctIndex: 1,
      difficulty: 3 },

    { groupId: "q6", sectionId: "grammar", type: "grammar_blank",
      display: "きのう 買った おかしは ___ ___ ★ ___ でした。",
      sentence: "きのう 買った おかしは ___ ___ [★] ___ でした。",
      options: ["色", "きれい", "が", "まるくて"],
      correctIndex: 2,
      difficulty: 3 },

    { groupId: "q6", sectionId: "grammar", type: "grammar_blank",
      display: "駅の ___ ___ ★ ___ で ざっしを 買いました。",
      sentence: "駅の ___ ___ [★] ___ で ざっしを 買いました。",
      options: ["に", "ある", "近く", "本屋"],
      correctIndex: 1,
      difficulty: 3 },

    { groupId: "q6", sectionId: "grammar", type: "grammar_blank",
      display: "先週 ___ ___ ★ ___ の こうちゃは とても おいしかったです。",
      sentence: "先週 ___ ___ [★] ___ の こうちゃは とても おいしかったです。",
      options: ["もらった", "ともだち", "外国", "に"],
      correctIndex: 0,
      difficulty: 4 },

    // ─── 問題3 (q7): 文章の文法 (3問) ────────────────────────────────────────
    // Bỏ: (22)でも(d=2), (23)教えてください(d=2)

    { groupId: "q7", sectionId: "grammar", type: "grammar_blank",
      display: "（24）",
      sentence: "（24）に入るものを選んでください。",
      context: PASSAGE_Q7,
      options: ["入るからです", "入ったからです", "入ります", "入りました"], correctIndex: 3,
      difficulty: 3 },

    { groupId: "q7", sectionId: "grammar", type: "grammar_blank",
      display: "（25）",
      sentence: "（25）に入るものを選んでください。",
      context: PASSAGE_Q7,
      options: ["から", "と", "の", "より"], correctIndex: 2,
      difficulty: 3 },

    { groupId: "q7", sectionId: "grammar", type: "grammar_blank",
      display: "（26）",
      sentence: "（26）に入るものを選んでください。",
      context: PASSAGE_Q7,
      options: ["飲んで行きます", "飲んで来ます", "飲みに行きます", "飲みに来ます"], correctIndex: 2,
      difficulty: 4 },

    // ─── 問題4 (q8): 読解 — 短文2題 各1問 ───────────────────────────────────
    // Bỏ: (1)けさ食べたもの(d=2) — dễ nhất, đáp án đề thẳng

    { groupId: "q8", sectionId: "grammar", type: "grammar_blank",
      display: "大学は「日本語１」のクラスの学生に何が言いたいですか。",
      sentence: "大学は「日本語１」のクラスの学生に何が言いたいですか。",
      context: `<p>（２）　（大学で）　学生が　この　紙を　見ました。</p>
<div style="border:1.5px solid #c8cdd6;border-radius:8px;padding:18px 22px;margin-top:12px;line-height:2;">
<p style="text-align:center;">「日本語１」と「日本語２」のクラスのみなさんへ</p>
<p style="margin-top:14px;">　今日　出川先生はお昼まで　お休みです。午前の「日本語１」のクラスはありません。午後の「日本語２」のクラスはあります。</p>
<p style="margin-top:10px;">・「日本語１」のしゅくだいは　来週　出してください。</p>
<p style="text-align:right;margin-top:16px;">2016年12月２日　髙見大学</p>
</div>`,
      options: [
          "今日クラスはありません。しゅくだいは午後出してください。",
          "今日クラスはありません。しゅくだいは来週出してください。",
          "今日クラスがありますが、しゅくだいは来週出してください。",
          "今日クラスがありますから、しゅくだいを出してください。",
      ], correctIndex: 1,
      difficulty: 3 },

    { groupId: "q8", sectionId: "grammar", type: "grammar_blank",
      display: "このメモを読んで、ボゴさんははじめに何をしますか。",
      sentence: "このメモを読んで、ボゴさんははじめに何をしますか。",
      context: `<p>（３）　（会社で）　ボゴさんの机の上に、このメモとにもつがあります。</p>
<div style="border:1.5px solid #c8cdd6;border-radius:8px;padding:18px 22px;margin-top:12px;line-height:2;">
<p>ボゴさん</p>
<p style="margin-top:14px;">　10時ごろゆうびんきょくの人がこのにもつをとりに来ますから、にもつとお金をわたしてください。お金は中西さんが持っています。ゆうびんきょくの人が来る前にもらいに行ってください。</p>
<p style="margin-top:10px;">よろしくおねがいします。</p>
<p style="text-align:right;margin-top:10px;">多田<br>11月30日　9:30</p>
</div>`,
      options: [
          "中西さんにお金をもらいます。",
          "中西さんにもつとお金をわたします。",
          "ゆうびんきょくの人ににもつをもらいます。",
          "ゆうびんきょくの人ににもつとお金をわたします。",
      ], correctIndex: 0,
      difficulty: 3 },

    // ─── 問題5 (q9): 読解 — 中文1題 2問 ────────────────────────────────────

    { groupId: "q9", sectionId: "grammar", type: "grammar_blank",
      display: "どうして ①けさは ５時に 起きましたか。",
      sentence: "どうして <u>①けさは ５時に 起きました</u>か。",
      context: PASSAGE_Q9,
      options: [
          "朝から ゆうがたまで サッカーを したかったから",
          "かんじテストの べんきょうが したかったから",
          "シャワーを あびて、朝ご飯を 食べたかったから",
          "学校へ 行って、べんきょうが したかったから",
      ], correctIndex: 1,
      difficulty: 2 },

    { groupId: "q9", sectionId: "grammar", type: "grammar_blank",
      display: "チンさんは 何を ②まちがえましたか。",
      sentence: "チンさんは 何を <u>②まちがえました</u>か。",
      context: PASSAGE_Q9,
      options: [
          "かんじの テキスト",
          "かんじの テキストの ページ",
          "かんじの テストが ある 日",
          "かんじの テストを する きょうしつ",
      ], correctIndex: 2,
      difficulty: 3 },

    // ─── 問題6 (q10): 情報検索 — 図を見て答える (1問) ────────────────────────

    { groupId: "q10", sectionId: "grammar", type: "grammar_blank",
      display: "パブロさんは どの 行き方で 行きますか。",
      sentence: "パブロさんは どの 行き方で 行きますか。",
      context: `<p>パブロさんは 高木大学に 行きたいです。花田駅か 糸川駅から 乗ります。駅から 大学まで かかる お金は 500円までで、時間は みじかいほうが いいです。</p>
<div style="border:2px solid #374151;border-radius:8px;overflow:hidden;margin-top:14px;font-size:12.5px;">
<div style="display:flex;align-items:center;justify-content:space-between;background:#374151;color:#fff;padding:6px 14px;">
<span style="font-weight:700;font-size:14px;">高木大学に 来たい 人へ</span>
<span style="font-weight:700;font-size:13px;">高木大学</span>
</div>
<div style="padding:14px 16px;border-bottom:1.5px dashed #d1d5db;">
<p style="margin:0 0 8px;font-weight:600;">① かかる 時間：<strong>46分</strong>　かかる お金：<strong>300円</strong></p>
<div style="display:flex;align-items:center;gap:0;">
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:6px 10px;text-align:center;flex-shrink:0;">
<div style="font-size:10px;opacity:0.6;">寺西駅</div>
<div style="font-weight:600;">バスてい</div>
<div>1ばん</div>
</div>
<div style="flex:1;text-align:center;padding:0 6px;">
<div>バス</div>
<div style="height:2px;background:#4b5563;margin:2px 0;"></div>
<div>45分</div>
</div>
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:6px 10px;text-align:center;flex-shrink:0;">
<div style="font-size:10px;opacity:0.6;">バスてい</div>
<div style="font-weight:600;">「高木大学前」</div>
</div>
<div style="flex:1;text-align:center;padding:0 6px;">
<div>歩く</div>
<div style="height:2px;background:#4b5563;margin:2px 0;"></div>
<div>1分</div>
</div>
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:8px 12px;text-align:center;flex-shrink:0;font-weight:700;">高木大学</div>
</div>
</div>
<div style="padding:14px 16px;border-bottom:1.5px dashed #d1d5db;">
<p style="margin:0 0 8px;font-weight:600;">② かかる 時間：<strong>30分</strong>　かかる お金：<strong>550円</strong></p>
<div style="display:flex;align-items:center;gap:0;">
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:8px 12px;text-align:center;flex-shrink:0;font-weight:600;">花田駅</div>
<div style="flex:1;text-align:center;padding:0 6px;">
<div>電車</div>
<div style="height:2px;background:#4b5563;margin:2px 0;"></div>
<div>25分</div>
</div>
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:8px 12px;text-align:center;flex-shrink:0;font-weight:600;">水村駅</div>
<div style="flex:1;text-align:center;padding:0 6px;">
<div>歩く</div>
<div style="height:2px;background:#4b5563;margin:2px 0;"></div>
<div>5分</div>
</div>
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:8px 12px;text-align:center;flex-shrink:0;font-weight:700;">高木大学</div>
</div>
</div>
<div style="padding:14px 16px;border-bottom:1.5px dashed #d1d5db;">
<p style="margin:0 0 8px;font-weight:600;">③ かかる 時間：<strong>40分</strong>　かかる お金：<strong>450円</strong></p>
<div style="display:flex;align-items:center;gap:0;">
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:8px 12px;text-align:center;flex-shrink:0;font-weight:600;">花田駅</div>
<div style="flex:1;text-align:center;padding:0 6px;">
<div>ちかてつ</div>
<div style="height:2px;background:#4b5563;margin:2px 0;"></div>
<div>30分</div>
</div>
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:8px 12px;text-align:center;flex-shrink:0;font-weight:600;">木山駅</div>
<div style="flex:1;text-align:center;padding:0 6px;">
<div>歩く</div>
<div style="height:2px;background:#4b5563;margin:2px 0;"></div>
<div>10分</div>
</div>
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:8px 12px;text-align:center;flex-shrink:0;font-weight:700;">高木大学</div>
</div>
</div>
<div style="padding:14px 16px;">
<p style="margin:0 0 8px;font-weight:600;">④ かかる 時間：<strong>35分</strong>　かかる お金：<strong>430円</strong></p>
<div style="display:flex;align-items:center;gap:0;">
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:8px 12px;text-align:center;flex-shrink:0;font-weight:600;">糸川駅</div>
<div style="flex:1;text-align:center;padding:0 6px;">
<div>電車</div>
<div style="height:2px;background:#4b5563;margin:2px 0;"></div>
<div>25分</div>
</div>
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:8px 12px;text-align:center;flex-shrink:0;font-weight:600;">木山駅</div>
<div style="flex:1;text-align:center;padding:0 6px;">
<div>歩く</div>
<div style="height:2px;background:#4b5563;margin:2px 0;"></div>
<div>10分</div>
</div>
<div style="border:1.5px solid #4b5563;border-radius:4px;padding:8px 12px;text-align:center;flex-shrink:0;font-weight:700;">高木大学</div>
</div>
</div>
</div>`,
      options: ["①", "②", "③", "④"],
      correctIndex: 3,
      difficulty: 4 },
]

// ─── 聴解 (Listening) — 24問 ──────────────────────────────────────────────────
// Timestamps (audioStart/audioEnd) are filled by scripts/generate-n5-listening.py
// Images live at public/exams/n5/listening/
const N5_LISTENING: StaticQuestion[] = [

  // ── もんだい１ (lq1): 7問 ─────────────────────────────────────────────────

  // 1ばん: 昼食 [image: (1)すし (2)ラーメン (3)カレー (4)サンドイッチ]
  { groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "1ばん", options: ["1","2","3","4"], correctIndex: 1,
    imageSrc: "/exams/n5/listening/lq1_q1.svg",
    audioStart: 45, audioEnd: 68 },

  // 2ばん: 机の位置 [image: (1)窓の近く (2)ドアの近く (3)真ん中 (4)ベッドの横]
  { groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "2ばん", options: ["1","2","3","4"], correctIndex: 0,
    imageSrc: "/exams/n5/listening/lq1_q2.svg",
    audioStart: 73, audioEnd: 90 },

  // 3ばん: 天気 [image: (1)はれ (2)くもり (3)あめ (4)ゆき]
  { groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "3ばん", options: ["1","2","3","4"], correctIndex: 3,
    imageSrc: "/exams/n5/listening/lq1_q3.svg",
    audioStart: 95, audioEnd: 116 },

  // 4ばん: 地図（図書館の位置）[image: map with 4 positions]
  { groupId: "lq1", sectionId: "listening", type: "listening_pic",
    display: "4ばん", options: ["1","2","3","4"], correctIndex: 2,
    imageSrc: "/exams/n5/listening/lq1_q4.svg",
    audioStart: 121, audioEnd: 143 },

  // 5ばん: 会議の時間
  { groupId: "lq1", sectionId: "listening", type: "listening_text",
    display: "5ばん", options: ["８じ","９じ","１０じ","１１じ"], correctIndex: 1,
    audioStart: 148, audioEnd: 169 },

  // 6ばん: テストの曜日
  { groupId: "lq1", sectionId: "listening", type: "listening_text",
    display: "6ばん", options: ["月曜日","火曜日","水曜日","木曜日"], correctIndex: 2,
    audioStart: 174, audioEnd: 188 },

  // 7ばん: 持ち物の組み合わせ [image: ア=かさ　イ=おかね　ウ=スマートフォン]
  { groupId: "lq1", sectionId: "listening", type: "listening_scene",
    display: "7ばん", options: ["アイ","アウ","イウ","アイウ"], correctIndex: 0,
    imageSrc: "/exams/n5/listening/lq1_q7.svg",
    audioStart: 193, audioEnd: 219 },

  // ── もんだい２ (lq2): 6問 ─────────────────────────────────────────────────

  // 1ばん: スポーツ [image: (1)サッカー (2)テニス (3)すいえい (4)バスケット]
  { groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "1ばん", options: ["1","2","3","4"], correctIndex: 0,
    imageSrc: "/exams/n5/listening/lq2_q1.svg",
    audioStart: 247, audioEnd: 269 },

  // 2ばん: 移動手段 [image: (1)コンビニ (2)バス (3)でんしゃ (4)タクシー]
  { groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "2ばん", options: ["1","2","3","4"], correctIndex: 2,
    imageSrc: "/exams/n5/listening/lq2_q2.svg",
    audioStart: 274, audioEnd: 295 },

  // 3ばん: カレンダー [image: calendar with (1)8日 (2)10日 (3)12日 (4)15日]
  { groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "3ばん", options: ["1","2","3","4"], correctIndex: 3,
    imageSrc: "/exams/n5/listening/lq2_q3.svg",
    audioStart: 300, audioEnd: 320 },

  // 4ばん: ねこの数
  { groupId: "lq2", sectionId: "listening", type: "listening_text",
    display: "4ばん", options: ["１ひき","２ひき","３ひき","４ひき"], correctIndex: 2,
    audioStart: 325, audioEnd: 347 },

  // 5ばん: りんごの数 [image: (1)2つ (2)3つ (3)4つ (4)5つ]
  { groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "5ばん", options: ["1","2","3","4"], correctIndex: 3,
    imageSrc: "/exams/n5/listening/lq2_q5.svg",
    audioStart: 352, audioEnd: 366 },

  // 6ばん: 通学手段 [image: (1)バス (2)じてんしゃ (3)でんしゃ (4)くるま]
  { groupId: "lq2", sectionId: "listening", type: "listening_pic",
    display: "6ばん", options: ["1","2","3","4"], correctIndex: 1,
    imageSrc: "/exams/n5/listening/lq2_q6.svg",
    audioStart: 371, audioEnd: 388 },

  // ── もんだい３ (lq3): 5問 ─────────────────────────────────────────────────

  // 1ばん: コンビニで商品を受け取る [arrow→客]
  { groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "1ばん", options: ["1","2","3"], correctIndex: 0,
    imageSrc: "/exams/n5/listening/lq3_q1.svg",
    audioStart: 416, audioEnd: 434 },

  // 2ばん: 友だちの家に到着 [arrow→訪問者]
  { groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "2ばん", options: ["1","2","3"], correctIndex: 1,
    imageSrc: "/exams/n5/listening/lq3_q2.svg",
    audioStart: 438, audioEnd: 452 },

  // 3ばん: レストランで注文 [arrow→客]
  { groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "3ばん", options: ["1","2","3"], correctIndex: 1,
    imageSrc: "/exams/n5/listening/lq3_q3.svg",
    audioStart: 456, audioEnd: 472 },

  // 4ばん: 写真を撮ってもらう [arrow→通行人]
  { groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "4ばん", options: ["1","2","3"], correctIndex: 2,
    imageSrc: "/exams/n5/listening/lq3_q4.svg",
    audioStart: 476, audioEnd: 495 },

  // 5ばん: 道を尋ねる [arrow→地図を持つ人]
  { groupId: "lq3", sectionId: "listening", type: "listening_scene",
    display: "5ばん", options: ["1","2","3"], correctIndex: 0,
    imageSrc: "/exams/n5/listening/lq3_q5.svg",
    audioStart: 499, audioEnd: 518 },

  // ── もんだい４ (lq4): 6問 ─────────────────────────────────────────────────

  // 1ばん: 授業の感想
  { groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "1ばん", options: ["1","2","3"], correctIndex: 1,
    audioStart: 546, audioEnd: 558 },

  // 2ばん: 映画の誘い
  { groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "2ばん", options: ["1","2","3"], correctIndex: 0,
    audioStart: 562, audioEnd: 575 },

  // 3ばん: 荷物を持つ申し出
  { groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "3ばん", options: ["1","2","3"], correctIndex: 2,
    audioStart: 579, audioEnd: 594 },

  // 4ばん: パーティー欠席
  { groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "4ばん", options: ["1","2","3"], correctIndex: 1,
    audioStart: 598, audioEnd: 614 },

  // 5ばん: 本を読んだか
  { groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "5ばん", options: ["1","2","3"], correctIndex: 0,
    audioStart: 618, audioEnd: 631 },

  // 6ばん: 日本語の難しさ
  { groupId: "lq4", sectionId: "listening", type: "listening_text",
    display: "6ばん", options: ["1","2","3"], correctIndex: 2,
    audioStart: 635, audioEnd: 648 },
]

export const N5_QUESTIONS_WITH_LISTENING: StaticQuestion[] = [
    ...N5_QUESTIONS,
    ...N5_LISTENING,
]

export const N5_EXAM_COUNTS = {
    vocab:     N5_QUESTIONS.filter(q => q.sectionId === "vocab").length,
    grammar:   N5_QUESTIONS.filter(q => q.sectionId === "grammar").length,
    listening: N5_LISTENING.length,
    get total() { return this.vocab + this.grammar + this.listening },
}
