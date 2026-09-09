import fs from 'node:fs';
import path from 'node:path';

import { allListeningTracks, allSpeakingTopics, content } from '@/lib/content';
import { audioRegistry } from '@/lib/content/audioRegistry';

function duplicateIds(items: { id: string }[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const item of items) {
    if (seen.has(item.id)) dupes.add(item.id);
    seen.add(item.id);
  }
  return Array.from(dupes);
}

describe('content library — no duplicate IDs', () => {
  it('reading passages have unique IDs', () => {
    expect(duplicateIds(content.readingPassages)).toEqual([]);
  });
  it('reading + listening questions have unique IDs', () => {
    expect(duplicateIds(content.allQuestions)).toEqual([]);
  });
  it('listening tracks have unique IDs', () => {
    expect(duplicateIds(content.listeningTracks)).toEqual([]);
  });
  it('writing prompts have unique IDs', () => {
    expect(duplicateIds(content.writingPrompts)).toEqual([]);
  });
  it('speaking topics have unique IDs', () => {
    expect(duplicateIds(allSpeakingTopics)).toEqual([]);
  });
  it('vocabulary words have unique IDs', () => {
    expect(duplicateIds(content.vocabularyWords)).toEqual([]);
  });
  it('grammar lessons have unique IDs', () => {
    expect(duplicateIds(content.grammarLessons)).toEqual([]);
  });
  it('grammar questions have unique IDs', () => {
    expect(duplicateIds(content.grammarQuestions)).toEqual([]);
  });
  it('mock tests have unique IDs', () => {
    expect(duplicateIds(content.mockTests)).toEqual([]);
  });
  it('mock sections have unique IDs', () => {
    expect(duplicateIds(content.mockSections)).toEqual([]);
  });
  it('achievements have unique IDs', () => {
    expect(duplicateIds(content.achievements)).toEqual([]);
  });
  it('lessons have unique IDs', () => {
    expect(duplicateIds(content.lessons)).toEqual([]);
  });
});

describe('content library — no duplicate content', () => {
  it('has no two vocabulary words with the same lowercased word text', () => {
    const seen = new Map<string, string[]>();
    for (const w of content.vocabularyWords) {
      const key = w.word.trim().toLowerCase();
      seen.set(key, [...(seen.get(key) ?? []), w.id]);
    }
    const dupes = Array.from(seen.entries()).filter(([, ids]) => ids.length > 1);
    expect(dupes).toEqual([]);
  });

  it('has no two reading passages with identical titles', () => {
    const seen = new Map<string, string[]>();
    for (const p of content.readingPassages) {
      seen.set(p.title, [...(seen.get(p.title) ?? []), p.id]);
    }
    const dupes = Array.from(seen.entries()).filter(([, ids]) => ids.length > 1);
    expect(dupes).toEqual([]);
  });

  it('has no two listening tracks with identical titles', () => {
    const seen = new Map<string, string[]>();
    for (const t of content.listeningTracks) {
      seen.set(t.title, [...(seen.get(t.title) ?? []), t.id]);
    }
    const dupes = Array.from(seen.entries()).filter(([, ids]) => ids.length > 1);
    expect(dupes).toEqual([]);
  });
});

describe('reading — passage/question mapping', () => {
  it('every reading question references a passage that exists', () => {
    const passageIds = new Set(content.readingPassages.map((p) => p.id));
    const readingQs = content.allQuestions.filter((q) => q.skill === 'reading');
    const orphans = readingQs.filter((q) => !q.passageId || !passageIds.has(q.passageId));
    expect(orphans.map((q) => q.id)).toEqual([]);
  });

  it('every reading passage is referenced by at least one question', () => {
    const referenced = new Set(content.allQuestions.filter((q) => q.skill === 'reading').map((q) => q.passageId));
    const unused = content.readingPassages.filter((p) => !referenced.has(p.id));
    expect(unused.map((p) => p.id)).toEqual([]);
  });

  it('academic and general reading passages are clearly separated by ieltsType', () => {
    for (const p of content.readingPassages) {
      expect(['academic', 'general']).toContain(p.ieltsType);
    }
  });

  it('reading question types are reasonably balanced (no single type is >50% of all reading questions)', () => {
    const readingQs = content.allQuestions.filter((q) => q.skill === 'reading');
    const counts = new Map<string, number>();
    for (const q of readingQs) counts.set(q.questionType, (counts.get(q.questionType) ?? 0) + 1);
    const max = Math.max(...counts.values());
    expect(max / readingQs.length).toBeLessThan(0.5);
  });
});

