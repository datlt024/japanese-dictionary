// 2021年12月 日本語能力試験 N3 — 言語知識（文字・語彙・文法）・読解・聴解
// Explanations are stored in ./explanations/n3-12-2021.json and merged at export time.

import _explanations from "./explanations/n3-12-2021.json"

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

// ─── Passages ────────────────────────────────────────────────────────────────

const PASSAGE_G3 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">以下は、留学生の作文である。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="text-align:center;font-weight:700;margin:0 0 4px;">桜の絵の傘</p>
<p style="text-align:right;font-size:13px;color:#6b7280;margin:0 0 12px;">パーカーキャサリン</p>
<p style="margin:0 0 10px;">　私は4月に日本に来ました。授業がないときや休みの日には、花見をしたり、買い物をしたり、大好きなテニスをしたりして、楽しく過ごしていました。<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">19</span>、6月になると、梅雨で雨の日が多くなりました。雨の日は、傘を持って歩くのがめんどうくさいし、テニスもできません。私は雨の日は嫌だと思っていました。雨の日が何日も続いたので、雨がほとんど降らないふるさとが懐かしくなりました。</p>
<p style="margin:0 0 10px;">　そんなとき、<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">20</span>が傘をプレゼントしてくれました。それまで、私はコンビニで買った黒い傘を使っていました。プレゼントの傘も黒で、私が持っている傘と似ていました。ところが、傘を開くと内側は全く違いました。友達がくれた傘は内側に美しい桜の絵が<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">21</span>。傘をさすと、まるで桜の木の下にいるようでした。私は楽しかった花見を思い出しました。</p>
<p style="margin:0;">　今は、この傘があるので雨の日が嫌ではありません。晴れの日が続いたときに、雨が降ってほしいなあと<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">22</span>。傘だけで気持ちがこんなに変わることに驚きました。</p>
</div>`

const PASSAGE_R4_1 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">これは、マラソン大会を手伝ってくれる人を募集するお知らせである。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="text-align:center;font-weight:700;margin:0 0 4px;">第3回山川市マラソン大会</p>
<p style="text-align:center;font-weight:700;margin:0 0 10px;">大会当日に手伝ってくださる方、大募集！</p>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin:6px 0;">
<tr><th style="border:1px solid #9ca3af;padding:4px 8px;background:#f3f4f6;text-align:left;white-space:nowrap;">日時</th><td style="border:1px solid #9ca3af;padding:4px 8px;">4月17日（土）午前7時〜午後3時ごろ</td></tr>
<tr><th style="border:1px solid #9ca3af;padding:4px 8px;background:#f3f4f6;text-align:left;">場所</th><td style="border:1px solid #9ca3af;padding:4px 8px;">山川市民運動場</td></tr>
<tr><th style="border:1px solid #9ca3af;padding:4px 8px;background:#f3f4f6;text-align:left;">内容</th><td style="border:1px solid #9ca3af;padding:4px 8px;">当日の準備や会場案内など</td></tr>
<tr><th style="border:1px solid #9ca3af;padding:4px 8px;background:#f3f4f6;text-align:left;">募集人数</th><td style="border:1px solid #9ca3af;padding:4px 8px;">約100人</td></tr>
<tr><th style="border:1px solid #9ca3af;padding:4px 8px;background:#f3f4f6;text-align:left;">募集期間</th><td style="border:1px solid #9ca3af;padding:4px 8px;">1月8日（金）〜2月12日（金）</td></tr>
</table>
<p style="margin:8px 0 4px;font-size:13px;">お願いする具体的な内容は、3月下旬に郵送でお知らせいたします。</p>
<p style="margin:0 0 4px;font-size:13px;font-weight:600;">応募できる方：</p>
<p style="margin:0 0 2px;font-size:13px;">・山川市民で18歳以上の方</p>
<p style="margin:0 0 6px;font-size:13px;">・大会当日の午前7時からの説明会に参加できる方</p>
<p style="margin:0 0 4px;font-size:13px;">特に、マラソン大会を手伝った経験がある方は歓迎します。</p>
<p style="margin:0;font-size:13px;">応募方法：スポーツ課ホームページからお願いします。ホームページが見られない方は、スポーツ課窓口でも受付をいたします。</p>
<p style="text-align:right;margin:6px 0 0;font-size:12px;color:#6b7280;">山川市役所スポーツ課マラソン大会係</p>
</div>`

