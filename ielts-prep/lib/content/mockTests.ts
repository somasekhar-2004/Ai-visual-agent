import type { MockSection, MockTest } from '@/types/models';

// AUTO-GENERATED once by scripts/tmp-build-mocktests.ts from the full content
// library, then committed as normal hand-editable content. 6 Academic + 6
// General Training full mock tests, each with unique Listening/Reading/
// Writing/Speaking content — no test reuses another test's content.

export const mockTests: MockTest[] = [
  {
    "id": "60000000-0000-0000-0000-000000000001",
    "title": "IELTS Academic Full Mock Test 1",
    "ieltsType": "academic",
    "testNumber": 1,
    "difficulty": "easy",
    "isFree": true
  },
  {
    "id": "60000000-0000-0000-0000-000000000002",
    "title": "IELTS Academic Full Mock Test 2",
    "ieltsType": "academic",
    "testNumber": 2,
    "difficulty": "medium",
    "isFree": false
  },
  {
    "id": "60000000-0000-0000-0000-000000000003",
    "title": "IELTS Academic Full Mock Test 3",
    "ieltsType": "academic",
    "testNumber": 3,
    "difficulty": "medium",
    "isFree": false
  },
  {
    "id": "60000000-0000-0000-0000-000000000004",
    "title": "IELTS Academic Full Mock Test 4",
    "ieltsType": "academic",
    "testNumber": 4,
    "difficulty": "hard",
    "isFree": false
  },
  {
    "id": "60000000-0000-0000-0000-000000000005",
    "title": "IELTS Academic Full Mock Test 5",
    "ieltsType": "academic",
    "testNumber": 5,
    "difficulty": "hard",
    "isFree": false
  },
  {
    "id": "60000000-0000-0000-0000-000000000006",
    "title": "IELTS Academic Full Mock Test 6",
    "ieltsType": "academic",
    "testNumber": 6,
    "difficulty": "hard",
    "isFree": false
  },
  {
    "id": "70000000-0000-0000-0000-000000000001",
    "title": "IELTS General Training Full Mock Test 1",
    "ieltsType": "general",
    "testNumber": 1,
    "difficulty": "easy",
    "isFree": true
  },
  {
    "id": "70000000-0000-0000-0000-000000000002",
    "title": "IELTS General Training Full Mock Test 2",
    "ieltsType": "general",
    "testNumber": 2,
    "difficulty": "medium",
    "isFree": false
  },
  {
    "id": "70000000-0000-0000-0000-000000000003",
    "title": "IELTS General Training Full Mock Test 3",
    "ieltsType": "general",
    "testNumber": 3,
    "difficulty": "medium",
    "isFree": false
  },
  {
    "id": "70000000-0000-0000-0000-000000000004",
    "title": "IELTS General Training Full Mock Test 4",
    "ieltsType": "general",
    "testNumber": 4,
    "difficulty": "hard",
    "isFree": false
  },
  {
    "id": "70000000-0000-0000-0000-000000000005",
    "title": "IELTS General Training Full Mock Test 5",
    "ieltsType": "general",
    "testNumber": 5,
    "difficulty": "hard",
    "isFree": false
  },
  {
    "id": "70000000-0000-0000-0000-000000000006",
    "title": "IELTS General Training Full Mock Test 6",
    "ieltsType": "general",
    "testNumber": 6,
    "difficulty": "hard",
    "isFree": false
  }
] as MockTest[];

