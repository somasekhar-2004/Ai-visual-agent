-- Approximate raw-score -> band conversion tables for objective sections.
-- These are commonly-used community approximations, not official IELTS
-- data, and are intentionally stored in a table so they can be tuned later.
delete from band_conversion_tables;

insert into band_conversion_tables (scale, raw_min, raw_max, band) values
  -- Listening (40 questions, same scale for Academic & General)
  ('listening', 39, 40, 9.0),
  ('listening', 37, 38, 8.5),
  ('listening', 35, 36, 8.0),
  ('listening', 32, 34, 7.5),
  ('listening', 30, 31, 7.0),
  ('listening', 26, 29, 6.5),
  ('listening', 23, 25, 6.0),
  ('listening', 18, 22, 5.5),
  ('listening', 16, 17, 5.0),
  ('listening', 13, 15, 4.5),
  ('listening', 11, 12, 4.0),
  ('listening', 8, 10, 3.5),
  ('listening', 6, 7, 3.0),
  ('listening', 4, 5, 2.5),
  ('listening', 0, 3, 2.0),

  -- Reading Academic (40 questions)
  ('reading_academic', 39, 40, 9.0),
  ('reading_academic', 37, 38, 8.5),
  ('reading_academic', 35, 36, 8.0),
  ('reading_academic', 33, 34, 7.5),
  ('reading_academic', 30, 32, 7.0),
  ('reading_academic', 27, 29, 6.5),
  ('reading_academic', 23, 26, 6.0),
  ('reading_academic', 19, 22, 5.5),
  ('reading_academic', 15, 18, 5.0),
  ('reading_academic', 13, 14, 4.5),
  ('reading_academic', 10, 12, 4.0),
  ('reading_academic', 8, 9, 3.5),
  ('reading_academic', 6, 7, 3.0),
  ('reading_academic', 4, 5, 2.5),
  ('reading_academic', 0, 3, 2.0),

  -- Reading General Training (40 questions, steeper curve)
  ('reading_general', 40, 40, 9.0),
  ('reading_general', 39, 39, 8.5),
  ('reading_general', 37, 38, 8.0),
  ('reading_general', 36, 36, 7.5),
  ('reading_general', 34, 35, 7.0),
  ('reading_general', 32, 33, 6.5),
  ('reading_general', 30, 31, 6.0),
  ('reading_general', 27, 29, 5.5),
  ('reading_general', 23, 26, 5.0),
  ('reading_general', 19, 22, 4.5),
  ('reading_general', 15, 18, 4.0),
  ('reading_general', 12, 14, 3.5),
  ('reading_general', 9, 11, 3.0),
  ('reading_general', 6, 8, 2.5),
  ('reading_general', 0, 5, 2.0);
