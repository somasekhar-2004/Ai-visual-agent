import type { WritingPrompt } from '@/types/models';

export const writingPrompts: WritingPrompt[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Household Recycling Rates',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'bar',
      unit: '%',
      series: [
        {
          label: 'Country A',
          points: [
            { x: '2000', y: 12 },
            { x: '2010', y: 28 },
            { x: '2020', y: 45 },
          ],
        },
        {
          label: 'Country B',
          points: [
            { x: '2000', y: 8 },
            { x: '2010', y: 15 },
            { x: '2020', y: 22 },
          ],
        },
        {
          label: 'Country C',
          points: [
            { x: '2000', y: 20 },
            { x: '2010', y: 33 },
            { x: '2020', y: 38 },
          ],
        },
      ],
    },
    promptText: `The chart below shows the percentage of household waste recycled in three countries (Country A, Country B, and Country C) between 2000 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Letter to a Landlord',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
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
    category: 'discussion',
    chartData: null,
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
    category: 'discussion',
    chartData: null,
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
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `In recent years, an increasing number of companies allow employees to work from home instead of commuting to an office.

What are the advantages and disadvantages of this trend?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },

  // ===========================================================================
  // TASK 1 ACADEMIC — 14 new prompts (bar x3, line x3, pie x2, table x2,
  // process x2, map x2)
  // ===========================================================================
  {
    id: '42000000-0000-0000-0000-000000000001',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'News Consumption by Age Group',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'bar',
      unit: '%',
      series: [
        {
          label: 'Print Newspapers',
          points: [
            { x: '18-29', y: 8 },
            { x: '30-44', y: 15 },
            { x: '45-59', y: 32 },
            { x: '60+', y: 55 },
          ],
        },
        {
          label: 'Online Sources',
          points: [
            { x: '18-29', y: 88 },
            { x: '30-44', y: 74 },
            { x: '45-59', y: 52 },
            { x: '60+', y: 30 },
          ],
        },
      ],
    },
    promptText: `The bar chart below shows the percentage of people in four age groups who got their news from print newspapers and from online sources in a survey conducted in 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000002',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Sources of Electricity Generation, 2000-2020',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'bar',
      unit: '%',
      series: [
        {
          label: 'Coal',
          points: [
            { x: '2000', y: 60 },
            { x: '2010', y: 45 },
            { x: '2020', y: 25 },
          ],
        },
        {
          label: 'Natural Gas',
          points: [
            { x: '2000', y: 30 },
            { x: '2010', y: 35 },
            { x: '2020', y: 35 },
          ],
        },
        {
          label: 'Renewables',
          points: [
            { x: '2000', y: 10 },
            { x: '2010', y: 20 },
            { x: '2020', y: 40 },
          ],
        },
      ],
    },
    promptText: `The chart below shows the percentage share of electricity generated from coal, natural gas, and renewable sources in a country in 2000, 2010, and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000003',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'University Enrolment by Faculty, 1990 and 2020',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'bar',
      unit: 'thousand students',
      series: [
        {
          label: 'Engineering',
          points: [
            { x: '1990', y: 12 },
            { x: '2020', y: 35 },
          ],
        },
        {
          label: 'Arts',
          points: [
            { x: '1990', y: 20 },
            { x: '2020', y: 18 },
          ],
        },
        {
          label: 'Business',
          points: [
            { x: '1990', y: 8 },
            { x: '2020', y: 40 },
          ],
        },
        {
          label: 'Science',
          points: [
            { x: '1990', y: 10 },
            { x: '2020', y: 25 },
          ],
        },
      ],
    },
    promptText: `The chart below shows the number of students, in thousands, enrolled in four faculties at a university in 1990 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000004',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Internet Users in Four Countries, 1995-2020',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'line',
      unit: '%',
      series: [
        {
          label: 'Country A',
          points: [
            { x: '1995', y: 1 },
            { x: '2000', y: 10 },
            { x: '2005', y: 30 },
            { x: '2010', y: 55 },
            { x: '2015', y: 75 },
            { x: '2020', y: 90 },
          ],
        },
        {
          label: 'Country B',
          points: [
            { x: '1995', y: 0.5 },
            { x: '2000', y: 5 },
            { x: '2005', y: 15 },
            { x: '2010', y: 35 },
            { x: '2015', y: 60 },
            { x: '2020', y: 80 },
          ],
        },
        {
          label: 'Country C',
          points: [
            { x: '1995', y: 2 },
            { x: '2000', y: 15 },
            { x: '2005', y: 40 },
            { x: '2010', y: 65 },
            { x: '2015', y: 82 },
            { x: '2020', y: 95 },
          ],
        },
        {
          label: 'Country D',
          points: [
            { x: '1995', y: 0.2 },
            { x: '2000', y: 2 },
            { x: '2005', y: 8 },
            { x: '2010', y: 20 },
            { x: '2015', y: 45 },
            { x: '2020', y: 70 },
          ],
        },
      ],
    },
    promptText: `The line graph below shows the percentage of the population using the internet in four countries between 1995 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000005',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Average Global Temperature Change, 1950-2020',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'line',
      unit: 'degrees C above 1950 level',
      series: [
        {
          label: 'Average Temperature Change',
          points: [
            { x: '1950', y: 0 },
            { x: '1960', y: 0.03 },
            { x: '1970', y: 0.1 },
            { x: '1980', y: 0.2 },
            { x: '1990', y: 0.35 },
            { x: '2000', y: 0.5 },
            { x: '2010', y: 0.65 },
            { x: '2020', y: 0.9 },
          ],
        },
      ],
    },
    promptText: `The line graph below shows the change in average global temperature, measured in degrees Celsius above the 1950 level, at ten-year intervals from 1950 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000006',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Coffee and Tea Consumption, 1980-2020',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'line',
      unit: 'cups per week',
      series: [
        {
          label: 'Coffee',
          points: [
            { x: '1980', y: 5 },
            { x: '1990', y: 8 },
            { x: '2000', y: 12 },
            { x: '2010', y: 15 },
            { x: '2020', y: 18 },
          ],
        },
        {
          label: 'Tea',
          points: [
            { x: '1980', y: 12 },
            { x: '1990', y: 10 },
            { x: '2000', y: 8 },
            { x: '2010', y: 6 },
            { x: '2020', y: 5 },
          ],
        },
      ],
    },
    promptText: `The graph below shows the average number of cups of coffee and tea consumed per person per week in a particular country between 1980 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000007',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Household Spending Breakdown, 2020',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'pie',
      unit: '%',
      segments: [
        { label: 'Housing', value: 35 },
        { label: 'Food', value: 20 },
        { label: 'Transport', value: 15 },
        { label: 'Education', value: 10 },
        { label: 'Healthcare', value: 10 },
        { label: 'Other', value: 10 },
      ],
    },
    promptText: `The pie chart below shows the percentage breakdown of average household spending in Country X in 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000008',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Commuting Methods in a City',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'pie',
      unit: '%',
      segments: [
        { label: 'Car', value: 45 },
        { label: 'Bus', value: 25 },
        { label: 'Train', value: 15 },
        { label: 'Bicycle', value: 10 },
        { label: 'Walking', value: 5 },
      ],
    },
    promptText: `The pie chart below shows the main mode of transport used by commuters to travel to work in a city in 2021.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000009',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Average Monthly Rainfall in Four Cities',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'table',
      headers: ['City', 'January', 'April', 'July', 'October'],
      rows: [
        ['City A', '20mm', '65mm', '140mm', '75mm'],
        ['City B', '150mm', '90mm', '10mm', '60mm'],
        ['City C', '40mm', '55mm', '200mm', '80mm'],
        ['City D', '10mm', '20mm', '5mm', '15mm'],
      ],
    },
    promptText: `The table below shows the average rainfall, in millimetres, recorded in four cities in January, April, July, and October.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000010',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Transport Mode Usage in Three Cities',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'table',
      headers: ['City', 'Car', 'Bus', 'Bicycle', 'Walking'],
      rows: [
        ['City A', '55%', '25%', '10%', '10%'],
        ['City B', '30%', '40%', '20%', '10%'],
        ['City C', '15%', '35%', '35%', '15%'],
      ],
    },
    promptText: `The table below shows the percentage of residents using different modes of transport for their daily commute in three cities.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000011',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'The Water Treatment Process',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'process',
      steps: [
        'Raw water is pumped from a river or reservoir into the treatment plant',
        'Screening removes large debris and particles from the water',
        'Coagulant chemicals are added so that small particles clump together',
        'The water passes through a sedimentation tank so heavy particles sink to the bottom',
        'The water flows through sand and carbon filters to remove remaining particles',
        'Chlorine is added to disinfect the water and kill bacteria',
        'The clean water is stored in a reservoir before being distributed to homes',
      ],
    },
    promptText: `The diagram below shows the process by which water is treated at a plant to make it safe for drinking.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000012',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'The Chocolate Production Process',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'process',
      steps: [
        'Cocoa pods are harvested from cocoa trees and cut open',
        'The cocoa beans are removed from the pods and left to ferment for several days',
        'The fermented beans are dried in the sun',
        'The dried beans are roasted to develop their flavour',
        'The roasted beans are ground into a thick paste called cocoa mass',
        'Sugar and milk are mixed into the cocoa mass',
        'The mixture is conched and tempered before being moulded into bars',
      ],
    },
    promptText: `The diagram below shows the process used to produce chocolate from cocoa beans.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000013',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Changes to a Coastal Town, 1990-2020',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'map',
      description: 'The maps show a small coastal town in 1990 and the same town in 2020.',
      features: [
        'A new marina was built where the old fishing harbour used to be',
        'The residential area expanded further south along the coastline',
        'A forested area to the north was cleared to build a hotel complex',
        'A new road was constructed connecting the town to the main highway',
        'A primary school was added near the town centre',
        'The old fish market was replaced by a row of restaurants and shops',
      ],
    },
    promptText: `The maps below show a small coastal town in 1990 and the same town in 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000014',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Redevelopment of a City Park',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'map',
      description: 'The maps show a public park in a city before redevelopment and the same park after redevelopment.',
      features: [
        'A pond was added in the centre of the park',
        'The play area for children was relocated closer to the main entrance',
        'A bicycle path was constructed around the perimeter of the park',
        'A small cafe was built near the pond',
        'Several trees near the entrance were removed to create open lawn space',
        'A car park was added at the northern edge of the park',
      ],
    },
    promptText: `The maps below show a public park in a city before redevelopment and the same park after redevelopment.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },

  // ===========================================================================
  // TASK 1 GENERAL TRAINING — 19 new letter-writing prompts
  // ===========================================================================
  {
    id: '42000000-0000-0000-0000-000000000015',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Complaint About a Faulty Product',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You recently bought a kitchen appliance that stopped working properly after only a few days. Write a letter to the company you bought it from. In your letter:

- describe the appliance and the problem with it
- explain what you have already done about the problem
- say what you would like the company to do

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000016',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Request for Course Information',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You are interested in taking an evening course at a local college. Write a letter to the college. In your letter:

- explain which course you are interested in
- ask about the entry requirements
- ask about the cost and how to register

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000017',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Job Application Letter',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You saw an advertisement for a part-time position at a local library. Write a letter to the manager. In your letter:

- explain why you are interested in the position
- describe your relevant skills and experience
- say when you would be available for an interview

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000018',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Thank-You Letter to a Host Family',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You recently stayed with a host family while studying English abroad. Write a letter to the family. In your letter:

- thank them for their hospitality
- mention a particular memory from your stay
- invite them to visit you in the future

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000019',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Letter to an Employer About Absence',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You were unable to attend work last week because you were unwell. Write a letter to your manager. In your letter:

- explain why you were absent
- apologise for any inconvenience caused
- describe how you plan to catch up on your work

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000020',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Complaint About Noisy Neighbours',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You live in a rented apartment, and neighbours in the building have been extremely noisy at night for the past month. Write a letter to your landlord. In your letter:

- describe the problem
- explain how it has affected you
- suggest what action the landlord could take

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000021',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Invitation to a Housewarming Party',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You have just moved into a new house or apartment. Write a letter to a friend inviting them to a housewarming party. In your letter:

- give the date and time of the party
- give directions to your new home
- suggest what to bring or wear

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000022',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Advice for a Friend Moving to a New City',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `A friend of yours is planning to move to the city where you live. Write a letter to your friend. In your letter:

- give advice about finding somewhere to live
- recommend areas or neighbourhoods to consider
- offer to help them settle in

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000023',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Apology for Missing a Wedding',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You were unable to attend the wedding of a close friend. Write a letter to your friend. In your letter:

- apologise for not attending
- explain the reason you could not come
- suggest how you could celebrate together at a later date

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000024',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Request for a Reference Letter',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You are applying for a new job and need a reference from a previous employer. Write a letter to your former manager. In your letter:

- explain what job you are applying for
- ask if they would be willing to provide a reference
- remind them of the work you did while employed there

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000025',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Reply to an Advertisement for a Room to Rent',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You saw an advertisement for a room to rent in a shared apartment. Write a letter to the advertiser. In your letter:

- say why you are interested in the room
- ask some questions about the apartment and the other housemates
- explain when you would be able to view the room

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000026',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Complaint to a Local Council About Construction Noise',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `A construction site near your home has been causing excessive noise early in the morning for several weeks. Write a letter to the local council. In your letter:

- describe the problem
- explain how it is affecting you and your neighbours
- ask what action the council can take

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000027',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Refund Request for a Cancelled Event',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You bought tickets for a concert that was later cancelled by the organisers. Write a letter to the ticket company. In your letter:

- explain which event you booked tickets for
- ask about the process for getting a refund
- say how you would like to be compensated

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000028',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Letter to a School About a Child Absence',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `Your child will be absent from school for a week because of a family trip. Write a letter to the school. In your letter:

- explain the reason for the absence
- give the exact dates your child will be away
- ask how your child can catch up on missed schoolwork

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000029',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Letter Cancelling a Gym Membership',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You want to cancel your membership at a gym. Write a letter to the gym manager. In your letter:

- explain that you want to cancel your membership
- give the reason for your decision
- ask about the cancellation process and any fees involved

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000030',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Congratulations on Graduation',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `A close friend of yours has just graduated from university. Write a letter to your friend. In your letter:

- congratulate them on their achievement
- ask about their plans for the future
- suggest a way to celebrate together

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000031',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Handover Letter to a Colleague',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You are leaving your current job and need to hand over your responsibilities to a colleague. Write a letter to your colleague. In your letter:

- explain that you are leaving and when your last day will be
- describe your main duties and ongoing tasks
- offer to answer any questions before you leave

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000032',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Complaint to a Hotel About Poor Service',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You recently stayed at a hotel and were unhappy with the service you received. Write a letter to the hotel manager. In your letter:

- describe your stay and the problems you experienced
- explain how the staff responded at the time
- say what you would like the manager to do

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '42000000-0000-0000-0000-000000000033',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Request for an Assignment Extension',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You need more time to complete an important assignment for your course. Write a letter to your tutor. In your letter:

- explain which assignment you are writing about
- give the reason you need more time
- suggest a new deadline you could meet

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },

  // ===========================================================================
  // TASK 2 — ACADEMIC — 28 new prompts
  // ===========================================================================
  {
    id: '42000000-0000-0000-0000-000000000034',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Delaying Formal Schooling',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that children should not begin formal education until they are at least seven years old, arguing that younger children benefit more from play-based learning.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000035',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Free University Education',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people think that university education should be free for all students, while others believe students should pay for their own tuition fees.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000036',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Studying Abroad',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `An increasing number of students choose to complete part of their education in a foreign country rather than in their home country.

What are the advantages and disadvantages of this trend?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000037',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Overcrowded Classrooms',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `In many countries, schools are struggling to cope with very large class sizes.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000038',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Rise of Vocational Training',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `In many countries, an increasing number of young people are choosing vocational training over a university degree.

Why has this happened, and what impact will it have on the job market?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000039',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'AI Replacing Human Jobs',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that artificial intelligence will eventually replace most jobs currently done by humans.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000040',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Teaching Children Computer Skills Early',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people think children should be taught how to use computers and other digital devices from a very young age, while others believe this delays the development of other important skills.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000041',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Automation in Shops',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Many shops and supermarkets now use self-service checkouts and automated systems instead of employing staff to serve customers.

What are the advantages and disadvantages of this development?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000042',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Smartphone Addiction Among Young People',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Many young people today spend a large amount of their free time on smartphones and social media, and some experts believe this behaviour is becoming an addiction.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000043',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Increasing Time Spent on Social Media',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `People today spend far more time using social media than they did a decade ago.

Why do you think this has happened, and what effects does it have on society?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000044',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Individual Action on the Environment',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that individuals cannot make a real difference to environmental problems, and that only governments and large companies have the power to bring about change.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000045',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Raising Fuel Prices to Protect the Environment',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people believe that increasing the price of fuel is the best way to encourage people to protect the environment, while others believe there are more effective methods.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000046',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Switching to Renewable Energy',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Many countries are replacing fossil fuels such as coal and oil with renewable sources of energy such as solar and wind power.

What are the advantages and disadvantages of this change?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000047',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Plastic Waste in the Oceans',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `The amount of plastic waste entering the oceans has increased significantly in recent decades.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000048',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Rising Air Pollution in Cities',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Air pollution levels are rising in many major cities around the world.

Why is this happening, and what can be done to reduce it?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000049',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Spending on Public Transport Versus Roads',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people think that governments should spend more money on improving public transport rather than building new roads for private cars.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000050',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Responsibility for Traffic Congestion',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people believe that governments are responsible for reducing traffic congestion in cities, while others believe individual citizens should take responsibility for this problem.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000051',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Financial Support for Unemployed Citizens',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `In some countries, the government provides financial support to citizens who are unemployed.

What are the advantages and disadvantages of this policy?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000052',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Rising Cost of Living',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `The cost of living has increased sharply in many cities in recent years.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000053',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Growing Income Inequality',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `In many countries, the gap between the incomes of the richest and poorest citizens continues to grow.

Why does this happen, and what measures can be taken to reduce this inequality?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000054',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Taxing Fast Food',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that fast food should be taxed more heavily in order to reduce rates of obesity.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000055',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Exercise Versus Diet for Good Health',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people think that regular exercise is the most important factor in staying healthy, while others believe that diet plays a more important role.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000056',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Increasing Life Expectancy',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `People in many countries are living much longer than they did in the past.

What are the advantages and disadvantages of an increase in life expectancy?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000057',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Childhood Obesity',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Rates of obesity among children have risen significantly in many countries in recent years.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000058',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Rising Mental Illness Among Young People',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Cases of mental illness among young people have increased considerably in recent years.

Why has this happened, and what can be done to address the problem?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000059',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Job Satisfaction Versus Salary',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe it is more important to enjoy your job than to earn a high salary.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000060',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Flexible Working Hours',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people think employees should be free to choose their own working hours, while others believe a fixed schedule set by the employer leads to better results.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000061',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Staying with One Employer Long-Term',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Some people spend their entire career working for a single company, while others prefer to change employers regularly.

What are the advantages and disadvantages of remaining with one employer for a long period of time?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },

  // ===========================================================================
  // TASK 2 — GENERAL TRAINING — 29 new prompts
  // ===========================================================================
  {
    id: '42000000-0000-0000-0000-000000000062',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Workplace Stress and Burnout',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Many employees today report feeling increasingly stressed and exhausted because of their jobs.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000063',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Widespread Job Dissatisfaction',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Surveys suggest that many employees feel dissatisfied with their current jobs.

Why do you think this is the case, and what can employers do to improve job satisfaction?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000064',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Longer Prison Sentences to Reduce Crime',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that giving criminals longer prison sentences is the most effective way to reduce crime.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000065',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Treatment of Young Offenders',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people believe that young offenders should be punished in the same way as adult criminals, while others believe they should be treated differently.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000066',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'CCTV Cameras in Public Places',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Many cities have installed a large number of CCTV cameras in streets and public places.

What are the advantages and disadvantages of this increase in surveillance?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000067',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Rising Cybercrime',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `The number of crimes committed online, such as fraud and hacking, has increased significantly in recent years.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000068',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Increasing Crime in Urban Areas',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Crime rates have risen in many urban areas in recent years.

Why has this happened, and what solutions can local authorities implement?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000069',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Media Influence on Public Opinion',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that the media has too much influence over what the public thinks and believes.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000070',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'The Future of Newspapers',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people think that printed newspapers will disappear completely as more people get their news online, while others believe printed newspapers will always have a place.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000071',
    taskType: 'task2',
    ieltsType: 'general',
    title: '24-Hour News Coverage',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Many television channels now broadcast news twenty-four hours a day, reporting on events as they happen.

What are the advantages and disadvantages of constant news coverage?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000072',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Spread of False Information Online',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `False information, often called fake news, spreads very quickly on the internet and social media.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000073',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Influence of Celebrities on Young People',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Celebrities often have a very strong influence on the attitudes and behaviour of young people.

Why does this happen, and what impact does it have on society?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000074',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'The Impact of Globalisation',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that globalisation has caused more harm than good to societies around the world.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000075',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Who Benefits from Globalisation',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people believe that globalisation benefits only wealthy nations, while others believe that all countries gain from it equally.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000076',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Availability of International Brands',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Nowadays, the same international brands and products can be found in almost every country in the world.

What are the advantages and disadvantages of this trend?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000077',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Loss of Local Languages and Traditions',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `As globalisation continues, many local languages and traditions are disappearing.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000078',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'The Growing Power of Multinational Companies',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Large multinational companies are becoming increasingly powerful and influential around the world.

Why is this happening, and what problems might it cause?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000079',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'City Life Versus Country Life',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that living in a big city offers a better quality of life than living in the countryside.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000080',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Limiting the Growth of Cities',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people think governments should limit the growth of large cities, while others believe cities should be allowed to expand freely.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000081',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'The Growth of Megacities',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `The number of very large cities, sometimes called megacities, is increasing rapidly around the world.

What are the advantages and disadvantages of this rapid urban growth?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000082',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Traffic Congestion in Large Cities',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Traffic congestion has become a serious problem in many large cities.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000083',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Migration from Rural Areas to Cities',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `In many countries, increasing numbers of people are moving from rural areas to live in cities.

Why is this happening, and what problems does this create for cities?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000084',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Declining Importance of Traditional Customs',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that traditional customs and celebrations are becoming less important in modern society.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000085',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Preserving Traditional Culture Versus Modernising',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people believe it is important to preserve traditional culture, while others think societies should focus on modernising and embracing change.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000086',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Cultural Exchange Through Tourism and Media',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Increased travel and global media have led to greater cultural exchange between countries.

What are the advantages and disadvantages of this increased cultural exchange?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000087',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Decline of Traditional Arts and Crafts',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Traditional arts and crafts skills are disappearing in many parts of the world.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000088',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Declining Popularity of Traditional Festivals',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Traditional festivals are becoming less popular among young people in many countries.

Why is this happening, and what can be done to preserve these festivals?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000089',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Families With a Single Child',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `In some countries, more families are choosing to have only one child rather than several children.

What are the advantages and disadvantages of this trend?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '42000000-0000-0000-0000-000000000090',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Overcrowding at Popular Tourist Sites',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Increasing numbers of tourists are visiting popular natural and historical sites around the world.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
];
