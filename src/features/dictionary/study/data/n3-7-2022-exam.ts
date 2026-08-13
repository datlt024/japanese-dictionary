// 2022年7月 日本語能力試験 N3 — 言語知識（文字・語彙・文法）・読解・聴解
// Explanations are stored in ./explanations/n3-7-2022.json and merged at export time.

import _explanations from "./explanations/n3-7-2022.json"

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
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">いかは、留学生の作文である。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:2;">
<p style="text-align:center;font-weight:700;margin:0 0 4px;">工場見学</p>
<p style="text-align:right;font-size:13px;color:#6b7280;margin:0 0 12px;">コルホネン　アーロン</p>
<p style="margin:0 0 10px;">　日本に来る前に、日本には無料で工場見学ができるところがあると聞いて、面白そうだと思いました。日本に行ったら絶対に行こうと思っていたのですが、先月ついに行くことができました。</p>
<p style="margin:0 0 10px;">　<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">19</span>のはアイスクリームの会社の工場です。工場では、機会を使って、材料を混ぜたり型に入れたり凍らせたりしていました。工場の人の説明は丁寧で、機械や商品の説明が書かれた資料もくれたので、よくわかりました。できたばかりのアイスも食べさせてくれました。工場見学は本当に楽しかったです。<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">20</span>、どうして無料で見学をさせてくれるのかわかりませんでした。</p>
<p style="margin:0 0 10px;">　調べてみたら、工場見学は、会社側にもいいことがあるとわかりました。ある新聞の調査によると、工場見学をした人の大部分が、<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">21</span>で作られている商品を好きになり、会社に対するイメージもよくなったそうです。実際に、私も工場見学をした会社の印象が前よりよくなりました。</p>
<p style="margin:0;">　日本には、他にも同じような工場見学ができるところがたくさんあるそうです。今、次に見学に行く工場を探しています。日本にいる間にいろいろな工場に見学に<span style="display:inline-block;border:1.5px solid #374151;border-radius:3px;padding:0 5px;font-weight:700;">22</span>。</p>
</div>`

const PASSAGE_R4_1 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0;">　日本語学校の新学期が始まったとき、クラス全員がそれぞれ、学期の目標を紙に書いて教室にはっておくことになった。私は漢字を500字覚えることにしたが、やってみると大変だった。でも、教室に入ると、自分で書いた目標が目に入るし、クラスのみんなも知っているから、簡単にはやめられない。そのおかげで、学期末には目標の500字を覚えることができた。目標を心の中で決めるだけではなく、紙に書いて教室にはったのがよかったのだ。</p>
</div>`

const PASSAGE_R4_2 =
  `<p style="font-size:13px;margin:0 0 6px;color:#374151;">これはある旅行会社が客の水川さんに書いたメールである。</p>
<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 8px;">水川真理様<br>「京都の旅２泊３日」へのお申し込み、ありがとうございました。下のご予約内容を確認していただき、ご出発日の１週間前までに旅行代金をお振り込みください。</p>
<p style="margin:0 0 8px;">　なお、ご出発日の20日前以降のお取り消しには、キャンセル料が発生します(20日前〜8日前まで20%、7日前〜前日まで30%、当日100%)。ご質問などございましたら、ご連絡ください。</p>
<p style="font-weight:700;margin:0 0 4px;">＜ご予約内容＞</p>
<p style="margin:0 0 2px;">ツアー名：京都の旅２泊３日</p>
<p style="margin:0 0 2px;">出発日：2月13日</p>
<p style="margin:0 0 2px;">代金合計86,000円（税込）</p>
<p style="margin:0 0 2px;">振り込み先：あおば銀行西島支店　普通　1234567　石野旅行</p>
<p style="margin:0 0 2px;">石野旅行　予約課　岩坂</p>
<p style="margin:0;">電話：051-960-7451　FAX：051-960-7452</p>
</div>`

const PASSAGE_R4_3 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0;">　郵便局と聞くと、まず思いつくのは手紙や荷物の配達だろう。だが、こんな意外なサービスがあることを知っているだろうか。一人暮らしをしているお年寄りとその家族の安心のため、郵便局員がお年寄りの家を訪問する。そして、そのときのお年寄りの様子をＥメールで家族に教えてくれるのだ。親になかなか会いに行けない人には、うれしいサービスだ。</p>
</div>`

const PASSAGE_R4_4 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="font-weight:700;margin:0 0 8px;">ナムさん</p>
<p style="margin:0 0 8px;">　来週の「会議の文法研究会」ですが、申し込みが予想より増えています。</p>
<p style="margin:0 0 8px;">参加者は60名ぐらいになりそうですから、資料をあと20部お願いします。</p>
<p style="margin:0;">　それから、今日、大学の事務所で、教室の予約を304から201に変えてもらいました。研究会の会員にメールでお知らせしておきますが、当日も304のドアに、教室が変わったことを知らせる紙をはったほうがいいと思うので、作っておいてください。</p>
</div>`

