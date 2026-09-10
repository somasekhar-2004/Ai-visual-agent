import type { ListeningTrack, Question } from '@/types/models';

export const listeningTracksSet3: ListeningTrack[] = [
  // ---------- MOCK 3 ----------
  {
    id: '32000000-0000-0000-0000-000000000001',
    title: 'Enrolling in an Evening Pottery Class',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Staff": "a friendly female staff member in her 20s-30s with a neutral British accent, helpful and clear tone — introduces themselves as Priya in the call",
      "Caller": "a polite adult male caller in his 30s with a neutral British accent, natural relaxed conversational tone",
    },
    audioUrl: null,
    sectionNumber: 1,
    transcript: `STAFF: Good afternoon, Riverside Arts Centre, this is Priya speaking, how can I help you?
CALLER: Oh hi, um, I saw a flyer about evening pottery classes and I wanted to find out a bit more, please.
STAFF: Of course. We currently run two pottery courses — Beginners' Wheel Throwing on Tuesdays, and Hand-Building for all levels on Thursdays.
CALLER: I've never done pottery before, so probably the beginners one.
STAFF: Great, that's the Wheel Throwing course. It runs from seven to nine p.m., starting the sixteenth of September, for eight weeks.
CALLER: And how much does that cost?
STAFF: The full course is one hundred and twenty pounds, or — sorry, let me correct that — if you book before the end of this month, there's an early-bird rate of ninety-five pounds.
CALLER: Oh brilliant, I'll definitely book before then. Do I need to bring anything?
STAFF: Just an apron, really — we provide the clay and all the tools. Although some people like to bring their own sponge.
CALLER: Okay, noted. Can I ask where the centre actually is? I'm not from round here.
STAFF: We're at twenty-seven Hollyfield Road — that's H-O-L-L-Y-F-I-E-L-D — just next to the library.
CALLER: Got it. Is there parking?
STAFF: There's a small car park behind the building, but it only holds about ten cars, so a lot of people cycle or take the bus instead.
CALLER: That's fine, I'll probably walk actually. Can I take your name again, and how do I actually enrol?
STAFF: It's Priya — P-R-I-Y-A. You can enrol online through our website, or call this number back with your card details.
CALLER: I'll do it online tonight, then. Last thing — is there a limit on class size?
STAFF: Yes, we cap it at twelve students so everyone gets enough attention from the tutor.
CALLER: Perfect, thank you so much for your help.
STAFF: You're welcome, enjoy the course!`,
    turns: [
      { speaker: "Staff", text: "Good afternoon, Riverside Arts Centre, this is Priya speaking, how can I help you?" },
      { speaker: "Caller", text: "Oh hi, um, I saw a flyer about evening pottery classes and I wanted to find out a bit more, please." },
      { speaker: "Staff", text: "Of course. We currently run two pottery courses — Beginners' Wheel Throwing on Tuesdays, and Hand-Building for all levels on Thursdays." },
      { speaker: "Caller", text: "I've never done pottery before, so probably the beginners one." },
      { speaker: "Staff", text: "Great, that's the Wheel Throwing course. It runs from seven to nine p.m., starting the sixteenth of September, for eight weeks." },
      { speaker: "Caller", text: "And how much does that cost?" },
      { speaker: "Staff", text: "The full course is one hundred and twenty pounds, or — sorry, let me correct that — if you book before the end of this month, there's an early-bird rate of ninety-five pounds." },
      { speaker: "Caller", text: "Oh brilliant, I'll definitely book before then. Do I need to bring anything?" },
      { speaker: "Staff", text: "Just an apron, really — we provide the clay and all the tools. Although some people like to bring their own sponge." },
      { speaker: "Caller", text: "Okay, noted. Can I ask where the centre actually is? I'm not from round here." },
      { speaker: "Staff", text: "We're at twenty-seven Hollyfield Road — that's H-O-L-L-Y-F-I-E-L-D — just next to the library." },
      { speaker: "Caller", text: "Got it. Is there parking?" },
      { speaker: "Staff", text: "There's a small car park behind the building, but it only holds about ten cars, so a lot of people cycle or take the bus instead." },
      { speaker: "Caller", text: "That's fine, I'll probably walk actually. Can I take your name again, and how do I actually enrol?" },
      { speaker: "Staff", text: "It's Priya — P-R-I-Y-A. You can enrol online through our website, or call this number back with your card details." },
      { speaker: "Caller", text: "I'll do it online tonight, then. Last thing — is there a limit on class size?" },
      { speaker: "Staff", text: "Yes, we cap it at twelve students so everyone gets enough attention from the tutor." },
      { speaker: "Caller", text: "Perfect, thank you so much for your help." },
      { speaker: "Staff", text: "You're welcome, enjoy the course!" },
    ],
  },
  {
    id: '32000000-0000-0000-0000-000000000002',
    title: 'Orientation Talk for New Residents at Ashgrove Halls',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Warden": "a welcoming male residence warden in his 30s-40s with a neutral British accent, calm and informative tone",
    },
    audioUrl: null,
    sectionNumber: 2,
    transcript: `WARDEN: Hello everyone, and welcome to Ashgrove Halls. My name's Tom, and I'm the warden here, so if you ever have any problems, I'm the person to come and find. I just want to run through a few practical things before you all head off to unpack.

Let's start with the building itself. We've got four floors. On the ground floor you'll find the laundry room and the common room — that's also where the vending machines are. The first floor has two study rooms, which are open twenty-four hours, and my office is also on the first floor, room one-oh-four, in case you ever need me. The second and third floors are just bedrooms, nothing else up there.

Now, a few practical details. Your key card also works as your ID for the library, so don't lose it — if you do, replacing it costs fifteen pounds. Speaking of costs, the laundry machines are coin-operated, and one wash costs two pounds fifty.

For internet, the wifi network is called Ashgrove-Res, and the password is all lowercase — it's "riverside24", no spaces. That's R-I-V-E-R-S-I-D-E, then the number two-four.

We do ask that you observe quiet hours, which run from eleven p.m. to seven a.m., mainly out of respect for people who have early lectures.

In terms of safety, if the fire alarm goes off, the assembly point is the car park at the front of the building, not the courtyard round the back — people often get that wrong, so do remember it's the front car park.

Bin collection is every Tuesday morning, so please have your rubbish out by eight a.m.

And finally, if anything in your room breaks or stops working, don't come and find me first — email the maintenance team directly at repairs at ashgrove dot ac dot uk, and they'll usually sort it within forty-eight hours.

That's everything for now — welcome again, and enjoy your first year!`,
    turns: [
      { speaker: "Warden", text: "Hello everyone, and welcome to Ashgrove Halls. My name's Tom, and I'm the warden here, so if you ever have any problems, I'm the person to come and find. I just want to run through a few practical things before you all head off to unpack." },
      { speaker: "Warden", text: "Let's start with the building itself. We've got four floors. On the ground floor you'll find the laundry room and the common room — that's also where the vending machines are. The first floor has two study rooms, which are open twenty-four hours, and my office is also on the first floor, room one-oh-four, in case you ever need me. The second and third floors are just bedrooms, nothing else up there." },
      { speaker: "Warden", text: "Now, a few practical details. Your key card also works as your ID for the library, so don't lose it — if you do, replacing it costs fifteen pounds. Speaking of costs, the laundry machines are coin-operated, and one wash costs two pounds fifty." },
      { speaker: "Warden", text: "For internet, the wifi network is called Ashgrove-Res, and the password is all lowercase — it's \"riverside24\", no spaces. That's R-I-V-E-R-S-I-D-E, then the number two-four." },
      { speaker: "Warden", text: "We do ask that you observe quiet hours, which run from eleven p.m. to seven a.m., mainly out of respect for people who have early lectures." },
      { speaker: "Warden", text: "In terms of safety, if the fire alarm goes off, the assembly point is the car park at the front of the building, not the courtyard round the back — people often get that wrong, so do remember it's the front car park." },
      { speaker: "Warden", text: "Bin collection is every Tuesday morning, so please have your rubbish out by eight a.m." },
      { speaker: "Warden", text: "And finally, if anything in your room breaks or stops working, don't come and find me first — email the maintenance team directly at repairs at ashgrove dot ac dot uk, and they'll usually sort it within forty-eight hours." },
      { speaker: "Warden", text: "That's everything for now — welcome again, and enjoy your first year!" },
    ],
  },
  {
    id: '32000000-0000-0000-0000-000000000003',
    title: 'Planning a Group Presentation on Renewable Energy',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Dr Allen": "an experienced female academic in her 40s-50s with a neutral British accent, calm, authoritative, and constructive tone",
      "Megan": "a female university student in her early 20s with a neutral British accent, casual natural conversational tone",
      "Jason": "a male university student in his early 20s with a neutral British accent, casual natural conversational tone",
    },
    audioUrl: null,
    sectionNumber: 3,
    transcript: `DR ALLEN: So, Megan, Jason — thanks for coming in. How's the group presentation on renewable energy coming along?
MEGAN: Good progress, I think. We've decided to split it into three parts — solar, wind, and, um, geothermal.
JASON: Yeah, and I've been assigned wind, Megan's doing solar, and Priya, who couldn't make it today, is covering geothermal.
DR ALLEN: Sounds sensible. How long is each section meant to be?
MEGAN: We're aiming for six minutes each, so eighteen minutes total, plus time for questions afterwards.
DR ALLEN: Good. Now, have you thought about visuals? A presentation on energy really benefits from diagrams.
JASON: I was going to make a diagram showing how a wind turbine converts kinetic energy into electricity.
DR ALLEN: Excellent idea. Megan, what about you?
MEGAN: I want to include a graph comparing the cost of solar panels now versus ten years ago — I think it shows a really dramatic drop.
DR ALLEN: That'll work well. Just make sure you cite your source for that data — the International Energy Agency publishes exactly that kind of figure.
MEGAN: Oh good, I'll look them up instead of the website I was using before.
DR ALLEN: When's the presentation actually due?
JASON: The fourteenth of November, in the two p.m. seminar.
DR ALLEN: Right, that gives you about three weeks. I'd suggest you send me a draft of your slides by the seventh, so I can give feedback before the final version.
MEGAN: That works for us. Should we email it, or bring a printed copy?
DR ALLEN: Email is fine — just send it as a PDF, not PowerPoint, in case the formatting shifts on a different computer.
JASON: Will do. One more thing — is there a word limit on the handout we're supposed to give the class?
DR ALLEN: Keep it to one side of A4 per section, so three sides total.
MEGAN: Great, that's really helpful, thank you.
DR ALLEN: No problem — good luck, and I'll see that draft on the seventh.`,
    turns: [
      { speaker: "Dr Allen", text: "So, Megan, Jason — thanks for coming in. How's the group presentation on renewable energy coming along?" },
      { speaker: "Megan", text: "Good progress, I think. We've decided to split it into three parts — solar, wind, and, um, geothermal." },
      { speaker: "Jason", text: "Yeah, and I've been assigned wind, Megan's doing solar, and Priya, who couldn't make it today, is covering geothermal." },
      { speaker: "Dr Allen", text: "Sounds sensible. How long is each section meant to be?" },
      { speaker: "Megan", text: "We're aiming for six minutes each, so eighteen minutes total, plus time for questions afterwards." },
      { speaker: "Dr Allen", text: "Good. Now, have you thought about visuals? A presentation on energy really benefits from diagrams." },
      { speaker: "Jason", text: "I was going to make a diagram showing how a wind turbine converts kinetic energy into electricity." },
      { speaker: "Dr Allen", text: "Excellent idea. Megan, what about you?" },
      { speaker: "Megan", text: "I want to include a graph comparing the cost of solar panels now versus ten years ago — I think it shows a really dramatic drop." },
      { speaker: "Dr Allen", text: "That'll work well. Just make sure you cite your source for that data — the International Energy Agency publishes exactly that kind of figure." },
      { speaker: "Megan", text: "Oh good, I'll look them up instead of the website I was using before." },
      { speaker: "Dr Allen", text: "When's the presentation actually due?" },
      { speaker: "Jason", text: "The fourteenth of November, in the two p.m. seminar." },
      { speaker: "Dr Allen", text: "Right, that gives you about three weeks. I'd suggest you send me a draft of your slides by the seventh, so I can give feedback before the final version." },
      { speaker: "Megan", text: "That works for us. Should we email it, or bring a printed copy?" },
      { speaker: "Dr Allen", text: "Email is fine — just send it as a PDF, not PowerPoint, in case the formatting shifts on a different computer." },
      { speaker: "Jason", text: "Will do. One more thing — is there a word limit on the handout we're supposed to give the class?" },
      { speaker: "Dr Allen", text: "Keep it to one side of A4 per section, so three sides total." },
      { speaker: "Megan", text: "Great, that's really helpful, thank you." },
      { speaker: "Dr Allen", text: "No problem — good luck, and I'll see that draft on the seventh." },
    ],
  },
  {
    id: '32000000-0000-0000-0000-000000000004',
    title: 'Urban Heat Islands: Causes and Solutions',
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
    transcript: `LECTURER: Good morning. Today's lecture looks at a phenomenon many of you will have experienced without realising it has a name: the urban heat island effect. Simply put, this is the tendency for cities to be significantly warmer than the surrounding rural areas, sometimes by as much as seven degrees Celsius on a still summer evening.

So what causes this temperature difference? The main culprit is materials. Concrete, asphalt, and dark roofing absorb solar radiation during the day and release it slowly as heat overnight, unlike vegetation and soil in rural areas, which reflect more sunlight and cool down faster after sunset. A second factor is the sheer density of buildings, which restricts airflow and traps warm air between structures — engineers sometimes call this the "canyon effect," because narrow streets lined with tall buildings behave a little like canyons trapping heat. A third contributor, often overlooked, is simply the heat generated directly by human activity — vehicle engines, air conditioning units, and industrial machinery all release waste heat into the surrounding air.

Now, this isn't just an issue of comfort. Urban heat islands have measurable consequences. Energy demand rises sharply in summer as more people run air conditioning, which in turn increases carbon emissions, creating something of a feedback loop. There are also serious health implications — a well-documented rise in heat-related illness, particularly among elderly residents, during prolonged hot spells in built-up areas.

Fortunately, urban planners have developed several strategies to reduce the effect. One widely adopted solution is the green roof, where rooftops are covered with vegetation instead of standard roofing material; this both insulates buildings and cools the surrounding air through a process called evapotranspiration. Another approach, gaining popularity in Mediterranean cities, is the use of reflective, light-coloured paving, sometimes referred to as "cool pavement," which can reduce surface temperatures by up to twenty degrees Celsius compared with standard dark asphalt. Increasing urban tree cover is a third strategy — beyond providing shade, trees also release moisture that cools the surrounding air.

Researchers are now trying to quantify exactly how effective these interventions are at a city-wide scale. One recent study modelling a mid-sized European city found that increasing tree cover by just ten percent could lower average summer temperatures by around one degree Celsius across the whole urban area — a small-sounding figure, but one that translates into a meaningful reduction in heat-related energy demand and hospital admissions. Ongoing research is now looking at whether combining several of these strategies together — green roofs, reflective paving, and expanded tree cover — might compound these benefits even further.`,
    turns: [
      { speaker: "Lecturer", text: "Good morning. Today's lecture looks at a phenomenon many of you will have experienced without realising it has a name: the urban heat island effect. Simply put, this is the tendency for cities to be significantly warmer than the surrounding rural areas, sometimes by as much as seven degrees Celsius on a still summer evening." },
      { speaker: "Lecturer", text: "So what causes this temperature difference? The main culprit is materials. Concrete, asphalt, and dark roofing absorb solar radiation during the day and release it slowly as heat overnight, unlike vegetation and soil in rural areas, which reflect more sunlight and cool down faster after sunset. A second factor is the sheer density of buildings, which restricts airflow and traps warm air between structures — engineers sometimes call this the \"canyon effect,\" because narrow streets lined with tall buildings behave a little like canyons trapping heat. A third contributor, often overlooked, is simply the heat generated directly by human activity — vehicle engines, air conditioning units, and industrial machinery all release waste heat into the surrounding air." },
      { speaker: "Lecturer", text: "Now, this isn't just an issue of comfort. Urban heat islands have measurable consequences. Energy demand rises sharply in summer as more people run air conditioning, which in turn increases carbon emissions, creating something of a feedback loop. There are also serious health implications — a well-documented rise in heat-related illness, particularly among elderly residents, during prolonged hot spells in built-up areas." },
      { speaker: "Lecturer", text: "Fortunately, urban planners have developed several strategies to reduce the effect. One widely adopted solution is the green roof, where rooftops are covered with vegetation instead of standard roofing material; this both insulates buildings and cools the surrounding air through a process called evapotranspiration. Another approach, gaining popularity in Mediterranean cities, is the use of reflective, light-coloured paving, sometimes referred to as \"cool pavement,\" which can reduce surface temperatures by up to twenty degrees Celsius compared with standard dark asphalt. Increasing urban tree cover is a third strategy — beyond providing shade, trees also release moisture that cools the surrounding air." },
      { speaker: "Lecturer", text: "Researchers are now trying to quantify exactly how effective these interventions are at a city-wide scale. One recent study modelling a mid-sized European city found that increasing tree cover by just ten percent could lower average summer temperatures by around one degree Celsius across the whole urban area — a small-sounding figure, but one that translates into a meaningful reduction in heat-related energy demand and hospital admissions. Ongoing research is now looking at whether combining several of these strategies together — green roofs, reflective paving, and expanded tree cover — might compound these benefits even further." },
    ],
  },
  // ---------- MOCK 4 ----------
  {
    id: '33000000-0000-0000-0000-000000000001',
    title: 'Booking a Weekend Anniversary Trip',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Agent": "a professional female booking agent in her 30s with a neutral British accent, efficient and courteous tone — introduces themselves as Karen in the call",
      "Customer": "a polite adult male customer in his 30s with a neutral British accent, natural relaxed conversational tone",
    },
    audioUrl: null,
    sectionNumber: 1,
    transcript: `AGENT: Good morning, Sunrise Travel, this is Karen speaking. How can I help you today?
CUSTOMER: Hi Karen, I'm hoping to book a weekend trip for my anniversary — somewhere with a coastal view, if possible.
AGENT: Lovely, congratulations. We actually have a package to Brightsea Bay that might suit you — three days, two nights, including breakfast.
CUSTOMER: That sounds perfect. What dates are available?
AGENT: We have availability from Friday the ninth of October, or the following weekend, the sixteenth.
CUSTOMER: Let's go with the ninth, then.
AGENT: Great. That package is two hundred and ten pounds per person, based on two people sharing a room.
CUSTOMER: Sounds reasonable. Does that include transport?
AGENT: Not the transport itself, no — you'd drive or take the train — but it does include a welcome bottle of wine and a late check-out at midday.
CUSTOMER: That's a nice touch. What's the hotel called?
AGENT: It's the Marbeck Hotel — that's M-A-R-B-E-C-K — right on the seafront.
CUSTOMER: Is breakfast the only meal included?
AGENT: Yes, but you can add an evening meal package for an extra thirty-five pounds per person, which covers a three-course dinner on the Saturday night.
CUSTOMER: We'll add that, actually — it is a special occasion.
AGENT: No problem, I'll note that down. Can I take a contact number in case we need to reach you?
CUSTOMER: Sure, it's oh-seven-nine-oh-three, double-four-one, two-two-six.
AGENT: Let me just check that back — oh-seven-nine-oh-three, four-four-one, two-two-six.
CUSTOMER: That's right.
AGENT: And finally, would you like to pay a full deposit now, or settle the whole balance?
CUSTOMER: I'll pay the deposit for now — how much is that?
AGENT: The deposit is fifty pounds, and the remaining balance is due four weeks before you travel.
CUSTOMER: Perfect, let's go ahead with that.`,
    turns: [
      { speaker: "Agent", text: "Good morning, Sunrise Travel, this is Karen speaking. How can I help you today?" },
      { speaker: "Customer", text: "Hi Karen, I'm hoping to book a weekend trip for my anniversary — somewhere with a coastal view, if possible." },
      { speaker: "Agent", text: "Lovely, congratulations. We actually have a package to Brightsea Bay that might suit you — three days, two nights, including breakfast." },
      { speaker: "Customer", text: "That sounds perfect. What dates are available?" },
      { speaker: "Agent", text: "We have availability from Friday the ninth of October, or the following weekend, the sixteenth." },
      { speaker: "Customer", text: "Let's go with the ninth, then." },
      { speaker: "Agent", text: "Great. That package is two hundred and ten pounds per person, based on two people sharing a room." },
      { speaker: "Customer", text: "Sounds reasonable. Does that include transport?" },
      { speaker: "Agent", text: "Not the transport itself, no — you'd drive or take the train — but it does include a welcome bottle of wine and a late check-out at midday." },
      { speaker: "Customer", text: "That's a nice touch. What's the hotel called?" },
      { speaker: "Agent", text: "It's the Marbeck Hotel — that's M-A-R-B-E-C-K — right on the seafront." },
      { speaker: "Customer", text: "Is breakfast the only meal included?" },
      { speaker: "Agent", text: "Yes, but you can add an evening meal package for an extra thirty-five pounds per person, which covers a three-course dinner on the Saturday night." },
      { speaker: "Customer", text: "We'll add that, actually — it is a special occasion." },
      { speaker: "Agent", text: "No problem, I'll note that down. Can I take a contact number in case we need to reach you?" },
      { speaker: "Customer", text: "Sure, it's oh-seven-nine-oh-three, double-four-one, two-two-six." },
      { speaker: "Agent", text: "Let me just check that back — oh-seven-nine-oh-three, four-four-one, two-two-six." },
      { speaker: "Customer", text: "That's right." },
      { speaker: "Agent", text: "And finally, would you like to pay a full deposit now, or settle the whole balance?" },
      { speaker: "Customer", text: "I'll pay the deposit for now — how much is that?" },
      { speaker: "Agent", text: "The deposit is fifty pounds, and the remaining balance is due four weeks before you travel." },
      { speaker: "Customer", text: "Perfect, let's go ahead with that." },
    ],
  },
  {
    id: '33000000-0000-0000-0000-000000000002',
    title: 'The Community Roots Volunteering Scheme',
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
    transcript: `HOST: Welcome back to Local Voices, the podcast about what's happening in our community. Today I want to tell you about a new scheme called Community Roots, which is looking for volunteers across four different projects.

The first project is the community garden on Elm Street, where volunteers help with planting and weeding — that one runs every Wednesday morning. No experience is needed, just enthusiasm and a willingness to get a bit muddy.

The second project is the book exchange at the old train station, which runs every Saturday afternoon. Volunteers there sort donated books and help organise a small lending library for commuters.

Third, there's a befriending scheme, where volunteers visit elderly residents once a week for a chat and a cup of tea — this one does require a background check, since it involves visiting people in their own homes.

And finally, the litter-picking group meets every second Sunday of the month, down by the river, and provides all the equipment you need — gloves, bags, and litter pickers.

If you're interested in any of these, sign-up is easy. You can register through the website, communityroots-dot-org, or call the coordinator, whose name is Ben, directly on nine-two-one-five, double-six-three.

There's no minimum time commitment, although the organisers do ask that once you commit to a slot, you try to give at least a month's notice if you need to stop.

One thing people often ask about is whether volunteering counts toward anything official — and yes, Community Roots provides a certificate after fifty hours of volunteering, which a lot of people use for university applications or on their CV.

Finally, a quick note on safety: all the outdoor projects — so that's the garden and the litter-picking group — ask volunteers to wear closed-toe shoes, and in colder months, the organisers recommend bringing your own gloves as well, just in case supplies run low.

That's Community Roots — have a look at the website if you're interested, and I'll be back next week with another local story.`,
    turns: [
      { speaker: "Host", text: "Welcome back to Local Voices, the podcast about what's happening in our community. Today I want to tell you about a new scheme called Community Roots, which is looking for volunteers across four different projects." },
      { speaker: "Host", text: "The first project is the community garden on Elm Street, where volunteers help with planting and weeding — that one runs every Wednesday morning. No experience is needed, just enthusiasm and a willingness to get a bit muddy." },
      { speaker: "Host", text: "The second project is the book exchange at the old train station, which runs every Saturday afternoon. Volunteers there sort donated books and help organise a small lending library for commuters." },
      { speaker: "Host", text: "Third, there's a befriending scheme, where volunteers visit elderly residents once a week for a chat and a cup of tea — this one does require a background check, since it involves visiting people in their own homes." },
      { speaker: "Host", text: "And finally, the litter-picking group meets every second Sunday of the month, down by the river, and provides all the equipment you need — gloves, bags, and litter pickers." },
      { speaker: "Host", text: "If you're interested in any of these, sign-up is easy. You can register through the website, communityroots-dot-org, or call the coordinator, whose name is Ben, directly on nine-two-one-five, double-six-three." },
      { speaker: "Host", text: "There's no minimum time commitment, although the organisers do ask that once you commit to a slot, you try to give at least a month's notice if you need to stop." },
      { speaker: "Host", text: "One thing people often ask about is whether volunteering counts toward anything official — and yes, Community Roots provides a certificate after fifty hours of volunteering, which a lot of people use for university applications or on their CV." },
      { speaker: "Host", text: "Finally, a quick note on safety: all the outdoor projects — so that's the garden and the litter-picking group — ask volunteers to wear closed-toe shoes, and in colder months, the organisers recommend bringing your own gloves as well, just in case supplies run low." },
      { speaker: "Host", text: "That's Community Roots — have a look at the website if you're interested, and I'll be back next week with another local story." },
    ],
  },
  {
    id: '33000000-0000-0000-0000-000000000003',
    title: 'Planning a Microplastics Research Project',
    audioSource: {
      kind: 'local_tts',
      provider: 'piper-tts (en_GB-vctk-medium)',
      license: 'CC-BY-4.0',
      sourceUrl: 'https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_GB/vctk/medium',
      attribution:
        'Voice synthesized locally with Piper TTS (MIT-licensed engine and voice model) using the en_GB-vctk-medium model, trained on the VCTK Corpus, © University of Edinburgh (CSTR), licensed CC BY 4.0.',
    },
    speakerPersonas: {
      "Dr Fielding": "an experienced male academic in his 40s-50s with a neutral British accent, calm, authoritative, and constructive tone",
      "Olivia": "a female university student in her early 20s with a neutral British accent, casual natural conversational tone",
      "Sam": "a male university student in his early 20s with a neutral British accent, casual natural conversational tone",
    },
    audioUrl: null,
    sectionNumber: 3,
    transcript: `DR FIELDING: Right, Olivia, Sam — let's talk through your research project on microplastics before the deadline creeps up on us.
OLIVIA: Yes, so we've decided to focus on comparing microplastic levels at three different sites along the River Aldwick.
SAM: We're calling them low-density, medium-density, and high-density sites, based on how built-up the surrounding area is.
DR FIELDING: Good framework. How will you actually be collecting your samples?
OLIVIA: We'll use a fine mesh net to filter one litre of water from each site, then dry the residue and examine it under a microscope.
DR FIELDING: And how many samples per site?
SAM: We're planning five samples per site, so fifteen in total, so that one unusual reading doesn't skew the results.
DR FIELDING: Sensible. When are you planning to collect the samples?
OLIVIA: We were thinking the twenty-third of this month, weather permitting, since we need calm conditions for consistent flow rates.
DR FIELDING: Good thinking. Now, who's responsible for which part of the write-up?
SAM: I'll write the methodology and results sections, and Olivia's doing the introduction and literature review.
OLIVIA: And we're splitting the discussion section between the two of us.
DR FIELDING: That works. Have you settled on a method for counting the particles once you're under the microscope?
SAM: We're going to use a grid-counting method, where we divide the slide into squares and count particles per square before scaling up.
DR FIELDING: That's a solid, recognised method. Just make sure you take photos as you go, in case anyone questions your counts later.
OLIVIA: Will do. One thing we're unsure about — do we need ethical approval for this, since it's environmental rather than involving people?
DR FIELDING: No, you won't need full ethics approval, but you will need a simple risk assessment for the fieldwork, since you'll be working near open water.
SAM: We can submit that alongside the proposal, then?
DR FIELDING: Yes, please have it in by the eighteenth, so I can sign it off before your fieldwork date.
OLIVIA: Perfect, thank you — that's really helpful.`,
    turns: [
      { speaker: "Dr Fielding", text: "Right, Olivia, Sam — let's talk through your research project on microplastics before the deadline creeps up on us." },
      { speaker: "Olivia", text: "Yes, so we've decided to focus on comparing microplastic levels at three different sites along the River Aldwick." },
      { speaker: "Sam", text: "We're calling them low-density, medium-density, and high-density sites, based on how built-up the surrounding area is." },
      { speaker: "Dr Fielding", text: "Good framework. How will you actually be collecting your samples?" },
      { speaker: "Olivia", text: "We'll use a fine mesh net to filter one litre of water from each site, then dry the residue and examine it under a microscope." },
      { speaker: "Dr Fielding", text: "And how many samples per site?" },
      { speaker: "Sam", text: "We're planning five samples per site, so fifteen in total, so that one unusual reading doesn't skew the results." },
      { speaker: "Dr Fielding", text: "Sensible. When are you planning to collect the samples?" },
      { speaker: "Olivia", text: "We were thinking the twenty-third of this month, weather permitting, since we need calm conditions for consistent flow rates." },
      { speaker: "Dr Fielding", text: "Good thinking. Now, who's responsible for which part of the write-up?" },
      { speaker: "Sam", text: "I'll write the methodology and results sections, and Olivia's doing the introduction and literature review." },
      { speaker: "Olivia", text: "And we're splitting the discussion section between the two of us." },
      { speaker: "Dr Fielding", text: "That works. Have you settled on a method for counting the particles once you're under the microscope?" },
      { speaker: "Sam", text: "We're going to use a grid-counting method, where we divide the slide into squares and count particles per square before scaling up." },
      { speaker: "Dr Fielding", text: "That's a solid, recognised method. Just make sure you take photos as you go, in case anyone questions your counts later." },
      { speaker: "Olivia", text: "Will do. One thing we're unsure about — do we need ethical approval for this, since it's environmental rather than involving people?" },
      { speaker: "Dr Fielding", text: "No, you won't need full ethics approval, but you will need a simple risk assessment for the fieldwork, since you'll be working near open water." },
      { speaker: "Sam", text: "We can submit that alongside the proposal, then?" },
      { speaker: "Dr Fielding", text: "Yes, please have it in by the eighteenth, so I can sign it off before your fieldwork date." },
      { speaker: "Olivia", text: "Perfect, thank you — that's really helpful." },
    ],
  },
  {
    id: '33000000-0000-0000-0000-000000000004',
    title: 'How Scientists Predict Volcanic Eruptions',
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
    transcript: `LECTURER: This morning I'd like to move from geology in the abstract to something with real, practical stakes: how scientists actually predict volcanic eruptions, and why, despite decades of research, prediction remains so difficult.

Let's start with the warning signs volcanologists look for. The most reliable indicator is seismic activity — as magma forces its way upward through cracks in the rock, it generates small earthquakes, often too weak to be felt by people nearby but easily detected by sensitive seismometers placed around a volcano. A sudden increase in the frequency of these tiny earthquakes is often the first sign that something is changing beneath the surface.

A second key indicator is ground deformation. As magma accumulates in a chamber beneath a volcano, it can literally push the surrounding rock outward, causing the ground surface to swell, sometimes by several centimetres. Scientists monitor this using GPS instruments and a satellite-based technique called InSAR, which can detect ground movement of just a few millimetres from space.

A third method involves gas monitoring. Before an eruption, volcanoes typically release increasing amounts of sulphur dioxide gas, which rises from the magma as pressure builds. Specialised instruments can measure this gas remotely, and a sharp spike in sulphur dioxide emissions is treated as a serious warning sign.

Despite these tools, predicting the exact timing of an eruption remains extremely challenging. Some volcanoes show all the warning signs and then don't erupt for months, or even years, while others erupt with comparatively little warning. Because of this uncertainty, scientists generally avoid making precise predictions and instead issue what's called a hazard alert level, usually on a colour-coded scale, which reflects the overall likelihood of an eruption rather than a specific date.

One particularly well-studied case is Mount St Helens in the United States, where, prior to its major eruption in 1980, scientists observed a dramatic bulge forming on the volcano's north face, growing at a rate of around one and a half metres per day in the weeks before the eruption. This case became a landmark in volcanology, demonstrating just how valuable ground deformation monitoring could be.

Looking ahead, researchers are increasingly combining multiple types of data — seismic, deformation, and gas measurements — using computer models that attempt to integrate all three data streams simultaneously. Early results suggest that this multi-parameter approach improves forecasting accuracy considerably compared with relying on any single indicator alone, although scientists are always careful to stress that no method can currently guarantee an exact eruption date.`,
    turns: [
      { speaker: "Lecturer", text: "This morning I'd like to move from geology in the abstract to something with real, practical stakes: how scientists actually predict volcanic eruptions, and why, despite decades of research, prediction remains so difficult." },
      { speaker: "Lecturer", text: "Let's start with the warning signs volcanologists look for. The most reliable indicator is seismic activity — as magma forces its way upward through cracks in the rock, it generates small earthquakes, often too weak to be felt by people nearby but easily detected by sensitive seismometers placed around a volcano. A sudden increase in the frequency of these tiny earthquakes is often the first sign that something is changing beneath the surface." },
      { speaker: "Lecturer", text: "A second key indicator is ground deformation. As magma accumulates in a chamber beneath a volcano, it can literally push the surrounding rock outward, causing the ground surface to swell, sometimes by several centimetres. Scientists monitor this using GPS instruments and a satellite-based technique called InSAR, which can detect ground movement of just a few millimetres from space." },
      { speaker: "Lecturer", text: "A third method involves gas monitoring. Before an eruption, volcanoes typically release increasing amounts of sulphur dioxide gas, which rises from the magma as pressure builds. Specialised instruments can measure this gas remotely, and a sharp spike in sulphur dioxide emissions is treated as a serious warning sign." },
      { speaker: "Lecturer", text: "Despite these tools, predicting the exact timing of an eruption remains extremely challenging. Some volcanoes show all the warning signs and then don't erupt for months, or even years, while others erupt with comparatively little warning. Because of this uncertainty, scientists generally avoid making precise predictions and instead issue what's called a hazard alert level, usually on a colour-coded scale, which reflects the overall likelihood of an eruption rather than a specific date." },
      { speaker: "Lecturer", text: "One particularly well-studied case is Mount St Helens in the United States, where, prior to its major eruption in 1980, scientists observed a dramatic bulge forming on the volcano's north face, growing at a rate of around one and a half metres per day in the weeks before the eruption. This case became a landmark in volcanology, demonstrating just how valuable ground deformation monitoring could be." },
      { speaker: "Lecturer", text: "Looking ahead, researchers are increasingly combining multiple types of data — seismic, deformation, and gas measurements — using computer models that attempt to integrate all three data streams simultaneously. Early results suggest that this multi-parameter approach improves forecasting accuracy considerably compared with relying on any single indicator alone, although scientists are always careful to stress that no method can currently guarantee an exact eruption date." },
    ],
  },
];

