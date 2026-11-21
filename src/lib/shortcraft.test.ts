import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STARTER_DRAFT,
  computeTotalScriptWordCount,
  countSpokenWords,
  formatFullScriptForCopy,
  getResolvedThumbnailPrompts,
  getTargetWordRange,
  getTimeBlocksForDuration,
  removeDraftFromHistory,
  upsertDraftInHistory,
  validateTopic,
  type ShortPackage,
} from './shortcraft';

test('validateTopic rejects empty, whitespace, short, and oversized topics', () => {
  assert.equal(validateTopic('').valid, false);
  assert.equal(validateTopic('   ').valid, false);
  assert.equal(validateTopic('abc').valid, false);
  assert.equal(validateTopic('a'.repeat(281)).valid, false);

  const valid = validateTopic('  3   editing tricks   for Reels  ');
  assert.equal(valid.valid, true);
  assert.equal(valid.normalized, '3 editing tricks for Reels');
});

test('countSpokenWords handles English, Hinglish, Hindi Devanagari, and bracketed stage notes', () => {
  assert.equal(countSpokenWords(''), 0);
  assert.equal(countSpokenWords('Stop scrolling right now!'), 4);
  assert.equal(countSpokenWords('Ye reel save karo [pause] aur try karo.'), 7);
  assert.equal(countSpokenWords('अगर आपके रील्स पर व्यूज नहीं आ रहे'), 8);
});

test('computeTotalScriptWordCount sums spoken narration across all segments', () => {
  const total = computeTotalScriptWordCount(STARTER_DRAFT.script);
  assert.equal(total > 50, true);
  assert.equal(
    total,
    STARTER_DRAFT.script.reduce(
      (sum, seg) => sum + countSpokenWords(seg.spokenNarration),
      0
    )
  );
});

test('getTargetWordRange scales monotonically with duration', () => {
  const r15 = getTargetWordRange(15);
  const r25 = getTargetWordRange(25);
  const r45 = getTargetWordRange(45);
  const r60 = getTargetWordRange(60);

  assert.equal(r15.max < r25.min, true);
  assert.equal(r25.max < r45.min, true);
  assert.equal(r45.max < r60.min, true);
});

test('getTimeBlocksForDuration starts at 0:00 and ends at target duration', () => {
  assert.equal(getTimeBlocksForDuration(15).Hook.startsWith('0:00'), true);
  assert.equal(getTimeBlocksForDuration(15)['Payoff / CTA'].endsWith('0:15'), true);
  assert.equal(getTimeBlocksForDuration(45)['Payoff / CTA'].endsWith('0:45'), true);
  assert.equal(getTimeBlocksForDuration(60)['Payoff / CTA'].endsWith('0:60'), true);
});

test('formatFullScriptForCopy includes metadata, time ranges, spoken narration, and visual cues', () => {
  const formatted = formatFullScriptForCopy(STARTER_DRAFT);
  assert.match(formatted, /Instagram Reels/);
  assert.match(formatted, /\[0:00–0:03\] Hook/);
  assert.match(formatted, /Spoken:/);
  assert.match(formatted, /Visual:/);
  assert.match(formatted, /Estimated spoken length:/);
});

test('history upsert and removal preserve ordering, uniqueness, and max limit', () => {
  const draftA: ShortPackage = { ...STARTER_DRAFT, id: 'a', topic: 'Topic A' };
  const draftB: ShortPackage = { ...STARTER_DRAFT, id: 'b', topic: 'Topic B' };
  const draftAUpdated: ShortPackage = { ...STARTER_DRAFT, id: 'a', topic: 'Topic A v2' };

  let history = upsertDraftInHistory([], draftA, 2);
  history = upsertDraftInHistory(history, draftB, 2);
  assert.deepEqual(
    history.map((d) => d.id),
    ['b', 'a']
  );

  history = upsertDraftInHistory(history, draftAUpdated, 2);
  assert.deepEqual(
    history.map((d) => d.id),
    ['a', 'b']
  );
  assert.equal(history[0].topic, 'Topic A v2');

  const draftC: ShortPackage = { ...STARTER_DRAFT, id: 'c', topic: 'Topic C' };
  history = upsertDraftInHistory(history, draftC, 2);
  assert.deepEqual(
    history.map((d) => d.id),
    ['c', 'a']
  );

  history = removeDraftFromHistory(history, 'c');
  assert.deepEqual(
    history.map((d) => d.id),
    ['a']
  );
});

test('getResolvedThumbnailPrompts preserves explicit prompts and synthesizes fallback prompts for legacy drafts', () => {
  const resolvedStarter = getResolvedThumbnailPrompts(STARTER_DRAFT.thumbnailSynergy);
  assert.equal(
    resolvedStarter.canvaCleanPrompt,
    STARTER_DRAFT.thumbnailSynergy.imagePrompts?.canvaCleanPrompt
  );
  assert.match(resolvedStarter.bingTextPrompt, /2-LINE DM FIX/);

  const legacySynergy = {
    thumbnailText: 'STOP BATTERY DRAIN',
    visualConcept: 'Close-up of smartphone battery icon at 4% in dark studio lighting.',
    titleVariants: ['3 Settings Draining Your iPhone Battery'],
  };
  const fallback = getResolvedThumbnailPrompts(legacySynergy, {
    platform: 'YouTube Shorts',
  });
  assert.match(fallback.canvaCleanPrompt, /9:16/);
  assert.match(fallback.canvaCleanPrompt, /no text/i);
  assert.match(fallback.bingTextPrompt, /STOP BATTERY DRAIN/);
  assert.match(fallback.bingTextPrompt, /9:16/);
});
