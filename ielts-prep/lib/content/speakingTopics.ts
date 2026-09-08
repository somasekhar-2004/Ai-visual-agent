import type { SpeakingTopic } from '@/types/models';

export const speakingTopics: SpeakingTopic[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    part: 'part1',
    groupId: 'group-hometown-travel',
    topicCategory: 'Hometown',
    cueCardText: null,
    questions: [
      'Where is your hometown?',
      'What do you like most about your hometown?',
      'Has your hometown changed much since you were a child?',
      'Would you like to continue living there in the future?',
    ],
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    part: 'part1',
    groupId: 'group-hobbies-skills',
    topicCategory: 'Hobbies',
    cueCardText: null,
    questions: [
      'What do you like to do in your free time?',
      'Is this something you have enjoyed since childhood?',
      'Do you prefer hobbies you do alone or with other people?',
      'Would you like to try a new hobby in the future?',
    ],
  },
  {
    id: '50000000-0000-0000-0000-000000000003',
    part: 'part2',
    groupId: 'group-hometown-travel',
    topicCategory: 'A memorable trip',
    cueCardText:
      'Describe a memorable trip you have been on. You should say: where you went, who you went with, what you did there, and explain why this trip was memorable for you.',
    questions: ['Describe a memorable trip you have been on.'],
  },
  {
    id: '50000000-0000-0000-0000-000000000004',
    part: 'part2',
    groupId: 'group-hobbies-skills',
    topicCategory: 'A skill you would like to learn',
    cueCardText:
      'Describe a skill you would like to learn. You should say: what the skill is, why you want to learn it, how you would learn it, and explain how learning this skill would help you.',
    questions: ['Describe a skill you would like to learn.'],
  },
  {
    id: '50000000-0000-0000-0000-000000000005',
    part: 'part3',
    groupId: 'group-hometown-travel',
    topicCategory: 'Travel and tourism',
    cueCardText: null,
    questions: [
      'How has tourism changed in your country over the last twenty years?',
      'What are the benefits and drawbacks of tourism for a local economy?',
      'Do you think international travel will become more or less common in the future? Why?',
      'Some people say travelling abroad is more valuable than studying it in books — do you agree?',
    ],
  },
  {
    id: '50000000-0000-0000-0000-000000000006',
    part: 'part3',
    groupId: 'group-hobbies-skills',
    topicCategory: 'Skills and education',
    cueCardText: null,
    questions: [
      'Do you think schools should teach practical skills alongside academic subjects?',
      'How has the internet changed the way people learn new skills?',
      'Is it more difficult for adults to learn new skills than for children? Why?',
      'What skills do you think will become more important in the next twenty years?',
    ],
  },

  // Group 1: A person you admire
  {
    id: "52000000-0000-0000-0000-000000000001",
    part: "part1",
    groupId: "group-person-admire",
    topicCategory: "People you admire",
    cueCardText: null,
    questions: [
      "Who is someone you admire?",
      "Why do you admire this person?",
      "Do you know any people in your daily life whom you admire?",
      "Has the person you admire changed over the years?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000002",
    part: "part2",
    groupId: "group-person-admire",
    topicCategory: "A person you admire",
    cueCardText:
      "Describe a person you admire. You should say: who this person is, how you know this person, what qualities this person has, and explain why you admire this person.",
    questions: ["Describe a person you admire."],
  },
  {
    id: "52000000-0000-0000-0000-000000000003",
    part: "part3",
    groupId: "group-person-admire",
    topicCategory: "Role models and influence",
    cueCardText: null,
    questions: [
      "What qualities make someone a good role model?",
      "Do you think celebrities are good role models for young people nowadays?",
      "Why do some people prefer to admire ordinary people rather than famous figures?",
      "How can positive role models influence a whole society?",
    ],
  },

  // Group 2: A family member you are close to
  {
    id: "52000000-0000-0000-0000-000000000004",
    part: "part1",
    groupId: "group-family-member",
    topicCategory: "Family",
    cueCardText: null,
    questions: [
      "Who are the members of your family?",
      "Which family member are you closest to?",
      "Do you often spend time with your family?",
      "How important is family to people in your country?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000005",
    part: "part2",
    groupId: "group-family-member",
    topicCategory: "A family member you are close to",
    cueCardText:
      "Describe a family member you are close to. You should say: who this person is, how long you have known them, what you usually do together, and explain why you are close to this person.",
    questions: ["Describe a family member you are close to."],
  },
  {
    id: "52000000-0000-0000-0000-000000000006",
    part: "part3",
    groupId: "group-family-member",
    topicCategory: "Family relationships in society",
    cueCardText: null,
    questions: [
      "How have family structures changed in your country in recent years?",
      "What are the benefits of having a close relationship with family members?",
      "Do you think people today spend less time with their families than in the past?",
      "Should elderly parents live with their adult children, or is it better for them to live independently?",
    ],
  },

  // Group 3: A friend who has influenced you
  {
    id: "52000000-0000-0000-0000-000000000007",
    part: "part1",
    groupId: "group-friend-influence",
    topicCategory: "Friendship",
    cueCardText: null,
    questions: [
      "Do you have a close friend?",
      "How did you meet your closest friend?",
      "What do you usually do together with your friends?",
      "Do you think it is important to have many friends?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000008",
    part: "part2",
    groupId: "group-friend-influence",
    topicCategory: "A friend who has influenced you",
    cueCardText:
      "Describe a friend who has influenced you. You should say: who this friend is, how you met, what this friend does or has done, and explain how this friend has influenced you.",
    questions: ["Describe a friend who has influenced you."],
  },
  {
    id: "52000000-0000-0000-0000-000000000009",
    part: "part3",
    groupId: "group-friend-influence",
    topicCategory: "Friendship and social relationships",
    cueCardText: null,
    questions: [
      "What makes a good friend?",
      "How have technology and social media changed the way people make friends?",
      "Do you think friendships formed online are as strong as those formed in person?",
      "Why do some friendships last a lifetime while others do not?",
    ],
  },

  // Group 4: A teacher who influenced you
  {
    id: "52000000-0000-0000-0000-000000000010",
    part: "part1",
    groupId: "group-teacher-influence",
    topicCategory: "School and teachers",
    cueCardText: null,
    questions: [
      "Did you have a favourite teacher at school?",
      "What subjects did you enjoy studying at school?",
      "Do you keep in touch with any of your former teachers?",
      "What qualities make a good teacher, in your opinion?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000011",
    part: "part2",
    groupId: "group-teacher-influence",
    topicCategory: "A teacher who influenced you",
    cueCardText:
      "Describe a teacher who influenced you. You should say: who this teacher was, what subject they taught, what made them memorable, and explain how this teacher influenced you.",
    questions: ["Describe a teacher who influenced you."],
  },
  {
    id: "52000000-0000-0000-0000-000000000012",
    part: "part3",
    groupId: "group-teacher-influence",
    topicCategory: "Education and the role of teachers",
    cueCardText: null,
    questions: [
      "What qualities should a good teacher have?",
      "How has the role of teachers changed with the growth of online learning?",
      "Do you think teachers deserve more respect and higher salaries in society?",
      "Can technology ever fully replace teachers in the classroom?",
    ],
  },

  // Group 5: A leader you respect
  {
    id: "52000000-0000-0000-0000-000000000013",
    part: "part1",
    groupId: "group-leader-respect",
    topicCategory: "Leadership",
    cueCardText: null,
    questions: [
      "Do you follow news about political or community leaders?",
      "What kind of leader do you respect?",
      "Have you ever had to lead a group of people?",
      "Do you think leadership skills can be taught?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000014",
    part: "part2",
    groupId: "group-leader-respect",
    topicCategory: "A leader you respect",
    cueCardText:
      "Describe a leader you respect. You should say: who this leader is, what they have done, what qualities they have, and explain why you respect this leader.",
    questions: ["Describe a leader you respect."],
  },
  {
    id: "52000000-0000-0000-0000-000000000015",
    part: "part3",
    groupId: "group-leader-respect",
    topicCategory: "Leadership in society",
    cueCardText: null,
    questions: [
      "What qualities make an effective leader?",
      "Do you think good leaders are born or made?",
      "How does leadership in business differ from leadership in politics?",
      "Why do some countries struggle to find effective leaders?",
    ],
  },

  // Group 6: A place you would like to visit
  {
    id: "52000000-0000-0000-0000-000000000016",
    part: "part1",
    groupId: "group-place-visit-wish",
    topicCategory: "Travel plans",
    cueCardText: null,
    questions: [
      "Do you enjoy travelling to new places?",
      "What is your favourite place to visit in your own country?",
      "How do you usually plan a trip?",
      "Do you prefer travelling alone or with other people?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000017",
    part: "part2",
    groupId: "group-place-visit-wish",
    topicCategory: "A place you would like to visit",
    cueCardText:
      "Describe a place you would like to visit in the future. You should say: where this place is, how you learned about it, what you would like to do there, and explain why you would like to visit this place.",
    questions: ["Describe a place you would like to visit in the future."],
  },
  {
    id: "52000000-0000-0000-0000-000000000018",
    part: "part3",
    groupId: "group-place-visit-wish",
    topicCategory: "Travel planning and tourism choices",
    cueCardText: null,
    questions: [
      "What factors do people usually consider when choosing a holiday destination?",
      "How has the internet changed the way people plan their travels?",
      "Do you think it is better to travel to well-known destinations or to less popular places?",
      "What impact does tourism have on the culture of a destination?",
    ],
  },

  // Group 7: A city you lived in
  {
    id: "52000000-0000-0000-0000-000000000019",
    part: "part1",
    groupId: "group-city-lived",
    topicCategory: "Where you live",
    cueCardText: null,
    questions: [
      "What city do you currently live in?",
      "What do you like about living in this city?",
      "Is public transport good in your city?",
      "Would you like to live in a different city in the future?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000020",
    part: "part2",
    groupId: "group-city-lived",
    topicCategory: "A city you have lived in",
    cueCardText:
      "Describe a city you have lived in. You should say: where it is, how long you lived there, what the city is like, and explain what you liked or disliked about living there.",
    questions: ["Describe a city you have lived in."],
  },
  {
    id: "52000000-0000-0000-0000-000000000021",
    part: "part3",
    groupId: "group-city-lived",
    topicCategory: "Urban life and city development",
    cueCardText: null,
    questions: [
      "What are the advantages and disadvantages of living in a big city?",
      "How do cities need to change to cope with growing populations?",
      "Do you think city life is better than life in the countryside?",
      "What can city planners do to make urban areas more liveable?",
    ],
  },

  // Group 8: A natural place you have visited
  {
    id: "52000000-0000-0000-0000-000000000022",
    part: "part1",
    groupId: "group-natural-place",
    topicCategory: "Nature",
    cueCardText: null,
    questions: [
      "Do you enjoy spending time in nature?",
      "What kind of natural scenery do you like best?",
      "Is there much natural scenery near where you live?",
      "How often do you visit natural places such as parks or mountains?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000023",
    part: "part2",
    groupId: "group-natural-place",
    topicCategory: "A natural place you have visited",
    cueCardText:
      "Describe a natural place you have visited. You should say: where it is, when you went there, what you saw and did there, and explain why this place impressed you.",
    questions: ["Describe a natural place you have visited."],
  },
  {
    id: "52000000-0000-0000-0000-000000000024",
    part: "part3",
    groupId: "group-natural-place",
    topicCategory: "Environment and conservation",
    cueCardText: null,
    questions: [
      "Why is it important to protect natural environments?",
      "What are the main threats to natural areas in your country today?",
      "Do you think governments do enough to protect the environment?",
      "How can individuals help to protect natural places for future generations?",
    ],
  },

  // Group 9: A famous building you have visited
  {
    id: "52000000-0000-0000-0000-000000000025",
    part: "part1",
    groupId: "group-famous-building",
    topicCategory: "Buildings and architecture",
    cueCardText: null,
    questions: [
      "What is a famous building in your city or country?",
      "Do you like modern architecture or older buildings?",
      "Have you ever visited a historic building?",
      "Would you like to live in an unusual or famous building?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000026",
    part: "part2",
    groupId: "group-famous-building",
    topicCategory: "A famous building you have visited",
    cueCardText:
      "Describe a famous building you have visited. You should say: where it is, what it looks like, why it is famous, and explain what you thought of it.",
    questions: ["Describe a famous building you have visited."],
  },
  {
    id: "52000000-0000-0000-0000-000000000027",
    part: "part3",
    groupId: "group-famous-building",
    topicCategory: "Architecture and urban planning",
    cueCardText: null,
    questions: [
      "Why do some buildings become famous while others do not?",
      "How important is it to preserve historic buildings in a city?",
      "Do you think modern architecture reflects the culture of a country?",
      "What should city planners consider when designing new buildings?",
    ],
  },

  // Group 10: A quiet place you like to go to relax
  {
    id: "52000000-0000-0000-0000-000000000028",
    part: "part1",
    groupId: "group-quiet-place",
    topicCategory: "Relaxation",
    cueCardText: null,
    questions: [
      "Do you have a favourite place to relax?",
      "How do you usually relax after a busy day?",
      "Is it easy to find a quiet place near your home?",
      "Do you think people need quiet time alone?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000029",
    part: "part2",
    groupId: "group-quiet-place",
    topicCategory: "A quiet place you like to go",
    cueCardText:
      "Describe a quiet place you like to go to relax. You should say: where this place is, how often you go there, what you do there, and explain why this place helps you relax.",
    questions: ["Describe a quiet place you like to go to relax."],
  },
  {
    id: "52000000-0000-0000-0000-000000000030",
    part: "part3",
    groupId: "group-quiet-place",
    topicCategory: "Stress and modern life",
    cueCardText: null,
    questions: [
      "Why do people need time to relax in today's busy world?",
      "What are the effects of stress on people's health?",
      "Are quiet places becoming harder to find in modern cities?",
      "What can cities do to provide more relaxing spaces for residents?",
    ],
  },

  // Group 11: A place with a lot of trees or plants
  {
    id: "52000000-0000-0000-0000-000000000031",
    part: "part1",
    groupId: "group-park-trees",
    topicCategory: "Parks and outdoor spaces",
    cueCardText: null,
    questions: [
      "Are there any parks near where you live?",
      "Do you enjoy spending time outdoors?",
      "What activities do people usually do in parks?",
      "Did you play outdoors often as a child?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000032",
    part: "part2",
    groupId: "group-park-trees",
    topicCategory: "A place with a lot of trees or plants",
    cueCardText:
      "Describe a place with a lot of trees or plants that you have visited. You should say: where this place is, when you went there, what it looked like, and explain how you felt while you were there.",
    questions: ["Describe a place with a lot of trees or plants that you have visited."],
  },
  {
    id: "52000000-0000-0000-0000-000000000033",
    part: "part3",
    groupId: "group-park-trees",
    topicCategory: "Green spaces and urban environment",
    cueCardText: null,
    questions: [
      "Why are green spaces important in cities?",
      "Do you think city governments invest enough in parks and gardens?",
      "How does spending time around nature affect people's mental health?",
      "What can be done to encourage more people to spend time outdoors?",
    ],
  },

  // Group 12: A foreign country you would like to visit
  {
    id: "52000000-0000-0000-0000-000000000034",
    part: "part1",
    groupId: "group-foreign-country",
    topicCategory: "Countries and cultures",
    cueCardText: null,
    questions: [
      "Have you ever travelled to a foreign country?",
      "What foreign country would you most like to visit?",
      "Do you enjoy learning about other cultures?",
      "What foreign language would you like to learn?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000035",
    part: "part2",
    groupId: "group-foreign-country",
    topicCategory: "A foreign country you would like to visit",
    cueCardText:
      "Describe a foreign country you would like to visit. You should say: which country it is, what you know about it, what you would like to do there, and explain why you would like to visit this country.",
    questions: ["Describe a foreign country you would like to visit."],
  },
  {
    id: "52000000-0000-0000-0000-000000000036",
    part: "part3",
    groupId: "group-foreign-country",
    topicCategory: "Globalization and cultural exchange",
    cueCardText: null,
    questions: [
      "What are the benefits of learning about other countries and cultures?",
      "How does international travel help to reduce cultural misunderstanding?",
      "Do you think globalization is making cultures around the world more similar?",
      "What challenges do people face when they visit or move to a foreign country?",
    ],
  },

  // Group 13: A gift you received that you liked
  {
    id: "52000000-0000-0000-0000-000000000037",
    part: "part1",
    groupId: "group-gift-received",
    topicCategory: "Gifts",
    cueCardText: null,
    questions: [
      "Do you enjoy giving or receiving gifts?",
      "What kind of gifts do people usually give in your country?",
      "When was the last time you gave someone a gift?",
      "Do you prefer to buy gifts or make them yourself?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000038",
    part: "part2",
    groupId: "group-gift-received",
    topicCategory: "A gift you received that you liked",
    cueCardText:
      "Describe a gift you received that you liked. You should say: what the gift was, who gave it to you, why they gave it to you, and explain why you liked this gift.",
    questions: ["Describe a gift you received that you liked."],
  },
  {
    id: "52000000-0000-0000-0000-000000000039",
    part: "part3",
    groupId: "group-gift-received",
    topicCategory: "Gift-giving customs and consumer culture",
    cueCardText: null,
    questions: [
      "Why do people give gifts to each other?",
      "Do you think gift-giving customs have changed with the growth of online shopping?",
      "Are expensive gifts always more meaningful than inexpensive ones?",
      "How do gift-giving traditions differ between cultures?",
    ],
  },

  // Group 14: A piece of technology you use often
  {
    id: "52000000-0000-0000-0000-000000000040",
    part: "part1",
    groupId: "group-technology-device",
    topicCategory: "Technology",
    cueCardText: null,
    questions: [
      "What piece of technology do you use most often?",
      "How has technology changed the way you study or work?",
      "Do you find it easy to learn how to use new technology?",
      "What piece of technology could you not live without?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000041",
    part: "part2",
    groupId: "group-technology-device",
    topicCategory: "A piece of technology you use often",
    cueCardText:
      "Describe a piece of technology you use often. You should say: what it is, how long you have used it, what you use it for, and explain how it has changed your life.",
    questions: ["Describe a piece of technology you use often."],
  },
  {
    id: "52000000-0000-0000-0000-000000000042",
    part: "part3",
    groupId: "group-technology-device",
    topicCategory: "Technology's impact on daily life",
    cueCardText: null,
    questions: [
      "How has technology changed the way people communicate with each other?",
      "What impact has technology had on jobs and employment?",
      "Do you think people have become too dependent on technology?",
      "What technological developments do you expect to see in the next ten years?",
    ],
  },

  // Group 15: An item of clothing you particularly like
  {
    id: "52000000-0000-0000-0000-000000000043",
    part: "part1",
    groupId: "group-clothing-item",
    topicCategory: "Clothes",
    cueCardText: null,
    questions: [
      "Do you enjoy shopping for clothes?",
      "What kind of clothes do you usually wear?",
      "Do you follow fashion trends?",
      "Where do you usually buy your clothes?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000044",
    part: "part2",
    groupId: "group-clothing-item",
    topicCategory: "An item of clothing you particularly like",
    cueCardText:
      "Describe an item of clothing that you particularly like. You should say: what it is, when you got it, when you usually wear it, and explain why you like it so much.",
    questions: ["Describe an item of clothing that you particularly like."],
  },
  {
    id: "52000000-0000-0000-0000-000000000045",
    part: "part3",
    groupId: "group-clothing-item",
    topicCategory: "Fashion in society",
    cueCardText: null,
    questions: [
      "Why do fashion trends change so quickly?",
      "Do you think people should be free to wear whatever they want at work?",
      "How does clothing reflect a person's identity or culture?",
      "What impact does the fashion industry have on the environment?",
    ],
  },

  // Group 16: A useful app on your phone
  {
    id: "52000000-0000-0000-0000-000000000046",
    part: "part1",
    groupId: "group-useful-app",
    topicCategory: "Mobile phones",
    cueCardText: null,
    questions: [
      "Do you use a smartphone every day?",
      "What apps do you use most often?",
      "Have smartphones changed the way you organize your daily life?",
      "Do you think you spend too much time on your phone?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000047",
    part: "part2",
    groupId: "group-useful-app",
    topicCategory: "A useful app on your phone",
    cueCardText:
      "Describe a useful app on your phone. You should say: what the app is, how you found out about it, what you use it for, and explain why you find it useful.",
    questions: ["Describe a useful app on your phone."],
  },
  {
    id: "52000000-0000-0000-0000-000000000048",
    part: "part3",
    groupId: "group-useful-app",
    topicCategory: "Smartphones and digital life",
    cueCardText: null,
    questions: [
      "How have smartphones changed the way people live their daily lives?",
      "What are the advantages and disadvantages of using apps for education or health?",
      "Do you think children should be allowed to use smartphones from a young age?",
      "How might mobile apps develop in the future?",
    ],
  },

  // Group 17: An old object that is meaningful to you
  {
    id: "52000000-0000-0000-0000-000000000049",
    part: "part1",
    groupId: "group-old-object",
    topicCategory: "Possessions",
    cueCardText: null,
    questions: [
      "Do you keep any old items from your childhood?",
      "Are you someone who likes to keep things or throw them away?",
      "What is the oldest item you own?",
      "Do people in your country tend to keep old belongings?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000050",
    part: "part2",
    groupId: "group-old-object",
    topicCategory: "An old object that is meaningful to you",
    cueCardText:
      "Describe an old object that is meaningful to you. You should say: what it is, how long you have had it, how you got it, and explain why it is meaningful to you.",
    questions: ["Describe an old object that is meaningful to you."],
  },
  {
    id: "52000000-0000-0000-0000-000000000051",
    part: "part3",
    groupId: "group-old-object",
    topicCategory: "Attachment to objects and consumerism",
    cueCardText: null,
    questions: [
      "Why do people become attached to certain objects?",
      "Do you think people today buy and throw away things more than in the past?",
      "What are the environmental effects of a throwaway consumer culture?",
      "Should people try to repair old items rather than replace them?",
    ],
  },

  // Group 18: A piece of furniture in your home
  {
    id: "52000000-0000-0000-0000-000000000052",
    part: "part1",
    groupId: "group-furniture-home",
    topicCategory: "Home",
    cueCardText: null,
    questions: [
      "What does your home look like?",
      "What is your favourite room in your home?",
      "Do you enjoy decorating or arranging furniture?",
      "Would you like to change anything about your home?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000053",
    part: "part2",
    groupId: "group-furniture-home",
    topicCategory: "A piece of furniture in your home",
    cueCardText:
      "Describe a piece of furniture in your home. You should say: what it is, where you got it, what it looks like, and explain why it is important to you.",
    questions: ["Describe a piece of furniture in your home."],
  },
  {
    id: "52000000-0000-0000-0000-000000000054",
    part: "part3",
    groupId: "group-furniture-home",
    topicCategory: "Housing and home design",
    cueCardText: null,
    questions: [
      "What factors do people consider when choosing furniture for their homes?",
      "How do homes and furniture styles differ between generations?",
      "Do you think people's homes reflect their personality?",
      "What impact does furniture manufacturing have on the environment?",
    ],
  },

  // Group 19: A celebration you attended
  {
    id: "52000000-0000-0000-0000-000000000055",
    part: "part1",
    groupId: "group-celebration-attended",
    topicCategory: "Celebrations",
    cueCardText: null,
    questions: [
      "What celebrations are important in your country?",
      "Do you enjoy attending celebrations or parties?",
      "How do you usually celebrate special occasions?",
      "What was the last celebration you attended?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000056",
    part: "part2",
    groupId: "group-celebration-attended",
    topicCategory: "A celebration you attended",
    cueCardText:
      "Describe a celebration you attended. You should say: what the occasion was, who you were with, what happened during the celebration, and explain why you enjoyed it.",
    questions: ["Describe a celebration you attended."],
  },
  {
    id: "52000000-0000-0000-0000-000000000057",
    part: "part3",
    groupId: "group-celebration-attended",
    topicCategory: "Festivals and celebrations in society",
    cueCardText: null,
    questions: [
      "Why are celebrations and festivals important to a community?",
      "How have celebrations changed in your country in recent years?",
      "Do you think traditional celebrations will survive as societies become more modern?",
      "What role does social media play in how people celebrate events today?",
    ],
  },

  // Group 20: An achievement you are proud of
  {
    id: "52000000-0000-0000-0000-000000000058",
    part: "part1",
    groupId: "group-achievement-proud",
    topicCategory: "Achievements",
    cueCardText: null,
    questions: [
      "What is something you have achieved that you are proud of?",
      "Do you set goals for yourself regularly?",
      "How do you usually celebrate your achievements?",
      "Do you think it is important to recognize your own achievements?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000059",
    part: "part2",
    groupId: "group-achievement-proud",
    topicCategory: "An achievement you are proud of",
    cueCardText:
      "Describe an achievement you are proud of. You should say: what the achievement was, how you achieved it, what difficulties you faced, and explain why you are proud of it.",
    questions: ["Describe an achievement you are proud of."],
  },
  {
    id: "52000000-0000-0000-0000-000000000060",
    part: "part3",
    groupId: "group-achievement-proud",
    topicCategory: "Success and motivation",
    cueCardText: null,
    questions: [
      "What factors help people to achieve their goals?",
      "Do you think society values some achievements more than others?",
      "How important is it for parents to encourage children to achieve goals?",
      "Does the way society measures success need to change?",
    ],
  },

  // Group 21: A challenge you overcame
  {
    id: "52000000-0000-0000-0000-000000000061",
    part: "part1",
    groupId: "group-challenge-overcame",
    topicCategory: "Difficulties",
    cueCardText: null,
    questions: [
      "Have you ever faced a difficult challenge?",
      "How do you usually deal with difficult situations?",
      "Do you think facing challenges makes people stronger?",
      "Who do you usually turn to for support when you face a problem?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000062",
    part: "part2",
    groupId: "group-challenge-overcame",
    topicCategory: "A challenge you overcame",
    cueCardText:
      "Describe a challenge you overcame. You should say: what the challenge was, when it happened, how you dealt with it, and explain what you learned from the experience.",
    questions: ["Describe a challenge you overcame."],
  },
  {
    id: "52000000-0000-0000-0000-000000000063",
    part: "part3",
    groupId: "group-challenge-overcame",
    topicCategory: "Resilience and problem-solving",
    cueCardText: null,
    questions: [
      "Why do some people cope with challenges better than others?",
      "Do you think schools should teach children how to handle difficulties?",
      "How does facing challenges in childhood affect a person's character as an adult?",
      "What role does support from family and friends play in overcoming difficulties?",
    ],
  },

  // Group 22: A time you helped someone
  {
    id: "52000000-0000-0000-0000-000000000064",
    part: "part1",
    groupId: "group-helped-someone",
    topicCategory: "Helping others",
    cueCardText: null,
    questions: [
      "Do you enjoy helping other people?",
      "Have you ever helped a stranger?",
      "Is it common for people in your country to help each other?",
      "Do you think it is important to teach children to help others?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000065",
    part: "part2",
    groupId: "group-helped-someone",
    topicCategory: "A time you helped someone",
    cueCardText:
      "Describe a time you helped someone. You should say: who you helped, what the situation was, what you did to help, and explain how you felt afterwards.",
    questions: ["Describe a time you helped someone."],
  },
  {
    id: "52000000-0000-0000-0000-000000000066",
    part: "part3",
    groupId: "group-helped-someone",
    topicCategory: "Volunteering and community support",
    cueCardText: null,
    questions: [
      "Why do you think some people are more willing to help others than others are?",
      "What is the role of volunteering in society?",
      "Do you think governments should encourage more people to volunteer?",
      "How does technology make it easier or harder for people to help each other?",
    ],
  },

  // Group 23: A time you were surprised
  {
    id: "52000000-0000-0000-0000-000000000067",
    part: "part1",
    groupId: "group-time-surprised",
    topicCategory: "Surprises",
    cueCardText: null,
    questions: [
      "Do you like surprises?",
      "Can you remember a time when you were surprised?",
      "Do you prefer planning things in advance or being spontaneous?",
      "How do you usually react to unexpected news?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000068",
    part: "part2",
    groupId: "group-time-surprised",
    topicCategory: "A time you were surprised by something",
    cueCardText:
      "Describe a time you were surprised by something. You should say: what happened, when it happened, who was involved, and explain why it surprised you.",
    questions: ["Describe a time you were surprised by something."],
  },
  {
    id: "52000000-0000-0000-0000-000000000069",
    part: "part3",
    groupId: "group-time-surprised",
    topicCategory: "Emotions and unexpected events",
    cueCardText: null,
    questions: [
      "Why do people generally react strongly to unexpected events?",
      "Do you think life today is more predictable than in the past?",
      "How do people's reactions to surprising news differ across cultures?",
      "Can too much routine in life be a bad thing?",
    ],
  },

  // Group 24: A time you received some good news
  {
    id: "52000000-0000-0000-0000-000000000070",
    part: "part1",
    groupId: "group-good-news",
    topicCategory: "News",
    cueCardText: null,
    questions: [
      "How do you usually find out about news and current events?",
      "Can you remember a time you received some good news?",
      "Do you prefer to share good news immediately or wait for the right moment?",
      "What kind of news do you follow most closely?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000071",
    part: "part2",
    groupId: "group-good-news",
    topicCategory: "A time you received some good news",
    cueCardText:
      "Describe a time you received some good news. You should say: what the news was, how you found out about it, who told you, and explain how it made you feel.",
    questions: ["Describe a time you received some good news."],
  },
  {
    id: "52000000-0000-0000-0000-000000000072",
    part: "part3",
    groupId: "group-good-news",
    topicCategory: "How news spreads in society",
    cueCardText: null,
    questions: [
      "How has the way people receive news changed with the growth of the internet?",
      "Do you think social media has made it easier or harder to know what news is true?",
      "Why do some people prefer positive news while others are drawn to negative stories?",
      "What responsibility do news organizations have towards the public?",
    ],
  },

  // Group 25: A time you moved to a new place
  {
    id: "52000000-0000-0000-0000-000000000073",
    part: "part1",
    groupId: "group-moved-new-place",
    topicCategory: "Moving house",
    cueCardText: null,
    questions: [
      "Have you ever moved to a new home or city?",
      "What do you think is the most difficult part of moving to a new place?",
      "Do you prefer staying in one place or moving around often?",
      "What helps people settle into a new place quickly?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000074",
    part: "part2",
    groupId: "group-moved-new-place",
    topicCategory: "A time you moved to a new place",
    cueCardText:
      "Describe a time you moved to a new place. You should say: where you moved to, why you moved, how you felt about it, and explain how you adapted to the new place.",
    questions: ["Describe a time you moved to a new place."],
  },
  {
    id: "52000000-0000-0000-0000-000000000075",
    part: "part3",
    groupId: "group-moved-new-place",
    topicCategory: "Migration and relocation",
    cueCardText: null,
    questions: [
      "Why do people move to new cities or countries?",
      "What difficulties do people commonly face when they relocate?",
      "How does moving to a new place affect children differently from adults?",
      "Do you think it is becoming more common for people to move for work?",
    ],
  },

  // Group 26: A mistake you made and learned from
  {
    id: "52000000-0000-0000-0000-000000000076",
    part: "part1",
    groupId: "group-mistake-learned",
    topicCategory: "Mistakes",
    cueCardText: null,
    questions: [
      "Do you think it is important to admit your mistakes?",
      "Can you remember a mistake you learned something from?",
      "How do you usually feel after making a mistake?",
      "Do you think people are generally afraid of making mistakes?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000077",
    part: "part2",
    groupId: "group-mistake-learned",
    topicCategory: "A mistake you made and learned from",
    cueCardText:
      "Describe a mistake you made and learned from. You should say: what the mistake was, when it happened, what you did about it, and explain what you learned from it.",
    questions: ["Describe a mistake you made and learned from."],
  },
  {
    id: "52000000-0000-0000-0000-000000000078",
    part: "part3",
    groupId: "group-mistake-learned",
    topicCategory: "Learning from failure",
    cueCardText: null,
    questions: [
      "Why is it important for people to learn from their mistakes?",
      "Do you think schools put too much pressure on students to avoid failure?",
      "How does a fear of failure affect people's willingness to try new things?",
      "Should society be more accepting of people who make mistakes?",
    ],
  },

  // Group 27: A film you enjoyed watching
  {
    id: "52000000-0000-0000-0000-000000000079",
    part: "part1",
    groupId: "group-film-enjoyed",
    topicCategory: "Films",
    cueCardText: null,
    questions: [
      "Do you often watch films?",
      "What type of films do you enjoy most?",
      "Do you prefer watching films at home or at the cinema?",
      "Who do you usually watch films with?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000080",
    part: "part2",
    groupId: "group-film-enjoyed",
    topicCategory: "A film you enjoyed watching",
    cueCardText:
      "Describe a film you enjoyed watching. You should say: what the film was about, when you watched it, who you watched it with, and explain why you enjoyed it.",
    questions: ["Describe a film you enjoyed watching."],
  },
  {
    id: "52000000-0000-0000-0000-000000000081",
    part: "part3",
    groupId: "group-film-enjoyed",
    topicCategory: "Cinema and the film industry",
    cueCardText: null,
    questions: [
      "How has the film industry changed with the rise of streaming services?",
      "Do you think films can influence the way people think about social issues?",
      "Why are some films popular internationally while others are not?",
      "What impact does the film industry have on a country's culture?",
    ],
  },

  // Group 28: A piece of music that means a lot to you
  {
    id: "52000000-0000-0000-0000-000000000082",
    part: "part1",
    groupId: "group-music-meaningful",
    topicCategory: "Music",
    cueCardText: null,
    questions: [
      "What kind of music do you enjoy listening to?",
      "Do you play any musical instruments?",
      "How do you usually listen to music?",
      "Has your taste in music changed over the years?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000083",
    part: "part2",
    groupId: "group-music-meaningful",
    topicCategory: "A piece of music that means a lot to you",
    cueCardText:
      "Describe a piece of music that means a lot to you. You should say: what the music is, when you first heard it, when you usually listen to it, and explain why it is meaningful to you.",
    questions: ["Describe a piece of music that means a lot to you."],
  },
  {
    id: "52000000-0000-0000-0000-000000000084",
    part: "part3",
    groupId: "group-music-meaningful",
    topicCategory: "Music in society and culture",
    cueCardText: null,
    questions: [
      "How has the way people listen to music changed in recent decades?",
      "Do you think music education should be compulsory in schools?",
      "Why does music play such an important role in different cultures?",
      "Can music influence a person's mood or behaviour?",
    ],
  },

  // Group 29: A TV programme you like to watch
  {
    id: "52000000-0000-0000-0000-000000000085",
    part: "part1",
    groupId: "group-tv-programme",
    topicCategory: "Television",
    cueCardText: null,
    questions: [
      "Do you often watch television?",
      "What type of television programmes do you enjoy?",
      "Do you prefer watching TV shows live or streaming them?",
      "Did you watch a lot of television as a child?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000086",
    part: "part2",
    groupId: "group-tv-programme",
    topicCategory: "A TV programme you like to watch",
    cueCardText:
      "Describe a TV programme you like to watch. You should say: what the programme is about, how often you watch it, who you usually watch it with, and explain why you enjoy it.",
    questions: ["Describe a TV programme you like to watch."],
  },
  {
    id: "52000000-0000-0000-0000-000000000087",
    part: "part3",
    groupId: "group-tv-programme",
    topicCategory: "Television and media consumption",
    cueCardText: null,
    questions: [
      "How has television changed since streaming services became popular?",
      "Do you think television has a positive or negative influence on children?",
      "What role does television play in shaping public opinion?",
      "Will traditional television continue to exist in the future?",
    ],
  },

  // Group 30: A work of art you find interesting
  {
    id: "52000000-0000-0000-0000-000000000088",
    part: "part1",
    groupId: "group-work-of-art",
    topicCategory: "Art",
    cueCardText: null,
    questions: [
      "Do you enjoy visiting art galleries or museums?",
      "Did you study art at school?",
      "Do you think you have an artistic talent?",
      "What kind of art do you find most interesting?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000089",
    part: "part2",
    groupId: "group-work-of-art",
    topicCategory: "A work of art you find interesting",
    cueCardText:
      "Describe a work of art you find interesting. You should say: what it is, where you saw it, what it looks like, and explain why you find it interesting.",
    questions: ["Describe a work of art you find interesting."],
  },
  {
    id: "52000000-0000-0000-0000-000000000090",
    part: "part3",
    groupId: "group-work-of-art",
    topicCategory: "Art and its role in society",
    cueCardText: null,
    questions: [
      "Why do you think art is important to a society?",
      "Should governments spend public money supporting the arts?",
      "Do you think children should be encouraged to study art at school?",
      "How has technology changed the way people create and view art?",
    ],
  },

  // Group 31: A book you have recently read
  {
    id: "52000000-0000-0000-0000-000000000091",
    part: "part1",
    groupId: "group-book-enjoyed",
    topicCategory: "Reading",
    cueCardText: null,
    questions: [
      "Do you enjoy reading books?",
      "What kind of books do you like to read?",
      "Did you enjoy reading as a child?",
      "Do you prefer physical books or e-books?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000092",
    part: "part2",
    groupId: "group-book-enjoyed",
    topicCategory: "A book you have recently read",
    cueCardText:
      "Describe a book you have recently read. You should say: what the book was about, why you chose to read it, how long it took you to finish, and explain what you thought of it.",
    questions: ["Describe a book you have recently read."],
  },
  {
    id: "52000000-0000-0000-0000-000000000093",
    part: "part3",
    groupId: "group-book-enjoyed",
    topicCategory: "Reading habits and literature",
    cueCardText: null,
    questions: [
      "Do you think reading habits have changed in recent years?",
      "What are the advantages and disadvantages of digital books compared with printed ones?",
      "Should schools do more to encourage children to read for pleasure?",
      "Why do you think some people prefer not to read books at all?",
    ],
  },

  // Group 32: A magazine or website you read regularly
  {
    id: "52000000-0000-0000-0000-000000000094",
    part: "part1",
    groupId: "group-website-magazine",
    topicCategory: "News and reading",
    cueCardText: null,
    questions: [
      "Do you read magazines or websites regularly?",
      "How do you usually keep up with current events?",
      "Do you prefer reading news online or in print?",
      "What topics do you enjoy reading about?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000095",
    part: "part2",
    groupId: "group-website-magazine",
    topicCategory: "A magazine or website you read regularly",
    cueCardText:
      "Describe a magazine or website you read regularly. You should say: what it is, what kind of content it has, how often you read it, and explain why you find it useful or interesting.",
    questions: ["Describe a magazine or website you read regularly."],
  },
  {
    id: "52000000-0000-0000-0000-000000000096",
    part: "part3",
    groupId: "group-website-magazine",
    topicCategory: "Media and information in the digital age",
    cueCardText: null,
    questions: [
      "How has the internet changed the way people access information?",
      "Do you think printed newspapers and magazines will disappear in the future?",
      "What are the risks of getting information mainly from the internet?",
      "How can people tell whether information online is reliable?",
    ],
  },

  // Group 33: A sport you enjoy playing or watching
  {
    id: "52000000-0000-0000-0000-000000000097",
    part: "part1",
    groupId: "group-sport-play-watch",
    topicCategory: "Sport",
    cueCardText: null,
    questions: [
      "Do you play or watch any sports?",
      "What sport do you enjoy the most?",
      "Did you play sports when you were a child?",
      "Do you think it is important for people to play sports?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000098",
    part: "part2",
    groupId: "group-sport-play-watch",
    topicCategory: "A sport you enjoy playing or watching",
    cueCardText:
      "Describe a sport you enjoy playing or watching. You should say: what the sport is, when you started playing or watching it, who you usually play or watch it with, and explain why you enjoy it.",
    questions: ["Describe a sport you enjoy playing or watching."],
  },
  {
    id: "52000000-0000-0000-0000-000000000099",
    part: "part3",
    groupId: "group-sport-play-watch",
    topicCategory: "Sport in society",
    cueCardText: null,
    questions: [
      "What are the benefits of playing sports for individuals and society?",
      "Do you think professional athletes are paid too much?",
      "How has the popularity of certain sports changed over time?",
      "Should governments invest more money in sports facilities for the public?",
    ],
  },

  // Group 34: An outdoor activity you enjoy
  {
    id: "52000000-0000-0000-0000-000000000100",
    part: "part1",
    groupId: "group-outdoor-activity",
    topicCategory: "Outdoor activities",
    cueCardText: null,
    questions: [
      "Do you enjoy outdoor activities?",
      "What outdoor activities are popular in your country?",
      "How often do you spend time outdoors?",
      "Do you prefer indoor or outdoor activities?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000101",
    part: "part2",
    groupId: "group-outdoor-activity",
    topicCategory: "An outdoor activity you enjoy",
    cueCardText:
      "Describe an outdoor activity you enjoy. You should say: what the activity is, how often you do it, who you usually do it with, and explain why you enjoy it.",
    questions: ["Describe an outdoor activity you enjoy."],
  },
  {
    id: "52000000-0000-0000-0000-000000000102",
    part: "part3",
    groupId: "group-outdoor-activity",
    topicCategory: "Outdoor life and health",
    cueCardText: null,
    questions: [
      "Why do you think outdoor activities are important for health?",
      "Do you think people today spend less time outdoors than in the past?",
      "What can be done to encourage more people to be active outdoors?",
      "How do outdoor activities differ between age groups?",
    ],
  },

  // Group 35: A game you enjoyed playing as a child
  {
    id: "52000000-0000-0000-0000-000000000103",
    part: "part1",
    groupId: "group-childhood-game",
    topicCategory: "Childhood",
    cueCardText: null,
    questions: [
      "What games did you enjoy playing as a child?",
      "Did you play more indoors or outdoors as a child?",
      "Do children in your country still play traditional games?",
      "Do you think children today play differently than in the past?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000104",
    part: "part2",
    groupId: "group-childhood-game",
    topicCategory: "A game you enjoyed playing as a child",
    cueCardText:
      "Describe a game you enjoyed playing as a child. You should say: what the game was, who you played it with, where you played it, and explain why you enjoyed it.",
    questions: ["Describe a game you enjoyed playing as a child."],
  },
  {
    id: "52000000-0000-0000-0000-000000000105",
    part: "part3",
    groupId: "group-childhood-game",
    topicCategory: "Childhood and children's play today",
    cueCardText: null,
    questions: [
      "How has children's play changed with the growth of digital technology?",
      "Do you think traditional games are dying out?",
      "What can children learn from playing games with others?",
      "Should parents limit the amount of time children spend playing video games?",
    ],
  },

  // Group 36: A form of exercise you do regularly
  {
    id: "52000000-0000-0000-0000-000000000106",
    part: "part1",
    groupId: "group-exercise-form",
    topicCategory: "Keeping fit",
    cueCardText: null,
    questions: [
      "Do you exercise regularly?",
      "What is your favourite way to keep fit?",
      "Do you prefer exercising alone or with other people?",
      "Has your attitude towards exercise changed over the years?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000107",
    part: "part2",
    groupId: "group-exercise-form",
    topicCategory: "A form of exercise you do regularly",
    cueCardText:
      "Describe a form of exercise you do regularly. You should say: what it is, how often you do it, where you do it, and explain how it benefits you.",
    questions: ["Describe a form of exercise you do regularly."],
  },
  {
    id: "52000000-0000-0000-0000-000000000108",
    part: "part3",
    groupId: "group-exercise-form",
    topicCategory: "Health and fitness in modern society",
    cueCardText: null,
    questions: [
      "Why do many people find it difficult to exercise regularly?",
      "What can governments do to encourage people to be more physically active?",
      "How has the fitness industry changed in recent years?",
      "Do you think schools do enough to promote physical exercise among students?",
    ],
  },

  // Group 37: A competition you took part in
  {
    id: "52000000-0000-0000-0000-000000000109",
    part: "part1",
    groupId: "group-competition-participated",
    topicCategory: "Competitions",
    cueCardText: null,
    questions: [
      "Have you ever taken part in a competition?",
      "Do you enjoy competitive activities?",
      "Do you think competition is a good thing?",
      "What kinds of competitions are popular in your country?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000110",
    part: "part2",
    groupId: "group-competition-participated",
    topicCategory: "A competition you took part in",
    cueCardText:
      "Describe a competition you took part in. You should say: what the competition was, when it took place, how you prepared for it, and explain how you felt about the result.",
    questions: ["Describe a competition you took part in."],
  },
  {
    id: "52000000-0000-0000-0000-000000000111",
    part: "part3",
    groupId: "group-competition-participated",
    topicCategory: "Competition and its role in society",
    cueCardText: null,
    questions: [
      "Do you think competition brings out the best or the worst in people?",
      "Should schools encourage competition among students?",
      "How does competition in business benefit or harm consumers?",
      "Is it healthy for children to be involved in competitive activities from a young age?",
    ],
  },

  // Group 38: A time you learned to cook a new dish
  {
    id: "52000000-0000-0000-0000-000000000112",
    part: "part1",
    groupId: "group-cooking-dish",
    topicCategory: "Food and cooking",
    cueCardText: null,
    questions: [
      "Do you enjoy cooking?",
      "What is your favourite food to cook or eat?",
      "Who taught you how to cook?",
      "Do you think it is important to know how to cook?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000113",
    part: "part2",
    groupId: "group-cooking-dish",
    topicCategory: "A time you learned to cook a new dish",
    cueCardText:
      "Describe a time you learned to cook a new dish. You should say: what the dish was, who taught you, how difficult it was to learn, and explain how you felt after cooking it successfully.",
    questions: ["Describe a time you learned to cook a new dish."],
  },
  {
    id: "52000000-0000-0000-0000-000000000114",
    part: "part3",
    groupId: "group-cooking-dish",
    topicCategory: "Food culture and eating habits",
    cueCardText: null,
    questions: [
      "Why do you think cooking skills have declined among young people in some countries?",
      "Should cooking be taught as a compulsory subject in schools?",
      "How has the popularity of takeaway and delivery food affected home cooking?",
      "What role does food play in preserving a country's culture?",
    ],
  },

  // Group 39: A traditional custom or festival in your country
  {
    id: "52000000-0000-0000-0000-000000000115",
    part: "part1",
    groupId: "group-traditional-festival",
    topicCategory: "Traditions",
    cueCardText: null,
    questions: [
      "What is an important traditional festival in your country?",
      "How do people usually celebrate this festival?",
      "Do young people still celebrate traditional festivals in the same way as older generations?",
      "Do you enjoy taking part in traditional festivals?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000116",
    part: "part2",
    groupId: "group-traditional-festival",
    topicCategory: "A traditional custom or festival in your country",
    cueCardText:
      "Describe a traditional custom or festival in your country. You should say: what it is, when it takes place, how people celebrate it, and explain why it is important to your culture.",
    questions: ["Describe a traditional custom or festival in your country."],
  },
  {
    id: "52000000-0000-0000-0000-000000000117",
    part: "part3",
    groupId: "group-traditional-festival",
    topicCategory: "Traditions and cultural change",
    cueCardText: null,
    questions: [
      "Why is it important to preserve traditional customs and festivals?",
      "Do you think globalization is threatening traditional cultures?",
      "How do traditional festivals change as societies modernize?",
      "Should governments do more to protect cultural traditions?",
    ],
  },

  // Group 40: A rule you disagree with
  {
    id: "52000000-0000-0000-0000-000000000118",
    part: "part1",
    groupId: "group-rule-disagree",
    topicCategory: "Rules",
    cueCardText: null,
    questions: [
      "Are there rules at your school or workplace that you find useful?",
      "Do you generally follow rules easily?",
      "Have you ever broken a rule that you disagreed with?",
      "Why do you think rules are necessary in society?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000119",
    part: "part2",
    groupId: "group-rule-disagree",
    topicCategory: "A rule you disagree with",
    cueCardText:
      "Describe a rule you disagree with. You should say: what the rule is, where this rule applies, why it exists, and explain why you disagree with it.",
    questions: ["Describe a rule you disagree with."],
  },
  {
    id: "52000000-0000-0000-0000-000000000120",
    part: "part3",
    groupId: "group-rule-disagree",
    topicCategory: "Rules and laws in society",
    cueCardText: null,
    questions: [
      "Why do societies need rules and laws?",
      "Do you think all rules should be strictly enforced, even unpopular ones?",
      "How should organizations decide when to change outdated rules?",
      "Can breaking a rule ever be considered the right thing to do?",
    ],
  },

  // Group 41: An important decision you made
  {
    id: "52000000-0000-0000-0000-000000000121",
    part: "part1",
    groupId: "group-important-decision",
    topicCategory: "Decisions",
    cueCardText: null,
    questions: [
      "Do you find it easy to make decisions?",
      "Who do you usually ask for advice before making a big decision?",
      "Can you remember an important decision you made recently?",
      "Do you prefer to make decisions quickly or take your time?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000122",
    part: "part2",
    groupId: "group-important-decision",
    topicCategory: "An important decision you made",
    cueCardText:
      "Describe an important decision you made. You should say: what the decision was, when you made it, what factors you considered, and explain how this decision affected your life.",
    questions: ["Describe an important decision you made."],
  },
  {
    id: "52000000-0000-0000-0000-000000000123",
    part: "part3",
    groupId: "group-important-decision",
    topicCategory: "Decision-making in life",
    cueCardText: null,
    questions: [
      "What factors do people usually consider when making important life decisions?",
      "Do you think people should always follow their own judgment rather than others' advice?",
      "How does the amount of information available today affect decision-making?",
      "Why do some people find it harder than others to make decisions?",
    ],
  },

  // Group 42: A piece of advice someone gave you
  {
    id: "52000000-0000-0000-0000-000000000124",
    part: "part1",
    groupId: "group-advice-received",
    topicCategory: "Advice",
    cueCardText: null,
    questions: [
      "Do you often ask other people for advice?",
      "Who do you usually go to for advice?",
      "Have you ever given someone important advice?",
      "Do you think people should always follow the advice they receive?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000125",
    part: "part2",
    groupId: "group-advice-received",
    topicCategory: "A piece of advice someone gave you",
    cueCardText:
      "Describe a piece of advice someone gave you. You should say: who gave you this advice, what the advice was, when they gave it to you, and explain how this advice has helped you.",
    questions: ["Describe a piece of advice someone gave you."],
  },
  {
    id: "52000000-0000-0000-0000-000000000126",
    part: "part3",
    groupId: "group-advice-received",
    topicCategory: "The value of advice and guidance",
    cueCardText: null,
    questions: [
      "Why do people seek advice from others rather than deciding by themselves?",
      "Do you think advice from family is generally more valuable than advice from friends?",
      "How has the internet changed the way people seek advice?",
      "Should professional advice always be trusted over personal opinions?",
    ],
  },

  // Group 43: A change you would like to see in your area
  {
    id: "52000000-0000-0000-0000-000000000127",
    part: "part1",
    groupId: "group-change-area",
    topicCategory: "Your neighbourhood",
    cueCardText: null,
    questions: [
      "What is your neighbourhood like?",
      "What do you like most about the area where you live?",
      "Has your neighbourhood changed much in recent years?",
      "Would you like to move to a different area in the future?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000128",
    part: "part2",
    groupId: "group-change-area",
    topicCategory: "A change you would like to see in your area",
    cueCardText:
      "Describe a change you would like to see in your area. You should say: what the change is, why it is needed, how it could be achieved, and explain how this change would benefit the local community.",
    questions: ["Describe a change you would like to see in your area."],
  },
  {
    id: "52000000-0000-0000-0000-000000000129",
    part: "part3",
    groupId: "group-change-area",
    topicCategory: "Urban development and community change",
    cueCardText: null,
    questions: [
      "How can local residents influence decisions about their neighbourhood?",
      "What responsibilities do local governments have to improve communities?",
      "Why do some areas develop faster than others?",
      "What are the biggest challenges facing neighbourhoods in growing cities today?",
    ],
  },

  // Group 44: A goal you set yourself and achieved
  {
    id: "52000000-0000-0000-0000-000000000130",
    part: "part1",
    groupId: "group-goal-set",
    topicCategory: "Goals",
    cueCardText: null,
    questions: [
      "Do you usually set goals for yourself?",
      "What kind of goals do you have for the future?",
      "Do you find it easy to stay motivated to reach your goals?",
      "Has anyone helped you achieve a goal in the past?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000131",
    part: "part2",
    groupId: "group-goal-set",
    topicCategory: "A goal you set yourself and achieved",
    cueCardText:
      "Describe a goal you set yourself and achieved. You should say: what the goal was, why you set this goal, what steps you took, and explain how you felt after achieving it.",
    questions: ["Describe a goal you set yourself and achieved."],
  },
  {
    id: "52000000-0000-0000-0000-000000000132",
    part: "part3",
    groupId: "group-goal-set",
    topicCategory: "Ambition and personal goals",
    cueCardText: null,
    questions: [
      "Why is it important for people to set goals in life?",
      "Do you think schools should teach students how to set and achieve goals?",
      "How does having a clear goal affect a person's motivation?",
      "Are long-term goals more valuable than short-term ones?",
    ],
  },

  // Group 45: An interesting conversation you had
  {
    id: "52000000-0000-0000-0000-000000000133",
    part: "part1",
    groupId: "group-interesting-conversation",
    topicCategory: "Conversations",
    cueCardText: null,
    questions: [
      "Do you enjoy having conversations with new people?",
      "What topics do you usually talk about with friends?",
      "Do you prefer talking in person or communicating online?",
      "Who do you talk to the most during a typical day?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000134",
    part: "part2",
    groupId: "group-interesting-conversation",
    topicCategory: "An interesting conversation you had",
    cueCardText:
      "Describe an interesting conversation you had. You should say: who you talked to, what the conversation was about, where it took place, and explain why you found it interesting.",
    questions: ["Describe an interesting conversation you had."],
  },
  {
    id: "52000000-0000-0000-0000-000000000135",
    part: "part3",
    groupId: "group-interesting-conversation",
    topicCategory: "Communication in the modern world",
    cueCardText: null,
    questions: [
      "How has technology changed the way people have conversations?",
      "Do you think face-to-face conversation is becoming less common?",
      "What makes a conversation meaningful or memorable?",
      "How important are communication skills in today's workplace?",
    ],
  },

  // Group 46: A neighbour you know well
  {
    id: "52000000-0000-0000-0000-000000000136",
    part: "part1",
    groupId: "group-neighbour-know",
    topicCategory: "Neighbours",
    cueCardText: null,
    questions: [
      "Do you know your neighbours well?",
      "Do people in your country usually socialize with their neighbours?",
      "Have your neighbours ever helped you?",
      "Would you like to be closer to your neighbours?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000137",
    part: "part2",
    groupId: "group-neighbour-know",
    topicCategory: "A neighbour you know well",
    cueCardText:
      "Describe a neighbour you know well. You should say: who this person is, how long you have known them, what they are like, and explain why you get along well with them.",
    questions: ["Describe a neighbour you know well."],
  },
  {
    id: "52000000-0000-0000-0000-000000000138",
    part: "part3",
    groupId: "group-neighbour-know",
    topicCategory: "Community and neighbourliness",
    cueCardText: null,
    questions: [
      "Why do people seem to know their neighbours less well than in the past?",
      "What are the benefits of having a strong sense of community in a neighbourhood?",
      "How does living in an apartment building affect relationships between neighbours?",
      "What can be done to encourage neighbours to interact more with each other?",
    ],
  },

  // Group 47: A shop you like to visit
  {
    id: "52000000-0000-0000-0000-000000000139",
    part: "part1",
    groupId: "group-shop-visit",
    topicCategory: "Shopping",
    cueCardText: null,
    questions: [
      "Do you enjoy shopping?",
      "What kind of shop do you like to visit most?",
      "Do you prefer shopping in physical stores or online?",
      "How often do you go shopping?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000140",
    part: "part2",
    groupId: "group-shop-visit",
    topicCategory: "A shop you like to visit",
    cueCardText:
      "Describe a shop you like to visit. You should say: where it is, what it sells, how often you go there, and explain why you like this shop.",
    questions: ["Describe a shop you like to visit."],
  },
  {
    id: "52000000-0000-0000-0000-000000000141",
    part: "part3",
    groupId: "group-shop-visit",
    topicCategory: "Shopping habits and retail",
    cueCardText: null,
    questions: [
      "How has online shopping changed the retail industry?",
      "Do you think small local shops can survive against large supermarkets and online stores?",
      "What factors influence people's shopping habits nowadays?",
      "Should governments support small businesses against large retail chains?",
    ],
  },

  // Group 48: A time you tried a new type of food
  {
    id: "52000000-0000-0000-0000-000000000142",
    part: "part1",
    groupId: "group-new-food-tried",
    topicCategory: "Food",
    cueCardText: null,
    questions: [
      "Do you enjoy trying new types of food?",
      "What is your favourite type of food?",
      "Have you ever tried food from another country?",
      "Do you prefer familiar food or trying something new?",
    ],
  },
  {
    id: "52000000-0000-0000-0000-000000000143",
    part: "part2",
    groupId: "group-new-food-tried",
    topicCategory: "A time you tried a new type of food",
    cueCardText:
      "Describe a time you tried a new type of food. You should say: what the food was, where you tried it, who you were with, and explain what you thought of it.",
    questions: ["Describe a time you tried a new type of food."],
  },
  {
    id: "52000000-0000-0000-0000-000000000144",
    part: "part3",
    groupId: "group-new-food-tried",
    topicCategory: "Food and globalization",
    cueCardText: null,
    questions: [
      "How has globalization affected the food people eat around the world?",
      "Do you think it is important to preserve traditional cuisines?",
      "What are the effects of fast food becoming popular worldwide?",
      "Why do some people hesitate to try food from other cultures?",
    ],
  },

  // Group B1: An elderly person you know
  {
    id: "53000000-0000-0000-0000-000000000001",
    part: "part1",
    groupId: "groupb-elderly-person",
    topicCategory: "Elderly people",
    cueCardText: null,
    questions: [
      "Do you have any elderly relatives or neighbours?",
      "Do you enjoy spending time with older people?",
      "What can young people learn from older generations?",
      "How do older and younger people in your family usually get along?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000002",
    part: "part2",
    groupId: "groupb-elderly-person",
    topicCategory: "An elderly person you know",
    cueCardText:
      "Describe an elderly person you know well. You should say: who this person is, how you know them, what they are like, and explain what you have learned from them.",
    questions: ["Describe an elderly person you know well."],
  },
  {
    id: "53000000-0000-0000-0000-000000000003",
    part: "part3",
    groupId: "groupb-elderly-person",
    topicCategory: "Ageing and elderly care in society",
    cueCardText: null,
    questions: [
      "How does the role of elderly people in society differ between generations?",
      "Do you think families should take care of elderly relatives themselves, or is it acceptable to use care homes?",
      "What problems do ageing populations create for a country?",
      "How can societies make better use of the experience that elderly people have?",
    ],
  },

  // Group B2: A classmate or colleague you get along well with
  {
    id: "53000000-0000-0000-0000-000000000004",
    part: "part1",
    groupId: "groupb-colleague-classmate",
    topicCategory: "Classmates and colleagues",
    cueCardText: null,
    questions: [
      "Do you get along well with your classmates or colleagues?",
      "What do you usually talk about with the people you study or work with?",
      "Is it important to have good relationships with the people you work or study with?",
      "Have you ever worked closely with someone you didn't know well before?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000005",
    part: "part2",
    groupId: "groupb-colleague-classmate",
    topicCategory: "A classmate or colleague you get along well with",
    cueCardText:
      "Describe a classmate or colleague you get along well with. You should say: who this person is, how you met them, what you usually do together, and explain why you get along well with them.",
    questions: ["Describe a classmate or colleague you get along well with."],
  },
  {
    id: "53000000-0000-0000-0000-000000000006",
    part: "part3",
    groupId: "groupb-colleague-classmate",
    topicCategory: "Relationships at school and work",
    cueCardText: null,
    questions: [
      "What makes it easy or difficult for people to work well together?",
      "Do you think it is important to be friends with the people you work with, or just professional?",
      "How does teamwork in a workplace differ from teamwork at school?",
      "Why do some people find it hard to build good relationships with colleagues or classmates?",
    ],
  },

  // Group B3: A library you have visited
  {
    id: "53000000-0000-0000-0000-000000000007",
    part: "part1",
    groupId: "groupb-library-visited",
    topicCategory: "Libraries",
    cueCardText: null,
    questions: [
      "Do you often visit libraries?",
      "What do you usually do when you go to a library?",
      "Did you visit libraries often when you were a student?",
      "Do you prefer reading in a library or at home?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000008",
    part: "part2",
    groupId: "groupb-library-visited",
    topicCategory: "A library you have visited",
    cueCardText:
      "Describe a library you have visited. You should say: where it is, when you visited it, what it was like, and explain what you did there.",
    questions: ["Describe a library you have visited."],
  },
  {
    id: "53000000-0000-0000-0000-000000000009",
    part: "part3",
    groupId: "groupb-library-visited",
    topicCategory: "Libraries and access to information",
    cueCardText: null,
    questions: [
      "Why are libraries still important in the age of the internet?",
      "Do you think libraries will still exist in fifty years' time?",
      "What can governments do to encourage people to use public libraries more?",
      "How do libraries help people who cannot afford to buy books or use the internet at home?",
    ],
  },

  // Group B4: A farm you have visited
  {
    id: "53000000-0000-0000-0000-000000000010",
    part: "part1",
    groupId: "groupb-farm-visited",
    topicCategory: "Farms and rural life",
    cueCardText: null,
    questions: [
      "Have you ever visited a farm?",
      "Do you know much about how food is grown or produced?",
      "Would you like to live in the countryside?",
      "Do people in your country often visit farms or rural areas?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000011",
    part: "part2",
    groupId: "groupb-farm-visited",
    topicCategory: "A farm you have visited",
    cueCardText:
      "Describe a farm you have visited. You should say: where it was, when you went there, what you saw and did there, and explain what you thought of the experience.",
    questions: ["Describe a farm you have visited."],
  },
  {
    id: "53000000-0000-0000-0000-000000000012",
    part: "part3",
    groupId: "groupb-farm-visited",
    topicCategory: "Agriculture and rural life",
    cueCardText: null,
    questions: [
      "Why do fewer young people want to work in agriculture nowadays?",
      "How important is farming to your country's economy?",
      "What impact does modern technology have on farming methods?",
      "Do you think city dwellers should learn more about where their food comes from?",
    ],
  },

  // Group B5: A crowded place you have been to
  {
    id: "53000000-0000-0000-0000-000000000013",
    part: "part1",
    groupId: "groupb-crowded-place",
    topicCategory: "Crowded places",
    cueCardText: null,
    questions: [
      "Do you enjoy being in crowded places?",
      "What is the most crowded place you have ever been to?",
      "How do you usually feel when you are in a crowd?",
      "Are there many crowded places in the city or town where you live?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000014",
    part: "part2",
    groupId: "groupb-crowded-place",
    topicCategory: "A crowded place you have been to",
    cueCardText:
      "Describe a crowded place you have been to. You should say: where this place was, when you went there, why it was crowded, and explain how you felt being there.",
    questions: ["Describe a crowded place you have been to."],
  },
  {
    id: "53000000-0000-0000-0000-000000000015",
    part: "part3",
    groupId: "groupb-crowded-place",
    topicCategory: "Overcrowding and public spaces",
    cueCardText: null,
    questions: [
      "Why do some places become more crowded than others?",
      "What problems can overcrowding cause in cities?",
      "How can governments manage crowded public spaces more effectively?",
      "Do you think crowded cities will become more common in the future?",
    ],
  },

  // Group B6: A museum you have visited
  {
    id: "53000000-0000-0000-0000-000000000016",
    part: "part1",
    groupId: "groupb-museum-visited",
    topicCategory: "Museums",
    cueCardText: null,
    questions: [
      "Do you enjoy visiting museums?",
      "What kind of museums do you find most interesting?",
      "Did you visit museums often as a child?",
      "Do you think museums are important for a country?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000017",
    part: "part2",
    groupId: "groupb-museum-visited",
    topicCategory: "A museum you have visited",
    cueCardText:
      "Describe a museum you have visited. You should say: where it is, what kind of museum it is, what you saw there, and explain what you thought of your visit.",
    questions: ["Describe a museum you have visited."],
  },
  {
    id: "53000000-0000-0000-0000-000000000018",
    part: "part3",
    groupId: "groupb-museum-visited",
    topicCategory: "Museums and cultural heritage",
    cueCardText: null,
    questions: [
      "Why are museums important for preserving a country's history and culture?",
      "Do you think museums should be free for everyone to visit?",
      "How have museums changed with the use of new technology?",
      "What can be done to encourage more young people to visit museums?",
    ],
  },

  // Group B7: A useful tool or household item you own
  {
    id: "53000000-0000-0000-0000-000000000019",
    part: "part1",
    groupId: "groupb-useful-tool",
    topicCategory: "Household items",
    cueCardText: null,
    questions: [
      "What household items do you use most often?",
      "Do you enjoy buying new tools or gadgets for your home?",
      "Who usually looks after tools or equipment in your home?",
      "Have you ever borrowed a tool from a friend or neighbour?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000020",
    part: "part2",
    groupId: "groupb-useful-tool",
    topicCategory: "A useful tool or household item you own",
    cueCardText:
      "Describe a useful tool or household item you own. You should say: what it is, how long you have had it, how often you use it, and explain why it is useful to you.",
    questions: ["Describe a useful tool or household item you own."],
  },
  {
    id: "53000000-0000-0000-0000-000000000021",
    part: "part3",
    groupId: "groupb-useful-tool",
    topicCategory: "Household tools and everyday convenience",
    cueCardText: null,
    questions: [
      "How have household tools changed over the past few decades?",
      "Do you think people rely too much on tools and machines nowadays?",
      "What tools do you think will become common in homes in the future?",
      "Should children be taught how to use basic tools at school?",
    ],
  },

  // Group B8: A photograph you like
  {
    id: "53000000-0000-0000-0000-000000000022",
    part: "part1",
    groupId: "groupb-photograph-like",
    topicCategory: "Photographs",
    cueCardText: null,
    questions: [
      "Do you like taking photographs?",
      "How do you usually store or share your photographs?",
      "Did people in your family take many photographs when you were young?",
      "Do you prefer looking at printed photos or digital ones?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000023",
    part: "part2",
    groupId: "groupb-photograph-like",
    topicCategory: "A photograph you like",
    cueCardText:
      "Describe a photograph you like. You should say: what is in the photograph, when it was taken, who took it, and explain why you like this photograph.",
    questions: ["Describe a photograph you like."],
  },
  {
    id: "53000000-0000-0000-0000-000000000024",
    part: "part3",
    groupId: "groupb-photograph-like",
    topicCategory: "Photography and memories",
    cueCardText: null,
    questions: [
      "Why do people like to keep photographs of important moments in their lives?",
      "How has digital photography changed the way people take and share photos?",
      "Do you think people take too many photographs nowadays?",
      "What role do old photographs play in helping people remember the past?",
    ],
  },

  // Group B9: A vehicle you have travelled in
  {
    id: "53000000-0000-0000-0000-000000000025",
    part: "part1",
    groupId: "groupb-vehicle-travelled",
    topicCategory: "Transport",
    cueCardText: null,
    questions: [
      "What types of transport do you use most often?",
      "Do you enjoy travelling by car, train, or plane?",
      "What was your very first experience of travelling by vehicle?",
      "Do you think public transport in your city is good?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000026",
    part: "part2",
    groupId: "groupb-vehicle-travelled",
    topicCategory: "A vehicle you have travelled in",
    cueCardText:
      "Describe a vehicle you have travelled in that you remember well. You should say: what type of vehicle it was, where you travelled, who you were with, and explain why you remember this journey.",
    questions: ["Describe a vehicle you have travelled in that you remember well."],
  },
  {
    id: "53000000-0000-0000-0000-000000000027",
    part: "part3",
    groupId: "groupb-vehicle-travelled",
    topicCategory: "Transport and travel methods",
    cueCardText: null,
    questions: [
      "How has transport changed in your country over the last few decades?",
      "What are the advantages and disadvantages of public transport compared with private cars?",
      "Do you think electric vehicles will replace petrol cars in the near future?",
      "How can governments encourage people to use more environmentally friendly transport?",
    ],
  },

  // Group B10: A time you got lost
  {
    id: "53000000-0000-0000-0000-000000000028",
    part: "part1",
    groupId: "groupb-time-got-lost",
    topicCategory: "Directions and getting around",
    cueCardText: null,
    questions: [
      "Do you have a good sense of direction?",
      "How do you usually find your way to a new place?",
      "Have you ever helped a stranger who was lost?",
      "Do you prefer using a map or asking people for directions?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000029",
    part: "part2",
    groupId: "groupb-time-got-lost",
    topicCategory: "A time you got lost",
    cueCardText:
      "Describe a time you got lost. You should say: where you were, why you got lost, what you did about it, and explain how you felt during the experience.",
    questions: ["Describe a time you got lost."],
  },
  {
    id: "53000000-0000-0000-0000-000000000030",
    part: "part3",
    groupId: "groupb-time-got-lost",
    topicCategory: "Navigation and finding your way",
    cueCardText: null,
    questions: [
      "How have navigation apps changed the way people travel to unfamiliar places?",
      "Do you think people's sense of direction is getting worse because of technology?",
      "Why do some people get lost more easily than others?",
      "What should people do to prepare before travelling to an unfamiliar place?",
    ],
  },

  // Group B11: A time you waited a long time for something
  {
    id: "53000000-0000-0000-0000-000000000031",
    part: "part1",
    groupId: "groupb-long-wait",
    topicCategory: "Waiting",
    cueCardText: null,
    questions: [
      "Do you consider yourself a patient person?",
      "What kinds of things do people usually have to wait for?",
      "How do you usually pass the time while waiting?",
      "Do you get frustrated easily when you have to wait?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000032",
    part: "part2",
    groupId: "groupb-long-wait",
    topicCategory: "A time you waited a long time for something",
    cueCardText:
      "Describe a time you waited a long time for something. You should say: what you were waiting for, where you were, how long you waited, and explain how you felt while waiting.",
    questions: ["Describe a time you waited a long time for something."],
  },
  {
    id: "53000000-0000-0000-0000-000000000033",
    part: "part3",
    groupId: "groupb-long-wait",
    topicCategory: "Patience in modern life",
    cueCardText: null,
    questions: [
      "Why do people seem to have less patience nowadays than in the past?",
      "How has technology changed the way people cope with waiting?",
      "Do you think waiting for something makes people appreciate it more?",
      "What can organizations do to make waiting more pleasant for customers?",
    ],
  },

  // Group B12: A live performance or concert you attended
  {
    id: "53000000-0000-0000-0000-000000000034",
    part: "part1",
    groupId: "groupb-concert-attended",
    topicCategory: "Live performances",
    cueCardText: null,
    questions: [
      "Do you enjoy attending live performances or concerts?",
      "What kind of live events are popular in your country?",
      "Have you ever performed in front of an audience?",
      "Do you prefer watching a performance live or on a screen?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000035",
    part: "part2",
    groupId: "groupb-concert-attended",
    topicCategory: "A live performance or concert you attended",
    cueCardText:
      "Describe a live performance or concert you attended. You should say: what the event was, where it took place, who you went with, and explain why you enjoyed this experience.",
    questions: ["Describe a live performance or concert you attended."],
  },
  {
    id: "53000000-0000-0000-0000-000000000036",
    part: "part3",
    groupId: "groupb-concert-attended",
    topicCategory: "Live entertainment and events",
    cueCardText: null,
    questions: [
      "Why do people enjoy watching live performances more than recorded ones?",
      "How has technology changed the way people experience live events?",
      "Do you think live concerts and shows will remain popular in the future?",
      "What impact do large public events have on a city or local community?",
    ],
  },

  // Group B13: A time you worked as part of a team
  {
    id: "53000000-0000-0000-0000-000000000037",
    part: "part1",
    groupId: "groupb-teamwork-experience",
    topicCategory: "Working with others",
    cueCardText: null,
    questions: [
      "Do you prefer working alone or as part of a team?",
      "What kinds of activities do you usually do in a team?",
      "Have you ever had a disagreement with a teammate?",
      "What do you think makes a team successful?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000038",
    part: "part2",
    groupId: "groupb-teamwork-experience",
    topicCategory: "A time you worked as part of a team",
    cueCardText:
      "Describe a time you worked as part of a team. You should say: what the task was, who else was involved, what your role was, and explain how successful the teamwork was.",
    questions: ["Describe a time you worked as part of a team."],
  },
  {
    id: "53000000-0000-0000-0000-000000000039",
    part: "part3",
    groupId: "groupb-teamwork-experience",
    topicCategory: "Teamwork and collaboration",
    cueCardText: null,
    questions: [
      "What skills do people need to work well in a team?",
      "Do you think teamwork is more important in some jobs than others?",
      "How can leaders help a team to work together more effectively?",
      "Why do some teams fail to achieve their goals despite everyone working hard?",
    ],
  },

  // Group B14: A podcast or radio programme you listen to
  {
    id: "53000000-0000-0000-0000-000000000040",
    part: "part1",
    groupId: "groupb-podcast-radio",
    topicCategory: "Podcasts and radio",
    cueCardText: null,
    questions: [
      "Do you listen to podcasts or the radio?",
      "What kind of podcasts or radio programmes do you enjoy?",
      "When and where do you usually listen to them?",
      "Do you think podcasts are becoming more popular than traditional radio?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000041",
    part: "part2",
    groupId: "groupb-podcast-radio",
    topicCategory: "A podcast or radio programme you listen to",
    cueCardText:
      "Describe a podcast or radio programme you listen to. You should say: what it is about, how you found out about it, how often you listen to it, and explain why you enjoy it.",
    questions: ["Describe a podcast or radio programme you listen to."],
  },
  {
    id: "53000000-0000-0000-0000-000000000042",
    part: "part3",
    groupId: "groupb-podcast-radio",
    topicCategory: "Audio media and communication",
    cueCardText: null,
    questions: [
      "Why do you think podcasts have become so popular in recent years?",
      "What are the advantages of audio media compared with video or written content?",
      "Do you think radio will still exist in the future, given the rise of streaming services?",
      "How can podcasts and radio programmes influence public opinion?",
    ],
  },

  // Group B15: A game you enjoy playing now
  {
    id: "53000000-0000-0000-0000-000000000043",
    part: "part1",
    groupId: "groupb-game-play-now",
    topicCategory: "Games",
    cueCardText: null,
    questions: [
      "Do you enjoy playing games in your free time?",
      "What kind of games do you like to play now?",
      "Do you prefer playing games alone or with other people?",
      "How much time do you usually spend playing games each week?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000044",
    part: "part2",
    groupId: "groupb-game-play-now",
    topicCategory: "A game you enjoy playing now",
    cueCardText:
      "Describe a game you enjoy playing now. You should say: what the game is, how you learned to play it, who you usually play it with, and explain why you enjoy playing it.",
    questions: ["Describe a game you enjoy playing now."],
  },
  {
    id: "53000000-0000-0000-0000-000000000045",
    part: "part3",
    groupId: "groupb-game-play-now",
    topicCategory: "Gaming and entertainment",
    cueCardText: null,
    questions: [
      "Why do you think games are popular among people of all ages?",
      "Do you think video games can have educational value?",
      "What are the possible negative effects of spending too much time playing games?",
      "How has the gaming industry changed in the last twenty years?",
    ],
  },

  // Group B16: A creative activity you enjoy
  {
    id: "53000000-0000-0000-0000-000000000046",
    part: "part1",
    groupId: "groupb-creative-activity",
    topicCategory: "Creativity",
    cueCardText: null,
    questions: [
      "Do you consider yourself a creative person?",
      "What creative activities do you enjoy doing?",
      "Did you do many creative activities when you were a child?",
      "Do you think everyone has the ability to be creative?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000047",
    part: "part2",
    groupId: "groupb-creative-activity",
    topicCategory: "A creative activity you enjoy",
    cueCardText:
      "Describe a creative activity you enjoy. You should say: what the activity is, when you started doing it, how often you do it, and explain why you find it enjoyable.",
    questions: ["Describe a creative activity you enjoy."],
  },
  {
    id: "53000000-0000-0000-0000-000000000048",
    part: "part3",
    groupId: "groupb-creative-activity",
    topicCategory: "Creativity in everyday life",
    cueCardText: null,
    questions: [
      "Why is creativity considered important in many jobs today?",
      "Do you think schools do enough to encourage creativity in students?",
      "How does technology help or limit people's creativity?",
      "Can creativity be taught, or is it something people are born with?",
    ],
  },

  // Group B17: A law you think benefits society
  {
    id: "53000000-0000-0000-0000-000000000049",
    part: "part1",
    groupId: "groupb-good-law",
    topicCategory: "Laws and rules",
    cueCardText: null,
    questions: [
      "Do you follow the news about new laws in your country?",
      "Are there any laws in your country that you strongly support?",
      "Do you think most people in your country obey the law?",
      "How do you usually find out about changes to the law?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000050",
    part: "part2",
    groupId: "groupb-good-law",
    topicCategory: "A law you think benefits society",
    cueCardText:
      "Describe a law you think benefits society. You should say: what the law is, when it was introduced, who it affects, and explain why you think this law is beneficial.",
    questions: ["Describe a law you think benefits society."],
  },
  {
    id: "53000000-0000-0000-0000-000000000051",
    part: "part3",
    groupId: "groupb-good-law",
    topicCategory: "Laws and their role in society",
    cueCardText: null,
    questions: [
      "Why do governments introduce new laws?",
      "Do you think laws should be the same in every part of a country, or can they vary by region?",
      "How can governments make sure that citizens understand new laws?",
      "What happens when laws fail to keep up with changes in society?",
    ],
  },

  // Group B18: A plan you have for the next few years
  {
    id: "53000000-0000-0000-0000-000000000052",
    part: "part1",
    groupId: "groupb-future-plan",
    topicCategory: "Future plans",
    cueCardText: null,
    questions: [
      "Do you like to plan things in advance?",
      "What are your plans for the near future?",
      "Do you think it is important to have a plan for your life?",
      "Who do you usually talk to about your future plans?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000053",
    part: "part2",
    groupId: "groupb-future-plan",
    topicCategory: "A plan you have for the next few years",
    cueCardText:
      "Describe a plan you have for the next few years. You should say: what the plan is, why you have this plan, how you intend to achieve it, and explain how you feel about it.",
    questions: ["Describe a plan you have for the next few years."],
  },
  {
    id: "53000000-0000-0000-0000-000000000054",
    part: "part3",
    groupId: "groupb-future-plan",
    topicCategory: "Planning for the future",
    cueCardText: null,
    questions: [
      "Why do some people find it difficult to plan for the future?",
      "Do you think it is better to plan carefully or to be flexible and adapt as things happen?",
      "How does uncertainty, such as economic change, affect people's ability to plan ahead?",
      "Should schools teach students how to plan for their careers and futures?",
    ],
  },

  // Group B19: An invention that has changed people's lives
  {
    id: "53000000-0000-0000-0000-000000000055",
    part: "part1",
    groupId: "groupb-invention-changed-world",
    topicCategory: "Inventions",
    cueCardText: null,
    questions: [
      "What inventions do you use most often in daily life?",
      "Do you think some inventions have been more important than others?",
      "Are you interested in learning about the history of inventions?",
      "What invention would you find hardest to live without?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000056",
    part: "part2",
    groupId: "groupb-invention-changed-world",
    topicCategory: "An invention that has changed people's lives",
    cueCardText:
      "Describe an invention that has changed people's lives. You should say: what the invention is, who invented it, how it is used, and explain how it has changed people's lives.",
    questions: ["Describe an invention that has changed people's lives."],
  },
  {
    id: "53000000-0000-0000-0000-000000000057",
    part: "part3",
    groupId: "groupb-invention-changed-world",
    topicCategory: "Inventions and technological progress",
    cueCardText: null,
    questions: [
      "What qualities do inventors need to be successful?",
      "Do you think governments should invest more money in supporting new inventions?",
      "How do inventions affect the way societies develop over time?",
      "Can an invention have both positive and negative effects on society?",
    ],
  },

  // Group B20: A time you did something to help the environment
  {
    id: "53000000-0000-0000-0000-000000000058",
    part: "part1",
    groupId: "groupb-helped-environment",
    topicCategory: "The environment",
    cueCardText: null,
    questions: [
      "Do you try to protect the environment in your daily life?",
      "What environmental problems concern you the most?",
      "Do you recycle regularly at home?",
      "Do you think individuals can make a real difference to the environment?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000059",
    part: "part2",
    groupId: "groupb-helped-environment",
    topicCategory: "A time you did something to help the environment",
    cueCardText:
      "Describe a time you did something to help the environment. You should say: what you did, when you did it, why you decided to do it, and explain how you felt about the outcome.",
    questions: ["Describe a time you did something to help the environment."],
  },
  {
    id: "53000000-0000-0000-0000-000000000060",
    part: "part3",
    groupId: "groupb-helped-environment",
    topicCategory: "Individual and collective environmental responsibility",
    cueCardText: null,
    questions: [
      "What can individuals do to reduce their impact on the environment?",
      "Do you think environmental problems should be solved mainly by governments or by individuals?",
      "How effective are environmental campaigns at changing people's behaviour?",
      "What are the biggest environmental challenges facing the world today?",
    ],
  },

  // Group B21: An animal you find interesting
  {
    id: "53000000-0000-0000-0000-000000000061",
    part: "part1",
    groupId: "groupb-interesting-animal",
    topicCategory: "Animals",
    cueCardText: null,
    questions: [
      "Do you like animals?",
      "Did you have any pets when you were growing up?",
      "What animals are common in your country?",
      "Have you ever seen wild animals in their natural habitat?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000062",
    part: "part2",
    groupId: "groupb-interesting-animal",
    topicCategory: "An animal you find interesting",
    cueCardText:
      "Describe an animal you find interesting. You should say: what the animal is, where it lives, what it looks like, and explain why you find it interesting.",
    questions: ["Describe an animal you find interesting."],
  },
  {
    id: "53000000-0000-0000-0000-000000000063",
    part: "part3",
    groupId: "groupb-interesting-animal",
    topicCategory: "Wildlife and animal conservation",
    cueCardText: null,
    questions: [
      "Why is it important to protect endangered animal species?",
      "Do you think zoos are good or bad for animals?",
      "How does the loss of natural habitats affect wildlife populations?",
      "What can ordinary people do to help protect wildlife?",
    ],
  },

  // Group B22: A restaurant you enjoyed eating at
  {
    id: "53000000-0000-0000-0000-000000000064",
    part: "part1",
    groupId: "groupb-restaurant-enjoyed",
    topicCategory: "Eating out",
    cueCardText: null,
    questions: [
      "Do you often eat at restaurants?",
      "What kind of food do you usually order when eating out?",
      "Do you prefer eating at home or eating out?",
      "Who do you usually go to restaurants with?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000065",
    part: "part2",
    groupId: "groupb-restaurant-enjoyed",
    topicCategory: "A restaurant you enjoyed eating at",
    cueCardText:
      "Describe a restaurant you enjoyed eating at. You should say: where it is, what kind of food it serves, who you went with, and explain why you enjoyed eating there.",
    questions: ["Describe a restaurant you enjoyed eating at."],
  },
  {
    id: "53000000-0000-0000-0000-000000000066",
    part: "part3",
    groupId: "groupb-restaurant-enjoyed",
    topicCategory: "Restaurants and eating out culture",
    cueCardText: null,
    questions: [
      "Why has eating out become more popular in recent years?",
      "What factors do people consider when choosing a restaurant?",
      "Do you think fast food restaurants have a negative impact on people's health?",
      "How has the restaurant industry changed with the growth of food delivery apps?",
    ],
  },

  // Group B23: Something useful you learned outside school
  {
    id: "53000000-0000-0000-0000-000000000067",
    part: "part1",
    groupId: "groupb-learned-outside-school",
    topicCategory: "Learning outside the classroom",
    cueCardText: null,
    questions: [
      "Do you think people learn more inside or outside the classroom?",
      "What useful things have you learned from your family?",
      "Do you enjoy learning new things by yourself?",
      "What is something practical you wish you had learned earlier in life?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000068",
    part: "part2",
    groupId: "groupb-learned-outside-school",
    topicCategory: "Something useful you learned outside school",
    cueCardText:
      "Describe something useful you learned outside school. You should say: what you learned, who or what helped you learn it, when you learned it, and explain why it was useful to you.",
    questions: ["Describe something useful you learned outside school."],
  },
  {
    id: "53000000-0000-0000-0000-000000000069",
    part: "part3",
    groupId: "groupb-learned-outside-school",
    topicCategory: "Informal learning and life skills",
    cueCardText: null,
    questions: [
      "What kinds of skills are better learned outside a formal classroom?",
      "Do you think schools should teach more practical life skills?",
      "How does learning from experience differ from learning from books?",
      "How has the internet changed the way people learn things outside school?",
    ],
  },

  // Group B24: A subject you enjoyed studying at school
  {
    id: "53000000-0000-0000-0000-000000000070",
    part: "part1",
    groupId: "groupb-subject-enjoyed",
    topicCategory: "School subjects",
    cueCardText: null,
    questions: [
      "What was your favourite subject at school?",
      "Were you good at this subject?",
      "Do you still use anything you learned from this subject today?",
      "Did your school offer a wide range of subjects to choose from?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000071",
    part: "part2",
    groupId: "groupb-subject-enjoyed",
    topicCategory: "A subject you enjoyed studying at school",
    cueCardText:
      "Describe a subject you enjoyed studying at school. You should say: what the subject was, who taught it, why you enjoyed it, and explain how it has been useful to you since.",
    questions: ["Describe a subject you enjoyed studying at school."],
  },
  {
    id: "53000000-0000-0000-0000-000000000072",
    part: "part3",
    groupId: "groupb-subject-enjoyed",
    topicCategory: "Education and curriculum choices",
    cueCardText: null,
    questions: [
      "Do you think students should be able to choose which subjects they study?",
      "How do you think school curriculums should change to prepare students for the future?",
      "Should schools place more emphasis on subjects like science and maths than on the arts?",
      "Why do students often have different opinions about which subjects are most important?",
    ],
  },

  // Group B25: A happy memory from your childhood
  {
    id: "53000000-0000-0000-0000-000000000073",
    part: "part1",
    groupId: "groupb-childhood-memory",
    topicCategory: "Childhood memories",
    cueCardText: null,
    questions: [
      "Do you often think about your childhood?",
      "What is one of your happiest childhood memories?",
      "Who did you spend most of your time with as a child?",
      "Do you think childhood is the happiest time of a person's life?",
    ],
  },
  {
    id: "53000000-0000-0000-0000-000000000074",
    part: "part2",
    groupId: "groupb-childhood-memory",
    topicCategory: "A happy memory from your childhood",
    cueCardText:
      "Describe a happy memory from your childhood. You should say: what happened, where you were, who was with you, and explain why this memory is important to you.",
    questions: ["Describe a happy memory from your childhood."],
  },
  {
    id: "53000000-0000-0000-0000-000000000075",
    part: "part3",
    groupId: "groupb-childhood-memory",
    topicCategory: "Childhood and its influence on adult life",
    cueCardText: null,
    questions: [
      "Why do people often remember their childhood so vividly?",
      "How do childhood experiences shape a person's character as an adult?",
      "Do you think childhood today is very different from childhood in the past?",
      "What can parents do to give their children a happy childhood?",
    ],
  },
];
