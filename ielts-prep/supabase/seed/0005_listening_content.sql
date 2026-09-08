-- Original IELTS-style listening transcripts. audio_url is null (no TTS audio
-- bundled with the seed); the app can synthesize playback from the transcript
-- via expo-speech in demo mode, or a real audio_url can be attached later.
insert into listening_tracks (id, title, transcript, audio_url, section_number) values
('30000000-0000-0000-0000-000000000001', 'Booking a Self-Storage Unit',
'RECEPTIONIST: Good morning, Citywide Storage, how can I help you?
CALLER: Hi, I''d like to rent a storage unit, please. Could you tell me what sizes you have available?
RECEPTIONIST: Of course. We have three sizes: small, which is about the size of a wardrobe, medium, roughly the size of a single garage, and large, which is more like a double garage.
CALLER: I think medium should be enough — I''m storing furniture from a two-bedroom flat.
RECEPTIONIST: Great choice. The medium unit is thirty-eight pounds per week, or you can pay monthly for one hundred and forty-five pounds, which works out a bit cheaper.
CALLER: I''ll go with the monthly option then. Can I ask, is there a deposit?
RECEPTIONIST: Yes, we require a refundable deposit of fifty pounds, paid on your first visit.
CALLER: That''s fine. Can I get access any time, or are there set hours?
RECEPTIONIST: Access is from six a.m. to ten p.m., seven days a week. If you need twenty-four hour access, that''s our large facility on Bridge Road, not this branch.
CALLER: Six to ten is fine for me. Could I take your address, please?
RECEPTIONIST: Yes, it''s fifteen, Marlow Street. That''s M-A-R-L-O-W Street, postcode SE1 4QB.
CALLER: Got it, thank you. And can I book online or do I need to come in?
RECEPTIONIST: You can book online, but we do need to see photo ID on your first visit — a passport or driving licence is fine.
CALLER: Perfect. Last question — do you sell packing boxes there?
RECEPTIONIST: We do, small boxes are one pound fifty each, and we also sell bubble wrap and tape.
CALLER: Excellent, thank you very much for your help.
RECEPTIONIST: You''re welcome, have a great day.',
 null, 1),

('30000000-0000-0000-0000-000000000002', 'The History and Ecology of Peat Bogs',
'LECTURER: Good afternoon, everyone. Today I want to talk about a habitat that rarely gets the attention it deserves: peat bogs. Peat bogs form in waterlogged conditions where dead plant material, mostly a moss called sphagnum, doesn''t fully decompose because there isn''t enough oxygen in the soggy ground. Over thousands of years, this partially decomposed material builds up into a thick layer called peat, sometimes several metres deep.

Now, why should we care about bogs? First, they''re remarkable carbon stores. Although peatlands cover only around three percent of the world''s land surface, they store nearly twice as much carbon as all the world''s forests combined. This happens because the waterlogged, low-oxygen environment locks carbon into the peat instead of releasing it back into the atmosphere as the plant material would if it decomposed normally.

Second, bogs are unique ecosystems supporting highly specialised species. Because bog water is naturally very acidic and low in nutrients, most ordinary plants cannot survive there. Instead, you find remarkable adaptations, like the sundew, a small carnivorous plant that traps insects to obtain nutrients it can''t get from the soil.

Unfortunately, peat bogs have been under serious threat for over a century. Historically, peat was cut and dried for use as fuel, a practice still continued in some regions today. More significantly in recent decades, large areas of bog have been drained for agriculture or for commercial peat extraction, which is sold as garden compost. When a bog is drained, the peat is exposed to oxygen and begins to decompose rapidly, releasing centuries of stored carbon back into the atmosphere within just a few years.

The good news is that bog restoration has become a major focus of conservation efforts. Restoration typically involves blocking the drainage channels that were dug to dry out the bog, allowing the water table to rise again. Within a few years, sphagnum moss can begin to recolonise, and the bog gradually starts storing carbon again rather than releasing it. Several large-scale restoration projects are currently underway, and early results suggest that a fully restored bog can return to being a net carbon store within roughly ten to fifteen years, though restoring the full range of specialised wildlife takes considerably longer.',
 null, 4);

insert into questions (skill, question_type, topic, difficulty, estimated_band, prompt, listening_track_id, options, correct_answer, explanation, strategy_note, tags, estimated_time_seconds, order_index) values

('listening', 'form_completion', 'Everyday life', 'easy', 5.0,
 'Unit size chosen: ______',
 '30000000-0000-0000-0000-000000000001', null, '"medium"',
 'The caller says "I think medium should be enough."',
 'Predict a size word (small/medium/large) before listening.', '{"form_completion"}', 40, 1),

