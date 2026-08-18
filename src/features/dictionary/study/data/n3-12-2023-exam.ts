// 2023年12月 日本語能力試験 N3 — 言語知識（文字・語彙・文法）・読解・聴解
// Explanations are stored in ./explanations/n3-12-2023.json and merged at export time.

import _explanations from "./explanations/n3-12-2023.json"

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
<p style="text-align:center;font-weight:700;margin:0 0 4px;">ガソリンスタンドのサービス</p>
<p style="text-align:right;font-size:13px;color:#6b7280;margin:0 0 12px;">アレン　マット</p>
<p style="margin:0 0 10px;">　先週、友達の車でドライブに行ったとき、私は初めて日本のガソリンスタンドに行きました。</p>
<p style="margin:0 0 10px;">　ガソリンスタンドで友達が車を止めると、店員が車の窓のそばまで来ました。友達は窓を開けて、入れたいガソリンの種類と量を店員に伝えました。私は自分でガソリンを入れる店<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">19</span>知りませんでした。だから、その様子を見て、どうして友達は車から出ないんだろうと思いました。友達が窓を閉めると、すぐに店員がガソリンを入れ始めたので、驚きました。<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">20</span>、別の店員が来て、車の窓も丁寧に拭いてくれたのです。そのガソリンスタンドで友達は、一度も車から出ませんでした。</p>
<p style="margin:0 0 10px;">　友達によると、日本のガソリンスタンドには、客が自分でガソリンを入れるところと店員が入れるところがあり、料金はそんなに変わらないそうです。私たちが<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">21</span>ガソリンスタンドでは、ガソリンを入れた車が道路に出るとき、店員が左右を見て車が来ないか確認して、見送りもしていました。</p>
<p style="margin:0;">　ガソリンを入れたり、窓を拭いたり、見送りをしたりしてもらって、私はそのガソリンスタンドが客や車を大切にしていると感じました。とても<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">22</span>。</p>
</div>`

const PASSAGE_R4_1 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">これは、ある映画館のインターネットチケット予約サービスから、村田さんに届いたメールである。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">村田新一様</p>
<p style="margin:0 0 8px;">チケット代金を支払っていただき、ありがとうございました。</p>
<table style="width:100%;border-collapse:collapse;margin:0 0 10px;font-size:13px;">
<tr><td style="padding:3px 0;width:120px;">＜予約番号＞</td><td>0832　</td><td style="width:100px;">＜電話番号＞</td><td>090-0911-4215</td></tr>
<tr><td style="padding:3px 0;">＜日時＞</td><td colspan="3">4月11日（土）14時〜</td></tr>
<tr><td style="padding:3px 0;">＜合計代金＞</td><td colspan="3">大人２枚　3,600円</td></tr>
<tr><td style="padding:3px 0;">＜映画名＞</td><td colspan="3">『海』</td></tr>
<tr><td style="padding:3px 0;">＜席番号＞</td><td colspan="3">K13　K14</td></tr>
</table>
<p style="margin:0 0 4px;">・ご予約はキャンセルできませんので、ご注意ください。</p>
<p style="margin:0 0 4px;">・当日は、映画館でチケットを発券していただく必要がございます。券売機に＜予約番号＞と＜電話番号＞をご入力ください。</p>
<p style="margin:0 0 10px;">・映画開始から15分を過ぎますと、券売機での発券はできなくなります。それ以降は、チケットオフィスで発券いたします。</p>
<p style="margin:0 0 2px;">東王映画館インターネットチケット予約サービス</p>
<p style="font-size:12px;color:#6b7280;margin:0;">お問い合わせ　061-987-6543</p>
</div>`

const PASSAGE_R4_2 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">アリサさんが家に帰ると、テーブルの上に、一緒に住んでいる春美さんが書いたメモが置いてあった。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="margin:0 0 8px;">アリサさん</p>
<p style="margin:0 0 8px;">　大学の事務所に今日中に出さなければならない書類があるのを忘れていたので、ちょっと行ってきます。</p>
<p style="margin:0 0 8px;">　カレーとスープはできたんだけど、サラダがまだできていないので、お願いできますか。冷蔵庫にトマトやレタスがあるから、適当に使ってください。</p>
<p style="margin:0 0 8px;">　今日は私が晩ご飯を作ると言ったのに、ごめんなさい。帰りに何か甘いものを買ってきますね。</p>
<p style="text-align:right;margin:0;">春美</p>
</div>`

const PASSAGE_R4_3 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">　雑誌で「友達や家族と待ち合わせるとき、その場所に行く時間」についての調査の記事を読んだ。早めに行く人は、全体の59%で最も多く、次に多かったのが、時間に間に合うように行く人で36%だった。一方で、多少遅れても気にしないという人は、3%しかなかった。</p>
<p style="margin:0;">　私はいつも早めに行くが、友人たちはたいてい遅れて来る。私が珍しいタイプなのかと思っていたが、この結果から、そうではないとわかって、<u>意外だった</u>。</p>
</div>`

