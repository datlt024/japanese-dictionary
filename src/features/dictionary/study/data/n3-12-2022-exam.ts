// 2022年12月 日本語能力試験 N3 — 言語知識（文字・語彙・文法）・読解・聴解
// Explanations are stored in ./explanations/n3-12-2022.json and merged at export time.

import _explanations from "./explanations/n3-12-2022.json"

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

// ─── Passages ────────────────────────────────────────────────────────────────

const PASSAGE_G3 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">以下は、留学生の作文である。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="text-align:center;font-weight:700;margin:0 0 4px;">京都旅行</p>
<p style="text-align:right;font-size:13px;color:#6b7280;margin:0 0 12px;">グエン　テイ　ラン</p>
<p style="margin:0 0 10px;">　私は夏休みに京都を旅行しました。日本で旅行するとき、普段はホテルに泊まりますが、京都では温泉のある旅館に泊まりました。畳の部屋に入るのは初めてでした。<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">19</span>にも初めて入りました。夕食もおいしかったです。</p>
<p style="margin:0 0 10px;">　次の日、部屋で出発の準備をしていたら、腕時計<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">20</span>ないことに気がつきました。かばんの中を探しても見つからなくて、腕時計が落ちていなかったかフロントで聞きましたが、ありませんでした。母にもらった大切な時計だったので、私はもう一度、部屋に戻って探すことにしました。フロントの人も旅館の中を探してみると言ってくれました。</p>
<p style="margin:0 0 10px;">　やはり部屋にはなく、泣きそうになっていたとき、フロントの人が私の時計を見つけて、部屋に持ってきてくれました。温泉の入り口のところに<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">21</span>。朝、温泉に入ったときに、落としてしまったようです。時計が見つかって、旅館の人たちもとても喜んでくれました。</p>
<p style="margin:0;">　京都旅行の一番の思い出は、時計が見つかったことを一緒に喜んでくれた旅館の人たちの笑顔です。旅行では観光地や食べ物だけではなく、人の優しさもいい思い出に<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">22</span>。</p>
</div>`

const PASSAGE_R4_1 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">（会社で）コピー機の上に、この紙が置いてある。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="font-weight:700;margin:0 0 10px;">営業課の皆さんへ</p>
<p style="margin:0 0 8px;">　営業課のコピー機は今、故障していて使えません。修理を頼んでいますが、明日の午後まで来られないそうです。急ぎでないコピーは、明日まで待ってください。</p>
<p style="margin:0;">　今日中にコピーしなければならない書類がある場合は、会計課のコピー機を使用してください。50枚以上コピーをする場合は、先に会計課に連絡をしておく必要がありますので、コピーをする前に中島に知らせてください。</p>
</div>`

const PASSAGE_R4_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">　６歳の娘がボールを上手に投げられるようになりたいと言う。私は娘の投げ方の悪い点をいろいろと説明して、何回もボールを投げさせているが、娘はなかなかうまくならない。</p>
<p style="margin:0;">　昨日、あるテレビ番組でボール投げについて取り上げていた。番組では、子供に大きさや重さの違うさまざまなボールを投げさせたり、紙飛行機を飛ばさせたりして、ちょうどいい力の入れ方を体で覚えさせていた。娘に必要なのは、これかもしれない。次は、このやり方を娘にやらせてみようと思う。</p>
</div>`

const PASSAGE_R4_3 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">これは、ある店が客の寺坂さんに書いたメールである。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">寺坂ゆき様</p>
<p style="margin:0 0 8px;">　いつもご利用いただき、ありがとうございます。</p>
<p style="margin:0 0 8px;">　２月４日にいただいたご注文についてのご連絡です。寺坂様がホームページからご注文になった革製財布（茶色）ですが、直前の電話注文で品切れになっておりました。大変申し訳ございません。お届けできるのは３月上旬になってしまいますが、いかがいたしましょうか。キャンセルもお受けいたしますので、ご希望をお聞かせください。</p>
<p style="margin:0 0 8px;">　なお、同じ商品の違う色でしたら、すぐにお送りできます。あわせてご検討ください。</p>
<p style="text-align:right;margin:0 0 2px;">財布専門店タキグチ　広田</p>
<p style="text-align:right;font-size:12px;color:#6b7280;margin:0;">t.hirota@saifu-takiguchi.yuukibui.co.jp</p>
</div>`

