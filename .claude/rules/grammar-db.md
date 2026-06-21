---

description: Rules for creating, enriching, reviewing, and fixing Japanese grammar database records
alwaysApply: true
-----------------

## Purpose

This rule applies when creating, importing, enriching, reviewing, or fixing Japanese grammar database records.

The goal is to create a clean, consistent, learner-friendly Japanese grammar database for Vietnamese learners.

Prioritize:

* correctness
* consistency
* natural Vietnamese
* clear formation rules
* clean JSON data
* search-friendly display
* no fake grammar points

---

## Core principle

A grammar record should represent a grammar item that learners would naturally search for and study as a separate item.

Do not define grammar records only by the smallest possible string.

Examples that should be separate records:

* 〜こと
* 〜ことだ
* 〜ことがある
* 〜ことができる
* 〜ことにする
* 〜ことになる
* 〜ようだ
* 〜ようにする
* 〜ようになる
* 〜ように言う

---

## Language rules

All learner-facing content must be written in Vietnamese.

This includes:

* meaning_vi
* short meaning
* explanation_vi
* nuance_vi
* notes
* differences
* tags
* example translations

Do not mix English into Vietnamese explanations.

English is allowed only for:

* code identifiers
* JSON keys
* database column names
* table names
* package names
* API names

Japanese grammar patterns and examples must remain Japanese.

---

## Pattern display rules

Use `pattern` for the normalized grammar pattern.

Use `display_pattern` for user-facing display.

If the grammar attaches to something before it, `display_pattern` must start with `〜`.

Examples:

```json
{
  "pattern": "たい",
  "display_pattern": "〜たい"
}
```

```json
{
  "pattern": "てしまう",
  "display_pattern": "〜てしまう"
}
```

For two-part patterns, show the full structure.

Examples:

```json
{
  "pattern": "しかない",
  "display_pattern": "しか〜ない"
}
```

```json
{
  "pattern": "ばほど",
  "display_pattern": "〜ば〜ほど"
}
```

Search results must display `display_pattern`, JLPT tag, and short meaning.

---

## Same surface pattern rules

If the same visible pattern has different meanings, formations, usage, or JLPT levels, create separate grammar records.

Do not merge different grammar functions only because they look the same.

Examples that should be separated:

```text
〜そうだ: nghe nói là
〜そうだ: có vẻ, sắp
```

```text
〜ため: vì, do
〜ために: để, nhằm
```

```text
〜と: và, với
〜と: trích dẫn
〜と: nếu... thì...
```

Each separated record must have its own:

* slug
* meaning_vi
* explanation_vi
* formation
* examples
* JLPT tag

---

## Grouping rules

If multiple patterns share the same formation and are usually taught together, they may be grouped into one record.

Different meanings inside the same grouped record should be separated in `senses`.

Example:

```text
だけあって／だけに／だけのことはある
```

These may be grouped because they are closely related and share similar formation.

Use grouping only when:

* formation is the same or almost the same
* meaning is closely related
* learners benefit from seeing them together
* the patterns are commonly taught together

Do not group patterns only because they share one word.

---

## Grammar notation rules

Always use these notation labels:

* V
* A-い
* A-な
* N

Do not use:

* Verb
* Noun
* i-adjective
* na-adjective
* dictionary form
* plain form
* masu-stem

Use Vietnamese/Japanese notation instead.

Good:

```text
V-ます bỏ ます + たい
Vて + しまう
Vた + ことがある
A-い + です
A-い bỏ い + くなる
A-な + に
A-な bỏ な + そうだ
N + の + ようだ
```

Bad:

```text
Verb stem + たい
i-adjective + です
na-adjective + に
dictionary form + こと
```

---

## Formation rules

Formation must be explicit, short, and easy to render in UI.

Use `remove` when an ending is removed.

Good:

```json
{
  "left": "V-ます",
  "remove": "ます",
  "right": "たい"
}
```

```json
{
  "left": "A-い",
  "remove": "い",
  "right": "くなる"
}
```

```json
{
  "left": "N",
  "remove": null,
  "right": "のために"
}
```

Avoid duplicated endings.

Bad:

```text
V-ます bỏ ます + ます + たい
```

Good:

```text
V-ます bỏ ます + たい
```

---

## Particles as grammar

Particles are grammar points and must be included.

However, particles must be separated by meaning and usage.

Example for `と`:

* 〜と: và, với
* 〜と: trích dẫn
* 〜と: nếu... thì...
* 〜と: ngay khi...

Do not merge all particle meanings into one record.

---

## Derived pattern rules

Derived patterns should be separate records if learners commonly study or search them as independent grammar items.

Examples:

* 〜ようだ
* 〜ようにする
* 〜ようになる
* 〜こと
* 〜ことだ
* 〜ことがある
* 〜ことができる
* 〜ことにする
* 〜ことになる

Do not force these into one parent grammar record.

---

## Variant rules

Variants are alternative forms of the same grammar function.

Store them in `variants`, not as unrelated grammar records.

Examples:

```text
〜てしまう
〜ちゃう
〜じゃう
```

```text
〜なければならない
〜なきゃならない
```

Negative, past, and past negative forms may also be stored as variants.

Example:

