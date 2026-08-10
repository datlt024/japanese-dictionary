// 2023年7月 日本語能力試験 N3 — 言語知識（文字・語彙・文法）・読解・聴解
// Explanations are stored in ./explanations/n3-7-2023.json and merged at export time.

import _explanations from "./explanations/n3-7-2023.json"

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
<p style="text-align:center;font-weight:700;margin:0 0 4px;">仲間からのメッセージ</p>
<p style="text-align:right;font-size:13px;color:#6b7280;margin:0 0 12px;">ブイ　フォ　テュエン</p>
<p style="margin:0 0 10px;">　日本に来てから２年間、私は大学の近くのレストランでアルバイトをしていました。店の人はみんな親切で、仕事で使う日本語がわからなくて私が困っていると、いつも優しく教えてくれました。大変なときもありましたが、みんなが助けてくれたので、続けることができました。</p>
<p style="margin:0 0 10px;">　<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">19</span>今学期から勉強が忙しくなって、先月アルバイトを辞めました。アルバイトの最終日に、店長から大きなカードをもらいました。店長は、店の仲間全員がメッセージを書いたと教えてくれました。カードに<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">20</span>のは、たくさんの感謝の言葉や応援の言葉でした。私はうれしくて、カードのメッセージを読みながら泣いてしまいました。</p>
<p style="margin:0;">　もらったカードは部屋に飾って、<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">21</span>に行く前に必ず見ています。頑張って働いた２年間が目に見えるものになった感じがして、カードを見ると、元気が出ます。どんなに勉強が大変になっても、<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">22</span>。</p>
</div>`

const PASSAGE_R4_1 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">これは、あるホテルにチェックインした人が、フロントでもらったちらしである。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="text-align:center;font-size:12px;margin:0 0 4px;">８月11日・12日にホテル岩中にお泊まりのお客様</p>
<p style="text-align:center;font-weight:700;font-size:15px;margin:0 0 10px;">「岩中村夏祭り」のご案内</p>
<p style="margin:0 0 8px;">　８月11日（土）・12日（日）に、岩中公園で夏祭りが行われます。</p>
<p style="margin:0 0 8px;">　会場とホテルの間は、ホテルのバスのご利用が可能です（約５分）。</p>
<p style="margin:0 0 8px;">　浴衣を着ている方は、会場内のどの店でもドリンクが１杯無料になります。皆様も、浴衣を着て出かけてみてはいかがでしょうか。</p>
<p style="margin:0 0 8px;">　ホテルでは、お好きな浴衣と帯を特別料金【１日２,０００円】でお貸しします（浴衣の着方がわからない方は、お手伝いいたします）。</p>
<p style="margin:0 0 4px;">　ご希望の方は、フロントでお申し込みください。</p>
<p style="text-align:right;font-size:13px;margin:0;">ホテル岩中</p>
</div>`

const PASSAGE_R4_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0;">　先月、留学していたアメリカから帰国した。そして、知り合いに頼まれ、４月から大学で数学を教えることになった。働き始める前に、実家の部屋を整理しようと思って掃除をしていたら、小学生のときに書いた「私の夢」という作文が出てきた。そこには、先生になりたいと書いてあった。そんなことはすっかり忘れていたが、小さいときにそう書いていたのだ。とても驚いたが、子供のころの夢が本当になったのだし、<u>頑張ろう</u>と思う。</p>
</div>`

const PASSAGE_R4_3 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">これはある日本語学校から学生に届いたメールである。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">　学校がもらった招待券の試合は今週末です。</p>
<p style="margin:0 0 2px;">日時：２月27日（土）　開場13時　試合開始14時</p>
<p style="margin:0 0 8px;">場所：春山公園野球場</p>
<p style="margin:0 0 8px;">　まだ招待券を受け取っていない人は、26日（金）までに事務室に取りに来てください。</p>
<p style="margin:0 0 8px;">　自分だけで行くのが不安だと言う人がいたので、中川先生が一緒に行くことになりました。一緒に行きたい人は、12時に学校に集合してください。その場合、招待券は当日、中川先生からもらってもいいです。</p>
<p style="margin:0 0 8px;">　自分で行く人は、学校にも野球場にも集合する必要はありません。</p>
<p style="margin:0 0 4px;">　寒いですから、暖かい服装で行きましょう。</p>
<p style="text-align:right;font-size:13px;margin:0;">川野日本語学校</p>
</div>`

