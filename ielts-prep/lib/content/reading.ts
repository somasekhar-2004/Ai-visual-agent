import type { Question, ReadingPassage } from '@/types/models';

export const readingPassages: ReadingPassage[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    ieltsType: 'academic',
    title: 'The Rise of Urban Beekeeping',
    sectionNumber: 1,
    wordCount: 430,
    body: `Over the past two decades, a quiet agricultural movement has taken root on the rooftops and balconies of cities around the world: urban beekeeping. Once considered an eccentric hobby confined to rural smallholdings, beekeeping has migrated into dense metropolitan environments, with hives now found atop hotels, museums, and even government buildings in cities such as London, New York, and Paris.

The appeal of keeping bees in the city is, at first glance, counterintuitive. Cities are associated with concrete, pollution, and a scarcity of green space — hardly the idyllic meadows one might imagine as ideal habitat for honeybees. Yet research conducted over the last fifteen years has revealed a surprising pattern: urban bee colonies often outperform their rural counterparts in terms of both honey yield and colony survival rates. Several factors contribute to this phenomenon. Cities tend to be several degrees warmer than surrounding rural areas due to the "urban heat island" effect, extending the foraging season for bees by allowing flowers to bloom earlier in spring and later into autumn. Additionally, urban environments, paradoxically, often support a greater diversity of flowering plants than intensively farmed rural land, where monoculture crops and pesticide use can severely limit the variety and availability of nectar sources.

The growth of urban beekeeping has not been without controversy, however. Entomologists and conservationists have raised concerns that the trend, while well-intentioned, may inadvertently harm wild pollinator populations. Honeybees, it is argued, are farmed livestock rather than an endangered species, and a proliferation of managed hives in a limited urban area can create intense competition for the same finite pool of nectar and pollen. This competition disproportionately affects wild bee species — of which there are thousands, many solitary and far less visible than the honeybee — as well as other pollinating insects such as hoverflies and butterflies. A widely cited study conducted in London found a significant increase in the number of registered hives over a five-year period, far outpacing any corresponding growth in flowering plant coverage across the city, raising questions about the ecological carrying capacity of urban green space.

In response to these concerns, some cities have begun to regulate hive density, and a number of beekeeping associations now advocate for a more holistic approach: rather than simply adding more honeybee colonies, urban planners and citizens are encouraged to prioritise planting pollinator-friendly flowers, shrubs, and trees, and to reduce the use of pesticides in public parks and private gardens. Proponents argue that a city genuinely richer in floral resources would benefit not just honeybees but the full spectrum of native pollinators, many of which play a critical and underappreciated role in urban ecosystems.

Despite the debate over ecological impact, the cultural and educational value of urban beekeeping is rarely disputed. Rooftop apiaries have become valuable tools for environmental education, offering city dwellers, particularly children, a rare direct encounter with agricultural processes and the natural world. Numerous schools have installed observation hives, allowing students to watch bees at work through glass panels without risk of stings, fostering an early appreciation for the complex, cooperative societies that bees construct. Corporate sponsors, too, have embraced the trend, often as part of broader sustainability initiatives, installing hives on office rooftops and marketing the resulting honey as a locally sourced, environmentally conscious product.

Looking ahead, researchers suggest that the future of urban beekeeping will likely depend on cities adopting a more coordinated, data-driven approach — one that balances the genuine benefits of public engagement and education against the ecological costs of an unmanaged increase in honeybee density. Some cities have already begun mapping floral resources and hive locations to calculate a sustainable maximum number of colonies per square kilometre, a practice that may become standard as urban beekeeping continues to grow in popularity.`,
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    ieltsType: 'general',
    title: 'Community Libraries in the Digital Age',
    sectionNumber: 1,
    wordCount: 390,
    body: `When public libraries first proliferated in the nineteenth and twentieth centuries, their core purpose was straightforward: to provide free access to books and information for people who could not otherwise afford them. Today, in an era when a vast amount of information is available instantly online, one might expect libraries to have declined in relevance. Instead, community libraries across many countries have reinvented themselves, evolving into multi-purpose civic spaces that serve functions far beyond book lending.

A visit to a modern community library might reveal a maker space equipped with 3D printers, a quiet study area used by students and remote workers alike, a children's storytelling corner, and a bank of computers offering free internet access to those without a connection at home. Many libraries now also function as informal social service hubs, hosting job-seeking workshops, English language classes for new immigrants, and even partnerships with local health services to offer basic wellness checks. This transformation reflects a broader recognition that access to physical, non-commercial community space has itself become a scarce resource in many towns and cities, particularly as other traditionally free public venues have disappeared or become increasingly commercialised.

Library staff, whose roles were once centred on cataloguing and answering reference questions, have correspondingly taken on much broader responsibilities. Many librarians now receive training in areas such as digital literacy instruction, conflict resolution, and even, in some regions, basic mental health first aid, reflecting the reality that libraries are frequently the first point of contact for vulnerable community members, including those experiencing homelessness or social isolation.

Not everyone views this expanded role positively. Critics argue that libraries are being asked to fill gaps left by underfunded social services without a corresponding increase in library funding or staff training, placing an unsustainable burden on library employees who did not sign up for social work. Others worry that the traditional core function of libraries — quiet spaces for reading and reflection — is being crowded out by noise and activity associated with their new civic roles, alienating patrons who visit specifically for a calm environment.

Nonetheless, usage statistics from several countries suggest that far from becoming obsolete, community libraries are experiencing a resurgence in overall foot traffic, even as traditional book borrowing rates have gradually declined. This suggests that the value patrons place on libraries has shifted rather than disappeared: many now see the library primarily as a shared community space and a gateway to services, with book lending as one valuable offering among several. For local governments weighing budget priorities, this shift presents both an opportunity and a challenge — libraries may be more essential to community wellbeing than ever, but fulfilling that expanded mission convincingly will likely require funding models and staff training that go well beyond what nineteenth-century library founders could have anticipated.`,
  },
];

