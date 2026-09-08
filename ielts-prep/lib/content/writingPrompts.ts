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

  // ===========================================================================
  // TASK 1 ACADEMIC — 10 new prompts (bar x2, line x2, pie x2, table x2,
  // process x1, map x1)
  // ===========================================================================
  {
    id: '43000000-0000-0000-0000-000000000001',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Streaming Service Subscriptions by Age Group',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'bar',
      unit: '%',
      series: [
        {
          label: 'Video Streaming',
          points: [
            { x: '18-24', y: 92 },
            { x: '25-34', y: 85 },
            { x: '35-49', y: 60 },
            { x: '50+', y: 35 },
          ],
        },
        {
          label: 'Music Streaming',
          points: [
            { x: '18-24', y: 80 },
            { x: '25-34', y: 70 },
            { x: '35-49', y: 55 },
            { x: '50+', y: 30 },
          ],
        },
      ],
    },
    promptText: `The bar chart below shows the percentage of people in four age groups who subscribed to video streaming services and music streaming services in a survey conducted in 2023.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000002',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Annual Book Sales by Format, 2000-2020',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'bar',
      unit: 'million units',
      series: [
        {
          label: 'Print Books',
          points: [
            { x: '2000', y: 120 },
            { x: '2010', y: 95 },
            { x: '2020', y: 80 },
          ],
        },
        {
          label: 'E-books',
          points: [
            { x: '2000', y: 0 },
            { x: '2010', y: 25 },
            { x: '2020', y: 45 },
          ],
        },
        {
          label: 'Audiobooks',
          points: [
            { x: '2000', y: 0 },
            { x: '2010', y: 5 },
            { x: '2020', y: 20 },
          ],
        },
      ],
    },
    promptText: `The chart below shows the number of units sold, in millions, of print books, e-books, and audiobooks in a particular country in 2000, 2010, and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000003',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Average House Prices in Three Cities, 2000-2020',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'line',
      unit: 'thousand USD',
      series: [
        {
          label: 'City A',
          points: [
            { x: '2000', y: 150 },
            { x: '2005', y: 180 },
            { x: '2010', y: 220 },
            { x: '2015', y: 270 },
            { x: '2020', y: 340 },
          ],
        },
        {
          label: 'City B',
          points: [
            { x: '2000', y: 200 },
            { x: '2005', y: 230 },
            { x: '2010', y: 260 },
            { x: '2015', y: 310 },
            { x: '2020', y: 400 },
          ],
        },
        {
          label: 'City C',
          points: [
            { x: '2000', y: 100 },
            { x: '2005', y: 120 },
            { x: '2010', y: 150 },
            { x: '2015', y: 190 },
            { x: '2020', y: 250 },
          ],
        },
      ],
    },
    promptText: `The line graph below shows the average house price, in thousands of US dollars, in three cities between 2000 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000004',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Electric Vehicle Registrations in Four Countries, 2010-2022',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'line',
      unit: 'thousand vehicles',
      series: [
        {
          label: 'Country W',
          points: [
            { x: '2010', y: 1 },
            { x: '2014', y: 10 },
            { x: '2018', y: 60 },
            { x: '2022', y: 250 },
          ],
        },
        {
          label: 'Country X',
          points: [
            { x: '2010', y: 0.5 },
            { x: '2014', y: 5 },
            { x: '2018', y: 40 },
            { x: '2022', y: 180 },
          ],
        },
        {
          label: 'Country Y',
          points: [
            { x: '2010', y: 2 },
            { x: '2014', y: 20 },
            { x: '2018', y: 90 },
            { x: '2022', y: 300 },
          ],
        },
        {
          label: 'Country Z',
          points: [
            { x: '2010', y: 0.2 },
            { x: '2014', y: 2 },
            { x: '2018', y: 15 },
            { x: '2022', y: 90 },
          ],
        },
      ],
    },
    promptText: `The line graph below shows the number of new electric vehicles registered, in thousands, in four countries between 2010 and 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000005',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Breakdown of Household Energy Use',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'pie',
      unit: '%',
      segments: [
        { label: 'Heating', value: 40 },
        { label: 'Water Heating', value: 18 },
        { label: 'Appliances', value: 20 },
        { label: 'Lighting', value: 12 },
        { label: 'Other', value: 10 },
      ],
    },
    promptText: `The pie chart below shows the breakdown of energy use in an average household in a particular country in 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000006',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'How Office Employees Spend Their Working Day',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'pie',
      unit: '%',
      segments: [
        { label: 'Meetings', value: 25 },
        { label: 'Email', value: 20 },
        { label: 'Focused Work', value: 30 },
        { label: 'Breaks', value: 10 },
        { label: 'Administrative Tasks', value: 15 },
      ],
    },
    promptText: `The pie chart below shows how office employees at a company spent their average working day in 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000007',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Average Life Expectancy by Gender in Five Countries',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'table',
      headers: ['Country', 'Male (years)', 'Female (years)'],
      rows: [
        ['Country A', '74', '80'],
        ['Country B', '68', '75'],
        ['Country C', '79', '84'],
        ['Country D', '71', '77'],
        ['Country E', '65', '70'],
      ],
    },
    promptText: `The table below shows the average life expectancy, in years, for men and women in five countries in 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000008',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Visitor Numbers at Four City Museums, 2019 and 2022',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'table',
      headers: ['Museum', '2019 Visitors (thousands)', '2022 Visitors (thousands)'],
      rows: [
        ['History Museum', '450', '280'],
        ['Art Gallery', '620', '510'],
        ['Science Centre', '380', '410'],
        ['Natural History Museum', '500', '350'],
      ],
    },
    promptText: `The table below shows the number of visitors, in thousands, to four museums in a city in 2019 and 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000009',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'The Process of Making Paper from Wood Pulp',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'process',
      steps: [
        'Logs are transported from the forest to the paper mill',
        'The bark is stripped from the logs and the wood is chipped into small pieces',
        'The wood chips are mixed with water and chemicals and cooked to produce pulp',
        'The pulp is washed and bleached to remove impurities and colour',
        'The pulp is spread thinly onto a moving mesh screen to form a continuous sheet',
        'The sheet is pressed and dried by large heated rollers',
        'The finished paper is wound onto large rolls ready for cutting and distribution',
      ],
    },
    promptText: `The diagram below shows the process by which paper is made from wood pulp.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000010',
    taskType: 'task1_academic',
    ieltsType: 'academic',
    title: 'Redevelopment of a University Campus, 2005 and 2023',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: {
      type: 'map',
      description: 'The maps show a university campus in 2005 and the same campus in 2023.',
      features: [
        'A new library building was constructed in place of the old car park',
        'A student accommodation block was added at the eastern edge of the campus',
        'The sports field was reduced in size to make room for a science laboratory building',
        'A pedestrian plaza with trees replaced the road that used to run through the centre of the campus',
        'A new car park was built at the northern entrance of the campus',
        'The old administration building was converted into a student centre',
      ],
    },
    promptText: `The maps below show a university campus in 2005 and the same campus in 2023.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
  },

  // ===========================================================================
  // TASK 1 GENERAL TRAINING — 10 new letter-writing prompts
  // ===========================================================================
  {
    id: '43000000-0000-0000-0000-000000000011',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Letter to a Bank About an Unauthorised Transaction',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You noticed a transaction on your bank statement that you do not recognise. Write a letter to your bank. In your letter:

- describe the transaction you are concerned about
- explain what you have checked so far
- ask what the bank can do to resolve the issue

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '43000000-0000-0000-0000-000000000012',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Complaint to a Travel Agency About a Cancelled Trip',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `A trip you booked through a travel agency was cancelled at short notice. Write a letter to the travel agency. In your letter:

- explain which trip you had booked
- describe the inconvenience the cancellation caused
- say what you would like the agency to do

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '43000000-0000-0000-0000-000000000013',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Letter Asking to Borrow Equipment from a Neighbour',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You need to borrow a piece of equipment from a neighbour for a short period. Write a letter to your neighbour. In your letter:

- explain what you need to borrow and why
- say how long you would need it for
- offer to return the favour in some way

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '43000000-0000-0000-0000-000000000014',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Inquiry About Joining a Sports Club',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You are interested in joining a local sports club. Write a letter to the club manager. In your letter:

- say which sport you are interested in and why
- ask about membership fees and training times
- ask whether the club offers sessions for your level of experience

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '43000000-0000-0000-0000-000000000015',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Complaint About a Meal at a Restaurant',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You recently had a disappointing experience at a restaurant. Write a letter to the restaurant manager. In your letter:

- describe what happened during your visit
- explain how the staff responded at the time
- say what you would like the manager to do

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '43000000-0000-0000-0000-000000000016',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Letter Returning a Borrowed Item to a Friend',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You borrowed an item from a friend some time ago and are now ready to return it. Write a letter to your friend. In your letter:

- remind them what you borrowed and when
- explain why it has taken you this long to return it
- suggest a time and place to meet so you can return it

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '43000000-0000-0000-0000-000000000017',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Invitation to a Colleague Retirement Party',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `A colleague of yours is retiring soon and you are organising a party for them. Write a letter to another colleague inviting them to the event. In your letter:

- explain who is retiring and why you are having a party
- give the date, time, and location of the party
- ask if they would like to help with the arrangements

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '43000000-0000-0000-0000-000000000018',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Letter Suggesting a Product Improvement to a Company',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You regularly use a product made by a particular company and have an idea for how it could be improved. Write a letter to the company. In your letter:

- explain which product you are writing about
- describe your suggestion for improving it
- explain how this change would benefit customers

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },
  {
    id: '43000000-0000-0000-0000-000000000019',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Letter Requesting Time Off Work',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `You would like to request a period of leave from your job for personal reasons. Write a letter to your manager. In your letter:

- explain when you would like to take leave and for how long
- give the reason for your request
- explain how your work will be covered while you are away

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear ___,"`,
  },
  {
    id: '43000000-0000-0000-0000-000000000020',
    taskType: 'task1_general',
    ieltsType: 'general',
    title: 'Complaint to a Delivery Company About a Lost Package',
    minWords: 150,
    timeLimitMinutes: 20,
    category: null,
    chartData: null,
    promptText: `A package you were expecting has not arrived, despite being marked as delivered. Write a letter to the delivery company. In your letter:

- describe the package and when it was supposed to arrive
- explain what you have already done to try to locate it
- say what you would like the company to do

Write at least 150 words. You do NOT need to write your own address. Begin your letter as follows: "Dear Sir or Madam,"`,
  },

  // ===========================================================================
  // TASK 2 — ACADEMIC — 20 new prompts
  // ===========================================================================
  {
    id: '43000000-0000-0000-0000-000000000021',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Funding Space Exploration',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that governments should invest heavily in space exploration, while others think this money should be spent on solving problems on Earth, such as poverty and disease.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000022',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Mandatory Pay Transparency',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that companies should be required by law to publish the salaries they pay to employees in order to reduce pay differences between men and women.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000023',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Keeping Animals in Zoos',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that keeping wild animals in zoos is cruel and should be banned, while others believe zoos play an important role in education and conservation.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000024',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'The Value of Standardised Testing',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that standardised tests are the fairest way to measure a student's ability, while others believe such tests fail to reflect a student's true abilities.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000025',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Four-Day Working Week',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people think companies should move to a four-day working week to improve employee wellbeing, while others believe a five-day week is necessary to maintain productivity.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000026',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Online Learning Versus the Traditional Classroom',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people think that online courses are just as effective as traditional classroom learning, while others believe that attending classes in person produces better results.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000027',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Genetically Modified Crops',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people believe that genetically modified crops are essential for feeding a growing world population, while others believe they pose serious risks to health and the environment.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000028',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Self-Driving Cars on Public Roads',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people believe that self-driving cars will make roads safer, while others believe they introduce new and dangerous risks.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000029',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Growth of Online Shopping',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `An increasing number of consumers are choosing to buy products online rather than visiting physical stores.

What are the advantages and disadvantages of this trend?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000030',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'The Rise of E-books',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Electronic books are becoming increasingly popular, and some readers now prefer them to printed books.

What are the advantages and disadvantages of reading electronic books rather than printed books?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000031',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Commercial Space Tourism',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Several private companies now offer paid trips to space for members of the public who can afford the cost.

What are the advantages and disadvantages of the growth of commercial space tourism?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000032',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Wearable Health Technology',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Devices such as smartwatches and fitness trackers, which monitor a person's heart rate and activity levels, have become extremely popular.

What are the advantages and disadvantages of the widespread use of this technology?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000033',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Water Scarcity in Growing Cities',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `As urban populations continue to grow, many cities are struggling to provide a reliable supply of clean water to their residents.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000034',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Unemployment Among University Graduates',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `In many countries, a growing number of university graduates are unable to find employment related to their field of study.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000035',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Food Waste in Restaurants and Supermarkets',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Large quantities of edible food are thrown away by restaurants and supermarkets every year.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000036',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Declining Bee Populations',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Bee populations, which play a vital role in pollinating crops, have declined sharply in many regions in recent decades.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000037',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'The Rise of Freelance and Gig Work',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `An increasing number of people are choosing to work as freelancers or take on short-term contracts rather than seeking permanent employment.

Why has this happened, and what effects does it have on workers and employers?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000038',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Artificial Intelligence in Medical Diagnosis',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Hospitals are increasingly using artificial intelligence systems to help diagnose illnesses and diseases in patients.

Why is this technology being adopted, and what impact will it have on the medical profession?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000039',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Growing Popularity of Online University Degrees',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `An increasing number of students are choosing to complete university degrees entirely online rather than attending campus-based programmes.

Why has this happened, and what effect will it have on traditional universities?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000040',
    taskType: 'task2',
    ieltsType: 'academic',
    title: 'Declining Birth Rates in Developed Countries',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Birth rates have fallen significantly in many developed countries over the past few decades.

Why has this happened, and what consequences will it have for these societies?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },

  // ===========================================================================
  // TASK 2 — GENERAL TRAINING — 20 new prompts
  // ===========================================================================
  {
    id: '43000000-0000-0000-0000-000000000041',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Raising the Retirement Age',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that governments should raise the age at which citizens are allowed to retire, given that people are living longer than in the past.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000042',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Banning Advertising Aimed at Children',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that advertising aimed at young children should be banned because children are not able to judge advertising claims critically.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000043',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Mandatory Volunteering for Students',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that all high school students should be required to complete a number of hours of volunteer work before they graduate.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000044',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Replacing Tipping with Higher Wages',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'opinion',
    chartData: null,
    promptText: `Some people believe that restaurants should pay staff higher fixed wages and eliminate the custom of tipping altogether.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000045',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Who Should Care for Elderly Relatives',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people believe that families should be responsible for caring for elderly relatives at home, while others believe elderly people are better looked after in care homes run by trained staff.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000046',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Should School Uniforms Be Compulsory',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people think that school uniforms should be compulsory for all students, while others believe students should be free to choose what they wear to school.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000047',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Homework for Young Children',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people believe that homework helps young children develop good study habits, while others believe it places an unnecessary burden on children at a young age.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000048',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'The Right Number of Public Holidays',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'discussion',
    chartData: null,
    promptText: `Some people believe that countries should introduce more public holidays to give workers time to rest and spend with family, while others believe additional holidays would harm economic productivity.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000049',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'The Trend Toward Living Alone',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `In many countries, an increasing number of adults are choosing to live alone rather than with family or a partner.

What are the advantages and disadvantages of this trend?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000050',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'The Growth of the Fast Fashion Industry',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Clothing companies now produce and sell new items of clothing at very low prices and at a very fast pace, a trend often called fast fashion.

What are the advantages and disadvantages of this trend?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000051',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'The Rise of Food Delivery Apps',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `Mobile apps that deliver restaurant meals directly to customers' homes have become extremely popular in recent years.

What are the advantages and disadvantages of this trend?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000052',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Growth of Co-working Spaces',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'advantages_disadvantages',
    chartData: null,
    promptText: `An increasing number of freelancers and small businesses now rent desks in shared co-working spaces rather than working from a traditional office or from home.

What are the advantages and disadvantages of this trend?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000053',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Rising Homelessness in Cities',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `The number of people without permanent housing has increased in many major cities in recent years.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000054',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Overuse of Antibiotics',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Doctors in many countries are concerned that antibiotics are being prescribed too often, leading to a rise in bacteria that are resistant to treatment.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000055',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Sedentary Lifestyles Among Office Workers',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Many people who work in offices spend most of the day sitting down, with little physical activity.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000056',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Rising Noise Pollution in Cities',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'problem_solution',
    chartData: null,
    promptText: `Noise levels have increased significantly in many cities because of traffic, construction, and crowded public spaces.

What problems does this cause, and what solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000057',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'The Growing Popularity of Pet Ownership',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `In many countries, an increasing number of households are choosing to keep a pet.

Why has this happened, and what effects does pet ownership have on individuals and families?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000058',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'More People Living Alone',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `The number of people living alone, rather than with family or a partner, has risen steadily in many countries.

Why is this happening, and what effects does it have on society?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000059',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'The Growing Popularity of Fast Food Restaurants',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Fast food restaurants have become increasingly popular in many countries over the past few decades.

Why has this happened, and what effects does this have on people's diet and health?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
  {
    id: '43000000-0000-0000-0000-000000000060',
    taskType: 'task2',
    ieltsType: 'general',
    title: 'Declining Sense of Community in Neighbourhoods',
    minWords: 250,
    timeLimitMinutes: 40,
    category: 'two_part_question',
    chartData: null,
    promptText: `Many people say that neighbours today interact with each other far less than in the past, leading to a weaker sense of community.

Why has this happened, and what consequences does it have for neighbourhoods?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
  },
];