const PASSAGE_R4_4 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0;">　面白い実験を行った研究者がいる。その実験では、ある魚の顔に汚れをつけて鏡を見せた。すると、その魚は砂で汚れを落とすような動きをしてから、また鏡を見た。これは、自分の顔についた汚れを落とし、その後、汚れが消えたかどうかを確認する動作なのだそうだ。鏡の中にいる自分を見て、それが自分自身だとわかるのは、サルなどの頭のいい動物だけだと考えられていた。しかし、魚にもそれができるものがいるのだと、この研究者は言っている。</p>
</div>`

const PASSAGE_R5_1 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　最近、私と同じ70歳の友人が、自宅の車庫の壁に車をぶつけてしまったそうだ。私は運転に自信があったが、その話を聞いて、安全に運転が続けられるか不安になってきた。それで、<u>①運転をやめることにして</u>、車を売った。</p>
<p style="margin:0 0 10px;">　ただ、一つ<u>②困ったこと</u>があった。私は妻と二人で丘の上の家に住んでいる。毎日の買い物はこれまでと変わらず、二人で坂の下のスーパーまで行く。初めは、運動にもなるし、スーパーまで歩けばいいと考えていた。しかし、車を使わず荷物を持って坂を上がって帰るのは、思ったより大変だったのだ。</p>
<p style="margin:0 0 10px;">　引っ越そうかと話すようになったとき、近所にスーパーの車がとまっているのを見た。インターネットで注文すると、店の商品は何でも届けてくれるそうだ。直接見て選べないので不安もあったが、まずは、肉と野菜を注文してみた。</p>
<p style="margin:0;">　翌日届いた品物はどれもとても良かった。配達料はかかるが、便利さのほうが重要だ。いい方法が見つかった。これで引っ越しをしなくてもよさそうである。</p>
</div>`

const PASSAGE_R5_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　日本では、音楽を聞きに行ったり、絵や映画を見に行ったりすることが好きな人でも、子供が小さいうちは、<u>①行くのを我慢してしまうことがあります</u>。子供は、騒いでしまう心配があるので連れて行けないし、人に預けることも簡単ではないからです。</p>
<p style="margin:0 0 10px;">　しかし、最近は少しずつですが、子供を預かってくれる音楽会場や美術館、映画館などが増えてきました。また、<u>②親子が楽しめるように工夫をする</u>ところも出てきています。例えば、ある映画館では、映画の間も会場を少し明るくしておくそうです。暗いと、怖がって泣いてしまう子供がいるからです。大きな音を聞くと、びっくりする子供もいるので、音も大きすぎないようにしてあります。</p>
<p style="margin:0;">　このように、最近は、小さな子供がいる人が安心して、出かけて楽しめる場所が増えてきています。</p>
</div>`

const PASSAGE_R6 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　１年に２万通も感謝の手紙がくる会社がある。</p>
<p style="margin:0 0 10px;">　四国にある<u>①靴の会社</u>だ。初めはスリッパを作っていたのだが、数年前、お年寄りのための介護施設<sup>（注）</sup>の経営者から、こんな相談をされた。</p>
<p style="margin:0 0 8px;">　「施設内でお年寄りがよく転ぶので、困っているんです。いろいろ工夫しても解決できません。靴に問題がありそうなんです。」</p>
<p style="margin:0 0 10px;">　それで、お年寄りのための安全な靴を作ることにしたそうだ。社長はまず、約500人のお年寄りの足を観察して、歩き方を調査することにした。そうして作った靴を履いてもらい、意見を聞きながら悪いところを直していった。２年後、「お年寄りのための靴」が完成したが、初めはあまり売れなかった。</p>
<p style="margin:0 0 10px;">　そこで、<u>②調査結果をもう一度確認することにした</u>。すると、あることがわかった。お年寄りの中には年をとって片方の足だけが悪くなったり、足の形が変わってしまい左右の足の大きさが違ってきたりして、困っている人が少なくない。左右のセットではなく、片方の靴だけが必要な人もいるのだ。そこで、「お年寄りのための靴」を片方でも買えるようにした。</p>
<p style="margin:0 0 10px;">　靴の会社を経営しているある先輩からは、<u>③そんなことをしたら</u>経営がうまくいかなくなると反対されたが、社長はこの新しい販売方法を実行した。困っている人の問題を解決するためにいいものを作り、今までの靴の売り方とは全く違った売り方で、それが必要な人のところに届けようとしたのである。</p>
<p style="margin:0 0 10px;">　今では、この靴は１年に18万足以上も売れている。２万通も感謝の手紙がくるのは、<u>④このような会社</u>の姿勢があるからではないだろうか。</p>
<p style="font-size:12px;color:#6b7280;margin:0;">（注）介護施設：お年寄りが世話を受けながら生活する場所</p>
</div>`

