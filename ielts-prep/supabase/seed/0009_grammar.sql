insert into grammar_lessons (title, category, content, order_index) values

('Complex Sentences with Subordinate Clauses', 'Sentence Structure',
 '[
   {"heading":"Why complexity matters","body":"IELTS Writing and Speaking both reward a mix of simple, compound, and complex sentences. A complex sentence joins a main clause with one or more subordinate clauses using words like because, although, while, since, and if.","tips":["Overusing long sentences can hurt clarity — aim for a mix, not maximum length every time","A subordinate clause cannot stand alone as a complete sentence"]},
   {"heading":"Example transformation","body":"Simple: \\"The exam was difficult. I still passed.\\" Complex: \\"Although the exam was difficult, I still passed.\\" The second version shows more grammatical range, which examiners reward under Grammatical Range and Accuracy.","tips":["Practise rewriting two simple sentences as one complex sentence using although, because, or since"]}
 ]'::jsonb, 1),

('Articles: A, An, The, and Zero Article', 'Grammar Basics',
 '[
   {"heading":"Common article mistakes","body":"Many IELTS candidates either overuse \\"the\\" with general, uncountable, or plural nouns (\\"the pollution is a problem\\" instead of \\"pollution is a problem\\"), or omit it where it is required for a specific, previously mentioned noun.","tips":["Use \\"the\\" for something specific already known to the reader, or unique (the sun, the government)","Use no article for general plural or uncountable nouns making a general statement"]}
 ]'::jsonb, 2),

('Conditionals for Hypothetical Situations', 'Tenses',
 '[
   {"heading":"First, second and third conditionals","body":"First conditional (real future possibility): \\"If governments invest more, pollution will decrease.\\" Second conditional (hypothetical present/future): \\"If governments invested more, pollution would decrease.\\" Third conditional (hypothetical past): \\"If governments had invested more, pollution would have decreased.\\"","tips":["Second conditional is extremely useful for Task 2 opinion essays discussing hypothetical solutions","Mixing conditional forms incorrectly is a common source of grammar errors at Band 6"]}
 ]'::jsonb, 3),

('Linking Devices for Coherence', 'Cohesion',
 '[
   {"heading":"Beyond \\"and\\" and \\"but\\"","body":"Coherence and Cohesion rewards a range of linking devices used accurately and naturally: however, moreover, in addition, as a result, consequently, on the other hand, despite this.","tips":["Do not start every sentence with a linking word — this looks mechanical","Vary your linkers rather than repeating \\"however\\" or \\"moreover\\" throughout an essay"]}
 ]'::jsonb, 4),

('Subject-Verb Agreement', 'Grammar Basics',
 '[
   {"heading":"Tricky agreement cases","body":"Errors often occur with collective nouns (the government has / have), quantity expressions (a number of people are, the number of people is), and long subjects where the verb ends up disagreeing with a nearby noun instead of the true subject.","tips":["Find the true subject of the verb, ignoring any phrases in between","\\"A number of\\" takes a plural verb; \\"the number of\\" takes a singular verb"]}
 ]'::jsonb, 5),

('Prepositions Commonly Confused in IELTS Writing', 'Grammar Basics',
 '[
   {"heading":"High-frequency errors","body":"Common mistakes include \\"different to/from/than\\", \\"depend on\\" (not \\"depend of\\"), \\"responsible for\\" (not \\"responsible of\\"), and \\"increase in/of\\" depending on context.","tips":["Keep a personal list of preposition + verb/adjective combinations you use often, and check them regularly","Read model essays and notice the prepositions used with common academic verbs"]}
 ]'::jsonb, 6);