const PASSAGE_R4_4 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">　納豆は、体にいいし、おいしいので、私は毎日食べている。そのまま食べる人も多いが、私は卵に混ぜて焼いたり、みそ汁に入れたり、いろいろな料理に使っている。</p>
<p style="margin:0 0 8px;">　しかし、今朝テレビを見て驚いた。納豆には、ほかの食べ物にはない種類の酵素<sup>（注）</sup>が入っている。これには血液の流れをよくする効果があるが、50度以上の熱で減ってしまうそうなのだ。そうだとすると、私は今まで、とても<u>もったいない食べ方をしていた</u>ことになる。</p>
<p style="font-size:12px;color:#6b7280;margin:0;">（注）酵素：ここでは、食べ物に入っている栄養のような物</p>
</div>`

const PASSAGE_R5_1 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">　私の留学している日本の大学には、漫画を読んで社会について考える授業があります。私は子供のころから日本の漫画が大好きだったので、この授業を取りました。しかし、これは失敗でした。</p>
<p style="margin:0 0 8px;">　この授業では、学生は毎週の授業の前に、先生が指定した漫画を読んでいくことになっていました。ところが、扱う漫画はどれも私が知らないものばかりだったので、読むのに時間がかかって、毎回とても大変でした。</p>
<p style="margin:0 0 8px;">　いちばん困ったのは学期末の試験です。試験の前に、ある漫画を読んでおくように先生に言われました。その漫画は全部で3巻もあり、しっかり読むのにはとても時間がかかりました。そのために、ほかの試験の勉強ができなくなり、寝る時間も削らなければならなくなりました。いつもなら、試験期間中は漫画を読むのを我慢するのですが、<u>このときの私は逆だったのです</u>。</p>
<p style="margin:0;">　試験はうまくいきましたが、今はしばらく漫画はお休みにしたい気分です。</p>
</div>`

const PASSAGE_R5_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">　A町は景色の美しい海沿いの町で、毎週日曜の朝に港で開かれる「朝市」も人気がある。朝市は、A町にある店が、魚や肉、野菜、パン、ケーキなどを売る市場で、近くの市や町からも客が大勢やってくる。</p>
<p style="margin:0 0 8px;">　朝市を始めたのは、A町に昔からある店の主人たちである。約30年前、大きなスーパーマーケットができた。多くの人がスーパーを利用するようになってしまったため、店の主人たちは、自分たちの店の商品の良さをもっと知ってもらおうと、朝市を始めたのだ。</p>
<p style="margin:0 0 8px;">　朝市では、人気がある商品はすぐ売り切れてしまう。そんなに人気があるなら、たくさん売ればいいのだが、<u>それ</u>はしないそうだ。この朝市の目的は、朝市でお金を稼ぐことではなく、まず朝市で自分たちの店について知ってもらって、ふだんA町の店で買い物をする客を増やすことだからだ。そのため、朝市に商品が出せる人は（　）だけ、ということになっている。</p>
</div>`

const PASSAGE_R6 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">　先月、新しいオートバイを買った。オートバイには<u>①長い間乗っていなかった</u>が、久しぶりにまた乗りたくなったのだ。前に乗っていたのは大学生のころで、もう20年も前だ。卒業後はずっと仕事や子供の世話で忙しかったが、最近、少し自由に使える時間が増えた。妻に相談したら、「いいんじゃない?」と賛成してくれた。</p>
<p style="margin:0 0 8px;">　オートバイを買った店は、「ガロン」という店だ。私には、どうしてもこの店で買いたい理由があったのだ。</p>
<p style="margin:0 0 8px;">　20年前の春、私は、父にもらったオートバイで東京から京都まで旅行をしていた。安い旅館に泊まりながら、何日もかけて進む旅だった。</p>
<p style="margin:0 0 8px;">　3日目の朝、道を走っているとき、オートバイの前の方で何かが折れる音がした。見ると、<u>②オートバイの部品が壊れていた</u>。ハンドルが少しぐらぐらしたが、オートバイは一応動いた。</p>
<p style="margin:0 0 8px;">　しばらく進むと、オートバイの店があったので、修理を頼んでみた。しかし、難しい修理だからできない、と断られてしまった。次の店でも同じだった。そして、3軒目の店が「ガロン」だった。「ガロン」の店員も「これは難しいね。」と言った。でも、「困っているんでしょう?　やってみるよ。」と言って、修理を始めてくれた。そして、2時間かけて直してくれたのだ。店員は「いつかこの店でオートバイを買ってね。」と言って笑った。本当に困っていた私は、<u>③何度もお礼を言いながら</u>、必ずそうしようと決めた。</p>
<p style="margin:0;">　今の「ガロン」には、もうあの店員はいなかった。会えなかったのは残念だったが、それでも<u>④私は満足している</u>。</p>
</div>`