const PASSAGE_R4_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　朝日市は、市民全員が力を合わせて美しい町を作り、気持ちのいい生活が送れるように、新しい規則を作った。その規則では、次の三つのことを禁止している。</p>
<p style="margin:0 0 4px;">①ごみ箱などの決められた場所以外にごみを捨てること</p>
<p style="margin:0 0 4px;">②歩きながらたばこを吸うこと</p>
<p style="margin:0;">③指定の場所以外に自転車をとめることである。守らなかった場合は、お金を払わされることもあるそうだ。</p>
</div>`

const PASSAGE_R4_3 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="text-align:right;margin:0 0 8px;font-size:13px;">10月15日</p>
<p style="margin:0 0 2px;">田中電気株式会社営業部</p>
<p style="margin:0 0 10px;">青山 一郎様</p>
<p style="text-align:right;margin:0 0 2px;">鈴木電気工業株式会社</p>
<p style="text-align:right;margin:0 0 10px;">営業第二課　山本和男</p>
<p style="margin:0 0 10px;">拝啓</p>
<p style="margin:0;">　いつもお世話になっております。先日はわが社の新製品説明会にご参加くださいまして、ありがとうございました。その他の製品についての説明を、ということでしたので、パンフレットと説明書、価格表をお送りいたします。よろしくお願いいたします。</p>
</div>`

const PASSAGE_R4_4 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0;">　先日、私は白い服をインクで汚してしまった。近所のクリーニング店に持っていったら、この汚れは落とせないと断られてしまった。そこで、インターネットで探すと、家からは遠いが、引き受けてくれそうな店が見つかった。服は郵送しなければならないが、相談のために電話をしてみたら落とせそうだと言われたので、送ってみることにした。きれいになって戻ってきたが、値段が高いので、この店に頼むのは<u>今回のように仕方ないとき</u>だけにしようと思う。</p>
</div>`

const PASSAGE_R5_1 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　スポーツクラブは運動するために行くところだ。しかし、私の母にとっては、それ以上の場所であった。</p>
<p style="margin:0 0 10px;">　85歳になる母は、今、スポーツクラブに通っている。実は、母は半年前に転んで腕を骨折し、それ以来すっかり元気をなくしてしまっていた。食欲が落ち、体重も減った。骨折は3週間で治ったが、腕を動かす訓練のための病院へはあまり行きたがらなかった。</p>
<p style="margin:0 0 10px;">　ところが、そんな母がある日、友達に誘われて近くのスポーツクラブに通い始めた。すると、たった1か月で全く違う人のように元気になったのだ。病院でもスポーツクラブでも、無理をせずにできるトレーニングを一人一人に考えてくれる。</p>
<p style="margin:0;">　しかし、元気な若い人たちと同じ場所で運動したり、同じくらいの年の仲間と一緒に頑張ったりすることは、スポーツクラブだからできたのである。そして、それが母の生きる力を引き出してくれたのだろう。スポーツクラブは運動するだけの場所ではない。それ以上の価値があるのだ。私は、今、母の通うスポーツクラブに心から感謝している。</p>
</div>`

const PASSAGE_R5_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　「部屋が片付けられない」と悩む人から相談を受けることがある。詳しく話を聞いてみると、整理が下手なのではなく、買い物のしかたに原因があることが多い。「セール」や「割引」の看板を見つけると、喜んで、つい店に入ってしまう。そして、安くなっているのを見ると、それが必要かどうか深く考えず、<u>①財布を開く</u>。その結果、部屋に物があふれるのだ。</p>
<p style="margin:0 0 10px;">　このような人には、次のような<u>②アドバイス</u>をしている。買う前に、まず、必要かどうかを考える。必要だと思ったら、次に、同じような物を持っていないかどうかを考える。持っていなければ、最後に、それをしまう場所があるかどうかを考える。場所がなければ、あきらめる。そこまで考えて、必要だったら、買えばいい。</p>
<p style="margin:0 0 10px;">　安いからといって、必要のない物やしまう場所のない物を次々と買えば、部屋が片付かないのは当然だ。</p>
<p style="margin:0;">　もうすぐ、あちこちのデパートでセールが始まるが、（　　　　　）。</p>
</div>`

const PASSAGE_R6 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="font-weight:700;margin:0 0 10px;">大山先生</p>
<p style="margin:0 0 10px;">　暑かった夏が過ぎ、涼しい風が吹き始めました。大山先生、いかがお過ごしでしょうか。</p>
<p style="margin:0 0 10px;">　先生と最後にお会いしたのは、卒業後10年を記念して集まったクラス会の席でした。あの時はなつかしい仲間たちと先生を囲んで、学生時代の思い出話をしましたね。みんな家族ができ、それぞれ仕事でもがんばっているようでしたが、中身は昔とちっとも変わっていないと感じました。あれからもう4年も経ってしまいました。</p>
<p style="margin:0 0 10px;">　先日京都に参りましたときに、高校の先生をしている川上君、マツダ銀行の木下君と会い、先生のご様子をうかがいました。もう大学をおやめになったと聞いて驚きました。しかし、相変わらずお元気で、奥様との自由でゆっくりした生活を楽しんでいらっしゃるそうで、安心いたしました。</p>
<p style="margin:0 0 10px;">　私は前と同じ会社で働いており、出張で国内外へ行くことの多い生活です。先生もご存知のとおり、昔から体は丈夫ですから、仕事が大変だと思ったことはありません。家族も皆、元気に過ごしております。</p>
<p style="margin:0 0 10px;">　京都で二人と会った時の写真をお送りいたします。二人とも以前より太っていたのでそれを笑ったら、「お前も腹が出てきたじゃないか」と言われました。みんないつまでも若くはないということですね。</p>
<p style="margin:0 0 10px;">　これからは時々先生にもお目にかかって、みんなでなつかしい思い出話がしたいと話し合いました。近いうちにまたご連絡申し上げます。</p>
<p style="margin:0 0 10px;">　では、本日はこれで失礼いたします。どうぞお体を大切に。</p>
<p style="margin:0 0 4px;">9月10日</p>
<p style="text-align:right;margin:0;">小川 進</p>
</div>`

