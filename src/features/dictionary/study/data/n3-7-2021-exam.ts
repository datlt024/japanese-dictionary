// 2021年7月 日本語能力試験 N3 — 言語知識（文字・語彙・文法）・読解・聴解
// Explanations are stored in ./explanations/n3-7-2021.json and merged at export time.

import _explanations from "./explanations/n3-7-2021.json"

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
<p style="text-align:center;font-weight:700;margin:0 0 4px;">日本の飲食店</p>
<p style="text-align:right;font-size:13px;color:#6b7280;margin:0 0 12px;">デュボワカスバール</p>
<p style="margin:0 0 10px;">　私は子どものときから旅行が大好きです。日本でもいろいろなところへ旅行に行きました。日本では、違う町に行っても、ファミレスや定食屋、ファストフード店など、同じような飲食店が多いと感じます。日本各地にはおいしい食べ物がたくさんあるのだから、そこにしかない飲食店に行くほうがいいと思っていました。しかし、その土地にしかない店で食事を<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">19</span>。</p>
<p style="margin:0 0 10px;">　旅行先で、行ったことがない店に行くのは楽しいです。<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">20</span>、旅行を続けていると、途中で疲れてきます。疲れているとき、慣れない店に行くのは少し大変です。そんなとき、家の近くにもあるファミレスや定食屋が旅行先にもあるのはいいことだと思うようになりました。メニューも注文方法も<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">21</span>。私は旅行中に疲れたとき、近所にもあるレストランに入るようになりました。</p>
<p style="margin:0;">　どこにでもある同じような店に行くことは、旅行先だけでできる特別な経験ではありませんが、安心感があります。<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">22</span>の、今まで知らなかったいいところを見つけることができました。</p>
</div>`

const PASSAGE_R4_1 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">なたかしさんの家のテーブルの上に、このメモがある。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0 0 4px;">たかしへ</p>
<p style="margin:0 0 10px;">　急な用事で、ちょっとおじいちゃんの所へ行かなければならなくなりました。7時までには帰れると思うけど、おなかがすいて待てなかったら、昨日のカレーの残りを温めて食べてください。</p>
<p style="margin:0 0 10px;">　それから、洗濯物が干したままになっているから、取り込んでおいてね。時間があったら、たたんでおいてください。</p>
<p style="margin:0;">おいしいケーキでも買って帰るね。</p>
<p style="text-align:right;margin:8px 0 0;">母</p>
</div>`

const PASSAGE_R4_2 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">これは、あるホテルから山田さんに届いたメールである。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 3px;">あて先:syamada@232mail.com</p>
<p style="margin:0 0 3px;">件名:東京ホテル料金割引のご案内</p>
<p style="margin:0 0 10px;">送信日時:2月1日　16:20</p>
<p style="margin:0 0 8px;">山田真二様</p>
<p style="margin:0 0 8px;">　いつもご利用ありがとうございます。</p>
<p style="margin:0 0 8px;">　現在、東京ホテルでは、インターネット予約割引サービスを行っております。インターネットで予約され、2月28日までにお泊まりの方は、1泊の料金を10%割引し、ご朝食を無料にいたします。</p>
<p style="margin:0 0 8px;">　この割引をご利用になれるお部屋は一日10室だけですので、お早めにご予約ください。</p>
<p style="margin:0 0 8px;">　なお、このサービスは、電話、ファックスでご予約の場合はご利用できません。ご予約を心よりお待ちしております。</p>
<p style="text-align:right;margin:0;">東京ホテルお客様サービス係</p>
</div>`

const PASSAGE_R4_3 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0;">　駅前の交差点の信号は赤になるのが早く、少し遅れると、途中から走って渡らなければならないことも多かった。しかし、一か月ぐらい前からは走らなくても時間内に渡れるようになった。それで、歩くのが速くなったと思って喜んでいたのだが、今朝の新聞を読んで本当の理由がわかった。あの歩行者用信号は時間内に渡れない人が多かったので、警察が青の時間を少し長くしたのだそうだ。それを知って、ちょっとがっかりしてしまった。</p>
</div>`

