import type { ListeningTrack, Question } from '@/types/models';

export const listeningTracksSet5: ListeningTrack[] = [
  // ---------- MOCK 8 ----------
  {
    id: '35000000-0000-0000-0000-000000000001',
    title: 'Booking a Car for a Weekend Road Trip',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Agent": "a professional male booking agent in his 30s with a neutral British accent, efficient and courteous tone — introduces themselves as Daniel in the call",
      "Customer": "a polite adult female customer in her 30s with a neutral British accent, natural relaxed conversational tone",
    },
    audioUrl: null,
    sectionNumber: 1,
    transcript: `AGENT: Good afternoon, Coastline Car Hire, this is Daniel speaking, how can I help?
CUSTOMER: Hi, I would like to hire a car for a weekend, please.
AGENT: Of course. What dates did you have in mind?
CUSTOMER: Friday the second of October to Monday the fifth.
AGENT: Right, so that is three nights, four days including pick-up and drop-off. What type of car would you like? We have compact, saloon, or estate.
CUSTOMER: We are a family of four with a lot of luggage, so probably the estate.
AGENT: Good choice for that. The estate is forty-two pounds a day — oh, sorry, let me check that again — the estate is actually forty-eight pounds a day; forty-two is the saloon.
CUSTOMER: OK, forty-eight then, that is fine.
AGENT: Does that include insurance? Basic cover is included, but there is an excess of three hundred pounds unless you add reduced-excess cover for an extra nine pounds a day.
CUSTOMER: I will add that, just for peace of mind.
AGENT: Good idea. Can I take your surname, please?
CUSTOMER: It is Bennett — B-E-N-N-E-T-T.
AGENT: Got it. And will you be picking the car up from our main branch?
CUSTOMER: Actually, could you deliver it? We are staying at a cottage out near Thornbury.
AGENT: We can deliver for a flat fee of fifteen pounds, as long as it is within twenty miles of the branch.
CUSTOMER: Thornbury is about twelve miles, so that should work.
AGENT: Perfect, I will note that down. What time would you like it delivered on the Friday?
CUSTOMER: Ideally by nine in the morning, if that is possible.
AGENT: That is fine. Finally, will you need a child seat? We can provide one for six pounds for the whole rental.
CUSTOMER: Yes please, one child seat.
AGENT: Great, I will get that added and email you a confirmation.
CUSTOMER: Thank you so much for your help.
AGENT: You are welcome, have a lovely trip.`,
    turns: [
      { speaker: "Agent", text: "Good afternoon, Coastline Car Hire, this is Daniel speaking, how can I help?" },
      { speaker: "Customer", text: "Hi, I would like to hire a car for a weekend, please." },
      { speaker: "Agent", text: "Of course. What dates did you have in mind?" },
      { speaker: "Customer", text: "Friday the second of October to Monday the fifth." },
      { speaker: "Agent", text: "Right, so that is three nights, four days including pick-up and drop-off. What type of car would you like? We have compact, saloon, or estate." },
      { speaker: "Customer", text: "We are a family of four with a lot of luggage, so probably the estate." },
      { speaker: "Agent", text: "Good choice for that. The estate is forty-two pounds a day — oh, sorry, let me check that again — the estate is actually forty-eight pounds a day; forty-two is the saloon." },
      { speaker: "Customer", text: "OK, forty-eight then, that is fine." },
      { speaker: "Agent", text: "Does that include insurance? Basic cover is included, but there is an excess of three hundred pounds unless you add reduced-excess cover for an extra nine pounds a day." },
      { speaker: "Customer", text: "I will add that, just for peace of mind." },
      { speaker: "Agent", text: "Good idea. Can I take your surname, please?" },
      { speaker: "Customer", text: "It is Bennett — B-E-N-N-E-T-T." },
      { speaker: "Agent", text: "Got it. And will you be picking the car up from our main branch?" },
      { speaker: "Customer", text: "Actually, could you deliver it? We are staying at a cottage out near Thornbury." },
      { speaker: "Agent", text: "We can deliver for a flat fee of fifteen pounds, as long as it is within twenty miles of the branch." },
      { speaker: "Customer", text: "Thornbury is about twelve miles, so that should work." },
      { speaker: "Agent", text: "Perfect, I will note that down. What time would you like it delivered on the Friday?" },
      { speaker: "Customer", text: "Ideally by nine in the morning, if that is possible." },
      { speaker: "Agent", text: "That is fine. Finally, will you need a child seat? We can provide one for six pounds for the whole rental." },
      { speaker: "Customer", text: "Yes please, one child seat." },
      { speaker: "Agent", text: "Great, I will get that added and email you a confirmation." },
      { speaker: "Customer", text: "Thank you so much for your help." },
      { speaker: "Agent", text: "You are welcome, have a lovely trip." },
    ],
  },
  {
    id: '35000000-0000-0000-0000-000000000002',
    title: 'A Guide to the New Riverside Recycling and Reuse Centre',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Manager": "a knowledgeable female facility manager in her 30s-40s with a neutral British accent, informative and approachable tone",
    },
    audioUrl: null,
    sectionNumber: 2,
    transcript: `MANAGER: Good morning, and welcome to the new Riverside Recycling and Reuse Centre. My name is Grace, and I manage the site, so I just want to run through how everything works before you head off to drop off your items.

Let us start with opening hours. We are open every day except Wednesdays, from eight a.m. until six p.m. in summer, and eight a.m. until four p.m. once we move to winter hours in November.

Now, the layout. As you drive in, the general waste and garden waste skips are on your left, and directly ahead you will find the recycling bays for glass, paper, and plastic, each clearly labelled by colour. Household electricals — things like kettles, toasters and small appliances — go to the far end, in the covered bay next to the office.

We also have a reuse shop, which is new this year. If you have furniture, books, or working electrical items you no longer need, you can drop them at the reuse shop instead of the skips, and the small team here will resell them cheaply, with all proceeds going to the local hospice.

A few rules to keep in mind. Rubble and building waste, such as bricks or tiles, are not accepted here at all — for that, you need the trade centre on Filton Road. We also ask that vehicles are limited to a maximum of six visits per month, mainly to prevent trade waste being dumped here instead of at proper commercial sites.

If you are not sure which category something falls into, just ask one of our site assistants, who wear bright green vests, and they will point you in the right direction.

Parking is free for the first thirty minutes, but after that there is a charge of one pound for every fifteen minutes, mainly to keep the turnover of vehicles moving on busy Saturdays.

And finally, if you would like updates about special collection days, such as our upcoming electronics amnesty day on the fourteenth of November, you can sign up to our newsletter at the front desk, or follow us online.

That is everything — thank you for recycling responsibly, and enjoy your visit.`,
    turns: [
      { speaker: "Manager", text: "Good morning, and welcome to the new Riverside Recycling and Reuse Centre. My name is Grace, and I manage the site, so I just want to run through how everything works before you head off to drop off your items." },
      { speaker: "Manager", text: "Let us start with opening hours. We are open every day except Wednesdays, from eight a.m. until six p.m. in summer, and eight a.m. until four p.m. once we move to winter hours in November." },
      { speaker: "Manager", text: "Now, the layout. As you drive in, the general waste and garden waste skips are on your left, and directly ahead you will find the recycling bays for glass, paper, and plastic, each clearly labelled by colour. Household electricals — things like kettles, toasters and small appliances — go to the far end, in the covered bay next to the office." },
      { speaker: "Manager", text: "We also have a reuse shop, which is new this year. If you have furniture, books, or working electrical items you no longer need, you can drop them at the reuse shop instead of the skips, and the small team here will resell them cheaply, with all proceeds going to the local hospice." },
      { speaker: "Manager", text: "A few rules to keep in mind. Rubble and building waste, such as bricks or tiles, are not accepted here at all — for that, you need the trade centre on Filton Road. We also ask that vehicles are limited to a maximum of six visits per month, mainly to prevent trade waste being dumped here instead of at proper commercial sites." },
      { speaker: "Manager", text: "If you are not sure which category something falls into, just ask one of our site assistants, who wear bright green vests, and they will point you in the right direction." },
      { speaker: "Manager", text: "Parking is free for the first thirty minutes, but after that there is a charge of one pound for every fifteen minutes, mainly to keep the turnover of vehicles moving on busy Saturdays." },
      { speaker: "Manager", text: "And finally, if you would like updates about special collection days, such as our upcoming electronics amnesty day on the fourteenth of November, you can sign up to our newsletter at the front desk, or follow us online." },
      { speaker: "Manager", text: "That is everything — thank you for recycling responsibly, and enjoy your visit." },
    ],
  },
  {
    id: '35000000-0000-0000-0000-000000000003',
    title: 'Discussing a Group Assignment on Sleep and Memory',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Dr Patel": "an experienced male academic in his 40s-50s with a neutral British accent, calm, authoritative, and constructive tone",
      "Ryan": "a male university student in his early 20s with a neutral British accent, casual natural conversational tone",
      "Zoe": "a female university student in her early 20s with a neutral British accent, casual natural conversational tone",
    },
    audioUrl: null,
    sectionNumber: 3,
    transcript: `DR PATEL: Come in, Ryan, Zoe — let us talk through your assignment on sleep and memory before the deadline.
RYAN: Thanks. So we have decided to focus specifically on how sleep deprivation affects short-term memory recall.
ZOE: We are planning to compare two groups — one that sleeps a full eight hours, and one restricted to four hours, over a single night.
DR PATEL: Sensible design. How many participants are you aiming to recruit?
RYAN: We are hoping for twenty in each group, so forty in total, mostly recruited from the psychology department.
DR PATEL: That should give you reasonable statistical power. What test will you use to measure memory recall?
ZOE: We will use a word-list recall test — participants see a list of thirty words for two minutes, then recall as many as possible after a delay.
DR PATEL: Good, that is a well-established method. Who is doing which part of the write-up?
RYAN: I am covering the introduction and literature review, and Zoe is doing the methodology and results.
ZOE: And we are splitting the discussion section between us, same as last time.
DR PATEL: Have you thought about how you will control for caffeine intake, since that could easily skew memory performance?
RYAN: Good point — we had not actually thought of that. We could ask participants to avoid caffeine for twelve hours before the test.
DR PATEL: That would work well; make sure you mention that as a controlled variable in your methodology.
ZOE: We will. One thing we are unsure about — do we need formal ethical approval, since this involves depriving people of sleep?
DR PATEL: Yes, definitely — sleep deprivation studies always require full ethics approval, even a mild version like this. You will need to submit an application.
RYAN: When is the deadline for submitting that?
DR PATEL: Submit it by the ninth of November, so there is enough time for the committee to review it before your data collection date.
ZOE: And when is the assignment itself due?
DR PATEL: The final report is due on the third of December, in your two p.m. seminar slot.
RYAN: Understood. Should we send you a draft beforehand?
DR PATEL: Yes please, send me a draft by the twenty-fifth of November, as a PDF rather than a Word document, so nothing shifts formatting.
ZOE: Great, thank you, that is really helpful.
DR PATEL: No problem — good luck with the ethics application.`,
    turns: [
      { speaker: "Dr Patel", text: "Come in, Ryan, Zoe — let us talk through your assignment on sleep and memory before the deadline." },
      { speaker: "Ryan", text: "Thanks. So we have decided to focus specifically on how sleep deprivation affects short-term memory recall." },
      { speaker: "Zoe", text: "We are planning to compare two groups — one that sleeps a full eight hours, and one restricted to four hours, over a single night." },
      { speaker: "Dr Patel", text: "Sensible design. How many participants are you aiming to recruit?" },
      { speaker: "Ryan", text: "We are hoping for twenty in each group, so forty in total, mostly recruited from the psychology department." },
      { speaker: "Dr Patel", text: "That should give you reasonable statistical power. What test will you use to measure memory recall?" },
      { speaker: "Zoe", text: "We will use a word-list recall test — participants see a list of thirty words for two minutes, then recall as many as possible after a delay." },
      { speaker: "Dr Patel", text: "Good, that is a well-established method. Who is doing which part of the write-up?" },
      { speaker: "Ryan", text: "I am covering the introduction and literature review, and Zoe is doing the methodology and results." },
      { speaker: "Zoe", text: "And we are splitting the discussion section between us, same as last time." },
      { speaker: "Dr Patel", text: "Have you thought about how you will control for caffeine intake, since that could easily skew memory performance?" },
      { speaker: "Ryan", text: "Good point — we had not actually thought of that. We could ask participants to avoid caffeine for twelve hours before the test." },
      { speaker: "Dr Patel", text: "That would work well; make sure you mention that as a controlled variable in your methodology." },
      { speaker: "Zoe", text: "We will. One thing we are unsure about — do we need formal ethical approval, since this involves depriving people of sleep?" },
      { speaker: "Dr Patel", text: "Yes, definitely — sleep deprivation studies always require full ethics approval, even a mild version like this. You will need to submit an application." },
      { speaker: "Ryan", text: "When is the deadline for submitting that?" },
      { speaker: "Dr Patel", text: "Submit it by the ninth of November, so there is enough time for the committee to review it before your data collection date." },
      { speaker: "Zoe", text: "And when is the assignment itself due?" },
      { speaker: "Dr Patel", text: "The final report is due on the third of December, in your two p.m. seminar slot." },
      { speaker: "Ryan", text: "Understood. Should we send you a draft beforehand?" },
      { speaker: "Dr Patel", text: "Yes please, send me a draft by the twenty-fifth of November, as a PDF rather than a Word document, so nothing shifts formatting." },
      { speaker: "Zoe", text: "Great, thank you, that is really helpful." },
      { speaker: "Dr Patel", text: "No problem — good luck with the ethics application." },
    ],
  },
  {
    id: '35000000-0000-0000-0000-000000000004',
    title: 'The Physiology of Circadian Rhythms',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Lecturer": "an articulate female university lecturer in her 40s-50s with a neutral British accent, formal academic register, measured and authoritative but engaging delivery",
    },
    audioUrl: null,
    sectionNumber: 4,
    transcript: `LECTURER: Good morning, everyone. Today's lecture looks at circadian rhythms — the roughly twenty-four-hour internal cycles that regulate sleep, alertness, body temperature, and hormone release in almost every living organism, from bacteria to humans.

At the centre of the human circadian system is a tiny cluster of around twenty thousand neurons in the hypothalamus called the suprachiasmatic nucleus, often abbreviated to the SCN. The SCN acts as the body's master clock, synchronising countless smaller clocks found in individual organs and tissues throughout the body.

So how does the SCN know what time it is? The primary cue, or what scientists call a "zeitgeber" — a German term meaning "time giver" — is light. Specialised cells in the retina detect ambient light levels and send that information directly to the SCN via a pathway that is separate from the visual system used for seeing images. This is why even people who are completely blind, but whose retinas still detect light, can maintain a roughly normal circadian rhythm.

One of the clearest hormonal outputs of the circadian system is melatonin, sometimes called the "hormone of darkness." The pineal gland begins releasing melatonin in the evening as light levels fall, and levels typically peak somewhere between two and four in the morning before declining again toward dawn. Crucially, exposure to bright light — including the blue-toned light emitted by many phone and computer screens — can suppress melatonin release, which is one reason researchers recommend limiting screen use in the hour or two before bedtime.

Circadian rhythms don't just govern sleep, though. Body temperature also follows a predictable daily pattern, typically reaching its lowest point in the early hours of the morning and its highest point in the late afternoon or early evening. Athletic performance tends to track this temperature curve fairly closely, which is part of the reason many world records in track and field have historically been set in late-afternoon competition sessions rather than early morning ones.

Disruption to circadian rhythms has been linked to a range of health consequences. Shift workers, who are required to be alert during hours when their internal clock expects them to be asleep, show elevated rates of several conditions, including cardiovascular disease and certain metabolic disorders, when studied over long careers. Jet lag is a more temporary, though still uncomfortable, example of the same underlying mismatch — the internal clock remains set to the departure time zone for several days after arrival, gradually shifting by roughly one hour per day until it catches up with local time.

Finally, I want to mention chronotype — the natural tendency of an individual toward either an earlier or a later sleep-wake pattern, commonly described using the informal terms "morning lark" and "night owl." Chronotype appears to be substantially influenced by genetics, and research increasingly suggests that forcing a late chronotype into an early schedule, such as an early school or work start time, can produce a kind of chronic, low-grade sleep deprivation.

Next week, we'll examine how circadian research has begun to influence shift-scheduling policy in hospitals and other twenty-four-hour industries.`,
    turns: [
      { speaker: "Lecturer", text: "Good morning, everyone. Today's lecture looks at circadian rhythms — the roughly twenty-four-hour internal cycles that regulate sleep, alertness, body temperature, and hormone release in almost every living organism, from bacteria to humans." },
      { speaker: "Lecturer", text: "At the centre of the human circadian system is a tiny cluster of around twenty thousand neurons in the hypothalamus called the suprachiasmatic nucleus, often abbreviated to the SCN. The SCN acts as the body's master clock, synchronising countless smaller clocks found in individual organs and tissues throughout the body." },
      { speaker: "Lecturer", text: "So how does the SCN know what time it is? The primary cue, or what scientists call a \"zeitgeber\" — a German term meaning \"time giver\" — is light. Specialised cells in the retina detect ambient light levels and send that information directly to the SCN via a pathway that is separate from the visual system used for seeing images. This is why even people who are completely blind, but whose retinas still detect light, can maintain a roughly normal circadian rhythm." },
      { speaker: "Lecturer", text: "One of the clearest hormonal outputs of the circadian system is melatonin, sometimes called the \"hormone of darkness.\" The pineal gland begins releasing melatonin in the evening as light levels fall, and levels typically peak somewhere between two and four in the morning before declining again toward dawn. Crucially, exposure to bright light — including the blue-toned light emitted by many phone and computer screens — can suppress melatonin release, which is one reason researchers recommend limiting screen use in the hour or two before bedtime." },
      { speaker: "Lecturer", text: "Circadian rhythms don't just govern sleep, though. Body temperature also follows a predictable daily pattern, typically reaching its lowest point in the early hours of the morning and its highest point in the late afternoon or early evening. Athletic performance tends to track this temperature curve fairly closely, which is part of the reason many world records in track and field have historically been set in late-afternoon competition sessions rather than early morning ones." },
      { speaker: "Lecturer", text: "Disruption to circadian rhythms has been linked to a range of health consequences. Shift workers, who are required to be alert during hours when their internal clock expects them to be asleep, show elevated rates of several conditions, including cardiovascular disease and certain metabolic disorders, when studied over long careers. Jet lag is a more temporary, though still uncomfortable, example of the same underlying mismatch — the internal clock remains set to the departure time zone for several days after arrival, gradually shifting by roughly one hour per day until it catches up with local time." },
      { speaker: "Lecturer", text: "Finally, I want to mention chronotype — the natural tendency of an individual toward either an earlier or a later sleep-wake pattern, commonly described using the informal terms \"morning lark\" and \"night owl.\" Chronotype appears to be substantially influenced by genetics, and research increasingly suggests that forcing a late chronotype into an early schedule, such as an early school or work start time, can produce a kind of chronic, low-grade sleep deprivation." },
      { speaker: "Lecturer", text: "Next week, we'll examine how circadian research has begun to influence shift-scheduling policy in hospitals and other twenty-four-hour industries." },
    ],
  },

  // ---------- MOCK 9 ----------
  {
    id: '35000000-0000-0000-0000-000000000005',
    title: 'Booking a Removal Company for a House Move',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Agent": "a professional female booking agent in her 30s with a neutral British accent, efficient and courteous tone — introduces themselves as Chloe in the call",
      "Customer": "a polite adult male customer in his 30s with a neutral British accent, natural relaxed conversational tone",
    },
    audioUrl: null,
    sectionNumber: 1,
    transcript: `AGENT: Good afternoon, Swift Removals, this is Chloe speaking, how can I help?
CUSTOMER: Hi, I am moving house next month and I would like a quote, please.
AGENT: Of course. Whereabouts are you moving from and to?
CUSTOMER: From a two-bedroom flat in Leeds to a house in Harrogate.
AGENT: That is about eighteen miles, so it falls within our standard local rate. Do you know roughly the size of the move — number of rooms, any large furniture?
CUSTOMER: Two bedrooms and a living room, plus a large wardrobe and a piano, actually.
AGENT: A piano changes things slightly — we will need to send a two-person team instead of one, along with special piano straps. Are you flexible on your moving date?
CUSTOMER: Fairly, yes — I was hoping for the fourteenth of next month, but the following week works too.
AGENT: Let me check... the fourteenth is fully booked, but we do have the fifteenth free.
CUSTOMER: The fifteenth is fine.
AGENT: Great. Based on what you have described, the cost would be three hundred and eighty pounds — oh, sorry, let me recalculate with the piano surcharge — that actually brings it to four hundred and twenty pounds.
CUSTOMER: OK, four hundred and twenty it is. Is packing included in that?
AGENT: No, that is just for the move itself. We do offer a packing service for an extra one hundred and ten pounds, where our team packs everything the day before.
CUSTOMER: I think I will pack myself, thanks. Do you sell boxes separately?
AGENT: Yes, boxes are one pound twenty each, or you can hire fifty reusable plastic crates for thirty-five pounds, which most people find works out cheaper.
CUSTOMER: I will go with the crates, then. Can I take your address to send a cheque?
AGENT: Actually, we only take card or bank transfer now, no cheques. Our office is at forty-one, Grenville Road — that is G-R-E-N-V-I-L-L-E.
CUSTOMER: Got it, Grenville Road. How much is the deposit?
AGENT: We need a deposit of seventy-five pounds to confirm the booking, with the balance due on the day.
CUSTOMER: Perfect, I will transfer that today.
AGENT: Lovely, I will email you the confirmation and our terms and conditions.
CUSTOMER: Thank you so much for your help.`,
    turns: [
      { speaker: "Agent", text: "Good afternoon, Swift Removals, this is Chloe speaking, how can I help?" },
      { speaker: "Customer", text: "Hi, I am moving house next month and I would like a quote, please." },
      { speaker: "Agent", text: "Of course. Whereabouts are you moving from and to?" },
      { speaker: "Customer", text: "From a two-bedroom flat in Leeds to a house in Harrogate." },
      { speaker: "Agent", text: "That is about eighteen miles, so it falls within our standard local rate. Do you know roughly the size of the move — number of rooms, any large furniture?" },
      { speaker: "Customer", text: "Two bedrooms and a living room, plus a large wardrobe and a piano, actually." },
      { speaker: "Agent", text: "A piano changes things slightly — we will need to send a two-person team instead of one, along with special piano straps. Are you flexible on your moving date?" },
      { speaker: "Customer", text: "Fairly, yes — I was hoping for the fourteenth of next month, but the following week works too." },
      { speaker: "Agent", text: "Let me check... the fourteenth is fully booked, but we do have the fifteenth free." },
      { speaker: "Customer", text: "The fifteenth is fine." },
      { speaker: "Agent", text: "Great. Based on what you have described, the cost would be three hundred and eighty pounds — oh, sorry, let me recalculate with the piano surcharge — that actually brings it to four hundred and twenty pounds." },
      { speaker: "Customer", text: "OK, four hundred and twenty it is. Is packing included in that?" },
      { speaker: "Agent", text: "No, that is just for the move itself. We do offer a packing service for an extra one hundred and ten pounds, where our team packs everything the day before." },
      { speaker: "Customer", text: "I think I will pack myself, thanks. Do you sell boxes separately?" },
      { speaker: "Agent", text: "Yes, boxes are one pound twenty each, or you can hire fifty reusable plastic crates for thirty-five pounds, which most people find works out cheaper." },
      { speaker: "Customer", text: "I will go with the crates, then. Can I take your address to send a cheque?" },
      { speaker: "Agent", text: "Actually, we only take card or bank transfer now, no cheques. Our office is at forty-one, Grenville Road — that is G-R-E-N-V-I-L-L-E." },
      { speaker: "Customer", text: "Got it, Grenville Road. How much is the deposit?" },
      { speaker: "Agent", text: "We need a deposit of seventy-five pounds to confirm the booking, with the balance due on the day." },
      { speaker: "Customer", text: "Perfect, I will transfer that today." },
      { speaker: "Agent", text: "Lovely, I will email you the confirmation and our terms and conditions." },
      { speaker: "Customer", text: "Thank you so much for your help." },
    ],
  },
  {
    id: '35000000-0000-0000-0000-000000000006',
    title: 'A Talk Introducing the Local Repair Café Scheme',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Host": "an articulate female host in her 30s-40s with a neutral British accent, friendly informative tone",
    },
    audioUrl: null,
    sectionNumber: 2,
    transcript: `HOST: Hello everyone, and thanks for coming along today. I want to tell you a bit about our new Repair Café scheme, which we are launching here at the Millfield Community Centre.

So what actually is a Repair Café? It is a free monthly event where volunteer menders help you fix broken items instead of throwing them away — everything from toasters and lamps to torn clothing and wobbly furniture.

We will be running four different repair stations. The electrical station handles small appliances like kettles, radios, and lamps. The textiles station deals with clothing repairs, replacing zips, and mending tears. The furniture station is for wobbly chairs, sticking drawers, and similar wooden repairs. And finally, the bike station, which is outdoors under the gazebo, covers punctures, brakes, and gears.

Sessions run on the first Saturday of every month, from ten a.m. until one p.m. There is no need to book — just turn up with your item and one of our volunteers will have a look.

Now, a few things to know before you come. First, this is not a professional repair service — our volunteers do their best, but we cannot guarantee every item will be fixable, and safety-critical items like gas appliances are not something we can touch. Second, while the repairs themselves are free, we do ask for a small donation, whatever you can afford, which goes toward buying spare parts and tools.

If your item cannot be fixed on the day, some of our volunteers are happy to take it away and have another go, returning it to you the following month.

We are also always looking for volunteer menders, particularly anyone with experience in electronics or sewing. If that is you, please speak to Marcus, who is coordinating the volunteer side of things — he is over by the entrance in the blue jumper.

One final note — parking near the centre is limited on Saturdays because of the farmers' market next door, so we would really encourage you to walk, cycle, or take the number eleven bus, which stops right outside.

Thanks again for coming, and I hope to see plenty of broken toasters and torn trousers next month!`,
    turns: [
      { speaker: "Host", text: "Hello everyone, and thanks for coming along today. I want to tell you a bit about our new Repair Café scheme, which we are launching here at the Millfield Community Centre." },
      { speaker: "Host", text: "So what actually is a Repair Café? It is a free monthly event where volunteer menders help you fix broken items instead of throwing them away — everything from toasters and lamps to torn clothing and wobbly furniture." },
      { speaker: "Host", text: "We will be running four different repair stations. The electrical station handles small appliances like kettles, radios, and lamps. The textiles station deals with clothing repairs, replacing zips, and mending tears. The furniture station is for wobbly chairs, sticking drawers, and similar wooden repairs. And finally, the bike station, which is outdoors under the gazebo, covers punctures, brakes, and gears." },
      { speaker: "Host", text: "Sessions run on the first Saturday of every month, from ten a.m. until one p.m. There is no need to book — just turn up with your item and one of our volunteers will have a look." },
      { speaker: "Host", text: "Now, a few things to know before you come. First, this is not a professional repair service — our volunteers do their best, but we cannot guarantee every item will be fixable, and safety-critical items like gas appliances are not something we can touch. Second, while the repairs themselves are free, we do ask for a small donation, whatever you can afford, which goes toward buying spare parts and tools." },
      { speaker: "Host", text: "If your item cannot be fixed on the day, some of our volunteers are happy to take it away and have another go, returning it to you the following month." },
      { speaker: "Host", text: "We are also always looking for volunteer menders, particularly anyone with experience in electronics or sewing. If that is you, please speak to Marcus, who is coordinating the volunteer side of things — he is over by the entrance in the blue jumper." },
      { speaker: "Host", text: "One final note — parking near the centre is limited on Saturdays because of the farmers' market next door, so we would really encourage you to walk, cycle, or take the number eleven bus, which stops right outside." },
      { speaker: "Host", text: "Thanks again for coming, and I hope to see plenty of broken toasters and torn trousers next month!" },
    ],
  },
  {
    id: '35000000-0000-0000-0000-000000000007',
    title: 'Discussing a Group Project on Consumer Behaviour Surveys',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Dr Okafor": "an experienced male academic in his 40s-50s with a neutral British accent, calm, authoritative, and constructive tone",
      "Leo": "a male university student in his early 20s with a neutral British accent, casual natural conversational tone",
      "Hannah": "a female university student in her early 20s with a neutral British accent, casual natural conversational tone",
    },
    audioUrl: null,
    sectionNumber: 3,
    transcript: `DR OKAFOR: Leo, Hannah — good to see you both. How is the consumer behaviour survey project shaping up?
LEO: Pretty well, I think. We have decided to focus on how packaging colour influences perceived product quality.
HANNAH: We are planning to survey shoppers about three product categories — coffee, cereal, and shampoo.
DR OKAFOR: Interesting choice. How many responses are you aiming for?
LEO: We are hoping for at least one hundred and fifty responses, ideally split evenly across the three categories.
DR OKAFOR: That should give you a decent sample. Where are you planning to collect responses?
HANNAH: We will be doing it in two ways — an online survey shared through social media, and in person outside the Union shop on campus.
DR OKAFOR: Good, having both should help avoid sampling bias. What is your incentive for people to take part?
LEO: We are offering entry into a prize draw for a twenty-pound gift voucher.
DR OKAFOR: Sensible. Now, who is responsible for which part of the analysis?
HANNAH: I am handling the statistical analysis, since I did the stats module last term, and Leo is writing up the literature review.
LEO: And we are both contributing to the discussion and conclusion together.
DR OKAFOR: Have you thought about which statistical test you will use to compare the three categories?
HANNAH: We are planning to use a one-way ANOVA, since we are comparing three independent groups.
DR OKAFOR: Good choice. Just make sure your data meets the assumptions before running it — check it is normally distributed first.
LEO: We will. One thing we wanted to ask — do we need ethical approval, since we are surveying members of the public?
DR OKAFOR: Yes, you will need standard ethical approval, but because it is an anonymous survey with no sensitive questions, it should be a quick, low-risk application.
HANNAH: That is a relief. When should we submit that?
DR OKAFOR: Submit the ethics form by the eleventh of March, so it can be approved before you start collecting data.
LEO: And the final report deadline?
DR OKAFOR: That is the twenty-ninth of April, in your usual Thursday afternoon seminar.
HANNAH: Should we send a draft beforehand?
DR OKAFOR: Yes, please send me a draft by the fifteenth of April, as a Word document this time, actually, since I want to leave comments directly in the file.
LEO: Understood, thank you, that is really helpful.`,
    turns: [
      { speaker: "Dr Okafor", text: "Leo, Hannah — good to see you both. How is the consumer behaviour survey project shaping up?" },
      { speaker: "Leo", text: "Pretty well, I think. We have decided to focus on how packaging colour influences perceived product quality." },
      { speaker: "Hannah", text: "We are planning to survey shoppers about three product categories — coffee, cereal, and shampoo." },
      { speaker: "Dr Okafor", text: "Interesting choice. How many responses are you aiming for?" },
      { speaker: "Leo", text: "We are hoping for at least one hundred and fifty responses, ideally split evenly across the three categories." },
      { speaker: "Dr Okafor", text: "That should give you a decent sample. Where are you planning to collect responses?" },
      { speaker: "Hannah", text: "We will be doing it in two ways — an online survey shared through social media, and in person outside the Union shop on campus." },
      { speaker: "Dr Okafor", text: "Good, having both should help avoid sampling bias. What is your incentive for people to take part?" },
      { speaker: "Leo", text: "We are offering entry into a prize draw for a twenty-pound gift voucher." },
      { speaker: "Dr Okafor", text: "Sensible. Now, who is responsible for which part of the analysis?" },
      { speaker: "Hannah", text: "I am handling the statistical analysis, since I did the stats module last term, and Leo is writing up the literature review." },
      { speaker: "Leo", text: "And we are both contributing to the discussion and conclusion together." },
      { speaker: "Dr Okafor", text: "Have you thought about which statistical test you will use to compare the three categories?" },
      { speaker: "Hannah", text: "We are planning to use a one-way ANOVA, since we are comparing three independent groups." },
      { speaker: "Dr Okafor", text: "Good choice. Just make sure your data meets the assumptions before running it — check it is normally distributed first." },
      { speaker: "Leo", text: "We will. One thing we wanted to ask — do we need ethical approval, since we are surveying members of the public?" },
      { speaker: "Dr Okafor", text: "Yes, you will need standard ethical approval, but because it is an anonymous survey with no sensitive questions, it should be a quick, low-risk application." },
      { speaker: "Hannah", text: "That is a relief. When should we submit that?" },
      { speaker: "Dr Okafor", text: "Submit the ethics form by the eleventh of March, so it can be approved before you start collecting data." },
      { speaker: "Leo", text: "And the final report deadline?" },
      { speaker: "Dr Okafor", text: "That is the twenty-ninth of April, in your usual Thursday afternoon seminar." },
      { speaker: "Hannah", text: "Should we send a draft beforehand?" },
      { speaker: "Dr Okafor", text: "Yes, please send me a draft by the fifteenth of April, as a Word document this time, actually, since I want to leave comments directly in the file." },
      { speaker: "Leo", text: "Understood, thank you, that is really helpful." },
    ],
  },
  {
    id: '35000000-0000-0000-0000-000000000008',
    title: 'The Engineering of Suspension Bridges',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Lecturer": "an articulate female university lecturer in her 40s-50s with a neutral British accent, formal academic register, measured and authoritative but engaging delivery",
    },
    audioUrl: null,
    sectionNumber: 4,
    transcript: `LECTURER: Good morning. Today's lecture turns to a piece of engineering many of us cross every day without thinking about how it actually works: the suspension bridge.

At its core, a suspension bridge works by transferring the weight of the deck — the roadway itself — up through vertical cables to two large main cables, which run over tall towers and are anchored firmly into the ground at each end. This design allows suspension bridges to span far greater distances than traditional beam or arch bridges, without needing supports in the middle of the gap being crossed.

Let us look at the key components in more detail. The towers bear most of the compressive load, pushing straight down into the foundations beneath them. The main cables, by contrast, are under enormous tension, and are typically made from thousands of individual steel wires bundled together — a single main cable on a large bridge might contain over twenty thousand individual wires.

One of the most famous early examples is the Clifton Suspension Bridge in England, designed by the engineer Isambard Kingdom Brunel, though it was not actually completed until after his death, in eighteen sixty-four.

Now, suspension bridges face a particular engineering challenge that shorter bridges do not: they must be designed to flex. Unlike a rigid structure, a suspension bridge is expected to sway slightly in strong wind and even shift under heavy traffic loads — engineers describe this flexibility as a feature, not a fault, because a completely rigid structure of that length would be far more likely to crack under stress.

However, this flexibility caused one of the most famous engineering failures in history: the collapse of the Tacoma Narrows Bridge in the United States, in nineteen forty. In that case, wind caused the bridge deck to twist violently in a phenomenon known as aeroelastic flutter, ultimately tearing the structure apart. This disaster fundamentally changed how engineers approach bridge design, leading to much more rigorous wind-tunnel testing for every major suspension bridge built since.

Today, modern suspension bridges incorporate advanced technology to monitor their condition continuously. Many now have sensors embedded directly into the cables and deck, which measure stress, vibration, and temperature in real time, transmitting the data to engineers who can spot early signs of fatigue long before they become visible to the naked eye.

Looking ahead, researchers are exploring the use of carbon fibre composite cables as a lighter, stronger alternative to traditional steel, which could allow future suspension bridges to span even greater distances than is currently possible.`,
    turns: [
      { speaker: "Lecturer", text: "Good morning. Today's lecture turns to a piece of engineering many of us cross every day without thinking about how it actually works: the suspension bridge." },
      { speaker: "Lecturer", text: "At its core, a suspension bridge works by transferring the weight of the deck — the roadway itself — up through vertical cables to two large main cables, which run over tall towers and are anchored firmly into the ground at each end. This design allows suspension bridges to span far greater distances than traditional beam or arch bridges, without needing supports in the middle of the gap being crossed." },
      { speaker: "Lecturer", text: "Let us look at the key components in more detail. The towers bear most of the compressive load, pushing straight down into the foundations beneath them. The main cables, by contrast, are under enormous tension, and are typically made from thousands of individual steel wires bundled together — a single main cable on a large bridge might contain over twenty thousand individual wires." },
      { speaker: "Lecturer", text: "One of the most famous early examples is the Clifton Suspension Bridge in England, designed by the engineer Isambard Kingdom Brunel, though it was not actually completed until after his death, in eighteen sixty-four." },
      { speaker: "Lecturer", text: "Now, suspension bridges face a particular engineering challenge that shorter bridges do not: they must be designed to flex. Unlike a rigid structure, a suspension bridge is expected to sway slightly in strong wind and even shift under heavy traffic loads — engineers describe this flexibility as a feature, not a fault, because a completely rigid structure of that length would be far more likely to crack under stress." },
      { speaker: "Lecturer", text: "However, this flexibility caused one of the most famous engineering failures in history: the collapse of the Tacoma Narrows Bridge in the United States, in nineteen forty. In that case, wind caused the bridge deck to twist violently in a phenomenon known as aeroelastic flutter, ultimately tearing the structure apart. This disaster fundamentally changed how engineers approach bridge design, leading to much more rigorous wind-tunnel testing for every major suspension bridge built since." },
      { speaker: "Lecturer", text: "Today, modern suspension bridges incorporate advanced technology to monitor their condition continuously. Many now have sensors embedded directly into the cables and deck, which measure stress, vibration, and temperature in real time, transmitting the data to engineers who can spot early signs of fatigue long before they become visible to the naked eye." },
      { speaker: "Lecturer", text: "Looking ahead, researchers are exploring the use of carbon fibre composite cables as a lighter, stronger alternative to traditional steel, which could allow future suspension bridges to span even greater distances than is currently possible." },
    ],
  },

  // ---------- MOCK 10 ----------
  {
    id: '35000000-0000-0000-0000-000000000009',
    title: 'Arranging a Home Broadband Installation',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Agent": "a professional female booking agent in her 30s with a neutral British accent, efficient and courteous tone — introduces themselves as Sophie in the call",
      "Customer": "a polite adult male customer in his 30s with a neutral British accent, natural relaxed conversational tone",
    },
    audioUrl: null,
    sectionNumber: 1,
    transcript: `AGENT: Good afternoon, NetLink Broadband, this is Sophie speaking, how can I help?
CUSTOMER: Hi, I would like to set up a new broadband connection at my flat, please.
AGENT: Of course, I can help with that. Can I start with your postcode?
CUSTOMER: Yes, it is BR3, then 7-L-N.
AGENT: Great, let me check availability... yes, fibre broadband is available at your address. We have two packages: Standard Fibre at thirty-five megabits per second, or Superfast Fibre at seventy megabits.
CUSTOMER: I work from home and do a lot of video calls, so probably the superfast one.
AGENT: Good choice. Superfast Fibre is thirty-two pounds a month on an eighteen-month contract, or thirty-eight pounds a month with no contract, if you prefer flexibility.
CUSTOMER: I will take the eighteen-month contract, that is fine.
AGENT: Great. There is also a one-off setup fee of forty-five pounds, although that is often waived — let me check... yes, it looks like we are currently running a promotion, so that fee will be waived for you.
CUSTOMER: Excellent, thank you. When could someone come to install it?
AGENT: Our next available slot is Thursday the eleventh, between eight a.m. and midday, or, if that does not suit, the following Tuesday, all day.
CUSTOMER: Thursday morning works for me.
AGENT: Perfect, I will book that in. Will you need a new router, or do you already have a compatible one?
CUSTOMER: I will need a new one, please.
AGENT: No problem, that is included free with your package. Can I also take a contact number in case the engineer needs to reach you on the day?
CUSTOMER: Sure, it is oh-seven-seven-one-four, double-two-six, three-nine-zero.
AGENT: Let me read that back — oh-seven-seven-one-four, two-two-six, three-nine-zero.
CUSTOMER: That is correct.
AGENT: And finally, can I take your surname for the account?
CUSTOMER: It is Delaney — D-E-L-A-N-E-Y.
AGENT: Got it, Ms Delaney. I will email your confirmation and contract details shortly.
CUSTOMER: Thank you so much for your help.`,
    turns: [
      { speaker: "Agent", text: "Good afternoon, NetLink Broadband, this is Sophie speaking, how can I help?" },
      { speaker: "Customer", text: "Hi, I would like to set up a new broadband connection at my flat, please." },
      { speaker: "Agent", text: "Of course, I can help with that. Can I start with your postcode?" },
      { speaker: "Customer", text: "Yes, it is BR3, then 7-L-N." },
      { speaker: "Agent", text: "Great, let me check availability... yes, fibre broadband is available at your address. We have two packages: Standard Fibre at thirty-five megabits per second, or Superfast Fibre at seventy megabits." },
      { speaker: "Customer", text: "I work from home and do a lot of video calls, so probably the superfast one." },
      { speaker: "Agent", text: "Good choice. Superfast Fibre is thirty-two pounds a month on an eighteen-month contract, or thirty-eight pounds a month with no contract, if you prefer flexibility." },
      { speaker: "Customer", text: "I will take the eighteen-month contract, that is fine." },
      { speaker: "Agent", text: "Great. There is also a one-off setup fee of forty-five pounds, although that is often waived — let me check... yes, it looks like we are currently running a promotion, so that fee will be waived for you." },
      { speaker: "Customer", text: "Excellent, thank you. When could someone come to install it?" },
      { speaker: "Agent", text: "Our next available slot is Thursday the eleventh, between eight a.m. and midday, or, if that does not suit, the following Tuesday, all day." },
      { speaker: "Customer", text: "Thursday morning works for me." },
      { speaker: "Agent", text: "Perfect, I will book that in. Will you need a new router, or do you already have a compatible one?" },
      { speaker: "Customer", text: "I will need a new one, please." },
      { speaker: "Agent", text: "No problem, that is included free with your package. Can I also take a contact number in case the engineer needs to reach you on the day?" },
      { speaker: "Customer", text: "Sure, it is oh-seven-seven-one-four, double-two-six, three-nine-zero." },
      { speaker: "Agent", text: "Let me read that back — oh-seven-seven-one-four, two-two-six, three-nine-zero." },
      { speaker: "Customer", text: "That is correct." },
      { speaker: "Agent", text: "And finally, can I take your surname for the account?" },
      { speaker: "Customer", text: "It is Delaney — D-E-L-A-N-E-Y." },
      { speaker: "Agent", text: "Got it, Ms Delaney. I will email your confirmation and contract details shortly." },
      { speaker: "Customer", text: "Thank you so much for your help." },
    ],
  },
  {
    id: '35000000-0000-0000-0000-000000000010',
    title: 'A Local Radio Announcement About the City Winter Festival',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Host": "an articulate male host in his 30s-40s with a neutral British accent, friendly informative tone",
    },
    audioUrl: null,
    sectionNumber: 2,
    transcript: `HOST: Good afternoon, and welcome back to Riverside FM. This week I want to give you all the details about the Millbrook Winter Festival, which returns to the town square from the fifth to the eighth of December.

The festival opens each day at eleven in the morning, and runs until nine in the evening, except on the final day, Sunday, when everything closes earlier, at six p.m., to allow time for the stalls to pack down.

There will be four main areas this year. The market area, right in the centre of the square, will have around forty stalls selling crafts, food, and gifts. Next to that, the ice rink returns for its third year, and this year it has been made twenty percent bigger to reduce queuing. Over toward the church, there will be a food and drink village, with a heated marquee for those cold evenings. And finally, down by the fountain, there is a children's area, with a small funfair and a grotto.

Entry to the festival itself is free, though the ice rink does have a charge — six pounds for adults, and four pounds for under-sixteens, which includes skate hire.

If you are planning to drive, be aware that the main car park on Church Street will be closed for the full four days, so visitors are encouraged to use the multi-storey on Silver Street instead, or take advantage of the free shuttle bus running every fifteen minutes from the train station.

This year there is also a special event on the opening evening — a lantern parade starting at six p.m. from the library, ending at the main stage in the square, where the mayor will officially switch on the festival lights.

If you would like to book an ice rink slot in advance, which is recommended, especially for weekend evenings, you can do that through the council website, or by calling the box office directly on three-three-one-eight, double-nine-two.

That is all the details for this year's Millbrook Winter Festival — I will be back after the break with the weather.`,
    turns: [
      { speaker: "Host", text: "Good afternoon, and welcome back to Riverside FM. This week I want to give you all the details about the Millbrook Winter Festival, which returns to the town square from the fifth to the eighth of December." },
      { speaker: "Host", text: "The festival opens each day at eleven in the morning, and runs until nine in the evening, except on the final day, Sunday, when everything closes earlier, at six p.m., to allow time for the stalls to pack down." },
      { speaker: "Host", text: "There will be four main areas this year. The market area, right in the centre of the square, will have around forty stalls selling crafts, food, and gifts. Next to that, the ice rink returns for its third year, and this year it has been made twenty percent bigger to reduce queuing. Over toward the church, there will be a food and drink village, with a heated marquee for those cold evenings. And finally, down by the fountain, there is a children's area, with a small funfair and a grotto." },
      { speaker: "Host", text: "Entry to the festival itself is free, though the ice rink does have a charge — six pounds for adults, and four pounds for under-sixteens, which includes skate hire." },
      { speaker: "Host", text: "If you are planning to drive, be aware that the main car park on Church Street will be closed for the full four days, so visitors are encouraged to use the multi-storey on Silver Street instead, or take advantage of the free shuttle bus running every fifteen minutes from the train station." },
      { speaker: "Host", text: "This year there is also a special event on the opening evening — a lantern parade starting at six p.m. from the library, ending at the main stage in the square, where the mayor will officially switch on the festival lights." },
      { speaker: "Host", text: "If you would like to book an ice rink slot in advance, which is recommended, especially for weekend evenings, you can do that through the council website, or by calling the box office directly on three-three-one-eight, double-nine-two." },
      { speaker: "Host", text: "That is all the details for this year's Millbrook Winter Festival — I will be back after the break with the weather." },
    ],
  },
  {
    id: '35000000-0000-0000-0000-000000000011',
    title: 'Planning a Class Field Trip to a Wetland Nature Reserve',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Mr Harding": "an experienced male academic in his 40s-50s with a neutral British accent, calm, authoritative, and constructive tone",
      "Amelia": "a female university student in her early 20s with a neutral British accent, casual natural conversational tone",
      "Toby": "a male university student in his early 20s with a neutral British accent, casual natural conversational tone",
    },
    audioUrl: null,
    sectionNumber: 3,
    transcript: `MR HARDING: Right, Amelia, Toby — thanks for staying behind to help plan the field trip to Fenwick Wetland Reserve.
AMELIA: No problem. So we are thinking the whole class goes on the ninth of May, weather permitting.
TOBY: Yes, and we have checked, the reserve can host up to thirty-five visitors at once, which covers our class of twenty-eight easily.
MR HARDING: Good, that gives us plenty of room. What activities have you planned once we arrive?
AMELIA: We are splitting into two sessions — first, a guided walk around the reed beds with a ranger, focusing on bird identification.
TOBY: And after lunch, a water-sampling activity at the reserve's small pond, where we will test pH and oxygen levels.
MR HARDING: Sounds like a solid structure. How long is the guided walk?
AMELIA: The ranger said ninety minutes, so we should be back for lunch by half past twelve.
MR HARDING: Good. Now, what about transport — coach or minibus?
TOBY: We got a quote for a coach, which is one hundred and eighty pounds for the return trip, or two minibuses, which would be two hundred and ten pounds total.
MR HARDING: Let us go with the coach then, cheaper and simpler with one driver. Have you sorted risk assessment forms?
AMELIA: Yes, I have drafted one, mainly around the pond edges and uneven ground near the reed beds.
MR HARDING: Good, make sure that is approved before the deposit is paid. What is the cost per student?
TOBY: Entry plus the ranger session works out at seven pounds fifty per student.
MR HARDING: And when do we need consent forms back by?
AMELIA: We were thinking the twenty-second of April, so there is time to chase anyone who forgets.
MR HARDING: That works. One last thing — do we need wellies, given it is a wetland?
TOBY: The ranger recommended wellies or waterproof boots, especially for the pond activity, since the ground can get quite muddy.
MR HARDING: I will add that to the letter home. Thanks both, this has been really helpful.`,
    turns: [
      { speaker: "Mr Harding", text: "Right, Amelia, Toby — thanks for staying behind to help plan the field trip to Fenwick Wetland Reserve." },
      { speaker: "Amelia", text: "No problem. So we are thinking the whole class goes on the ninth of May, weather permitting." },
      { speaker: "Toby", text: "Yes, and we have checked, the reserve can host up to thirty-five visitors at once, which covers our class of twenty-eight easily." },
      { speaker: "Mr Harding", text: "Good, that gives us plenty of room. What activities have you planned once we arrive?" },
      { speaker: "Amelia", text: "We are splitting into two sessions — first, a guided walk around the reed beds with a ranger, focusing on bird identification." },
      { speaker: "Toby", text: "And after lunch, a water-sampling activity at the reserve's small pond, where we will test pH and oxygen levels." },
      { speaker: "Mr Harding", text: "Sounds like a solid structure. How long is the guided walk?" },
      { speaker: "Amelia", text: "The ranger said ninety minutes, so we should be back for lunch by half past twelve." },
      { speaker: "Mr Harding", text: "Good. Now, what about transport — coach or minibus?" },
      { speaker: "Toby", text: "We got a quote for a coach, which is one hundred and eighty pounds for the return trip, or two minibuses, which would be two hundred and ten pounds total." },
      { speaker: "Mr Harding", text: "Let us go with the coach then, cheaper and simpler with one driver. Have you sorted risk assessment forms?" },
      { speaker: "Amelia", text: "Yes, I have drafted one, mainly around the pond edges and uneven ground near the reed beds." },
      { speaker: "Mr Harding", text: "Good, make sure that is approved before the deposit is paid. What is the cost per student?" },
      { speaker: "Toby", text: "Entry plus the ranger session works out at seven pounds fifty per student." },
      { speaker: "Mr Harding", text: "And when do we need consent forms back by?" },
      { speaker: "Amelia", text: "We were thinking the twenty-second of April, so there is time to chase anyone who forgets." },
      { speaker: "Mr Harding", text: "That works. One last thing — do we need wellies, given it is a wetland?" },
      { speaker: "Toby", text: "The ranger recommended wellies or waterproof boots, especially for the pond activity, since the ground can get quite muddy." },
      { speaker: "Mr Harding", text: "I will add that to the letter home. Thanks both, this has been really helpful." },
    ],
  },
  {
    id: '35000000-0000-0000-0000-000000000012',
    title: 'The Science of Glacier Formation and Retreat',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Lecturer": "an articulate male university lecturer in his 40s-50s with a neutral British accent, formal academic register, measured and authoritative but engaging delivery",
    },
    audioUrl: null,
    sectionNumber: 4,
    transcript: `LECTURER: Good morning, everyone. Today I want to look at glaciers — how they form, how they move, and why so many of them are retreating so rapidly around the world.

Let us start with formation. Glaciers begin as ordinary snow, which accumulates faster than it melts, year after year, in regions where temperatures remain cold for most of the year. As new snow falls on top, the weight compresses the layers beneath, gradually squeezing out air pockets and transforming loose snow first into a granular substance called firn, and eventually, after enough compression, into dense glacial ice, a process that can take anywhere from a few decades to several centuries depending on the climate.

Once formed, glaciers do not just sit still — they move, flowing slowly downhill under their own weight, rather like an extremely slow-moving river. This movement happens through two main mechanisms: internal deformation, where the ice crystals themselves slowly slide past one another, and basal sliding, where the entire glacier slides over a thin layer of meltwater at its base. Basal sliding tends to happen faster, especially in warmer glaciers where meltwater is more plentiful.

Now, glaciers are often described as having two zones. The upper zone, called the accumulation zone, is where snowfall exceeds melting, and the glacier gains mass. The lower zone, the ablation zone, is where melting exceeds snowfall, and the glacier loses mass. The boundary between these two zones is called the equilibrium line, and its position shifts from year to year depending on the weather.

In recent decades, scientists have observed that the equilibrium line on many glaciers has been shifting steadily upslope, meaning the ablation zone is expanding relative to the accumulation zone. This is one of the clearest signs of overall glacier retreat, and it is happening at an alarming pace in many parts of the world — the European Alps, for example, have lost around sixty percent of their glacial ice volume since eighteen fifty.

Why does this matter beyond the mountains themselves? For one, many major rivers are fed substantially by glacial meltwater, particularly during the dry summer months, so shrinking glaciers threaten water supplies for millions of people downstream. There is also the issue of sea level rise — while glaciers hold far less water than the polar ice sheets, their combined melt currently contributes a measurable percentage of annual global sea level rise, and that contribution is expected to grow.

To track these changes, researchers increasingly rely on satellite gravimetry, a technique that measures tiny changes in Earth's gravitational field caused by shifting ice mass, allowing scientists to estimate ice loss across an entire glacier or even an entire mountain range without needing to physically visit every site.

Looking ahead, most climate models predict that, without significant emissions reductions, a large proportion of the world's smaller glaciers could disappear entirely within this century, fundamentally reshaping water availability in many mountainous regions.`,
    turns: [
      { speaker: "Lecturer", text: "Good morning, everyone. Today I want to look at glaciers — how they form, how they move, and why so many of them are retreating so rapidly around the world." },
      { speaker: "Lecturer", text: "Let us start with formation. Glaciers begin as ordinary snow, which accumulates faster than it melts, year after year, in regions where temperatures remain cold for most of the year. As new snow falls on top, the weight compresses the layers beneath, gradually squeezing out air pockets and transforming loose snow first into a granular substance called firn, and eventually, after enough compression, into dense glacial ice, a process that can take anywhere from a few decades to several centuries depending on the climate." },
      { speaker: "Lecturer", text: "Once formed, glaciers do not just sit still — they move, flowing slowly downhill under their own weight, rather like an extremely slow-moving river. This movement happens through two main mechanisms: internal deformation, where the ice crystals themselves slowly slide past one another, and basal sliding, where the entire glacier slides over a thin layer of meltwater at its base. Basal sliding tends to happen faster, especially in warmer glaciers where meltwater is more plentiful." },
      { speaker: "Lecturer", text: "Now, glaciers are often described as having two zones. The upper zone, called the accumulation zone, is where snowfall exceeds melting, and the glacier gains mass. The lower zone, the ablation zone, is where melting exceeds snowfall, and the glacier loses mass. The boundary between these two zones is called the equilibrium line, and its position shifts from year to year depending on the weather." },
      { speaker: "Lecturer", text: "In recent decades, scientists have observed that the equilibrium line on many glaciers has been shifting steadily upslope, meaning the ablation zone is expanding relative to the accumulation zone. This is one of the clearest signs of overall glacier retreat, and it is happening at an alarming pace in many parts of the world — the European Alps, for example, have lost around sixty percent of their glacial ice volume since eighteen fifty." },
      { speaker: "Lecturer", text: "Why does this matter beyond the mountains themselves? For one, many major rivers are fed substantially by glacial meltwater, particularly during the dry summer months, so shrinking glaciers threaten water supplies for millions of people downstream. There is also the issue of sea level rise — while glaciers hold far less water than the polar ice sheets, their combined melt currently contributes a measurable percentage of annual global sea level rise, and that contribution is expected to grow." },
      { speaker: "Lecturer", text: "To track these changes, researchers increasingly rely on satellite gravimetry, a technique that measures tiny changes in Earth's gravitational field caused by shifting ice mass, allowing scientists to estimate ice loss across an entire glacier or even an entire mountain range without needing to physically visit every site." },
      { speaker: "Lecturer", text: "Looking ahead, most climate models predict that, without significant emissions reductions, a large proportion of the world's smaller glaciers could disappear entirely within this century, fundamentally reshaping water availability in many mountainous regions." },
    ],
  },
];