const PASSAGE_R7 =
  `<div style="display:flex;flex-direction:column;gap:12px;">
<div>
<p style="font-size:12px;font-weight:700;margin:0 0 4px;">A</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:12px 14px;font-size:13px;line-height:1.8;">
<p style="text-align:center;font-weight:700;margin:0 0 6px;">あおい市市立図書館のご利用案内</p>
<p style="font-size:12px;font-weight:600;margin:0 0 4px;">図書館の開館時間・休館日</p>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin:0 0 8px;">
<tr><th style="border:1px solid #9ca3af;padding:3px 6px;background:#f3f4f6;text-align:center;">図書館名</th><th style="border:1px solid #9ca3af;padding:3px 6px;background:#f3f4f6;text-align:center;">開館時間</th><th style="border:1px solid #9ca3af;padding:3px 6px;background:#f3f4f6;text-align:center;">休館日</th></tr>
<tr><td style="border:1px solid #9ca3af;padding:3px 6px;text-align:center;">深川町図書館</td><td style="border:1px solid #9ca3af;padding:3px 6px;text-align:center;">9時〜18時</td><td style="border:1px solid #9ca3af;padding:3px 6px;text-align:center;">毎週月曜</td></tr>
<tr><td style="border:1px solid #9ca3af;padding:3px 6px;text-align:center;">南田町図書館</td><td style="border:1px solid #9ca3af;padding:3px 6px;text-align:center;">9時〜20時</td><td style="border:1px solid #9ca3af;padding:3px 6px;text-align:center;">毎週火曜</td></tr>
<tr><td style="border:1px solid #9ca3af;padding:3px 6px;text-align:center;">大山町図書館</td><td style="border:1px solid #9ca3af;padding:3px 6px;text-align:center;">9時〜20時</td><td style="border:1px solid #9ca3af;padding:3px 6px;text-align:center;">毎週月曜</td></tr>
</table>
<p style="font-size:12px;font-weight:600;margin:0 0 4px;">借り方・返し方：本・雑誌</p>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin:0 0 4px;">
<tr><td style="border:1px solid #9ca3af;padding:3px 6px;background:#f3f4f6;font-weight:600;white-space:nowrap;">借りる</td><td style="border:1px solid #9ca3af;padding:3px 6px;">三つの図書館から合計10冊、2週間まで借りることができます。</td></tr>
<tr><td style="border:1px solid #9ca3af;padding:3px 6px;background:#f3f4f6;font-weight:600;white-space:nowrap;">返す</td><td style="border:1px solid #9ca3af;padding:3px 6px;">三つの図書館のどちらでも返すことができます。<br>開館中：窓口にお返しください。<br>閉館中：入り口にあるブックポストに入れてください。</td></tr>
</table>
<p style="font-size:12px;font-weight:600;margin:6px 0 4px;">CD・DVD</p>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin:0;">
<tr><td style="border:1px solid #9ca3af;padding:3px 6px;background:#f3f4f6;font-weight:600;white-space:nowrap;">借りる</td><td style="border:1px solid #9ca3af;padding:3px 6px;">三つの図書館から合計5枚、1週間まで借りることができます。</td></tr>
<tr><td style="border:1px solid #9ca3af;padding:3px 6px;background:#f3f4f6;font-weight:600;white-space:nowrap;">返す</td><td style="border:1px solid #9ca3af;padding:3px 6px;">閉館中に、お借りになった図書館の窓口にお返しください。</td></tr>
</table>
</div>
</div>
<div>
<p style="font-size:12px;font-weight:700;margin:0 0 4px;">B</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:12px 14px;font-size:13px;line-height:1.8;">
<p style="text-align:center;font-weight:700;margin:0 0 2px;">あおい市市立図書館</p>
<p style="text-align:center;margin:0 0 8px;">4月の読書会のお知らせ</p>
<p style="font-weight:700;margin:0 0 2px;">◆大山町図書館◆</p>
<p style="margin:0 0 6px;">4月12日（土）10:00〜11:00／大山町図書館ロビー<br>今月のテーマは「大人も楽しめる絵本」です。親子での参加も可能です。昔から人気のある絵本、最近人気のある絵本、世界中で読まれている絵本など、さまざまな絵本を読んでみましょう。</p>
<p style="font-weight:700;margin:0 0 2px;">◆南田町図書館◆</p>
<p style="margin:0 0 6px;">4月19日（土）14:00〜15:00／南田町図書館2階会議室<br>今月のテキストは、小林ゆり『手ぶくろ』です。本が好きな方、図書館で語り合ってみませんか。大学生から参加できます。主に感想を話し合いますので、テキストを読んでからご参加ください。</p>
<p style="font-size:12px;margin:0 0 4px;">〈ご参加方法〉参加希望日の三日前までに、それぞれの図書館の窓口か、お電話で申し込んでください。</p>
<p style="font-size:12px;margin:0;">南田町図書館電話：056-123-4567　　大山町図書館電話：056-123-4578</p>
</div>
</div>
</div>`