const PASSAGE_R4_4 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">これは、ある雑誌の記事である。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0 0 10px;">　あるアンケートで、朝、歯を磨く人3,000人に、磨くのは「食前」「食後」「食前と食後」のどれかを聞いた。</p>
<p style="margin:0 0 10px;">　性別でみると、男性も女性も「食後」に磨く人が最も多く（男性64%、女性72%）、次は、男性が「食前」で、女性が「食前と食後」だった。</p>
<p style="margin:0;">　年齢でみても、各年齢で一番多いのはやはり「食後」だった。しかし、その割合は、年齢が高くなるにしたがって「食後」が減り、「食前」が増えていく。なるほど、うちでは私と両親は食後に、祖父は食前に磨いている。</p>
</div>`

const PASSAGE_R5_1 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0 0 10px;">　最近、近所の花屋が閉店した。30年以上も「町の花屋さん」として愛されてきた店だ。この店がオープンしたのは、わたしがまだ小学校に入る前だった。わたしにとって、<u>①店の思い出はそのまま子どものころの思い出と重なる</u>。家族の誕生日や家にお客さんが来る時などには、母といっしょにこの店で花を買っていた。</p>
<p style="margin:0 0 10px;">　小学校を卒業する時には、こんなことがあった。クラス全員でお金を出し合い、担任の先生に花束をおくることになった。「お礼の気持ちを表すために、見たこともないほど大きいのをおくろう」とわたしたちは話し合った。しかし、小学生のこづかいの中から集まったお金は少しだけだった。それで、<u>②わたしたちはどきどきしながら</u>、「大好きな先生にあげるから、できるだけ大きい花束を作ってください」とお願いした。おじさんはいやな顔もしないで、特別大きなバラの花束を作ってくれた。</p>
<p style="margin:0;">　30年以上もきれいな花束を作り続け、あたたかい思い出を作ってくれたおじさんに、「ありがとう、お疲れ様でした」と言いたい。</p>
</div>`

const PASSAGE_R5_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0 0 10px;">　あなたはアイスクリームが好きですか。甘くて冷たいアイスクリームは暑い夏に食べると、体が涼しくなるし、寒い冬に暖かい部屋で食べるのも、おいしいものです。今ではアイスクリームは一年中いつでも食べられますが、実は、<u>①面白いのは</u>、夏と冬ではよく売れるアイスの種類が違うことです。夏にはレモン味のシャーベットなどが、冬にはチョコレート味などの濃い味のものがよく売れるそうです。</p>
<p style="margin:0 0 10px;">　アイスクリームは150年くらい前から食べられるようになったのですが、実は、日本で「氷」を楽しむ習慣は10世紀には始まっていたようです。</p>
<p style="margin:0 0 10px;">　そのころは、冬に作った氷を、「氷室」と呼ばれる特別な部屋に運んで、とけないようにしておきました。夏になると、そこから大きな氷を取り出して町まで運びます。町までは遠く、運ぶ間に少しずつとけて小さくなりますから、<u>②氷はとても大事なものでした</u>。そのころは氷をけずって、さとう水をかけて食べていました。今とは違い、<u>③夏の氷は特別なごちそうだったのでしょう</u>。</p>
</div>`

const PASSAGE_R6 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0 0 10px;">　10年近く前、<u>①印象的なテレビのコマーシャル（CM）</u>があった。ある洗濯洗剤「X」のCMなのだが、洗ったシーツの香りを女性が楽しんでいるだけなのだ。洗濯洗剤を使う目的は汚れを落とすことなのに、そのCMでは、香りのことばかり言っていて、汚れをよく落とすことは全く言っていなかった。この洗濯洗剤を作っている会社は、どうしてこんな変なCMにしたのだろうかと思ったが、最近ある本を読んで、その理由がわかった。</p>
<p style="margin:0 0 10px;">　その本には、次のようなことが書かれていた。この会社には昔から汚れをよく落とす洗濯洗剤「A」という人気商品があったが、会社の売り上げ（注）をもっと伸ばすために、新しいタイプの洗濯洗剤を作ることにした。それが「X」だった。「X」は、「A」と値段はあまり変わらないが、汚れを落とすだけでなく、香りも楽しめるのが特長だった。</p>
<p style="margin:0 0 10px;">　ところが、最初、「X」は期待していたようには売れなかった。初めのころに作ったCMでは、消費者に「X」の特長がうまく伝わらなかったのだ。そこで、この会社はそれまでのCMを大きく変えて、「この商品を使えば、いい香りが楽しめて、とてもいい気分で洗濯ができる」というメッセージを強く伝えることにした。そして新しく作られたのが、<u>②私が見たCM</u>だったのだ。</p>
<p style="margin:0 0 10px;">　そのCMによって、「X」の特長が多くの消費者に伝わったようで、それ以降、「X」もよく売れるようになったそうだ。私がちょっと変だと感じたあのCMは、実は十分に宣伝効果があったのだ。</p>
<p style="margin:0;font-size:12px;color:#6b7280;">（注）売り上げをもっと伸ばす：商品を売って会社や店などに入るお金をもっと増やす。</p>
</div>`

