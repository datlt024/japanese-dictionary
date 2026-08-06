#!/usr/bin/env python3
"""
Generate N5 Test 1 listening audio (聴解) using macOS `say`.

Strategy: one `say` call per question (all dialogue + question text combined
with [[slnc N]] pause markers). This reduces system calls from ~100 to ~30.
Each `say` call uses Popen + wait(timeout) so we don't hang if macOS audio
device is slow to release after writing the AIFF file.

Usage (from project root):
    python3 scripts/generate-n5-listening.py

Outputs:
    public/exams/n5/audio/listening.m4a
    scripts/_n5_timestamps.json
"""

import subprocess, json, sys, os, time, wave
from pathlib import Path

# ── Config ───────────────────────────────────────────────────────────────
VOICE     = "Kyoko"
RATE      = 75           # 50% of original 145wpm — slow, clear N5 pace
SAY_TIMEOUT = 60         # slower rate → longer audio → more time needed
SAMPLE_RATE = 44100
CHANNELS    = 1
SAMPWIDTH   = 2

PROJECT = Path(__file__).parent.parent
TMPDIR  = Path("/tmp/n5_gen4")
OUT_M4A = PROJECT / "public/exams/n5/audio/listening.m4a"
OUT_TS  = Path(__file__).parent / "_n5_timestamps.json"

# Pause durations (ms) encoded inside say text with [[slnc N]]
P_BREATH = 600    # between dialogue lines
P_Q      = 1000   # before question text
P_ANS    = 5000   # after question / options (answer time)
P_SECT   = 3000   # at end of section intro

# ── Helpers ──────────────────────────────────────────────────────────────

def jp_pause(text: str) -> str:
    """Inject [[slnc N]] after Japanese punctuation for natural reading rhythm.

    macOS `say` does not automatically pause at 。or 、— without these markers
    the reading sounds rushed with no sentence breaks. Applied automatically
    in say_to_wav so callers don't need to think about it.
    """
    text = text.replace("、", "、[[slnc 380]]")
    text = text.replace("。", "。[[slnc 480]]")
    text = text.replace("？", "？[[slnc 480]]")
    text = text.replace("！", "！[[slnc 480]]")
    return text