('listening', 'form_completion', 'Everyday life', 'medium', 5.5,
 'Monthly cost: £______',
 '30000000-0000-0000-0000-000000000001', null, '"145"',
 'The receptionist says the monthly option is "one hundred and forty-five pounds."',
 'Numbers spoken as words — write the digit form unless told otherwise.', '{"form_completion"}', 45, 2),

('listening', 'form_completion', 'Everyday life', 'medium', 5.5,
 'Deposit required: £______',
 '30000000-0000-0000-0000-000000000001', null, '"50"',
 'The passage states "a refundable deposit of fifty pounds."',
 'Listen for the word "deposit" as your cue.', '{"form_completion"}', 40, 3),

('listening', 'form_completion', 'Everyday life', 'medium', 6.0,
 'Access hours: 6 a.m. to ______ p.m.',
 '30000000-0000-0000-0000-000000000001', null, '"10"',
 'Access is stated as "from six a.m. to ten p.m."',
 'Two numbers are given close together — make sure you note both start and end correctly.', '{"form_completion"}', 45, 4),

('listening', 'form_completion', 'Everyday life', 'hard', 6.5,
 'Street address: 15 ______ Street',
 '30000000-0000-0000-0000-000000000001', null, '"Marlow"',
 'The address is spelled out: "M-A-R-L-O-W Street."',
 'When a word is spelled letter by letter, write it down as spelled — do not guess ahead.', '{"form_completion"}', 50, 5),

('listening', 'multiple_choice', 'Everyday life', 'medium', 6.0,
 'What must the caller bring on their first visit?',
 '30000000-0000-0000-0000-000000000001',
 '["A bank statement", "Photo ID", "A signed contract only", "Proof of address"]',
 '"Photo ID"',
 'The receptionist says "we do need to see photo ID on your first visit."',
 'Listen for the word "need" — it usually flags a requirement question''s answer.', '{"multiple_choice"}', 50, 6),

('listening', 'note_completion', 'Academic lecture', 'medium', 6.0,
 'Peat forms because dead plant material does not fully ______ in waterlogged soil.',
 '30000000-0000-0000-0000-000000000002', null, '"decompose"',
 'The lecturer explains the plant material "doesn''t fully decompose because there isn''t enough oxygen."',
 'The word "because" often precedes the exact reason you need for a note-completion gap.', '{"note_completion"}', 50, 7),

('listening', 'note_completion', 'Academic lecture', 'hard', 7.0,
 'Peatlands cover about ______ percent of the world''s land surface.',
 '30000000-0000-0000-0000-000000000002', null, '"three"',
 'The lecturer states peatlands "cover only around three percent of the world''s land surface."',
 'Percentages are common note-completion answers — listen for "percent" as your cue word.', '{"note_completion"}', 45, 8),

('listening', 'short_answer', 'Academic lecture', 'hard', 7.0,
 'What is the name of the carnivorous plant mentioned as an example of bog adaptation?',
 '30000000-0000-0000-0000-000000000002', null, '["sundew", "the sundew"]',
 'The lecturer names "the sundew, a small carnivorous plant."',
 'Listen for the phrase "for example" or a similarly specific named example after a general claim.', '{"short_answer"}', 45, 9),

('listening', 'multiple_choice', 'Academic lecture', 'medium', 6.5,
 'According to the lecture, what happens when a bog is drained?',
 '30000000-0000-0000-0000-000000000002',
 '["It becomes more acidic and supports more wildlife", "The peat is exposed to oxygen and decomposes, releasing carbon", "It is immediately used for growing crops", "The sphagnum moss grows more quickly"]',
 '"The peat is exposed to oxygen and decomposes, releasing carbon"',
 'This matches the lecturer''s explanation directly following the mention of draining for agriculture.',
 'Eliminate options describing the opposite effect (more wildlife, faster moss growth).', '{"multiple_choice"}', 55, 10),

('listening', 'note_completion', 'Academic lecture', 'hard', 7.5,
 'A fully restored bog can become a net carbon store again within roughly ______ years.',
 '30000000-0000-0000-0000-000000000002', null, '"ten to fifteen"',
 'The lecturer concludes restored bogs return to being a net carbon store "within roughly ten to fifteen years."',
 'Number ranges ("X to Y years") are common at the end of an academic lecture as a summarising statistic.', '{"note_completion"}', 50, 11);