const PASSAGE_R7 =
  `<div style="border:1.5px solid #374151;border-radius:8px;overflow:hidden;font-size:13px;">
<div style="background:#374151;color:#fff;padding:8px 14px;text-align:center;font-weight:700;font-size:15px;">さくらまつりの協力者募集</div>
<div style="padding:12px 16px;font-size:13px;line-height:1.8;">
<p style="margin:0 0 8px;">春とともにやって来る「山中さくらまつり」。毎年たくさんの人が集まるこの「さくらまつり」に、協力者として参加してみませんか。</p>
<p style="margin:0 0 8px;text-align:center;">——山中さくらまつり——<br>日時：4月4日(土)午前10時〜午後8時　4月5日(日)午前10時〜午後7時</p>
<table style="width:100%;border-collapse:collapse;font-size:12px;margin:6px 0;">
<tr><th style="border:1px solid #9ca3af;padding:5px 8px;background:#f3f4f6;text-align:left;white-space:nowrap;">係の名前と仕事内容</th><td style="border:1px solid #9ca3af;padding:5px 8px;">1.案内係：会場の案内と各プログラムに参加する人を集めます。<br>2.会場係：場内の整備・見回りを行います。</td></tr>
<tr><th style="border:1px solid #9ca3af;padding:5px 8px;background:#f3f4f6;text-align:left;">場所（会場）</th><td style="border:1px solid #9ca3af;padding:5px 8px;">山中公園</td></tr>
<tr><th style="border:1px solid #9ca3af;padding:5px 8px;background:#f3f4f6;text-align:left;">時間</th><td style="border:1px solid #9ca3af;padding:5px 8px;">①4月4日(土)午前9時〜午後1時<br>②　〃　午後1時〜午後6時<br>③　〃　午後6時〜午後9時<br>④4月5日(日)午前9時〜午後1時<br>⑤　〃　午後1時〜午後6時<br>⑥　〃　午後6時〜午後8時</td></tr>
<tr><th style="border:1px solid #9ca3af;padding:5px 8px;background:#f3f4f6;text-align:left;">応募資格</th><td style="border:1px solid #9ca3af;padding:5px 8px;">市内に住んでいる16歳以上で、2回以上参加が可能な方。<br><small>（③と⑥は20歳以上の方だけです）</small></td></tr>
<tr><th style="border:1px solid #9ca3af;padding:5px 8px;background:#f3f4f6;text-align:left;">募集人数</th><td style="border:1px solid #9ca3af;padding:5px 8px;">①〜⑥につき：案内係各10名・会場係各10名</td></tr>
<tr><th style="border:1px solid #9ca3af;padding:5px 8px;background:#f3f4f6;text-align:left;">応募しめ切り</th><td style="border:1px solid #9ca3af;padding:5px 8px;">3月27日(金)午後5時（先着順）</td></tr>
<tr><th style="border:1px solid #9ca3af;padding:5px 8px;background:#f3f4f6;text-align:left;">申し込み方法</th><td style="border:1px solid #9ca3af;padding:5px 8px;">別紙の応募用紙に必要なことを記入して、ファックスまたは郵送。<br>・ファックス:0038-26-1870（山中市役所市民課）<br>・郵送:〒000-8787 山中市本町1-1-1 山中市役所市民課</td></tr>
<tr><th style="border:1px solid #9ca3af;padding:5px 8px;background:#f3f4f6;text-align:left;">問い合わせ先</th><td style="border:1px solid #9ca3af;padding:5px 8px;">山中市役所市民課（広田）電話:0033-26-1877</td></tr>
</table>
</div>
</div>`

// ─── Questions ───────────────────────────────────────────────────────────────

