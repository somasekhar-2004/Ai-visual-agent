import type { ListeningTrack, Question } from '@/types/models';

export const listeningTracks: ListeningTrack[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    title: 'Booking a Self-Storage Unit',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      Receptionist: 'a warm, professional female receptionist in her 30s with a neutral British accent, clear diction, patient and helpful tone',
      Caller: 'a polite adult male customer in his 30s with a neutral British accent, natural relaxed conversational tone — deliberately a contrasting voice to the Receptionist, not just a different ID (see the Listening overhaul report: two near-identical-sounding IDs were the root cause of this track failing real-device QA)',
    },
    audioUrl: null,
    sectionNumber: 1,
    transcript: `RECEPTIONIST: Good morning, Citywide Storage, how can I help you?
CALLER: Hi, I'd like to rent a storage unit, please. Could you tell me what sizes you have available?
RECEPTIONIST: Of course. We have three sizes: small, which is about the size of a wardrobe, medium, roughly the size of a single garage, and large, which is more like a double garage.
CALLER: I think medium should be enough — I'm storing furniture from a two-bedroom flat.
RECEPTIONIST: Great choice. The medium unit is thirty-eight pounds per week, or you can pay monthly for one hundred and forty-five pounds, which works out a bit cheaper.
CALLER: I'll go with the monthly option then. Can I ask, is there a deposit?
RECEPTIONIST: Yes, we require a refundable deposit of fifty pounds, paid on your first visit.
CALLER: That's fine. Can I get access any time, or are there set hours?
RECEPTIONIST: Access is from six a.m. to ten p.m., seven days a week. If you need twenty-four hour access, that's our large facility on Bridge Road, not this branch.
CALLER: Six to ten is fine for me. Could I take your address, please?
RECEPTIONIST: Yes, it's fifteen, Marlow Street. That's M-A-R-L-O-W Street, postcode SE1 4QB.
CALLER: Got it, thank you. And can I book online or do I need to come in?
RECEPTIONIST: You can book online, but we do need to see photo ID on your first visit — a passport or driving licence is fine.
CALLER: Perfect. Last question — do you sell packing boxes there?
RECEPTIONIST: We do, small boxes are one pound fifty each, and we also sell bubble wrap and tape.
CALLER: Excellent, thank you very much for your help.
RECEPTIONIST: You're welcome, have a great day.`,
    turns: [
      { speaker: 'Receptionist', text: 'Good morning, Citywide Storage, how can I help you?' },
      { speaker: 'Caller', text: "Hi, I'd like to rent a storage unit, please. Could you tell me what sizes you have available?" },
      { speaker: 'Receptionist', text: 'Of course. We have three sizes: small, which is about the size of a wardrobe, medium, roughly the size of a single garage, and large, which is more like a double garage.' },
      { speaker: 'Caller', text: "I think medium should be enough — I'm storing furniture from a two-bedroom flat." },
      { speaker: 'Receptionist', text: 'Great choice. The medium unit is thirty-eight pounds per week, or you can pay monthly for one hundred and forty-five pounds, which works out a bit cheaper.' },
      { speaker: 'Caller', text: "I'll go with the monthly option then. Can I ask, is there a deposit?" },
      { speaker: 'Receptionist', text: 'Yes, we require a refundable deposit of fifty pounds, paid on your first visit.' },
      { speaker: 'Caller', text: "That's fine. Can I get access any time, or are there set hours?" },
      { speaker: 'Receptionist', text: 'Access is from six a.m. to ten p.m., seven days a week. If you need twenty-four hour access, that\'s our large facility on Bridge Road, not this branch.' },
      { speaker: 'Caller', text: 'Six to ten is fine for me. Could I take your address, please?' },
      { speaker: 'Receptionist', text: "Yes, it's fifteen, Marlow Street. That's M-A-R-L-O-W Street, postcode SE1 4QB." },
      { speaker: 'Caller', text: 'Got it, thank you. And can I book online or do I need to come in?' },
      { speaker: 'Receptionist', text: 'You can book online, but we do need to see photo ID on your first visit — a passport or driving licence is fine.' },
      { speaker: 'Caller', text: 'Perfect. Last question — do you sell packing boxes there?' },
      { speaker: 'Receptionist', text: 'We do, small boxes are one pound fifty each, and we also sell bubble wrap and tape.' },
      { speaker: 'Caller', text: 'Excellent, thank you very much for your help.' },
      { speaker: 'Receptionist', text: "You're welcome, have a great day." },
    ],
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    title: 'The History and Ecology of Peat Bogs',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      Lecturer: 'an articulate university lecturer in his 40s-50s with a neutral British accent, formal academic register, measured and authoritative but engaging delivery',
    },
    audioUrl: null,
    sectionNumber: 4,
    transcript: `LECTURER: Good afternoon, everyone. Today I want to talk about a habitat that rarely gets the attention it deserves: peat bogs. Peat bogs form in waterlogged conditions where dead plant material, mostly a moss called sphagnum, doesn't fully decompose because there isn't enough oxygen in the soggy ground. Over thousands of years, this partially decomposed material builds up into a thick layer called peat, sometimes several metres deep.

Now, why should we care about bogs? First, they're remarkable carbon stores. Although peatlands cover only around three percent of the world's land surface, they store nearly twice as much carbon as all the world's forests combined. This happens because the waterlogged, low-oxygen environment locks carbon into the peat instead of releasing it back into the atmosphere as the plant material would if it decomposed normally.

Second, bogs are unique ecosystems supporting highly specialised species. Because bog water is naturally very acidic and low in nutrients, most ordinary plants cannot survive there. Instead, you find remarkable adaptations, like the sundew, a small carnivorous plant that traps insects to obtain nutrients it can't get from the soil.

Unfortunately, peat bogs have been under serious threat for over a century. Historically, peat was cut and dried for use as fuel, a practice still continued in some regions today. More significantly in recent decades, large areas of bog have been drained for agriculture or for commercial peat extraction, which is sold as garden compost. When a bog is drained, the peat is exposed to oxygen and begins to decompose rapidly, releasing centuries of stored carbon back into the atmosphere within just a few years.

The good news is that bog restoration has become a major focus of conservation efforts. Restoration typically involves blocking the drainage channels that were dug to dry out the bog, allowing the water table to rise again. Within a few years, sphagnum moss can begin to recolonise, and the bog gradually starts storing carbon again rather than releasing it. Several large-scale restoration projects are currently underway, and early results suggest that a fully restored bog can return to being a net carbon store within roughly ten to fifteen years, though restoring the full range of specialised wildlife takes considerably longer.`,
    turns: [
      {
        speaker: 'Lecturer',
        text: "Good afternoon, everyone. Today I want to talk about a habitat that rarely gets the attention it deserves: peat bogs. Peat bogs form in waterlogged conditions where dead plant material, mostly a moss called sphagnum, doesn't fully decompose because there isn't enough oxygen in the soggy ground. Over thousands of years, this partially decomposed material builds up into a thick layer called peat, sometimes several metres deep.",
      },
      {
        speaker: 'Lecturer',
        text: "Now, why should we care about bogs? First, they're remarkable carbon stores. Although peatlands cover only around three percent of the world's land surface, they store nearly twice as much carbon as all the world's forests combined. This happens because the waterlogged, low-oxygen environment locks carbon into the peat instead of releasing it back into the atmosphere as the plant material would if it decomposed normally.",
      },
      {
        speaker: 'Lecturer',
        text: "Second, bogs are unique ecosystems supporting highly specialised species. Because bog water is naturally very acidic and low in nutrients, most ordinary plants cannot survive there. Instead, you find remarkable adaptations, like the sundew, a small carnivorous plant that traps insects to obtain nutrients it can't get from the soil.",
      },
      {
        speaker: 'Lecturer',
        text: 'Unfortunately, peat bogs have been under serious threat for over a century. Historically, peat was cut and dried for use as fuel, a practice still continued in some regions today. More significantly in recent decades, large areas of bog have been drained for agriculture or for commercial peat extraction, which is sold as garden compost. When a bog is drained, the peat is exposed to oxygen and begins to decompose rapidly, releasing centuries of stored carbon back into the atmosphere within just a few years.',
      },
      {
        speaker: 'Lecturer',
        text: 'The good news is that bog restoration has become a major focus of conservation efforts. Restoration typically involves blocking the drainage channels that were dug to dry out the bog, allowing the water table to rise again. Within a few years, sphagnum moss can begin to recolonise, and the bog gradually starts storing carbon again rather than releasing it. Several large-scale restoration projects are currently underway, and early results suggest that a fully restored bog can return to being a net carbon store within roughly ten to fifteen years, though restoring the full range of specialised wildlife takes considerably longer.',
      },
    ],
  },
];

