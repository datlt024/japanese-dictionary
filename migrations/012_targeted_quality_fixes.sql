-- Migration 012: Sửa lỗi dịch còn sót sau audit toàn diện
--
-- Các vấn đề còn lại sau migration 007-011b (tổng 217k senses):
--
-- (A) "được sử dụng hết / được tiêu thụ" — machine translation của "to be used up"
--     5 từ: 尽きる、無くなる、溶ける、費える、無うなる
--
-- (B) 召す sense 4: "mua; mua" — dedup còn sót
--     召す sense 12: "biểu thị sự tôn trọng" — aux-v sense, nên ẩn
--
-- (C) 模様 sense 2: "tình trạng; tình trạng" — dedup còn sót
--     模様 sense 5: "chỉ ra rằng điều gì đó có vẻ..." — meta-ngôn ngữ
--
-- Idempotent.

-- ================================================================
-- A. Fix "được sử dụng hết / được tiêu thụ / được giảm xuống bằng không"
-- ================================================================

-- A1. 尽きる — "cạn kiệt; sắp hết; kiệt sức; tiêu hết; đến hồi kết"
UPDATE vocabulary_senses
SET    meaning_vi = 'cạn kiệt; sắp hết; kiệt sức; tiêu hết; đến hồi kết'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '尽きる' AND primary_kana = 'つきる'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 1
  AND  meaning_vi LIKE '%được sử dụng hết%';

-- A2. 無くなる sense 2 — "cạn; sắp hết; kiệt sức; tiêu hết; giảm về không"
UPDATE vocabulary_senses
SET    meaning_vi = 'cạn; sắp hết; kiệt sức; tiêu hết; giảm về không'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '無くなる' AND primary_kana = 'なくなる'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 2
  AND  meaning_vi LIKE '%được sử dụng hết%';

-- A3. 溶ける sense 3 — "tiêu tan (tiền bạc hoặc thời gian); bị lãng phí; tan biến"
UPDATE vocabulary_senses
SET    meaning_vi = 'tiêu tan (tiền bạc hoặc thời gian); bị lãng phí; tan biến'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '溶ける' AND primary_kana = 'とける'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 3
  AND  meaning_vi LIKE '%được sử dụng hết%';

-- A4. 費える sense 1 — "tiêu hết (tiền, tiền tiết kiệm); cạn dần"
UPDATE vocabulary_senses
SET    meaning_vi = 'tiêu hết (tiền, tiền tiết kiệm); cạn dần'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '費える' AND primary_kana = 'ついえる'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 1
  AND  meaning_vi LIKE '%được sử dụng hết%';

-- A5. 無うなる sense 2 (biến thể cổ của 無くなる)
UPDATE vocabulary_senses
SET    meaning_vi = 'cạn; sắp hết; kiệt sức; tiêu hết'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '無うなる' AND primary_kana = 'のうなる'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 2
  AND  meaning_vi LIKE '%được sử dụng hết%';

-- ================================================================
-- B. 召す — ẩn sense aux-v và sửa sense bị lặp
-- ================================================================

-- B1. 召す sense 4: "mua; mua" → "mua"
UPDATE vocabulary_senses
SET    meaning_vi = 'mua'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '召す' AND primary_kana = 'めす'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 4
  AND  meaning_vi = 'mua; mua';

-- B2. 召す sense 9: "để tấn công ưa thích của một người; để làm hài lòng một"
--     — dịch sai "to suit one's fancy; to please"
UPDATE vocabulary_senses
SET    meaning_vi = 'hợp khẩu vị; ưa thích; làm hài lòng'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '召す' AND primary_kana = 'めす'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 9
  AND  meaning_vi LIKE '%tấn công ưa thích%';

-- B3. 召す sense 12: "biểu thị sự tôn trọng" — aux-v, nên ẩn như migration 006 đã làm với aux-v
UPDATE vocabulary_senses
SET    is_hidden = true
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '召す' AND primary_kana = 'めす'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 12
  AND  meaning_vi LIKE '%biểu thị sự tôn trọng%';

-- ================================================================
-- C. 模様 — sửa dedup và meta-ngôn ngữ
-- ================================================================

-- C1. 模様 sense 2: "tình trạng; tình trạng" → "tình trạng; tình huống"
UPDATE vocabulary_senses
SET    meaning_vi = 'tình trạng; tình huống'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '模様' AND primary_kana = 'もよう'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 2
  AND  meaning_vi = 'tình trạng; tình trạng';

-- C2. 模様 sense 5: "chỉ ra rằng điều gì đó có vẻ có thể xảy ra (ví dụ: mưa hoặc bão)"
--     → "có vẻ như (sắp xảy ra); dường như (thời tiết xấu...)"
UPDATE vocabulary_senses
SET    meaning_vi = 'có vẻ như (sắp xảy ra); dường như (có mưa, bão...)'
WHERE  vocabulary_id = (
           SELECT id FROM vocabularies
           WHERE  primary_word = '模様' AND primary_kana = 'もよう'
           ORDER BY id LIMIT 1
       )
  AND  sense_index = 5
  AND  meaning_vi LIKE '%chỉ ra rằng%';

-- ================================================================
-- Xác nhận kết quả
-- ================================================================
SELECT
    v.primary_word,
    v.primary_kana,
    vs.sense_index,
    vs.is_hidden,
    vs.meaning_vi
FROM vocabularies v
JOIN vocabulary_senses vs ON vs.vocabulary_id = v.id
WHERE v.primary_word IN ('尽きる','無くなる','溶ける','費える','無うなる','召す','模様')
  AND v.primary_kana IN ('つきる','なくなる','とける','ついえる','のうなる','めす','もよう')
ORDER BY v.primary_word, vs.sense_index;