const PASSAGE_R7 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.8;">
<p style="text-align:center;font-weight:700;font-size:15px;margin:0 0 2px;">朝山スキー場</p>
<p style="text-align:center;font-weight:700;font-size:16px;margin:0 0 8px;">初級スキー教室のご案内</p>
<p style="font-size:13px;margin:0 0 10px;">期間：12月24日〜3月31日</p>
<p style="font-weight:700;font-size:13px;margin:0 0 4px;">【コースと料金】</p>
<div style="border:1px solid #9ca3af;border-radius:4px;padding:10px;margin:0 0 8px;font-size:13px;">
<p style="font-weight:700;margin:0 0 4px;">＜普通コース（2時間）＞</p>
<p style="margin:0 0 2px;">・大人クラス（最大10名）と子どもクラス（最大8名）があります。</p>
<p style="margin:0 0 6px;">・午前（10時〜12時）と、午後（2時〜4時）のどちらかを選んでください。</p>
<table style="border-collapse:collapse;width:200px;">
<tr><td style="border:1px solid #9ca3af;padding:4px 8px;">大人一人</td><td style="border:1px solid #9ca3af;padding:4px 8px;">4,000円</td></tr>
<tr><td style="border:1px solid #9ca3af;padding:4px 8px;">子ども（小学生）一人</td><td style="border:1px solid #9ca3af;padding:4px 8px;">4,500円</td></tr>
</table>
<p style="font-size:12px;margin:4px 0 0;">※朝山ホテルにお泊まりの方は、500円割引します。</p>
</div>
<div style="border:1px solid #9ca3af;border-radius:4px;padding:10px;margin:0 0 10px;font-size:13px;">
<p style="font-weight:700;margin:0 0 4px;">＜特別コース（2時間または4時間）＞</p>
<p style="margin:0 0 2px;">・お友達やご家族だけで習いたい方のためのコースです。小学生から参加できます。</p>
<p style="margin:0 0 2px;">・4〜6名のグループで申し込んでください。</p>
<p style="margin:0 0 6px;">・午前9時から午後7時までの間で、2時間か4時間を選べます。</p>
<table style="border-collapse:collapse;font-size:13px;">
<tr><td style="border:1px solid #9ca3af;padding:4px 8px;"></td><td style="border:1px solid #9ca3af;padding:4px 8px;text-align:center;">2時間</td><td style="border:1px solid #9ca3af;padding:4px 8px;text-align:center;">4時間</td></tr>
<tr><td style="border:1px solid #9ca3af;padding:4px 8px;">1グループ</td><td style="border:1px solid #9ca3af;padding:4px 8px;text-align:center;">22,000円</td><td style="border:1px solid #9ca3af;padding:4px 8px;text-align:center;">39,000円</td></tr>
</table>
<p style="font-size:12px;margin:4px 0 0;">※グループの中に、朝山ホテルにお泊まりの方がいれば、グループの料金から2,000円割引します。</p>
</div>
<p style="font-weight:700;font-size:13px;margin:0 0 4px;">【申し込みと料金の支払い】</p>
<p style="font-size:13px;margin:0 0 3px;">・普通コースは、午前に受ける場合は当日の午前9時30分まで、午後に受ける場合は当日の午後1時30分までに、スキー教室の窓口（朝山ホテル1階）で申し込んでください。料金は申し込みのときに支払ってください。</p>
<p style="font-size:13px;margin:0 0 10px;">・特別コースは、午前に開始したい場合は前日の午後4時まで、午後の場合は当日の午前9時までに、電話か窓口で申し込んでください。料金はコース開始前に窓口で支払ってください。</p>
<p style="font-weight:700;font-size:13px;margin:0 0 4px;">【教室当日の集合】</p>
<p style="font-size:13px;margin:0 0 8px;">・どちらのコースも、開始時間の10分前にスキー場の入り口に集合してください。</p>
<p style="text-align:right;font-size:12px;color:#6b7280;margin:0;">予約・お問い合わせ　013-227-1665</p>
</div>`

// ─── Questions ───────────────────────────────────────────────────────────────

const _RAW: Omit<StaticQuestion, "explanation" | "script">[] = [
  // ── 問題1 漢字の読み方 (q1, 8問) ────────────────────────────────────────
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "1",  sentence: "すみません、[汚して]しまいました。",       options: ["こわして","おこして","よごして","のこして"],         correctIndex: 2 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "2",  sentence: "体育館に[選手]が入ってきました。",          options: ["ぜんしゅ","せんしゅう","せんしゅ","ぜんしゅう"],     correctIndex: 2 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "3",  sentence: "次は[月末]に来てください。",               options: ["げつもつ","げつまつ","がつまつ","がつもつ"],           correctIndex: 1 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "4",  sentence: "箱の[裏]をよく見てください。",             options: ["うら","おく","ふた","よこ"],                           correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "5",  sentence: "この町の[産業]について話を聞いた。",       options: ["じょうぎょう","ざんぎょう","しょうぎょう","さんぎょう"], correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "6",  sentence: "あしたの[朝刊]は休みです。",               options: ["ちょうがん","ちょうかん","ちゅうかん","ちゅうがん"],   correctIndex: 1 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "7",  sentence: "その話を聞いて、中村さんは[断った]そうです。", options: ["こわがった","あやまった","うたがった","ことわった"],  correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "8",  sentence: "あしたは、2時に[広場]に集まってください。", options: ["ひろば","ひろじょう","こうば","こうじょう"],           correctIndex: 0 },

  // ── 問題2 漢字の書き方 (q2, 6問) ────────────────────────────────────────
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "9",  sentence: "次の駅で[おりましょう]。",                 options: ["停りましょう","乗りましょう","降りましょう","移りましょう"], correctIndex: 2 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "10", sentence: "いつも7時には[きたく]している。",          options: ["着宅","帰室","帰宅","着室"],                           correctIndex: 2 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "11", sentence: "野菜を[こまかく]切ってください。",          options: ["角かく","平かく","丸かく","細かく"],                   correctIndex: 3 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "12", sentence: "[ほうりつ]を守ってください。",             options: ["法律","法則","規則","規律"],                           correctIndex: 0 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "13", sentence: "袋の中は[から]でした。",                  options: ["無","空","欠","穴"],                                   correctIndex: 1 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "14", sentence: "今日の[かいひ]は3,000円です。",            options: ["会賛","会費","回費","回賛"],                           correctIndex: 1 },

  // ── 問題3 文脈規定 (q3, 11問) ────────────────────────────────────────────
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "15", sentence: "クイズの答えが分からないので、何か（　）が欲しい。",                                     options: ["ヒント","マナー","アドレス","チェック"],               correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "16", sentence: "100年後の世界がどうなっているか、（　）してみてください。",                             options: ["承知","納得","希望","想像"],                           correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "17", sentence: "今朝学校に行くとき、母がベランダから手を（　）見送ってくれた。",                       options: ["指して","扱って","振って","押して"],                   correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "18", sentence: "田中さんの部屋は、本や服が（　）整理されていて、きれいですね。",                       options: ["はっきり","なるべく","そっと","きちんと"],             correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "19", sentence: "寒さで、手の指の（　）がなくなってしまった。",                                         options: ["感動","感覚","感激","感心"],                           correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "20", sentence: "虫歯を防ぐためには、食後に歯を磨くことが最も（　）だと思う。",                         options: ["自動的","効果的","人工的","消極的"],                   correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "21", sentence: "林さんと森さんは、（　）顔は知っているが、話したことはないそうだ。",                   options: ["たまに","ついでに","おたがいに","おもに"],             correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "22", sentence: "前の人の発表が終わったので、次は私が発表する（　）だ。",                               options: ["線","運","段","番"],                                   correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "23", sentence: "この飛行機に載せることができる荷物は一人20キロ以内に（　）されている。",               options: ["制限","禁止","検査","解決"],                           correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "24", sentence: "砂糖か塩か分からなかったので、舌で（　）みた。",                                       options: ["かじって","なめて","かんで","まぜて"],                 correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "25", sentence: "少し熱があって、体も（　）ので、今日は仕事を休もうと思う。",                           options: ["だるい","まぶしい","ぬるい","にがい"],                 correctIndex: 0 },

  // ── 問題4 言い換え類義 (q4, 5問) ────────────────────────────────────────
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "26", sentence: "皆さん、[避難して]ください。",             options: ["ならんで","入って","にげて","急いで"],                 correctIndex: 2 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "27", sentence: "何かいい[案]はありませんか。",             options: ["ルール","アイデア","メニュー","サービス"],             correctIndex: 1 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "28", sentence: "私が何を言っても、彼はずっと[だまって]いた。", options: ["話さなかった","笑わなかった","動かなかった","怒らなかった"], correctIndex: 0 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "29", sentence: "このやり方が[ベスト]だ。",                options: ["最もよい","最もよくない","最も難しい","最も難しくない"], correctIndex: 0 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "30", sentence: "お店の人が[配達して]くれた。",            options: ["組み立てて","手伝って","貸して","届けて"],             correctIndex: 3 },

  // ── 問題5 用法 (q5, 5問) ─────────────────────────────────────────────────
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "31", sentence: "問題5: [診察]の使い方として最もよいものを選びなさい。",
    options: [
      "警察は事件があった場所を注意深く診察した。",
      "中学時代に星の動きを診察して記録をつけていた。",
      "担任の先生は生徒から相談を受け、丁寧に診察した。",
      "母は医者で、毎日たくさんの患者を診察している。"
    ], correctIndex: 3 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "32", sentence: "問題5: [行き先]の使い方として最もよいものを選びなさい。",
    options: [
      "教師になるという行き先のために、毎日頑張っている。",
      "実験の行き先が、思っていたことと違ってびっくりした。",
      "次の旅行の行き先を、今夜家族で話し合うつもりだ。",
      "この映画は見たことがあるので、内容の行き先は知っている。"
    ], correctIndex: 2 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "33", sentence: "問題5: [取り消す]の使い方として最もよいものを選びなさい。",
    options: [
      "床に落ちている大きなごみを取り消してから、掃除機を使った。",
      "サッカーの後、シャワーを浴びて汗を取り消した。",
      "このパンはかびが生えているので、もう取り消したほうがいい。",
      "都合が悪くなったので、レストランの予約を取り消した。"
    ], correctIndex: 3 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "34", sentence: "問題5: [共通]の使い方として最もよいものを選びなさい。",
    options: [
      "父は休みの日も、いつもと共通の時間に寝ることが多い。",
      "娘と息子は、共通の趣味を持っていて、とても仲がいい。",
      "私と姉は、周りの人から共通の顔だとよく言われる。",
      "あしたも今日と共通の気温で、暖かいそうだ。"
    ], correctIndex: 1 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "35", sentence: "問題5: [詰める]の使い方として最もよいものを選びなさい。",
    options: [
      "旅行に持っていく物をスーツケースに詰めておきます。",
      "味が薄かったので、スープに塩とこしょうを詰めました。",
      "お客さんのコップに水を詰めてください。",
      "時々窓を開けて、部屋の中に新鮮な空気を詰めた。"
    ], correctIndex: 0 },

  // ── 文法 問題1 文の文法（空欄補充）(q6, 13問) ──────────────────────────
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "1",
    sentence: "この辺りは古いお寺や神社が多く、外国（　）観光客にも人気がある。",
    options: ["で","での","から","からの"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "2",
    sentence: "10年前に友人と2人で会社を作った。10年間で会社は少しずつ大きくなり、社員の数は100人（　）増えた。",
    options: ["までが","までで","にまで","のまで"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "3",
    sentence: "弁当屋で働いている友人が、よく売れる弁当は天気（　）違うと言っていた。",
    options: ["について","によって","において","に比べて"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "4",
    sentence: "中学生のころから留学したいと思っていた日本に、（　）留学できることになった。",
    options: ["どうか","決して","ついに","今にも"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "5",
    sentence: "虫歯は、ひどくなってからだと治すのに時間がかかる。ひどくならない（　）歯医者に診てもらうことが重要だ。",
    options: ["うちに","ときに","までに","たびに"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "6",
    sentence: "来月から大学の近くで一人暮らしを始める。通学のしやすさを（　）、大学まで歩いて通える所にした。",
    options: ["考えるように","考えて","考えたのに","考えるのか"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "7",
    sentence: "実家からみかんがたくさん送られてきた。一人では全部（　）と思ったので、友達に半分あげた。",
    options: ["食べられそうにない","食べられなくなる","食べられるだろう","食べられたほうがいい"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "8",
    sentence: "動物が好きな2歳の娘を（　）、先週初めて動物園に連れていった。",
    options: ["喜んだら","喜びたくて","喜ばせたら","喜ばせたくて"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "9",
    sentence: "最近、バレエを習い始めた。上手に（　）何年かかるかわからないが、頑張りたい。",
    options: ["踊れるようにすると","踊れるようになっても","踊れるようにして","踊れるようになるのに"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "10",
    sentence: "うちの犬は散歩が大好きだが、雨の日は濡れるのが嫌なようで、散歩に（　）。",
    options: ["行かなくてはいけない","行きたがらない","行ってもかまわない","行くに違いない"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "11",
    sentence: "（デパートで）\n客「すみません、子供服の売り場は何階ですか。」\n店員「5階（　）。」",
    options: ["がございます","がいらっしゃいます","でございます","でいらっしゃいます"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "12",
    sentence: "（家で）\nA「夕飯に使う卵が足りないから、ちょっとスーパーまで（　）ね。」\nB「うん、わかった。」",
    options: ["買ってきておく","買いにきている","買いにいってくる","買っていってしまう"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "13",
    sentence: "（電話で）\n田中「もしもし、田中です。山下さん、今ちょっといいですか。」\n山下「あ、田中さん。私も今ちょうど田中さんに電話をしようと（　）。」",
    options: ["思っていたところでした","思っているところです","思っていたからでした","思っているからです"], correctIndex: 0 },

  // ── 文法 問題2 文の文法★（並べ替え）(q7, 5問) ─────────────────────────
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "14",
    sentence: "私は歌手の石川あかりが大好きだ。彼女　[★]　＿＿＿　＿＿＿　＿＿＿　いないと思う。",
    options: ["声がきれいな","は","歌手","ほど"], correctIndex: 3 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "15",
    sentence: "最近は野菜や魚などの食料品も　＿＿＿　＿＿＿　[★]　＿＿＿　ニュースで知った。",
    options: ["人が","増えてきている","インターネットで買う","ということを"], correctIndex: 1 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "16",
    sentence: "（大学で）\n中山「林先輩、ゼミの発表で使う資料を作ったんですが、　＿＿＿　＿＿＿　[★]　＿＿＿　でしょうか。」\n林「いいですよ。」",
    options: ["もらえない","ところがあるので","一度チェックして","自信がない"], correctIndex: 2 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "17",
    sentence: "今朝は急いでいたから、　＿＿＿　＿＿＿　[★]　＿＿＿　しまった。",
    options: ["玄関の電気を消すのを","きて","家を出て","忘れて"], correctIndex: 2 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "18",
    sentence: "読書が趣味の友人は、いつどんな本を読んだかを　＿＿＿　＿＿＿　[★]　＿＿＿　そうだ。",
    options: ["必ずノートに記録する","忘れない","ように","ことにしている"], correctIndex: 0 },

  // ── 文法 問題3 文章の文法 (q8, 4問) ────────────────────────────────────
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "19",
    context: PASSAGE_G3,
    sentence: "私は自分でガソリンを入れる店（19）知りませんでした。",
    options: ["は","も","だけ","しか"], correctIndex: 3 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "20",
    context: PASSAGE_G3,
    sentence: "驚きました。（20）、別の店員が来て、車の窓も丁寧に拭いてくれたのです。",
    options: ["ただ","例えば","そのうえ","ところが"], correctIndex: 2 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "21",
    context: PASSAGE_G3,
    sentence: "私たちが（21）ガソリンスタンドでは、店員が左右を見て車が来ないか確認して、見送りもしていました。",
    options: ["行った","行ける","行くような","行きたかった"], correctIndex: 0 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "22",
    context: PASSAGE_G3,
    sentence: "ガソリンスタンドが客や車を大切にしていると感じました。とても（22）。",
    options: ["いいサービスだろうと思うからです","いいサービスだと思いました","いいサービスにするつもりです","いいサービスにしようとしました"], correctIndex: 1 },

  // ── 読解 問題4 短文読解 (q9, 4問) ──────────────────────────────────────
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "23",
    context: PASSAGE_R4_1,
    sentence: "当日、予約したチケットを券売機で発券したい場合、どうしなければならないか。",
    options: [
      "映画開始時間の15分前までに、券売機に必要な情報を入力する。",
      "映画開始時間の15分前までに、券売機でお金を払う。",
      "映画開始時間の15分後までに、券売機に必要な情報を入力する。",
      "映画開始時間の15分後までに、券売機でお金を払う。"
    ], correctIndex: 2 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "24",
    context: PASSAGE_R4_2,
    sentence: "アリサさんがこのメモで頼まれていることは何か。",
    options: [
      "大学の事務所に行って、書類を出すこと",
      "カレーとスープを作ること",
      "サラダを作ること",
      "甘いものを買うこと"
    ], correctIndex: 2 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "25",
    context: PASSAGE_R4_3,
    sentence: "意外だったとあるが、調査結果のどのような点からそう思ったか。",
    options: [
      "「私」と同じタイプの人が、最も多い点",
      "「私」と同じタイプの人が、二番目に多い点",
      "「私」と同じタイプの人が、最も少ない点",
      "「私」と反対のタイプの人が、最も多い点"
    ], correctIndex: 0 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "26",
    context: PASSAGE_R4_4,
    sentence: "もったいない食べ方をしていたとあるが、なぜもったいないと思ったのか。",
    options: [
      "体へのよい効果が弱くなってしまう料理のしかたで、納豆を食べていたから",
      "体へのよい効果が消えるような、たくさんの量の納豆を食べていたから",
      "おいしさがわからなくなるような料理のしかたで、納豆を食べていたから",
      "おいしくなる料理方法があるのに、それを知らないで納豆を食べていたから"
    ], correctIndex: 0 },

  // ── 読解 問題5 中文読解 (q10, 6問) ─────────────────────────────────────
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "27",
    context: PASSAGE_R5_1,
    sentence: "毎回の授業の前に、学生がしなければならなかったことは何か。",
    options: [
      "授業で先生に扱ってもらいたい漫画を見つけてくること",
      "社会問題がテーマになっている漫画を見つけてくること",
      "先生に読んでくるように言われた漫画を読んでおくこと",
      "自分が読んだことがない漫画を探して、読んでおくこと"
    ], correctIndex: 2 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "28",
    context: PASSAGE_R5_1,
    sentence: "このときの私は、どのような状態だったか。",
    options: [
      "ほかの試験の勉強がしたいのに、漫画を読まなければならなかった。",
      "漫画が読みたいのに、試験の勉強をしなければならなかった。",
      "好きな漫画が読みたいのに、好きではない漫画を読まなければならなかった。",
      "試験の勉強をしなければならないのに、漫画を読むのを我慢できなかった。"
    ], correctIndex: 0 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "29",
    context: PASSAGE_R5_1,
    sentence: "「私」は今、どんな気持ちになっているか。",
    options: [
      "しばらくは、休みの日だけに漫画を読もう。",
      "しばらくは、好きな漫画しか読みたくない。",
      "しばらくは、我慢して漫画を読もう。",
      "しばらくは、漫画は読みたくない。"
    ], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "30",
    context: PASSAGE_R5_2,
    sentence: "A町にある店の主人たちは、何のために朝市を始めたのか。",
    options: [
      "町の中に、安く買い物ができるところを増やすため",
      "町の中に、近くの市や町から来る客が楽しめる場所を作るため",
      "自分たちの町の景色の美しさをもっと宣伝するため",
      "自分たちの店の商品の良さをもっと知ってもらうため"
    ], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "31",
    context: PASSAGE_R5_2,
    sentence: "それとあるが、何か。",
    options: [
      "朝市で人気がある商品を、店で売るより高く売ること",
      "朝市で人気がある商品を、朝市でもっと売ること",
      "朝市でしか買えない商品の種類を増やすこと",
      "朝市でしか買えない商品を平日に店でも売ること"
    ], correctIndex: 1 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "32",
    context: PASSAGE_R5_2,
    sentence: "（　）に入れるのに最もよいものはどれか。",
    options: [
      "A町に店がある人",
      "A町以外の市や町に店がある人",
      "A町で店を開きたいと思っている人",
      "A町の店でふだんから買い物をしている人"
    ], correctIndex: 0 },

  // ── 読解 問題6 長文読解 (q11, 4問) ─────────────────────────────────────
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "33",
    context: PASSAGE_R6,
    sentence: "「私」がオートバイに①長い間乗っていなかったのは、どうしてか。",
    options: [
      "買いたいと思うオートバイがなかったから",
      "仕事や子供の世話で忙しかったから",
      "「私」のオートバイを妻が使っていたから",
      "家にあるオートバイが壊れていたから"
    ], correctIndex: 1 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "34",
    context: PASSAGE_R6,
    sentence: "②オートバイの部品が壊れていたとあるが、壊れたのはいつか。",
    options: [
      "先月、新しいオートバイを買ってから3日目の朝",
      "先月、オートバイ旅行を始めてから3日目の朝",
      "20年前、新しいオートバイを買ってから3日目の朝",
      "20年前、オートバイ旅行を始めてから3日目の朝"
    ], correctIndex: 3 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "35",
    context: PASSAGE_R6,
    sentence: "③何度もお礼を言いながらとあるが、「私」はどうして何度もお礼を言ったのか。",
    options: [
      "店にあった新しいオートバイを安く売ってくれたから",
      "オートバイを修理してくれそうな店を教えてくれたから",
      "壊れて動かなくなりそうなオートバイを買ってくれたから",
      "ほかの店で修理を断られたオートバイを直してくれたから"
    ], correctIndex: 3 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "36",
    context: PASSAGE_R6,
    sentence: "④満足しているとあるが、なぜか。",
    options: [
      "もう一度、オートバイに乗ることができたから",
      "「ガロン」でオートバイを買うことができたから",
      "壊れてしまったオートバイを修理してもらうことができたから",
      "オートバイの修理をしてくれた店員に、お礼を伝えることができたから"
    ], correctIndex: 1 },

  // ── 読解 問題7 情報検索 (q12, 2問) ─────────────────────────────────────
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "37",
    context: PASSAGE_R7,
    sentence: "スミスさんは、2月2日の午後に普通コースを受けたいと思っている。スミスさんは、どのように申し込みをしなければならないか。",
    options: [
      "2月2日の午前9時までに、電話か窓口で申し込む。",
      "2月2日の午前9時30分までに、窓口で申し込む。",
      "2月2日の午後1時30分までに、窓口で申し込む。",
      "2月2日の午後1時30分までに、電話か窓口で申し込む。"
    ], correctIndex: 2 },
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "38",
    context: PASSAGE_R7,
    sentence: "グエンさんは、友達4人と特別コースを受けたいと思っている。グエンさんたちは、朝山ホテルに泊まっている。午後2時から4時まで特別コースを受ける場合、グエンさんたちはいくら支払わなければならないか。",
    options: [
      "22,000円を支払う。",
      "22,000円から2,000円を引いたものを支払う。",
      "39,000円を支払う。",
      "39,000円から2,000円を引いたものを支払う。"
    ], correctIndex: 1 },

  // ── 聴解 問題1 課題理解 (lq1, 6問) ─────────────────────────────────────
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "1",  sentence: "聴解 問題1 — 第1問", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "2",  sentence: "聴解 問題1 — 第2問", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "3",  sentence: "聴解 問題1 — 第3問", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "4",  sentence: "聴解 問題1 — 第4問", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "5",  sentence: "聴解 問題1 — 第5問", options: ["1","2","3","4"], correctIndex: 0 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "6",  sentence: "聴解 問題1 — 第6問", options: ["1","2","3","4"], correctIndex: 1 },

  // ── 聴解 問題2 ポイント理解 (lq2, 6問) ──────────────────────────────────
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "1",  sentence: "聴解 問題2 — 第1問", options: ["1","2","3","4"], correctIndex: 0 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "2",  sentence: "聴解 問題2 — 第2問", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "3",  sentence: "聴解 問題2 — 第3問", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "4",  sentence: "聴解 問題2 — 第4問", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "5",  sentence: "聴解 問題2 — 第5問", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "6",  sentence: "聴解 問題2 — 第6問", options: ["1","2","3","4"], correctIndex: 3 },

  // ── 聴解 問題3 概要理解 (lq3, 3問) ──────────────────────────────────────
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "1",  sentence: "聴解 問題3 — 第1問", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "2",  sentence: "聴解 問題3 — 第2問", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "3",  sentence: "聴解 問題3 — 第3問", options: ["1","2","3","4"], correctIndex: 2 },

  // ── 聴解 問題4 発話表現 (lq4, 4問) ──────────────────────────────────────
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "1",  sentence: "聴解 問題4 — 第1問", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "2",  sentence: "聴解 問題4 — 第2問", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "3",  sentence: "聴解 問題4 — 第3問", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "4",  sentence: "聴解 問題4 — 第4問", options: ["1","2","3"], correctIndex: 2 },

  // ── 聴解 問題5 即時応答 (lq5, 9問) ──────────────────────────────────────
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "1",  sentence: "聴解 問題5 — 第1問", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "2",  sentence: "聴解 問題5 — 第2問", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "3",  sentence: "聴解 問題5 — 第3問", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "4",  sentence: "聴解 問題5 — 第4問", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "5",  sentence: "聴解 問題5 — 第5問", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "6",  sentence: "聴解 問題5 — 第6問", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "7",  sentence: "聴解 問題5 — 第7問", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "8",  sentence: "聴解 問題5 — 第8問", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "9",  sentence: "聴解 問題5 — 第9問", options: ["1","2","3"], correctIndex: 0 },
]

export const N3_12_2023_COUNTS = { vocab: 35, grammar: 38, listening: 28, total: 101 }

const explanations = _explanations as Record<string, string>
export const N3_12_2023_QUESTIONS: StaticQuestion[] = _RAW.map(q => {
  const key = `${q.groupId}:${q.display}`
  return { ...q, explanation: explanations[key] ?? undefined, script: explanations[`${key}:script`] ?? undefined }
})
