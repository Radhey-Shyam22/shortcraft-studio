export type Platform = 'YouTube Shorts' | 'Instagram Reels' | 'TikTok';

export type DurationSeconds = 15 | 25 | 45 | 60;

export type LanguageStyle = 'Hinglish' | 'Hindi' | 'English';

export type ToneOption =
  | 'Energetic & Curious'
  | 'Bold & Contrarian'
  | 'Direct & Practical'
  | 'Story-driven';

export type HookAngle =
  | 'Curiosity'
  | 'Shock / Myth-Busting'
  | 'Contrarian'
  | 'Direct Value'
  | 'Relatable';

export type ScriptStage =
  | 'Hook'
  | 'Setup / Twist'
  | 'Core Value'
  | 'Payoff / CTA';

export type RefinementMode = 'shorter' | 'punchier' | 'regenerate';

export interface HookItem {
  angle: HookAngle;
  text: string;
  wordCount: number;
}

export interface ScriptSegment {
  stage: ScriptStage;
  timeRange: string;
  spokenNarration: string;
  visualCue: string;
}

export interface ThumbnailImagePrompts {
  canvaCleanPrompt: string;
  bingTextPrompt: string;
}

export interface ThumbnailTitleSynergy {
  thumbnailText: string;
  visualConcept: string;
  titleVariants: string[];
  imagePrompts?: ThumbnailImagePrompts;
}

export interface ShortPackage {
  id: string;
  createdAt: string;
  topic: string;
  platform: Platform;
  duration: DurationSeconds;
  language: LanguageStyle;
  tone: ToneOption;
  refinementNote?: string;
  hooks: HookItem[];
  script: ScriptSegment[];
  totalWordCount: number;
  thumbnailSynergy: ThumbnailTitleSynergy;
}

export interface GenerationRequest {
  topic: string;
  platform: Platform;
  duration: DurationSeconds;
  language: LanguageStyle;
  tone: ToneOption;
  refinement?: RefinementMode;
  previousPackage?: ShortPackage;
}

export const PLATFORMS: readonly Platform[] = [
  'YouTube Shorts',
  'Instagram Reels',
  'TikTok',
];

export const DURATIONS: readonly DurationSeconds[] = [15, 25, 45, 60];

export const LANGUAGES: readonly LanguageStyle[] = [
  'Hinglish',
  'Hindi',
  'English',
];

export const TONES: readonly ToneOption[] = [
  'Energetic & Curious',
  'Bold & Contrarian',
  'Direct & Practical',
  'Story-driven',
];

export const HOOK_ANGLES: readonly HookAngle[] = [
  'Curiosity',
  'Shock / Myth-Busting',
  'Contrarian',
  'Direct Value',
  'Relatable',
];

export const SCRIPT_STAGES: readonly ScriptStage[] = [
  'Hook',
  'Setup / Twist',
  'Core Value',
  'Payoff / CTA',
];

export interface TopicPreset {
  label: string;
  topic: string;
  suggestedPlatform: Platform;
  suggestedDuration: DurationSeconds;
  suggestedLanguage: LanguageStyle;
  suggestedTone: ToneOption;
}

export const TOPIC_PRESETS: readonly TopicPreset[] = [
  {
    label: 'Cold DM Mistake',
    topic: 'Why 90% of cold DMs get ignored and the 2-line fix that gets replies',
    suggestedPlatform: 'Instagram Reels',
    suggestedDuration: 25,
    suggestedLanguage: 'Hinglish',
    suggestedTone: 'Bold & Contrarian',
  },
  {
    label: 'iPhone Battery Drain',
    topic: '3 hidden iPhone background settings silently draining your battery every day',
    suggestedPlatform: 'YouTube Shorts',
    suggestedDuration: 25,
    suggestedLanguage: 'English',
    suggestedTone: 'Direct & Practical',
  },
  {
    label: 'Savings Account Trap',
    topic: 'Why keeping all your money in a regular savings account in your 20s loses value',
    suggestedPlatform: 'TikTok',
    suggestedDuration: 45,
    suggestedLanguage: 'Hinglish',
    suggestedTone: 'Energetic & Curious',
  },
];

export const HISTORY_STORAGE_KEY = 'shortcraft_studio_history_v1';
export const HISTORY_INIT_KEY = 'shortcraft_studio_initialized_v1';
export const MAX_HISTORY_ITEMS = 25;