const PASSAGE_R4_4 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">　私の家には、履かなくなった古い靴がたくさんある。捨てようかと思っていたとき、ある靴屋のちらしを見た。いらない靴を店に持っていけば、その店で使える割引券と交換してくれるそうだ。回収した靴を燃やす<sup>（注）</sup>ときに出る熱が、電気を作るためのエネルギーに利用できて、環境にいいとも書かれていた。私一人が持っていっても、環境にそんなに大きい影響はないと思うが、新しい靴が安く買えるなら、古い靴は捨てないで店に持っていこうと思った。</p>
<p style="font-size:12px;color:#6b7280;margin:0;">（注）燃やす：焼く</p>
</div>`

const PASSAGE_R5_1 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　先日、押し入れから父の古いラジオが出てきた。スイッチを入れてみたら、<u>①懐かしい声</u>が流れてきた。高校のころ、大好きだったラジオの音楽番組のアナウンサーだった。私はつい番組を聞き続けてしまった。</p>
<p style="margin:0 0 10px;">　あのころ私はよくラジオを聞いていた。ラジオのおかげで、勉強をしながらでも、ニュースや最新の音楽などさまざまな情報を知ることができた。今考えると、私にとってラジオはテレビよりも身近で便利なものだった。</p>
<p style="margin:0 0 10px;">　今はラジオを聞く人が減っているそうだ。インターネットなどで、好きなときに知りたいニュースが見られるし、聞きたい音楽も聞けるようになったのだから、当然だ。</p>
<p style="margin:0;">　しかし、考えてみれば、車を運転する人や畑で仕事をする人などは、今でもよくラジオを聞いている。ほかのことをしながらでも、さまざまな情報が手に入るというラジオにしかない良さ、便利さがあるのだ。私も掃除や料理をするようなときには、<u>②また、ラジオを聞こうと思った</u>。</p>
</div>`

const PASSAGE_R5_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">私たち夫婦の夢は、田舎に引っ越して農業を始めることです。</p>
<p style="margin:0 0 10px;">　そこで先日、ある町が東京で開いた<u>①説明会</u>に参加してみました。その町では人口が減ったので、町民を募集するために説明会を開いています。もう100人以上が移り住んでいて、多くの人は楽しく生活しています。しかし、うまくいかなかった例もあるそうです。</p>
<p style="margin:0 0 10px;">　そのような例には<u>②共通点</u>があると思いました。ある人は、田舎の生活にあこがれて引っ越して来ましたが、すぐに退屈な毎日が嫌になったそうです。農業がしたくて来たのにあまりにも大変で、都会に戻ってしまった例もありました。毎月の町内の掃除など、都会では経験したことがなかったことが意外にめんどうくさいと感じる人もいるそうです。説明会では、このような例も知ってから検討してほしいと言っていました。</p>
<p style="margin:0;">　成功例ばかり見ていた私たちは、考えが甘かったようです。でも、夢はあきらめたくないので、よく調べて、計画を立てて、実行できるように頑張りたいと思います。</p>
</div>`

const PASSAGE_R6 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　最近、私は布団に入ってもしばらく眠れなくて、悩んでいる。朝は決まった時間に起きなければならないので、眠る時間が短くなって、昼間に眠くなってしまう。それで、体が疲れるまで運動をすれば、布団に入ってすぐに眠くなるだろうと考えて、寝る１時間前に走ることにした。だが、２週間続けてみても、<u>①全然変わらない</u>。</p>
<p style="margin:0 0 10px;">　そこで、どうやったら眠れるようになるか調べてみた。すると、<u>②体の中心の温度の変化が重要だ</u>ということがわかった。例えば、寝る２、３時間前に軽く走ったり、ぬるめの風呂にゆっくり入ったりするといいそうだ。こうすることで、体が中心まで温まる。すると、体は表面から熱を出そうとする。表面から熱が出ていくと、中心の温度が下がっていく。このようにして、中心の温度が下がる状態を作ると、人は眠りやすくなるのだそうだ。</p>
<p style="margin:0 0 10px;">　注意したほうがいいこととして、こんなことも書いてあった。寝る直前に運動しすぎたり、熱い風呂に入ったりするのは、体は温まるが、頭がはっきりして眠くなくなってしまうので、逆効果らしい。つまり、私のやっていたことは<u>③間違い</u>だったのだ。</p>
<p style="margin:0;">　眠るために頑張っていたが、夜に一人で走るのは少し怖いと思っていたし、実は運動も好きではない。運動以外にいい方法があると知ってうれしくなった。これからは、（　　　）と思う。</p>
</div>`

