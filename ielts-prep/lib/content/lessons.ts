import type { Lesson } from '@/types/models';

export const lessons: Lesson[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    skill: 'reading',
    category: 'Strategy',
    title: 'Skimming and Scanning',
    subtitle: 'Read faster without losing accuracy',
    orderIndex: 1,
    isPremium: false,
    estimatedMinutes: 12,
    content: [
      {
        heading: 'Skimming for the gist',
        body: 'Skimming means reading quickly to understand the overall idea of a passage without reading every word. Run your eyes over the first and last sentence of each paragraph, headings, and any bolded terms. Aim to answer: what is this paragraph about, and how does it relate to the others?',
        tips: [
          'Give yourself 60-90 seconds per paragraph on a first pass',
          'Do not stop to look up unfamiliar words while skimming',
          'Note one keyword per paragraph in the margin (mentally or on paper)',
        ],
      },
      {
        heading: 'Scanning for specific information',
        body: 'Scanning is used once you know what you are looking for — a name, date, number, or specific term from a question. Move your eyes down the page looking only for that exact word or a close synonym, ignoring everything else.',
        tips: [
          'Scan for capitalised words, numbers, and dates first — they stand out visually',
          'Underline the keyword in the question before you scan',
          'If the exact word is not there, look for a synonym or paraphrase',
        ],
      },
      {
        heading: 'Putting it together',
        body: 'A strong Reading strategy is: skim the whole passage first (2-3 minutes), then scan for each question in order, referring back to your mental map of what each paragraph covers so you know where to look.',
        tips: [
          'Never read the passage word-for-word first — it wastes time you need for the questions',
          'Answer the questions you find easy first, then return to harder ones',
        ],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    skill: 'reading',
    category: 'Question Types',
    title: 'True / False / Not Given',
    subtitle: 'The most commonly misunderstood question type',
    orderIndex: 2,
    isPremium: false,
    estimatedMinutes: 15,
    content: [
      {
        heading: 'What each option means',
        body: 'TRUE means the statement agrees with the information in the passage. FALSE means the statement contradicts the passage. NOT GIVEN means there is no information in the passage to confirm or deny the statement — it is simply not mentioned, or not mentioned precisely enough.',
        tips: [
          'Not Given is not about whether the statement is true in real life — only about what the passage says',
          'Do not use outside knowledge to decide the answer',
        ],
      },
      {
        heading: 'Common traps',
        body: 'Test writers often include statements that are almost true but change one key detail (a number, a date, an absolute word like all/never/always). These small changes turn a TRUE into a FALSE. A statement that combines two separate facts from different parts of the passage that were never actually linked is usually NOT GIVEN.',
        tips: [
          'Watch for absolute words: always, never, all, none, only',
          'If a statement adds information the passage never states, it is likely Not Given, not False',
        ],
      },
      {
        heading: 'A step-by-step method',
        body: '1) Underline the keyword(s) in the statement. 2) Scan the passage for that keyword or its synonym. 3) Read the surrounding sentence carefully. 4) Compare the statement to what is actually written, word by word.',
        tips: [
          'Work through statements in the order they appear — they usually follow the passage order',
          'Do not spend more than 90 seconds deciding on any single statement',
        ],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    skill: 'reading',
    category: 'Question Types',
    title: 'Matching Headings',
    subtitle: 'Identifying the main idea of each paragraph',
    orderIndex: 3,
    isPremium: false,
    estimatedMinutes: 12,
    content: [
      {
        heading: 'The task',
        body: 'You are given a list of headings (usually more headings than paragraphs) and must match each paragraph to the heading that best summarises its main idea — not just a detail mentioned in it.',
        tips: [
          'Read the whole paragraph, not just the first sentence, before choosing',
          'Eliminate headings that only match a small detail, not the main idea',
        ],
      },
      {
        heading: 'Avoiding distractor headings',
        body: 'Distractor headings often reuse a word from the paragraph but misrepresent its main point. The correct heading paraphrases the overall idea using different words.',
        tips: [
          'Cross out headings once used — most headings are used only once',
          'Do the paragraphs you find easiest first to narrow down the remaining options',
        ],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    skill: 'reading',
    category: 'Time Management',
    title: 'Pacing the Reading Test',
    subtitle: 'Finishing all 40 questions in 60 minutes',
    orderIndex: 4,
    isPremium: true,
    estimatedMinutes: 8,
    content: [
      {
        heading: 'Budgeting your time',
        body: 'With 3 passages and 60 minutes, aim for roughly 20 minutes per passage, including transferring answers. Passages tend to get harder, so consider spending slightly less time on Passage 1 to bank time for Passage 3.',
        tips: [
          'Set informal checkpoints: finish Passage 1 by minute 17, Passage 2 by minute 37',
          'Never leave a question blank — an educated guess beats no answer',
        ],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000005',
    skill: 'listening',
    category: 'Strategy',
    title: 'Predicting Answers Before You Hear Them',
    subtitle: 'Using the preview time effectively',
    orderIndex: 1,
    isPremium: false,
    estimatedMinutes: 10,
    content: [
      {
        heading: 'Why prediction matters',
        body: 'Before each section plays, you get time to preview the questions. Use it to predict the type of answer needed — a number, a name, a place, an adjective — so you recognise it instantly when spoken.',
        tips: [
          'Look at the word before and after each gap to predict word type (noun, number, etc.)',
          'Underline the question keywords you will listen for',
        ],
      },
      {
        heading: 'Listening for signposts',
        body: 'Speakers signal upcoming answers with phrases like "the most important thing is...", "however...", or by simply pausing and slowing down.',
        tips: [
          'Contrast words (but, however, although) often introduce the exact answer',
          'If you miss an answer, do not panic — move to the next gap immediately',
        ],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000006',
    skill: 'listening',
    category: 'Skills',
    title: 'Numbers, Dates and Spelling',
    subtitle: 'The most common source of careless errors',
    orderIndex: 2,
    isPremium: false,
    estimatedMinutes: 12,
    content: [
      {
        heading: 'Numbers and dates',
        body: 'Listening recordings often include numbers spoken in natural, fast speech: phone numbers, prices, times, and dates. Practise recognising numbers like "fifteen" vs "fifty", and date formats like "the third of May".',
        tips: [
          'Double-check singular/plural and teens/tens confusion (13 vs 30)',
          'Write dates exactly as heard, then convert format only if the question asks',
        ],
      },
      {
        heading: 'Spelling under pressure',
        body: 'Names and addresses are often spelled aloud letter by letter. Practise the English alphabet at natural speaking speed, especially letters that sound similar (M/N, B/D/P/T).',
        tips: [
          'Write the letter as you hear it — do not wait to confirm the whole word',
          'Check capitalisation and word limits stated in the instructions',
        ],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000007',
    skill: 'listening',
    category: 'Skills',
    title: 'Recognising Distractors',
    subtitle: 'When the first answer you hear is not the final one',
    orderIndex: 3,
    isPremium: true,
    estimatedMinutes: 9,
    content: [
      {
        heading: 'How distractors work',
        body: 'Speakers frequently correct themselves or change their mind mid-sentence: "Let\'s meet at 3... actually, make it 4 o\'clock." The first number mentioned is a distractor; the final, corrected version is the real answer.',
        tips: [
          'Listen to the end of the sentence before writing your final answer',
          'Phrases like "actually", "I mean", "sorry", and "on second thoughts" signal a correction',
        ],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000008',
    skill: 'writing',
    category: 'Task 2',
    title: 'Essay Structure That Examiners Reward',
    subtitle: 'A reliable four-paragraph framework',
    orderIndex: 1,
    isPremium: false,
    estimatedMinutes: 15,
    content: [
      {
        heading: 'The framework',
        body: 'A high-scoring Task 2 essay usually has four paragraphs: an introduction that paraphrases the question and states your position, two body paragraphs each with one main idea and supporting explanation/example, and a conclusion that restates your position without repeating it word-for-word.',
        tips: [
          'Spend 3-4 minutes planning before you write a single sentence',
          'One clear idea per body paragraph is stronger than three vague ones',
        ],
      },
      {
        heading: 'Introductions that work',
        body: 'Paraphrase the question in 1-2 sentences using different vocabulary, then add a clear thesis statement showing your position or the essay\'s structure.',
        tips: [
          'Never copy the question verbatim — paraphrase every key noun and verb',
          'Avoid starting with "Nowadays" or "In this modern world" — examiners see these constantly',
        ],
      },
      {
        heading: 'Conclusions that work',
        body: 'Summarise your main points in one or two sentences and restate your opinion clearly. Do not introduce a brand-new idea in the conclusion.',
        tips: ['Use a clear signal: "In conclusion", "To conclude", "Overall"'],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000009',
    skill: 'writing',
    category: 'Task 1 Academic',
    title: 'Describing Trends in Line Graphs and Bar Charts',
    subtitle: 'Overview, key features, and accurate comparison language',
    orderIndex: 2,
    isPremium: false,
    estimatedMinutes: 14,
    content: [
      {
        heading: 'The overview paragraph',
        body: 'Academic Task 1 always requires a short overview identifying the two or three most significant overall trends or features — this is the single highest-value paragraph and is often missing from weak responses.',
        tips: [
          'Write the overview after you have studied the whole chart, not before',
          'Never include specific numbers in the overview — save detail for the body',
        ],
      },
      {
        heading: 'Accurate trend language',
        body: 'Use precise verbs and adverbs to describe movement: rose sharply, increased steadily, fluctuated, remained stable, declined gradually, peaked at, dipped to.',
        tips: [
          'Match your adverb to the actual steepness of the line — do not call a small change "dramatic"',
          'Group similar data together rather than describing every single point in order',
        ],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000010',
    skill: 'writing',
    category: 'Task 1 General',
    title: 'Formal, Semi-Formal and Informal Letters',
    subtitle: 'Choosing the right tone for the right recipient',
    orderIndex: 1,
    isPremium: false,
    estimatedMinutes: 12,
    content: [
      {
        heading: 'Choosing your tone',
        body: 'General Training Task 1 asks you to write a letter. Formal letters (to a company, landlord, or official you do not know) use full names, no contractions, and phrases like "I am writing to...". Informal letters (to a friend or family member) can use contractions and a conversational tone. Semi-formal sits in between (e.g. writing to a manager you know a little).',
        tips: ['Match your opening and closing to the tone: "Dear Sir/Madam ... Yours faithfully" for formal; "Dear Ali ... Best wishes" for informal'],
      },
      {
        heading: 'Covering the bullet points',
        body: 'Every bullet point in the task must be addressed, usually one per paragraph, or the response is marked down heavily on Task Achievement regardless of language quality.',
        tips: [
          'Turn each bullet point into its own short paragraph',
          'Add a relevant example or detail beyond the bare minimum to show range',
        ],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000011',
    skill: 'speaking',
    category: 'Part 2',
    title: 'Handling the Cue Card',
    subtitle: 'Structuring two minutes of natural speech',
    orderIndex: 1,
    isPremium: false,
    estimatedMinutes: 12,
    content: [
      {
        heading: 'Using your one minute of prep',
        body: 'You get one minute to prepare and can make notes. Jot down single words or short phrases for each bullet point, not full sentences — full sentences tempt you to read rather than speak naturally.',
        tips: [
          'Write 4-5 keyword prompts, one per bullet point',
          'Think of one specific example or memory to anchor your answer',
        ],
      },
      {
        heading: 'Structuring your two minutes',
        body: 'A natural structure: briefly introduce the topic (10-15 seconds), address each bullet point in turn with a specific detail or example, and finish with a short reflection or feeling about it.',
        tips: [
          'It is fine to keep talking past the bullet points if you have more to say',
          'Do not stop just because you covered the bullets in 40 seconds — add detail',
        ],
      },
    ],
  },
  {
    id: '10000000-0000-0000-0000-000000000012',
    skill: 'speaking',
    category: 'Fluency',
    title: 'Avoiding Memorised Answers',
    subtitle: 'Why examiners can tell, and what to do instead',
    orderIndex: 2,
    isPremium: true,
    estimatedMinutes: 10,
    content: [
      {
        heading: 'Why memorising backfires',
        body: 'Trained examiners are skilled at spotting rehearsed answers — unnatural pacing, generic content that does not quite fit the question, and a sudden shift in fluency compared to spontaneous answers. This can actively lower your Fluency and Coherence score.',
        tips: [
          'Practise flexible language and structures instead of fixed scripts',
          'It is fine to reuse a personal story, but adapt the language to the actual question asked',
        ],
      },
      {
        heading: 'Building natural fluency instead',
        body: 'Practise thinking in English for a few minutes daily on random topics, prioritising fluent (even if imperfect) speech over pausing to find the perfect word.',
        tips: [
          'Use simple linking words naturally: well, actually, to be honest, I\'d say',
          'A short pause with "that\'s an interesting question, let me think" is far better than memorised filler',
        ],
      },
    ],
  },
];