export function validateTopic(rawTopic: string): {
  valid: boolean;
  error?: string;
  normalized: string;
} {
  const normalized = rawTopic.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return {
      valid: false,
      error: 'Enter a topic or pick a preset below before generating.',
      normalized: '',
    };
  }
  if (normalized.length < 4) {
    return {
      valid: false,
      error: 'Add a little more context (at least 4 characters) so the hooks stay specific.',
      normalized,
    };
  }
  if (normalized.length > 280) {
    return {
      valid: false,
      error: 'Keep your topic under 280 characters for a focused short-form script.',
      normalized,
    };
  }
  return { valid: true, normalized };
}

export function countSpokenWords(text: string): number {
  const cleaned = text
    .trim()
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[.,!?;:"'()—–\-/|\\]+/g, ' ')
    .trim();
  if (!cleaned) {
    return 0;
  }
  return cleaned.split(/\s+/).filter(Boolean).length;
}

export function computeTotalScriptWordCount(segments: readonly ScriptSegment[]): number {
  return segments.reduce(
    (sum, segment) => sum + countSpokenWords(segment.spokenNarration),
    0
  );
}

export function getTargetWordRange(duration: DurationSeconds): {
  min: number;
  max: number;
} {
  switch (duration) {
    case 15:
      return { min: 30, max: 42 };
    case 25:
      return { min: 52, max: 70 };
    case 45:
      return { min: 95, max: 122 };
    case 60:
      return { min: 130, max: 162 };
  }
}

export function getTimeBlocksForDuration(duration: DurationSeconds): Record<ScriptStage, string> {
  switch (duration) {
    case 15:
      return {
        Hook: '0:00–0:03',
        'Setup / Twist': '0:03–0:06',
        'Core Value': '0:06–0:12',
        'Payoff / CTA': '0:12–0:15',
      };
    case 25:
      return {
        Hook: '0:00–0:03',
        'Setup / Twist': '0:03–0:09',
        'Core Value': '0:09–0:20',
        'Payoff / CTA': '0:20–0:25',
      };
    case 45:
      return {
        Hook: '0:00–0:03',
        'Setup / Twist': '0:03–0:12',
        'Core Value': '0:12–0:36',
        'Payoff / CTA': '0:36–0:45',
      };
    case 60:
      return {
        Hook: '0:00–0:04',
        'Setup / Twist': '0:04–0:15',
        'Core Value': '0:15–0:48',
        'Payoff / CTA': '0:48–0:60',
      };
  }
}

export function formatFullScriptForCopy(pkg: ShortPackage): string {
  const header = [
    `${pkg.topic}`,
    `${pkg.platform} · ${pkg.duration}s · ${pkg.language} · ${pkg.tone}`,
    `Estimated spoken length: ${pkg.totalWordCount} words`,
    '',
  ];

  const blocks = pkg.script.flatMap((segment) => [
    `[${segment.timeRange}] ${segment.stage}`,
    `Spoken: ${segment.spokenNarration}`,
    `Visual: ${segment.visualCue}`,
    '',
  ]);

  return [...header, ...blocks].join('\n').trim();
}

export function upsertDraftInHistory(
  history: readonly ShortPackage[],
  draft: ShortPackage,
  maxItems: number = MAX_HISTORY_ITEMS
): ShortPackage[] {
  const filtered = history.filter((item) => item.id !== draft.id);
  return [draft, ...filtered].slice(0, maxItems);
}

export function removeDraftFromHistory(
  history: readonly ShortPackage[],
  id: string
): ShortPackage[] {
  return history.filter((item) => item.id !== id);
}

export function formatShortTimestamp(isoString: string): string {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return 'Saved draft';
  }
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getResolvedThumbnailPrompts(
  synergy: ThumbnailTitleSynergy,
  context?: { topic?: string; platform?: Platform }
): ThumbnailImagePrompts {
  const existingCanva = synergy.imagePrompts?.canvaCleanPrompt?.trim();
  const existingBing = synergy.imagePrompts?.bingTextPrompt?.trim();

  if (existingCanva && existingBing) {
    return {
      canvaCleanPrompt: existingCanva,
      bingTextPrompt: existingBing,
    };
  }

  const platformNote = context?.platform
    ? `for a ${context.platform} vertical cover`
    : 'for a short-form vertical video cover';
  const sceneBase = synergy.visualConcept.trim();
  const overlayText = synergy.thumbnailText.trim();

  return {
    canvaCleanPrompt:
      existingCanva ||
      `9:16 vertical creator thumbnail background ${platformNote}, ${sceneBase} Dramatic directional rim lighting, crisp subject separation, shallow depth of field, clean uncluttered negative space in the upper third for text overlay, photorealistic editorial photography, no text, no letters, no watermark.`,
    bingTextPrompt:
      existingBing ||
      `9:16 vertical high-CTR short-form video thumbnail ${platformNote}, ${sceneBase} Bold sans-serif headline text "${overlayText}" placed cleanly in the upper third with high-contrast white fill and dark drop shadow, dramatic studio rim lighting, sharp focal clarity, photorealistic editorial style.`,
  };
}

export const STARTER_DRAFT: ShortPackage = {
  id: 'starter-draft-cold-dm',
  createdAt: '2026-11-18T10:30:00.000Z',
  topic: 'Why 90% of cold DMs get ignored and the 2-line fix that gets replies',
  platform: 'Instagram Reels',
  duration: 25,
  language: 'Hinglish',
  tone: 'Bold & Contrarian',
  hooks: [
    {
      angle: 'Curiosity',
      text: 'Your cold DMs fail before they even open the first line.',
      wordCount: 11,
    },
    {
      angle: 'Shock / Myth-Busting',
      text: 'Long portfolio DMs are why clients leave you on seen.',
      wordCount: 10,
    },
    {
      angle: 'Contrarian',
      text: 'Stop introducing yourself in cold DMs—do this instead.',
      wordCount: 8,
    },
    {
      angle: 'Direct Value',
      text: 'Copy this two-line DM formula to double client replies today.',
      wordCount: 10,
    },
    {
      angle: 'Relatable',
      text: 'Sending 50 DMs daily and still getting zero replies?',
      wordCount: 9,
    },
  ],
  script: [
    {
      stage: 'Hook',
      timeRange: '0:00–0:03',
      spokenNarration:
        'Agar aapke cold DMs seen pe chhoot rahe hain, toh galti aapki skill mein nahi hai.',
      visualCue:
        'Tight close-up face-to-camera, sharp snap-zoom on "seen", bold white caption "STOP THIS DM".',
    },
    {
      stage: 'Setup / Twist',
      timeRange: '0:03–0:09',
      spokenNarration:
        'Log pehli line mein apna resume chipka dete hain—aur busy founders do second mein skip kar dete hain.',
      visualCue:
        'Split screen: blurry wall-of-text DM on phone with red cross overlay, fast cut back to desk.',
    },
    {
      stage: 'Core Value',
      timeRange: '0:09–0:20',
      spokenNarration:
        'Instead, sirf do lines bhejo: pehli line mein unke recent post ya funnel ki ek specific bottleneck point out karo, aur doosri line mein bina pitch ke ek 30-second fix offer karo.',
      visualCue:
        'On-screen two-line DM template card sliding up word by word as each part is spoken.',
    },
    {
      stage: 'Payoff / CTA',
      timeRange: '0:20–0:25',
      spokenNarration:
        'Chhota observation plus zero-friction ask equals reply. Ye reel save karo aur aaj paanch DMs test karo.',
      visualCue:
        'Hold up two fingers, punch-in frame on "Save", end screen pointing to save icon.',
    },
  ],
  totalWordCount: 68,
  thumbnailSynergy: {
    thumbnailText: '2-LINE DM FIX',
    visualConcept:
      'Close-up vertical portrait of a focused creator in a dimly lit studio holding up two fingers in one hand and a smartphone in the other. Split-contrast glow on the phone screen: a blurred rejected long message faded in muted red on the left side, contrasted with a sharp highlighted 2-line message bubble in crisp emerald-white on the right. Dark charcoal backdrop with subtle coral-warm rim light and clear upper-third negative space.',
    titleVariants: [
      'Why Your Cold DMs Get Left on Seen (2-Line Fix)',
      'Stop Sending Long Cold DMs — Use This 2-Line Script',
      'The 2-Line Hinglish DM Formula Clients Actually Reply To',
    ],
    imagePrompts: {
      canvaCleanPrompt:
        '9:16 vertical editorial studio portrait of a young creator in dark minimalist attire holding up two fingers while showing a smartphone toward the camera. The phone screen contrasts a blurred long ignored message in faint red with a crisp highlighted two-line message reply in clean bright white. Moody charcoal background, subtle warm coral rim light on shoulders, shallow depth of field, open uncluttered dark negative space in the top third for bold headline placement, photorealistic, no text, no letters, no watermark.',
      bingTextPrompt:
        '9:16 vertical high-contrast Instagram Reels cover photo of a focused creator in a moody dark studio holding up two fingers beside a smartphone displaying a highlighted two-line chat reply. In the upper third negative space, bold condensed sans-serif typography reading "2-LINE DM FIX" in crisp white with a subtle dark shadow, warm coral edge lighting, sharp commercial photography style.',
    },
  },
};