const PASSAGE_R5_1 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　今年の夏、初めて水筒を買った。今まで、飲み物はペットボトルを買っていたが、一ヶ月に五千円もかかっていたのだ。</p>
<p style="margin:0 0 10px;">　買ったのは、コップが付いていない、直接口をつけて飲む水筒で、飲み物の温度が長時間変わらない物だ。コップが付いている水筒もあったが、毎回コップに入れるのはめんどくさいと思ったので、<u>①この水筒</u>にした。</p>
<p style="margin:0 0 10px;">　夏は一日中冷たいものが飲めたので良かったのだが、冬になって熱い飲み物を入れたら、<u>②困ったこと</u>が起きた。熱すぎて、直接は飲めなかったのだ。最初は１本あれば十分だと思っていたが、結局、コップ付きの水筒も買った。コップがあれば冷ますことができる。どちらの水筒もそれほど高くなかったが、<u>③最初に考えていたよりはお金がかかってしまった</u>。でも、季節によって違う水筒を使うのも楽しいし、ペットボトルも買わなくなったのでこれでよかったと思っている。</p>
</div>`

const PASSAGE_R5_2 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　日本では、町の中でカラスをよく見ます。カラスという鳥は平気で人間に向かって飛んできたり、食べ物を取ったりするので、嫌がる人もいます。</p>
<p style="margin:0 0 10px;">　私の町では、毎日夕方になると、たくさんのカラスが、公園の木で寝るために集まってきます。声がうるさいし、数が非常に多いので怖さを感じることもあります。それで町の人たちはとても困っています。<u>①この問題</u>の解決方法はあるのでしょうか。</p>
<p style="margin:0 0 10px;">　ある町では、専門家の協力で一つの<u>②実験</u>に成功しました。安全な状態にいるときと危険を感じたときのカラスの鳴き方の違いを利用して、「いてほしくない場所」から「集まっても問題のない場所」にカラスを移動させることができたそうです。</p>
<p style="margin:0;">　しかし、私の町には大きな森など、カラスが「集まっても問題のない場所」はありません。ですから、同じ方法は使えそうにありません。私の町に合った解決方法が見つかればいいと思います。</p>
</div>`

const PASSAGE_R6 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="margin:0 0 10px;">　私は両親結婚記念日に毎年違うプレゼントを送っていて、実家の両親も楽しみにしてくれている。ただ、もう20年以上続けているので、だんだんアイデアがなくなってきた。今年は、前にあげたことがあるものでもしかたないと、<u>①あきらめ始めていた</u>。</p>
<p style="margin:0 0 10px;">　そんなとき、友達から旅行のお土産に小さい箱に入ったおしゃれなろうそくをもらった。その夜、さっそく火をつけてみた。不規則にやさしく火がゆれて、それを見ていると気持ちが落ちついた。</p>
<p style="margin:0 0 10px;">　箱には、ろうそくの効果についての<u>②説明の紙</u>も入っていた。ろうそくの火、嫌なにおいを消す効果があることは知っていたが、料理をおいしく見せる効果があることは初めて知った。それを読んで私は、「両親へのプレゼントにいいかもしれない」と思いついた。ろうそくはあげたことがないし、これを使えば、結婚記念日の夜のごちそうがもっとおいしく感じるだろう。</p>
<p style="margin:0 0 10px;">　しかし、しばらく火を見つめていると、ちょっと心配になってきた。食事のあとで消し忘れることもあるかもしれない。それに、両親の家では猫を飼っているので、何が起こるかわからない。</p>
<p style="margin:0 0 10px;">　<u>③ろうそくはやっぱりやめたほうがいいと思った</u>が、あきらめられずに一緒に入っていたカタログを見ていた。すると、実物の火そっくりにゆれて、同じような効果もある「電気のろうそく」があるのを見つけた。これなら、安全に使えそうだ。</p>
<p style="margin:0;">　結婚記念日まではまだ2週間ある。このタイプには、ほかにも種類があるようなので、もう少し調べてみようと思う。</p>
</div>`

const PASSAGE_R7 =
  `<div style="border:1.5px solid #6b7280;border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.9;">