export const readingQuestions: Question[] = [
  {
    id: 'rq-p1-1', skill: 'reading', questionType: 'true_false_not_given', topic: 'Environment', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Urban bee colonies generally produce less honey than rural colonies.',
    passageId: '20000000-0000-0000-0000-000000000001', listeningTrackId: null, options: null,
    correctAnswer: 'FALSE',
    explanation: 'The passage states urban colonies "often outperform their rural counterparts in terms of both honey yield and colony survival rates" — the opposite of the statement.',
    strategyNote: 'Look for the comparison word "outperform" — it directly contradicts the statement\'s claim.',
    tags: ['true_false_not_given'], estimatedTimeSeconds: 60, orderIndex: 1, isPremium: false,
  },
  {
    id: 'rq-p1-2', skill: 'reading', questionType: 'true_false_not_given', topic: 'Environment', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'The urban heat island effect can extend the period during which bees are able to forage.',
    passageId: '20000000-0000-0000-0000-000000000001', listeningTrackId: null, options: null,
    correctAnswer: 'TRUE',
    explanation: 'The passage explicitly says warmer cities extend "the foraging season for bees by allowing flowers to bloom earlier in spring and later into autumn."',
    strategyNote: 'Match "urban heat island" directly to the same phrase in the passage, then read the following clause.',
    tags: ['true_false_not_given'], estimatedTimeSeconds: 55, orderIndex: 2, isPremium: false,
  },
  {
    id: 'rq-p1-3', skill: 'reading', questionType: 'true_false_not_given', topic: 'Environment', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Every city that has introduced urban beehives has since banned new hive installations.',
    passageId: '20000000-0000-0000-0000-000000000001', listeningTrackId: null, options: null,
    correctAnswer: 'NOT GIVEN',
    explanation: 'The passage says some cities "have begun to regulate hive density" but never states any city has banned new installations entirely.',
    strategyNote: 'Watch the absolute word "every" and "banned" — the passage only mentions regulation, not prohibition.',
    tags: ['true_false_not_given'], estimatedTimeSeconds: 70, orderIndex: 3, isPremium: false,
  },
  {
    id: 'rq-p1-4', skill: 'reading', questionType: 'true_false_not_given', topic: 'Environment', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Wild, solitary bee species are more numerous than honeybees but less visible to most people.',
    passageId: '20000000-0000-0000-0000-000000000001', listeningTrackId: null, options: null,
    correctAnswer: 'TRUE',
    explanation: 'The passage notes "thousands" of wild bee species, "many solitary and far less visible than the honeybee."',
    strategyNote: 'The paraphrase "less visible" maps to "far less visible than the honeybee" in the text.',
    tags: ['true_false_not_given'], estimatedTimeSeconds: 60, orderIndex: 4, isPremium: false,
  },
  {
    id: 'rq-p1-5', skill: 'reading', questionType: 'matching_headings', topic: 'Environment', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Which paragraph discusses concerns that urban beekeeping could negatively affect other pollinating species?',
    passageId: '20000000-0000-0000-0000-000000000001', listeningTrackId: null,
    options: [
      'Paragraph 1: Introduction to urban beekeeping',
      'Paragraph 2: Reasons urban colonies thrive',
      'Paragraph 3: Ecological concerns about competition',
      'Paragraph 4: Proposed solutions and regulation',
      'Paragraph 5: Educational and corporate value',
      'Paragraph 6: Future outlook',
    ],
    correctAnswer: 'Paragraph 3: Ecological concerns about competition',
    explanation: 'Paragraph 3 is the one that raises concerns from entomologists and conservationists about competition with wild pollinators.',
    strategyNote: 'Match the heading\'s main idea, not a single repeated word, to the paragraph\'s overall purpose.',
    tags: ['matching_headings'], estimatedTimeSeconds: 75, orderIndex: 5, isPremium: false,
  },
  {
    id: 'rq-p1-6', skill: 'reading', questionType: 'multiple_choice', topic: 'Environment', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'According to the passage, what is one criticism made of the current urban beekeeping trend?',
    passageId: '20000000-0000-0000-0000-000000000001', listeningTrackId: null,
    options: [
      'It is too expensive for most city councils to support',
      'It may increase competition for nectar affecting wild pollinators',
      'It has reduced the overall number of registered beekeepers',
      'It requires the use of more pesticides than rural farming',
    ],
    correctAnswer: 'It may increase competition for nectar affecting wild pollinators',
    explanation: 'This directly reflects the concern described in paragraph 3 about competition for a finite pool of nectar and pollen.',
    strategyNote: 'Eliminate options that are not mentioned at all in the passage (cost, beekeeper numbers, pesticide use by beekeepers).',
    tags: ['multiple_choice'], estimatedTimeSeconds: 65, orderIndex: 6, isPremium: false,
  },
  {
    id: 'rq-p1-7', skill: 'reading', questionType: 'sentence_completion', topic: 'Environment', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Complete the sentence using NO MORE THAN TWO WORDS from the passage: Some cities are now mapping floral resources in order to calculate a sustainable maximum number of colonies per ______.',
    passageId: '20000000-0000-0000-0000-000000000001', listeningTrackId: null, options: null,
    correctAnswer: 'square kilometre',
    explanation: 'The final paragraph states cities calculate "a sustainable maximum number of colonies per square kilometre."',
    strategyNote: 'Scan the final paragraph for the word "sustainable" and read the phrase that follows it.',
    tags: ['sentence_completion'], estimatedTimeSeconds: 70, orderIndex: 7, isPremium: false,
  },
  {
    id: 'rq-p1-8', skill: 'reading', questionType: 'short_answer', topic: 'Environment', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Name one example of a building type mentioned in the passage that now hosts beehives, other than a museum or hotel.',
    passageId: '20000000-0000-0000-0000-000000000001', listeningTrackId: null, options: null,
    correctAnswer: ['government building', 'government buildings', 'office rooftop', 'office rooftops', 'school'],
    explanation: 'The passage mentions "government buildings" in paragraph 1 and "office rooftops" in paragraph 5.',
    strategyNote: 'Any one correctly named example from the text is acceptable.',
    tags: ['short_answer'], estimatedTimeSeconds: 50, orderIndex: 8, isPremium: false,
  },
  {
    id: 'rq-p2-1', skill: 'reading', questionType: 'true_false_not_given', topic: 'Society', difficulty: 'easy', estimatedBand: 5.5,
    prompt: 'Community libraries today offer services beyond book lending.',
    passageId: '20000000-0000-0000-0000-000000000002', listeningTrackId: null, options: null,
    correctAnswer: 'TRUE',
    explanation: 'The passage describes maker spaces, job workshops, language classes, and health partnerships offered by modern libraries.',
    strategyNote: 'This is confirmed broadly across paragraph 2.',
    tags: ['true_false_not_given'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false,
  },
  {
    id: 'rq-p2-2', skill: 'reading', questionType: 'true_false_not_given', topic: 'Society', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'All librarians now receive mandatory mental health first aid training.',
    passageId: '20000000-0000-0000-0000-000000000002', listeningTrackId: null, options: null,
    correctAnswer: 'NOT GIVEN',
    explanation: 'The passage says "many librarians" receive such training "in some regions" — not all librarians, and not stated as mandatory everywhere.',
    strategyNote: 'Watch for "all" versus "many... in some regions" — a scope mismatch signals Not Given.',
    tags: ['true_false_not_given'], estimatedTimeSeconds: 65, orderIndex: 2, isPremium: false,
  },
  {
    id: 'rq-p2-3', skill: 'reading', questionType: 'true_false_not_given', topic: 'Society', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Overall book borrowing rates have increased in recent years according to the passage.',
    passageId: '20000000-0000-0000-0000-000000000002', listeningTrackId: null, options: null,
    correctAnswer: 'FALSE',
    explanation: 'The passage states "traditional book borrowing rates have gradually declined" even as foot traffic has risen.',
    strategyNote: 'Do not confuse "foot traffic" (up) with "book borrowing" (down) — they are two different statistics.',
    tags: ['true_false_not_given'], estimatedTimeSeconds: 60, orderIndex: 3, isPremium: false,
  },
  {
    id: 'rq-p2-4', skill: 'reading', questionType: 'matching_information', topic: 'Society', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Which paragraph contains criticism of the expanded role libraries have taken on?',
    passageId: '20000000-0000-0000-0000-000000000002', listeningTrackId: null,
    options: ['Paragraph 1', 'Paragraph 2', 'Paragraph 3', 'Paragraph 4', 'Paragraph 5'],
    correctAnswer: 'Paragraph 4',
    explanation: 'Paragraph 4 begins "Not everyone views this expanded role positively" and lists the criticisms.',
    strategyNote: 'Find the paragraph with an explicit shift in tone signalled by "Not everyone" or "Critics argue".',
    tags: ['matching_information'], estimatedTimeSeconds: 70, orderIndex: 4, isPremium: false,
  },
  {
    id: 'rq-p2-5', skill: 'reading', questionType: 'multiple_choice', topic: 'Society', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'What does the passage suggest is the main reason library foot traffic has risen even as borrowing has declined?',
    passageId: '20000000-0000-0000-0000-000000000002', listeningTrackId: null,
    options: [
      'Libraries now charge lower late fees than before',
      'Patrons increasingly value libraries as shared community spaces',
      'New libraries have opened in most major cities',
      'Digital books have made physical visits unnecessary',
    ],
    correctAnswer: 'Patrons increasingly value libraries as shared community spaces',
    explanation: 'This matches the concluding paragraph\'s claim that the value placed on libraries "has shifted rather than disappeared."',
    strategyNote: 'The final paragraph explicitly interprets the statistic for you — locate and paraphrase it.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 65, orderIndex: 5, isPremium: false,
  },
  {
    id: 'rq-p2-6', skill: 'reading', questionType: 'sentence_completion', topic: 'Society', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Complete the sentence using NO MORE THAN THREE WORDS: Some libraries now partner with local health services to offer basic ______.',
    passageId: '20000000-0000-0000-0000-000000000002', listeningTrackId: null, options: null,
    correctAnswer: 'wellness checks',
    explanation: 'Paragraph 2 states libraries partner with health services "to offer basic wellness checks."',
    strategyNote: 'Scan for "health services" then read the phrase immediately following.',
    tags: ['sentence_completion'], estimatedTimeSeconds: 55, orderIndex: 6, isPremium: false,
  },
];