describe('listening — track/question mapping', () => {
  it('every listening question references a track that exists', () => {
    const trackIds = new Set(content.listeningTracks.map((t) => t.id));
    const listeningQs = content.allQuestions.filter((q) => q.skill === 'listening');
    const orphans = listeningQs.filter((q) => !q.listeningTrackId || !trackIds.has(q.listeningTrackId));
    expect(orphans.map((q) => q.id)).toEqual([]);
  });

  it('every listening track is referenced by at least one question', () => {
    const referenced = new Set(content.allQuestions.filter((q) => q.skill === 'listening').map((q) => q.listeningTrackId));
    const unused = content.listeningTracks.filter((t) => !referenced.has(t.id));
    expect(unused.map((t) => t.id)).toEqual([]);
  });

  it('every listening track has a non-empty transcript', () => {
    const empty = content.listeningTracks.filter((t) => !t.transcript || t.transcript.trim().length < 20);
    expect(empty.map((t) => t.id)).toEqual([]);
  });
});

describe('listening — structured turns (multi-speaker audio pipeline)', () => {
  // Tracks migrated to `turns` are the ones scripts/generate-audio.ts will
  // synthesize as real, multi-speaker, label-free audio. A track without
  // `turns` is left alone on purpose (see that script's header comment) —
  // it keeps using the legacy single-voice/on-device-TTS path until it's
  // migrated in a later batch.
  const withTurns = content.listeningTracks.filter((t) => t.turns && t.turns.length > 0);

  it('has at least one track migrated to the structured multi-speaker pipeline', () => {
    expect(withTurns.length).toBeGreaterThan(0);
  });

  it('every turn has a non-empty speaker and non-empty text', () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      t.turns!.forEach((turn, i) => {
        if (!turn.speaker.trim()) problems.push(`${t.id}[${i}]: empty speaker`);
        if (!turn.text.trim()) problems.push(`${t.id}[${i}]: empty text`);
      });
    }
    expect(problems).toEqual([]);
  });

  it('no turn text speaks a "Speaker:" label aloud — turns.text must be spoken words only', () => {
    // Catches the exact defect that made every existing track (including
    // all 74 Astra-sourced ones) speak "RECEPTIONIST:", "TUTOR:", etc. as
    // part of the audio: turns.speaker is structural metadata, never
    // spoken, so turns.text must never start with a label-like prefix.
    const labelPattern = /^\s*[A-Z][A-Za-z .'-]{0,24}:\s/;
    const problems: string[] = [];
    for (const t of withTurns) {
      t.turns!.forEach((turn, i) => {
        if (labelPattern.test(turn.text)) problems.push(`${t.id}[${i}] ("${turn.speaker}"): text looks like it starts with a spoken label — "${turn.text.slice(0, 30)}..."`);
      });
    }
    expect(problems).toEqual([]);
  });

  it("every turn's text is a verbatim excerpt of the track's transcript (no drift between the two representations)", () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      for (const turn of t.turns!) {
        if (!t.transcript.includes(turn.text)) problems.push(`${t.id}: turn text not found verbatim in transcript — "${turn.text.slice(0, 40)}..."`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('a Section 1 or Section 3 track (conversation/discussion) with turns has more than one distinct speaker', () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      if (t.sectionNumber === 1 || t.sectionNumber === 3) {
        const speakers = new Set(t.turns!.map((turn) => turn.speaker));
        if (speakers.size < 2) problems.push(`${t.id} (section ${t.sectionNumber}): only ${speakers.size} distinct speaker(s) — real IELTS Section 1/3 audio is multi-speaker`);
      }
    }
    expect(problems).toEqual([]);
  });

  it('a Section 2 or Section 4 track (monologue/lecture) with turns has exactly one speaker', () => {
    const problems: string[] = [];
    for (const t of withTurns) {
      if (t.sectionNumber === 2 || t.sectionNumber === 4) {
        const speakers = new Set(t.turns!.map((turn) => turn.speaker));
        if (speakers.size !== 1) problems.push(`${t.id} (section ${t.sectionNumber}): ${speakers.size} distinct speakers — real IELTS Section 2/4 audio is a single speaker`);
      }
    }
    expect(problems).toEqual([]);
  });
});

