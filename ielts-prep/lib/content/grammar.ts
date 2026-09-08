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
];
