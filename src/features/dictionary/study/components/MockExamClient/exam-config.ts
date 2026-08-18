import { N5_EXAM_COUNTS }    from "@/features/dictionary/study/data/n5-exam"
import { N5_2021_COUNTS }   from "@/features/dictionary/study/data/n5-2021-exam"
import { N5_2024_COUNTS }   from "@/features/dictionary/study/data/n5-2024-exam"
import { N4_2021_COUNTS }   from "@/features/dictionary/study/data/n4-2021-exam"
import { N3_7_2021_COUNTS } from "@/features/dictionary/study/data/n3-7-2021-exam"
import { N3_12_2021_COUNTS }from "@/features/dictionary/study/data/n3-12-2021-exam"
import { N3_7_2022_COUNTS } from "@/features/dictionary/study/data/n3-7-2022-exam"
import { N3_12_2022_COUNTS }from "@/features/dictionary/study/data/n3-12-2022-exam"
import { N3_7_2023_COUNTS } from "@/features/dictionary/study/data/n3-7-2023-exam"
import { N3_12_2023_COUNTS }from "@/features/dictionary/study/data/n3-12-2023-exam"
import type { ExamConfig }  from "./exam-types"

export const EXAM: Record<string, ExamConfig> = {
    N5: {
        duration: 90 * 60,
        passingDisplay: "80",
        passing: { secMin: 19, total: 80 },
        listeningAudio: "/exams/n5/audio/listening.m4a",
        infoRows: [
            { title: "文字・語彙", count: N5_EXAM_COUNTS.vocab },
            { title: "文法・読解", count: N5_EXAM_COUNTS.grammar },
            { title: "聴解",       count: N5_EXAM_COUNTS.listening },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 20,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "＿＿の　ことばは　ひらがなで　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_reading", count: 12 },
                    { id: "q2", label: "問題2", sublabel: "もんだい＿＿＿の　ことばは　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_writing", count: 8  },
                    { id: "q3", label: "問題3", sublabel: "もんだい（　　　）に　なにを　いれますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 10 },
                    { id: "q4", label: "問題4", sublabel: "もんだい４　＿＿の　ぶんと　だいたい　おなじ　いみの　ぶんが　あります。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 40,
                groups: [
                    { id: "q5",  label: "問題1", sublabel: "もんだい（　　　）に何を入れますか。１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 16 },
                    { id: "q6",  label: "問題2", sublabel: "もんだい（★）に入るものはどれですか。１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 5  },
                    { id: "q7",  label: "問題3", sublabel: "もんだい３　つぎの（１）と（２）のぶんしょうを読んで、ぶんしょうのいみを考えて、（　）の中に入るものを、１・２・３・４から一つえらんでください。", type: "grammar_blank", count: 5  },
                    { id: "q8",  label: "問題4", sublabel: "もんだい４　つぎの（１）から（３）のぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 3  },
                    { id: "q9",  label: "問題5", sublabel: "もんだい５　つぎのぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 2  },
                    { id: "q10", label: "問題6", sublabel: "もんだい６　右のページを見て、下のしつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 1  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 30,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "もんだい１では、はじめに　しつもんを　きいて　ください。それから　はなしを　きいて、もんだいようしの　１から４の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_pic",  count: 7 },
                    { id: "lq2", label: "問題2", sublabel: "もんだい２では、まず　しつもんを　きいて　ください。それから　はなしを　きいて、もんだいようしの　１から４の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_pic",  count: 6 },
                    { id: "lq3", label: "問題3", sublabel: "もんだい３では、えを　みながら　しつもんを　きいて　ください。やじるし（→）のひとは　なんと　いいますか。１から３の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_scene", count: 5 },
                    { id: "lq4", label: "問題4", sublabel: "もんだい４では、えなどが　ありません。まず　ぶんを　きいて　ください。それから、その　へんじを　きいて、１から３の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_text",  count: 6 },
                ],
            },
        ],
    },
    "N5-2021": {
        duration: 90 * 60,
        subtitle: "2021年12月",
        passingDisplay: "80",
        passing: { secMin: 19, total: 80 },
        listeningAudio: "/exams/n5-2021/audio/listening.m4a",
        infoRows: [
            { title: "文字・語彙", count: N5_2021_COUNTS.vocab },
            { title: "文法・読解", count: N5_2021_COUNTS.grammar },
            { title: "聴解",       count: N5_2021_COUNTS.listening },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 20,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "＿＿の　ことばは　ひらがなで　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_reading", count: 7 },
                    { id: "q2", label: "問題2", sublabel: "もんだい２　＿＿の　ことばは　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_writing", count: 5 },
                    { id: "q3", label: "問題3", sublabel: "もんだい３　（　　　）に　なにを　いれますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 6 },
                    { id: "q4", label: "問題4", sublabel: "もんだい４　＿＿の　ぶんと　だいたい　おなじ　いみの　ぶんが　あります。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 3 },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 40,
                groups: [
                    { id: "q5",  label: "問題1", sublabel: "もんだい１　（　　　）に　なにを　いれますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "grammar_blank", count: 9  },
                    { id: "q6",  label: "問題2", sublabel: "もんだい２　★に　入る　ものは　どれですか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "grammar_blank", count: 4  },
                    { id: "q7",  label: "問題3", sublabel: "もんだい３　つぎの（１）と（２）のぶんしょうを読んで、ぶんしょうのいみを考えて、（　）の中に入るものを、１・２・３・４から一つえらんでください。", type: "grammar_blank", count: 4  },
                    { id: "q8",  label: "問題4", sublabel: "もんだい４　つぎの（１）から（２）のぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 2  },
                    { id: "q9",  label: "問題5", sublabel: "もんだい５　つぎのぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 2  },
                    { id: "q10", label: "問題6", sublabel: "もんだい６　右のページを見て、下のしつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 1  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 30,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "もんだい１　まず　しつもんを　きいて　ください。それから　はなしを　きいて、もんだいようしの　１から４の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_pic",   count: 7 },
                    { id: "lq2", label: "問題2", sublabel: "もんだい２　では、まず　しつもんを　きいて　ください。それから　はなしを　きいて、もんだいようしの　１から４の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_pic",   count: 6 },
                    { id: "lq3", label: "問題3", sublabel: "もんだい３　では、えを　みながら　しつもんを　きいて　ください。やじるし（→）のひとは　なんと　いいますか。１から３の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_scene", count: 5 },
                    { id: "lq4", label: "問題4", sublabel: "もんだい４　では、えなどが　ありません。まず　ぶんを　きいて　ください。それから、その　へんじを　きいて、１から３の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_text",  count: 6 },
                ],
            },
        ],
    },
    "N5-2024": {
        duration: 90 * 60,
        subtitle: "2024年7月",
        passingDisplay: "80",
        passing: { secMin: 19, total: 80 },
        listeningAudio: "/exams/n5-2024/audio/listening.m4a",
        infoRows: [
            { title: "文字・語彙", count: N5_2024_COUNTS.vocab },
            { title: "文法・読解", count: N5_2024_COUNTS.grammar },
            { title: "聴解",       count: N5_2024_COUNTS.listening },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 20,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "＿＿の　ことばは　ひらがなで　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_reading", count: 7 },
                    { id: "q2", label: "問題2", sublabel: "もんだい２　＿＿の　ことばは　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_writing", count: 5 },
                    { id: "q3", label: "問題3", sublabel: "もんだい３　（　　　）に　なにを　いれますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 6 },
                    { id: "q4", label: "問題4", sublabel: "もんだい４　＿＿の　ぶんと　だいたい　おなじ　いみの　ぶんが　あります。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 3 },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 40,
                groups: [
                    { id: "q5",  label: "問題1", sublabel: "もんだい１　（　　　）に　なにを　いれますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "grammar_blank", count: 9  },
                    { id: "q6",  label: "問題2", sublabel: "もんだい２　★に　入る　ものは　どれですか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "grammar_blank", count: 4  },
                    { id: "q7",  label: "問題3", sublabel: "もんだい３　つぎの（１）と（２）のぶんしょうを読んで、ぶんしょうのいみを考えて、（　）の中に入るものを、１・２・３・４から一つえらんでください。", type: "grammar_blank", count: 4  },
                    { id: "q8",  label: "問題4", sublabel: "もんだい４　つぎの（１）から（２）のぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 2  },
                    { id: "q9",  label: "問題5", sublabel: "もんだい５　つぎのぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 2  },
                    { id: "q10", label: "問題6", sublabel: "もんだい６　右のページを見て、下のしつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 1  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 30,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "もんだい１　まず　しつもんを　きいて　ください。それから　はなしを　きいて、もんだいようしの　１から４の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_pic",   count: 7 },
                    { id: "lq2", label: "問題2", sublabel: "もんだい２　では、まず　しつもんを　きいて　ください。それから　はなしを　きいて、もんだいようしの　１から４の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_pic",   count: 6 },
                    { id: "lq3", label: "問題3", sublabel: "もんだい３　では、えを　みながら　しつもんを　きいて　ください。やじるし（→）のひとは　なんと　いいますか。１から３の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_scene", count: 5 },
                    { id: "lq4", label: "問題4", sublabel: "もんだい４　では、えなどが　ありません。まず　ぶんを　きいて　ください。それから、その　へんじを　きいて、１から３の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_text",  count: 6 },
                ],
            },
        ],
    },
    N4: {
        duration: 115 * 60,
        subtitle: "2021年12月",
        passingDisplay: "90",
        passing: { secMin: 19, total: 90 },
        listeningAudio: "/exams/n4/audio/listening.m4a",
        infoRows: [
            { title: "文字・語彙",  count: N4_2021_COUNTS.vocab },
            { title: "文法・読解",  count: N4_2021_COUNTS.grammar },
            { title: "聴解",        count: N4_2021_COUNTS.listening },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（文字・語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 25,
                groups: [
                    { id: "q1",  label: "問題1", sublabel: "＿＿の　ことばは　ひらがなで　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_reading", count: 7 },
                    { id: "q2",  label: "問題2", sublabel: "もんだい２　＿＿の　ことばは　どう　かきますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "kanji_writing",  count: 4 },
                    { id: "q3",  label: "問題3", sublabel: "もんだい３　（　　　）に　なにを　いれますか。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 8 },
                    { id: "q4",  label: "問題4", sublabel: "もんだい４　＿＿の　ぶんと　だいたい　おなじ　いみの　ぶんが　あります。１・２・３・４から　いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "context_vocab", count: 4 },
                    { id: "q5",  label: "問題5", sublabel: "もんだい５　つぎのことばのつかいかたで、いちばんいいものを１・２・３・４からひとつえらんでください。", type: "context_vocab", count: 4 },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 55,
                groups: [
                    { id: "q6",  label: "問題1", sublabel: "もんだい１　（　　　）に何を入れますか。１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 13 },
                    { id: "q7",  label: "問題2", sublabel: "もんだい２　つぎの文の　★　に入るものはどれですか。１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 4  },
                    { id: "q8",  label: "問題3", sublabel: "もんだい３　（14）から（17）に何を入れますか。ぶんしょうのいみを考えて、１・２・３・４からいちばんいいものをひとつえらんでください。", type: "grammar_blank", count: 4  },
                    { id: "q9",  label: "問題4", sublabel: "もんだい４　つぎのぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 3  },
                    { id: "q10", label: "問題5", sublabel: "もんだい５　つぎのぶんしょうを読んで、しつもんにこたえてください。こたえは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 3  },
                    { id: "q11", label: "問題6", sublabel: "もんだい６　右のページのパソコン教室の案内を見て、下の質問に答えてください。答えは、１・２・３・４からいちばんいいものを一つえらんでください。", type: "grammar_blank", count: 2  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 35,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "もんだい1: もんだい1では、まず　しつもんを　きいて　ください。それから　はなしを　きいて、もんだいようしの　1から4の　なかから、いちばん　いい　ものを　ひとつ　えらんで　ください。", type: "listening_text",  count: 8 },
                    { id: "lq2", label: "問題2", sublabel: "もんだい2: もんだい2では、まず　しつもんを　きいてください。そのあと、もんだいようしを　見てください。読む　時間が　あります。それから　話を聞いて、もんだいようしの　1から4の中から、いちばん　いい　ものを　一つ　えらんで　ください。", type: "listening_text",  count: 7 },
                    { id: "lq3", label: "問題3", sublabel: "もんだい3: もんだい3では、えをみながらしつもんをきいてください。やじるし(→)のひとはなんといいますか。1から3のなかから、いちばんいいものをひとつえらんでください。", type: "listening_scene", count: 5 },
                    { id: "lq4", label: "問題4", sublabel: "もんだい4: もんだい4では、えなどがありません。まずぶんをきいてください。それから、そのへんじをきいて、1から3のなかから、いちばんいいものをひとつえらんでください。", type: "listening_text",  count: 8 },
                ],
            },
        ],
    },
    N3: {
        duration: 140 * 60,
        passingDisplay: "95",
        passing: { secMin: 19, total: 95 },
        infoRows: [
            { title: "語彙",      count: 35 },
            { title: "文法・読解", count: 39 },
            { title: "聴解",      count: 28, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 30,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方",   type: "kanji_reading", count: 10 },
                    { id: "q2", label: "問題2", sublabel: "漢字の書き方",   type: "kanji_writing",   count: 8  },
                    { id: "q3", label: "問題3", sublabel: "語彙形成",        type: "context_vocab", count: 5  },
                    { id: "q4", label: "問題4", sublabel: "文脈規定",        type: "context_vocab", count: 7  },
                    { id: "q5", label: "問題5", sublabel: "言い換え類義",    type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q6", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 20 },
                    { id: "q7", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 10 },
                    { id: "q8", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 9  },
                ],
            },
        ],
    },
    "N3-7-2021": {
        duration: 140 * 60,
        subtitle: "2021年7月",
        passingDisplay: "95",
        passing: { secMin: 19, total: 95 },
        listeningAudio: "/exams/n3-7-2021/audio/listening.mp3",
        infoRows: [
            { title: "語彙",       count: N3_7_2021_COUNTS.vocab },
            { title: "文法・読解", count: N3_7_2021_COUNTS.grammar },
            { title: "聴解",       count: N3_7_2021_COUNTS.listening },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 30,
                groups: [
                    { id: "q1",  label: "問題1", sublabel: "漢字の読み方",  type: "kanji_reading", count: 8  },
                    { id: "q2",  label: "問題2", sublabel: "漢字の書き方",  type: "kanji_writing", count: 6  },
                    { id: "q3",  label: "問題3", sublabel: "文脈規定",       type: "context_vocab", count: 11 },
                    { id: "q4",  label: "問題4", sublabel: "言い換え類義",   type: "context_vocab", count: 5  },
                    { id: "q5",  label: "問題5", sublabel: "用法",           type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q6",  label: "問題1", sublabel: "文の文法1",   type: "grammar_blank", count: 13 },
                    { id: "q7",  label: "問題2", sublabel: "文の文法2",   type: "grammar_blank", count: 5  },
                    { id: "q8",  label: "問題3", sublabel: "文章の文法",  type: "grammar_blank", count: 4  },
                    { id: "q9",  label: "問題4", sublabel: "短文読解",    type: "grammar_blank", count: 4  },
                    { id: "q10", label: "問題5", sublabel: "中文読解",    type: "grammar_blank", count: 6  },
                    { id: "q11", label: "問題6", sublabel: "長文読解",    type: "grammar_blank", count: 4  },
                    { id: "q12", label: "問題7", sublabel: "情報検索",    type: "grammar_blank", count: 2  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 40,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "課題理解",   type: "listening_text",  count: 6 },
                    { id: "lq2", label: "問題2", sublabel: "ポイント理解", type: "listening_text", count: 6 },
                    { id: "lq3", label: "問題3", sublabel: "概要理解",   type: "listening_scene", count: 3 },
                    { id: "lq4", label: "問題4", sublabel: "発話表現",   type: "listening_scene", count: 4 },
                    { id: "lq5", label: "問題5", sublabel: "即時応答",   type: "listening_scene", count: 9 },
                ],
            },
        ],
    },
    "N3-12-2021": {
        duration: 140 * 60,
        subtitle: "2021年12月",
        passingDisplay: "95",
        passing: { secMin: 19, total: 95 },
        listeningAudio: "/exams/n3-12-2021/audio/listening.mp3",
        infoRows: [
            { title: "語彙",       count: N3_12_2021_COUNTS.vocab },
            { title: "文法・読解", count: N3_12_2021_COUNTS.grammar },
            { title: "聴解",       count: N3_12_2021_COUNTS.listening },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 30,
                groups: [
                    { id: "q1",  label: "問題1", sublabel: "漢字の読み方",  type: "kanji_reading", count: 8  },
                    { id: "q2",  label: "問題2", sublabel: "漢字の書き方",  type: "kanji_writing", count: 6  },
                    { id: "q3",  label: "問題3", sublabel: "文脈規定",       type: "context_vocab", count: 11 },
                    { id: "q4",  label: "問題4", sublabel: "言い換え類義",   type: "context_vocab", count: 5  },
                    { id: "q5",  label: "問題5", sublabel: "用法",           type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q6",  label: "問題1", sublabel: "文の文法1",   type: "grammar_blank", count: 13 },
                    { id: "q7",  label: "問題2", sublabel: "文の文法2",   type: "grammar_blank", count: 5  },
                    { id: "q8",  label: "問題3", sublabel: "文章の文法",  type: "grammar_blank", count: 4  },
                    { id: "q9",  label: "問題4", sublabel: "短文読解",    type: "grammar_blank", count: 4  },
                    { id: "q10", label: "問題5", sublabel: "中文読解",    type: "grammar_blank", count: 6  },
                    { id: "q11", label: "問題6", sublabel: "長文読解",    type: "grammar_blank", count: 4  },
                    { id: "q12", label: "問題7", sublabel: "情報検索",    type: "grammar_blank", count: 2  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 40,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "課題理解",   type: "listening_text",  count: 6 },
                    { id: "lq2", label: "問題2", sublabel: "ポイント理解", type: "listening_text", count: 6 },
                    { id: "lq3", label: "問題3", sublabel: "概要理解",   type: "listening_scene", count: 3 },
                    { id: "lq4", label: "問題4", sublabel: "発話表現",   type: "listening_scene", count: 4 },
                    { id: "lq5", label: "問題5", sublabel: "即時応答",   type: "listening_scene", count: 9 },
                ],
            },
        ],
    },
    "N3-12-2022": {
        duration: 140 * 60,
        subtitle: "2022年12月",
        passingDisplay: "95",
        passing: { secMin: 19, total: 95 },
        listeningAudio: "/exams/n3-12-2022/audio/listening.mp3",
        infoRows: [
            { title: "語彙",       count: N3_12_2022_COUNTS.vocab },
            { title: "文法・読解", count: N3_12_2022_COUNTS.grammar },
            { title: "聴解",       count: N3_12_2022_COUNTS.listening },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 30,
                groups: [
                    { id: "q1",  label: "問題1", sublabel: "漢字の読み方",  type: "kanji_reading", count: 8  },
                    { id: "q2",  label: "問題2", sublabel: "漢字の書き方",  type: "kanji_writing", count: 6  },
                    { id: "q3",  label: "問題3", sublabel: "文脈規定",       type: "context_vocab", count: 11 },
                    { id: "q4",  label: "問題4", sublabel: "言い換え類義",   type: "context_vocab", count: 5  },
                    { id: "q5",  label: "問題5", sublabel: "用法",           type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q6",  label: "問題1", sublabel: "文の文法1",   type: "grammar_blank", count: 13 },
                    { id: "q7",  label: "問題2", sublabel: "文の文法2",   type: "grammar_blank", count: 5  },
                    { id: "q8",  label: "問題3", sublabel: "文章の文法",  type: "grammar_blank", count: 4  },
                    { id: "q9",  label: "問題4", sublabel: "短文読解",    type: "grammar_blank", count: 4  },
                    { id: "q10", label: "問題5", sublabel: "中文読解",    type: "grammar_blank", count: 6  },
                    { id: "q11", label: "問題6", sublabel: "長文読解",    type: "grammar_blank", count: 4  },
                    { id: "q12", label: "問題7", sublabel: "情報検索",    type: "grammar_blank", count: 2  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 40,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "課題理解",     type: "listening_scene", count: 6 },
                    { id: "lq2", label: "問題2", sublabel: "ポイント理解",  type: "listening_scene", count: 6 },
                    { id: "lq3", label: "問題3", sublabel: "概要理解",     type: "listening_scene", count: 3 },
                    { id: "lq4", label: "問題4", sublabel: "発話表現",     type: "listening_scene", count: 4 },
                    { id: "lq5", label: "問題5", sublabel: "即時応答",     type: "listening_scene", count: 9 },
                ],
            },
        ],
    },
    "N3-7-2022": {
        duration: 140 * 60,
        subtitle: "2022年7月",
        passingDisplay: "95",
        passing: { secMin: 19, total: 95 },
        listeningAudio: "/exams/n3-7-2022/audio/listening.mp3",
        infoRows: [
            { title: "語彙",       count: N3_7_2022_COUNTS.vocab },
            { title: "文法・読解", count: N3_7_2022_COUNTS.grammar },
            { title: "聴解",       count: N3_7_2022_COUNTS.listening },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 30,
                groups: [
                    { id: "q1",  label: "問題1", sublabel: "漢字の読み方",  type: "kanji_reading", count: 7  },
                    { id: "q2",  label: "問題2", sublabel: "漢字の書き方",  type: "kanji_writing", count: 6  },
                    { id: "q3",  label: "問題3", sublabel: "文脈規定",       type: "context_vocab", count: 11 },
                    { id: "q4",  label: "問題4", sublabel: "言い換え類義",   type: "context_vocab", count: 5  },
                    { id: "q5",  label: "問題5", sublabel: "用法",           type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q6",  label: "問題1", sublabel: "文の文法1",   type: "grammar_blank", count: 13 },
                    { id: "q7",  label: "問題2", sublabel: "文の文法2",   type: "grammar_blank", count: 5  },
                    { id: "q8",  label: "問題3", sublabel: "文章の文法",  type: "grammar_blank", count: 4  },
                    { id: "q9",  label: "問題4", sublabel: "短文読解",    type: "grammar_blank", count: 4  },
                    { id: "q10", label: "問題5", sublabel: "中文読解",    type: "grammar_blank", count: 6  },
                    { id: "q11", label: "問題6", sublabel: "長文読解",    type: "grammar_blank", count: 4  },
                    { id: "q12", label: "問題7", sublabel: "情報検索",    type: "grammar_blank", count: 2  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 40,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "課題理解",   type: "listening_text",  count: 6 },
                    { id: "lq2", label: "問題2", sublabel: "ポイント理解", type: "listening_text", count: 6 },
                    { id: "lq3", label: "問題3", sublabel: "概要理解",   type: "listening_scene", count: 3 },
                    { id: "lq4", label: "問題4", sublabel: "発話表現",   type: "listening_scene", count: 4 },
                    { id: "lq5", label: "問題5", sublabel: "即時応答",   type: "listening_scene", count: 9 },
                ],
            },
        ],
    },
    "N3-7-2023": {
        duration: 140 * 60,
        subtitle: "2023年7月",
        passingDisplay: "95",
        passing: { secMin: 19, total: 95 },
        listeningAudio: "/exams/n3-7-2023/audio/listening.mp3",
        infoRows: [
            { title: "語彙",       count: N3_7_2023_COUNTS.vocab },
            { title: "文法・読解", count: N3_7_2023_COUNTS.grammar },
            { title: "聴解",       count: N3_7_2023_COUNTS.listening },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 30,
                groups: [
                    { id: "q1",  label: "問題1", sublabel: "漢字の読み方",  type: "kanji_reading", count: 8  },
                    { id: "q2",  label: "問題2", sublabel: "漢字の書き方",  type: "kanji_writing", count: 6  },
                    { id: "q3",  label: "問題3", sublabel: "文脈規定",       type: "context_vocab", count: 11 },
                    { id: "q4",  label: "問題4", sublabel: "言い換え類義",   type: "context_vocab", count: 5  },
                    { id: "q5",  label: "問題5", sublabel: "用法",           type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q6",  label: "問題1", sublabel: "文の文法1",   type: "grammar_blank", count: 13 },
                    { id: "q7",  label: "問題2", sublabel: "文の文法2",   type: "grammar_blank", count: 5  },
                    { id: "q8",  label: "問題3", sublabel: "文章の文法",  type: "grammar_blank", count: 4  },
                    { id: "q9",  label: "問題4", sublabel: "短文読解",    type: "grammar_blank", count: 4  },
                    { id: "q10", label: "問題5", sublabel: "中文読解",    type: "grammar_blank", count: 6  },
                    { id: "q11", label: "問題6", sublabel: "長文読解",    type: "grammar_blank", count: 4  },
                    { id: "q12", label: "問題7", sublabel: "情報検索",    type: "grammar_blank", count: 2  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 40,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "課題理解",     type: "listening_scene", count: 6 },
                    { id: "lq2", label: "問題2", sublabel: "ポイント理解",  type: "listening_scene", count: 6 },
                    { id: "lq3", label: "問題3", sublabel: "概要理解",     type: "listening_scene", count: 3 },
                    { id: "lq4", label: "問題4", sublabel: "発話表現",     type: "listening_scene", count: 4 },
                    { id: "lq5", label: "問題5", sublabel: "即時応答",     type: "listening_scene", count: 9 },
                ],
            },
        ],
    },
    "N3-12-2023": {
        duration: 140 * 60,
        subtitle: "2023年12月",
        passingDisplay: "95",
        passing: { secMin: 19, total: 95 },
        listeningAudio: "/exams/n3-12-2023/audio/listening.mp3",
        infoRows: [
            { title: "語彙",       count: N3_12_2023_COUNTS.vocab },
            { title: "文法・読解", count: N3_12_2023_COUNTS.grammar },
            { title: "聴解",       count: N3_12_2023_COUNTS.listening },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙）", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 30,
                groups: [
                    { id: "q1",  label: "問題1", sublabel: "漢字の読み方",  type: "kanji_reading", count: 8  },
                    { id: "q2",  label: "問題2", sublabel: "漢字の書き方",  type: "kanji_writing", count: 6  },
                    { id: "q3",  label: "問題3", sublabel: "文脈規定",       type: "context_vocab", count: 11 },
                    { id: "q4",  label: "問題4", sublabel: "言い換え類義",   type: "context_vocab", count: 5  },
                    { id: "q5",  label: "問題5", sublabel: "用法",           type: "context_vocab", count: 5  },
                ],
            },
            {
                id: "grammar", title: "言語知識（文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q6",  label: "問題1", sublabel: "文の文法1",   type: "grammar_blank", count: 13 },
                    { id: "q7",  label: "問題2", sublabel: "文の文法2",   type: "grammar_blank", count: 5  },
                    { id: "q8",  label: "問題3", sublabel: "文章の文法",  type: "grammar_blank", count: 4  },
                    { id: "q9",  label: "問題4", sublabel: "短文読解",    type: "grammar_blank", count: 4  },
                    { id: "q10", label: "問題5", sublabel: "中文読解",    type: "grammar_blank", count: 6  },
                    { id: "q11", label: "問題6", sublabel: "長文読解",    type: "grammar_blank", count: 4  },
                    { id: "q12", label: "問題7", sublabel: "情報検索",    type: "grammar_blank", count: 2  },
                ],
            },
            {
                id: "listening", title: "聴解", titleVi: "Nghe hiểu", allocMin: 40,
                groups: [
                    { id: "lq1", label: "問題1", sublabel: "課題理解",     type: "listening_scene", count: 6 },
                    { id: "lq2", label: "問題2", sublabel: "ポイント理解",  type: "listening_scene", count: 6 },
                    { id: "lq3", label: "問題3", sublabel: "概要理解",     type: "listening_scene", count: 3 },
                    { id: "lq4", label: "問題4", sublabel: "発話表現",     type: "listening_scene", count: 4 },
                    { id: "lq5", label: "問題5", sublabel: "即時応答",     type: "listening_scene", count: 9 },
                ],
            },
        ],
    },
    N2: {
        duration: 155 * 60,
        passingDisplay: "90",
        passing: { secMin: 19, total: 90 },
        infoRows: [
            { title: "語彙",       count: 27 },
            { title: "文法・読解",  count: 48 },
            { title: "聴解",        count: 30, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 40,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方", type: "kanji_reading", count: 5 },
                    { id: "q2", label: "問題2", sublabel: "語彙形成",      type: "context_vocab", count: 5 },
                    { id: "q3", label: "問題3", sublabel: "文脈規定",      type: "context_vocab", count: 7 },
                    { id: "q4", label: "問題4", sublabel: "言い換え類義",  type: "context_vocab", count: 5 },
                    { id: "q5", label: "問題5", sublabel: "用法",          type: "context_vocab", count: 5 },
                ],
            },
            {
                id: "grammar", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 65,
                groups: [
                    { id: "q6", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 25 },
                    { id: "q7", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 15 },
                    { id: "q8", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 8  },
                ],
            },
        ],
    },
    N1: {
        duration: 165 * 60,
        passingDisplay: "100",
        passing: { secMin: 19, total: 100 },
        infoRows: [
            { title: "語彙",       count: 24 },
            { title: "文法・読解",  count: 46 },
            { title: "聴解",        count: 35, skipped: true },
        ],
        sections: [
            {
                id: "vocab", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Từ vựng", allocMin: 40,
                groups: [
                    { id: "q1", label: "問題1", sublabel: "漢字の読み方", type: "kanji_reading", count: 6 },
                    { id: "q2", label: "問題2", sublabel: "文脈規定",      type: "context_vocab", count: 7 },
                    { id: "q3", label: "問題3", sublabel: "言い換え類義",  type: "context_vocab", count: 6 },
                    { id: "q4", label: "問題4", sublabel: "用法",          type: "context_vocab", count: 5 },
                ],
            },
            {
                id: "grammar", title: "言語知識（語彙・文法）・読解", titleVi: "Ngôn ngữ — Ngữ pháp", allocMin: 70,
                groups: [
                    { id: "q5", label: "問題1", sublabel: "文の文法1",  type: "grammar_blank", count: 25 },
                    { id: "q6", label: "問題2", sublabel: "文の文法2",  type: "grammar_blank", count: 15 },
                    { id: "q7", label: "問題3", sublabel: "文章の文法", type: "grammar_blank", count: 6  },
                ],
            },
        ],
    },
}
