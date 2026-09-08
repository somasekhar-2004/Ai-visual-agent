insert into mock_tests (id, title, ielts_type, is_free) values
('60000000-0000-0000-0000-000000000001', 'IELTS Academic Full Mock Test 1', 'academic', true),
('60000000-0000-0000-0000-000000000002', 'IELTS General Training Full Mock Test 1', 'general', false);

-- Academic mock: Listening -> Reading -> Writing -> Speaking
insert into mock_sections (mock_test_id, skill, order_index, duration_minutes, content_ref) values
('60000000-0000-0000-0000-000000000001', 'listening', 1, 30,
 jsonb_build_object('trackIds', jsonb_build_array('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'))),
('60000000-0000-0000-0000-000000000001', 'reading', 2, 60,
 jsonb_build_object('passageIds', jsonb_build_array('20000000-0000-0000-0000-000000000001'))),
('60000000-0000-0000-0000-000000000001', 'writing', 3, 60,
 jsonb_build_object('writingPromptIds', jsonb_build_array('40000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003'))),
('60000000-0000-0000-0000-000000000001', 'speaking', 4, 14,
 jsonb_build_object('speakingTopicIds', jsonb_build_array('50000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000005')));

-- General Training mock
insert into mock_sections (mock_test_id, skill, order_index, duration_minutes, content_ref) values
('60000000-0000-0000-0000-000000000002', 'listening', 1, 30,
 jsonb_build_object('trackIds', jsonb_build_array('30000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002'))),
('60000000-0000-0000-0000-000000000002', 'reading', 2, 60,
 jsonb_build_object('passageIds', jsonb_build_array('20000000-0000-0000-0000-000000000002'))),
('60000000-0000-0000-0000-000000000002', 'writing', 3, 60,
 jsonb_build_object('writingPromptIds', jsonb_build_array('40000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000004'))),
('60000000-0000-0000-0000-000000000002', 'speaking', 4, 14,
 jsonb_build_object('speakingTopicIds', jsonb_build_array('50000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000006')));