const PASSAGE_R7 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.8;">
<p style="text-align:center;font-weight:700;font-size:15px;margin:0 0 2px;">丸川大学</p>
<p style="text-align:center;font-weight:700;font-size:16px;margin:0 0 10px;">食堂・カフェのご案内</p>
<table style="width:100%;border-collapse:collapse;margin-bottom:10px;font-size:13px;">
<tr>
<td style="border:1px solid #9ca3af;padding:8px;vertical-align:top;width:50%;">
<p style="font-weight:700;margin:0 0 3px;">①丸川食堂（300席）</p>
<p style="margin:0 0 1px;">平日　11時〜15時</p>
<p style="margin:0 0 1px;">土・日　11時〜14時</p>
<p style="margin:0;color:#374151;">大きくて、メニューが多い食堂です</p>
</td>
<td style="border:1px solid #9ca3af;padding:8px;vertical-align:top;width:50%;">
<p style="font-weight:700;margin:0 0 3px;">②朝花食堂（100席）</p>
<p style="margin:0 0 1px;">平日　8時〜15時</p>
<p style="margin:0 0 1px;">土・日　8時〜14時</p>
<p style="margin:0;color:#374151;">大学でいちばん新しい食堂です</p>
</td>
</tr>
<tr>
<td style="border:1px solid #9ca3af;padding:8px;vertical-align:top;">
<p style="font-weight:700;margin:0 0 3px;">③カフェ南川（60席）</p>
<p style="margin:0 0 1px;">平日　8時〜19時</p>
<p style="margin:0 0 1px;">土・日　8時〜14時</p>
<p style="margin:0;color:#374151;">南川カレーが人気です</p>
</td>
<td style="border:1px solid #9ca3af;padding:8px;vertical-align:top;">
<p style="font-weight:700;margin:0 0 3px;">④花丸食堂（50席）</p>
<p style="margin:0 0 1px;">平日　11時〜20時</p>
<p style="margin:0 0 1px;">土・日　11時〜14時</p>
<p style="margin:0;color:#374151;">教師や大学で働く関係者のための食堂です　学生は利用できません</p>
</td>
</tr>
</table>
<p style="font-size:12px;margin:0 0 2px;">※大学の休暇期間中の営業について</p>
<p style="font-size:12px;margin:0 0 8px;">　①と②は休み、③と④は平日11時〜14時に営業します。</p>
<p style="font-weight:700;text-align:center;margin:0 0 6px;">【パーティーについて】</p>
<p style="font-size:13px;margin:0 0 4px;">丸川大学の学生や関係者の皆様は、食堂・カフェの営業がない日や時間にパーティーを開くことができます。</p>
<p style="font-size:12px;margin:0 0 6px;">※①〜③は学生が申し込みますが、④は教師か事務所の人の申し込みが必要です。</p>
<p style="font-weight:700;font-size:13px;margin:0 0 2px;">▶料理について</p>
<p style="font-size:13px;margin:0 0 1px;">●メニューは相談して決められます。</p>
<p style="font-size:13px;margin:0 0 6px;">●①〜③では一人2000円以上（土曜、日曜、祝日は、2,500円以上）、④では一人4000円以上の注文で予約受付をします。</p>
<p style="font-weight:700;font-size:13px;margin:0 0 2px;">▶人数</p>
<p style="font-size:13px;margin:0 0 1px;">●①は18人、②は40人、③と④は20人から予約受付をします。</p>
<p style="font-size:13px;margin:0 0 6px;">●最大の人数は、各食堂・カフェの席の数と同じです。</p>
<p style="font-weight:700;font-size:13px;margin:0 0 2px;">▶時間</p>
<p style="font-size:13px;margin:0 0 1px;">●①〜③は20時まで、④は21時までに終えてください。</p>
<p style="font-size:13px;margin:0 0 6px;">●営業がある日は、各営業終了時間の１時間後からパーティーに利用できます。</p>
<p style="font-weight:700;font-size:13px;margin:0 0 2px;">▶予約連絡先</p>
<p style="font-size:13px;margin:0;">●パーティー係　（190−234−5678）</p>
</div>`

// ─── Questions ───────────────────────────────────────────────────────────────

const _RAW: Omit<StaticQuestion, "explanation">[] = [
  // ── 問題1 漢字の読み方 (q1, 8問) ────────────────────────────────────────
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "復習",  sentence: "毎日[復習]したので、よくできるようになった。",        options: ["ふうしゅう","れんしゅう","ふくしゅう","れいしゅう"], correctIndex: 2 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "小型",  sentence: "[小型]のラジオが欲しいです。",                        options: ["こかた","しょうがた","こがた","しょうかた"],         correctIndex: 2 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "疑って", sentence: "理由もないのに、人を[疑って]はいけない。",               options: ["きらって","こわがって","しかって","うたがって"],     correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "細く",  sentence: "ここから先は道が[細く]なっている。",                  options: ["ひろく","ふとく","せまく","ほそく"],                 correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "退院",  sentence: "川井さんは明日、[退院]するそうです。",                 options: ["たいいん","たんいん","だいいん","だんいん"],         correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "夫婦",  sentence: "パーティーには[夫婦]で参加します。",                   options: ["ふうふう","ふうふ","ふふう","ふふ"],                 correctIndex: 1 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "留守",  sentence: "[留守]の間に誰か来たようだ。",                        options: ["るしゅ","るす","りゅうす","りゅうしゅ"],             correctIndex: 1 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "高価",  sentence: "これは、とても[高価]な花瓶だそうです。",               options: ["こうか","ごうか","こうが","ごうが"],                 correctIndex: 0 },

  // ── 問題2 漢字の書き方 (q2, 6問) ────────────────────────────────────────
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "たんき",   sentence: "彼は[たんき]だ。",                                  options: ["男気","単気","短気","断気"],     correctIndex: 2 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "しんぱい", sentence: "上田さんは少し[しんぱい]しているようだ。",            options: ["心酔","心配","信配","信酔"],     correctIndex: 1 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "やいて",   sentence: "次はこれを[やいて]ください。",                       options: ["焼いて","燃いて","煙いて","炊いて"], correctIndex: 0 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "かならず", sentence: "明日、[かならず]来てください。",                     options: ["確ず","要ず","必ず","直ず"],     correctIndex: 2 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "せいふく", sentence: "私の学校は[せいふく]がありません。",                 options: ["清衣","制衣","清服","制服"],     correctIndex: 3 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "やっきょく", sentence: "探していた[やっきょく]が、やっと見つかりました。", options: ["薬局","薬曲","楽局","楽曲"],     correctIndex: 0 },

  // ── 問題3 文脈規定 (q3, 11問) ────────────────────────────────────────────
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "15", sentence: "雨が降ってきましたが、私の家は近いので、傘がなくても（　）です。",         options: ["平気","安全","正常","十分"],                                 correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "16", sentence: "仕事で疲れているときは、夕飯を作るのが（　）ので、外食することが多い。",   options: ["だらしない","めんどうくさい","くわしい","にくらしい"],       correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "17", sentence: "ゆうべはほとんど寝ていないので、今日は眠くて何度も（　）が出てしまう。",   options: ["しゃっくり","くしゃみ","せき","あくび"],                     correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "18", sentence: "「私の国の社会問題」という（　）で、レポートを書くことになった。",         options: ["デザイン","テーマ","サイン","ルール"],                       correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "19", sentence: "この季節は、昼と夜の気温の（　）が大きい。",                               options: ["台","段","差","列"],                                         correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "20", sentence: "（　）して、鍵をかけないで家を出てしまった。",                             options: ["はっきり","しっかり","ぴったり","うっかり"],                 correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "21", sentence: "まだ空席が少しあるので、今なら予約は（　）です。",                         options: ["完全","無駄","可能","平等"],                                 correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "22", sentence: "私のパソコンは古いので、（　）が遅いです。",                               options: ["行動","活動","動作","運動"],                                 correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "23", sentence: "来週の説明会は、今日の12時が申し込みの（　）だ。",                        options: ["期限","期間","日程","日常"],                                 correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "24", sentence: "外国で生活するのは楽しいが、ときどき国の料理が（　）なる。",               options: ["恋しく","親しく","苦しく","貧しく"],                         correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "25", sentence: "夫とは、３年間（　）から結婚しました。",                                   options: ["取り囲んで","引き受けて","思いついて","付き合って"],         correctIndex: 3 },

  // ── 問題4 言い換え類義 (q4, 5問) ────────────────────────────────────────
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "26", sentence: "その部屋にある家具の[サイズ]を聞いてきてください。",   options: ["重さ","数","形","大きさ"],                                                         correctIndex: 3 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "27", sentence: "この部分を[暗記]してください。",                         options: ["読んで","書いて","覚えて","教えて"],                                               correctIndex: 2 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "28", sentence: "伊藤さんは魚を料理するのが[得意な]ようだ。",            options: ["あまり好きじゃない","あまり上手じゃない","とても好きな","とても上手な"],         correctIndex: 3 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "29", sentence: "誰にでも[欠点]はあると思う。",                          options: ["つまらないところ","よくないところ","間違えるところ","忘れるところ"],             correctIndex: 1 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "30", sentence: "そんなに[どならないで]ください。",                      options: ["大声で怒らないで","強く押さないで","たくさん食べないで","早く歩かないで"],       correctIndex: 0 },

  // ── 問題5 用法 (q5, 5問) ─────────────────────────────────────────────────
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "31", sentence: "問題5: [進歩]の使い方として最もよいものを選びなさい。",
    options: [
      "この会社は社長が一人で始めたが今は大きな会社に進歩した。",
      "技術が進歩して、人々の生活は便利になった。",
      "病気が治って、食欲もだんだん進歩してきた。",
      "アパートの家賃が進歩して、来年から5,000円高くなるそうだ。"
    ], correctIndex: 1 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "32", sentence: "問題5: [話しかける]の使い方として最もよいものを選びなさい。",
    options: [
      "昨日、駅で観光客に英語で話しかけられた。",
      "次の旅行の行き先は、家族と話しかけて決めようと思う。",
      "名前を話しかけるので、呼ばれた人は手を挙げてください。",
      "先輩にお土産をあげて、お礼を話しかけられました。"
    ], correctIndex: 0 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "33", sentence: "問題5: [交流]の使い方として最もよいものを選びなさい。",
    options: [
      "二つの色が交流して、きれいなピンク色になりました。",
      "このドレッシングは、野菜と交流するとおいしいですね。",
      "息子の学校は、海外の人たちと交流する機会が多いようだ。",
      "この引き出しには、兄の物と私の物が交流している。"
    ], correctIndex: 2 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "34", sentence: "問題5: [渋滞]の使い方として最もよいものを選びなさい。",
    options: [
      "新しい家の工事が渋滞していて、なかなか引っ越せない。",
      "事故で道が渋滞していたので、遅刻してしまった。",
      "最近仕事が忙しくて、ストレスが渋滞している。",
      "この商品はあまり売れないので、倉庫の中で渋滞している。"
    ], correctIndex: 1 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "35", sentence: "問題5: [にこにこ]の使い方として最もよいものを選びなさい。",
    options: [
      "ガソリンが少なくなって、車が途中で止まりそうでにこにこした。",
      "大勢の前で歌ったとき、緊張して胸がにこにこした。",
      "昨日から具合が悪くて、今朝も頭が少しにこにこしているい。",
      "遊んでいる私たちを見て、祖母はうれしそうにこにこしていた。"
    ], correctIndex: 3 },

  // ── 文法 問題1 文の文法（空欄補充）(q6, 13問) ──────────────────────────
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "1",
    sentence: "歌手の青山ケイは、海外でも人気があり、アジア（　）中心にいろいろな国でコンサートを行っている。",
    options: ["が","で","の","を"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "2",
    sentence: "南中学校で、読書の習慣について調査が行われた。調査の結果を見ると、学年が上がる（　）生徒の読書時間が減っていることがわかる。",
    options: ["ことから","としたら","にしたがって","のに比べて"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "3",
    sentence: "友達に誘われて、夏休みに二人で海外旅行に行くことになった。海外旅行は今まで家族（　）行ったことがないので、楽しみだ。",
    options: ["だけで","だけが","となら","としか"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "4",
    sentence: "（不動産屋で）\n店員「こちらのアパートはいかがですか。駅から歩いて15分なんですが、広くてきれいですよ。」\n客「ああ、部屋はよさそうなんですが、ちょっと駅から遠いですね。（　）もう少し近いところがいいんですが……。」",
    options: ["できれば","別に","せっかく","確かに"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "5",
    sentence: "散歩中、急に雨が（　）だしたので、慌てて近くの喫茶店に入った。",
    options: ["降る","降り","降って","降った"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "6",
    sentence: "（病院の受付で）\n受付の人「お名前が（　）、診察室の前でお待ちください。」",
    options: ["呼ぶと","呼ぶまで","呼ばれると","呼ばれるまで"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "7",
    sentence: "今朝は電車が遅れた（　）、会社に遅刻してしまった。",
    options: ["間に","点で","たびに","せいで"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "8",
    sentence: "明日の授業までにテキストを30ページまで（　）のに、まだ全然読んでいない。",
    options: ["読んでおいてはいけない","読んでおかなければならない","読むことにしてはいけない","読むことにしなければならない"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "9",
    sentence: "昨日の夜は風の音が気になって、少しも（　）。",
    options: ["眠りたかった","眠ろうとした","眠れなかった","眠らなくなった"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "10",
    sentence: "私の夢は、いつか自分のケーキ屋を（　）。",
    options: ["開くと思う","開きたいと思う","開くことだ","開きたいことだ"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "11",
    sentence: "妻「雨、全然（　）ね。今日は出かけるのやめようか。」\n夫「そうだね。」",
    options: ["やまないはずがない","やみそうにない","やむに違いない","やんでもしかたない"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "12",
    sentence: "（大学で）\nA「先輩に聞いたんだけど、今度、駅前に新しいカフェが（　）よ。」\nB「そんなんだ。楽しみだね。」",
    options: ["できるらしい","できてほしい","できることがある","できたほうがいい"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "13",
    sentence: "（美容院で）\n店員「長さは、このぐらいでいいですか。」\n客「もう少し短く（　）。」\n店員「はい、わかりました。」",
    options: ["してあげますか","なってあげますか","してもらえますか","なってもらえますか"], correctIndex: 2 },

  // ── 文法 問題2 文の文法★（並べ替え）(q7, 5問) ─────────────────────────
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "14",
    sentence: "パソコンや携帯電話の　＿＿＿　＿＿＿　[★]　＿＿＿　原因で、頭が痛くなることもあるそうだ。",
    options: ["が","による","見すぎ","目の疲れ"], correctIndex: 3 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "15",
    sentence: "私は子供のとき、ピアノを習っていたが、3年でやめてしまった。何回　＿＿＿　＿＿＿　[★]　＿＿＿　嫌になってしまったのだ。",
    options: ["上手に弾けない","練習しても","なかなか","曲があって"], correctIndex: 0 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "16",
    sentence: "失敗をすることは誰にでもある。大切な　＿＿＿　＿＿＿　[★]　＿＿＿　考えて、同じ失敗を繰り返さないようにすることだ。",
    options: ["失敗をしてしまった","どうして","のか","のは"], correctIndex: 0 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "17",
    sentence: "（教室で）\n南「西川さんの誕生日に、何かプレゼントをあげない?」\n森「いいね。スポーツが好きだと言っていた　＿＿＿　＿＿＿　[★]　＿＿＿　?」",
    options: ["いいんじゃない","から","とか","タオル"], correctIndex: 2 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "18",
    sentence: "（講演会で）\n司会者「本日は、鳥の　＿＿＿　＿＿＿　[★]　＿＿＿　見ることができる様々な鳥について、お話をしていただきます。」",
    options: ["専門家で","都会で","いらっしゃる","花子先生に"], correctIndex: 3 },

  // ── 文法 問題3 文章の文法 (q8, 4問) ────────────────────────────────────
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "19",
    context: PASSAGE_G3,
    sentence: "（19）今学期から勉強が忙しくなって",
    options: ["でも","だから","すると","そのうえ"], correctIndex: 0 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "20",
    context: PASSAGE_G3,
    sentence: "カードに（20）のは、たくさんの感謝の言葉や応援の言葉でした。",
    options: ["書いておいた","書きたかった","書かれていた","書いてほしかった"], correctIndex: 2 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "21",
    context: PASSAGE_G3,
    sentence: "（21）に行く前に必ず見ています。",
    options: ["そこ","大学","その大学","そういうところ"], correctIndex: 1 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "22",
    context: PASSAGE_G3,
    sentence: "どんなに勉強が大変になっても、（22）。",
    options: ["頑張っているのです","頑張ることができるからです","頑張っているみたいです","頑張ることができそうです"], correctIndex: 1 },

  // ── 読解 問題4 短文読解 (q9, 4問) ──────────────────────────────────────
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "23",
    context: PASSAGE_R4_1,
    sentence: "夏祭りの日にホテル岩中に泊まっている人が、ホテルから受けられるサービスとして合っているのはどれか。",
    options: [
      "浴衣を着れば、夏祭り会場まで、ホテルのバスが利用できる。",
      "ホテルのレストランで、ドリンクが１杯無料で飲める。",
      "ホテルから、好きな浴衣と帯が特別料金で借りられる。",
      "浴衣と帯の料金のほかに、2,000円払えば、ホテルの人に着るのを手伝ってもらえる。"
    ], correctIndex: 2 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "24",
    context: PASSAGE_R4_2,
    sentence: "頑張ろうとあるが、どうしてそう思ったのか。",
    options: [
      "自分でも忘れていた、アメリカに留学したいという夢が本当になったから。",
      "自分でも忘れていた、先生になりたいという夢が本当になったから。",
      "子供のころからずっと行きたいと思い続けていたアメリカに留学できたから。",
      "子供のころからずっとなりたいと思い続けていた先生になれたから。"
    ], correctIndex: 1 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "25",
    context: PASSAGE_R4_3,
    sentence: "このメールによると、自分で野球場に行こうと思っている学生が、必ずしなければならないことは何か。",
    options: [
      "26日までに学校で招待券を受け取っておく。",
      "26日までに学校で招待券を受け取って、当日、13時に野球場の前に集合する。",
      "当日、12時に学校に行って、招待券を中川先生から受け取る。",
      "当日、13時に野球場に行って、招待券を中川先生から受け取る。"
    ], correctIndex: 0 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "26",
    context: PASSAGE_R4_4,
    sentence: "この実験から、魚の中には、どのようなものがいることがわかったか。",
    options: [
      "鏡を見て、自分に汚れをつけるものがいる。",
      "鏡の中の魚が自分だとわかるものがいる。",
      "鏡に気づくと、すぐに鏡の前に行きたがるものがいる。",
      "鏡が汚れていたら、きれいにしようとするものがいる。"
    ], correctIndex: 1 },

  // ── 読解 問題5 中文読解 (q10, 6問) ─────────────────────────────────────
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "27",
    context: PASSAGE_R5_1,
    sentence: "①運転をやめることにしてとあるが、それはなぜか。",
    options: [
      "運転に自信があったのに、車をぶつけてしまったから。",
      "自分も安全に運転が続けられるか心配になったから。",
      "若いころから自分の運転技術に不安があったから。",
      "車の運転をやめたほうがいいと妻に言われたから。"
    ], correctIndex: 1 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "28",
    context: PASSAGE_R5_1,
    sentence: "②困ったこととあるが、どんなことか。",
    options: [
      "毎日、妻と二人でスーパーに買い物に行かなければならなくなったこと。",
      "今までより遠くのスーパーまで、買い物に行かなければならなくなったこと。",
      "スーパーに行くとき、ついでにしていた運動ができなくなり、運動不足になったこと。",
      "スーパーで買った物を歩いて持って帰ってくるのが、予想ほど楽ではなかったこと。"
    ], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "29",
    context: PASSAGE_R5_1,
    sentence: "スーパーのサービスを利用して、「私」は今、引っ越しについてどう考えているか。",
    options: [
      "買った商品を持って帰るのが大変なので、スーパーの近くに引っ越したほうがいいかもしれない。",
      "買った商品を届けてもらうと配達料がかかるので、スーパーの近くに引っ越したほうがいいかもしれない。",
      "届けてもらった商品に満足したし、今後はこのサービスを利用すれば、引っ越す必要はない。",
      "届けてもらった商品の中には満足できないものもあったが、このサービスを利用すれば、引っ越す必要はないだろう。"
    ], correctIndex: 2 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "30",
    context: PASSAGE_R5_2,
    sentence: "①行くのを我慢してしまうことがありますとあるが、どうしてか。",
    options: [
      "音楽や絵や映画などを楽しめる場所が、近くにないことが多いから。",
      "子供の世話をするのに忙しくて、時間がないから。",
      "子供を連れて行くのも、親だけで出かけるのも難しいから。",
      "大人だけでなく、子供の料金も払わなければならないから。"
    ], correctIndex: 2 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "31",
    context: PASSAGE_R5_2,
    sentence: "②親子が楽しめるように工夫をするとあるが、どのようなことをしている映画館があると言っているか。",
    options: [
      "子供と親が話しながら映画が見られる特別な席を用意する。",
      "子供が騒ぐ音が気にならないように、映画の音を大きくする。",
      "子供にも大人にも楽しんで見てもらえるような映画を選ぶ。",
      "子供が怖がったり驚いたりしないような明るさや音量にする。"
    ], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "32",
    context: PASSAGE_R5_2,
    sentence: "この文章のテーマは何か。",
    options: [
      "日本で、子供がいる親も音楽や映画を楽しめる環境ができてきたこと。",
      "日本で、大人と子供が一緒に楽しめる音楽や映画が減ってきたこと。",
      "日本で、大人だけで音楽会や映画に出かける親が増えてきたこと。",
      "日本で、音楽や映画を楽しむ子供が増えてきたこと。"
    ], correctIndex: 0 },

  // ── 読解 問題6 長文読解 (q11, 4問) ─────────────────────────────────────
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "33",
    context: PASSAGE_R6,
    sentence: "①靴の会社は、どうしてお年寄りのための靴を作ることにしたか。",
    options: [
      "お年寄りから、いい靴を作ってほしいという手紙がたくさんきたから。",
      "お年寄りが室内でスリッパを履かなくなり、靴を履くようになったから。",
      "お年寄りのための介護施設の経営者から、靴について相談されたから。",
      "お年寄りの歩き方を調査して、靴の問題点を見つけたから。"
    ], correctIndex: 2 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "34",
    context: PASSAGE_R6,
    sentence: "②調査結果をもう一度確認することにしたとあるが、その結果、例えばどんなことがわかったか。",
    options: [
      "お年寄りには、転びやすい人がいること。",
      "お年寄りには、靴の値段が高いと思っている人がいること。",
      "お年寄りになると、靴を履く機会が減る人がいること。",
      "お年寄りになると、右と左で足の形が変わる人がいること。"
    ], correctIndex: 3 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "35",
    context: PASSAGE_R6,
    sentence: "③そんなこととあるが、それは何か。",
    options: [
      "調査にお金をかけること。",
      "左右の大きさが同じ靴だけを売ること。",
      "「お年寄りのための靴」だけを作ること。",
      "片方ずつでも靴を売ること。"
    ], correctIndex: 3 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "36",
    context: PASSAGE_R6,
    sentence: "④このような会社とあるが、どのようなものか。",
    options: [
      "困っている人のことを一生懸命考えて、商品を作って売ること。",
      "自分の会社の商品の良さを信じて、売れなくても商品を売り続けること。",
      "人がしないことを探して、周りの人に反対されても実行すること。",
      "客のことをよくわかっている社員だけで、いいものを作り続けること。"
    ], correctIndex: 0 },

  // ── 読解 問題7 情報検索 (q12, 2問) ─────────────────────────────────────
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "37",
    context: PASSAGE_R7,
    sentence: "今日は大学の休暇期間中の平日である。テイムさんは、13時に大学の食堂かカフェで食事をしようと考えている。学生のテイムさんが行ける食堂・カフェはどれか。",
    options: [
      "①と②と③。",
      "①と②。",
      "③と④。",
      "③。"
    ], correctIndex: 3 },
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "38",
    context: PASSAGE_R7,
    sentence: "丸川大学の学生のオウさんは、10月23日（土）に②の食堂でクラスのパーティーを開きたいと考えている。10月23日に②の食堂でパーティーに利用できることは確認できたが、そのほかに気をつけなければならないこととして、合っているのはどれか。",
    options: [
      "学生が申し込みをすることはできない。",
      "料理は、一人2500円以上注文しなければならない。",
      "予約できる最少の人数は、20人である。",
      "パーティーは、21時までに終える必要がある。"
    ], correctIndex: 1 },

  // ── 聴解 問題1 (lq1, 6問) ───────────────────────────────────────────────
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "5ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "6ばん", options: ["1","2","3","4"], correctIndex: 0 },

  // ── 聴解 問題2 (lq2, 6問) ───────────────────────────────────────────────
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "5ばん", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq2", sectionId: "listening", type: "listening_scene", display: "6ばん", options: ["1","2","3","4"], correctIndex: 2 },

  // ── 聴解 問題3 (lq3, 3問) ────────────────────────────────────────────────
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 1 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3","4"], correctIndex: 0 },

  // ── 聴解 問題4 (lq4, 4問) ────────────────────────────────────────────────
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3"], correctIndex: 2 },

  // ── 聴解 問題5 (lq5, 9問) ────────────────────────────────────────────────
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "5ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "6ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "7ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "8ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "9ばん", options: ["1","2","3"], correctIndex: 0 },
]

const explanations = _explanations as Record<string, string>

export const N3_7_2023_QUESTIONS: StaticQuestion[] = _RAW.map(q => {
  const key = `${q.groupId}:${q.display}`
  return { ...q, explanation: explanations[key] ?? undefined }
})

export const N3_7_2023_COUNTS = { vocab: 35, grammar: 38, listening: 28, total: 101 }