describe('mock tests — structure and uniqueness', () => {
  it('has at least 16 Academic and 16 General Training full mock tests', () => {
    const academic = content.mockTests.filter((t) => t.ieltsType === 'academic');
    const general = content.mockTests.filter((t) => t.ieltsType === 'general');
    expect(academic.length).toBeGreaterThanOrEqual(16);
    expect(general.length).toBeGreaterThanOrEqual(16);
  });

  it('every mock section references a mock test that exists', () => {
    const testIds = new Set(content.mockTests.map((t) => t.id));
    const orphans = content.mockSections.filter((s) => !testIds.has(s.mockTestId));
    expect(orphans.map((s) => s.id)).toEqual([]);
  });

  it('every mock test has all 4 skill sections', () => {
    const bySkillCount = new Map<string, Set<string>>();
    for (const s of content.mockSections) {
      const set = bySkillCount.get(s.mockTestId) ?? new Set<string>();
      set.add(s.skill);
      bySkillCount.set(s.mockTestId, set);
    }
    for (const test of content.mockTests) {
      const skills = bySkillCount.get(test.id) ?? new Set();
      expect(Array.from(skills).sort()).toEqual(['listening', 'reading', 'speaking', 'writing']);
    }
  });

  it('every content reference inside a mock section resolves to real content', () => {
    const passageIds = new Set(content.readingPassages.map((p) => p.id));
    const trackIds = new Set(content.listeningTracks.map((t) => t.id));
    const questionIds = new Set(content.allQuestions.map((q) => q.id));
    const promptIds = new Set(content.writingPrompts.map((p) => p.id));
    const speakingTopicIds = new Set(allSpeakingTopics.map((t) => t.id));

    const problems: string[] = [];
    for (const section of content.mockSections) {
      const ref = section.contentRef;
      for (const id of ref.passageIds ?? []) if (!passageIds.has(id)) problems.push(`${section.id}: bad passageId ${id}`);
      for (const id of ref.trackIds ?? []) if (!trackIds.has(id)) problems.push(`${section.id}: bad trackId ${id}`);
      for (const id of ref.questionIds ?? []) if (!questionIds.has(id)) problems.push(`${section.id}: bad questionId ${id}`);
      for (const id of ref.writingPromptIds ?? []) if (!promptIds.has(id)) problems.push(`${section.id}: bad writingPromptId ${id}`);
      for (const id of ref.speakingTopicIds ?? []) if (!speakingTopicIds.has(id)) problems.push(`${section.id}: bad speakingTopicId ${id}`);
    }
    expect(problems).toEqual([]);
  });

  it('no two mock tests reuse the same reading passage (Reading must always be unique per mock)', () => {
    const owner = new Map<string, string>();
    const collisions: string[] = [];
    for (const section of content.mockSections) {
      for (const id of section.contentRef.passageIds ?? []) {
        const existingOwner = owner.get(id);
        if (existingOwner && existingOwner !== section.mockTestId) collisions.push(`${id} used by both ${existingOwner} and ${section.mockTestId}`);
        owner.set(id, section.mockTestId);
      }
    }
    expect(collisions).toEqual([]);
  });

  it('a listening track or writing prompt is never reused by more than 2 mock tests (real IELTS shares Listening + Task 2 essays between one Academic/General pair only, never across unrelated mocks)', () => {
    const owners = new Map<string, Set<string>>();
    for (const section of content.mockSections) {
      for (const id of [...(section.contentRef.trackIds ?? []), ...(section.contentRef.writingPromptIds ?? [])]) {
        const set = owners.get(id) ?? new Set<string>();
        set.add(section.mockTestId);
        owners.set(id, set);
      }
    }
    const overused = Array.from(owners.entries()).filter(([, mockIds]) => mockIds.size > 2);
    expect(overused.map(([id, mockIds]) => `${id} used by ${mockIds.size} mocks`)).toEqual([]);
  });

  it('has at least one free mock test for each IELTS type', () => {
    const freeAcademic = content.mockTests.some((t) => t.ieltsType === 'academic' && t.isFree);
    const freeGeneral = content.mockTests.some((t) => t.ieltsType === 'general' && t.isFree);
    expect(freeAcademic).toBe(true);
    expect(freeGeneral).toBe(true);
  });
});

