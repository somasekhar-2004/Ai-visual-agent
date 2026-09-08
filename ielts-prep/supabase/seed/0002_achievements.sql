insert into achievements (code, title, description, icon, criteria) values
  ('first_mock', 'First Mock', 'Complete your first full mock test', 'ribbon-outline', '{"type":"mock_count","value":1}'),
  ('streak_7', '7 Day Streak', 'Study for 7 days in a row', 'flame-outline', '{"type":"streak_days","value":7}'),
  ('streak_30', '30 Day Streak', 'Study for 30 days in a row', 'flame-outline', '{"type":"streak_days","value":30}'),
  ('band7_reading', 'Band 7 Reading', 'Score Band 7 or higher in a Reading test', 'book-outline', '{"type":"skill_band","skill":"reading","value":7}'),
  ('writing_10', '10 Writing Tasks', 'Submit 10 writing tasks for AI evaluation', 'create-outline', '{"type":"writing_count","value":10}'),
  ('speaking_20', '20 Speaking Sessions', 'Complete 20 speaking practice sessions', 'mic-outline', '{"type":"speaking_count","value":20}'),
  ('questions_100', '100 Questions Completed', 'Answer 100 practice questions', 'checkmark-done-outline', '{"type":"question_count","value":100}')
on conflict (code) do nothing;