export const listeningQuestionsSet3: Question[] = [
  // ===================== MOCK 3 · SECTION 1 =====================
  { id: 'lq-m3-s1-1', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: "Course chosen: Beginners' ______", passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: 'Wheel Throwing', explanation: 'The staff member confirms "that\'s the Wheel Throwing course" after the caller says she has never done pottery before.', strategyNote: 'Note the two course names given at the start and match the one confirmed for a beginner.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 1, isPremium: false },
  { id: 'lq-m3-s1-2', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: 'Class time: ______ p.m. to 9 p.m.', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '7', explanation: 'The staff member says the course "runs from seven to nine p.m."', strategyNote: 'When a time range is given, the blank could be either the start or end time — read the prompt carefully before listening.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 2, isPremium: false },
  { id: 'lq-m3-s1-3', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.0,
    prompt: 'Course length: ______ weeks', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: ['8', 'eight'], explanation: 'The course runs "for eight weeks."', strategyNote: 'Course duration often follows the start date in a single sentence — keep listening past the date.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 3, isPremium: false },
  { id: 'lq-m3-s1-4', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Early-bird price: £______', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '95', explanation: 'The staff member self-corrects and says "there\'s an early-bird rate of ninety-five pounds."', strategyNote: 'Listen for self-corrections ("sorry, let me correct that") — the corrected figure, not the first one, is the answer.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m3-s1-5', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'What does the centre provide for the course?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000001',
    options: ['An apron', 'Clay and tools', 'A sponge', 'Storage lockers'],
    correctAnswer: 'Clay and tools', explanation: 'The staff member says "we provide the clay and all the tools," while the caller must bring her own apron.', strategyNote: 'Distinguish what the centre supplies from what the student must bring — the options mix both.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 5, isPremium: false },
  { id: 'lq-m3-s1-6', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.0,
    prompt: 'Address: 27 ______ Road', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: 'Hollyfield', explanation: 'The address is spelled out: "twenty-seven Hollyfield Road — that\'s H-O-L-L-Y-F-I-E-L-D."', strategyNote: 'When a word is spelled letter by letter, write down each letter as you hear it rather than guessing the spelling in advance.',
    tags: ['form_completion'], estimatedTimeSeconds: 50, orderIndex: 6, isPremium: false },
  { id: 'lq-m3-s1-7', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'How many cars does the car park behind the centre hold?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: ['10', 'ten'], explanation: 'The staff member says the car park "only holds about ten cars."', strategyNote: 'Approximate words like "about" or "around" still precede an exact number you need to write down.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 7, isPremium: false },
  { id: 'lq-m3-s1-8', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: "Staff member's name: ______", passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: 'Priya', explanation: 'She introduces herself as "Priya speaking" and later spells it "P-R-I-Y-A."', strategyNote: 'A name given at the very start of a call is often repeated and spelled later — use the spelling to confirm it.',
    tags: ['form_completion'], estimatedTimeSeconds: 35, orderIndex: 8, isPremium: false },
  { id: 'lq-m3-s1-9', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Maximum class size: ______ students', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: ['12', 'twelve'], explanation: 'The staff member says "we cap it at twelve students."', strategyNote: 'The word "cap" or "limit" signals a maximum-number answer is coming.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 9, isPremium: false },
  { id: 'lq-m3-s1-10', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'How does the caller decide to enrol?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000001',
    options: ['By calling back with card details', 'By enrolling online', 'By visiting in person', 'By posting a form'],
    correctAnswer: 'By enrolling online', explanation: 'The caller says "I\'ll do it online tonight, then" after being told both options.', strategyNote: 'When two options are offered, listen for the caller\'s own stated choice, not just what is available.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 45, orderIndex: 10, isPremium: false },

  // ===================== MOCK 3 · SECTION 2 =====================
  { id: 'lq-m3-s2-1', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: "The warden's name is ______.", passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'Tom', explanation: 'The speaker introduces himself: "My name\'s Tom, and I\'m the warden here."', strategyNote: 'The speaker\'s own name is usually given in the first sentence of an orientation talk.',
    tags: ['note_completion'], estimatedTimeSeconds: 35, orderIndex: 1, isPremium: false },
  { id: 'lq-m3-s2-2', skill: 'listening', questionType: 'matching_features', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Laundry room', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000002',
    options: ['Ground floor', 'First floor', 'Second floor', 'Third floor'],
    correctAnswer: 'Ground floor', explanation: 'The warden says "On the ground floor you\'ll find the laundry room and the common room."', strategyNote: 'For matching tasks, list all the floors/options first, then tick each off as its facility is mentioned — floors may be reused.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m3-s2-3', skill: 'listening', questionType: 'matching_features', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Study rooms', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000002',
    options: ['Ground floor', 'First floor', 'Second floor', 'Third floor'],
    correctAnswer: 'First floor', explanation: 'The warden says "The first floor has two study rooms, which are open twenty-four hours."', strategyNote: 'Options can be used more than once in a matching task, so do not assume each floor has only one answer.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 3, isPremium: false },
  { id: 'lq-m3-s2-4', skill: 'listening', questionType: 'matching_features', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: "Warden's office", passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000002',
    options: ['Ground floor', 'First floor', 'Second floor', 'Third floor'],
    correctAnswer: 'First floor', explanation: 'The warden adds, "my office is also on the first floor, room one-oh-four."', strategyNote: 'Listen for the word "also" — it often signals a second item sharing the same location just mentioned.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m3-s2-5', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Cost of replacing a lost key card: £______', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: '15', explanation: 'The warden says "if you do [lose it], replacing it costs fifteen pounds."', strategyNote: 'Conditional phrases ("if you do") often introduce the fact tested in the question.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 5, isPremium: false },
  { id: 'lq-m3-s2-6', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Cost of one laundry wash: £______', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: ['2.50', '2.5'], explanation: 'The warden states "one wash costs two pounds fifty."', strategyNote: 'Write amounts under a pound as decimals (2.50) unless the instructions ask for words.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 6, isPremium: false },
  { id: 'lq-m3-s2-7', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.0,
    prompt: 'Wifi password: ______', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'riverside24', explanation: 'The password is given and spelled: "R-I-V-E-R-S-I-D-E, then the number two-four."', strategyNote: 'Passwords mixing letters and numbers are often spelled out — write exactly what is spelled, with no spaces.',
    tags: ['form_completion'], estimatedTimeSeconds: 50, orderIndex: 7, isPremium: false },
  { id: 'lq-m3-s2-8', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Quiet hours: 11 p.m. to ______ a.m.', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: ['7', 'seven'], explanation: 'Quiet hours "run from eleven p.m. to seven a.m."', strategyNote: 'Only one number in the time range is blanked — check which end (start or finish) the prompt asks for.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 8, isPremium: false },
  { id: 'lq-m3-s2-9', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Where is the fire-alarm assembly point?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000002',
    options: ['The back courtyard', 'The front car park', 'The common room', 'The library'],
    correctAnswer: 'The front car park', explanation: 'The warden clarifies it is "the car park at the front of the building, not the courtyard round the back."', strategyNote: 'When a speaker explicitly rules out a wrong answer ("not the courtyard"), that distractor is designed to catch careless listeners.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 9, isPremium: false },
  { id: 'lq-m3-s2-10', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 5.0,
    prompt: 'On which day is the bin collected?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'Tuesday', explanation: 'The warden says "Bin collection is every Tuesday morning."', strategyNote: 'Day-of-the-week answers are common in note-taking tasks — listen for "every" as the cue word.',
    tags: ['short_answer'], estimatedTimeSeconds: 35, orderIndex: 10, isPremium: false },

  // ===================== MOCK 3 · SECTION 3 =====================
  { id: 'lq-m3-s3-1', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Megan', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000003',
    options: ['Solar power', 'Wind power', 'Geothermal energy'],
    correctAnswer: 'Solar power', explanation: 'Jason confirms "Megan\'s doing solar."', strategyNote: 'In multi-speaker matching tasks, listen for one speaker to summarise who is doing what.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false },
  { id: 'lq-m3-s3-2', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Jason', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000003',
    options: ['Solar power', 'Wind power', 'Geothermal energy'],
    correctAnswer: 'Wind power', explanation: 'Jason says "I\'ve been assigned wind."', strategyNote: 'Match names to topics as soon as each is mentioned rather than waiting until the end.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m3-s3-3', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Priya', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000003',
    options: ['Solar power', 'Wind power', 'Geothermal energy'],
    correctAnswer: 'Geothermal energy', explanation: 'Jason says Priya, who is absent, "is covering geothermal."', strategyNote: 'Do not assume the absent person has no answer — group tasks are still divided among everyone, including those not present.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 3, isPremium: false },
  { id: 'lq-m3-s3-4', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Total length of the presentation: ______ minutes', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['18', 'eighteen'], explanation: 'Megan says they are "aiming for six minutes each, so eighteen minutes total."', strategyNote: 'When a calculation is spoken aloud (6 x 3 = 18), the final stated total is the answer, not the per-section figure.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m3-s3-5', skill: 'listening', questionType: 'short_answer', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'What visual is Jason planning to create for his section?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['a diagram of a wind turbine', 'a wind turbine diagram'], explanation: 'Jason says he will make "a diagram showing how a wind turbine converts kinetic energy into electricity."', strategyNote: 'Keep your answer concise — a short phrase capturing the key noun is enough, not the full sentence.',
    tags: ['short_answer'], estimatedTimeSeconds: 50, orderIndex: 5, isPremium: false },
  { id: 'lq-m3-s3-6', skill: 'listening', questionType: 'note_completion', topic: 'Education', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Megan will cite data from the ______.', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: 'International Energy Agency', explanation: 'Dr Allen tells her "the International Energy Agency publishes exactly that kind of figure."', strategyNote: 'Organisation names are often introduced with "the," so listen closely for the full title that follows.',
    tags: ['note_completion'], estimatedTimeSeconds: 50, orderIndex: 6, isPremium: false },
  { id: 'lq-m3-s3-7', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Presentation date: the ______ of November', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['14th', 'fourteenth'], explanation: 'Jason says the presentation is "the fourteenth of November."', strategyNote: 'Ordinal numbers (fourteenth, seventh) are frequent in dates — practise recognising them quickly by ear.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 7, isPremium: false },
  { id: 'lq-m3-s3-8', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Draft slides are due by the ______', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['7th', 'seventh'], explanation: 'Dr Allen asks for a draft "by the seventh," which he repeats at the end of the conversation.', strategyNote: 'A date mentioned twice in a conversation is a strong signal it is the answer being tested.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 8, isPremium: false },
  { id: 'lq-m3-s3-9', skill: 'listening', questionType: 'multiple_choice', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'In what file format should the draft be sent?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000003',
    options: ['PowerPoint', 'PDF', 'Word document', 'Printed copy'],
    correctAnswer: 'PDF', explanation: 'Dr Allen says to "send it as a PDF, not PowerPoint, in case the formatting shifts."', strategyNote: 'When a speaker names a rejected option directly ("not PowerPoint"), that option becomes a distractor.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 45, orderIndex: 9, isPremium: false },
  { id: 'lq-m3-s3-10', skill: 'listening', questionType: 'note_completion', topic: 'Education', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Handout length: ______ side(s) of A4 per section', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['1', 'one'], explanation: 'Dr Allen says to "keep it to one side of A4 per section, so three sides total."', strategyNote: 'When two related numbers appear together (1 per section, 3 total), check exactly which one the prompt is asking for.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 10, isPremium: false },

  // ===================== MOCK 3 · SECTION 4 =====================
  { id: 'lq-m3-s4-1', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Cities can be up to ______ degrees Celsius warmer than surrounding rural areas.', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['7', 'seven'], explanation: 'The lecturer says cities can be warmer "by as much as seven degrees Celsius."', strategyNote: 'Introductory statistics in a lecture are often restated or emphasised — use the first mention to note the figure.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false },
  { id: 'lq-m3-s4-2', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'What term do engineers use for narrow streets lined with tall buildings that trap heat?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['canyon effect', 'the canyon effect'], explanation: 'The lecturer explains engineers "call this the \'canyon effect.\'"', strategyNote: 'Technical terms are often introduced with "call this" or "known as" — these phrases flag an exact-wording answer.',
    tags: ['short_answer'], estimatedTimeSeconds: 50, orderIndex: 2, isPremium: false },
  { id: 'lq-m3-s4-3', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Rising energy demand from air conditioning creates a ______ loop.', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'feedback', explanation: 'The lecturer says this "in turn increases carbon emissions, creating something of a feedback loop."', strategyNote: 'Cause-and-effect chains ("X leads to Y, which then causes X again") often end in the term "feedback loop."',
    tags: ['note_completion'], estimatedTimeSeconds: 50, orderIndex: 3, isPremium: false },
  { id: 'lq-m3-s4-4', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Who is most affected by heat-related illness according to the lecture?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000004',
    options: ['Young children', 'Elderly residents', 'Outdoor workers', 'Tourists'],
    correctAnswer: 'Elderly residents', explanation: 'The lecturer mentions "a well-documented rise in heat-related illness, particularly among elderly residents."', strategyNote: 'The word "particularly" often signals the specific group the question is testing.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m3-s4-5', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'A ______ roof is covered with vegetation instead of standard roofing material.', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'green', explanation: 'The lecturer describes "the green roof, where rooftops are covered with vegetation."', strategyNote: 'Compound terms like "green roof" are often defined immediately after being named — use the definition to confirm your spelling.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 5, isPremium: false },
  { id: 'lq-m3-s4-6', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Reflective, light-coloured paving is also known as ______ pavement.', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'cool', explanation: 'The lecturer says this is "sometimes referred to as \'cool pavement.\'"', strategyNote: '"Also known as" or "referred to as" introduces an alternative name — this is a common note-completion trap testing terminology.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 6, isPremium: false },
  { id: 'lq-m3-s4-7', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Cool pavement can reduce surface temperatures by up to ______ degrees Celsius.', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['20', 'twenty'], explanation: 'The lecturer says it "can reduce surface temperatures by up to twenty degrees Celsius."', strategyNote: 'Two temperature figures appear in this lecture (7 and 20 degrees) — check which strategy the question refers to before answering.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 7, isPremium: false },
  { id: 'lq-m3-s4-8', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Besides providing shade, what do trees release that cools the surrounding air?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'moisture', explanation: 'The lecturer says "trees also release moisture that cools the surrounding air."', strategyNote: 'The word "besides" or "beyond" in the question mirrors the same word in the transcript — use it to locate the exact answer.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 8, isPremium: false },
  { id: 'lq-m3-s4-9', skill: 'listening', questionType: 'summary_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: 'A ten percent increase in tree cover could lower average summer temperatures by around ______ degree(s) Celsius.', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['1', 'one'], explanation: 'The study found "increasing tree cover by just ten percent could lower average summer temperatures by around one degree Celsius."', strategyNote: 'In the final paragraph of a lecture, be ready for a dense sentence combining two figures — isolate the one the blank asks for.',
    tags: ['summary_completion'], estimatedTimeSeconds: 55, orderIndex: 9, isPremium: false },
  { id: 'lq-m3-s4-10', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: 'What are researchers currently investigating, according to the final paragraph?', passageId: null, listeningTrackId: '32000000-0000-0000-0000-000000000004',
    options: [
      'Whether cities should ban air conditioning',
      'Whether combining several strategies might compound their benefits',
      'Whether green roofs are cheaper than cool pavement',
      'Whether rural areas also need cooling strategies',
    ],
    correctAnswer: 'Whether combining several strategies might compound their benefits',
    explanation: 'The lecture ends by noting research is looking at "whether combining several of these strategies together...might compound these benefits even further."',
    strategyNote: 'The concluding sentence of an academic lecture often previews future research — expect an inference-style question here.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 55, orderIndex: 10, isPremium: false },

  // ===================== MOCK 4 · SECTION 1 =====================
  { id: 'lq-m4-s1-1', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: 'Destination: ______ Bay', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: 'Brightsea', explanation: 'The agent offers "a package to Brightsea Bay."', strategyNote: 'Place names are often introduced right after the customer states their preference — listen immediately after the request.',
    tags: ['form_completion'], estimatedTimeSeconds: 35, orderIndex: 1, isPremium: false },
  { id: 'lq-m4-s1-2', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: 'Package length: ______ nights', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: ['2', 'two'], explanation: 'The agent describes it as "three days, two nights, including breakfast."', strategyNote: 'Packages are often described as "X days, Y nights" — make sure you write the number that matches the unit asked for (days vs nights).',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 2, isPremium: false },
  { id: 'lq-m4-s1-3', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.0,
    prompt: 'Departure date chosen: Friday the ______ of October', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: ['9th', 'ninth'], explanation: 'The customer confirms "Let\'s go with the ninth, then," after being offered the ninth or the sixteenth.', strategyNote: 'When two dates are offered, listen for the customer\'s final decision, not the first date mentioned.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 3, isPremium: false },
  { id: 'lq-m4-s1-4', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Price per person: £______', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '210', explanation: 'The agent says "that package is two hundred and ten pounds per person."', strategyNote: 'Three-digit prices are often spoken as "X hundred and Y" — practise converting this quickly to digits.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 4, isPremium: false },
  { id: 'lq-m4-s1-5', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'What is included in the basic package besides breakfast?', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000001',
    options: ['Return train tickets', 'A welcome bottle of wine and late check-out', 'An evening meal', 'Airport transfer'],
    correctAnswer: 'A welcome bottle of wine and late check-out', explanation: 'The agent says the package "does include a welcome bottle of wine and a late check-out at midday."', strategyNote: 'Listen for "does include" following a "not included" statement — it signals what is actually covered.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 50, orderIndex: 5, isPremium: false },
  { id: 'lq-m4-s1-6', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.0,
    prompt: 'Hotel name: The ______ Hotel', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: 'Marbeck', explanation: 'The hotel is named and spelled: "the Marbeck Hotel — that\'s M-A-R-B-E-C-K."', strategyNote: 'Uncommon hotel or business names are usually spelled out immediately after being said for the first time.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 6, isPremium: false },
  { id: 'lq-m4-s1-7', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Cost of the evening meal package per person: £______', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '35', explanation: 'The agent says the meal package is "an extra thirty-five pounds per person."', strategyNote: 'Optional extras are usually priced separately from the base package — do not confuse the two figures.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 7, isPremium: false },
  { id: 'lq-m4-s1-8', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Contact number: 07903 ______ 226', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '441', explanation: 'The customer says "oh-seven-nine-oh-three, double-four-one, two-two-six," which the agent repeats as "four-four-one."', strategyNote: 'When a number is read back for confirmation, use the repeated version to check your answer — it corrects any mishearing of "double" digits.',
    tags: ['form_completion'], estimatedTimeSeconds: 50, orderIndex: 8, isPremium: false },
  { id: 'lq-m4-s1-9', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Deposit amount: £______', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: '50', explanation: 'The agent states "the deposit is fifty pounds."', strategyNote: 'Deposit and balance figures often appear together — keep them in separate notes as you listen.',
    tags: ['form_completion'], estimatedTimeSeconds: 35, orderIndex: 9, isPremium: false },
  { id: 'lq-m4-s1-10', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'The remaining balance is due ______ weeks before travel.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000001', options: null,
    correctAnswer: ['4', 'four'], explanation: 'The agent says "the remaining balance is due four weeks before you travel."', strategyNote: '"Before" and "after" time expressions are easy to mishear — note which direction the number applies to.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 10, isPremium: false },

  // ===================== MOCK 4 · SECTION 2 =====================
  { id: 'lq-m4-s2-1', skill: 'listening', questionType: 'matching_features', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Community garden', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000002',
    options: ['Runs on Wednesday mornings', 'Runs on Saturday afternoons', 'Requires a background check', 'Meets every second Sunday'],
    correctAnswer: 'Runs on Wednesday mornings', explanation: 'The host says the community garden project "runs every Wednesday morning."', strategyNote: 'Read all four options before listening so you can match each project the moment its detail is spoken.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 1, isPremium: false },
  { id: 'lq-m4-s2-2', skill: 'listening', questionType: 'matching_features', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Book exchange', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000002',
    options: ['Runs on Wednesday mornings', 'Runs on Saturday afternoons', 'Requires a background check', 'Meets every second Sunday'],
    correctAnswer: 'Runs on Saturday afternoons', explanation: 'The host says the book exchange "runs every Saturday afternoon."', strategyNote: 'The four projects are described in a fixed order — track them in that same order to avoid losing your place.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 2, isPremium: false },
  { id: 'lq-m4-s2-3', skill: 'listening', questionType: 'matching_features', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Befriending scheme', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000002',
    options: ['Runs on Wednesday mornings', 'Runs on Saturday afternoons', 'Requires a background check', 'Meets every second Sunday'],
    correctAnswer: 'Requires a background check', explanation: 'The host notes the befriending scheme "does require a background check, since it involves visiting people in their own homes."', strategyNote: 'Look out for a project described differently from the others (no fixed day) — its distinguishing detail is usually the answer.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 3, isPremium: false },
  { id: 'lq-m4-s2-4', skill: 'listening', questionType: 'matching_features', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Litter-picking group', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000002',
    options: ['Runs on Wednesday mornings', 'Runs on Saturday afternoons', 'Requires a background check', 'Meets every second Sunday'],
    correctAnswer: 'Meets every second Sunday', explanation: 'The host says the litter-picking group "meets every second Sunday of the month."', strategyNote: 'The last item in a described list is often the easiest to catch since it comes right before a topic change.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m4-s2-5', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'easy', estimatedBand: 4.5,
    prompt: "Coordinator's name: ______", passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: 'Ben', explanation: 'The host says to "call the coordinator, whose name is Ben, directly."', strategyNote: 'Common single-syllable names like "Ben" are easy to miss in fast speech — listen for the phrase "whose name is."',
    tags: ['form_completion'], estimatedTimeSeconds: 35, orderIndex: 5, isPremium: false },
  { id: 'lq-m4-s2-6', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.0,
    prompt: "Coordinator's phone number: 9215 ______", passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: '663', explanation: 'The number given is "nine-two-one-five, double-six-three," meaning the final digits are 663.', strategyNote: '"Double" before a digit means that digit is said twice — "double-six-three" is 6, 6, 3.',
    tags: ['form_completion'], estimatedTimeSeconds: 50, orderIndex: 6, isPremium: false },
  { id: 'lq-m4-s2-7', skill: 'listening', questionType: 'note_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'Volunteers must give at least a ______ notice before stopping.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: ["month's", 'month', "one month's"], explanation: 'The host says organisers "ask that once you commit to a slot, you try to give at least a month\'s notice."', strategyNote: 'Listen for time-period phrases like "a month\'s notice" — these are common in commitment or cancellation policies.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 7, isPremium: false },
  { id: 'lq-m4-s2-8', skill: 'listening', questionType: 'form_completion', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 5.5,
    prompt: 'A certificate is provided after ______ hours of volunteering.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: ['50', 'fifty'], explanation: 'The host says "Community Roots provides a certificate after fifty hours of volunteering."', strategyNote: 'Round numbers like fifty are easy to mishear as fifteen — listen carefully to the second syllable.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 8, isPremium: false },
  { id: 'lq-m4-s2-9', skill: 'listening', questionType: 'multiple_choice', topic: 'Everyday life', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Which two projects require volunteers to wear closed-toe shoes?', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000002',
    options: ['The book exchange and the befriending scheme', 'The garden and the litter-picking group', 'The garden and the book exchange', 'All four projects'],
    correctAnswer: 'The garden and the litter-picking group', explanation: 'The host says "all the outdoor projects — so that\'s the garden and the litter-picking group — ask volunteers to wear closed-toe shoes."', strategyNote: 'When a speaker says "that\'s" followed by a list, they are clarifying an earlier general term ("outdoor projects") — listen for that clarification.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 55, orderIndex: 9, isPremium: false },
  { id: 'lq-m4-s2-10', skill: 'listening', questionType: 'short_answer', topic: 'Everyday life', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'What does the coordinator recommend volunteers bring in colder months?', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000002', options: null,
    correctAnswer: ['gloves', 'their own gloves'], explanation: 'The host says "in colder months, the organisers recommend bringing your own gloves as well."', strategyNote: 'Seasonal advice often comes at the very end of a talk — stay focused through the closing remarks.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 10, isPremium: false },

  // ===================== MOCK 4 · SECTION 3 =====================
  { id: 'lq-m4-s3-1', skill: 'listening', questionType: 'note_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'The research compares microplastic levels at ______ different sites.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['3', 'three'], explanation: 'Olivia says they are "comparing microplastic levels at three different sites along the River Aldwick."', strategyNote: 'The number of sites/samples is often given early — note it immediately as a reference point for later questions.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 1, isPremium: false },
  { id: 'lq-m4-s3-2', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Sample collection method: a fine ______ net', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: 'mesh', explanation: 'Olivia says "we\'ll use a fine mesh net to filter one litre of water."', strategyNote: 'Equipment descriptions in methodology sections are often a single adjective + noun — listen for the adjective before the object.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 2, isPremium: false },
  { id: 'lq-m4-s3-3', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Number of samples per site: ______', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['5', 'five'], explanation: 'Sam says "we\'re planning five samples per site, so fifteen in total."', strategyNote: 'Distinguish "per site" figures from "total" figures — this transcript states both close together.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 3, isPremium: false },
  { id: 'lq-m4-s3-4', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Total number of samples: ______', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['15', 'fifteen'], explanation: 'Sam states the total is "fifteen in total, so that one unusual reading doesn\'t skew the results."', strategyNote: 'When a total follows a per-unit figure, IELTS often tests both numbers as separate questions — do not assume they are the same answer.',
    tags: ['form_completion'], estimatedTimeSeconds: 40, orderIndex: 4, isPremium: false },
  { id: 'lq-m4-s3-5', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'hard', estimatedBand: 6.5,
    prompt: 'Planned collection date: the ______ of this month', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['23rd', 'twenty-third'], explanation: 'Olivia says "we were thinking the twenty-third of this month, weather permitting."', strategyNote: 'Phrases like "weather permitting" often follow the key date — do not let the qualifier distract you from the number just given.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 5, isPremium: false },
  { id: 'lq-m4-s3-6', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Methodology and results sections', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000003',
    options: ['Olivia', 'Sam', 'Both'],
    correctAnswer: 'Sam', explanation: 'Sam says "I\'ll write the methodology and results sections."', strategyNote: 'When two people are assigned different sections, listen for "I\'ll" as the clearest ownership marker.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 6, isPremium: false },
  { id: 'lq-m4-s3-7', skill: 'listening', questionType: 'matching_features', topic: 'Education', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Introduction and literature review', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000003',
    options: ['Olivia', 'Sam', 'Both'],
    correctAnswer: 'Olivia', explanation: "Sam adds that \"Olivia's doing the introduction and literature review.\"", strategyNote: 'A speaker naming another person\'s task ("Olivia\'s doing...") is just as reliable a cue as self-assignment.',
    tags: ['matching_features'], estimatedTimeSeconds: 45, orderIndex: 7, isPremium: false },
  { id: 'lq-m4-s3-8', skill: 'listening', questionType: 'short_answer', topic: 'Education', difficulty: 'medium', estimatedBand: 6.0,
    prompt: 'Who is responsible for the discussion section?', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['both', 'both of them', 'Olivia and Sam'], explanation: 'Olivia says "we\'re splitting the discussion section between the two of us."', strategyNote: 'Not every task in a matching-style conversation has a single owner — listen for shared responsibilities described with "between" or "both."',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 8, isPremium: false },
  { id: 'lq-m4-s3-9', skill: 'listening', questionType: 'note_completion', topic: 'Education', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'The particle-counting method is called the ______ method.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: 'grid-counting', explanation: 'Sam says "we\'re going to use a grid-counting method, where we divide the slide into squares."', strategyNote: 'Hyphenated technical terms are often defined in the same breath — the explanation that follows can confirm your spelling.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 9, isPremium: false },
  { id: 'lq-m4-s3-10', skill: 'listening', questionType: 'form_completion', topic: 'Education', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'The risk assessment must be submitted by the ______.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000003', options: null,
    correctAnswer: ['18th', 'eighteenth'], explanation: 'Dr Fielding says "please have it in by the eighteenth, so I can sign it off before your fieldwork date."', strategyNote: 'Deadlines given by a supervisor near the end of a conversation are a very common source of the final question in Section 3.',
    tags: ['form_completion'], estimatedTimeSeconds: 45, orderIndex: 10, isPremium: false },

  // ===================== MOCK 4 · SECTION 4 =====================
  { id: 'lq-m4-s4-1', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'The most reliable early indicator of volcanic activity is ______ activity.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'seismic', explanation: 'The lecturer states "the most reliable indicator is seismic activity."', strategyNote: 'A lecture that lists several indicators usually states which one is "most reliable" or "most important" first — note this ranking word.',
    tags: ['note_completion'], estimatedTimeSeconds: 40, orderIndex: 1, isPremium: false },
  { id: 'lq-m4-s4-2', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'What instrument detects the small earthquakes caused by rising magma?', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['seismometers', 'seismometer'], explanation: 'The lecturer says these earthquakes are "easily detected by sensitive seismometers placed around a volcano."', strategyNote: 'Instrument names often follow the phrase "detected by" or "measured by" in a science lecture.',
    tags: ['short_answer'], estimatedTimeSeconds: 40, orderIndex: 2, isPremium: false },
  { id: 'lq-m4-s4-3', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'As magma accumulates, the ground surface can ______, sometimes by several centimetres.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'swell', explanation: 'The lecturer explains magma "can literally push the surrounding rock outward, causing the ground surface to swell."', strategyNote: 'Verbs describing physical change (swell, bulge, expand) are common note-completion answers in science lectures — listen for the verb right after "causing."',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 3, isPremium: false },
  { id: 'lq-m4-s4-4', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'The satellite-based technique used to detect ground movement is called ______.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'InSAR', explanation: 'The lecturer names "a satellite-based technique called InSAR, which can detect ground movement of just a few millimetres from space."', strategyNote: 'Acronyms in academic lectures are usually spoken clearly and only once — be ready to catch them the first time.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 4, isPremium: false },
  { id: 'lq-m4-s4-5', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'medium', estimatedBand: 6.5,
    prompt: 'Before an eruption, volcanoes release increasing amounts of ______ gas.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: 'sulphur dioxide', explanation: 'The lecturer says volcanoes "typically release increasing amounts of sulphur dioxide gas."', strategyNote: 'Chemical names are frequently tested — practise recognising "sulphur dioxide" by ear as it is easy to confuse with similar terms.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 5, isPremium: false },
  { id: 'lq-m4-s4-6', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Why do scientists generally avoid giving precise eruption predictions?', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000004',
    options: [
      'Because seismometers are too expensive to install widely',
      'Because volcanoes showing warning signs may not erupt for months or years',
      'Because governments do not allow public warnings',
      'Because gas monitoring equipment is unreliable',
    ],
    correctAnswer: 'Because volcanoes showing warning signs may not erupt for months or years',
    explanation: 'The lecturer explains that "some volcanoes show all the warning signs and then don\'t erupt for months, or even years," which is why precise predictions are avoided.',
    strategyNote: 'For "why" questions in a lecture, listen for the reasoning clause immediately before or after the word "because" or "since."',
    tags: ['multiple_choice'], estimatedTimeSeconds: 55, orderIndex: 6, isPremium: false },
  { id: 'lq-m4-s4-7', skill: 'listening', questionType: 'note_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.0,
    prompt: 'Instead of exact predictions, scientists issue a colour-coded ______ level.', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['hazard alert', 'hazard alert level'], explanation: 'The lecturer says scientists "issue what\'s called a hazard alert level, usually on a colour-coded scale."', strategyNote: 'Terms defined with "what\'s called" are a strong signal of an exact-answer gap-fill.',
    tags: ['note_completion'], estimatedTimeSeconds: 45, orderIndex: 7, isPremium: false },
  { id: 'lq-m4-s4-8', skill: 'listening', questionType: 'form_completion', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: "Before its 1980 eruption, Mount St Helens' north face bulged at around ______ metres per day.", passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['1.5', 'one and a half'], explanation: 'The lecturer says the bulge grew "at a rate of around one and a half metres per day in the weeks before the eruption."', strategyNote: 'Fractional numbers ("one and a half") should usually be written as a decimal (1.5) unless told otherwise.',
    tags: ['form_completion'], estimatedTimeSeconds: 50, orderIndex: 8, isPremium: false },
  { id: 'lq-m4-s4-9', skill: 'listening', questionType: 'short_answer', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 7.5,
    prompt: 'What three types of data are combined in modern eruption-forecasting models?', passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000004', options: null,
    correctAnswer: ['seismic, deformation, and gas measurements', 'seismic, deformation and gas'], explanation: 'The lecturer says researchers are "combining multiple types of data — seismic, deformation, and gas measurements."', strategyNote: 'When a lecture recaps several earlier points in one list near the end, match each item back to what was explained in detail earlier.',
    tags: ['short_answer'], estimatedTimeSeconds: 50, orderIndex: 9, isPremium: false },
  { id: 'lq-m4-s4-10', skill: 'listening', questionType: 'multiple_choice', topic: 'Academic lecture', difficulty: 'hard', estimatedBand: 8.0,
    prompt: "What do researchers say about the multi-parameter approach, according to the lecture's conclusion?", passageId: null, listeningTrackId: '33000000-0000-0000-0000-000000000004',
    options: [
      'It guarantees an exact eruption date',
      'It improves forecasting accuracy but cannot guarantee an exact date',
      'It has not improved forecasting at all',
      'It only works for Mount St Helens',
    ],
    correctAnswer: 'It improves forecasting accuracy but cannot guarantee an exact date',
    explanation: 'The lecture concludes that the approach "improves forecasting accuracy considerably...although scientists are always careful to stress that no method can currently guarantee an exact eruption date."',
    strategyNote: 'Concluding sentences with "although" often contain a balanced view — make sure your chosen option reflects both halves of the statement, not just one.',
    tags: ['multiple_choice'], estimatedTimeSeconds: 55, orderIndex: 10, isPremium: false },
];