describe('speaking — coherent Part1/Part2/Part3 groups', () => {
  it('every group has a Part 1, Part 2, and Part 3 topic', () => {
    const byGroup = new Map<string, Set<string>>();
    for (const t of allSpeakingTopics) {
      const set = byGroup.get(t.groupId) ?? new Set<string>();
      set.add(t.part);
      byGroup.set(t.groupId, set);
    }
    const incomplete = Array.from(byGroup.entries()).filter(([, parts]) => !['part1', 'part2', 'part3'].every((p) => parts.has(p)));
    expect(incomplete.map(([groupId]) => groupId)).toEqual([]);
  });

  it('every Part 2 topic has cue card text and every Part 1/3 topic has questions', () => {
    const problems: string[] = [];
    for (const t of allSpeakingTopics) {
      if (t.part === 'part2' && (!t.cueCardText || t.cueCardText.trim().length < 10)) problems.push(`${t.id}: missing cue card`);
      if (t.part !== 'part2' && (!t.questions || t.questions.length === 0)) problems.push(`${t.id}: missing questions`);
    }
    expect(problems).toEqual([]);
  });
});

describe('vocabulary + grammar — content depth', () => {
  it('has at least 750 vocabulary words across at least 20 topics', () => {
    expect(content.vocabularyWords.length).toBeGreaterThanOrEqual(750);
    expect(content.vocabularyTopics.length).toBeGreaterThanOrEqual(20);
  });

  it('every vocabulary word has a definition, example sentence, and at least one synonym or collocation', () => {
    const problems = content.vocabularyWords.filter(
      (w) => !w.definition?.trim() || !w.exampleSentence?.trim() || (w.synonyms.length === 0 && w.collocations.length === 0),
    );
    expect(problems.map((w) => w.id)).toEqual([]);
  });

  it('has at least 40 grammar lessons and 250 grammar questions', () => {
    expect(content.grammarLessons.length).toBeGreaterThanOrEqual(40);
    expect(content.grammarQuestions.length).toBeGreaterThanOrEqual(250);
  });

  it('every grammar question has a correct answer and an explanation', () => {
    const problems = content.grammarQuestions.filter((q) => !q.correctAnswer?.trim() || !q.explanation?.trim());
    expect(problems.map((q) => q.id)).toEqual([]);
  });

  it('every multiple-choice grammar question has its correct answer among its options', () => {
    const problems = content.grammarQuestions.filter(
      (q) => q.questionType === 'multiple_choice' && q.options && !q.options.includes(q.correctAnswer),
    );
    expect(problems.map((q) => q.id)).toEqual([]);
  });
});

describe('writing prompts — library depth', () => {
  it('meets the minimum count per task/IELTS-type combination', () => {
    const count = (taskType: string, ieltsType: string) =>
      content.writingPrompts.filter((p) => p.taskType === taskType && p.ieltsType === ieltsType).length;
    expect(count('task1_academic', 'academic')).toBeGreaterThanOrEqual(25);
    expect(count('task1_general', 'general')).toBeGreaterThanOrEqual(30);
    expect(content.writingPrompts.filter((p) => p.taskType === 'task2' && p.ieltsType === 'academic').length).toBeGreaterThanOrEqual(50);
    expect(content.writingPrompts.filter((p) => p.taskType === 'task2' && p.ieltsType === 'general').length).toBeGreaterThanOrEqual(50);
  });

  it('every Academic Task 1 prompt with chart data has a renderable chart type', () => {
    const academic1 = content.writingPrompts.filter((p) => p.taskType === 'task1_academic');
    const missingChart = academic1.filter((p) => !p.chartData);
    expect(missingChart.map((p) => p.id)).toEqual([]);
  });
});

describe('audio — every registry entry resolves to a real bundled file', () => {
  const audioDir = path.join(__dirname, '..', 'assets', 'audio');

  it('every audioRegistry entry has a corresponding .mp3 file on disk', () => {
    const missing = Object.keys(audioRegistry).filter((trackId) => !fs.existsSync(path.join(audioDir, `${trackId}.mp3`)));
    expect(missing).toEqual([]);
  });

  it('every audioRegistry key is a real listening track id (no stale/orphaned entries)', () => {
    const trackIds = new Set(allListeningTracks.map((t) => t.id));
    const orphanKeys = Object.keys(audioRegistry).filter((id) => !trackIds.has(id));
    expect(orphanKeys).toEqual([]);
  });

  it('has at least 70 listening tracks backed by real generated audio (not just TTS fallback)', () => {
    expect(Object.keys(audioRegistry).length).toBeGreaterThanOrEqual(70);
  });

  it('every .mp3 file physically present under assets/audio is registered under some track id (no orphan files)', () => {
    const files = fs.readdirSync(audioDir).filter((f) => f.endsWith('.mp3'));
    const registered = new Set(Object.keys(audioRegistry));
    const orphanFiles = files.filter((f) => !registered.has(f.replace(/\.mp3$/, '')));
    expect(orphanFiles).toEqual([]);
  });
});