def say_to_wav(text: str, name: str) -> Path:
    """Generate speech as a standard PCM WAV file at SAMPLE_RATE.

    Pipeline: say → AIFF → afconvert → WAV (LEI16 PCM)
    jp_pause() is applied here so punctuation pauses are always present.
    WAV avoids AIFF-C segment boundary artifacts from the aifc module.
    """
    raw_aiff = TMPDIR / f"{name}_raw.aiff"
    out_wav  = TMPDIR / f"{name}.wav"
    proc = subprocess.Popen(
        ["say", "-v", VOICE, "-r", str(RATE), "-o", str(raw_aiff), jp_pause(text)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
    )
    try:
        proc.wait(timeout=SAY_TIMEOUT)
    except subprocess.TimeoutExpired:
        proc.kill(); proc.wait()
    if not raw_aiff.exists() or raw_aiff.stat().st_size < 100:
        raise RuntimeError(f"say failed: {text[:60]}")
    subprocess.run(
        ["afconvert", "-f", "WAVE", "-d", f"LEI16@{SAMPLE_RATE}", "-c", "1",
         str(raw_aiff), str(out_wav)],
        check=True, capture_output=True
    )
    raw_aiff.unlink(missing_ok=True)
    return out_wav

def make_silence(name: str, secs: float) -> Path:
    """Generate silence as a WAV file (same format as say_to_wav output)."""
    path = TMPDIR / f"{name}.wav"
    n_frames = int(secs * SAMPLE_RATE)
    with wave.open(str(path), 'w') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(SAMPWIDTH)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(b'\x00' * n_frames * SAMPWIDTH * CHANNELS)
    return path

def dur(path: Path) -> float:
    """Duration from WAV file metadata."""
    with wave.open(str(path), 'r') as wf:
        return wf.getnframes() / wf.getframerate()

def concat_to_m4a(segs: list[Path], outpath: Path) -> None:
    """Concatenate WAV segments → single WAV → M4A (AAC)."""
    all_frames = b''
    for seg in segs:
        with wave.open(str(seg), 'r') as wf:
            all_frames += wf.readframes(wf.getnframes())
    wav_path = TMPDIR / "final.wav"
    with wave.open(str(wav_path), 'w') as wf:
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(SAMPWIDTH)
        wf.setframerate(SAMPLE_RATE)
        wf.writeframes(all_frames)
    outpath.parent.mkdir(parents=True, exist_ok=True)
    # Note: do NOT pass -b bitrate flag — causes '!dat' error on macOS afconvert
    subprocess.run(
        ["afconvert", "-f", "m4af", "-d", "aac", str(wav_path), str(outpath)],
        check=True
    )

def sl(ms: int) -> str:
    """Inline silence marker."""
    return f" [[slnc {ms}]] "

# ── Builder ──────────────────────────────────────────────────────────────

class Builder:
    def __init__(self):
        self.segs: list[Path] = []
        self._t: float = 0.0
        self._n: int = 0

    @property
    def t(self) -> float:
        return self._t

    def _id(self) -> str:
        self._n += 1
        return f"q{self._n:03d}"

    def say(self, text: str, label: str = "") -> tuple[float, float]:
        """Say text; return (start, end) timestamps in seconds."""
        sid = self._id()
        if label:
            print(f"  [{sid}] {label[:50]}")
        path = say_to_wav(text, sid)
        d = dur(path)
        start = self._t
        self.segs.append(path)
        self._t += d
        return start, self._t

    def silence(self, secs: float) -> None:
        sid = self._id()
        path = make_silence(sid, secs)
        self.segs.append(path)
        self._t += secs

    def mark(self) -> float:
        return round(self._t)

    def build(self) -> None:
        print(f"\n⏱  Total: {self._t:.1f}s ({self._t/60:.1f} min)")
        print("📦 Building M4A …")
        concat_to_m4a(self.segs, OUT_M4A)
        print(f"✓  {OUT_M4A}")


# ── Script ───────────────────────────────────────────────────────────────

def build(b: Builder) -> dict:
    ts = {}

    # ── Opening ─────────────────────────────────────────────────────────
    b.say("これから、ちょうかいのしけんをはじめます。", "Opening")
    b.silence(2)

    # ════════════════════════════════════════════════════════════════════
    # もんだい１ — 7問
    # ════════════════════════════════════════════════════════════════════
    b.say(
        "もんだい１。" + sl(300) +
        "もんだい１では、はじめにしつもんをきいてください。" +
        "それから、はなしをきいて、もんだいようしの１から４のなかから、" +
        "いちばんいいものをひとつえらんでください。" +
        sl(P_SECT),
        "もんだい１ intro"
    )
    b.say(
        "では、れいをきいてください。" + sl(400) +
        "おんなのひとはきょうのよるになにをしますか。" + sl(P_BREATH) +
        "きょうのよるは友だちとえいがをみます。" + sl(P_Q) +
        "おんなのひとはきょうのよるになにをしますか。" + sl(3000) +
        "こたえは３です。では、はじめます。" + sl(1500),
        "れい example"
    )

    # lq1 Q1 — 昼食 [pics: すし・ラーメン・カレー・サンドイッチ; correct=1(ラーメン)]
    qstart = b.mark()
    _, end = b.say(
        "１ばん。" + sl(500) +
        "おとこのひととおんなのひとがはなしています。" +
        "おとこのひとはきょうのおひるになにをたべますか。" + sl(P_BREATH) +
        "きょうのおひる、なにたべる？" + sl(P_BREATH) +
        "うーん、ラーメンにしようかな。" + sl(P_BREATH) +
        "そうか。わたしはカレーにする。" + sl(P_BREATH) +
        "じゃあ、また。" + sl(P_Q) +
        "おとこのひとはきょうのおひるになにをたべますか。",
        "lq1 Q1 昼食"
    )
    ts["lq1_q1"] = {"start": qstart, "end": round(end), "correct": 1}
    b.silence(7)

    # lq1 Q2 — 机の位置 [pics: 窓の近く・ドアの近く・真ん中・ベッドの横; correct=0]
    qstart = b.mark()
    _, end = b.say(
        "２ばん。" + sl(500) +
        "おんなのひとがへやのことをはなしています。つくえはどこにありますか。" + sl(P_BREATH) +
        "わたしのへやには、まどのちかくにつくえがあります。" +
        "つくえのうえにはパソコンがあります。" + sl(P_Q) +
        "つくえはどこにありますか。",
        "lq1 Q2 机の位置"
    )
    ts["lq1_q2"] = {"start": qstart, "end": round(end), "correct": 0}
    b.silence(7)

    # lq1 Q3 — 天気 [pics: はれ・くもり・あめ・ゆき; correct=3]
    qstart = b.mark()
    _, end = b.say(
        "３ばん。" + sl(500) +
        "おとこのひととおんなのひとがあしたのてんきについてはなしています。" +
        "あしたのてんきはどうですか。" + sl(P_BREATH) +
        "あしたのてんき、しっていますか。" + sl(P_BREATH) +
        "ニュースでゆきがふるといっていましたよ。" + sl(P_BREATH) +
        "えっ、ゆきですか。さむくなりますね。" + sl(P_Q) +
        "あしたのてんきはどうですか。",
        "lq1 Q3 天気"
    )
    ts["lq1_q3"] = {"start": qstart, "end": round(end), "correct": 3}
    b.silence(7)

    # lq1 Q4 — 地図 [pics: map 4 spots; correct=2(図書館)]
    qstart = b.mark()
    _, end = b.say(
        "４ばん。" + sl(500) +
        "がくせいがせんせいにはなしています。としょかんはどこですか。" + sl(P_BREATH) +
        "せんせい、としょかんはどこですか。" + sl(P_BREATH) +
        "えきからまっすぐあるいて、ゆうびんきょくのとなりにありますよ。" + sl(P_BREATH) +
        "ゆうびんきょくのとなりですね。ありがとうございます。" + sl(P_Q) +
        "としょかんはどこですか。",
        "lq1 Q4 地図"
    )
    ts["lq1_q4"] = {"start": qstart, "end": round(end), "correct": 2}
    b.silence(7)

    # lq1 Q5 — 時間 [text: ８じ・９じ・１０じ・１１じ; correct=1]
    qstart = b.mark()
    _, end = b.say(
        "５ばん。" + sl(500) +
        "おとこのひととおんなのひとがはなしています。かいぎはなんじからはじまりますか。" + sl(P_BREATH) +
        "かいぎはなんじからはじまりますか。" + sl(P_BREATH) +
        "きょうは９じからはじまります。" + sl(P_BREATH) +
        "わかりました。ありがとうございます。" + sl(P_Q) +
        "かいぎはなんじからはじまりますか。",
        "lq1 Q5 時間"
    )
    ts["lq1_q5"] = {"start": qstart, "end": round(end), "correct": 1}
    b.silence(7)

    # lq1 Q6 — 曜日 [text: 月曜日・火曜日・水曜日・木曜日; correct=2]
    qstart = b.mark()
    _, end = b.say(
        "６ばん。" + sl(500) +
        "せんせいがはなしています。テストはなんようびですか。" + sl(P_BREATH) +
        "みなさん、テストはこんしゅうの水曜日です。よくべんきょうしてください。" + sl(P_Q) +
        "テストはなんようびですか。",
        "lq1 Q6 曜日"
    )
    ts["lq1_q6"] = {"start": qstart, "end": round(end), "correct": 2}
    b.silence(7)

    # lq1 Q7 — 持ち物 [scene: ア=かさ イ=おかね ウ=スマホ; options アイ/アウ/イウ/アイウ; correct=0]
    qstart = b.mark()
    _, end = b.say(
        "７ばん。" + sl(500) +
        "おとこのひととおんなのひとがはなしています。" +
        "おんなのひとはあしたなにをもってきますか。" + sl(P_BREATH) +
        "田中さん、あしたのえんそくになにをもってきますか。" + sl(P_BREATH) +
        "えーと、かさとおかねをもってきます。スマートフォンはもってきません。" + sl(P_BREATH) +
        "そうですか。わかりました。" + sl(P_Q) +
        "おんなのひとはあしたなにをもってきますか。",
        "lq1 Q7 持ち物"
    )
    ts["lq1_q7"] = {"start": qstart, "end": round(end), "correct": 0}
    b.silence(7)

    # ════════════════════════════════════════════════════════════════════
    # もんだい２ — 6問
    # ════════════════════════════════════════════════════════════════════
    b.silence(3)
    b.say(
        "もんだい２。" + sl(300) +
        "もんだい２では、はじめにしつもんをきいてください。" +
        "それから、はなしをきいて、もんだいようしの１から４のなかから、" +
        "いちばんいいものをひとつえらんでください。" + sl(P_SECT) +
        "では、１ばんからはじめます。" + sl(1500),
        "もんだい２ intro"
    )

    # lq2 Q1 — スポーツ [pics: サッカー・テニス・すいえい・バスケ; correct=0]
    qstart = b.mark()
    _, end = b.say(
        "１ばん。" + sl(500) +
        "おとこのひとがはなしています。" +
        "おとこのひとはこんしゅうのにちようびになにをしますか。" + sl(P_BREATH) +
        "こんしゅうのにちようびは友だちとサッカーをするつもりです。" +
        "テニスもすきですが、にちようびはサッカーです。" + sl(P_Q) +
        "おとこのひとはこんしゅうのにちようびになにをしますか。",
        "lq2 Q1 スポーツ"
    )
    ts["lq2_q1"] = {"start": qstart, "end": round(end), "correct": 0}
    b.silence(7)

    # lq2 Q2 — 移動手段 [pics: コンビニ・バス・でんしゃ・タクシー; correct=2]
    qstart = b.mark()
    _, end = b.say(
        "２ばん。" + sl(500) +
        "おんなのひとがおとこのひとに電話しています。" +
        "おとこのひとはいまどこにいますか。" + sl(P_BREATH) +
        "もしもし、いまどこにいますか。" + sl(P_BREATH) +
        "でんしゃのなかにいます。もうすぐえきにつきます。" + sl(P_BREATH) +
        "そうですか。わかりました。" + sl(P_Q) +
        "おとこのひとはいまどこにいますか。",
        "lq2 Q2 移動手段"
    )
    ts["lq2_q2"] = {"start": qstart, "end": round(end), "correct": 2}
    b.silence(7)

    # lq2 Q3 — カレンダー [pics: calendar 8日・10日・12日・15日; correct=3]
    qstart = b.mark()
    _, end = b.say(
        "３ばん。" + sl(500) +
        "おとこのひととおんなのひとがはなしています。パーティーはなんにちですか。" + sl(P_BREATH) +
        "パーティーはいつですか。" + sl(P_BREATH) +
        "らいげつの15日です。どようびですよ。" + sl(P_BREATH) +
        "らいげつの15日ですね。わかりました。" + sl(P_Q) +
        "パーティーはなんにちですか。",
        "lq2 Q3 カレンダー"
    )
    ts["lq2_q3"] = {"start": qstart, "end": round(end), "correct": 3}
    b.silence(7)

    # lq2 Q4 — ねこの数 [text: 1ひき・2ひき・3ひき・4ひき; correct=2]
    qstart = b.mark()
    _, end = b.say(
        "４ばん。" + sl(500) +
        "おとこのひととおんなのひとがはなしています。ねこはいまなんびきいますか。" + sl(P_BREATH) +
        "山田さん、ねこはなんびきいますか。" + sl(P_BREATH) +
        "２ひきいましたが、せんげつ１ひきうまれて、いまは３びきいます。" + sl(P_BREATH) +
        "そうですか、かわいいですね。" + sl(P_Q) +
        "ねこはいまなんびきいますか。",
        "lq2 Q4 ねこの数"
    )
    ts["lq2_q4"] = {"start": qstart, "end": round(end), "correct": 2}
    b.silence(7)

    # lq2 Q5 — りんご [pics: 2つ・3つ・4つ・5つ; correct=3]
    qstart = b.mark()
    _, end = b.say(
        "５ばん。" + sl(500) +
        "おんなのひとがはなしています。りんごをいくつかいますか。" + sl(P_BREATH) +
        "きょうスーパーにいって、りんごを５つかいます。ジュースも１ほんかいます。" + sl(P_Q) +
        "りんごをいくつかいますか。",
        "lq2 Q5 りんご"
    )
    ts["lq2_q5"] = {"start": qstart, "end": round(end), "correct": 3}
    b.silence(7)

    # lq2 Q6 — 通学 [pics: バス・じてんしゃ・でんしゃ・くるま; correct=1]
    qstart = b.mark()
    _, end = b.say(
        "６ばん。" + sl(500) +
        "おとこのひとがはなしています。おとこのひとはなんでがっこうにいきますか。" + sl(P_BREATH) +
        "わたしはまいにちじてんしゃでがっこうにいきます。バスはつかいません。" + sl(P_Q) +
        "おとこのひとはなんでがっこうにいきますか。",
        "lq2 Q6 通学"
    )
    ts["lq2_q6"] = {"start": qstart, "end": round(end), "correct": 1}
    b.silence(7)

    # ════════════════════════════════════════════════════════════════════
    # もんだい３ — 5問 (options read aloud)
    # ════════════════════════════════════════════════════════════════════
    b.silence(3)
    b.say(
        "もんだい３。" + sl(300) +
        "もんだい３では、えをみながらしつもんをきいてください。" +
        "やじるしのひとはなんといいますか。" +
        "１から３のなかから、いちばんいいものをひとつえらんでください。" + sl(P_SECT) +
        "では、１ばんからはじめます。" + sl(1500),
        "もんだい３ intro"
    )

    # lq3 Q1 — コンビニで商品受け取り [correct=0: ありがとう]
    qstart = b.mark()
    _, end = b.say(
        "１ばん。" + sl(500) +
        "コンビニで、てんいんさんがしょうひんをわたしています。おきゃくさんはなんといいますか。" + sl(600) +
        "１。ありがとうございます。" + sl(400) +
        "２。すみません、これをください。" + sl(400) +
        "３。いいえ、けっこうです。",
        "lq3 Q1 コンビニ"
    )
    ts["lq3_q1"] = {"start": qstart, "end": round(end), "correct": 0}
    b.silence(6)

    # lq3 Q2 — 友だちの家 [correct=1: おじゃまします]
    qstart = b.mark()
    _, end = b.say(
        "２ばん。" + sl(500) +
        "ともだちのいえにきました。ドアがひらきました。やじるしのひとはなんといいますか。" + sl(600) +
        "１。さようなら。" + sl(400) +
        "２。こんにちは、おじゃまします。" + sl(400) +
        "３。またね。",
        "lq3 Q2 友だちの家"
    )
    ts["lq3_q2"] = {"start": qstart, "end": round(end), "correct": 1}
    b.silence(6)

    # lq3 Q3 — レストランで注文 [correct=1: これをひとつおねがいします]
    qstart = b.mark()
    _, end = b.say(
        "３ばん。" + sl(500) +
        "レストランで、てんいんさんがきました。おきゃくさんはなんといいますか。" + sl(600) +
        "１。おいしかったです。" + sl(400) +
        "２。これをひとつおねがいします。" + sl(400) +
        "３。もうすぐたべます。",
        "lq3 Q3 レストラン"
    )
    ts["lq3_q3"] = {"start": qstart, "end": round(end), "correct": 1}
    b.silence(6)

    # lq3 Q4 — 写真を撮ってもらう [correct=2: しゃしんをとっていただけますか]
    qstart = b.mark()
    _, end = b.say(
        "４ばん。" + sl(500) +
        "かんこうちで、かんこうきゃくがカメラをもってちかづいています。やじるしのひとはなんといいますか。" + sl(600) +
        "１。ありがとうございました。" + sl(400) +
        "２。しゃしんがきれいですね。" + sl(400) +
        "３。すみません、しゃしんをとっていただけますか。",
        "lq3 Q4 写真"
    )
    ts["lq3_q4"] = {"start": qstart, "end": round(end), "correct": 2}
    b.silence(6)

    # lq3 Q5 — 道を尋ねる [correct=0: えきはどこですか]
    qstart = b.mark()
    _, end = b.say(
        "５ばん。" + sl(500) +
        "えきのまえで、ちずをもったひとがとおりすがりのひとにこえをかけています。やじるしのひとはなんといいますか。" + sl(600) +
        "１。すみません、えきはどこですか。" + sl(400) +
        "２。でんしゃにのります。" + sl(400) +
        "３。いいえ、ちがいます。",
        "lq3 Q5 道を尋ねる"
    )
    ts["lq3_q5"] = {"start": qstart, "end": round(end), "correct": 0}
    b.silence(6)

    # ════════════════════════════════════════════════════════════════════
    # もんだい４ — 6問 (options read aloud, no image)
    # ════════════════════════════════════════════════════════════════════
    b.silence(3)
    b.say(
        "もんだい４。" + sl(300) +
        "もんだい４では、えなどがありません。まずぶんをきいてください。" +
        "それから、そのへんじをきいて、１から３のなかから、" +
        "いちばんいいものをひとつえらんでください。" + sl(P_SECT) +
        "では、１ばんからはじめます。" + sl(1500),
        "もんだい４ intro"
    )

    # lq4 Q1 [correct=1: とてもたのしかったです]
    qstart = b.mark()
    _, end = b.say(
        "１ばん。" + sl(500) +
        "きょうのじゅぎょうはどうでしたか。" + sl(600) +
        "１。らいしゅうもあります。" + sl(400) +
        "２。とてもたのしかったです。" + sl(400) +
        "３。きょうはやすみです。",
        "lq4 Q1"
    )
    ts["lq4_q1"] = {"start": qstart, "end": round(end), "correct": 1}
    b.silence(6)

    # lq4 Q2 [correct=0: いいですね。いきましょう]
    qstart = b.mark()
    _, end = b.say(
        "２ばん。" + sl(500) +
        "いっしょにえいがをみにいきませんか。" + sl(600) +
        "１。いいですね。いきましょう。" + sl(400) +
        "２。えいがは３じかんありました。" + sl(400) +
        "３。えいがかんはあそこです。",
        "lq4 Q2"
    )
    ts["lq4_q2"] = {"start": qstart, "end": round(end), "correct": 0}
    b.silence(6)

    # lq4 Q3 [correct=2: ありがとうございます。おねがいします]
    qstart = b.mark()
    _, end = b.say(
        "３ばん。" + sl(500) +
        "このにもつ、おもいですね。もちましょうか。" + sl(600) +
        "１。にもつはかばんです。" + sl(400) +
        "２。はい、でもだいじょうぶです。" + sl(400) +
        "３。ありがとうございます。おねがいします。",
        "lq4 Q3"
    )
    ts["lq4_q3"] = {"start": qstart, "end": round(end), "correct": 2}
    b.silence(6)

    # lq4 Q4 [correct=1: ねつがあったので、いけませんでした]
    qstart = b.mark()
    _, end = b.say(
        "４ばん。" + sl(500) +
        "きのう、パーティーにきませんでしたね。" + sl(600) +
        "１。パーティーはとてもたのしかったです。" + sl(400) +
        "２。ええ、ねつがあったので、いけませんでした。" + sl(400) +
        "３。パーティーはらいしゅうです。",
        "lq4 Q4"
    )
    ts["lq4_q4"] = {"start": qstart, "end": round(end), "correct": 1}
    b.silence(6)

    # lq4 Q5 [correct=0: おもしろかったですよ]
    qstart = b.mark()
    _, end = b.say(
        "５ばん。" + sl(500) +
        "このほん、もうよみましたか。" + sl(600) +
        "１。はい、おもしろかったですよ。" + sl(400) +
        "２。ほんはとしょかんにあります。" + sl(400) +
        "３。よくほんをよみます。",
        "lq4 Q5"
    )
    ts["lq4_q5"] = {"start": qstart, "end": round(end), "correct": 0}
    b.silence(6)

    # lq4 Q6 [correct=2: はい、でもおもしろいです]
    qstart = b.mark()
    _, end = b.say(
        "６ばん。" + sl(500) +
        "にほんごのべんきょうはむずかしいですか。" + sl(600) +
        "１。にほんごがすきです。" + sl(400) +
        "２。まいにちべんきょうします。" + sl(400) +
        "３。はい、でもおもしろいです。",
        "lq4 Q6"
    )
    ts["lq4_q6"] = {"start": qstart, "end": round(end), "correct": 2}
    b.silence(6)

    # ── Closing ──────────────────────────────────────────────────────────
    b.silence(2)
    b.say("これで、ちょうかいのしけんをおわります。", "Closing")

    return ts


# ── Main ──────────────────────────────────────────────────────────────────

def main():
    print(f"🎙  N5 Listening audio generator")
    print(f"   Voice={VOICE}  Rate={RATE}  Timeout={SAY_TIMEOUT}s/call")
    TMPDIR.mkdir(parents=True, exist_ok=True)

    b = Builder()
    t0 = time.time()
    ts = build(b)
    elapsed = time.time() - t0
    print(f"\n⏳ Generation: {elapsed:.0f}s")

    b.build()

    OUT_TS.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_TS, 'w', encoding='utf-8') as f:
        json.dump(ts, f, ensure_ascii=False, indent=2)
    print(f"✓  Timestamps → {OUT_TS}")

    print("\n── Timestamps ─────────────────────────────────────────────")
    for k, v in ts.items():
        print(f"  {k:10s}  {v['start']:4d}s → {v['end']:4d}s  correct={v['correct']}")
    print("──────────────────────────────────────────────────────────")

if __name__ == "__main__":
    main()