const _RAW: Omit<StaticQuestion, "explanation" | "script">[] = [
  // ── 問題1 漢字の読み方 (q1, 8問) ────────────────────────────────────────
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "裏",       sentence: "このビルの[裏]に小さなレストランがあります。",        options: ["そば","よこ","かげ","うら"],                 correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "呼吸",     sentence: "それではゆっくり[呼吸]してください。",               options: ["こきゅ","こきゅう","よきゅう","よきゅ"],      correctIndex: 1 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "悲しそう", sentence: "あの少年の[悲しそう]な顔が忘れられない。",            options: ["やさしそう","かなしそう","きびしそう","さびしそう"], correctIndex: 1 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "駐車",     sentence: "このあたりに[駐車]しましょう。",                     options: ["しゅしゃ","しゅうしゃ","ちゅしゃ","ちゅうしゃ"], correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "逃げて",   sentence: "もう[逃げて]しまったようだ。",                      options: ["にげて","なげて","こげて","あげて"],           correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "努力",     sentence: "[努力]することは大切だと思います。",                options: ["どうりょく","とうりょく","どりょく","とりょく"], correctIndex: 2 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "過去",     sentence: "それは[過去]のことです。",                         options: ["かこ","かこう","かきよ","かきよう"],           correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "動作",     sentence: "彼は話し方も[動作]もゆっくりしている。",              options: ["とうさ","とうさく","どうさ","どうさく"],        correctIndex: 2 },

  // ── 問題2 漢字の書き方 (q2, 6問) ────────────────────────────────────────
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "とまり",   sentence: "昨日、友達が家に[とまり]にきた。",                  options: ["停まり","留まり","泊まり","止まり"],           correctIndex: 2 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "きそく",   sentence: "書類にはこの学校の[きそく]が書かれていた。",          options: ["現販","規則","規販","現則"],                   correctIndex: 1 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "あたたかい", sentence: "ここは[あたたかい]ですね。",                      options: ["明るい","暑い","暖かい","熱い"],               correctIndex: 2 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "やっきょく", sentence: "[やっきょく]がなかなか見つかりません。",            options: ["薬局","楽曲","楽局","楽曲"],                   correctIndex: 0 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "かさねて",  sentence: "お皿は[かさねて]その棚にしまってください。",          options: ["整れて","列れて","階れて","重ねて"],           correctIndex: 3 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "でんごん",  sentence: "机の上に[でんごん]のメモがあった。",                options: ["伝記","伝言","転記","転動"],                   correctIndex: 1 },

  // ── 問題3 文脈規定 (q3, 11問) ───────────────────────────────────────────
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "15", sentence: "マラソン大会は台風で（　）されることになりました。",    options: ["遅刻","連体","延期","早退"],                   correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "16", sentence: "毎日水をやらないと、花が（　）しまう。",               options: ["とけて","さめて","やせて","かれて"],           correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "17", sentence: "この犬は、子犬のころから（　）されているので、人が大勢いてもおとなしい。", options: ["工夫","用意","訓練","計画"], correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "18", sentence: "明日は7時に出かけるので、目覚まし時計を6時に（　）した。", options: ["スタート","セット","ストップ","マーク"],        correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "19", sentence: "忙しいのに、こんなに待たされて時間が（　）。",           options: ["だらしない","しょうがない","なさけない","もったいない"], correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "20", sentence: "友人の家で食べたケーキがおいしかったので、（　）と作り方を教えてもらった。", options: ["資源","材料","部品","原因"], correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "21", sentence: "このソファーの愛用（　）にアンケートをした。",            options: ["生","人","者","員"],                          correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "22", sentence: "工事のせいで道路が（　）していて、車がなかなか前に進まない。", options: ["渋滞","故障","増加","集合"],                   correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "23", sentence: "くすりの（　）が出て、少し具合がよくなりました。",       options: ["成績","効果","応援","価値"],                   correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "24", sentence: "彼は日本にまだ一年しか住んでいないのに、日本語が（　）だ。", options: ["さらさら","ばらばら","ふらふら","ベラベラ"],    correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "25", sentence: "この学校で一生懸命に勉強して、知識や技術を（　）思っている。", options: ["身につけたい","気に入りたい","押し込みたい","取りあげたい"], correctIndex: 0 },

  // ── 問題4 言い換え類義 (q4, 5問) ───────────────────────────────────────
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "26", sentence: "今日の会議では[さまざまな]意見が出た。",               options: ["とくべつな","すばらしい","いろいろな","あたらしい"], correctIndex: 2 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "27", sentence: "できるだけ早めに[報告して]ください。",                  options: ["頼んで","知らせて","尋ねて","探して"],           correctIndex: 1 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "28", sentence: "山田さんは[絶対に]来ると思います。",                   options: ["あとで","すぐに","たぶん","かならず"],           correctIndex: 3 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "29", sentence: "この話は[おしまい]です。",                            options: ["おわり","すごい","はじめて","おもしろい"],        correctIndex: 0 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "30", sentence: "先週、学校を[サボって]しまった。",                     options: ["病気になって学校をやめてしまった。","病気になって学校を休んでしまった。","あそびたくて学校をやめてしまった。","あそびたくて学校を休んでしまった。"], correctIndex: 3 },

  // ── 問題5 用法 (q5, 5問) ────────────────────────────────────────────────
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "オーバー", sentence: "問題5: [オーバー]の使い方として最もよいものを選びなさい。", options: ["飛行機の出発時間がオーバーになった。","安いのがなくて、1万円もオーバーしてしまった。","考えすぎて、頭がオーバーになった。","料理がオーバーして、もう食べられない。"], correctIndex: 1 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "欠点",    sentence: "問題5: [欠点]の使い方として最もよいものを選びなさい。",   options: ["ここは景色のいい場所だが駅から遠いという欠点がある。","栄養に欠点が出ないように、食事のメニューを考えている。","カードレールにぶつけて、車に欠点がついてしまった。","メールを送る前に、メールアドレスに欠点がないか確認した。"], correctIndex: 0 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "親しい",  sentence: "問題5: [親しい]の使い方として最もよいものを選びなさい。", options: ["私は学生のころ、数学より理科の方が親しかった。","彼女はとても親しい道を教えてくれた。","久しぶりに友達と会って、親しかった。","引っ越してきたばかりで、近くにまだ親しい人はいない。"], correctIndex: 3 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "詰める",  sentence: "問題5: [詰める]の使い方として最もよいものを選びなさい。", options: ["明日帰国するので、かばんに洋服やお土産を詰めた。","テーブルに食器を2枚詰めて、朝食の準備をした。","忘れないように、大切なことをノートに詰めた。","ジャケットのポケットに手を詰めて、切符を出した。"], correctIndex: 0 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "支給",    sentence: "問題5: [支給]の使い方として最もよいものを選びなさい。",   options: ["母の誕生日に、何かプレゼントを支給しようと思う。","これから先生にレポートを支給しに行くつもりだ。","この会社は、家から会社までの交通費を支給してくれる。","買い物のとき、お釣りを支給してもらいのを忘れた。"], correctIndex: 2 },

  // ── 文法 問題1 文の文法（空欄補充）(q6, 13問) ──────────────────────────
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "1", sentence: "両親に買ってもらった着物（　）大学の卒業式に出席した。",    options: ["を","が","で","に"],                           correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "2", sentence: "本を読んでいたら、（　）5時間も経ってしまった。",             options: ["そろそろ","だんだん","ようやく","いつのまにか"],  correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "3", sentence: "日わたしに（　）、今一番大切なものは、飼っている犬です。",   options: ["対して","比べて","おいて","とって"],             correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "4", sentence: "A「部長の田中とお会いになるのは今日が初めてですか。」\nB「はい。山下課長（　）お目にかかったことがございませんので。」", options: ["にだけ","にしか","でしか","でだけ"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "5", sentence: "この図書館は、入り口の近くに返す本を入れるためのブックポストがあり、図書館が閉まっている（　）、本を返すことができる。", options: ["ときでも","まで","間だからが","ところなら"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "6", sentence: "A「今夜は晴れているから星がよく見えるよ。」\nB「わあ、本当だ。（　）きれいなんだろう。」",       options: ["ときでも","なんか","なんて","なんでも"],          correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "7", sentence: "展覧会に知り合いの絵がかざられるので、わたしも見に（　）と思う。", options: ["行こうか","行かないか","行くのか","行ったか"],    correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "8", sentence: "夏は食べ物が悪く（　）ので、注意してください。",              options: ["なりにくい","しやすい","しにくい","なりやすい"],  correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "9", sentence: "乗っていた電車が急に止まって、隣に立っていた人に新しい白い靴を（　）。", options: ["踏んでしまった","踏んでおいた","踏まれてしまった","踏ませておいた"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "10", sentence: "明日からテニスの国際大会が始まる。参加する8名は皆、過去に国際大会での優勝経験があり、今回の大会は誰が（　）。", options: ["優勝しても不思議ではない。","優勝したらいい。","優勝するに違いない","優勝するのではないだろうか"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "11", sentence: "（駅の改札口で）\n妻「あ、もう10時だよ。急がないと新幹線が出発（　）。」\n夫「本当だ。急ごう。」", options: ["してる","しとく","しちゃう","しなきゃなる"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "12", sentence: "山田「あ、課長。昨日はどうもごちそうさまでした。おいしい物をたくさん（　）。」\n課長「それはよかった。またうちで食事しよう。」", options: ["いただいていました。","いただきました","めしあがっていました","めしあがりました"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "13", sentence: "妻「明日食べに行くラーメン屋、11時半ごろから込むらしいよ。」\n夫「じゃあ、11時過ぎに店に着けるように早めに家を（　）ね。」\n妻「うん、そうだね。早めに出よう。」", options: ["出るつもりかもしれない。","出たほうがいいかもしれない。","出てはいけなそうだ","出なくてもよさそうだ"], correctIndex: 1 },

  // ── 文法 問題2 文の文法★（並べ替え）(q7, 5問) ─────────────────────────
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "14", sentence: "先生「みなさんは、一度　＿＿＿　[★]　＿＿＿　＿＿＿　と思う人はいますか。」", options: ["会ってみたい","いい","で","から"], correctIndex: 1 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "15", sentence: "A「パーティーの料理はどうでしたか。」\nB「おいしかったです。＿＿＿　＿＿＿　[★]　＿＿＿　わかりませんが、お刺身がおいしかったです。」", options: ["という","何","か","魚"], correctIndex: 3 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "16", sentence: "A「京都旅行の写真を早く送って。」\nB「送る　＿＿＿　＿＿＿　[★]　＿＿＿　から、もう少し待って。」", options: ["選んでいる","写真を","今","ところだ"], correctIndex: 0 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "17", sentence: "私は料理が　＿＿＿　＿＿＿　[★]　＿＿＿　ほとんどない。", options: ["苦手","料理は","作れる","レシピを見ずに"], correctIndex: 2 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "18", sentence: "この島は、空から　＿＿＿　＿＿＿　[★]　＿＿＿　「耳島」と呼ばれています。", options: ["形","にみえることから","人の耳のような","見ると"], correctIndex: 0 },

  // ── 文法 問題3 文章の文法 (q8, 4問) ────────────────────────────────────
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "19", context: PASSAGE_G3, sentence: "その土地にしかない店で食事を（19）。", options: ["するだろうと思いました","させるだろうと思いました","するようにしていました","させるようにしていました"], correctIndex: 2 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "20", context: PASSAGE_G3, sentence: "（20）、旅行を続けていると、途中で疲れてきます。", options: ["ただ","そのうえ","つまり","やはり"], correctIndex: 0 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "21", context: PASSAGE_G3, sentence: "メニューも注文方法も（21）。", options: ["わかってほしいのです","わかっているからです","わかりそうにありません","分からなければなりません"], correctIndex: 1 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "22", context: PASSAGE_G3, sentence: "（22）の、今まで知らなかったいいところを見つけることができました。", options: ["店","この店","ある店","そういう店"], correctIndex: 3 },

  // ── 読解 問題4 短文読解 (q9, 4問) ──────────────────────────────────────
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "23", context: PASSAGE_R4_1, sentence: "このメモを読んで、たかしさんがしなければならないことは何か。", options: ["おじいちゃんの所へ行く。","昨日のカレーの残りを温めて食べる。","洗濯物を取り込む。","ケーキを買って帰る。"], correctIndex: 2 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "24", context: PASSAGE_R4_2, sentence: "このメールから、東京ホテルのサービスについて、どんなことがわかるか。", options: ["インターネットで予約すると、1料金と朝食が10%割引になる場合がある。","インターネットで2月中に予約すると、朝食が10%割引になる場合がある。","インターネットで予約し、2月中に泊まると、1泊料金が10%割引され、朝食が無料になる場合がある。","インターネット、電話、ファックスのどれで予約しても、2月中は朝食だけ無料になる場合がある。"], correctIndex: 2 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "25", context: PASSAGE_R4_3, sentence: "がっかりしてしまったのはなぜか。", options: ["自分では歩くのが速くなったと思っていたが、実はそうではなかったから。","せっかく走って渡れるようになったのに、その必要がなくなったから。","自分は時間内に歩いて渡れるのに、歩行者用信号の青の時間が長くなったから。","警察が、歩行者用信号の青の時間を少しか長くしてくれなかったから。"], correctIndex: 0 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "26", context: PASSAGE_R4_4, sentence: "朝の歯磨きについて、この文章からわかることは何か。", options: ["男性は「食前」に磨く人が「食後」に磨く人より多い。","女性は「食前と食後」に磨く人が「食前」に、磨く人より多い。","性別に関係なく、「食前」に歯を磨いている人が60%以上いる。","年齢が高くなると、「食後」に磨く人より「食前」に磨く人が多くなる。"], correctIndex: 1 },

  // ── 読解 問題5 中文読解 (q10, 6問) ─────────────────────────────────────
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "27", context: PASSAGE_R5_1, sentence: "①店の思い出はそのまま子どものころの思い出と重なるとあるが、それはどんな思い出か。", options: ["わたしが小学校に入学した時に、この花屋が開店したこと。","小学校を卒業する時に、先生といっしょにこの花屋で花を買ったこと。","特別なことがある時には、よくこの店で花を買っていたこと。","おじさんが大好きだったので、よくこの店で花を買っていたこと。"], correctIndex: 2 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "28", context: PASSAGE_R5_1, sentence: "②わたしたちはどきどきしながらとあるが、どうしてどきどきしたのか。", options: ["もうすぐ閉店する花屋のおじさんに、無理なお願いをするから。","いやな顔をしているおじさんに、無理なお願いをするから。","お店に花があまりないのに、おじさんに無理なお願いをするから。","お金が少ししかないのに、おじさんに無理なお願いをするから。"], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "29", context: PASSAGE_R5_1, sentence: "この文章を書いた人が一番伝えたいことは何か。", options: ["小学校時代にとてもお世話になった先生へのお礼の気持ち。","よい思い出を作ってくれた花屋のおじさんへの感謝の気持ち","大好きだった花屋さんが閉店するので、さびしいという気持ち。","近所の花屋さんが閉店したので、とても不便だという気持ち。"], correctIndex: 1 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "30", context: PASSAGE_R5_2, sentence: "①面白いのはとあるが、筆者はどこにその原因があると考えているか。", options: ["暑い夏に冷たいものを食べると、体が涼しく感じるから。","寒い冬に冷たいものを食べると、おいしく感じられるから。","季節に関係なく一年中アイスクリームが売られているから。","よく売れるアイスクリームの種類は季節によって違うから。"], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "31", context: PASSAGE_R5_2, sentence: "②氷はとても大事なものでしたとあるが、それはどうしてか。", options: ["冬に特別な部屋で作った氷だったし、とけないように運ぶのも大変だったから。","冬に作った氷は特別な味がしたし、時間がたつととけなくなってしまうから。","夏に作った氷はとてもめずらしかったし、暑さですぐとけてしまうものだったから。","夏の氷はめずらしかったし、町まで運ぶ途中でとけて小さくなってしまうから。"], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "32", context: PASSAGE_R5_2, sentence: "③夏の氷は特別なごちそうだったのでしょうとあるが、ここで言いたいことはどのようなことか。", options: ["氷は昔は冬の食べ物だったので、夏に食べることはとてもめずらしいことだった。","まだアイスクリームを買うことが難しかったので、みんな氷がまんしていた。","暑い夏に氷を食べて涼しさを感じることは、日常的にできることではなかった。","涼しくなるように氷を食べることは、そのころ人々がよくやっていたことだった。"], correctIndex: 2 },

  // ── 読解 問題6 長文読解 (q11, 4問) ─────────────────────────────────────
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "33", context: PASSAGE_R6, sentence: "①印象的なテレビのコマーシャル（CM）とあるが、どのような点が印象的だったのか。", options: ["洗濯洗剤のCMに女性が登場している点。","洗濯洗剤なのに、いい香りがついている点。","洗濯洗剤が汚れをよく落とすことを強く言っている点。","洗濯洗剤なのに、汚れを落とすことについて全く言っていない点。"], correctIndex: 3 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "34", context: PASSAGE_R6, sentence: "洗濯洗剤「X」を作った会社が伝えたかった、「X」の特長は何か。", options: ["シーツを洗うための洗濯洗剤であること。","洗濯洗剤「A」より値段がとても安いこと。","どんな洗濯洗剤よりも汚れをよく落とすこと。","香りを楽しめる洗濯洗剤であること。"], correctIndex: 3 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "35", context: PASSAGE_R6, sentence: "洗濯洗剤「X」は、どのように売れたか。", options: ["初めはあまり売れなかったが、よく売れるようになった。","初めはよく売れたが、あまり売れなくなった。","初めからずっとよく売れていた。","初めからずっとあまり売れなかった。"], correctIndex: 0 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "36", context: PASSAGE_R6, sentence: "②私が見たCMについて、「私」は今、どのようなことを考えているか。", options: ["「私」には意味がわからなかったし、多くの消費者にも宣伝効果がなかったのだ。","「私」は変なCMだと思っていたが、多くの消費者には宣伝効果があったのだ。","「私」は効果的なCMだと思っていたし、多くの消費者にも宣伝効果があったのだ。","「私」には印象的だったが、多くの消費者には宣伝効果がなかったのだ。"], correctIndex: 1 },

  // ── 読解 問題7 情報検索 (q12, 2問) ─────────────────────────────────────
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "37", context: PASSAGE_R7, sentence: "太郎君は山中市に住む17歳の高校生で、さくらまつりの協力者になりたいと思っている。土曜日はいつも朝から夕方までクラブ活動がある。太郎君が応募できるのはどれか。", options: ["①と②","②と③","④と⑤","⑤と⑥"], correctIndex: 2 },
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "38", context: PASSAGE_R7, sentence: "さくらまつりの協力者になるためには、どうすればよいか。", options: ["3月27日までになるべく早く市役所に郵便かファックスで申し込む。","3月27日までの平日の午前9時から午後5時の間に電話で申し込む。","できるだけ早く山中市役所の市民課広田さんにEメールで申し込む。","市役所ホームページの応募用紙を使ってインターネットで申し込む。"], correctIndex: 0 },

  // ── 聴解 問題1 (lq1, 6問) ───────────────────────────────────────────────
  { groupId: "lq1", sectionId: "listening", type: "listening_text", display: "1ばん", options: ["社員に聞けてもらう","あんしょうばんごうをおす","人さし指できかいにふれる","カードをきかいにいれる"], correctIndex: 3 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text", display: "2ばん", options: ["キャベツとぶた肉","キャベツとたまご","ノートと白菜","ノートとたまご"], correctIndex: 3 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text", display: "3ばん", options: ["本だなを運ぶ","本だなをえらぶ","本だなをくみたてる","本だなにペンキをぬる"], correctIndex: 0 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text", display: "4ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text", display: "5ばん", options: ["しりょうを作りなおす。","おきゃくさんの所に行く。","しゅっちょうのほうこくを出す","もりかちょうにれんらくする"], correctIndex: 0 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text", display: "6ばん", options: ["200円分の切手","自分の住所を書いたふうとう","もうしこみの用紙","めんきょしょうのコピー"], correctIndex: 1 },

  // ── 聴解 問題2 (lq2, 6問) ───────────────────────────────────────────────
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "1ばん", options: ["食事に行く。","本をかいに行く。","どうぶつえんに行く","サッカーを見に行く"], correctIndex: 2 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "2ばん", options: ["起きるのがおそかったから","乗る電車をまちがえたから","ほんとうは映画が見たくなかったから","やくそくをわすれていたからだが"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "3ばん", options: ["町のことを知りたかったから","好きな歌手に会いたかったから","しせいをよくしたかったから","きせつをかんじたかったから"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "4ばん", options: ["おしゃれな店がふえて便利だ","わかい人がたくさん来るのでいやだ","古い店がなくなってさびしい。","まちに元気が出てきてよい"], correctIndex: 3 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "5ばん", options: ["世話が楽だから","色がきれいだから","手に乗るから","かわいい声でなくから"], correctIndex: 0 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "6ばん", options: ["子どももさんかできて楽しめる","さんかする外国人がふえている","しみんがこうりゅうする機会になっている","かんこうによいえいきょうをあたえている"], correctIndex: 2 },

  // ── 聴解 問題3 （no printed options）(lq3, 3問) ─────────────────────────
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3","4"], correctIndex: 0 },

  // ── 聴解 問題4 えを見ながら (lq4, 4問) ─────────────────────────────────
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3"], correctIndex: 2 },

  // ── 聴解 問題5 （no printed options）(lq5, 9問) ─────────────────────────
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "1ばん",  options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "2ばん",  options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "3ばん",  options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "4ばん",  options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "5ばん",  options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "6ばん",  options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "7ばん",  options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "8ばん",  options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "9ばん",  options: ["1","2","3"], correctIndex: 1 },
]

const explanations = _explanations as Record<string, string>

export const N3_7_2021_QUESTIONS: StaticQuestion[] = _RAW.map(q => {
  const key = `${q.groupId}:${q.display}`
  return { ...q, explanation: explanations[key] ?? undefined, script: explanations[`${key}:script`] ?? undefined }
})

export const N3_7_2021_COUNTS = { vocab: 35, grammar: 38, listening: 28, total: 101 }