export const mockSections: MockSection[] = [
  {
    "id": "ms-academic-1-listening",
    "mockTestId": "60000000-0000-0000-0000-000000000001",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "30000000-0000-0000-0000-000000000001",
        "31000000-0000-0000-0000-000000000001",
        "31000000-0000-0000-0000-000000000002",
        "30000000-0000-0000-0000-000000000002"
      ]
    }
  },
  {
    "id": "ms-academic-1-reading",
    "mockTestId": "60000000-0000-0000-0000-000000000001",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "20000000-0000-0000-0000-000000000001",
        "23000000-0000-0000-0000-000000000001",
        "23000000-0000-0000-0000-000000000002"
      ]
    }
  },
  {
    "id": "ms-academic-1-writing",
    "mockTestId": "60000000-0000-0000-0000-000000000001",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "40000000-0000-0000-0000-000000000001",
        "40000000-0000-0000-0000-000000000003"
      ]
    }
  },
  {
    "id": "ms-academic-1-speaking",
    "mockTestId": "60000000-0000-0000-0000-000000000001",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "50000000-0000-0000-0000-000000000001",
        "50000000-0000-0000-0000-000000000003",
        "50000000-0000-0000-0000-000000000005"
      ]
    }
  },
  {
    "id": "ms-academic-2-listening",
    "mockTestId": "60000000-0000-0000-0000-000000000002",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "31000000-0000-0000-0000-000000000003",
        "31000000-0000-0000-0000-000000000004",
        "31000000-0000-0000-0000-000000000005",
        "31000000-0000-0000-0000-000000000006"
      ]
    }
  },
  {
    "id": "ms-academic-2-reading",
    "mockTestId": "60000000-0000-0000-0000-000000000002",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "21000000-0000-0000-0000-000000000001",
        "21000000-0000-0000-0000-000000000002",
        "21000000-0000-0000-0000-000000000003"
      ]
    }
  },
  {
    "id": "ms-academic-2-writing",
    "mockTestId": "60000000-0000-0000-0000-000000000002",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "42000000-0000-0000-0000-000000000001",
        "40000000-0000-0000-0000-000000000005"
      ]
    }
  },
  {
    "id": "ms-academic-2-speaking",
    "mockTestId": "60000000-0000-0000-0000-000000000002",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "50000000-0000-0000-0000-000000000002",
        "50000000-0000-0000-0000-000000000004",
        "50000000-0000-0000-0000-000000000006"
      ]
    }
  },
  {
    "id": "ms-academic-3-listening",
    "mockTestId": "60000000-0000-0000-0000-000000000003",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "32000000-0000-0000-0000-000000000001",
        "32000000-0000-0000-0000-000000000002",
        "32000000-0000-0000-0000-000000000003",
        "32000000-0000-0000-0000-000000000004"
      ]
    }
  },
  {
    "id": "ms-academic-3-reading",
    "mockTestId": "60000000-0000-0000-0000-000000000003",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "21000000-0000-0000-0000-000000000004",
        "21000000-0000-0000-0000-000000000005",
        "21000000-0000-0000-0000-000000000006"
      ]
    }
  },
  {
    "id": "ms-academic-3-writing",
    "mockTestId": "60000000-0000-0000-0000-000000000003",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "42000000-0000-0000-0000-000000000002",
        "42000000-0000-0000-0000-000000000034"
      ]
    }
  },
  {
    "id": "ms-academic-3-speaking",
    "mockTestId": "60000000-0000-0000-0000-000000000003",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "52000000-0000-0000-0000-000000000001",
        "52000000-0000-0000-0000-000000000002",
        "52000000-0000-0000-0000-000000000003"
      ]
    }
  },
  {
    "id": "ms-academic-4-listening",
    "mockTestId": "60000000-0000-0000-0000-000000000004",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "33000000-0000-0000-0000-000000000001",
        "33000000-0000-0000-0000-000000000002",
        "33000000-0000-0000-0000-000000000003",
        "33000000-0000-0000-0000-000000000004"
      ]
    }
  },
  {
    "id": "ms-academic-4-reading",
    "mockTestId": "60000000-0000-0000-0000-000000000004",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "23000000-0000-0000-0000-000000000003",
        "23000000-0000-0000-0000-000000000004",
        "23000000-0000-0000-0000-000000000005"
      ]
    }
  },
  {
    "id": "ms-academic-4-writing",
    "mockTestId": "60000000-0000-0000-0000-000000000004",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "42000000-0000-0000-0000-000000000003",
        "42000000-0000-0000-0000-000000000035"
      ]
    }
  },
  {
    "id": "ms-academic-4-speaking",
    "mockTestId": "60000000-0000-0000-0000-000000000004",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "52000000-0000-0000-0000-000000000004",
        "52000000-0000-0000-0000-000000000005",
        "52000000-0000-0000-0000-000000000006"
      ]
    }
  },
  {
    "id": "ms-academic-5-listening",
    "mockTestId": "60000000-0000-0000-0000-000000000005",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "34000000-0000-0000-0000-000000000001",
        "34000000-0000-0000-0000-000000000002",
        "34000000-0000-0000-0000-000000000003",
        "34000000-0000-0000-0000-000000000004"
      ]
    }
  },
  {
    "id": "ms-academic-5-reading",
    "mockTestId": "60000000-0000-0000-0000-000000000005",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "24000000-0000-0000-0000-000000000001",
        "24000000-0000-0000-0000-000000000002",
        "24000000-0000-0000-0000-000000000003"
      ]
    }
  },
  {
    "id": "ms-academic-5-writing",
    "mockTestId": "60000000-0000-0000-0000-000000000005",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "42000000-0000-0000-0000-000000000004",
        "42000000-0000-0000-0000-000000000036"
      ]
    }
  },
  {
    "id": "ms-academic-5-speaking",
    "mockTestId": "60000000-0000-0000-0000-000000000005",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "52000000-0000-0000-0000-000000000007",
        "52000000-0000-0000-0000-000000000008",
        "52000000-0000-0000-0000-000000000009"
      ]
    }
  },
  {
    "id": "ms-academic-6-listening",
    "mockTestId": "60000000-0000-0000-0000-000000000006",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "34000000-0000-0000-0000-000000000005",
        "34000000-0000-0000-0000-000000000006",
        "34000000-0000-0000-0000-000000000007",
        "34000000-0000-0000-0000-000000000008"
      ]
    }
  },
  {
    "id": "ms-academic-6-reading",
    "mockTestId": "60000000-0000-0000-0000-000000000006",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "24000000-0000-0000-0000-000000000004",
        "24000000-0000-0000-0000-000000000005",
        "24000000-0000-0000-0000-000000000006"
      ]
    }
  },
  {
    "id": "ms-academic-6-writing",
    "mockTestId": "60000000-0000-0000-0000-000000000006",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "42000000-0000-0000-0000-000000000005",
        "42000000-0000-0000-0000-000000000037"
      ]
    }
  },
  {
    "id": "ms-academic-6-speaking",
    "mockTestId": "60000000-0000-0000-0000-000000000006",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "52000000-0000-0000-0000-000000000010",
        "52000000-0000-0000-0000-000000000011",
        "52000000-0000-0000-0000-000000000012"
      ]
    }
  },
  {
    "id": "ms-general-1-listening",
    "mockTestId": "70000000-0000-0000-0000-000000000001",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "34000000-0000-0000-0000-000000000009",
        "34000000-0000-0000-0000-000000000010",
        "34000000-0000-0000-0000-000000000011",
        "34000000-0000-0000-0000-000000000012"
      ]
    }
  },
  {
    "id": "ms-general-1-reading",
    "mockTestId": "70000000-0000-0000-0000-000000000001",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "20000000-0000-0000-0000-000000000002",
        "25000000-0000-0000-0000-000000000001",
        "25000000-0000-0000-0000-000000000002"
      ]
    }
  },
  {
    "id": "ms-general-1-writing",
    "mockTestId": "70000000-0000-0000-0000-000000000001",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "40000000-0000-0000-0000-000000000002",
        "40000000-0000-0000-0000-000000000004"
      ]
    }
  },
  {
    "id": "ms-general-1-speaking",
    "mockTestId": "70000000-0000-0000-0000-000000000001",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "52000000-0000-0000-0000-000000000013",
        "52000000-0000-0000-0000-000000000014",
        "52000000-0000-0000-0000-000000000015"
      ]
    }
  },
  {
    "id": "ms-general-2-listening",
    "mockTestId": "70000000-0000-0000-0000-000000000002",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "35000000-0000-0000-0000-000000000001",
        "35000000-0000-0000-0000-000000000002",
        "35000000-0000-0000-0000-000000000003",
        "35000000-0000-0000-0000-000000000004"
      ]
    }
  },
  {
    "id": "ms-general-2-reading",
    "mockTestId": "70000000-0000-0000-0000-000000000002",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "22000000-0000-0000-0000-000000000001",
        "22000000-0000-0000-0000-000000000002",
        "22000000-0000-0000-0000-000000000003"
      ]
    }
  },
  {
    "id": "ms-general-2-writing",
    "mockTestId": "70000000-0000-0000-0000-000000000002",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "42000000-0000-0000-0000-000000000015",
        "42000000-0000-0000-0000-000000000062"
      ]
    }
  },
  {
    "id": "ms-general-2-speaking",
    "mockTestId": "70000000-0000-0000-0000-000000000002",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "52000000-0000-0000-0000-000000000016",
        "52000000-0000-0000-0000-000000000017",
        "52000000-0000-0000-0000-000000000018"
      ]
    }
  },
  {
    "id": "ms-general-3-listening",
    "mockTestId": "70000000-0000-0000-0000-000000000003",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "35000000-0000-0000-0000-000000000005",
        "35000000-0000-0000-0000-000000000006",
        "35000000-0000-0000-0000-000000000007",
        "35000000-0000-0000-0000-000000000008"
      ]
    }
  },
  {
    "id": "ms-general-3-reading",
    "mockTestId": "70000000-0000-0000-0000-000000000003",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "22000000-0000-0000-0000-000000000004",
        "22000000-0000-0000-0000-000000000005",
        "22000000-0000-0000-0000-000000000006"
      ]
    }
  },
  {
    "id": "ms-general-3-writing",
    "mockTestId": "70000000-0000-0000-0000-000000000003",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "42000000-0000-0000-0000-000000000016",
        "42000000-0000-0000-0000-000000000063"
      ]
    }
  },
  {
    "id": "ms-general-3-speaking",
    "mockTestId": "70000000-0000-0000-0000-000000000003",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "52000000-0000-0000-0000-000000000019",
        "52000000-0000-0000-0000-000000000020",
        "52000000-0000-0000-0000-000000000021"
      ]
    }
  },
  {
    "id": "ms-general-4-listening",
    "mockTestId": "70000000-0000-0000-0000-000000000004",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "35000000-0000-0000-0000-000000000009",
        "35000000-0000-0000-0000-000000000010",
        "35000000-0000-0000-0000-000000000011",
        "35000000-0000-0000-0000-000000000012"
      ]
    }
  },
  {
    "id": "ms-general-4-reading",
    "mockTestId": "70000000-0000-0000-0000-000000000004",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "25000000-0000-0000-0000-000000000003",
        "25000000-0000-0000-0000-000000000004",
        "25000000-0000-0000-0000-000000000005"
      ]
    }
  },
  {
    "id": "ms-general-4-writing",
    "mockTestId": "70000000-0000-0000-0000-000000000004",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "42000000-0000-0000-0000-000000000017",
        "42000000-0000-0000-0000-000000000064"
      ]
    }
  },
  {
    "id": "ms-general-4-speaking",
    "mockTestId": "70000000-0000-0000-0000-000000000004",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "52000000-0000-0000-0000-000000000022",
        "52000000-0000-0000-0000-000000000023",
        "52000000-0000-0000-0000-000000000024"
      ]
    }
  },
  {
    "id": "ms-general-5-listening",
    "mockTestId": "70000000-0000-0000-0000-000000000005",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "36000000-0000-0000-0000-000000000001",
        "36000000-0000-0000-0000-000000000002",
        "36000000-0000-0000-0000-000000000003",
        "36000000-0000-0000-0000-000000000004"
      ]
    }
  },
  {
    "id": "ms-general-5-reading",
    "mockTestId": "70000000-0000-0000-0000-000000000005",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "26000000-0000-0000-0000-000000000001",
        "26000000-0000-0000-0000-000000000002",
        "26000000-0000-0000-0000-000000000003"
      ]
    }
  },
  {
    "id": "ms-general-5-writing",
    "mockTestId": "70000000-0000-0000-0000-000000000005",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "42000000-0000-0000-0000-000000000018",
        "42000000-0000-0000-0000-000000000065"
      ]
    }
  },
  {
    "id": "ms-general-5-speaking",
    "mockTestId": "70000000-0000-0000-0000-000000000005",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "52000000-0000-0000-0000-000000000025",
        "52000000-0000-0000-0000-000000000026",
        "52000000-0000-0000-0000-000000000027"
      ]
    }
  },
  {
    "id": "ms-general-6-listening",
    "mockTestId": "70000000-0000-0000-0000-000000000006",
    "skill": "listening",
    "orderIndex": 1,
    "durationMinutes": 30,
    "contentRef": {
      "trackIds": [
        "36000000-0000-0000-0000-000000000005",
        "36000000-0000-0000-0000-000000000006",
        "36000000-0000-0000-0000-000000000007",
        "36000000-0000-0000-0000-000000000008"
      ]
    }
  },
  {
    "id": "ms-general-6-reading",
    "mockTestId": "70000000-0000-0000-0000-000000000006",
    "skill": "reading",
    "orderIndex": 2,
    "durationMinutes": 60,
    "contentRef": {
      "passageIds": [
        "26000000-0000-0000-0000-000000000004",
        "26000000-0000-0000-0000-000000000005",
        "26000000-0000-0000-0000-000000000006"
      ]
    }
  },
  {
    "id": "ms-general-6-writing",
    "mockTestId": "70000000-0000-0000-0000-000000000006",
    "skill": "writing",
    "orderIndex": 3,
    "durationMinutes": 60,
    "contentRef": {
      "writingPromptIds": [
        "42000000-0000-0000-0000-000000000019",
        "42000000-0000-0000-0000-000000000066"
      ]
    }
  },
  {
    "id": "ms-general-6-speaking",
    "mockTestId": "70000000-0000-0000-0000-000000000006",
    "skill": "speaking",
    "orderIndex": 4,
    "durationMinutes": 14,
    "contentRef": {
      "speakingTopicIds": [
        "52000000-0000-0000-0000-000000000028",
        "52000000-0000-0000-0000-000000000029",
        "52000000-0000-0000-0000-000000000030"
      ]
    }
  }
] as MockSection[];