```json
[
  {
    "pattern": "たくない",
    "display_pattern": "〜たくない",
    "type": "negative"
  },
  {
    "pattern": "たかった",
    "display_pattern": "〜たかった",
    "type": "past"
  }
]
```

---

## Common pair rules

Common pairs are frequently co-occurring expressions.

They are not always separate grammar records.

Examples:

* もし〜たら
* つい〜てしまう
* まるで〜ようだ
* たとえ〜ても
* いくら〜ても
* どんなに〜ても

Store these in `common_pairs` when they support the main grammar pattern.

If the full two-part structure is commonly studied as a grammar item, it can be a separate record.

Example:

```text
しか〜ない
〜ば〜ほど
〜だけでなく〜も
```

---

## Sense rules

Use `senses` when one grammar record has multiple closely related meanings with the same formation.

Good case:

```text
〜ている
```

Possible senses:

* đang làm
* đang ở trạng thái
* thường xuyên làm

Do not create separate records when only the nuance changes but formation and core grammar are the same.

---

## Similar grammar rules

Only compare grammar points that are genuinely close in meaning or usage.

Good:

* ようだ vs みたい
* ようだ vs らしい
* そうだ vs ようだ
* なければならない vs なくてはいけない

Bad:

* てしまう vs ておく
* から vs ようだ
* たい vs そうだ

---

## Difference explanation rules

Differences must focus on:

* nuance
* formality
* spoken/written usage
* speaker intention
* certainty
* natural context

Avoid vague comparison.

Bad:

```text
A và B đều có nghĩa là giống như.
```

Good:

```text
`ようだ` trang trọng hơn và thường dùng trong văn viết hoặc giải thích khách quan. `みたい` tự nhiên hơn trong hội thoại hằng ngày.
```

---

## Example rules

Each grammar record should have exactly 3 examples by default.

Examples must be:

* natural Japanese
* suitable for the JLPT level
* short enough for learners
* useful in daily life
* focused on the target grammar pattern

Vietnamese translations must be natural, not word-by-word.

Each example must include furigana data.

Example shape:

```json
{
  "sentence_jp": "日本へ行きたいです。",
  "translation_vi": "Tôi muốn đi Nhật.",
  "ruby": [
    {
      "base": "日本",
      "reading": "にほん"
    },
    {
      "base": "行",
      "reading": "い"
    }
  ]
}
```

Use ruby only for kanji words that need reading support.

Do not add furigana to kana-only words.

For verbs, attach furigana to the kanji part when possible.

Good:

```json
{
  "base": "行",
  "reading": "い"
}
```

Avoid:

```json
{
  "base": "行きたい",
  "reading": "いきたい"
}
```

---

## Special case rules

Use `special_cases` for irregular or notable transformations.

Examples:

```text
いい → よさそう
ない → なさそう
```

Do not hide special cases inside long explanations.

---

## Register rules

Use `register` when a grammar point has a clear usage style.

Possible values:

* casual
* polite
* spoken
* written
* formal

Do not add register if it is not meaningful.

---

## JLPT rules

Respect the intended JLPT level.

Do not mark advanced grammar as N5.

For N5, prioritize beginner grammar from common beginner materials.

If unsure whether a grammar is N5, do not include it aggressively.

---

## Non-grammar exclusion rules

Do not create grammar records for normal vocabulary or interrogative words unless they form a grammar structure.

Not grammar by themselves:

* どう
* どこ
* いつ
* だれ
* 何
* 何曜日
* どのぐらい
* どれ
* どちら
* いくら

These belong to vocabulary unless used inside a clear grammar pattern.

---

## Required JSON fields

Each grammar item should follow this general shape:

```json
{
  "id": "n5_001",
  "slug": "tai",
  "pattern": "たい",
  "display_pattern": "〜たい",
  "reading": "たい",
  "jlpt_level": "N5",
  "meaning_vi": "muốn làm",
  "explanation_vi": "Gắn với động từ để diễn tả mong muốn của người nói hoặc người được hỏi.",
  "nuance_vi": "Thường dùng cho mong muốn của bản thân; khi nói về người khác cần thêm cách diễn đạt phù hợp.",
  "formation": [],
  "reading_rules": [],
  "variants": [],
  "short_forms": [],
  "common_pairs": [],
  "senses": [],
  "notes": [],
  "special_cases": [],
  "register": null,
  "similar_grammar": [],
  "differences": [],
  "tags": [],
  "examples": []
}
```

Do not remove fields from the schema.

Use empty arrays when there is no data.

Use `null` only when the field is intentionally empty and scalar.

---

Scalar fields:
- use null when empty

Array fields:
- use []

Never use empty string "".

---

## Data quality checklist

Before finishing grammar data, verify:

* every item is a real grammar point
* no normal vocabulary is included as grammar
* `display_pattern` is search-friendly
* `〜` is used when needed
* same surface patterns are separated when meaning or formation differs
* related patterns are grouped only when formation and usage are close
* formation uses V, A-い, A-な, N
* examples are exactly 3 per item
* examples include furigana
* Vietnamese is natural
* no English labels appear in learner-facing content
* similar grammar comparisons are meaningful
* no duplicate endings such as `ます + ます`
* JSON is valid