export const listeningQuestionsSet5: Question[] = [
  // ===================== MOCK 8 · SECTION 1 =====================
  { id: 'lq-m8-s1-1', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: 'Car type chosen: ______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: 'estate', explanation: 'The customer says "we are a family of four with a lot of luggage, so probably the estate."', strategyNote: 'Predict a vehicle-type word (compact/saloon/estate) before listening.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 1, isPremium: false },
  { id: 'lq-m8-s1-2', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Daily rate for the estate: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '48', explanation: 'The agent self-corrects: "the estate is actually forty-eight pounds a day; forty-two is the saloon."', strategyNote: 'Listen for self-corrections — the second figure given is the one that applies to the correct vehicle.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m8-s1-3', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Standard insurance excess: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '300', explanation: 'The agent says "there is an excess of three hundred pounds unless you add reduced-excess cover."', strategyNote: 'The word "excess" is the key cue for an insurance-related figure.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 3, isPremium: false },
  { id: 'lq-m8-s1-4', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Extra daily cost for reduced-excess cover: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '9', explanation: 'Reduced-excess cover costs "an extra nine pounds a day."', strategyNote: 'Two prices appear close together (300 and 9) — check the units (total vs per day) carefully.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 4, isPremium: false },
  { id: 'lq-m8-s1-5', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.0,
    prompt: "Customer's surname: ______", passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: 'Bennett', explanation: 'The customer spells her surname: "It is Bennett — B-E-N-N-E-T-T."', strategyNote: 'When a name is spelled letter by letter, write down each letter exactly as heard.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 5, isPremium: false },
  { id: 'lq-m8-s1-6', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Near which town is the customer staying?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: 'Thornbury', explanation: 'The customer says "we are staying at a cottage out near Thornbury."', strategyNote: 'Place names given after "near" or "at" are common short-answer targets.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 6, isPremium: false },
  { id: 'lq-m8-s1-7', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Delivery fee: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '15', explanation: 'The agent says "we can deliver for a flat fee of fifteen pounds."', strategyNote: 'The word "flat fee" signals a fixed price regardless of distance, within the stated limit.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 7, isPremium: false },
  { id: 'lq-m8-s1-8', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Delivery is available within ______ miles of the branch.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: ['20', 'twenty'], explanation: 'The agent says delivery is possible "as long as it is within twenty miles of the branch."', strategyNote: 'Distinguish the distance limit (twenty miles) from the actual distance mentioned later (twelve miles).',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 8, isPremium: false },
  { id: 'lq-m8-s1-9', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Requested delivery time: ______ a.m.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '9', explanation: 'The customer asks for delivery "ideally by nine in the morning."', strategyNote: 'Listen for "by" before a time — it signals a deadline rather than an exact arrival moment.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 9, isPremium: false },
  { id: 'lq-m8-s1-10', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'What extra item does the customer request for the car?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000001',
    options: ['A GPS unit', 'A child seat', 'A roof rack', 'Winter tyres'],
    correctAnswer: 'A child seat', explanation: 'The agent offers a child seat "for six pounds for the whole rental" and the customer accepts.', strategyNote: 'The final item discussed in a call is often tested — do not stop listening before the call ends.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 45, orderIndex: 10, isPremium: false },

  // ===================== MOCK 8 · SECTION 2 =====================
  { id: 'lq-m8-s2-1', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: 'On which day of the week is the centre closed?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'Wednesday', explanation: 'The manager says "we are open every day except Wednesdays."', strategyNote: '"Except" often introduces the one exception being tested.',
    tags: ['short_answer'], estimatedTimeSeconds: 35, orderIndex: 1, isPremium: false },
  { id: 'lq-m8-s2-2', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.0,
    prompt: 'Summer closing time: ______ p.m.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: '6', explanation: 'The site is open "from eight a.m. until six p.m. in summer."', strategyNote: 'Two closing times are given (summer and winter) — check which season the question asks about.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 2, isPremium: false },
  { id: 'lq-m8-s2-3', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'In which month do winter hours begin?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'November', explanation: 'The manager mentions closing at four p.m. "once we move to winter hours in November."', strategyNote: 'Month names often appear at the end of a sentence about seasonal changes.',
    tags: ['short_answer'], estimatedTimeSeconds: 35, orderIndex: 3, isPremium: false },
  { id: 'lq-m8-s2-4', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Household electricals go to the covered bay next to the ______.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'office', explanation: 'Electricals go "to the far end, in the covered bay next to the office."', strategyNote: 'Location descriptions often end with a landmark word like "office" or "entrance" — that word is often the answer.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m8-s2-5', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Proceeds from the reuse shop go to the ______.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'local hospice', explanation: 'The manager says the team "will resell them cheaply, with all proceeds going to the local hospice."', strategyNote: 'Charity or beneficiary names often follow the phrase "proceeds going to."',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 5, isPremium: false },
  { id: 'lq-m8-s2-6', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'What type of waste is NOT accepted at the centre?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000002',
    options: ['Garden waste', 'Glass and paper', 'Rubble and building waste', 'Household electricals'],
    correctAnswer: 'Rubble and building waste', explanation: 'The manager states "rubble and building waste, such as bricks or tiles, are not accepted here at all."', strategyNote: 'Listen for a clear negative statement ("are not accepted") to identify the excluded option.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 6, isPremium: false },
  { id: 'lq-m8-s2-7', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Maximum vehicle visits per month: ______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: ['6', 'six'], explanation: 'Vehicles are "limited to a maximum of six visits per month."', strategyNote: 'The word "maximum" signals an exact number limit is being tested.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 7, isPremium: false },
  { id: 'lq-m8-s2-8', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 5.0,
    prompt: 'What colour vests do the site assistants wear?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'green', explanation: 'Site assistants "wear bright green vests."', strategyNote: 'Colour words are simple, high-frequency short-answer targets — listen for the adjective directly before the noun.',
    tags: ['short_answer'], estimatedTimeSeconds: 35, orderIndex: 8, isPremium: false },
  { id: 'lq-m8-s2-9', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Parking is free for the first ______ minutes.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: ['30', 'thirty'], explanation: 'The manager says "parking is free for the first thirty minutes."', strategyNote: 'When a charge follows a free period, focus on the number attached to "free for."',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 9, isPremium: false },
  { id: 'lq-m8-s2-10', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Electronics amnesty day date: the ______ of November', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: ['14th', 'fourteenth'], explanation: 'The manager mentions "our upcoming electronics amnesty day on the fourteenth of November."', strategyNote: 'Special event dates are often mentioned once, near the very end of a talk — stay alert until the close.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 10, isPremium: false },

  // ===================== MOCK 8 · SECTION 3 =====================
  { id: 'lq-m8-s3-1', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Ryan', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000003',
    options: ['Introduction and literature review', 'Methodology and results', 'Discussion only'],
    correctAnswer: 'Introduction and literature review', explanation: 'Ryan says "I am covering the introduction and literature review."', strategyNote: 'Each speaker usually states their own role directly — match the name to the task in the same sentence.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false },
  { id: 'lq-m8-s3-2', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Zoe', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000003',
    options: ['Introduction and literature review', 'Methodology and results', 'Discussion only'],
    correctAnswer: 'Methodology and results', explanation: 'Ryan confirms "Zoe is doing the methodology and results."', strategyNote: 'Both parts of a shared task (like the discussion section) belong to neither individual name alone — read the options carefully.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m8-s3-3', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Total number of participants planned: ______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['40', 'forty'], explanation: 'Ryan says they are "hoping for twenty in each group, so forty in total."', strategyNote: 'When a calculation is spoken aloud, the final stated total is the answer, not the per-group figure.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 3, isPremium: false },
  { id: 'lq-m8-s3-4', skill: 'listening', questionType: 'note_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Participants see a list of ______ words during the recall test.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['30', 'thirty'], explanation: 'Zoe explains "participants see a list of thirty words for two minutes."', strategyNote: 'Two numbers appear in the same sentence (30 words, 2 minutes) — check which unit the question needs.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m8-s3-5', skill: 'listening', questionType: 'short_answer', topic: 'Education', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'What variable does Dr Patel ask them to control for?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['caffeine intake', 'caffeine'], explanation: 'Dr Patel asks about controlling "for caffeine intake, since that could easily skew memory performance."', strategyNote: 'Listen for "control for" as a direct cue phrase for a variable-name answer.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 5, isPremium: false },
  { id: 'lq-m8-s3-6', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Participants must avoid caffeine for ______ hours before the test.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['12', 'twelve'], explanation: 'Ryan suggests participants "avoid caffeine for twelve hours before the test."', strategyNote: 'Suggested solutions in a tutorial often become the final agreed answer being tested.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 6, isPremium: false },
  { id: 'lq-m8-s3-7', skill: 'listening', questionType: 'multiple_choice', topic: 'Education', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'What does Dr Patel say about ethical approval for this study?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000003',
    options: ['It is not required for student projects', 'It is always required for sleep deprivation studies', 'It is optional but recommended', 'It only applies to the second group'],
    correctAnswer: 'It is always required for sleep deprivation studies', explanation: 'Dr Patel states "sleep deprivation studies always require full ethics approval, even a mild version like this."', strategyNote: 'Absolute words like "always" or "never" in a lecturer\'s statement are often the exact wording tested in the correct option.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 7, isPremium: false },
  { id: 'lq-m8-s3-8', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Ethics application deadline: the ______ of November', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['9th', 'ninth'], explanation: 'Dr Patel says to "submit it by the ninth of November."', strategyNote: 'Multiple deadlines appear in this conversation — track each one against the task it belongs to.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 8, isPremium: false },
  { id: 'lq-m8-s3-9', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Draft is due by the ______ of November', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['25th', 'twenty-fifth'], explanation: 'Dr Patel says "send me a draft by the twenty-fifth of November."', strategyNote: 'Do not confuse the ethics deadline (9th) with the draft deadline (25th) — both fall in the same month.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 9, isPremium: false },
  { id: 'lq-m8-s3-10', skill: 'listening', questionType: 'short_answer', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'On what date is the final report due?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['3rd of December', 'third of December', 'December 3rd'], explanation: 'Dr Patel says "the final report is due on the third of December."', strategyNote: 'The final deadline mentioned in a planning conversation is often the overall project due date.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 10, isPremium: false },

  // ===================== MOCK 8 · SECTION 4 =====================
  { id: 'lq-m8-s4-1', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'What is the master clock of the human circadian system called?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['the suprachiasmatic nucleus', 'suprachiasmatic nucleus', 'SCN'], explanation: 'The lecturer identifies "a tiny cluster of around twenty thousand neurons in the hypothalamus called the suprachiasmatic nucleus."', strategyNote: 'The lecturer immediately provides an abbreviation (SCN) — either the full term or the abbreviation should be accepted.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false },
  { id: 'lq-m8-s4-2', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'The main cue that synchronises the body clock is known as a "______."', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'zeitgeber', explanation: 'The lecturer says light is "what scientists call a \'zeitgeber\' — a German term meaning \'time giver.\'"', strategyNote: 'A foreign loanword introduced mid-sentence is a common note-completion answer — listen for the definition that follows it.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m8-s4-3', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Why can blind people whose retinas still detect light maintain a normal circadian rhythm?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000004',
    options: ['Their SCN uses hearing instead of sight', 'The light-detection pathway to the SCN is separate from the visual system', 'They rely entirely on melatonin supplements', 'Their internal clock resets every day regardless of light'],
    correctAnswer: 'The light-detection pathway to the SCN is separate from the visual system', explanation: 'The lecturer explains the retina sends light information to the SCN "via a pathway that is separate from the visual system used for seeing images."', strategyNote: 'Listen for a contrast signal ("separate from") that distinguishes two similar-sounding systems.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 45, orderIndex: 3, isPremium: false },
  { id: 'lq-m8-s4-4', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Which hormone is sometimes referred to as the "hormone of darkness"?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['melatonin'], explanation: 'The lecturer introduces "melatonin, sometimes called the \'hormone of darkness.\'"', strategyNote: 'A nickname given right after a technical term usually signals the exact word the question wants.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 4, isPremium: false },
  { id: 'lq-m8-s4-5', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Melatonin levels typically peak between two and ______ in the morning.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'four', explanation: 'The lecturer states levels "typically peak somewhere between two and four in the morning."', strategyNote: 'Time ranges are a classic note-completion trap — make sure you capture the second number, not the first.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 5, isPremium: false },
  { id: 'lq-m8-s4-6', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'According to the lecture, why is screen use before bedtime discouraged?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000004',
    options: ['Screens are linked to eye strain only', 'Blue-toned light can suppress melatonin release', 'Screens raise body temperature', 'Screens interfere with the SCN directly'],
    correctAnswer: 'Blue-toned light can suppress melatonin release', explanation: 'The lecturer notes that "exposure to bright light — including the blue-toned light emitted by many phone and computer screens — can suppress melatonin release."', strategyNote: 'The reason given is embedded in a longer sentence with an example (phone and computer screens) inserted — listen past the example to the main clause.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 45, orderIndex: 6, isPremium: false },
  { id: 'lq-m8-s4-7', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Body temperature typically reaches its highest point in the late ______ or early evening.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'afternoon', explanation: 'The lecturer says temperature "reaches its lowest point in the early hours of the morning and its highest point in the late afternoon or early evening."', strategyNote: 'Two time points are given in the same sentence — match "highest" to the second one, not the first.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 7, isPremium: false },
  { id: 'lq-m8-s4-8', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'By roughly how many hours per day does the internal clock adjust after a change of time zone?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['one hour', 'one', 'roughly one hour'], explanation: 'The lecturer explains the internal clock "gradually shifting by roughly one hour per day until it catches up with local time."', strategyNote: 'The answer is a rate ("per day"), not a total — keep it to the single unit given.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 8, isPremium: false },
  { id: 'lq-m8-s4-9', skill: 'listening', questionType: 'summary_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: 'An individual\'s natural tendency toward an earlier or later sleep-wake pattern is called their ______.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'chronotype', explanation: 'The lecturer introduces "chronotype — the natural tendency of an individual toward either an earlier or a later sleep-wake pattern."', strategyNote: 'A formal technical term is often followed immediately by an informal definition — use the definition to confirm you heard the term correctly.',
    tags: ['summary_completion'], estimatedTimeSeconds: 50, orderIndex: 9, isPremium: false },
  { id: 'lq-m8-s4-10', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: 'What consequence does the lecturer suggest an early school or work start time can have on a "night owl" chronotype?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000004',
    options: ['Improved long-term memory', 'A kind of chronic, low-grade sleep deprivation', 'A permanent shift to an earlier chronotype', 'No measurable effect at all'],
    correctAnswer: 'A kind of chronic, low-grade sleep deprivation', explanation: 'The lecturer says forcing a late chronotype into an early schedule "can produce a kind of chronic, low-grade sleep deprivation."', strategyNote: 'This is the lecture\'s final substantive claim before the closing remark — concluding sentences often carry a key inference-question answer.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 10, isPremium: false },

  // ===================== MOCK 9 · SECTION 1 =====================
  { id: 'lq-m9-s1-1', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: 'Distance between Leeds and Harrogate: ______ miles', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000005', options: null,
    correctAnswer: ['18', 'eighteen'], explanation: 'The agent says "that is about eighteen miles, so it falls within our standard local rate."', strategyNote: 'Distances are often given directly after a customer names two locations — listen for the follow-up figure.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 1, isPremium: false },
  { id: 'lq-m9-s1-2', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'What extra requirement does moving the piano create?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000005',
    options: ['A larger van only', 'A two-person team and special straps', 'An extra day for the move', 'A specialist piano-moving company'],
    correctAnswer: 'A two-person team and special straps', explanation: 'The agent says "we will need to send a two-person team instead of one, along with special piano straps."', strategyNote: 'Look for two linked details (team size and equipment) joined by "along with" in the same sentence.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 2, isPremium: false },
  { id: 'lq-m9-s1-3', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Moving date agreed: the ______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000005', options: null,
    correctAnswer: ['15th', 'fifteenth'], explanation: 'The agent confirms "we do have the fifteenth free" after the fourteenth is fully booked, and the customer agrees.', strategyNote: 'When a first date is unavailable, listen for the alternative date that is actually confirmed.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 3, isPremium: false },
  { id: 'lq-m9-s1-4', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Final quoted cost including piano surcharge: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000005', options: null,
    correctAnswer: '420', explanation: 'The agent self-corrects: "let me recalculate with the piano surcharge — that actually brings it to four hundred and twenty pounds."', strategyNote: 'Ignore the first price given (380) and take the corrected total that follows "actually."',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m9-s1-5', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Packing service costs an extra £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000005', options: null,
    correctAnswer: '110', explanation: 'The agent says packing costs "an extra one hundred and ten pounds."', strategyNote: 'The customer declines this service — but the price is still tested even though it is not chosen.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 5, isPremium: false },
  { id: 'lq-m9-s1-6', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.0,
    prompt: 'Price of one box: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000005', options: null,
    correctAnswer: ['1.20', '1.2'], explanation: 'The agent says "boxes are one pound twenty each."', strategyNote: 'Write amounts under two pounds as decimals (1.20) unless told otherwise.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 6, isPremium: false },
  { id: 'lq-m9-s1-7', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Cost to hire 50 reusable crates: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000005', options: null,
    correctAnswer: '35', explanation: 'The agent offers "fifty reusable plastic crates for thirty-five pounds."', strategyNote: 'The customer chooses this cheaper option over buying boxes — link the number of crates to the price.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 7, isPremium: false },
  { id: 'lq-m9-s1-8', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'How does the customer pay the deposit?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000005',
    options: ['By cheque', 'By card or bank transfer', 'In cash on the day', 'By postal order'],
    correctAnswer: 'By card or bank transfer', explanation: 'The agent explains "we only take card or bank transfer now, no cheques," and the customer agrees to transfer that day.', strategyNote: 'The rejected payment method (cheque) is mentioned directly before the accepted ones — do not select it.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 8, isPremium: false },
  { id: 'lq-m9-s1-9', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Office street: ______ Road', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000005', options: null,
    correctAnswer: 'Grenville', explanation: 'The agent spells the address: "forty-one, Grenville Road — that is G-R-E-N-V-I-L-L-E."', strategyNote: 'When a street name is spelled out, write it exactly as spelled rather than guessing from pronunciation.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 9, isPremium: false },
  { id: 'lq-m9-s1-10', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Deposit required: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000005', options: null,
    correctAnswer: '75', explanation: 'The agent says "we need a deposit of seventy-five pounds to confirm the booking."', strategyNote: 'The word "deposit" is your cue — do not confuse it with the earlier total quote of £420.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 10, isPremium: false },

  // ===================== MOCK 9 · SECTION 2 =====================
  { id: 'lq-m9-s2-1', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: 'Number of repair stations at the event: ______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000006', options: null,
    correctAnswer: ['4', 'four'], explanation: 'The host says "we will be running four different repair stations."', strategyNote: 'Note the total number given at the start, then track each station as it is named.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 1, isPremium: false },
  { id: 'lq-m9-s2-2', skill: 'listening', questionType: 'matching_features', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Torn clothing', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000006',
    options: ['Electrical station', 'Textiles station', 'Furniture station', 'Bike station'],
    correctAnswer: 'Textiles station', explanation: 'The host explains "the textiles station deals with clothing repairs, replacing zips, and mending tears."', strategyNote: 'List all four station names first, then tick off each item as it is mentioned.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m9-s2-3', skill: 'listening', questionType: 'matching_features', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Wobbly chair', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000006',
    options: ['Electrical station', 'Textiles station', 'Furniture station', 'Bike station'],
    correctAnswer: 'Furniture station', explanation: 'The host says "the furniture station is for wobbly chairs, sticking drawers, and similar wooden repairs."', strategyNote: 'The prompt word ("wobbly chair") is repeated almost exactly in the transcript — listen for that exact phrase.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 3, isPremium: false },
  { id: 'lq-m9-s2-4', skill: 'listening', questionType: 'matching_features', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Bicycle puncture', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000006',
    options: ['Electrical station', 'Textiles station', 'Furniture station', 'Bike station'],
    correctAnswer: 'Bike station', explanation: 'The host says the bike station, "outdoors under the gazebo, covers punctures, brakes, and gears."', strategyNote: 'Location detail ("outdoors under the gazebo") can help you recall which station is which even if you miss the name.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m9-s2-5', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Sessions run on the ______ Saturday of every month.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000006', options: null,
    correctAnswer: 'first', explanation: 'The host says "sessions run on the first Saturday of every month."', strategyNote: 'Ordinal words describing frequency (first, second) are common note-completion answers.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 5, isPremium: false },
  { id: 'lq-m9-s2-6', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Session hours: 10 a.m. to ______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000006', options: null,
    correctAnswer: '1 p.m.', explanation: 'Sessions run "from ten a.m. until one p.m."', strategyNote: 'Write the full time including a.m./p.m. if the blank format requires it.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 6, isPremium: false },
  { id: 'lq-m9-s2-7', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'What type of item can volunteers not repair, for safety reasons?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000006', options: null,
    correctAnswer: ['gas appliances', 'safety-critical items like gas appliances'], explanation: 'The host says "safety-critical items like gas appliances are not something we can touch."', strategyNote: 'The phrase "safety-critical" flags an important restriction likely to be tested.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 7, isPremium: false },
  { id: 'lq-m9-s2-8', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'While repairs are free, visitors are asked for a small ______.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000006', options: null,
    correctAnswer: 'donation', explanation: 'The host says "we do ask for a small donation, whatever you can afford."', strategyNote: 'The contrast word "while" or "although" often precedes a detail that qualifies an earlier statement (here, "free").',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 8, isPremium: false },
  { id: 'lq-m9-s2-9', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 5.0,
    prompt: "What is the name of the volunteer coordinator?", passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000006', options: null,
    correctAnswer: 'Marcus', explanation: 'The host says to "speak to Marcus, who is coordinating the volunteer side of things."', strategyNote: 'A name introduced with "speak to" is often the contact person being tested.',
    tags: ['short_answer'], estimatedTimeSeconds: 35, orderIndex: 9, isPremium: false },
  { id: 'lq-m9-s2-10', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Why does the host recommend not driving to the centre on Saturdays?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000006',
    options: ['The centre has no car park at all', 'Parking is limited due to the farmers’ market next door', 'The roads are closed for repairs', 'Only volunteers are allowed to park'],
    correctAnswer: 'Parking is limited due to the farmers’ market next door', explanation: 'The host says "parking near the centre is limited on Saturdays because of the farmers\' market next door."', strategyNote: 'The reason clause after "because of" gives the exact cause tested in this question.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 10, isPremium: false },

  // ===================== MOCK 9 · SECTION 3 =====================
  { id: 'lq-m9-s3-1', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Leo', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000007',
    options: ['Literature review', 'Statistical analysis', 'Discussion and conclusion only'],
    correctAnswer: 'Literature review', explanation: 'Hannah says she is "handling the statistical analysis... and Leo is writing up the literature review."', strategyNote: 'One speaker often summarises both roles in a single sentence — listen for both names together.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false },
  { id: 'lq-m9-s3-2', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Hannah', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000007',
    options: ['Literature review', 'Statistical analysis', 'Discussion and conclusion only'],
    correctAnswer: 'Statistical analysis', explanation: 'Hannah says "I am handling the statistical analysis, since I did the stats module last term."', strategyNote: 'Reasons given ("since I did the stats module") can help confirm you matched the correct name.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m9-s3-3', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Target number of survey responses: ______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000007', options: null,
    correctAnswer: ['150', 'one hundred and fifty'], explanation: 'Leo says they are "hoping for at least one hundred and fifty responses."', strategyNote: 'Three-digit numbers spoken as "a hundred and fifty" should be written in digit form (150).',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 3, isPremium: false },
  { id: 'lq-m9-s3-4', skill: 'listening', questionType: 'short_answer', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Which three product categories are being surveyed?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000007', options: null,
    correctAnswer: ['coffee, cereal, and shampoo', 'coffee, cereal, shampoo'], explanation: 'Hannah says they will "survey shoppers about three product categories — coffee, cereal, and shampoo."', strategyNote: 'When a list of three items follows a dash, expect all three to be needed for a full answer.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m9-s3-5', skill: 'listening', questionType: 'multiple_choice', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'What incentive is offered to survey participants?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000007',
    options: ['A free coffee voucher', 'Entry into a prize draw for a £20 gift voucher', 'Course credit', 'A discount at the Union shop'],
    correctAnswer: 'Entry into a prize draw for a £20 gift voucher', explanation: 'Leo says "we are offering entry into a prize draw for a twenty-pound gift voucher."', strategyNote: 'Match the exact prize value (£20) mentioned in the transcript to the matching option.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 5, isPremium: false },
  { id: 'lq-m9-s3-6', skill: 'listening', questionType: 'short_answer', topic: 'Education', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'What statistical test will they use to compare the three categories?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000007', options: null,
    correctAnswer: ['one-way ANOVA', 'ANOVA'], explanation: 'Hannah says "we are planning to use a one-way ANOVA, since we are comparing three independent groups."', strategyNote: 'Technical statistical terms are often given with a brief justification ("since...") right after — use it to confirm the term.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 6, isPremium: false },
  { id: 'lq-m9-s3-7', skill: 'listening', questionType: 'note_completion', topic: 'Education', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Before running the test, they must check the data is normally ______.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000007', options: null,
    correctAnswer: 'distributed', explanation: 'Dr Okafor says to "check it is normally distributed first."', strategyNote: 'A statistics-related instruction from a tutor often ends with a precise technical adjective — write it exactly.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 7, isPremium: false },
  { id: 'lq-m9-s3-8', skill: 'listening', questionType: 'multiple_choice', topic: 'Education', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'What does Dr Okafor say about the ethics application for this project?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000007',
    options: ['No approval is needed at all', 'It should be quick and low-risk since the survey is anonymous', 'It will take several months to approve', 'It is only needed for the online survey'],
    correctAnswer: 'It should be quick and low-risk since the survey is anonymous', explanation: 'Dr Okafor says "because it is an anonymous survey with no sensitive questions, it should be a quick, low-risk application."', strategyNote: 'The reason clause ("because it is anonymous") explains why the process is described as low-risk.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 8, isPremium: false },
  { id: 'lq-m9-s3-9', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Ethics form deadline: the ______ of March', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000007', options: null,
    correctAnswer: ['11th', 'eleventh'], explanation: 'Dr Okafor says "submit the ethics form by the eleventh of March."', strategyNote: 'Two different months (March and April) appear in this conversation — check which deadline belongs to which month.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 9, isPremium: false },
  { id: 'lq-m9-s3-10', skill: 'listening', questionType: 'note_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Draft report due by the 15th of April, to be sent as a ______ document.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000007', options: null,
    correctAnswer: 'Word', explanation: 'Dr Okafor asks for the draft "as a Word document this time, actually, since I want to leave comments directly in the file."', strategyNote: 'The phrase "this time" signals a change from a previous format — do not assume it matches an earlier conversation.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 10, isPremium: false },

  // ===================== MOCK 9 · SECTION 4 =====================
  { id: 'lq-m9-s4-1', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'What do the vertical cables of a suspension bridge transfer weight to?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000008', options: null,
    correctAnswer: ['the main cables', 'main cables'], explanation: 'The lecturer explains weight passes "up through vertical cables to two large main cables."', strategyNote: 'Follow the chain of components described (deck, vertical cables, main cables) in the order given.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false },
  { id: 'lq-m9-s4-2', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'A single main cable on a large bridge might contain over ______ individual wires.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000008', options: null,
    correctAnswer: ['20,000', 'twenty thousand'], explanation: 'The lecturer says a main cable "might contain over twenty thousand individual wires."', strategyNote: 'Large numbers spoken as "twenty thousand" should be converted to digit form (20,000).',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m9-s4-3', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Who designed the Clifton Suspension Bridge?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000008', options: null,
    correctAnswer: ['Isambard Kingdom Brunel', 'Brunel'], explanation: 'The lecturer names "the engineer Isambard Kingdom Brunel."', strategyNote: 'Full proper names given once are often the exact answer expected, even if only the surname is required.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 3, isPremium: false },
  { id: 'lq-m9-s4-4', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'The Clifton Suspension Bridge was completed in ______.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000008', options: null,
    correctAnswer: ['1864', 'eighteen sixty-four'], explanation: 'The lecturer says it "was not actually completed until after his death, in eighteen sixty-four."', strategyNote: 'Years spoken in two parts ("eighteen sixty-four") should be combined into a single four-digit number.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m9-s4-5', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Why do engineers consider flexibility in suspension bridges a feature rather than a fault?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000008',
    options: ['It reduces the cost of construction', 'A completely rigid structure would be more likely to crack under stress', 'It makes the bridge look more attractive', 'It reduces the number of cables needed'],
    correctAnswer: 'A completely rigid structure would be more likely to crack under stress', explanation: 'The lecturer explains this is "because a completely rigid structure of that length would be far more likely to crack under stress."', strategyNote: 'The word "because" directly links the claim to its justification — use it to find the correct option.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 5, isPremium: false },
  { id: 'lq-m9-s4-6', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'What is the name of the famous 1940 bridge collapse mentioned in the lecture?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000008', options: null,
    correctAnswer: ['Tacoma Narrows Bridge', 'the Tacoma Narrows Bridge'], explanation: 'The lecturer refers to "the collapse of the Tacoma Narrows Bridge in the United States, in nineteen forty."', strategyNote: 'Proper nouns naming a specific historical event are often required verbatim as the answer.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 6, isPremium: false },
  { id: 'lq-m9-s4-7', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'The Tacoma Narrows Bridge collapsed in ______.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000008', options: null,
    correctAnswer: ['1940', 'nineteen forty'], explanation: 'The lecturer places the collapse "in the United States, in nineteen forty."', strategyNote: 'Two different years appear in this lecture (1864 and 1940) — check the surrounding context to avoid mixing them up.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 7, isPremium: false },
  { id: 'lq-m9-s4-8', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: 'What is the technical term for the wind-driven twisting that destroyed the bridge?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000008', options: null,
    correctAnswer: ['aeroelastic flutter'], explanation: 'The lecturer names "a phenomenon known as aeroelastic flutter."', strategyNote: '"Known as" introduces precise technical vocabulary — copy the exact term given.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 8, isPremium: false },
  { id: 'lq-m9-s4-9', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Modern bridges use ______ embedded in the cables to monitor stress, vibration and temperature.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000008', options: null,
    correctAnswer: 'sensors', explanation: 'The lecturer says bridges "have sensors embedded directly into the cables and deck."', strategyNote: 'The list of three measured properties (stress, vibration, temperature) confirms you are in the right sentence.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 9, isPremium: false },
  { id: 'lq-m9-s4-10', skill: 'listening', questionType: 'summary_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: 'Future bridges may use ______ composite cables instead of traditional steel.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000008', options: null,
    correctAnswer: ['carbon fibre', 'carbon fiber'], explanation: 'The lecture ends by noting research into "carbon fibre composite cables as a lighter, stronger alternative to traditional steel."', strategyNote: 'The final sentence of a lecture often summarises a forward-looking development — a common summary-completion source.',
    tags: ['summary_completion'], estimatedTimeSeconds: 50, orderIndex: 10, isPremium: false },

  // ===================== MOCK 10 · SECTION 1 =====================
  { id: 'lq-m10-s1-1', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.0,
    prompt: 'Postcode: BR3 7______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000009', options: null,
    correctAnswer: 'LN', explanation: 'The customer gives the postcode as "BR3, then 7-L-N."', strategyNote: 'Postcodes mixing letters and numbers are usually spelled out — write exactly what is spelled.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false },
  { id: 'lq-m10-s1-2', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: 'Package chosen: ______ Fibre', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000009', options: null,
    correctAnswer: 'Superfast', explanation: 'The customer says "probably the superfast one" after hearing about video calls.', strategyNote: 'Match the customer\'s stated need (video calls) to the package that suits it best.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 2, isPremium: false },
  { id: 'lq-m10-s1-3', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Superfast Fibre speed: ______ megabits per second', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000009', options: null,
    correctAnswer: ['70', 'seventy'], explanation: 'The agent describes "Superfast Fibre at seventy megabits."', strategyNote: 'Two speeds are mentioned (35 and 70) — make sure you note the one for the package actually chosen.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 3, isPremium: false },
  { id: 'lq-m10-s1-4', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Monthly cost on the 18-month contract: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000009', options: null,
    correctAnswer: '32', explanation: 'The agent says Superfast Fibre is "thirty-two pounds a month on an eighteen-month contract."', strategyNote: 'Two monthly prices are given (contract vs no contract) — the customer explicitly chooses the contract option.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 4, isPremium: false },
  { id: 'lq-m10-s1-5', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Standard one-off setup fee: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000009', options: null,
    correctAnswer: '45', explanation: 'The agent mentions "a one-off setup fee of forty-five pounds."', strategyNote: 'Note this figure even though it is later waived — the number itself is still often tested.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 5, isPremium: false },
  { id: 'lq-m10-s1-6', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'What happens to the setup fee in this call?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000009',
    options: ['It is doubled', 'It is waived due to a promotion', 'It is added to the first bill', 'It is refunded after a year'],
    correctAnswer: 'It is waived due to a promotion', explanation: 'The agent checks and confirms "we are currently running a promotion, so that fee will be waived for you."', strategyNote: 'Listen past the standard price to hear if a special offer changes the final outcome.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 45, orderIndex: 6, isPremium: false },
  { id: 'lq-m10-s1-7', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Installation date chosen: Thursday the ______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000009', options: null,
    correctAnswer: ['11th', 'eleventh'], explanation: 'The agent offers "Thursday the eleventh" and the customer accepts.', strategyNote: 'Two options are offered (Thursday or the following Tuesday) — the customer\'s final choice is the answer.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 7, isPremium: false },
  { id: 'lq-m10-s1-8', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 5.0,
    prompt: 'What does the customer need for the installation?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000009',
    options: ['An extension cable', 'A new router', 'A different postcode check', 'A second phone line'],
    correctAnswer: 'A new router', explanation: 'The customer confirms "I will need a new one, please" when asked about a router.', strategyNote: 'The agent clarifies this item is "included free with your package" — do not assume it costs extra.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 45, orderIndex: 8, isPremium: false },
  { id: 'lq-m10-s1-9', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.0,
    prompt: "Customer's surname: ______", passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000009', options: null,
    correctAnswer: 'Delaney', explanation: 'The customer spells "It is Delaney — D-E-L-A-N-E-Y."', strategyNote: 'The final spelled item in a call is often the surname used for the account — write it exactly as spelled.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 9, isPremium: false },
  { id: 'lq-m10-s1-10', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'What time window is given for the Thursday installation?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000009', options: null,
    correctAnswer: ['8 a.m. to midday', 'eight a.m. to midday', '8am-12pm'], explanation: 'The agent offers the slot "between eight a.m. and midday."', strategyNote: 'Time windows given with "between X and Y" require both the start and end time in your answer.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 10, isPremium: false },

  // ===================== MOCK 10 · SECTION 2 =====================
  { id: 'lq-m10-s2-1', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: 'Festival dates: 5th to ______ of December', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000010', options: null,
    correctAnswer: ['8th', 'eighth'], explanation: 'The host says the festival "returns to the town square from the fifth to the eighth of December."', strategyNote: 'Date ranges give a start and end — check which one the blank is asking for.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 1, isPremium: false },
  { id: 'lq-m10-s2-2', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.0,
    prompt: 'Daily opening time: ______ a.m.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000010', options: null,
    correctAnswer: '11', explanation: 'The festival "opens each day at eleven in the morning."', strategyNote: 'The word "each day" signals a standard time that applies to every day except the exception mentioned later.',
    tags: ['form_completion'], estimatedTimeSeconds: 35, orderIndex: 2, isPremium: false },
  { id: 'lq-m10-s2-3', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Closing time on the final day (Sunday): ______ p.m.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000010', options: null,
    correctAnswer: '6', explanation: 'On the final day "everything closes earlier, at six p.m., to allow time for the stalls to pack down."', strategyNote: 'The general closing time (9 p.m.) differs from the Sunday exception — check which one is asked for.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 3, isPremium: false },
  { id: 'lq-m10-s2-4', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'The market area has around ______ stalls.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000010', options: null,
    correctAnswer: ['40', 'forty'], explanation: 'The host says the market area "will have around forty stalls selling crafts, food, and gifts."', strategyNote: 'Approximation words like "around" still precede an exact figure you must write down.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 4, isPremium: false },
  { id: 'lq-m10-s2-5', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'The ice rink has been made ______ percent bigger this year.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000010', options: null,
    correctAnswer: ['20', 'twenty'], explanation: 'The host says the ice rink "has been made twenty percent bigger to reduce queuing."', strategyNote: 'The reason given ("to reduce queuing") confirms you are in the correct sentence for this figure.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 5, isPremium: false },
  { id: 'lq-m10-s2-6', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Ice rink price for adults: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000010', options: null,
    correctAnswer: '6', explanation: 'The host says the rink charge is "six pounds for adults, and four pounds for under-sixteens."', strategyNote: 'Two prices appear together (adults and under-sixteens) — match each number to the correct age group.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 6, isPremium: false },
  { id: 'lq-m10-s2-7', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Which car park will be closed for the full four days of the festival?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000010', options: null,
    correctAnswer: 'Church Street', explanation: 'The host warns "the main car park on Church Street will be closed for the full four days."', strategyNote: 'Street names given right after "on" are common short-answer targets in transport announcements.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 7, isPremium: false },
  { id: 'lq-m10-s2-8', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'How often does the free shuttle bus run from the train station?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000010',
    options: ['Every 10 minutes', 'Every 15 minutes', 'Every 30 minutes', 'Every hour'],
    correctAnswer: 'Every 15 minutes', explanation: 'The host mentions "the free shuttle bus running every fifteen minutes from the train station."', strategyNote: 'Frequency phrases ("every X minutes") are common multiple-choice distractors — listen for the exact number.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 45, orderIndex: 8, isPremium: false },
  { id: 'lq-m10-s2-9', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'What special event takes place at 6 p.m. on the opening evening?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000010', options: null,
    correctAnswer: ['a lantern parade', 'lantern parade'], explanation: 'The host says "a lantern parade starting at six p.m. from the library, ending at the main stage."', strategyNote: 'Event names given with a start location and end location are usually the key detail tested.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 9, isPremium: false },
  { id: 'lq-m10-s2-10', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'At the end of the lantern parade, the ______ will switch on the festival lights.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000010', options: null,
    correctAnswer: 'mayor', explanation: 'The host says the parade ends "at the main stage in the square, where the mayor will officially switch on the festival lights."', strategyNote: 'Job titles like "mayor" are common answers when a ceremony or official action is described.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 10, isPremium: false },

  // ===================== MOCK 10 · SECTION 3 =====================
  { id: 'lq-m10-s3-1', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Planned the guided bird walk', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000011',
    options: ['Amelia', 'Toby', 'Mr Harding'],
    correctAnswer: 'Amelia', explanation: 'Amelia describes the plan: "first, a guided walk around the reed beds with a ranger, focusing on bird identification."', strategyNote: 'Match the speaker who first describes an activity to that activity, even if others discuss it afterwards.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false },
  { id: 'lq-m10-s3-2', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Obtained the transport quotes', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000011',
    options: ['Amelia', 'Toby', 'Mr Harding'],
    correctAnswer: 'Toby', explanation: 'Toby reports "we got a quote for a coach, which is one hundred and eighty pounds for the return trip, or two minibuses."', strategyNote: 'The speaker presenting cost figures for logistics is usually the one who researched that part of the plan.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m10-s3-3', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Maximum reserve capacity: ______ visitors', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000011', options: null,
    correctAnswer: ['35', 'thirty-five'], explanation: 'Toby says "the reserve can host up to thirty-five visitors at once."', strategyNote: 'Distinguish the venue capacity (35) from the class size (28) mentioned in the same sentence.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 3, isPremium: false },
  { id: 'lq-m10-s3-4', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Length of the guided walk: ______ minutes', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000011', options: null,
    correctAnswer: ['90', 'ninety'], explanation: 'Amelia says "the ranger said ninety minutes, so we should be back for lunch by half past twelve."', strategyNote: 'A stated duration is often followed by its real-world consequence (arriving back by 12:30) — use this to double-check your answer.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 4, isPremium: false },
  { id: 'lq-m10-s3-5', skill: 'listening', questionType: 'short_answer', topic: 'Education', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'What two things are tested in the water-sampling activity?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000011', options: null,
    correctAnswer: ['pH and oxygen levels', 'pH and oxygen'], explanation: 'Toby explains they will "test pH and oxygen levels" at the pond.', strategyNote: 'When a question asks for "two things," make sure both items are included in your answer.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 5, isPremium: false },
  { id: 'lq-m10-s3-6', skill: 'listening', questionType: 'multiple_choice', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Which transport option does Mr Harding choose?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000011',
    options: ['One coach', 'Two minibuses', 'Public transport', 'Parents driving individually'],
    correctAnswer: 'One coach', explanation: 'Mr Harding says "let us go with the coach then, cheaper and simpler with one driver."', strategyNote: 'The word "cheaper" signals the reasoning behind the final decision between two priced options.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 45, orderIndex: 6, isPremium: false },
  { id: 'lq-m10-s3-7', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Coach cost for the return trip: £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000011', options: null,
    correctAnswer: '180', explanation: 'Toby says the coach quote "is one hundred and eighty pounds for the return trip."', strategyNote: 'Compare this figure to the minibus total (£210) mentioned in the same sentence to avoid mixing them up.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 7, isPremium: false },
  { id: 'lq-m10-s3-8', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Cost per student (entry plus ranger session): £______', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000011', options: null,
    correctAnswer: ['7.50', '7.5'], explanation: 'Toby says "entry plus the ranger session works out at seven pounds fifty per student."', strategyNote: 'Write amounts under ten pounds as decimals (7.50) unless told otherwise.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 8, isPremium: false },
  { id: 'lq-m10-s3-9', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Consent forms due by the ______ of April', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000011', options: null,
    correctAnswer: ['22nd', 'twenty-second'], explanation: 'Amelia suggests "the twenty-second of April, so there is time to chase anyone who forgets."', strategyNote: 'A deadline followed by a stated reason (extra time to chase people) confirms this is the final agreed date.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 9, isPremium: false },
  { id: 'lq-m10-s3-10', skill: 'listening', questionType: 'short_answer', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'What footwear does the ranger recommend for the pond activity?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000011', options: null,
    correctAnswer: ['wellies or waterproof boots', 'wellies', 'waterproof boots'], explanation: 'Toby says "the ranger recommended wellies or waterproof boots, especially for the pond activity."', strategyNote: 'When two acceptable alternatives are given (wellies or waterproof boots), either should count as correct.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 10, isPremium: false },

  // ===================== MOCK 10 · SECTION 4 =====================
  { id: 'lq-m10-s4-1', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'What is the granular substance called that snow turns into before becoming glacial ice?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000012', options: null,
    correctAnswer: 'firn', explanation: 'The lecturer describes snow "transforming loose snow first into a granular substance called firn."', strategyNote: 'The phrase "called X" directly before a pause usually flags the exact term needed.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false },
  { id: 'lq-m10-s4-2', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Forming glacial ice can take from a few decades to several ______.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000012', options: null,
    correctAnswer: 'centuries', explanation: 'The lecturer says this "can take anywhere from a few decades to several centuries depending on the climate."', strategyNote: 'Range phrases ("from X to Y") often test the second, larger figure or unit in a note-completion gap.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m10-s4-3', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'What is the term for ice crystals sliding past one another inside a glacier?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000012', options: null,
    correctAnswer: 'internal deformation', explanation: 'The lecturer names "internal deformation, where the ice crystals themselves slowly slide past one another."', strategyNote: 'The two mechanisms are listed together — keep them in the same order as the lecture to avoid confusion.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 3, isPremium: false },
  { id: 'lq-m10-s4-4', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'What is the term for a glacier sliding over meltwater at its base?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000012', options: null,
    correctAnswer: 'basal sliding', explanation: 'The lecturer describes "basal sliding, where the entire glacier slides over a thin layer of meltwater at its base."', strategyNote: 'The word "basal" relates to "base" — use this word association to remember the correct mechanism.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 4, isPremium: false },
  { id: 'lq-m10-s4-5', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'The zone where snowfall exceeds melting is called the ______ zone.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000012', options: null,
    correctAnswer: 'accumulation', explanation: 'The lecturer says "the upper zone, called the accumulation zone, is where snowfall exceeds melting."', strategyNote: 'Contrast this with the "ablation zone," where the opposite is true — do not mix the two terms up.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 5, isPremium: false },
  { id: 'lq-m10-s4-6', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'The boundary between the two zones is called the ______ line.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000012', options: null,
    correctAnswer: 'equilibrium', explanation: 'The lecturer states "the boundary between these two zones is called the equilibrium line."', strategyNote: 'Definitions given right after "called" or "known as" are near-guaranteed exam answers — copy them exactly.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 6, isPremium: false },
  { id: 'lq-m10-s4-7', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: 'The European Alps have lost around ______ percent of their glacial ice volume since 1850.', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000012', options: null,
    correctAnswer: ['60', 'sixty'], explanation: 'The lecturer says the Alps "have lost around sixty percent of their glacial ice volume since eighteen fifty."', strategyNote: 'Statistics attached to a named region (the Alps) are common in the middle section of an academic lecture.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 7, isPremium: false },
  { id: 'lq-m10-s4-8', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'What technique measures tiny changes in gravity to estimate ice loss?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000012', options: null,
    correctAnswer: ['satellite gravimetry', 'gravimetry'], explanation: 'The lecturer names "satellite gravimetry, a technique that measures tiny changes in Earth\'s gravitational field."', strategyNote: 'Two-word technical terms combining a method and a science ("satellite" + "gravimetry") should be written in full.',
    tags: ['short_answer'], estimatedTimeSeconds: 45, orderIndex: 8, isPremium: false },
  { id: 'lq-m10-s4-9', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Why do shrinking glaciers threaten water supplies, according to the lecture?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000012',
    options: ['Glaciers are the only source of drinking water', 'Many major rivers are fed by glacial meltwater, especially in dry summer months', 'Glacier meltwater is needed to cool power stations', 'Glaciers prevent flooding in mountain regions'],
    correctAnswer: 'Many major rivers are fed by glacial meltwater, especially in dry summer months', explanation: 'The lecturer explains "many major rivers are fed substantially by glacial meltwater, particularly during the dry summer months."', strategyNote: 'The word "particularly" narrows down exactly when this effect matters most — a common inference-question detail.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 9, isPremium: false },
  { id: 'lq-m10-s4-10', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: 'What do most climate models predict without significant emissions reductions?', passageId: null, listeningTrackId: '35000000-0000-0000-0000-000000000012',
    options: ['All glaciers worldwide will vanish within ten years', 'A large proportion of the world’s smaller glaciers could disappear this century', 'Glacier retreat will slow down naturally', 'Only glaciers in the Alps will be affected'],
    correctAnswer: 'A large proportion of the world’s smaller glaciers could disappear this century', explanation: 'The lecture concludes that "a large proportion of the world\'s smaller glaciers could disappear entirely within this century."', strategyNote: 'The final sentence of an academic lecture often summarises the overall long-term implication — expect an inference question here.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 55, orderIndex: 10, isPremium: false },
];