<p style="text-align:center;font-weight:700;font-size:15px;margin:0 0 10px;">中村ギター教室　生徒募集</p>
<p style="margin:0 0 4px;">★初めての方にもわかりやすく教えます。</p>
<p style="margin:0 0 10px;">★教室に通うかどうか決める前に、60分の「特別割引レッスン」(1000円)を1回90分受けることができます。</p>
<p style="margin:0 0 4px;"><strong>「講師」</strong>中村カズオ（西日本音楽大学卒業）</p>
<p style="margin:0 0 4px;"><strong>「時間」</strong>1回90分（毎日10時〜21時の間）　※日時は、講師と予約を相談して決めます。</p>
<p style="margin:0 0 8px;"><strong>「レッスンのタイプ」</strong>個人レッスンと、2〜3名で申し込むグループレッスンがあります。</p>
<p style="margin:0 0 4px;"><strong>「1ヶ月の料金」</strong>（グループレッスンは1名分の料金）</p>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin:6px 0 10px;">
<tr><th style="border:1px solid #9ca3af;padding:4px 8px;background:#f3f4f6;"></th><th style="border:1px solid #9ca3af;padding:4px 8px;background:#f3f4f6;">個人</th><th style="border:1px solid #9ca3af;padding:4px 8px;background:#f3f4f6;">グループ</th></tr>
<tr><td style="border:1px solid #9ca3af;padding:4px 8px;">月2回</td><td style="border:1px solid #9ca3af;padding:4px 8px;text-align:center;">7,000円</td><td style="border:1px solid #9ca3af;padding:4px 8px;text-align:center;">6,000円</td></tr>
<tr><td style="border:1px solid #9ca3af;padding:4px 8px;">月3回</td><td style="border:1px solid #9ca3af;padding:4px 8px;text-align:center;">10,000円</td><td style="border:1px solid #9ca3af;padding:4px 8px;text-align:center;">8,000円</td></tr>
<tr><td style="border:1px solid #9ca3af;padding:4px 8px;">月4回</td><td style="border:1px solid #9ca3af;padding:4px 8px;text-align:center;">13,000円</td><td style="border:1px solid #9ca3af;padding:4px 8px;text-align:center;">10,000円</td></tr>
</table>
<p style="margin:0 0 4px;"><span style="border:1px solid #374151;padding:1px 6px;font-size:12px;font-weight:700;">学生割引</span>　学生の方は、上の表の料金から毎月1000円割引します。</p>
<p style="margin:0 0 8px;"><span style="border:1px solid #374151;padding:1px 6px;font-size:12px;font-weight:700;">平日昼間割引</span>　平日昼間（月〜金の17時までに終了）にレッスンを受ける方は、上の表の料金から毎月2000円割引します。</p>
<p style="margin:0 0 2px;font-size:12px;">※二つの割引を同時に使うことはできません。</p>
<p style="margin:0 0 10px;font-size:12px;">※毎月の料金は、前の月の最終日までにお支払いください。</p>
<p style="font-weight:700;margin:0 0 6px;">「特別割引レッスン」</p>
<p style="margin:0 0 2px;font-size:13px;">・メールに、お名前、連絡先、レッスンのタイプ、希望日時を書いてお申し込みください。</p>
<p style="margin:0 0 2px;font-size:13px;">・グループレッスンを希望する方は、代表の方がお申し込みください。</p>
<p style="margin:0 0 2px;font-size:13px;">・料金（一人1000円）は、当日お支払いください。</p>
<p style="margin:0 0 8px;font-size:13px;">・自分のギターでレッスンを受けたい方は持ってきてください。持ってこられない方には、無料で教室のギターをお貸しします。</p>
<p style="font-size:12px;margin:0;">中村ギター教室〒120-5599　春中市高木町6-2-3（春中駅から徒歩1分）</p>
</div>`

// ─── Questions ───────────────────────────────────────────────────────────────

const _RAW: Omit<StaticQuestion, "explanation">[] = [
  // ── 問題1 漢字の読み方 (q1, 7問) ────────────────────────────────────────
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "情報",  sentence: "その会社の[情報]は、インターネットで見ました。",       options: ["じょうほう","ちょうほう","じょうぼう","ちょうぼう"], correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "現在",  sentence: "兄は、[現在]は海外で働いています。",                  options: ["けんさい","げんさい","けんざい","げんざい"],         correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "丸い",  sentence: "小さくて[丸い]すがほしい。",                          options: ["くろい","まるい","あおい","かるい"],                 correctIndex: 1 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "有名",  sentence: "その歌は日本でも[有名]です。",                        options: ["ゆめ","ゆめい","ゆうめ","ゆうめい"],                 correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "角",    sentence: "そこの通りの[角]に、コンビニができるそうです。",        options: ["かど","そば","はし","よこ"],                         correctIndex: 0 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "包んで", sentence: "大切な物なので、丁寧に[包んで]ください。",              options: ["たたんで","はこんで","すすんで","つつんで"],           correctIndex: 3 },
  { groupId: "q1", sectionId: "vocab", type: "kanji_reading", display: "計算",  sentence: "それは、もう[計算]しました。",                        options: ["けいけん","けけん","けいさん","けさん"],             correctIndex: 2 },

  // ── 問題2 漢字の書き方 (q2, 6問) ────────────────────────────────────────
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "きろく",   sentence: "私は毎日、どのくらい歩いたか[きろく]している。",          options: ["基緑","記緑","基録","記録"],   correctIndex: 3 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "こうこく", sentence: "駅で新しい[こうこく]を見ました。",                        options: ["校管","校告","広営","広告"],   correctIndex: 3 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "ひえて",   sentence: "体がすっかり[ひえて]しまいました。",                      options: ["冷えて","寒えて","氷えて","低えて"], correctIndex: 0 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "けんさ",   sentence: "[けんさ]はしたが何も問題はなかった。",                   options: ["健査","検査","検察","健察"],   correctIndex: 1 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "たしか",   sentence: "その話は[たしか]ですか。",                               options: ["定か","確か","必か","常か"],   correctIndex: 1 },
  { groupId: "q2", sectionId: "vocab", type: "kanji_writing", display: "かいが",   sentence: "私の祖父は、日本の[かいが]をたくさん持っている。",         options: ["絵面","図面","絵画","図画"],   correctIndex: 2 },

  // ── 問題3 文脈規定 (q3, 11問) ────────────────────────────────────────────
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "14", sentence: "たまねぎとにんじんは皮を（　）から料理に使ってください。",             options: ["むいて","ほって","破って","離して"],                     correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "15", sentence: "この国には石油やガスなどの（　）があまりありません。",               options: ["栄養","資源","内容","部品"],                             correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "16", sentence: "一生懸命頑張ったのに、試合に負けてしまって、とても（　）です。",       options: ["まじしかった","あやしかった","くやしかった","ずるかった"], correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "17", sentence: "旅行に行けなくなったので、ホテルの予約を（　）した。",               options: ["ピックアップ","キャンセル","ディスカウント","チェックアウト"], correctIndex: 1 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "18", sentence: "コーヒーをこぼして、白いズボンに（　）ができてしまった。",            options: ["穴","影","こぶ","しみ"],                                 correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "19", sentence: "兄を起こすために、部屋の外からドアを強く（　）。",                   options: ["たたいた","さわった","つかまえた","なてた"],             correctIndex: 0 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "20", sentence: "交通事故を（　）ために、ここに横断歩道を作るそうです。",             options: ["直す","逃げる","防ぐ","守る"],                           correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "21", sentence: "のどが（　）ので、何か飲みたいです。",                             options: ["へった","すいた","かわいた","やせた"],                   correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "22", sentence: "行きは佐藤さんと２人で来たが、帰りは（　）だった。",                 options: ["様々","半々","別々","色々"],                             correctIndex: 2 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "23", sentence: "留学については、両親とよく（　）、決めるつもりだ。",               options: ["取り込んで","言い返して","受け取って","話し合って"],     correctIndex: 3 },
  { groupId: "q3", sectionId: "vocab", type: "context_vocab", display: "24", sentence: "昨日の夜から歯が痛くて、（　）します。",                           options: ["とんとん","ざあざあ","ずきずき","からから"],             correctIndex: 2 },

  // ── 問題4 言い換え類義 (q4, 5問) ────────────────────────────────────────
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "25", sentence: "[ふだん]と同じようにやってください。",                            options: ["みんな","昔","いつも","例"],                             correctIndex: 2 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "26", sentence: "あの人は[短気]だ。",                                              options: ["すぐ怒る","すぐ謝る","すぐ驚く","すぐ喜ぶ"],           correctIndex: 0 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "27", sentence: "12時に[グラウンド]に来てください。",                              options: ["屋上","体育館","公園","運動場"],                         correctIndex: 3 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "28", sentence: "私の[おい]は東京に住んでいます。",                                options: ["姉の息子","姉の娘","父の弟","父の妹"],                   correctIndex: 0 },
  { groupId: "q4", sectionId: "vocab", type: "context_vocab", display: "29", sentence: "もっと[くわしく]説明してください。",                              options: ["早く","細かく","簡単に","熱心に"],                       correctIndex: 1 },

  // ── 問題5 用法 (q5, 5問) ─────────────────────────────────────────────────
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "30", sentence: "問題5: [諦める]の使い方として最もよいものを選びなさい。",
    options: [
      "今日は天気がいいから、傘を諦めてよさそうだ。",
      "台風が来そうなので、あしたの登山を諦めることにした。",
      "家を出てすぐに、鍵をかけるのを諦めたことに気づいた。",
      "悲しい小説だったので、泣くのを諦められなかった。"
    ], correctIndex: 1 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "31", sentence: "問題5: [参加]の使い方として最もよいものを選びなさい。",
    options: [
      "赤ちゃんが家族に参加したので、生活が変わった。",
      "山川さんが事故に参加して、足をけがしたそうだ。",
      "あしたは息子と一緒にパーティーに参加するつもりだ。",
      "父は貿易会社に参加しているので、出張は海外が多い。"
    ], correctIndex: 2 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "32", sentence: "問題5: [盛ん]の使い方として最もよいものを選びなさい。",
    options: [
      "あしたは試合なので、今日は練習時間が盛んだった。",
      "今日は荷物が盛んなので、大きなかばんが必要だ。",
      "このレストランは、魚も野菜も盛んでおいしい。",
      "この町は以前から外国人との交流が盛んだ。"
    ], correctIndex: 3 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "33", sentence: "問題5: [整理]の使い方として最もよいものを選びなさい。",
    options: [
      "机の引き出しを整理して、いらない物を捨てました。",
      "家の廊下が汚れていたので、ぞうきんで整理しました。",
      "長い間使っていない部屋の窓を開けて、空気を整理した。",
      "虫歯になると困るので、毎回、食事の後で歯を整理している。"
    ], correctIndex: 0 },
  { groupId: "q5", sectionId: "vocab", type: "context_vocab", display: "34", sentence: "問題5: [通り過ぎる]の使い方として最もよいものを選びなさい。",
    options: [
      "さっき店の前を自転車で通り過ぎたのは、木村さんだと思う。",
      "バスが遅れて、待ち合わせの時間を通り過ぎてしまった。",
      "今日はご飯の量を通り過ぎて、おなかがいっぱいだ。",
      "締め切りを通り過ぎないように、書類は早めに出したほうがいい。"
    ], correctIndex: 0 },

  // ── 文法 問題1 文の文法（空欄補充）(q6, 13問) ──────────────────────────
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "1",
    sentence: "友達がおいしいカレー屋があると言って連れていってくれた。友達と同じものを頼んだが、私（　）辛すぎた。",
    options: ["で","へ","には","より"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "2",
    sentence: "A「（　）絵本、知ってる?」\nB「うん、知ってるよ。子供のとき、大好きだった。」",
    options: ["「大きな家」と","「大きな家」って","「大きな家」でも","「大きな家」なんか"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "3",
    sentence: "昨日見た映画は、面白いと聞いていたのに（　）面白くなかった。",
    options: ["やっと","すっかり","せっかく","ちっとも"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "4",
    sentence: "近所のパン屋は、パンの種類が多い。一年中売っているパン（　）季節ごとに発売されるパンもある。",
    options: ["のほかに","のことで","に比べて","について"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "5",
    sentence: "夫は、プロのサッカー選手として活動する（　）大学院でスポーツ科学を学んでいる。",
    options: ["点で","一方で","としたら","のだから"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "6",
    sentence: "もうすぐ夏だ。（　）エアコンが問題なく動くかどうか、確認しておこうと思う。",
    options: ["暑くなるまで","暑くなる前に","暑くするまで","暑くする前に"], correctIndex: 1 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "7",
    sentence: "新しいパソコンを買って１か月（　）使っていないのに、壊れてしまった。",
    options: ["ごろしか","ごろだけ","ぐらいしか","ぐらいだけ"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "8",
    sentence: "（薬局で）\n店員「この薬を1日3回、食事の後に飲んでください。飲むと眠く（　）、飲んだ後、車の運転などはしないでください。」",
    options: ["なればいいので","なったばかりなので","なることがあるので","なってはいけないので"], correctIndex: 2 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "9",
    sentence: "（インタビューで）\n選手「優勝できたのは皆さんの応援の（　）。ありがとうございました。」",
    options: ["はずです","ようです","ことです","おかげです"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "10",
    sentence: "（電話で）\n田中「はい、営業課の田中です。」\n石山「会計課の石山ですが、今ちょっとよろしいですか。」\n田中「すみません。これから会議なんです。」\n田中「わかりました。では、またあとで（　）。」",
    options: ["かけ直します","かけ出します","かけています","かけておきます"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "11",
    sentence: "（玄関で）\n妻「あれ、出かけるの？散歩？。」\n夫「うん」\n妻「じゃあ、帰りにスーパーで卵を（　）?。」\n夫「わかった。」",
    options: ["買っていってもらわない","買っていってくれない","買ってきてもらわない","買ってきてくれない"], correctIndex: 3 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "12",
    sentence: "村山「中野さん、3月で会社を辞めるって本当ですか。」\n中野「はい、私、4月から（　）。」",
    options: ["留学することにしたんです","留学することにしそうです","留学したことがあるんです","留学したことがありそうです"], correctIndex: 0 },
  { groupId: "q6", sectionId: "grammar", type: "grammar_blank", display: "13",
    sentence: "（銀行のホームページで）\nキャッシュカードの暗証番号は決して他人に（　）。",
    options: ["知ってはいけません","知らせにくいです","知られないようにしてください","知らないほうがいいでしょう"], correctIndex: 2 },

  // ── 文法 問題2 文の文法★（並べ替え）(q7, 5問) ─────────────────────────
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "14",
    sentence: "私は、森先生の授業を受けてから数学が好きになった　＿＿＿　＿＿＿　[★]　＿＿＿　いないと思う。",
    options: ["先生は","先生ほど","あの","わかりやすく教えてくれる"], correctIndex: 3 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "15",
    sentence: "「今日は、コーラを使った鶏肉の煮物を紹介します。鶏肉は　＿＿＿　＿＿＿　[★]　＿＿＿　知っていますか。」",
    options: ["煮ることで","柔らかく","コーラで","なるのを"], correctIndex: 1 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "16",
    sentence: "南「私はあまり知らないんだけど、田中さん　＿＿＿　＿＿＿　[★]　＿＿＿　どう?」",
    options: ["が","聞いてみたら","から","北森町に住んでいる"], correctIndex: 2 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "17",
    sentence: "タン「いいえ、今年は帰りません。日本で　＿＿＿　＿＿＿　[★]　＿＿＿　なので楽しみです。」",
    options: ["今年が","過ごすのは","初めて","夏休みを"], correctIndex: 0 },
  { groupId: "q7", sectionId: "grammar", type: "grammar_blank", display: "18",
    sentence: "さくら大学の周りには、レストランや喫茶店などの　＿＿＿　＿＿＿　[★]　＿＿＿　ある。",
    options: ["中心に","飲食店を","いろいろな店が","本屋や美容院など"], correctIndex: 3 },

  // ── 文法 問題3 文章の文法 (q8, 4問) ────────────────────────────────────
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "19",
    context: PASSAGE_G3,
    sentence: "（19）のはアイスクリームの会社の工場です。",
    options: ["見学する","見学した","見学している","見学してある"], correctIndex: 1 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "20",
    context: PASSAGE_G3,
    sentence: "工場見学は本当に楽しかったです。（20）、どうして無料で見学をさせてくれるのかわかりませんでした。",
    options: ["でも","また","すると","たとえば"], correctIndex: 0 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "21",
    context: PASSAGE_G3,
    sentence: "工場見学をした人の大部分が、（21）で作られている商品を好きになり",
    options: ["これ","それ","ここ","そこ"], correctIndex: 3 },
  { groupId: "q8", sectionId: "grammar", type: "grammar_blank", display: "22",
    context: PASSAGE_G3,
    sentence: "日本にいる間にいろいろな工場に見学に（22）。",
    options: ["行ってみてほしいです","行ってみたがっています","行ってみるつもりです","行ってみるといいです"], correctIndex: 2 },

  // ── 読解 問題4 短文読解 (q9, 4問) ──────────────────────────────────────
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "23",
    context: PASSAGE_R4_1,
    sentence: "「私」はどうして目標の500字を覚えることができたと考えているか。",
    options: [
      "「私」にとって簡単な目標だったから。",
      "クラス全員で話し合って、同じ目標に決めたから。",
      "簡単にあきらめないようにしようと、心の中で決めていたから。",
      "決めた目標が、自分にもほかの人にも見えるようにしてあったから。"
    ], correctIndex: 3 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "24",
    context: PASSAGE_R4_2,
    sentence: "旅行会社がこのメールで最も言いたい事は何か。",
    options: [
      "旅行の予約内容を確認したら、連絡してください。",
      "旅行代金を出発日の1週間前までに振り込んでください。",
      "旅行のキャンセル料を1週間以内に支払ってください。",
      "旅行について何かわからないことがあれば質問をしてください。"
    ], correctIndex: 1 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "25",
    context: PASSAGE_R4_3,
    sentence: "意外なサービスとあるが一人暮らしのお年寄りとその家族に対するどのようなサービスか。",
    options: [
      "家族の指定した時間に、お年寄りに荷物を配達する。",
      "お年寄りを訪問し、その様子を家族にEメールで連絡する。",
      "家族からのEメールを郵便局員が受け取り、印刷してお年寄りに渡す。",
      "ふだんなかなか会えない家族のところに、お年寄りを連れて行く。"
    ], correctIndex: 1 },
  { groupId: "q9", sectionId: "grammar", type: "grammar_blank", display: "26",
    context: PASSAGE_R4_4,
    sentence: "ナムさんがこのメモで頼まれていることは何か。",
    options: [
      "資料を60部準備することと、教室が変わったことを全員にメールで知らせること。",
      "準備する資料を20部増やすことと、304のドアにはる紙を作っておくこと。",
      "教室の予約を304から201を変えることと、304のドアに紙をはること。",
      "教室が変わったことを全員にメールで知らせることと、304のドアにはる紙を作っておくこと。"
    ], correctIndex: 1 },

  // ── 読解 問題5 中文読解 (q10, 6問) ─────────────────────────────────────
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "27",
    context: PASSAGE_R5_1,
    sentence: "①この水筒とあるが、どのような水筒か。",
    options: [
      "飲み物温度が変わりにくい、直接口をつけて飲む水筒。",
      "飲み物の温度が変わりにくい、コップが付いている水筒。",
      "熱い飲み物を冷ましやすい、直接口をつけて飲む水筒。",
      "熱い飲み物を冷ましやすい、コップがついている水筒。"
    ], correctIndex: 0 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "28",
    context: PASSAGE_R5_1,
    sentence: "②困ったこととあるが、どのようなことか。",
    options: [
      "熱い飲み物を外で飲む機会が少なくなったこと。",
      "熱い飲み物を入れたら、水筒が壊れてしまったこと。",
      "熱い飲み物が水筒から直接飲めなかったこと。",
      "熱い飲み物がすぐに冷めてしまったこと。"
    ], correctIndex: 2 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "29",
    context: PASSAGE_R5_1,
    sentence: "③最初に考えていたよりはお金がかかってしまったとあるが、それはなぜか。",
    options: [
      "ペットボトルを買うことが増えたから。",
      "とても高い水筒を買うことになったから。",
      "水筒とは別にコップも買うことになったから。",
      "水筒を2本も買うことになったから。"
    ], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "30",
    context: PASSAGE_R5_2,
    sentence: "①この問題とあるが、何か。",
    options: [
      "日本にカラスが多すぎること。",
      "日本にカラスを嫌がる人が多いこと。",
      "カラスが人に向かって飛んできたり、食物を取ったりして、危険で困ること。",
      "「私」の町の公園に、カラスが夕方たくさん集まってきて、うるさくて怖いこと。"
    ], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "31",
    context: PASSAGE_R5_2,
    sentence: "どのような②実験か。",
    options: [
      "カラスを「集まっても問題のない場所」でよく眠らせて、静かにさせる実験。",
      "カラスが「いてほしくない場所」にいても、鳴き声は周りに聞こえないようにする実験。",
      "カラスの苦手な食べ物を利用して、「いてほしくない場所」に来ないようにする実験。",
      "カラスの鳴き方の違いを利用して、「集まっても問題のない場所」に行かせる実験。"
    ], correctIndex: 3 },
  { groupId: "q10", sectionId: "grammar", type: "grammar_blank", display: "32",
    context: PASSAGE_R5_2,
    sentence: "「私」の町のカラスの問題について、「私」はどう考えているか。",
    options: [
      "「私」の町で成功した方法を、これからも続けていきたい。",
      "「私」の町でも、別の町で成功した方法を使って解決してほしい。",
      "別の町で成功した方法とは違う、「私」の町に合った新しい方法が必要だ。",
      "別の町で成功した方法は「私」の町では使えないから、解決はあきらめよう。"
    ], correctIndex: 2 },

  // ── 読解 問題6 長文読解 (q11, 4問) ─────────────────────────────────────
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "33",
    context: PASSAGE_R6,
    sentence: "①「あきらめ始めていた」とあるが、何をあきらめ始めていたのか。",
    options: [
      "両親に今まで違うプレゼントを送ること。",
      "両親にいつもと同じプレゼントを送ること。",
      "両親に結婚記念日までにプレゼントを送ること。",
      "両親に欲しいものを決めてもらうこと。"
    ], correctIndex: 0 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "34",
    context: PASSAGE_R6,
    sentence: "「私」が②説明の紙を読んで知ったことは、どんなことか。",
    options: [
      "ろうそくの火が、不規則なゆれ方をすること。",
      "ろうそくの火が、人の気持ちを落ち着かせること。",
      "ろうそくの火が、嫌なにおいを消すこと。",
      "ろうそくの火が、料理をおいしく見せること。"
    ], correctIndex: 3 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "35",
    context: PASSAGE_R6,
    sentence: "③ろうそくはやっぱりやめたほうがいいと思ったとあるが、なぜか。",
    options: [
      "前に両親にろうそくをあげたことを思い出したから。",
      "結婚記念日にろうそくあげるのは変だと思ったから。",
      "ろうそくの火は危険かもしれないと心配になったから。",
      "ろうそくより新しいペットをあげた方が喜ばれると思ったから。"
    ], correctIndex: 2 },
  { groupId: "q11", sectionId: "grammar", type: "grammar_blank", display: "36",
    context: PASSAGE_R6,
    sentence: "両親へのプレゼントについて、「私」は今、どのように考えているか。",
    options: [
      "友達にもらったろうそくがよかったから、同じろうそくが売られているか調べよう。",
      "安全に使える「電気ろうそく」を見つけたから、さっそく両親に送ろう。",
      "「電気ろうそく」にしようと思うが、もう少し調べてからどれにするか決めよう。",
      "「電気ろうそく」をあげるのはやめて、ろうそくについてもう一度調べてみよう。"
    ], correctIndex: 2 },

  // ── 読解 問題7 情報検索 (q12, 2問) ─────────────────────────────────────
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "37",
    context: PASSAGE_R7,
    sentence: "トムさんは、同じ大学に通う友達と一緒に月に3回グループレッスンを受けたいと考えている。2人の予定が合うのは、平日の18時以降である。トムさんと友達がこの教室に通う場合、トムさんは毎月いくら支払わなければならないか。",
    options: [
      "8000円から1000円引いたものを支払う。",
      "8000円から2000円引いたものを支払う。",
      "10,000円から1000円引いたものを支払う。",
      "10,000円から2000円引いたものを支払う。"
    ], correctIndex: 0 },
  { groupId: "q12", sectionId: "grammar", type: "grammar_blank", display: "38",
    context: PASSAGE_R7,
    sentence: "特別割引レッスンを申し込んだ人が、当日必ず持っていかなければならないものは何か。",
    options: [
      "特別割引レッスンの料金と、自分のギター。",
      "特別割引レッスンの料金。",
      "自分のギター。",
      "特にない。"
    ], correctIndex: 1 },

  // ── 聴解 問題1 (lq1, 6問) ───────────────────────────────────────────────
  { groupId: "lq1", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text",  display: "2ばん", options: ["料理の写真","料理の味の説明","料理のカロリー","料理に使っているざいりょう"], correctIndex: 3 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text",  display: "3ばん", options: ["600円","1000円","1200円","1600円"], correctIndex: 3 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text",  display: "4ばん", options: ["まつりのビデオを見る","おどりの練習をする","ゆかたにきがえる","かばんをへやの後ろにおく"], correctIndex: 2 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text",  display: "5ばん", options: ["アイ","アウ","イウ","イエ"], correctIndex: 1 },
  { groupId: "lq1", sectionId: "listening", type: "listening_text",  display: "6ばん", options: ["産業のれきし","アジアのけいざい学","こくさいかんけい学","社会学研究"], correctIndex: 0 },

  // ── 聴解 問題2 (lq2, 6問) ───────────────────────────────────────────────
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "1ばん", options: ["日本でアンケートを取る","日本でインタビューをする","自分の国でアンケートをする","自分の国でインタビューをする"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "2ばん", options: ["けしきがいい旅館","おいしいそば屋","新しくできたわがし屋","男の人がよく行くみやげ物屋"], correctIndex: 2 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "3ばん", options: ["おもしろくなかったから","もっといいアルバイトが見つかったから","勉強する時間をふやしたかったから","しょうがくきんがもらえたから"], correctIndex: 1 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "4ばん", options: ["多くの人に写真を見てもらいたいから","かぞくや友人をよろこばせたいから","日本での経験をきろくしたいから","日本語でこうりゅうできるから"], correctIndex: 0 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "5ばん", options: ["明るい色にする","ねだんを安くする","サイズをかえる","軽いざいりょうにする"], correctIndex: 3 },
  { groupId: "lq2", sectionId: "listening", type: "listening_text", display: "6ばん", options: ["りゅうがくした国のことばが上手になった","りゅうがくした国のぶんかを学べた","自分の国のことがよく分かるようになった","国がちがっても分かり合える友人ができた"], correctIndex: 3 },

  // ── 聴解 問題3 （no printed options）(lq3, 3問) ─────────────────────────
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3","4"], correctIndex: 3 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3","4"], correctIndex: 2 },
  { groupId: "lq3", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3","4"], correctIndex: 2 },

  // ── 聴解 問題4 えを見ながら (lq4, 4問) ─────────────────────────────────
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq4", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3"], correctIndex: 0 },

  // ── 聴解 問題5 （no printed options）(lq5, 9問) ─────────────────────────
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "1ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "2ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "3ばん", options: ["1","2","3"], correctIndex: 2 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "4ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "5ばん", options: ["1","2","3"], correctIndex: 1 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "6ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "7ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "8ばん", options: ["1","2","3"], correctIndex: 0 },
  { groupId: "lq5", sectionId: "listening", type: "listening_scene", display: "9ばん", options: ["1","2","3"], correctIndex: 0 },
]

const explanations = _explanations as Record<string, string>

export const N3_7_2022_QUESTIONS: StaticQuestion[] = _RAW.map(q => {
  const key = `${q.groupId}:${q.display}`
  return { ...q, explanation: explanations[key] ?? undefined }
})

export const N3_7_2022_COUNTS = { vocab: 34, grammar: 38, listening: 28, total: 100 }
