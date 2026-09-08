import type { WritingPrompt } from '@/types/models';

export const writingPrompts: WritingPrompt[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Household Recycling Rates',
    minWords: 150,
    timeLimitMinutes: 20,
    chartImageUrl: null,
    promptText: `The chart below shows the percentage of household waste recycled in three countries (Country A, Country B, and Country C) between 2000 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Country A: 2000 - 12%, 2010 - 28%, 2020 - 45%
Country B: 2000 - 8%, 2010 - 15%, 2020 - 22%
Country C: 2000 - 20%, 2010 - 33%, 2020 - 38%

Write at least 150 words.`,
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Letter to a Landlord',
    minWords: 150,
    timeLimitMinutes: 20,
    chartImageUrl: null,
    promptText: `You are renting an apartment and have noticed that the heating system has stopped working properly. Write a letter to your landlord. In your letter:

- describe the problem with the heating
- explain how it is affecting you
- say what you would like the landlord to do

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Technology and Face-to-Face Communication',
    minWords: 250,
    timeLimitMinutes: 40,
    chartImageUrl: null,
    promptText: `Some people believe that modern technology, such as smartphones and social media, has made face-to-face communication less common and weakened personal relationships. Others believe technology has made communication easier and relationships stronger.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Should Governments Fund the Arts?',
    minWords: 250,
    timeLimitMinutes: 40,
    chartImageUrl: null,
    promptText: `Some people think that governments should spend money on arts such as music and theatre, while others believe this money would be better spent on public services such as healthcare and education.

Discuss both views and give your own opinion.

Write at least 250 words.`,
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Advantages and Disadvantages of Remote Work',
    minWords: 250,
    timeLimitMinutes: 40,
    chartImageUrl: null,
    promptText: `In recent years, an increasing number of companies allow employees to work from home instead of commuting to an office.

What are the advantages and disadvantages of this trend?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
];
