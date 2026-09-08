import type { GrammarLesson } from '@/types/models';

export const grammarLessons: GrammarLesson[] = [
  {
    id: 'g-1', orderIndex: 1, title: 'Complex Sentences with Subordinate Clauses', category: 'Sentence Structure',
    content: [
      { heading: 'Why complexity matters', body: 'IELTS Writing and Speaking both reward a mix of simple, compound, and complex sentences. A complex sentence joins a main clause with one or more subordinate clauses using words like because, although, while, since, and if.', tips: ['Overusing long sentences can hurt clarity — aim for a mix, not maximum length every time', 'A subordinate clause cannot stand alone as a complete sentence'] },
      { heading: 'Example transformation', body: 'Simple: "The exam was difficult. I still passed." Complex: "Although the exam was difficult, I still passed." The second version shows more grammatical range, which examiners reward under Grammatical Range and Accuracy.', tips: ['Practise rewriting two simple sentences as one complex sentence using although, because, or since'] },
    ],
  },
  {
    id: 'g-2', orderIndex: 2, title: 'Articles: A, An, The, and Zero Article', category: 'Grammar Basics',
    content: [
      { heading: 'Common article mistakes', body: 'Many IELTS candidates either overuse "the" with general, uncountable, or plural nouns ("the pollution is a problem" instead of "pollution is a problem"), or omit it where it is required for a specific, previously mentioned noun.', tips: ['Use "the" for something specific already known to the reader, or unique (the sun, the government)', 'Use no article for general plural or uncountable nouns making a general statement'] },
    ],
  },
  {
    id: 'g-3', orderIndex: 3, title: 'Conditionals for Hypothetical Situations', category: 'Tenses',
    content: [
      { heading: 'First, second and third conditionals', body: 'First conditional (real future possibility): "If governments invest more, pollution will decrease." Second conditional (hypothetical present/future): "If governments invested more, pollution would decrease." Third conditional (hypothetical past): "If governments had invested more, pollution would have decreased."', tips: ['Second conditional is extremely useful for Task 2 opinion essays discussing hypothetical solutions', 'Mixing conditional forms incorrectly is a common source of grammar errors at Band 6'] },
    ],
  },
  {
    id: 'g-4', orderIndex: 4, title: 'Linking Devices for Coherence', category: 'Cohesion',
    content: [
      { heading: 'Beyond "and" and "but"', body: 'Coherence and Cohesion rewards a range of linking devices used accurately and naturally: however, moreover, in addition, as a result, consequently, on the other hand, despite this.', tips: ['Do not start every sentence with a linking word — this looks mechanical', 'Vary your linkers rather than repeating "however" or "moreover" throughout an essay'] },
    ],
  },
  {
    id: 'g-5', orderIndex: 5, title: 'Subject-Verb Agreement', category: 'Grammar Basics',
    content: [
      { heading: 'Tricky agreement cases', body: 'Errors often occur with collective nouns (the government has / have), quantity expressions (a number of people are, the number of people is), and long subjects where the verb ends up disagreeing with a nearby noun instead of the true subject.', tips: ['Find the true subject of the verb, ignoring any phrases in between', '"A number of" takes a plural verb; "the number of" takes a singular verb'] },
    ],
  },
  {
    id: 'g-6', orderIndex: 6, title: 'Prepositions Commonly Confused in IELTS Writing', category: 'Grammar Basics',
    content: [
      { heading: 'High-frequency errors', body: 'Common mistakes include "different to/from/than", "depend on" (not "depend of"), "responsible for" (not "responsible of"), and "increase in/of" depending on context.', tips: ['Keep a personal list of preposition + verb/adjective combinations you use often, and check them regularly', 'Read model essays and notice the prepositions used with common academic verbs'] },
    ],
  },
  {
    id: 'g-7', orderIndex: 7, title: 'The Passive Voice for Formal and Academic Register', category: 'Sentence Structure',
    content: [
      { heading: 'Why the passive matters for Task 1', body: 'Academic Task 1 process diagrams almost always read more naturally in the passive voice, because the process itself (not the unnamed person doing it) is the focus: "The water is heated to 100 degrees" reads better than "Someone heats the water to 100 degrees." Form the passive with a form of "be" plus the past participle: is heated, was collected, has been processed.', tips: ['Scan your Task 1 process response and check most process steps use the passive voice', 'Keep the active voice for describing trends in graphs — passive is mainly for processes, not line/bar charts'] },
      { heading: 'Passive voice in academic Task 2', body: 'The passive voice also softens claims and sounds more formal and objective: "It is widely believed that..." or "Several measures could be introduced to address this" rather than "I believe..." or "The government should introduce measures."', tips: ['Do not overuse the passive — a whole essay in passive voice sounds stiff; mix it in for a small number of formal-sounding claims'] },
    ],
  },
  {
    id: 'g-8', orderIndex: 8, title: 'Relative Clauses: Defining and Non-Defining', category: 'Sentence Structure',
    content: [
      { heading: 'Defining relative clauses', body: 'A defining relative clause identifies exactly which person or thing is meant, and is not separated by commas: "Students who study abroad often develop stronger independence." Removing the clause would change the meaning (it would no longer be clear which students).', tips: ['Use "that" or "who"/"which" for defining clauses, with no commas', 'Defining clauses are a quick, natural way to add detail without starting a new sentence'] },
      { heading: 'Non-defining relative clauses', body: 'A non-defining relative clause adds extra, non-essential information and IS separated by commas: "My hometown, which has a population of about 200,000, has changed enormously." Removing it would not change who or what is being talked about.', tips: ['Never use "that" in a non-defining clause — only "which" or "who"', 'A missing or extra comma here is a very common Band 6-7 grammar error — check this carefully when editing'] },
    ],
  },
  {
    id: 'g-9', orderIndex: 9, title: 'Reported Speech in Speaking and Writing', category: 'Tenses',
    content: [
      { heading: 'Backshifting tenses', body: 'When reporting what someone said, tenses usually shift back one step: "I am tired" becomes "She said she was tired"; "I will help" becomes "He said he would help." This is useful in Speaking Part 2 when narrating a story involving conversation, and occasionally in Task 2 when referencing a claim or survey.', tips: ['Practise converting a few direct quotes from a news article into reported speech', 'Time and place words often change too: "tomorrow" becomes "the next day", "here" becomes "there"'] },
      { heading: 'Reporting verbs beyond "said"', body: 'Using a range of reporting verbs (explained, argued, suggested, claimed, admitted, insisted) shows stronger lexical resource than repeating "said" every time.', tips: ['Match the reporting verb to the tone of what was said — "admitted" implies reluctance, "insisted" implies firmness'] },
    ],
  },
  {
    id: 'g-10', orderIndex: 10, title: 'Modal Verbs for Degrees of Certainty and Obligation', category: 'Grammar Basics',
    content: [
      { heading: 'Certainty modals', body: 'Modal verbs let you express how confident you are about a claim without over-committing: "This may/might/could be due to..." (less certain) versus "This must be due to..." (near-certain, based on strong evidence). This is especially useful in Task 2 when speculating about causes.', tips: ['Avoid stating speculation as bare fact — hedge appropriately with may/might/could where you are not certain', 'Overusing "definitely" or "certainly" for every claim can sound unnaturally absolute'] },
      { heading: 'Obligation modals', body: '"Must" and "have to" express strong obligation (have to is more common in spoken/informal English); "should" and "ought to" express recommendation or advice rather than a strict requirement — an important distinction in Task 2 opinion essays proposing solutions.', tips: ['Use "should" (not "must") when proposing a solution as your opinion, unless you genuinely mean it is mandatory', '"Needn\'t"/"don\'t have to" express absence of obligation — different from "mustn\'t", which expresses prohibition'] },
    ],
  },
  {
    id: 'g-11', orderIndex: 11, title: 'Comparatives and Superlatives for Task 1 Comparisons', category: 'Grammar Basics',
    content: [
      { heading: 'Forming accurate comparisons', body: 'Short adjectives take -er/-est (higher, highest); adjectives of three or more syllables take more/most (more significant, most significant); a few are irregular (better, best; worse, worst). Choosing the wrong form is a very common error that stands out immediately to an examiner.', tips: ['Two-syllable adjectives ending in -y usually take -ier/-iest (busier, busiest) — check this pattern specifically', 'Double-check irregular comparatives: good/better/best, bad/worse/worst, far/further/furthest'] },
      { heading: 'Precise comparison language for Task 1', body: 'Beyond basic comparatives, use phrases that show precise relationships: "nearly double", "slightly higher than", "roughly three times as many as", "marginally lower". These add both accuracy and a wider range of structures than repeating "more than" throughout.', tips: ['Match your comparison language to the actual size of the difference in the data — do not call a 2% difference "dramatically higher"'] },
    ],
  },
  {
    id: 'g-12', orderIndex: 12, title: 'Parallel Structure in Lists and Comparisons', category: 'Cohesion',
    content: [
      { heading: 'What breaks parallelism', body: 'When listing items joined by "and", "or", or "but", every item should use the same grammatical form: "The report recommends investing in public transport, reducing car use, and building cycle lanes" (all -ing forms) rather than mixing "investing... to reduce... and building...".', tips: ['Read lists aloud — a broken pattern in a list of 3+ items is usually easy to hear once you listen for it', 'This applies to comparisons too: "Learning online is as flexible as attending in person" needs matching forms on both sides of "as...as"'] },
    ],
  },
  {
    id: 'g-13', orderIndex: 13, title: 'Punctuation: Commas, Semicolons, and Run-on Sentences', category: 'Cohesion',
    content: [
      { heading: 'The comma splice', body: 'A comma splice joins two complete sentences with only a comma, which is a punctuation error: "The plan seemed reasonable, few people supported it." Fix it by using a semicolon, a coordinating conjunction (", but"), or splitting into two sentences.', tips: ['If you can replace the comma with a full stop and both halves still make sense as separate sentences, a comma alone is not enough', 'A semicolon can join two closely related complete sentences without a conjunction: "The plan seemed reasonable; few people supported it."'] },
      { heading: 'Commas after linking words and clauses', body: 'A comma normally follows a linking adverb at the start of a sentence ("However, the results varied.") and follows an introductory subordinate clause ("Although the results varied, the overall trend was clear.").', tips: ['Check every sentence that begins with However, Moreover, In addition, or Although for the correct comma placement'] },
    ],
  },
  {
    id: 'g-14', orderIndex: 14, title: 'Word Order in Indirect and Embedded Questions', category: 'Sentence Structure',
    content: [
      { heading: 'Statement word order, not question word order', body: 'A common error is keeping question word order inside an embedded question: incorrect — "I wonder what is the best solution"; correct — "I wonder what the best solution is." Once a question is embedded inside a larger sentence (after phrases like "I wonder", "It is unclear", "Research shows why..."), it switches back to normal subject-verb statement order and drops the auxiliary "do/does/did" where it was only there to form the question.', tips: ['Test it: could the embedded clause stand alone as a direct question with the same word order? If yes, it is usually wrong', 'This is common and noticeable in Speaking Part 3 when giving a nuanced or uncertain answer ("I\'m not sure why this happens" — not "why does this happen")'] },
    ],
  },

  {
    id: 'g-15', orderIndex: 15, title: 'Noun Clauses as Subjects and Objects', category: 'Sentence Structure',
    content: [
      { heading: 'Noun clauses as subjects and complements', body: 'A noun clause is a subordinate clause that functions exactly like a noun in a sentence — as a subject, object, or complement. It typically begins with "that", a wh-word (what, why, how, who), or "whether/if": "What surprised researchers was the speed of the change." Here the whole clause "What surprised researchers" is the subject of the verb "was".', tips: ['Test it by replacing the clause with "something" or "it" — if the sentence still makes sense grammatically, it is a noun clause', 'Do not confuse a noun clause with a relative clause: a noun clause replaces a whole noun phrase, while a relative clause describes one'] },
      { heading: 'Noun clauses after reporting and opinion verbs', body: 'Noun clauses are common as the object of verbs like believe, suggest, show, argue, and know, and are essential for reporting research or opinions in Task 2: "Many economists believe that automation will reduce demand for low-skilled labour." The word "that" is often optional after common verbs but should not be dropped in more formal academic writing.', tips: ['Keep "that" in formal essays even where spoken English would drop it — it reads as more precise'] },
    ],
  },

  {
    id: 'g-16', orderIndex: 16, title: 'Adverb Clauses of Time, Reason, and Contrast', category: 'Sentence Structure',
    content: [
      { heading: 'What adverb clauses modify', body: 'An adverb clause is a subordinate clause that modifies the whole main clause, usually answering when, why, or under what condition something happens. Common subordinators include when, while, as soon as, because, since, so that, whereas, and even though: "Even though the policy was unpopular, the council pressed ahead with it."', tips: ['An adverb clause can move to the front or back of the sentence — front position usually needs a comma, back position usually does not'] },
      { heading: 'Choosing the right subordinator', body: 'Precision matters: "because" gives a direct reason, "since" can mean either time or reason (context decides), and "whereas"/"while" show contrast between two facts rather than time: "Urban areas have seen rapid growth, whereas rural populations have declined." Choosing the wrong subordinator can make a sentence logically confusing even if it is grammatically correct.', tips: ['Do not use "while" for contrast and for time in the same sentence — keep the meaning clear from context'] },
    ],
  },

  {
    id: 'g-17', orderIndex: 17, title: 'Identifying and Fixing Sentence Fragments', category: 'Sentence Structure',
    content: [
      { heading: 'What makes a fragment incomplete', body: 'A sentence fragment is a group of words punctuated as a sentence but missing a main verb, a subject, or an independent clause to attach to. "Because many people rely on cars for daily commuting." is a fragment — it is a complete subordinate clause with no main clause to complete the thought.', tips: ['A subordinate clause beginning with because, although, when, or which can never stand alone as a full sentence — it must be attached to an independent clause'] },
      { heading: 'Fixing fragments in exam writing', body: 'Under time pressure, candidates sometimes split a long sentence in the wrong place, accidentally leaving a fragment: "The government introduced new laws. Which many businesses opposed." The fix is to join the fragment back to the previous sentence with a comma: "The government introduced new laws, which many businesses opposed."', tips: ['When editing your essay, check that every full stop is followed by a group of words containing both a subject and a complete verb'] },
    ],
  },

  {
    id: 'g-18', orderIndex: 18, title: 'Run-on Sentences: Fusing Independent Clauses', category: 'Sentence Structure',
    content: [
      { heading: 'What a true run-on sentence is', body: 'A run-on sentence fuses two or more independent clauses together with no punctuation or conjunction at all: "House prices rose sharply many families could no longer afford to buy." Unlike a comma splice, there is not even a comma marking the boundary between the two complete ideas, which makes the sentence very hard to follow.', tips: ['Read your essay sentence by sentence and ask whether each one contains more than one complete idea with no clear break between them'] },
      { heading: 'Three ways to fix a run-on', body: 'Split it into two sentences ("House prices rose sharply. Many families could no longer afford to buy."), join with a semicolon, or add a coordinating conjunction after a comma ("House prices rose sharply, so many families could no longer afford to buy."). Each option is grammatically correct — choose based on how closely related the two ideas are.', tips: ['Use a semicolon only when both halves could stand as complete sentences on their own — otherwise use a comma and conjunction instead'] },
    ],
  },

  {
    id: 'g-19', orderIndex: 19, title: 'Determiners: This/That/These/Those and Some/Any', category: 'Grammar Basics',
    content: [
      { heading: 'Demonstrative determiners and number agreement', body: 'This and that are used with singular or uncountable nouns (this issue, that information); these and those are used with plural nouns (these policies, those results). A frequent error is mismatching number: "this results" or "these policy" both break agreement between the determiner and the noun it modifies.', tips: ['Always check the noun immediately after this/that/these/those for singular or plural form before finalising a sentence'] },
      { heading: 'Some, any, and a lot of', body: '"Some" is typically used in positive statements and offers ("Some countries have banned plastic bags"), while "any" is used in questions and negatives ("Have any countries banned plastic bags?", "There isn\'t any evidence"). "A lot of"/"lots of" work with both countable and uncountable nouns and are common in speaking, though "many"/"much" are preferred in more formal academic writing.', tips: ['In Writing Task 2, prefer "many" and "much" over "a lot of" for a more formal register, especially in the introduction and conclusion'] },
    ],
  },

  {
    id: 'g-20', orderIndex: 20, title: 'Countable vs Uncountable Nouns', category: 'Grammar Basics',
    content: [
      { heading: 'Recognising uncountable nouns', body: 'Many nouns that feel countable in everyday speech are uncountable in English and have no plural form: information, advice, research, evidence, equipment, furniture, and traffic. "The government needs more informations" and "many evidences suggest" are both common IELTS errors — these nouns take singular verbs and no "-s".', tips: ['Learn uncountable academic nouns as a fixed list: information, advice, research, evidence, knowledge, equipment, homework, furniture'] },
      { heading: 'Quantifying uncountable nouns correctly', body: 'Because uncountable nouns cannot be counted directly, use quantifying phrases instead: "a piece of advice", "a great deal of research", "a considerable amount of evidence". "Much" and "little" pair with uncountable nouns, while "many" and "few" pair with countable plural nouns.', tips: ['Before writing "many" or "few", check whether the noun that follows is genuinely countable and plural'] },
    ],
  },

  {
    id: 'g-21', orderIndex: 21, title: 'Gerunds vs Infinitives After Verbs', category: 'Grammar Basics',
    content: [
      { heading: 'Verbs that take a gerund', body: 'Some verbs are always followed by the -ing form (a gerund), never a bare infinitive: enjoy, avoid, consider, suggest, finish, mind, and risk. "The report suggests investing in renewable energy" is correct; "the report suggests to invest" is not, because "suggest" always takes a gerund or a that-clause.', tips: ['Learn small groups of common gerund-only verbs together: enjoy/avoid/consider/suggest/finish are worth memorising as a set'] },
      { heading: 'Verbs that take a to-infinitive, and verbs that change meaning', body: 'Other verbs take a to-infinitive: decide, plan, hope, agree, afford, manage. A smaller group changes meaning depending on the form used: "I stopped smoking" (I quit the habit) versus "I stopped to smoke" (I paused another activity in order to smoke) — a distinction worth knowing for precise Speaking answers.', tips: ['When unsure, check whether the verb describes a completed action (often gerund) or a planned/future action (often infinitive) as a rough guide'] },
    ],
  },

  {
    id: 'g-22', orderIndex: 22, title: 'Participle Clauses Replacing Relative Clauses', category: 'Sentence Structure',
    content: [
      { heading: '-ing clauses for active meaning', body: 'A present participle (-ing) clause can replace a relative clause with an active verb, producing a more concise, sophisticated sentence: "Students who study abroad often gain confidence" can become "Students studying abroad often gain confidence." The -ing clause implies "who study/are studying" without repeating the relative pronoun and verb.', tips: ['Use -ing participle clauses to shorten relative clauses whose verb would otherwise be active, especially in Task 1 summaries'] },
      { heading: '-ed clauses for passive meaning', body: 'A past participle (-ed) clause replaces a relative clause with a passive verb: "The data that was collected in 2020 shows a sharp rise" becomes "The data collected in 2020 shows a sharp rise." This is extremely useful in Task 1, where much of the language describing how data was gathered or a process was completed is naturally passive.', tips: ['Check that the participle clause immediately follows the noun it describes, or the sentence can become ambiguous'] },
    ],
  },

  {
    id: 'g-23', orderIndex: 23, title: 'Cleft Sentences for Emphasis', category: 'Sentence Structure',
    content: [
      { heading: 'It-clefts', body: 'An it-cleft splits a simple sentence into two parts to emphasise one piece of information: "Cost drives most consumer decisions" becomes "It is cost that drives most consumer decisions." The structure "It is/was + emphasised element + that/who..." pushes the emphasised idea to the front of the sentence for extra weight.', tips: ['Use an it-cleft sparingly in Task 2 to emphasise your strongest point, for example in a conclusion: "It is education, above all, that determines long-term social mobility."'] },
      { heading: 'What-clefts', body: 'A what-cleft uses a noun clause with "what" as the subject to emphasise an action or idea, often at the start of a sentence: "Governments need to invest in clean energy" becomes "What governments need to do is invest in clean energy." This structure signals to the examiner that the sentence structure was chosen deliberately, which supports Grammatical Range and Accuracy.', tips: ['Do not overuse cleft sentences — one or two well-placed examples in an essay is more natural than several in a row'] },
    ],
  },

  {
    id: 'g-24', orderIndex: 24, title: 'Inversion After Negative Adverbials', category: 'Sentence Structure',
    content: [
      { heading: 'How inversion works', body: 'When a sentence begins with a negative or restrictive adverbial — never, rarely, seldom, not only, under no circumstances, little — the subject and auxiliary verb invert, as in a question: "Never has the issue been more urgent" (not "Never the issue has been"). This structure is a high-level feature examiners associate with a wide grammatical range.', tips: ['Only invert when the negative adverbial starts the sentence — "The issue has never been more urgent" (no inversion) is equally correct and much safer if unsure'] },
      { heading: '"Not only... but also" inversion', body: '"Not only" at the start of a sentence also triggers inversion in the clause it introduces: "Not only did the policy fail, but it also increased costs." Only the first clause inverts; the second clause ("but it also increased costs") returns to normal word order.', tips: ['Practise this specific pattern separately, since "not only... but also" is common in Task 2 essays adding a second, stronger point'] },
    ],
  },

  {
    id: 'g-25', orderIndex: 25, title: 'Present Perfect vs Past Simple', category: 'Tenses',
    content: [
      { heading: 'Finished time vs connection to now', body: 'Past simple is used for actions completed at a specific, finished time (often with a time marker: yesterday, in 2010, last year): "The population grew by 12% in 2015." Present perfect is used when the exact time is not stated, or when a past action still connects to the present: "The population has grown by 12% since 2015" (the period is still ongoing).', tips: ['If the sentence names a finished time (in 1990, last week, two years ago), the verb must be past simple, never present perfect'] },
      { heading: 'Present perfect with "since" and "for" in Task 1', body: 'Task 1 line graphs describing an ongoing trend up to the present typically need the present perfect: "House prices have risen steadily since 2018" rather than "House prices rose steadily since 2018", which mixes a finished-time verb form with an unfinished time expression.', tips: ['"Since" is followed by a starting point in time; "for" is followed by a duration — both usually pair with the present perfect when the period continues to now'] },
    ],
  },

  {
    id: 'g-26', orderIndex: 26, title: 'Future Forms: Will, Going To, and Present Continuous', category: 'Tenses',
    content: [
      { heading: 'Predictions vs evidence-based plans', body: '"Will" is typically used for predictions or decisions made at the moment of speaking: "I think this trend will continue." "Going to" is used for plans or predictions based on present evidence: "Unemployment is going to rise because factories are already closing." Choosing between them signals whether a claim is a general opinion or based on visible evidence.', tips: ['In Task 2 predictions about the future, "will" is the safest general-purpose choice unless you are pointing to specific current evidence'] },
      { heading: 'Present continuous for fixed arrangements', body: 'The present continuous describes a fixed, already-arranged future plan, common in Speaking Part 1 answers about near-future plans: "I am moving to a new apartment next month." Using present simple instead ("I move to a new apartment next month") sounds like a timetable or routine, not a personal plan, and is usually incorrect here.', tips: ['Reserve present simple for the future only for scheduled/timetabled events, such as "The exam starts at 9 a.m."'] },
    ],
  },

  {
    id: 'g-27', orderIndex: 27, title: 'Quantifiers and Verb Agreement', category: 'Grammar Basics',
    content: [
      { heading: 'Matching quantifiers to noun type', body: 'Quantifiers must match the type of noun they describe: "few/many/several" go with countable plural nouns (few solutions, several studies); "little/much" go with uncountable nouns (little evidence, much debate); "some/most/all/a lot of" can go with either. Mismatching them, such as "much solutions" or "many evidence", is a frequent Band 5-6 error.', tips: ['When in doubt about a noun\'s countability, "some" and "a lot of" are safe choices that work with both types'] },
      { heading: 'Agreement with "most of" and "all of"', body: 'The verb after "most of/all of/some of + noun" agrees with the noun that follows, not with "most/all/some" itself: "Most of the evidence supports this view" (singular, uncountable) but "Most of the studies support this view" (plural, countable).', tips: ['Always check the noun immediately after "of" to decide whether the verb should be singular or plural'] },
    ],
  },

  {
    id: 'g-28', orderIndex: 28, title: 'Apostrophes: Possession vs Contraction', category: 'Grammar Basics',
    content: [
      { heading: 'Possessive apostrophes', body: 'An apostrophe plus "s" shows possession for a singular noun ("the government\'s policy", "a student\'s workload"), while a plural noun already ending in "s" only needs an apostrophe after it ("the students\' results", "the workers\' rights"). Irregular plurals still take \'s like a singular noun ("the children\'s education").', tips: ['Never use an apostrophe simply to make a noun plural — "policy\'s" as a plural of "policy" is always wrong'] },
      { heading: 'Contractions and the its/it\'s trap', body: 'An apostrophe also marks a contraction, where letters are omitted: "it\'s" means "it is" or "it has"; "don\'t" means "do not". "Its" with no apostrophe is the possessive form of "it": "The company increased its profits" (possession), not "The company increased it\'s profits". Contractions are best avoided altogether in formal IELTS Writing.', tips: ['In Writing Task 1 and Task 2, expand all contractions ("don\'t" becomes "do not", "it\'s" becomes "it is") for a more formal register', 'If unsure whether to write "its" or "it\'s", try replacing it with "it is" — if the sentence still makes sense, "it\'s" is correct'] },
    ],
  },

  {
    id: 'g-29', orderIndex: 29, title: 'Hyphenation in Compound Adjectives', category: 'Grammar Basics',
    content: [
      { heading: 'Compound adjectives before a noun', body: 'When two or more words combine to modify a noun and appear before it, they are usually hyphenated: "a well-known problem", "a long-term solution", "a five-year plan". The hyphen shows the reader that the words function together as a single descriptive unit rather than as separate words.', tips: ['Hyphenate compound adjectives placed directly before the noun they describe, especially number + noun combinations like "a 20-year-old building"'] },
      { heading: 'When hyphens are dropped', body: 'The same compound often loses its hyphen when it comes after the noun instead: "The solution is long term" (no hyphen) versus "a long-term solution" (hyphenated). Adverbs ending in -ly are never hyphenated before an adjective: "a highly effective method", not "a highly-effective method".', tips: ['Double check any compound with an -ly adverb — this is a very common over-hyphenation error'] },
    ],
  },

  {
    id: 'g-30', orderIndex: 30, title: 'Collocation Errors with Make and Do', category: 'Vocabulary & Style',
    content: [
      { heading: 'Fixed collocations with make', body: '"Make" typically collocates with creating, producing, or deciding something: make a decision, make progress, make an effort, make a mistake, make a difference. "Do a mistake" or "make a research" are common IELTS errors — the correct forms are "make a mistake" and "do research" (uncountable, no article).', tips: ['Learn make/do collocations as fixed phrases, not by translating word-for-word from your first language'] },
      { heading: 'Fixed collocations with do', body: '"Do" typically collocates with general activities, duties, or work without a specific created result: do homework, do a job, do business, do damage, do harm. Task 2 essays often need "cause damage/harm" or "do damage/harm" rather than "make damage", which is incorrect.', tips: ['Keep a running list of make/do collocations you encounter while reading model answers, and review it before the exam'] },
    ],
  },

  {
    id: 'g-31', orderIndex: 31, title: 'Phrasal Verbs in Formal Academic Writing', category: 'Vocabulary & Style',
    content: [
      { heading: 'Why to limit phrasal verbs in Task 2', body: 'Phrasal verbs like "look into", "come up with", "put off", and "get rid of" are grammatically fine but sound conversational, which can undercut the formal register expected in academic Writing Task 2. Replacing them with a single-word equivalent often sounds more academic: "look into" becomes "investigate", "come up with" becomes "devise" or "propose", "put off" becomes "postpone".', tips: ['Keep a two-column list of common phrasal verbs and their formal single-word equivalents to substitute while writing Task 2'] },
      { heading: 'When phrasal verbs are still appropriate', body: 'Phrasal verbs remain completely natural, and often preferable, in Speaking, where a highly formal register can sound unnatural: saying "I grew up in a small town" is far more natural than an overly formal alternative such as "I was raised in a small town."', tips: ['Reserve formal single-word substitutions mainly for Writing Task 2; do not force them into Speaking answers, where phrasal verbs sound more natural'] },
    ],
  },

  {
    id: 'g-32', orderIndex: 32, title: 'Academic Word Choice: Formal vs Informal Register', category: 'Vocabulary & Style',
    content: [
      { heading: 'Informal words to avoid in Task 2', body: 'Certain everyday words read as too informal for academic Writing: "a lot of" (use "many/much/a significant number of"), "kids" (use "children"), "big" (use "significant/considerable"), "get" (use "obtain/receive/become" depending on meaning), and "stuff/things" (use a specific noun).', tips: ['Scan your essay for get, big, a lot of, and stuff/things before submitting, and replace each with a more formal alternative'] },
      { heading: 'Formal connectors and hedging language', body: 'Formal register also comes from sentence-level choices: using "however" rather than "but" to start a sentence, "in addition" rather than "also" or "plus", and hedged claims such as "it could be argued that" rather than flat, unqualified statements.', tips: ['Formal register is about consistency — mixing very formal vocabulary with slang in the same paragraph looks worse than staying moderately formal throughout'] },
    ],
  },

  {
    id: 'g-33', orderIndex: 33, title: 'Avoiding Redundancy and Wordiness', category: 'Vocabulary & Style',
    content: [
      { heading: 'Redundant word pairs', body: 'Redundancy means using two or more words that repeat the same meaning: "each and every", "basic fundamentals", "completely eliminate", "future plans", "past history", "final outcome". Cutting the redundant word ("plans", "eliminate", "outcome") makes writing tighter without losing any meaning, which examiners reward under Coherence and Cohesion as well as vocabulary.', tips: ['Search your essay for "and every", "basic", "completely", and "future/past" before "plans/history" as quick red flags'] },
      { heading: 'Wordy phrases and their concise alternatives', body: 'Wordy phrases can usually be replaced by a single word without any loss of meaning: "due to the fact that" becomes "because", "in the event that" becomes "if", "a large number of" becomes "many", "in order to" can often simply become "to".', tips: ['A tighter sentence is not always better — occasional longer phrasing is fine for emphasis, but repeated wordiness across an essay reads as padding'] },
    ],
  },

  {
    id: 'g-34', orderIndex: 34, title: 'Sentence Variety: Varying Sentence Openers', category: 'Cohesion',
    content: [
      { heading: 'Why repeated openers weaken an essay', body: 'Starting every sentence with the subject ("The government... The economy... The public...") makes an essay sound mechanical, even if each sentence is grammatically correct. Varying the opening word or phrase — with a subordinate clause, a prepositional phrase, or a linking adverb — creates a more sophisticated, natural rhythm.', tips: ['Read your essay aloud — three or more sentences in a row starting the same way is a clear sign to revise'] },
      { heading: 'Techniques for varied openers', body: 'Useful openers include an adverb clause ("Although the policy was controversial, it proved effective"), a prepositional phrase ("In many developing countries, access to healthcare remains limited"), and a participle clause ("Faced with rising costs, many families cut back on spending").', tips: ['Aim to open at least a few sentences per paragraph with something other than the grammatical subject'] },
    ],
  },

  {
    id: 'g-35', orderIndex: 35, title: 'Cohesive Reference: This, That, These, It', category: 'Cohesion',
    content: [
      { heading: 'Referring back clearly', body: 'Words like this, that, these, those, and it create cohesion by pointing back to something already mentioned, avoiding repetition: "Recycling rates have doubled in the last decade. This trend is likely to continue." Using "this trend" instead of repeating "recycling rates" links the two sentences smoothly.', tips: ['Adding a noun after "this/that" ("this trend", "this approach", "these measures") is usually clearer than leaving "this" alone with no noun'] },
      { heading: 'Avoiding vague reference', body: 'A vague "this" or "it" that could refer to more than one idea in the previous sentence confuses the reader: "The report criticised the policy and praised the implementation team. This shows..." — it is unclear whether "this" refers to the criticism, the praise, or both. Naming exactly what is being referred to removes the ambiguity.', tips: ['If a sentence has two or more possible ideas "this" could point to, add a noun to specify exactly which one you mean'] },
    ],
  },

  {
    id: 'g-36', orderIndex: 36, title: 'Ellipsis: Omitting Repeated Words', category: 'Cohesion',
    content: [
      { heading: 'Leaving out understood words', body: 'Ellipsis is the deliberate omission of words that are clearly understood from context, avoiding unnecessary repetition: "Some students prefer online classes, and others prefer traditional ones" can become "Some students prefer online classes, and others traditional ones" — the verb "prefer" is understood without being repeated.', tips: ['Ellipsis works best in parallel structures where the omitted word is identical to one already stated nearby'] },
      { heading: 'Where ellipsis can cause confusion', body: 'Ellipsis should only be used when the omitted word is completely unambiguous; overusing it in complex sentences can make writing harder, not easier, to follow. In formal IELTS writing, it is safer to use ellipsis sparingly and only in simple, clearly parallel comparisons.', tips: ['If removing a word makes the sentence unclear on a first read, keep the word rather than relying on ellipsis'] },
    ],
  },

  {
    id: 'g-37', orderIndex: 37, title: 'The Zero Conditional for General Truths', category: 'Tenses',
    content: [
      { heading: 'Form and use', body: 'The zero conditional describes a general truth or a result that always happens under a given condition, using present simple in both clauses: "If you heat water to 100 degrees, it boils." Unlike the first conditional, it is not about a specific future possibility but about a fact that is always true.', tips: ['Use "when" and "if" almost interchangeably in the zero conditional, since the result is not really in doubt: "When/If prices rise, demand usually falls"'] },
      { heading: 'Using the zero conditional in Task 2', body: 'The zero conditional is useful for stating general cause-and-effect relationships in academic essays: "If public transport is affordable, more people use it instead of driving." This differs from the first conditional, which would suggest a single specific future event rather than a general pattern.', tips: ['Check that both clauses use present simple — mixing in "will" turns a zero conditional into a first conditional with a different meaning'] },
    ],
  },

  {
    id: 'g-38', orderIndex: 38, title: 'Causative Verbs: Have and Get Something Done', category: 'Grammar Basics',
    content: [
      { heading: 'Have/get + object + past participle', body: 'The causative form "have/get something done" describes arranging for someone else to perform an action, rather than doing it yourself: "I had my essay checked by a tutor" means a tutor checked it, not that the speaker did. The structure is object plus past participle, similar in form to the passive.', tips: ['Compare: "I checked my essay" (I did it myself) versus "I had my essay checked" (someone else did it for me) — the meaning changes completely'] },
      { heading: 'Common IELTS contexts for the causative', body: 'This structure is common in Speaking Part 1 and Part 2 topics about services: "I usually get my hair cut every month" or "We had our house painted last year." Using the causative correctly signals an awareness of who actually performs an action, which basic active or passive sentences cannot show as precisely.', tips: ['"Get" is slightly more informal than "have" in this structure and is very natural in Speaking answers'] },
    ],
  },

  {
    id: 'g-39', orderIndex: 39, title: 'Question Tags in Spoken English', category: 'Grammar Basics',
    content: [
      { heading: 'Forming a question tag', body: 'A question tag is a short question added to the end of a statement, formed with the opposite polarity: a positive statement takes a negative tag, and a negative statement takes a positive tag, matching the auxiliary verb of the main clause: "The exam was difficult, wasn\'t it?" "You have not visited before, have you?"', tips: ['The tag must match the main verb\'s auxiliary and tense exactly — a common error is using "isn\'t it" after any sentence regardless of tense'] },
      { heading: 'Using question tags naturally in Speaking', body: 'Question tags are mainly a spoken feature and can add a natural, conversational tone in Speaking Part 1 and Part 3 when checking agreement or inviting a response: "That is quite a common view, isn\'t it?" Overusing them can sound artificial, so one or two natural instances are more effective than adding a tag to every sentence.', tips: ['Falling intonation on a tag suggests you expect agreement; rising intonation suggests a genuine question — practise both'] },
    ],
  },

  {
    id: 'g-40', orderIndex: 40, title: 'Common False Friends: Affect/Effect, Its/It\'s, Then/Than', category: 'Vocabulary & Style',
    content: [
      { heading: 'Affect vs effect', body: '"Affect" is almost always a verb meaning to influence something: "Rising costs affect low-income families the most." "Effect" is almost always a noun meaning a result: "The effect of rising costs is visible in household budgets." A simple check is that "the effect" can follow "the", while "the affect" almost never sounds natural.', tips: ['If the word needs "the" or "an" in front of it, it is almost certainly "effect"; if it needs a subject and object like a verb, it is "affect"'] },
      { heading: 'Its vs it\'s, and then vs than', body: '"Its" is possessive, meaning belonging to it: "the company increased its output". "It\'s" is a contraction of "it is" or "it has" and should be avoided in formal writing anyway. "Then" refers to time or sequence ("prices rose, then fell"); "than" is used only in comparisons ("prices are higher than before") — confusing the two changes the meaning or breaks the sentence entirely.', tips: ['Replace "it\'s" with "it is" as a test — if the sentence still works, "it\'s" was correct; if not, you need "its"', 'Remember: than means comparison (more than, better than); then means time (first... then...)'] },
    ],
  },
];