// ─── Questions ───────────────────────────────────────────────────────────────

const _RAW: Omit<StaticQuestion, "explanation" | "script">[] = [
  // ── 問題1 漢字の読み方 (q1, 8問) ────────────────────────────────────────
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "自然",   sentence: "この国の人は[自然]を大切にしている。",                  options: ["しぜん","じぜん","しせん","じせん"],                 correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "秒",     sentence: "あと30[秒]で完成します。",                              options: ["じょう","しょう","びょう","ひょう"],                 correctIndex: 2 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "残り",   sentence: "夏休みも[残り]三日になってしまった。",                   options: ["もとり","おわり","のこり","あまり"],                 correctIndex: 2 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "増減",   sentence: "このグラフは、人口の[増減]を表している。",               options: ["ぞうけん","ぞうげん","じょうけん","じょうげん"],     correctIndex: 1 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "通知",   sentence: "面接の結果は、1週間以内に[通知]します。",               options: ["つうち","とおち","つうし","とおし"],                 correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "生えた", sentence: "庭に[生えた]草にきれいな花が咲いていた。",               options: ["はえた","せいえた","しようえた","うえた"],           correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "恋しく", sentence: "外国で一人暮らしをしているので、国の料理が[恋しく]なる。", options: ["なつかしく","うれしく","ほしく","こいしく"],          correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "郵送",   sentence: "これを[郵送]してください。",                            options: ["ほそう","ほうそう","ゆそう","ゆうそう"],             correctIndex: 3 },

  // ── 問題2 漢字の書き方 (q2, 6問) ────────────────────────────────────────
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "むすめ",   sentence: "あそこにいるのが私の[むすめ]です。",                    options: ["妹","嫁","婿","娘"],                                 correctIndex: 3 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "せいかく", sentence: "彼女は頭もいいし、[せいかく]もいい。",                 options: ["性格","正格","性確","正確"],                         correctIndex: 0 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "めいれい", sentence: "それは誰かの[めいれい]ですか。",                       options: ["命例","命令","企例","企令"],                         correctIndex: 1 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "あずけ",   sentence: "銀行へお金を[あずけ]に行ってきます。",                 options: ["預け","借け","替け","貯け"],                         correctIndex: 0 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "よそう",   sentence: "テストの点数が[よそう]以上によかった。",               options: ["予習","予測","予想","予定"],                         correctIndex: 2 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "こうか",   sentence: "これはとても[こうか]なものだ。",                       options: ["高値","高費","高給","高価"],                         correctIndex: 3 },

  // ── 問題3 文脈規定 (q3, 11問) ────────────────────────────────────────────
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "15", sentence: "会社に帰ったら、今回の出張の（　）をしなければならない。",            options: ["発言","報告","講演","応答"],               correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "16", sentence: "試合を見ていた人にテニスボールが（　）。",                           options: ["なぐった","うつった","あたった","うった"],   correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "17", sentence: "必要がないものを買うのは、お金の（　）だ。",                         options: ["苦手","無駄","貧乏","不用"],               correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "18", sentence: "今回は三日間の旅行であまり時間がないが、（　）多くの寺に行きたい。",  options: ["うっかり","たいてい","そっと","なるべく"],   correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "19", sentence: "日本に着いた（　）、大学で授業の説明会があった。",                   options: ["翌日","今後","明日","早速"],               correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "20", sentence: "来年は何か新しいことに（　）しようと思っている。",                   options: ["オープン","ノック","マーク","チャレンジ"],   correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "21", sentence: "駅前の（　）を安く買った。",                                         options: ["住所","土地","近所","番地"],               correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "22", sentence: "（　）電話でお願いした件は、どうなりましたか。",                     options: ["これから","このあいだ","ふだん","しばらく"], correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "23", sentence: "みんなの意見が（　）で、一つの意見にすることができません。",           options: ["がらがら","どきどき","ばらばら","ずきずき"], correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "24", sentence: "佐藤さんには、絶対に音楽家になるという強い（　）があるようだ。",       options: ["満足","将来","努力","意志"],               correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "25", sentence: "山田「仕事が終わりましたので、お先に失礼します。」\n田中「（　）。」", options: ["おまちどおさま","おつかれさま","おかえりなさい","おかげさまで"], correctIndex: 1 },

  // ── 問題4 言い換え類義 (q4, 5問) ────────────────────────────────────────
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "26", sentence: "昨日見た映画は[退屈]だった。",                                       options: ["めずらしかった","つまらなかった","おかしかった","おもしろかった"], correctIndex: 1 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "27", sentence: "危険なので絶対に[ふれないで]ください。",                              options: ["座らないで","走らないで","触らないで","休まないで"],             correctIndex: 2 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "28", sentence: "それはとてもいい[機会]だと思います。",                                 options: ["プレゼント","アイディア","パーティー","チャンス"],               correctIndex: 3 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "29", sentence: "今回の仕事は、いつもより[きつかった]。",                               options: ["大変だった","簡単だった","楽しかった","長かった"],               correctIndex: 0 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "30", sentence: "なぜ私のこたえが違うのか、友達の説明を聞いて[納得した]。",             options: ["少し分かった","とてもよく分かった","もう一度考えた","何度も考えた"], correctIndex: 1 },

  // ── 問題5 用法 (q5, 5問) ────────────────────────────────────────────────
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "集合",   sentence: "問題5: [集合]の使い方として最もよいものを選びなさい。",   options: ["あしたは駅前に7時に集合してください。","短時間に雨が集合して、ふった。","この店にはおいしいワインが集合している。","私の趣味は切手を集合することです。"], correctIndex: 0 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "中古",   sentence: "問題5: [中古]の使い方として最もよいものを選びなさい。",   options: ["これは中古の卵なので、早く食べたほうがいいですね。","彼女は、子どものころから仲良くしている中古の友達です。","あの店に行けば、中古のカメラが安く買えますよ。","ここでアルバイトを始めてから3年なので、私は中古の店員です。"], correctIndex: 2 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "追い抜く", sentence: "問題5: [追い抜く]の使い方として最もよいものを選びなさい。", options: ["マラソンで前の人を追い抜くときに、腕がぶつかってしまった。","この山を追い抜いたら、向こうに海が見えると思います。","この国では二十歳を追い抜くと、もう大人だ。","12時を追い抜いたので、お昼ご飯にしましょう。"], correctIndex: 0 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "見本",   sentence: "問題5: [見本]の使い方として最もよいものを選びなさい。",   options: ["今度のスピーチ大会には、川井さんが学校の見本で出るそうだ。","私の兄は、日本人の見本の身長より10センチくらい高い。","ここに申込書の書き方の見本があるので、参考にしてください。","ギターを弾くのが初めての人は、見本から教えてもらえます。"], correctIndex: 2 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "だるい",  sentence: "問題5: [だるい]の使い方として最もよいものを選びなさい。",  options: ["このスープは味がだるいから、塩を足したほうがいい。","ダイエットをしたら、スカートがだるくなった。","レポートが終わったら少しだるくしたい。","体がだるくて起きられない。"], correctIndex: 3 },

  // ── 文法 問題1 文の文法（空欄補充）(q6, 13問) ──────────────────────────
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "1",  sentence: "母は、留学している兄と久しぶりに電話で話して、とてもうれしそうな顔（　）していた。",                                                            options: ["へ","が","を","の"],                                                   correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "2",  sentence: "長い間建設中だったABCビルが、昨日（　）完成した。",                                                                                                  options: ["ずっと","今にも","次第に","ついに"],                                    correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "3",  sentence: "(電話で)\n店長「大下さん、急で申し訳ないんですけど、明日出勤することはできますか。」\n大下「午後（　）行けますが、それでも大丈夫ですか。」\n店長「ありがとうございます。お願いします。」", options: ["でなら","からなら","へでも","まででも"],                                correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "4",  sentence: "音楽会は、あすの11時からさくら広場（　）開かれます。",                                                                                               options: ["に対して","によって","について","において"],                            correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "5",  sentence: "去年姉に子供が生まれた。2、3か月に1回ぐらい会っているが、会う（　）大きくなっていて、びっくりする。",                                              options: ["たびに","うちに","間に","前に"],                                        correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "6",  sentence: "私は10年前から同じかばんを（　）続けている。",                                                                                                         options: ["使う","使い","使おう","使った"],                                        correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "7",  sentence: "田中さんがわたしの方に（　）見えました。",                                                                                                              options: ["走っていくことが","走ってくることが","走っていくのが","走ってくるのが"],  correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "8",  sentence: "山田「ジョンくんは、毎日バスケットボールの練習をしているんですか。」\nジョン「はい。早く試合に（　）なりたいんです。」",                            options: ["出られるように","出られるために","出させるように","出させるために"],      correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "9",  sentence: "今朝はすごい雨だったが、今はもう（　）",                                                                                                               options: ["降っている","降っていない","降る","降らない"],                           correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "10", sentence: "西川「あ、森さん、携帯電話がポケットから（　）よ。」\n森「本当だ。ありがとうございます。」",                                                         options: ["落ちるそうです","落ちそうです","落とすそうです","落としそうです"],         correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "11", sentence: "A「今度駅前に新しいケーキ屋さんができる（　）ね。」\nB「本当ですか。楽しみですね。」",                                                             options: ["でしょう","といい","ほうがいい","みたいだ"],                             correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "12", sentence: "この花は、上が乾いたら水をやる必要があるが、（　）。水が多いと根が腐ってしまう。",                                                                   options: ["やりすぎのもよくない","やらなくていいのがいい","やってやるのもよくない","やらないでおくのがいい"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "13", sentence: "(患者が病院に電話をする)\n受付の人「はい。山田病院でございます。」\n患者「すみません。10時に予約した田中と申しますが、11時に（　）。」",          options: ["変えましょうか","変えたほうがいいですか","変えていただきましょう","変えていただけないでしょうか"], correctIndex: 3 },

  // ── 文法 問題2 文の文法★（並べ替え）(q7, 5問) ─────────────────────────
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "14", sentence: "この小学生は　＿＿＿　＿＿＿　[★]　＿＿＿　問題を簡単に解いてしまう。",                                                       options: ["大人","ような","解けない","でも"],                  correctIndex: 2 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "15", sentence: "去年、初めて一人で海外を旅行した。行く前は心配なこともあったが、＿＿＿　＿＿＿　[★]　＿＿＿　だった。",                options: ["楽しいこと","ばかり","旅行していた","2週間は"],      correctIndex: 0 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "16", sentence: "A「昨日は日曜日だったから、遊園地は人が多かったでしょう?」\nB「いや、＿＿＿　＿＿＿　[★]　＿＿＿　いませんでしたよ。」", options: ["いた","込んで","ほど","思って"],                       correctIndex: 2 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "17", sentence: "一人暮らしを始めて、両親が毎日仕事を　＿＿＿　＿＿＿　[★]　＿＿＿　大変なことだったか、よくわかった。",               options: ["どれだけ","しながら","食事の準備や洗濯を","してくれていたことが"], correctIndex: 3 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "18", sentence: "患者「先生、おふろには入ってもいいんでしょうか。」\n医者「＿＿＿　＿＿＿　[★]　＿＿＿　いいよ」",                       options: ["なって","いたら","熱が下がって","あしたに"],          correctIndex: 2 },

  // ── 文法 問題3 文章の文法 (q8, 4問) ────────────────────────────────────
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "19", context: PASSAGE_G3, sentence: "（19）、6月になると、梅雨で雨の日が多くなりました。",                    options: ["だから","つまり","でも","そのうえ"],                                                              correctIndex: 2 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "20", context: PASSAGE_G3, sentence: "そんなとき、（20）が傘をプレゼントしてくれました。",                      options: ["その友達","こういう友達","どちらかの友達","友達"],                                               correctIndex: 3 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "21", context: PASSAGE_G3, sentence: "友達がくれた傘は内側に美しい桜の絵が（21）。",                          options: ["かいてあったそうです","かいてあったのです","かいてあったはずです","かいてあったおかげです"],     correctIndex: 1 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "22", context: PASSAGE_G3, sentence: "晴れの日が続いたときに、雨が降ってほしいなあと（22）。",               options: ["思うこともあります","思ったらいいです","思うことができません","思わなくなりました"],             correctIndex: 0 },

  // ── 読解 問題4 短文読解 (q9, 4問) ──────────────────────────────────────
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "23", context: PASSAGE_R4_1, sentence: "お知らせの内容に合っているのはどれか。",
    options: ["応募は、1月8日までにスポーツ課ホームページからしなければならない。","応募した人がどんなことを手伝うかは、当日にならないとわからない。","大会当日の朝の説明会に行けない人は応募できない。","マラソン大会を手伝ったことがある人だけが応募できる。"], correctIndex: 2 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "24", context: PASSAGE_R4_2, sentence: "この規則について、正しいものはどれか。",
    options: ["自分の家以外では、ごみを捨ててはならない。","道を歩きながら、たばこを吸ってはいけない。","自転車は、決められた場所以外走ってはいけない。","規則を守らない人は、全員お金を払わなければならない。"], correctIndex: 1 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "25", context: PASSAGE_R4_3, sentence: "山本さんがしたことはどれか。",
    options: ["田中電気の新製品のパンフレットと説明書、価格表を送った。","鈴木電気の新製品のパンフレットと説明書、価格表を送った。","田中電気の新製品以外のパンフレットと説明書、価格表を送った。","鈴木電気の新製品以外のパンフレットと説明書、価格表を送った。"], correctIndex: 3 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "26", context: PASSAGE_R4_4, sentence: "今回のように仕方ないときとあるが、どのようなときか。",
    options: ["近所の店に行く時間がないとき","近所の店に断られたとき","白い服を汚したとき","あまりお金がないとき"], correctIndex: 1 },

  // ── 読解 問題5 中文読解 (q10, 6問) ─────────────────────────────────────
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "27", context: PASSAGE_R5_1, sentence: "母が元気をなくした原因は何か。",
    options: ["食欲が落ちたから","体重が減ったから","腕を骨折したから","けがが治らないから"], correctIndex: 2 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "28", context: PASSAGE_R5_1, sentence: "母が病院ではなく、スポーツクラブで元気になれたのはなぜか。",
    options: ["無理をせずにできるトレーニングを自分用に作ってもらったから","若い人たちがいるところで運動したり、仲間と頑張ったりできたから","たった1か月で効果が出るようなトレーニングを考えてもらったから","元気な人と仲間になったり、若い人たちと同じ運動をしたりしたから"], correctIndex: 1 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "29", context: PASSAGE_R5_1, sentence: "この文章を書いた人は、スポーツクラブにはどんな特別な価値があると考えているか。",
    options: ["自分は生きる値段のある人間だと気づかせてくれる。","運動不足にならないようにしてくれる。","けがを早く治す方法を考えてくれる。","生きる力を引き出してくれる。"], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "30", context: PASSAGE_R5_2, sentence: "①財布を開くとあるが、どうしてですか。",
    options: ["まだ部屋に物を入れる場所があるから","何も買わずに店を出るのは悪いと思うから","安い値段がうれしくて買いたくなるから","自分にとって必要な物に違いないと思うから"], correctIndex: 2 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "31", context: PASSAGE_R5_2, sentence: "買い物についての②アドバイスの内容に合っているものは、どれか。",
    options: ["しまえる場所があったら、同じような物を持っていても、買えばいい。","必要な物だと思ったら、いろいろなことを考えずに、すぐ買えばいい。","必要かどうか、同じような物がないか、しまう場所があるかを、よく考える。","似た物を持っていないか、しまう場所があるか、本当に安いかを、よく考える。"], correctIndex: 2 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "32", context: PASSAGE_R5_2, sentence: "（　）に入れるのに、最もよいものはどれか。",
    options: ["部屋の整理が上手な人も、買い物を楽しもう","買い物が好きな人は、値段をよく見て買おう","安い物を買いたい人は、急いで店に行こう","部屋の整理に悩んでいる人は、気をつけよう"], correctIndex: 3 },

  // ── 読解 問題6 長文読解 (q11, 4問) ─────────────────────────────────────
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "33", context: PASSAGE_R6, sentence: "この手紙を書いた小川さんはどんな人か。",
    options: ["川上君、木下君と同じ会社で働いている人","出張の時に京都で大山先生と会った人","大山先生と同じ大学で教えていた人","大学の時、大山先生に教えてもらった人"], correctIndex: 3 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "34", context: PASSAGE_R6, sentence: "小川さんが大山先生と最後に会ったのはいつか。",
    options: ["4年前","6年前","10年前","14年前"], correctIndex: 0 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "35", context: PASSAGE_R6, sentence: "大山先生は今、どうしているか。",
    options: ["相変わらず京都の大学で教えている。","出張で国内外へ行くような生活をしている。","仕事をやめて奥さんと生活を楽しんでいる。","体を壊して自宅でゆっくりと過ごしている。"], correctIndex: 2 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "36", context: PASSAGE_R6, sentence: "小川さんが手紙といっしょに送った写真には、小川さんのほかにだれが写っているか。",
    options: ["小川さんの家族","川上君と木下君","大山先生と奥さん","クラス会に集まった人たち"], correctIndex: 1 },

  // ── 読解 問題7 情報検索 (q12, 2問) ─────────────────────────────────────
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "37", context: PASSAGE_R7, sentence: "コウさんは火曜日の19時ごろ、深川町図書館に本を返しに行こうと思っている。コウさんはどうしなければならないか。",
    options: ["窓口に返す。","ブックポストに返す。","窓口かブックポストに返す。","返せないので、違う日に行く。"], correctIndex: 1 },
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "38", context: PASSAGE_R7, sentence: "ビルさんは小学生の息子と一緒に参加できる読書会に行きたいと思っている。電話で申し込みをする場合、どうしなければならないか。",
    options: ["4月9日までの月曜以外の日に、大山町図書館に電話する。","4月9日までの火曜以外の日に、大山町図書館に電話する。","4月12日までの月曜以外の日に、大山町図書館に電話する。","4月16日までの火曜以外の日に、南田町図書館に電話する。"], correctIndex: 0 },

  // ── 聴解 問題1 (lq1, 6問) ───────────────────────────────────────────────
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text",  display: "2ばん", options: ["1ばんせん","2ばんせん","3ばんせん","4ばんせん"], correctIndex: 1 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text",  display: "3ばん", options: ["アウ","アエ","イウ","イエ"], correctIndex: 3 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text",  display: "5ばん", options: ["みんなの予定を聞く","メールで意見を聞く","かいぎの日時を知らせる","かいぎを開いて意見を聞く"], correctIndex: 0 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text",  display: "6ばん", options: ["ア","アイ","イウ","アイウ"], correctIndex: 1 },

  // ── 聴解 問題2 (lq2, 6問) ───────────────────────────────────────────────
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "1ばん", options: ["前の家より広いこと","駅から近いこと","にわがあること","会社から近いこと"], correctIndex: 2 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "2ばん", options: ["料理の味","料理のりょう","しょっき","お店の人のサービス"], correctIndex: 0 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "3ばん", options: ["日をまちがえたから","駅をまちがえたから","時間をまちがえたから","かいさつぐちをまちがえたから"], correctIndex: 3 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "4ばん", options: ["今週の土曜日の3時","今週の水曜日の4時半","来週の土曜日の3時","来週の水曜日の4時半"], correctIndex: 2 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "5ばん", options: ["早起きできるようになったこと","近所に知り合いがふえたこと","店で野菜を買わなくなったこと","まごが野菜を好きになったこと"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "6ばん", options: ["にわであそぶ子どもの写真","こうえんの花の写真","いけにいた鳥の写真","めずらしい魚の写真"], correctIndex: 2 },

  // ── 聴解 問題3 （no printed options）(lq3, 3問) ─────────────────────────
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3","4"], correctIndex: 2 },

  // ── 聴解 問題4 えを見ながら (lq4, 4問) ─────────────────────────────────
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3"], correctIndex: 1 },

  // ── 聴解 問題5 （no printed options）(lq5, 9問) ─────────────────────────
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "5ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "6ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "7ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "8ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "9ばん", options: ["1","2","3"], correctIndex: 0 },
]

const explanations = _explanations as Record<string, string>

export const N3_12_2021_QUESTIONS: StaticQuestion[] = _RAW.map(q => {
  const key = `${q.groupId}:${q.display}`
  return { ...q, explanation: explanations[key] ?? undefined, script: explanations[`${key}:script`] ?? undefined }
})

export const N3_12_2021_COUNTS = { vocab: 35, grammar: 38, listening: 28, total: 101 }