export const listeningQuestions: Question[] = [
  { id: 'lq-1', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 5.0,
    prompt: 'Unit size chosen: ______', passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: 'medium', explanation: 'The caller says "I think medium should be enough."', strategyNote: 'Predict a size word (small/medium/large) before listening.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 1, isPremium: false },
  { id: 'lq-2', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Monthly cost: £______', passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '145', explanation: 'The receptionist says the monthly option is "one hundred and forty-five pounds."', strategyNote: 'Numbers spoken as words — write the digit form unless told otherwise.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-3', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Deposit required: £______', passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '50', explanation: 'The passage states "a refundable deposit of fifty pounds."', strategyNote: 'Listen for the word "deposit" as your cue.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 3, isPremium: false },
  { id: 'lq-4', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Access hours: 6 a.m. to ______ p.m.', passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '10', explanation: 'Access is stated as "from six a.m. to ten p.m."', strategyNote: 'Two numbers are given close together — make sure you note both start and end correctly.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-5', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Street address: 15 ______ Street', passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: 'Marlow', explanation: 'The address is spelled out: "M-A-R-L-O-W Street."', strategyNote: 'When a word is spelled letter by letter, write it down as spelled — do not guess ahead.',
    tags: ['form_completion'], estimatedTimeSeconds: 50, orderIndex: 5, isPremium: false },
  { id: 'lq-6', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'What must the caller bring on their first visit?', passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000001',
    options: ['A bank statement', 'Photo ID', 'A signed contract only', 'Proof of address'],
    correctAnswer: 'Photo ID', explanation: 'The receptionist says "we do need to see photo ID on your first visit."', strategyNote: 'Listen for the word "need" — it usually flags a requirement question\'s answer.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 6, isPremium: false },
  { id: 'lq-7', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Peat forms because dead plant material does not fully ______ in waterlogged soil.', passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'decompose', explanation: 'The lecturer explains the plant material "doesn\'t fully decompose because there isn\'t enough oxygen."', strategyNote: 'The word "because" often precedes the exact reason you need for a note-completion gap.',
    tags: ['note_completion'], estimatedTimeSeconds: 50, orderIndex: 7, isPremium: false },
  { id: 'lq-8', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: "Peatlands cover about ______ percent of the world's land surface.", passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'three', explanation: 'The lecturer states peatlands "cover only around three percent of the world\'s land surface."', strategyNote: 'Percentages are common note-completion answers — listen for "percent" as your cue word.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 8, isPremium: false },
  { id: 'lq-9', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'What is the name of the carnivorous plant mentioned as an example of bog adaptation?', passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: ['sundew', 'the sundew'], explanation: 'The lecturer names "the sundew, a small carnivorous plant."', strategyNote: 'Listen for the phrase "for example" or a similarly specific named example after a general claim.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 9, isPremium: false },
  { id: 'lq-10', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'According to the lecture, what happens when a bog is drained?', passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000002',
    options: [
      'It becomes more acidic and supports more wildlife',
      'The peat is exposed to oxygen and decomposes, releasing carbon',
      'It is immediately used for growing crops',
      'The sphagnum moss grows more quickly',
    ],
    correctAnswer: 'The peat is exposed to oxygen and decomposes, releasing carbon',
    explanation: "This matches the lecturer's explanation directly following the mention of draining for agriculture.",
    strategyNote: 'Eliminate options describing the opposite effect (more wildlife, faster moss growth).',
    tags: ['multiple_choice'], estimatedTimeSeconds: 55, orderIndex: 10, isPremium: false },
  { id: 'lq-11', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: 'A fully restored bog can become a net carbon store again within roughly ______ years.', passageId: null, listeningTrackId: '30000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'ten to fifteen', explanation: 'The lecturer concludes restored bogs return to being a net carbon store "within roughly ten to fifteen years."', strategyNote: 'Number ranges ("X to Y years") are common at the end of an academic lecture as a summarising statistic.',
    tags: ['note_completion'], estimatedTimeSeconds: 50, orderIndex: 11, isPremium: false },
];
