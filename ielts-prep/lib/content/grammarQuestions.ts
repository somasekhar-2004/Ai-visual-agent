import type { GrammarQuestion } from '@/types/models';

/** `topic` matches a GrammarLesson.title exactly, so weak-topic detection
 * (services/repository/learning.ts#weakGrammarTopics) can recommend the
 * right lesson to review. */
export const grammarQuestions: GrammarQuestion[] = [
  // Complex Sentences with Subordinate Clauses
  {
    id: 'gq-1', topic: 'Complex Sentences with Subordinate Clauses', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Choose the best way to combine these ideas into one complex sentence: "The exam was difficult. Most students passed."',
    options: ['The exam was difficult, most students passed.', 'Although the exam was difficult, most students passed.', 'The exam was difficult and most students passed it well.', 'Difficult was the exam, but students passed.'],
    correctAnswer: 'Although the exam was difficult, most students passed.',
    explanation: '"Although" correctly joins the two ideas as a subordinate clause showing contrast, forming one grammatically complete complex sentence.',
    orderIndex: 1,
  },
  {
    id: 'gq-2', topic: 'Complex Sentences with Subordinate Clauses', difficulty: 'easy', questionType: 'fill_blank',
    prompt: 'Complete the sentence: "______ the government increased funding, the hospital still faced staff shortages."',
    options: null, correctAnswer: 'Although',
    explanation: '"Although" introduces a subordinate clause of contrast, matching the logical relationship between increased funding and continuing shortages.',
    orderIndex: 2,
  },
  {
    id: 'gq-3', topic: 'Complex Sentences with Subordinate Clauses', difficulty: 'hard', questionType: 'error_correction',
    prompt: 'Find and correct the error: "Because the traffic was heavy, so we arrived late."',
    options: null, correctAnswer: 'Because the traffic was heavy, we arrived late.',
    explanation: 'A subordinate clause beginning with "Because" cannot be paired with "so" in the main clause — only one of the two conjunctions is needed.',
    orderIndex: 3,
  },
  {
    id: 'gq-4', topic: 'Complex Sentences with Subordinate Clauses', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Which sentence correctly uses a subordinate clause?',
    options: ['Since prices rose. Fewer people bought cars.', 'Since prices rose, fewer people bought cars.', 'Prices rose, since fewer people bought cars.', 'Since, prices rose fewer people bought cars.'],
    correctAnswer: 'Since prices rose, fewer people bought cars.',
    explanation: 'The subordinate clause "Since prices rose" is correctly followed by a comma and then the main clause.',
    orderIndex: 4,
  },

  // Articles: A, An, The, and Zero Article
  {
    id: 'gq-5', topic: 'Articles: A, An, The, and Zero Article', difficulty: 'easy', questionType: 'fill_blank',
    prompt: 'Complete: "______ pollution is one of the biggest challenges facing cities today." (general statement)',
    options: null, correctAnswer: 'no article',
    explanation: 'When making a general statement about an uncountable noun like "pollution," no article is used.',
    orderIndex: 5,
  },
  {
    id: 'gq-6', topic: 'Articles: A, An, The, and Zero Article', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Choose the correct sentence.',
    options: ['The government should invest in the renewable energy.', 'The government should invest in renewable energy.', 'Government should invest in a renewable energy.', 'The government should invest in an renewable energy.'],
    correctAnswer: 'The government should invest in renewable energy.',
    explanation: '"Government" as an institution takes "the," but "renewable energy" is a general uncountable concept here and takes no article.',
    orderIndex: 6,
  },
  {
    id: 'gq-7', topic: 'Articles: A, An, The, and Zero Article', difficulty: 'hard', questionType: 'error_correction',
    prompt: 'Find and correct the error: "She is studying an economics at the university she mentioned earlier."',
    options: null, correctAnswer: 'She is studying economics at the university she mentioned earlier.',
    explanation: '"Economics" as a subject name takes no article, while "the university" correctly uses "the" because it refers to a specific, previously mentioned university.',
    orderIndex: 7,
  },
  {
    id: 'gq-8', topic: 'Articles: A, An, The, and Zero Article', difficulty: 'medium', questionType: 'fill_blank',
    prompt: 'Complete: "I read ______ interesting article about ocean plastic yesterday."',
    options: null, correctAnswer: 'an',
    explanation: '"An" is used before "interesting" because it begins with a vowel sound, and the article is unspecific (one article among many).',
    orderIndex: 8,
  },

  // Conditionals for Hypothetical Situations
  {
    id: 'gq-9', topic: 'Conditionals for Hypothetical Situations', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Which sentence correctly uses the second conditional?',
    options: ['If governments invest more, pollution will decrease.', 'If governments invested more, pollution would decrease.', 'If governments will invest more, pollution would decrease.', 'If governments invest more, pollution would decreased.'],
    correctAnswer: 'If governments invested more, pollution would decrease.',
    explanation: 'The second conditional uses past simple in the if-clause ("invested") and "would + base verb" in the main clause for hypothetical present/future situations.',
    orderIndex: 9,
  },
  {
    id: 'gq-10', topic: 'Conditionals for Hypothetical Situations', difficulty: 'hard', questionType: 'fill_blank',
    prompt: 'Complete the third conditional: "If the city ______ (invest) in public transport earlier, congestion would not have become so severe."',
    options: null, correctAnswer: 'had invested',
    explanation: 'The third conditional describes a hypothetical past and requires "had + past participle" in the if-clause.',
    orderIndex: 10,
  },
  {
    id: 'gq-11', topic: 'Conditionals for Hypothetical Situations', difficulty: 'easy', questionType: 'multiple_choice',
    prompt: 'Choose the correct first conditional sentence.',
    options: ['If it rains tomorrow, we will cancel the trip.', 'If it will rain tomorrow, we cancel the trip.', 'If it rains tomorrow, we would cancel the trip.', 'If it rained tomorrow, we will cancel the trip.'],
    correctAnswer: 'If it rains tomorrow, we will cancel the trip.',
    explanation: 'The first conditional uses present simple in the if-clause and "will + base verb" for a real future possibility.',
    orderIndex: 11,
  },
  {
    id: 'gq-12', topic: 'Conditionals for Hypothetical Situations', difficulty: 'medium', questionType: 'error_correction',
    prompt: 'Find and correct the error: "If I would have more free time, I would learn a new language."',
    options: null, correctAnswer: 'If I had more free time, I would learn a new language.',
    explanation: 'The if-clause of a second conditional never uses "would" — it takes the past simple ("had"), while "would" belongs only in the main clause.',
    orderIndex: 12,
  },

  // Linking Devices for Coherence
  {
    id: 'gq-13', topic: 'Linking Devices for Coherence', difficulty: 'easy', questionType: 'multiple_choice',
    prompt: 'Which linking word best completes: "The plan was expensive. ______, the council approved it."',
    options: ['Moreover', 'Nevertheless', 'Similarly', 'For example'],
    correctAnswer: 'Nevertheless',
    explanation: '"Nevertheless" signals contrast — the council approved the plan despite the cost, which matches the logical relationship here.',
    orderIndex: 13,
  },
  {
    id: 'gq-14', topic: 'Linking Devices for Coherence', difficulty: 'medium', questionType: 'fill_blank',
    prompt: 'Complete: "Rising rents have pushed young people out of city centres. ______, commuting times have increased significantly."',
    options: null, correctAnswer: 'As a result',
    explanation: '"As a result" correctly signals that increased commuting times are a consequence of rising rents pushing people further from city centres.',
    orderIndex: 14,
  },
  {
    id: 'gq-15', topic: 'Linking Devices for Coherence', difficulty: 'hard', questionType: 'error_correction',
    prompt: 'Find and correct the error: "However the policy was popular, it was expensive to implement."',
    options: null, correctAnswer: 'However, the policy was popular, although it was expensive to implement. (or: The policy was popular; however, it was expensive to implement.)',
    explanation: '"However" as a sentence-initial linking adverb must be followed by a comma and cannot directly join two clauses the way "although" can — it needs restructuring.',
    orderIndex: 15,
  },

  // Subject-Verb Agreement
  {
    id: 'gq-16', topic: 'Subject-Verb Agreement', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Choose the correct sentence.',
    options: ['The number of applicants have increased.', 'The number of applicants has increased.', 'A number of applicants has increased.', 'The number of applicants is increase.'],
    correctAnswer: 'The number of applicants has increased.',
    explanation: '"The number of" takes a singular verb ("has"), while "a number of" would take a plural verb.',
    orderIndex: 16,
  },
  {
    id: 'gq-17', topic: 'Subject-Verb Agreement', difficulty: 'hard', questionType: 'fill_blank',
    prompt: 'Complete: "A number of proposals ______ (be) rejected by the committee."',
    options: null, correctAnswer: 'were',
    explanation: '"A number of" takes a plural verb, so "were" is correct here (unlike "the number of," which takes a singular verb).',
    orderIndex: 17,
  },
  {
    id: 'gq-18', topic: 'Subject-Verb Agreement', difficulty: 'easy', questionType: 'error_correction',
    prompt: 'Find and correct the error: "Neither of the two candidates were qualified for the role."',
    options: null, correctAnswer: 'Neither of the two candidates was qualified for the role.',
    explanation: '"Neither" is grammatically singular, so it takes a singular verb ("was"), even though it refers to two people.',
    orderIndex: 18,
  },

  // Prepositions Commonly Confused in IELTS Writing
  {
    id: 'gq-19', topic: 'Prepositions Commonly Confused in IELTS Writing', difficulty: 'easy', questionType: 'fill_blank',
    prompt: 'Complete: "Success often depends ______ hard work and determination."',
    options: null, correctAnswer: 'on',
    explanation: '"Depend on" is the correct fixed preposition combination — "depend of" is a common but incorrect form.',
    orderIndex: 19,
  },
  {
    id: 'gq-20', topic: 'Prepositions Commonly Confused in IELTS Writing', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Choose the correct sentence.',
    options: ['Parents are responsible of their children\'s education.', 'Parents are responsible for their children\'s education.', 'Parents are responsible to their children\'s education.', 'Parents are responsible in their children\'s education.'],
    correctAnswer: 'Parents are responsible for their children\'s education.',
    explanation: '"Responsible for" is the correct fixed preposition — "responsible of" is a common error.',
    orderIndex: 20,
  },
  {
    id: 'gq-21', topic: 'Prepositions Commonly Confused in IELTS Writing', difficulty: 'hard', questionType: 'fill_blank',
    prompt: 'Complete: "There has been a significant increase ______ the number of electric vehicles on the road."',
    options: null, correctAnswer: 'in',
    explanation: '"An increase in [something]" is the standard collocation when describing what has grown, as opposed to "increase of" which is used before a quantity (e.g. "an increase of 20%").',
    orderIndex: 21,
  },

  // The Passive Voice for Formal and Academic Register
  {
    id: 'gq-22', topic: 'The Passive Voice for Formal and Academic Register', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Which sentence uses the passive voice correctly for a Task 1 process description?',
    options: ['They heat the water to 100 degrees.', 'The water is heated to 100 degrees.', 'The water heats to 100 degrees by someone.', 'Heating the water is at 100 degrees.'],
    correctAnswer: 'The water is heated to 100 degrees.',
    explanation: 'The passive voice ("is heated") correctly shifts the focus onto the water/process rather than the unnamed person performing the action.',
    orderIndex: 22,
  },
  {
    id: 'gq-23', topic: 'The Passive Voice for Formal and Academic Register', difficulty: 'hard', questionType: 'fill_blank',
    prompt: 'Rewrite in the passive: "Researchers collected the data over five years." → "The data ______ over five years."',
    options: null, correctAnswer: 'was collected',
    explanation: 'The active object "the data" becomes the passive subject, paired with "was collected" (past simple passive).',
    orderIndex: 23,
  },
  {
    id: 'gq-24', topic: 'The Passive Voice for Formal and Academic Register', difficulty: 'medium', questionType: 'error_correction',
    prompt: 'Find and correct the error: "The bridge was build in 1920 by local engineers."',
    options: null, correctAnswer: 'The bridge was built in 1920 by local engineers.',
    explanation: 'The passive voice requires the past participle "built," not the base form "build," after "was."',
    orderIndex: 24,
  },

  // Relative Clauses: Defining and Non-Defining
  {
    id: 'gq-25', topic: 'Relative Clauses: Defining and Non-Defining', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Choose the correctly punctuated sentence.',
    options: ['My hometown which has a population of 200,000 has changed enormously.', 'My hometown, which has a population of 200,000, has changed enormously.', 'My hometown, that has a population of 200,000, has changed enormously.', 'My hometown which, has a population of 200,000 has changed enormously.'],
    correctAnswer: 'My hometown, which has a population of 200,000, has changed enormously.',
    explanation: 'This is a non-defining relative clause adding extra information, so it must be separated by commas and use "which" rather than "that."',
    orderIndex: 25,
  },
  {
    id: 'gq-26', topic: 'Relative Clauses: Defining and Non-Defining', difficulty: 'easy', questionType: 'fill_blank',
    prompt: 'Complete: "Students ______ study abroad often develop stronger independence." (defining clause, no comma)',
    options: null, correctAnswer: 'who',
    explanation: 'A defining relative clause identifying which students is meant uses "who" (or "that") with no comma.',
    orderIndex: 26,
  },
  {
    id: 'gq-27', topic: 'Relative Clauses: Defining and Non-Defining', difficulty: 'hard', questionType: 'error_correction',
    prompt: 'Find and correct the error: "The Amazon rainforest, that produces much of the world\'s oxygen, is under threat."',
    options: null, correctAnswer: 'The Amazon rainforest, which produces much of the world\'s oxygen, is under threat.',
    explanation: '"That" is never used in a non-defining relative clause (one separated by commas) — only "which" or "who" is correct there.',
    orderIndex: 27,
  },

  // Reported Speech in Speaking and Writing
  {
    id: 'gq-28', topic: 'Reported Speech in Speaking and Writing', difficulty: 'medium', questionType: 'fill_blank',
    prompt: 'Report this statement: Direct: "I am tired." → Reported: She said she ______ tired.',
    options: null, correctAnswer: 'was',
    explanation: 'Reported speech typically backshifts the tense one step: present simple ("am") becomes past simple ("was").',
    orderIndex: 28,
  },
  {
    id: 'gq-29', topic: 'Reported Speech in Speaking and Writing', difficulty: 'hard', questionType: 'multiple_choice',
    prompt: 'Choose the correct reported version of: "I will help you tomorrow."',
    options: ['He said he will help me tomorrow.', 'He said he would help me the next day.', 'He said he would help me tomorrow.', 'He said he helps me tomorrow.'],
    correctAnswer: 'He said he would help me the next day.',
    explanation: '"Will" backshifts to "would," and "tomorrow" (a time word relative to the original moment) changes to "the next day" in reported speech.',
    orderIndex: 29,
  },
  {
    id: 'gq-30', topic: 'Reported Speech in Speaking and Writing', difficulty: 'medium', questionType: 'error_correction',
    prompt: 'Find and correct the error: "She said that she is studying medicine at university."',
    options: null, correctAnswer: 'She said that she was studying medicine at university.',
    explanation: 'Reported speech backshifts present continuous ("is studying") to past continuous ("was studying").',
    orderIndex: 30,
  },

  // Modal Verbs for Degrees of Certainty and Obligation
  {
    id: 'gq-31', topic: 'Modal Verbs for Degrees of Certainty and Obligation', difficulty: 'easy', questionType: 'multiple_choice',
    prompt: 'Which modal best expresses a strong recommendation (not a strict requirement)?',
    options: ['must', 'should', 'have to', 'need to'],
    correctAnswer: 'should',
    explanation: '"Should" expresses advice or recommendation, while "must" and "have to" express stronger obligation.',
    orderIndex: 31,
  },
  {
    id: 'gq-32', topic: 'Modal Verbs for Degrees of Certainty and Obligation', difficulty: 'medium', questionType: 'fill_blank',
    prompt: 'Complete (expressing near-certainty based on strong evidence): "Given the consistent results, the cause ______ be related to diet."',
    options: null, correctAnswer: 'must',
    explanation: '"Must" expresses a confident, near-certain conclusion drawn from strong evidence, unlike "may/might/could," which express less certainty.',
    orderIndex: 32,
  },
  {
    id: 'gq-33', topic: 'Modal Verbs for Degrees of Certainty and Obligation', difficulty: 'hard', questionType: 'error_correction',
    prompt: 'Find and correct the error: "You mustn\'t finish the form today — it can wait until next week."',
    options: null, correctAnswer: 'You don\'t have to finish the form today — it can wait until next week.',
    explanation: '"Mustn\'t" expresses prohibition (you are not allowed to), while "don\'t have to" expresses absence of obligation — the intended meaning here.',
    orderIndex: 33,
  },

  // Comparatives and Superlatives for Task 1 Comparisons
  {
    id: 'gq-34', topic: 'Comparatives and Superlatives for Task 1 Comparisons', difficulty: 'easy', questionType: 'fill_blank',
    prompt: 'Complete: "City B\'s population grew ______ (fast) than City A\'s between 2000 and 2020."',
    options: null, correctAnswer: 'faster',
    explanation: 'Short one-syllable adjectives like "fast" form the comparative by adding "-er."',
    orderIndex: 34,
  },
  {
    id: 'gq-35', topic: 'Comparatives and Superlatives for Task 1 Comparisons', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Choose the correct comparative form of "significant."',
    options: ['significanter', 'more significant', 'most significant', 'significantest'],
    correctAnswer: 'more significant',
    explanation: 'Adjectives of three or more syllables like "significant" form the comparative with "more," not with an "-er" ending.',
    orderIndex: 35,
  },
  {
    id: 'gq-36', topic: 'Comparatives and Superlatives for Task 1 Comparisons', difficulty: 'hard', questionType: 'error_correction',
    prompt: 'Find and correct the error: "Country A\'s emissions were more high than Country B\'s throughout the period."',
    options: null, correctAnswer: 'Country A\'s emissions were higher than Country B\'s throughout the period.',
    explanation: '"High" is a short adjective and takes the "-er" comparative form ("higher"), not "more high."',
    orderIndex: 36,
  },

  // Parallel Structure in Lists and Comparisons
  {
    id: 'gq-37', topic: 'Parallel Structure in Lists and Comparisons', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Choose the sentence with correct parallel structure.',
    options: ['The report recommends investing in transport, to reduce car use, and building cycle lanes.', 'The report recommends investing in transport, reducing car use, and building cycle lanes.', 'The report recommends invest in transport, reducing car use, and to build cycle lanes.', 'The report recommends investing in transport, reduce car use, and building cycle lanes.'],
    correctAnswer: 'The report recommends investing in transport, reducing car use, and building cycle lanes.',
    explanation: 'All three items in the list use the same -ing form ("investing," "reducing," "building"), keeping the structure parallel.',
    orderIndex: 37,
  },
  {
    id: 'gq-38', topic: 'Parallel Structure in Lists and Comparisons', difficulty: 'hard', questionType: 'error_correction',
    prompt: 'Find and correct the error: "Learning online is as flexible as to attend classes in person."',
    options: null, correctAnswer: 'Learning online is as flexible as attending classes in person.',
    explanation: 'Both sides of an "as...as" comparison must use matching grammatical forms — "learning" (-ing) must be matched with "attending" (-ing), not "to attend."',
    orderIndex: 38,
  },
  {
    id: 'gq-39', topic: 'Parallel Structure in Lists and Comparisons', difficulty: 'medium', questionType: 'fill_blank',
    prompt: 'Complete to keep the list parallel: "The city plans to widen the roads, add more buses, and ______ (build) a new cycle network."',
    options: null, correctAnswer: 'build',
    explanation: 'Matching the base-verb pattern of "widen" and "add," the third item should also use the base form "build."',
    orderIndex: 39,
  },

  // Punctuation: Commas, Semicolons, and Run-on Sentences
  {
    id: 'gq-40', topic: 'Punctuation: Commas, Semicolons, and Run-on Sentences', difficulty: 'medium', questionType: 'error_correction',
    prompt: 'Find and correct the comma splice: "The plan seemed reasonable, few people supported it."',
    options: null, correctAnswer: 'The plan seemed reasonable; few people supported it. (or: The plan seemed reasonable, but few people supported it.)',
    explanation: 'A comma alone cannot join two complete sentences — this requires a semicolon, a coordinating conjunction, or a full stop instead.',
    orderIndex: 40,
  },
  {
    id: 'gq-41', topic: 'Punctuation: Commas, Semicolons, and Run-on Sentences', difficulty: 'easy', questionType: 'multiple_choice',
    prompt: 'Which sentence is correctly punctuated?',
    options: ['However the results varied by region.', 'However, the results varied by region.', 'However results, varied by region.', 'However; the results varied by region.'],
    correctAnswer: 'However, the results varied by region.',
    explanation: 'A comma follows a sentence-initial linking adverb like "However."',
    orderIndex: 41,
  },
  {
    id: 'gq-42', topic: 'Punctuation: Commas, Semicolons, and Run-on Sentences', difficulty: 'hard', questionType: 'fill_blank',
    prompt: 'Complete with the correct punctuation mark: "The results were inconclusive___ further research is needed." (join two complete sentences without a conjunction)',
    options: null, correctAnswer: ';',
    explanation: 'A semicolon correctly joins two closely related complete sentences without needing a conjunction like "and" or "but."',
    orderIndex: 42,
  },

  // Word Order in Indirect and Embedded Questions
  {
    id: 'gq-43', topic: 'Word Order in Indirect and Embedded Questions', difficulty: 'hard', questionType: 'error_correction',
    prompt: 'Find and correct the error: "I wonder what is the best solution to this problem."',
    options: null, correctAnswer: 'I wonder what the best solution to this problem is.',
    explanation: 'Once embedded after "I wonder," the clause returns to normal statement word order (subject before verb), not question word order.',
    orderIndex: 43,
  },
  {
    id: 'gq-44', topic: 'Word Order in Indirect and Embedded Questions', difficulty: 'medium', questionType: 'multiple_choice',
    prompt: 'Choose the correctly embedded question.',
    options: ['It is unclear why does this trend continue.', 'It is unclear why this trend continues.', 'It is unclear why continues this trend.', 'It is unclear why this trend does continue.'],
    correctAnswer: 'It is unclear why this trend continues.',
    explanation: 'Embedded questions use normal statement word order and drop the auxiliary "does," which was only needed to form the original question.',
    orderIndex: 44,
  },
  {
    id: 'gq-45', topic: 'Word Order in Indirect and Embedded Questions', difficulty: 'medium', questionType: 'fill_blank',
    prompt: 'Complete: "I am not sure why this ______ (happen)." (embedded question, present tense)',
    options: null, correctAnswer: 'happens',
    explanation: 'The embedded question uses normal statement word order and the base present-tense form ("happens"), not "does happen" or "does this happen."',
    orderIndex: 45,
  },
];