const PASSAGE_R7 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.8;">
<p style="text-align:center;font-weight:700;font-size:16px;margin:0 0 10px;">秋の日帰りバス旅行のご案内</p>
<table style="width:100%;border-collapse:collapse;margin-bottom:10px;font-size:13px;">
<tr>
<td style="border:1px solid #9ca3af;padding:8px;vertical-align:top;width:50%;">
<p style="font-weight:700;margin:0 0 3px;">①川中市内観光と川中東温泉</p>
<p style="margin:0 0 1px;">料金：平日　7,500円</p>
<p style="margin:0 0 1px;">　　　土・日　8,500円</p>
<p style="margin:0 0 1px;">食事：ついていません</p>
<p style="margin:0;">出発日：10月6日（土）・11月12日（月）</p>
</td>
<td style="border:1px solid #9ca3af;padding:8px;vertical-align:top;width:50%;">
<p style="font-weight:700;margin:0 0 3px;">②大岩チーズ場見学と川中美術館</p>
<p style="margin:0 0 1px;">料金：平日　8,500円</p>
<p style="margin:0 0 1px;">　　　土・日　9,500円</p>
<p style="margin:0 0 1px;">食事：昼食</p>
<p style="margin:0;">出発日：10月30日（火）・11月10日（土）</p>
</td>
</tr>
<tr>
<td style="border:1px solid #9ca3af;padding:8px;vertical-align:top;">
<p style="font-weight:700;margin:0 0 3px;">③北森市立博物館と花丸温泉</p>
<p style="margin:0 0 1px;">料金：平日　11,000円</p>
<p style="margin:0 0 1px;">　　　土・日　12,000円</p>
<p style="margin:0 0 1px;">食事：昼食</p>
<p style="margin:0;">出発日：10月29日（月）・11月11日（日）</p>
</td>
<td style="border:1px solid #9ca3af;padding:8px;vertical-align:top;">
<p style="font-weight:700;margin:0 0 3px;">④空石山ハイキングと空石温泉</p>
<p style="margin:0 0 1px;">料金：平日　10,000円</p>
<p style="margin:0 0 1px;">　　　土・日　11,000円</p>
<p style="margin:0 0 1px;">食事：昼食</p>
<p style="margin:0;">出発日：10月25日（木）・11月3日（土）</p>
</td>
</tr>
</table>
<p style="font-size:12px;margin:0 0 2px;">※料金は大人一人分です。小学生は、大人の半分の料金になります（５歳以下は無料）。</p>
<p style="font-size:12px;margin:0 0 8px;">※料金には入館料などが含まれています。</p>
<p style="font-weight:700;margin:0 0 3px;font-size:13px;">【当日の集合時間と集合場所】</p>
<p style="font-size:13px;margin:0 0 8px;">①〜④すべて、午前８時に西山駅北口にお集まりください。</p>
<p style="font-weight:700;margin:0 0 3px;font-size:13px;">【お申し込み・お支払い】</p>
<p style="font-size:13px;margin:0 0 8px;">お申し込みは、ご出発日の３か月前から10日前まで、インターネット、お電話、窓口で受け付けます。料金は、お申し込み後７日以内に、お支払いください。</p>
<p style="font-weight:700;margin:0 0 3px;font-size:13px;">【キャンセル料】</p>
<p style="font-size:13px;margin:0 0 2px;">お申し込み後のキャンセル料は、出発日の10日前〜8日前までは料金の20%、出発日の7日前〜2日前までは30%、出発日の前日は40%、当日の出発前までは50%、出発後は100%になります。</p>
<p style="font-size:13px;margin:0 0 8px;">キャンセルのご連絡は、受付時間内にお願いします。</p>
<p style="text-align:right;font-size:12px;color:#6b7280;margin:0;">ゆうやけ観光　電話 06-6012-3456　受付時間 7:30〜18:00</p>
</div>`

// ─── Questions ───────────────────────────────────────────────────────────────

const _RAW: Omit<StaticQuestion, "explanation">[] = [
  // ── 問題1 漢字の読み方 (q1, 8問) ────────────────────────────────────────
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "1",  sentence: "この店では、いろいろな[容器]を売っています。",          options: ["ようぎ","ようき","どうぐ","どうく"],             correctIndex: 1 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "2",  sentence: "山本さんは何と何を[比べた]んですか。",                  options: ["くらべた","ならべた","しらべた","えらべた"],       correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "3",  sentence: "書類が[複数]あるので、間違えないでください。",           options: ["ふくす","ふうすう","ふくすう","ふうす"],           correctIndex: 2 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "4",  sentence: "昨日病院で[血圧]を計りました。",                        options: ["けつあつ","けつやつ","ちあつ","ちやつ"],           correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "5",  sentence: "ここから見る[夕日]はきれいだ。",                        options: ["ゆび","ゆひ","ゆうび","ゆうひ"],                   correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "6",  sentence: "そこに一人で行くのは[難しい]と思います。",               options: ["きびしい","めずらしい","さびしい","むずかしい"],   correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "7",  sentence: "中村さんから出張の[件]でお電話がありました。",           options: ["けい","よう","けん","よん"],                       correctIndex: 2 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "8",  sentence: "ここを[横断]するときは気をつけてください。",             options: ["おうざん","おうだん","きだん","きざん"],           correctIndex: 1 },

  // ── 問題2 漢字の書き方 (q2, 6問) ────────────────────────────────────────
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "9",  sentence: "車から出て、外の空気を[すった]。",                      options: ["吹った","呼った","吸った","叫った"],               correctIndex: 2 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "10", sentence: "あしたのアルバイトは、いつもより時間が[みじかい]。",     options: ["早い","長い","短い","遅い"],                       correctIndex: 2 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "11", sentence: "今日は少し、[い]の調子がよくない。",                    options: ["肩","胃","腰","肌"],                               correctIndex: 1 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "12", sentence: "その話を聞いて、みんなが[えがお]になった。",             options: ["楽顔","悲顔","泣顔","笑顔"],                       correctIndex: 3 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "13", sentence: "[こくばん]を見てください。",                            options: ["黒板","黒坂","告板","告坂"],                       correctIndex: 0 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "14", sentence: "それは[いっぱんてきな]ことだと思う。",                  options: ["一段的","一般的","一役的","一設的"],               correctIndex: 1 },

  // ── 問題3 文脈規定 (q3, 11問) ────────────────────────────────────────────
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "15", sentence: "田中さんは私のめいと結婚したので、私たちは（　）になりました。",         options: ["夫婦","家内","親戚","兄弟"],                   correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "16", sentence: "昨日は駅で、学生時代の友達に（　）会って、びっくりした。",               options: ["ついでに","当然","たまに","偶然"],             correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "17", sentence: "洗剤は種類が多いので、どれを買おうか（　）しまう。",                     options: ["迷って","騒いで","疑って","飽きて"],           correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "18", sentence: "足に（　）合う靴がなかなか見つからない。",                               options: ["はっきり","ぴったり","うっかり","がっかり"],   correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "19", sentence: "天気がいいので、庭に洗濯物を（　）。",                                   options: ["混ぜた","揚げた","干した","こぼした"],         correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "20", sentence: "今日の晩ご飯は、森さんが教えてくれた日本料理の（　）を見て作りました。",  options: ["メッセージ","レシピ","サイン","アナウンス"],   correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "21", sentence: "映画の中に（　）する男性が、父にそっくりだった。",                       options: ["発生","支出","掲示","登場"],                   correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "22", sentence: "大勢の前で歌うのは初めてだったので、（　）した。",                       options: ["どきどき","だぶだぶ","ぐうぐう","ざあざあ"],   correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "23", sentence: "ホテルで海側の部屋を（　）したが、空いていなかった。",                   options: ["納得","承知","希望","準備"],                   correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "24", sentence: "夜になると、隣の家の犬が（　）ので、うるさくてなかなか眠れない。",       options: ["ほえる","ひびく","しゃべる","どなる"],         correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "25", sentence: "この道は狭いので、前の車を（　）のは危険ですよ。",                       options: ["飛び出す","追い越す","押し込む","取り替える"], correctIndex: 1 },

  // ── 問題4 言い換え類義 (q4, 5問) ────────────────────────────────────────
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "26", sentence: "もう少し時間を[あたえよう]と思う。",  options: ["あげよう","もらおう","作ろう","使おう"],                                                                   correctIndex: 0 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "27", sentence: "ここは車が[ずいぶん]多いですね。",    options: ["最も","非常に","まあまあ","やっぱり"],                                                                     correctIndex: 1 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "28", sentence: "荷物は、[指定の]場所に置いてください。", options: ["決められた","空いている","近くの","ほかの"],                                                              correctIndex: 0 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "29", sentence: "山田さんの話を聞くまでは[不安]だった。", options: ["賛成","大変","心配","反対"],                                                                             correctIndex: 2 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "30", sentence: "[スケジュール]は川井さんに聞いてください。", options: ["行き方","理由","やり方","予定"],                                                                     correctIndex: 3 },

  // ── 問題5 用法 (q5, 5問) ─────────────────────────────────────────────────
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "31", sentence: "問題5: [発展]の使い方として最もよいものを選びなさい。",
    options: [
      "毎朝ジョギングを続けたら、健康が発展するだろう。",
      "テレビで紹介されてから、この店は客の数が発展した。",
      "林さんは中学校のとき、成績が急に発展したそうだ。",
      "この町は歴史的な建物が多く、観光地として発展してきた。"
    ], correctIndex: 3 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "32", sentence: "問題5: [だく]の使い方として最もよいものを選びなさい。",
    options: [
      "朝作ったお弁当を大きめのハンカチでだいてかばんに入れた。",
      "生まれた子を初めてだいたとき、とても小さくて軽いと感じた。",
      "けがをしないように、包丁をしっかりだいて魚を切った。",
      "引っ越しのとき運びやすいように、本や雑誌をひもでだいた。"
    ], correctIndex: 1 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "33", sentence: "問題5: [原料]の使い方として最もよいものを選びなさい。",
    options: [
      "ここから見える景色を原料にして、抽象的な絵をかくつもりだ。",
      "大学を卒業したら、留学の経験を原料にして仕事がしたい。",
      "このドラマは、海外の小説を原料にしたそうです。",
      "牛乳を原料にして、チーズやバターが作られます。"
    ], correctIndex: 3 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "34", sentence: "問題5: [異常]の使い方として最もよいものを選びなさい。",
    options: [
      "今年の夏は異常な暑さで、エアコンがよく売れたそうだ。",
      "その色は見えにくいので、赤などの異常な色を使ってください。",
      "妹の作文は上手に書けていたが、異常な漢字が一つあった。",
      "姉の靴は、私とは異常なサイズなので、借りることができない。"
    ], correctIndex: 0 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "35", sentence: "問題5: [重なる]の使い方として最もよいものを選びなさい。",
    options: [
      "A銀行とB銀行が重なって、新しい銀行ができました。",
      "私たちの研究会に、来月から新しい仲間が重なります。",
      "子どもの運動会が大切な会議と重なった、見に行けない。",
      "貯金がたくさん重なったら、車を買おうと思っている。"
    ], correctIndex: 2 },

  // ── 文法 問題1 文の文法（空欄補充）(q6, 13問) ──────────────────────────
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "1",
    sentence: "（教室で）アン「先生、スピーチ大会の申込書を書いてきました。書き方がよくわからないところなんですが、ここの書き方はこれ（　）大丈夫でしょうか。」",
    options: ["に","で","と","が"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "2",
    sentence: "（北山市のホームページで）７月25日と26日の２日間、北山公園（　）夏祭りが行われました。",
    options: ["において","にとって","に対して","について"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "3",
    sentence: "私は、誰（　）親切で優しい兄をとても尊敬している。",
    options: ["にだけ","からだけ","にでも","からでも"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "4",
    sentence: "（教室で）先生「来週の授業でこのプリントを使いますから、（　）持ってきてください。」",
    options: ["全く","非常に","決して","必ず"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "5",
    sentence: "友達の結婚式に招待されたが、出張があって（　）行けない。",
    options: ["どうしても","それほど","せっかく","つい"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "6",
    sentence: "私の応援している野球選手が、肩のけがの（　）、しばらく試合に出られなくなった。とても心配だ。",
    options: ["途中で","一方で","ように","ために"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "7",
    sentence: "歯医者「歯を（　）寝てしまうと、虫歯になりやすくなります。寝る前にきちんと磨くようにしてください。」",
    options: ["磨いて","磨かずに","磨くたびに","磨かなくて"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "8",
    sentence: "（電話で）中川「もしもし。林さん、今ちょっといい?」\n林「あ、ごめん。これから（　）、あとでこっちから電話するね。」",
    options: ["出かけるところなのに","出かけているところなのに","出かけるところだから","出かけているところだから"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "9",
    sentence: "（道で）A「すみません。東図書館を探しているんですが……。」\nB「ああ、東図書館ですね。この坂を（　）郵便局がありますから、その角を右に曲がってください。右に曲がってすぐ図書館があります。」",
    options: ["のぼっていくと","のぼっていきながら","のぼってくるには","のぼってくるとき"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "10",
    sentence: "A「さくら駅の近くに新しくできたラーメン屋、（　）?」\nB「ううん、知らない。」\nA「昨日初めて行ったんだけど、すごくおいしかったよ。」",
    options: ["知っとく","知っちゃう","知ってく","知ってる"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "11",
    sentence: "（電話で）山下「はい、X建設営業課、山下です。」\n石田「ABC銀行の石田と申しますが、中川さんか林さんはいらっしゃいますか。」\n山下「はい、中川が（　）ので、今、代わります。」",
    options: ["いたします","おります","いただきます","ございます"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "12",
    sentence: "私は美術館が好きで、今までいろいろな美術館に行った。国内の美術館が多いが、海外の美術館に（　）。",
    options: ["行ったこともある","行ったことはない","行くこともできる","行くこともできない"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "13",
    sentence: "（靴屋で）客「すみません。この靴、（　）。」\n店員「どうぞ。サイズはこちらでよろしいですか。」\n客「はい。」",
    options: ["履いてもらえませんか","履かないんですか","履いてみてもいいですか","履くことになりますか"], correctIndex: 2 },

  // ── 文法 問題2 文の文法★（並べ替え）(q7, 5問) ─────────────────────────
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "14",
    sentence: "留学している息子　＿＿＿　＿＿＿　[★]　＿＿＿　毎日楽しく過ごしていると書かれていて安心した。",
    options: ["メール","から","に","の"], correctIndex: 0 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "15",
    sentence: "来週から１か月間、出張で東京に行く。東京には　＿＿＿　＿＿＿　[★]　＿＿＿　一緒に食事でもしたいと思う。",
    options: ["いるので","いる間に","友達が","東京に"], correctIndex: 3 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "16",
    sentence: "Aバイオリンが　＿＿＿　＿＿＿　[★]　＿＿＿　こんなに面白い楽器はないと感じる。",
    options: ["１年前に習い始めたのだが","弾くほど","弾けば","弾けるようになりたくて"], correctIndex: 2 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "17",
    sentence: "A「お誕生日おめでとう。これ、プレゼントだよ。」\nB「わあ、かばんだ。ちょうど　＿＿＿　＿＿＿　[★]　＿＿＿　んだ。ありがとう。」",
    options: ["こういう色の","欲しい","と思っていた","かばんが"], correctIndex: 1 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "18",
    sentence: "都会と田舎には違うところも多いが、どちらも、人が働き、　＿＿＿　＿＿＿　[★]　＿＿＿",
    options: ["という点で","違いは","生活している","ない"], correctIndex: 1 },

  // ── 文法 問題3 文章の文法 (q8, 4問) ────────────────────────────────────
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "19",
    context: PASSAGE_G3,
    sentence: "（19）にも初めて入りました。",
    options: ["温泉","あの温泉","そんな温泉","これらの温泉"], correctIndex: 0 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "20",
    context: PASSAGE_G3,
    sentence: "腕時計（20）ないことに気がつきました。",
    options: ["まで","しか","は","が"], correctIndex: 3 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "21",
    context: PASSAGE_G3,
    sentence: "温泉の入り口のところに（21）。",
    options: ["落ちたままです","落ちたばかりです","落ちていたそうです","落ちていたことです"], correctIndex: 2 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "22",
    context: PASSAGE_G3,
    sentence: "旅行では観光地や食べ物だけではなく、人の優しさもいい思い出に（22）。",
    options: ["なっただろうと思います","なるのだと感じました","なったのではないでしょうか","なるでしょうか"], correctIndex: 2 },

  // ── 読解 問題4 短文読解 (q9, 4問) ──────────────────────────────────────
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "23",
    context: PASSAGE_R4_1,
    sentence: "営業課のホンさんは、明日の朝の会議で使う資料を今日中に５枚コピーしたいと考えている。どうしなければならないか。",
    options: [
      "営業課でコピーをする。中島さんに言う必要はない。",
      "会計課でコピーをする。中島さんに言う必要はない。",
      "中島さんに言ってから、営業課でコピーをする。",
      "中島さんに言ってから、会計課でコピーをする。"
    ], correctIndex: 1 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "24",
    context: PASSAGE_R4_2,
    sentence: "テレビ番組を見て、「私」は娘のボール投げがうまくならないのは、なぜだと思ったか。",
    options: [
      "上手な投げ方についての「私」の説明が下手だったから。",
      "繰り返し同じ投げ方で投げる練習をさせていなかったから。",
      "実際に「私」が上手に投げているところを見せていなかったから。",
      "ちょうどいい力の入れ方を体で覚える練習をさせていなかったから。"
    ], correctIndex: 3 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "25",
    context: PASSAGE_R4_3,
    sentence: "このメールで言いたいこととして、合っているのはどれか。",
    options: [
      "商品が品切れになったから、３月上旬に送る。",
      "商品が品切れになったから、３月上旬にもう一度注文してほしい。",
      "商品が品切れで、届けるまでに時間がかかるから、どうしたいか知らせてほしい。",
      "注文と違う色の商品を送ってしまったから、正しい色のものをすぐに送る。"
    ], correctIndex: 2 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "26",
    context: PASSAGE_R4_4,
    sentence: "「私」が古い靴を店に持っていこうと思った理由の中で、最も大きいものはどれか。",
    options: [
      "古い靴を割引券と交換して、新しい靴を買うときに使いたいと思ったから。",
      "古い靴を売ってお金をもらい、そのお金で新しい靴を買いたいと思ったから。",
      "古い靴をきれいに直してもらって、もう一度履きたいと思ったから。",
      "古い靴を利用してもらって、環境をよくしたいと思ったから。"
    ], correctIndex: 0 },

  // ── 読解 問題5 中文読解 (q10, 6問) ─────────────────────────────────────
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "27",
    context: PASSAGE_R5_1,
    sentence: "①懐かしい声とあるが、何か。",
    options: [
      "「私」が高校生のころの父の声。",
      "「私」高校生のころの自分の声。",
      "「私」が高校生のころ大好きだった歌手の声。",
      "「私」が高校生のころ聞いていたアナウンサーの声。"
    ], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "28",
    context: PASSAGE_R5_1,
    sentence: "②また、ラジオを聞こうと思ったのはどうしてか。",
    options: [
      "ラジオは、テレビより小さくて身近に置くことができるから",
      "ラジオは、インターネットより多くのことを教えてくれるから",
      "ラジオは、新しいことだけでなく古いことも伝えてくれるから",
      "ラジオは、何かをしながらでも、いろいろなことを知ることができるから"
    ], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "29",
    context: PASSAGE_R5_1,
    sentence: "この文章のテーマは何か。",
    options: [
      "ラジオ番組の楽しさ。",
      "ラジオの良さ。",
      "ラジオの歴史の長さ。",
      "ラジオの使い方の工夫。"
    ], correctIndex: 1 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "30",
    context: PASSAGE_R5_2,
    sentence: "町が①説明会を開いた目的は何か。",
    options: [
      "町に引っ越して来てくれる人を募集すること。",
      "町に引っ越して来る人を助けてくれる町民を募集すること。",
      "町の農業について、アドバイスをしてくれる専門家を募集すること。",
      "町の人口を増やすにはどうしたらいいか、考えてくれる人を募集すること。"
    ], correctIndex: 0 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "31",
    context: PASSAGE_R5_2,
    sentence: "②共通点とあるが、それはどのような点だと考えられるか。",
    options: [
      "期待していた生活ができていないが、我慢して生活している点。",
      "期待していた生活ができるようになり、楽しく生活できている点。",
      "期待していた生活と実際の生活が同じではなかったが、満足している点。",
      "期待していた生活と実際の生活が違い、不満を感じた点。"
    ], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "32",
    context: PASSAGE_R5_2,
    sentence: "説明会に行ってから、自分の夢について、「私」はどう思うようになったか。",
    options: [
      "失敗例が多すぎるから、実行するのはあきらめたほうがよさそうだ。",
      "失敗例を知ったので、実行するかしないかを検討したい。",
      "失敗例のことも考えて、しっかり計画を立てて実行したい。",
      "失敗例より成功例がたくさんあるから、失敗例は気にせずすぐ実行したい。"
    ], correctIndex: 2 },

  // ── 読解 問題6 長文読解 (q11, 4問) ─────────────────────────────────────
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "33",
    context: PASSAGE_R6,
    sentence: "①全然変わらないとあるが、何が変わらないのか。",
    options: [
      "布団に入ってもしばらく眠れないこと。",
      "運動しないと眠れないこと。",
      "朝、決まった時間に起きられないこと。",
      "１時間も走り続けられないこと。"
    ], correctIndex: 0 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "34",
    context: PASSAGE_R6,
    sentence: "②体の中心の温度の変化が重要だとあるが、この変化を起こすためには、どうすればいいか。",
    options: [
      "体の中心の温度をまず下げることで、中心の温度が上がる状態を作る。",
      "体の中心の温度をまず上げることで、中心の温度が下がる状態を作る。",
      "体の中心の温度を上げて、中心の温度が決まった温度から下がらない状態を作る。",
      "体の中心の温度を上げたり下げたりして、中心の温度が変化し続ける状態を作る。"
    ], correctIndex: 1 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "35",
    context: PASSAGE_R6,
    sentence: "③間違いとあるが、「私」が間違えて、していたことは何か。",
    options: [
      "寝る１時間前に体が疲れるまで運動をすること。",
      "寝る１時間前に軽い運動をすること。",
      "寝る２、３時間前に体が疲れるまで運動をすること。",
      "寝る２、３時間前に軽い運動をすること。"
    ], correctIndex: 0 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "36",
    context: PASSAGE_R6,
    sentence: "（　　　）に入れるのに最もよいものはどれか。",
    options: [
      "起きる時間を遅くしよう。",
      "布団に入って自然に眠くなるのを待とう。",
      "ぬるめの風呂にゆっくり入ってから寝よう。",
      "軽く走ってから寝よう。"
    ], correctIndex: 2 },

  // ── 読解 問題7 情報検索 (q12, 2問) ─────────────────────────────────────
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "37",
    context: PASSAGE_R7,
    sentence: "田中さんは、出発日が土曜日のバス旅行に申し込みたいと思っている。昼食がついていて、温泉に行けるものがいい。田中さんの希望に合うのはどれか。",
    options: ["①。","②。","③。","④。"], correctIndex: 3 },
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "38",
    context: PASSAGE_R7,
    sentence: "ロパートさんは、出発日が明日10月6日（土）の「①川中市内観光と川中東温泉」に申し込んでいたが、行けなくなった。今日の受付時間のうちにキャンセルする場合、キャンセル料はどうなるか。",
    options: [
      "7,500円の40%を払う。",
      "8,500円の40%を払う。",
      "7,500円の50%を払う。",
      "8,500円の50%を払う。"
    ], correctIndex: 1 },

  // ── 聴解 問題1 (lq1, 6問) ───────────────────────────────────────────────
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3","4"], correctIndex: 0 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "5ばん", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "6ばん", options: ["1","2","3","4"], correctIndex: 1 },

  // ── 聴解 問題2 (lq2, 6問) ───────────────────────────────────────────────
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "5ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "6ばん", options: ["1","2","3","4"], correctIndex: 0 },

  // ── 聴解 問題3 (lq3, 3問) ───────────────────────────────────────────────
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3","4"], correctIndex: 2 },

  // ── 聴解 問題4 (lq4, 4問) ───────────────────────────────────────────────
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3"], correctIndex: 1 },

  // ── 聴解 問題5 (lq5, 9問) ───────────────────────────────────────────────
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "5ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "6ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "7ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "8ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "9ばん", options: ["1","2","3"], correctIndex: 2 },
]

// ─── Exports ─────────────────────────────────────────────────────────────────

export const N3_12_2022_COUNTS = {
  vocab: 35,
  grammar: 38,
  listening: 28,
  total: 101,
}

export const N3_12_2022_QUESTIONS: StaticQuestion[] = _RAW.map(q => {
  const ex = (_explanations as Record<string, string>)[q.display]
  return ex ? { ...q, explanation: ex } : q
})
