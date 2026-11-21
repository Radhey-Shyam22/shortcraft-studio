import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  DURATIONS,
  HOOK_ANGLES,
  LANGUAGES,
  PLATFORMS,
  SCRIPT_STAGES,
  TONES,
  computeTotalScriptWordCount,
  countSpokenWords,
  getResolvedThumbnailPrompts,
  getTargetWordRange,
  getTimeBlocksForDuration,
  validateTopic,
  type DurationSeconds,
  type GenerationRequest,
  type HookAngle,
  type HookItem,
  type LanguageStyle,
  type Platform,
  type RefinementMode,
  type ScriptSegment,
  type ScriptStage,
  type ShortPackage,
  type ToneOption,
} from './src/lib/shortcraft.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Add your Gemini API key in Settings > Secrets.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function isValidPlatform(val: unknown): val is Platform {
  return typeof val === 'string' && (PLATFORMS as readonly string[]).includes(val);
}

function isValidDuration(val: unknown): val is DurationSeconds {
  return typeof val === 'number' && (DURATIONS as readonly number[]).includes(val);
}

function isValidLanguage(val: unknown): val is LanguageStyle {
  return typeof val === 'string' && (LANGUAGES as readonly string[]).includes(val);
}

function isValidTone(val: unknown): val is ToneOption {
  return typeof val === 'string' && (TONES as readonly string[]).includes(val);
}

function isValidRefinement(val: unknown): val is RefinementMode {
  return val === 'shorter' || val === 'punchier' || val === 'regenerate';
}

function getLanguageGuidance(language: LanguageStyle): string {
  switch (language) {
    case 'Hinglish':
      return 'Write spoken lines, hooks, and titles in natural conversational Hinglish (Roman script mixing natural Hindi + everyday English words, the way top Indian creators speak on Reels/Shorts—never stiff textbook translation). Visual cues stay in clear English.';
    case 'Hindi':
      return 'Write spoken narration, hooks, and title variants in natural, crisp spoken Hindi using Devanagari script with relatable creator phrasing. Visual cues and stage labels stay concise in English for production clarity.';
    case 'English':
      return 'Write all spoken lines, hooks, thumbnail text, and titles in sharp, conversational, zero-fluff English.';
  }
}

function getPlatformGuidance(platform: Platform): string {
  switch (platform) {
    case 'YouTube Shorts':
      return 'Optimize for YouTube Shorts: strong visual/curiosity open in first 1.5s, seamless loop potential, crisp mid-video pattern interrupt, and search-friendly yet clickable title variants.';
    case 'Instagram Reels':
      return 'Optimize for Instagram Reels: save/share-worthy utility or contrarian insight, clean on-screen text rhythm, relatable hook, and a save/send-oriented CTA.';
    case 'TikTok':
      return 'Optimize for TikTok: immediate conversational hook, fast pacing with no preamble, comment-sparking tension or POV framing, and punchy payoff.';
  }
}

function getRefinementGuidance(
  refinement?: RefinementMode,
  previousPackage?: ShortPackage
): string {
  if (!refinement || !previousPackage) {
    return '';
  }

  const prevSummary = JSON.stringify({
    hooks: previousPackage.hooks.map((h) => h.text),
    script: previousPackage.script.map((s) => ({
      stage: s.stage,
      spokenNarration: s.spokenNarration,
    })),
    thumbnailText: previousPackage.thumbnailSynergy.thumbnailText,
  });

  if (refinement === 'shorter') {
    return `\nREFINEMENT MODE: MAKE SHORTER\nTighten the previous draft (${prevSummary}) by trimming filler words by ~25%. Make every hook 6-9 words max, cut unnecessary transitions, and hit the core insight faster without losing clarity.`;
  }
  if (refinement === 'punchier') {
    return `\nREFINEMENT MODE: MORE PUNCHY\nUpgrade the previous draft (${prevSummary}) with sharper contrast, stronger active verbs, bolder pattern interrupts in the visual cues, and higher-curiosity opening hooks.`;
  }
  return `\nREFINEMENT MODE: REGENERATE FRESH ANGLE\nCreate a completely fresh creative angle different from the previous draft (${prevSummary}). Do not reuse the same hook phrasing, opening metaphor, or thumbnail wording.`;
}

const packageResponseSchema = {
  type: Type.OBJECT,
  properties: {
    hooks: {
      type: Type.ARRAY,
      description: 'Exactly 5 opening hooks covering the 5 required angles.',
      items: {
        type: Type.OBJECT,
        properties: {
          angle: {
            type: Type.STRING,
            description:
              'One of: Curiosity, Shock / Myth-Busting, Contrarian, Direct Value, Relatable',
          },
          text: {
            type: Type.STRING,
            description: 'Hook line strictly under 12 words.',
          },
        },
        required: ['angle', 'text'],
      },
    },
    script: {
      type: Type.ARRAY,
      description: 'Exactly 4 sequential script segments.',
      items: {
        type: Type.OBJECT,
        properties: {
          stage: {
            type: Type.STRING,
            description: 'One of: Hook, Setup / Twist, Core Value, Payoff / CTA',
          },
          timeRange: {
            type: Type.STRING,
            description: 'Time block e.g. 0:00–0:03',
          },
          spokenNarration: {
            type: Type.STRING,
            description: 'Exact spoken lines to say on camera.',
          },
          visualCue: {
            type: Type.STRING,
            description: 'Concrete camera, B-roll, framing, or on-screen text cue.',
          },
        },
        required: ['stage', 'timeRange', 'spokenNarration', 'visualCue'],
      },
    },
    thumbnailSynergy: {
      type: Type.OBJECT,
      properties: {
        thumbnailText: {
          type: Type.STRING,
          description:
            'Bold 2-4 word thumbnail text whose core hook directly matches the proposed title variants.',
        },
        visualConcept: {
          type: Type.STRING,
          description:
            'Detailed art direction covering subject/expression, props from the script visual cues, lighting, color contrast, and negative space placement.',
        },
        titleVariants: {
          type: Type.ARRAY,
          description: 'Exactly 3 distinct high-CTR title variants aligned with thumbnailText.',
          items: { type: Type.STRING },
        },
        imagePrompts: {
          type: Type.OBJECT,
          description: 'Exact copy-ready text-to-image prompts for free image generators.',
          properties: {
            canvaCleanPrompt: {
              type: Type.STRING,
              description:
                'Copy-ready prompt for Canva Magic Media / clean scene generators: 9:16 vertical, concrete visual scene from the script, explicit negative space for text, ending with no text/letters.',
            },
            bingTextPrompt: {
              type: Type.STRING,
              description:
                'Copy-ready prompt for Bing Image Creator / Ideogram: 9:16 vertical scene that renders the exact quoted thumbnailText in bold high-contrast typography.',
            },
          },
          required: ['canvaCleanPrompt', 'bingTextPrompt'],
        },
      },
      required: ['thumbnailText', 'visualConcept', 'titleVariants', 'imagePrompts'],
    },
  },
  required: ['hooks', 'script', 'thumbnailSynergy'],
};

function isTransientOrUnavailable(error: unknown): boolean {
  const errObj = error as { status?: number; name?: string; message?: string };
  const statusCode = typeof errObj?.status === 'number' ? errObj.status : undefined;
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    statusCode === 503 ||
    statusCode === 500 ||
    statusCode === 504 ||
    errObj?.name === 'TimeoutError' ||
    errObj?.name === 'AbortError' ||
    msg.includes('503') ||
    msg.includes('unavailable') ||
    msg.includes('deadline_exceeded') ||
    msg.includes('high demand') ||
    msg.includes('timed out') ||
    msg.includes('abort')
  );
}

let primaryCooldownUntil = 0;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function generatePackageWithFallback(
  ai: GoogleGenAI,
  systemInstruction: string,
  userPrompt: string
) {
  const now = Date.now();
  if (now >= primaryCooldownUntil) {
    try {
      return await withTimeout(
        ai.models.generateContent({
          model: PRIMARY_MODEL,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: packageResponseSchema,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        }),
        8500,
        PRIMARY_MODEL
      );
    } catch (primaryError) {
      if (!isTransientOrUnavailable(primaryError)) {
        throw primaryError;
      }
      primaryCooldownUntil = Date.now() + 60_000;
      console.warn(
        `[ShortCraft] Primary model ${PRIMARY_MODEL} unavailable/slow, cooling down 60s and falling back to ${FALLBACK_MODEL}.`
      );
    }
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await withTimeout(
        ai.models.generateContent({
          model: FALLBACK_MODEL,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: packageResponseSchema,
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          },
        }),
        11000,
        FALLBACK_MODEL
      );
    } catch (fallbackError) {
      if (!isTransientOrUnavailable(fallbackError) || attempt === 1) {
        throw fallbackError;
      }
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  throw new Error('Generation failed after fallback attempts.');
}

interface RawModelResponse {
  hooks?: Array<{ angle?: string; text?: string }>;
  script?: Array<{
    stage?: string;
    timeRange?: string;
    spokenNarration?: string;
    visualCue?: string;
  }>;
  thumbnailSynergy?: {
    thumbnailText?: string;
    visualConcept?: string;
    titleVariants?: string[];
    imagePrompts?: {
      canvaCleanPrompt?: string;
      bingTextPrompt?: string;
    };
  };
}

function normalizeGeneratedPackage(
  raw: RawModelResponse,
  req: {
    topic: string;
    platform: Platform;
    duration: DurationSeconds;
    language: LanguageStyle;
    tone: ToneOption;
    refinement?: RefinementMode;
  }
): ShortPackage {
  const defaultBlocks = getTimeBlocksForDuration(req.duration);

  const rawHooks = Array.isArray(raw.hooks) ? raw.hooks : [];
  const hooks: HookItem[] = HOOK_ANGLES.map((angle, idx) => {
    const matched =
      rawHooks.find((h) => h.angle?.toLowerCase() === angle.toLowerCase()) ??
      rawHooks[idx];
    const text = (matched?.text ?? '').trim();
    return {
      angle: angle as HookAngle,
      text: text || `${req.topic.slice(0, 48)}...`,
      wordCount: countSpokenWords(text),
    };
  });

  const rawScript = Array.isArray(raw.script) ? raw.script : [];
  const script: ScriptSegment[] = SCRIPT_STAGES.map((stage, idx) => {
    const matched =
      rawScript.find((s) => s.stage?.toLowerCase() === stage.toLowerCase()) ??
      rawScript[idx];
    return {
      stage: stage as ScriptStage,
      timeRange: (matched?.timeRange || defaultBlocks[stage]).trim(),
      spokenNarration: (matched?.spokenNarration || '').trim(),
      visualCue: (matched?.visualCue || '').trim(),
    };
  });

  const titleVariants = Array.isArray(raw.thumbnailSynergy?.titleVariants)
    ? raw.thumbnailSynergy!.titleVariants
        .map((t) => String(t).trim())
        .filter(Boolean)
        .slice(0, 3)
    : [];

  while (titleVariants.length < 3) {
    titleVariants.push(`${req.topic} (${req.platform})`);
  }

  const thumbnailText = (raw.thumbnailSynergy?.thumbnailText || 'STOP DOING THIS').trim();
  const visualConcept = (
    raw.thumbnailSynergy?.visualConcept ||
    'Tight vertical portrait frame with high-contrast subject separation and clean 2-4 word overlay at upper third.'
  ).trim();
  const imagePrompts = getResolvedThumbnailPrompts(
    {
      thumbnailText,
      visualConcept,
      titleVariants,
      imagePrompts: {
        canvaCleanPrompt: raw.thumbnailSynergy?.imagePrompts?.canvaCleanPrompt?.trim() || '',
        bingTextPrompt: raw.thumbnailSynergy?.imagePrompts?.bingTextPrompt?.trim() || '',
      },
    },
    { topic: req.topic, platform: req.platform }
  );

  const totalWordCount = computeTotalScriptWordCount(script);
  const refinementNote =
    req.refinement === 'shorter'
      ? 'Tightened for faster pacing'
      : req.refinement === 'punchier'
        ? 'Sharpened hooks & contrast'
        : req.refinement === 'regenerate'
          ? 'Fresh angle variation'
          : undefined;

  return {
    id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    topic: req.topic,
    platform: req.platform,
    duration: req.duration,
    language: req.language,
    tone: req.tone,
    refinementNote,
    hooks,
    script,
    totalWordCount,
    thumbnailSynergy: {
      thumbnailText,
      visualConcept,
      titleVariants,
      imagePrompts,
    },
  };
}

function mapGeminiError(error: unknown): { status: number; message: string } {
  const errObj = error as { status?: number; message?: string };
  const statusCode = typeof errObj?.status === 'number' ? errObj.status : undefined;
  const rawMessage = error instanceof Error ? error.message : String(error);
  const lower = rawMessage.toLowerCase();

  if (lower.includes('gemini_api_key is not configured')) {
    return { status: 500, message: rawMessage };
  }
  if (
    statusCode === 403 ||
    statusCode === 401 ||
    lower.includes('api_key_invalid') ||
    lower.includes('permission_denied') ||
    lower.includes('access_token_scope_insufficient')
  ) {
    return {
      status: 403,
      message:
        'Gemini API access was denied. Check your GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (statusCode === 429 || lower.includes('resource_exhausted')) {
    return {
      status: 429,
      message:
        'Rate limit reached for the Gemini API. Wait a few seconds and try again.',
    };
  }
  if (statusCode === 404 || lower.includes('not_found')) {
    return {
      status: 502,
      message: 'Configured Gemini model was unavailable. Please retry shortly.',
    };
  }
  if (statusCode === 400 || lower.includes('invalid_argument')) {
    return {
      status: 400,
      message:
        'The AI request could not be processed for that input. Try adjusting your topic or options.',
    };
  }
  if (isTransientOrUnavailable(error)) {
    return {
      status: 503,
      message:
        'The AI service is experiencing temporary high demand. Please wait a few seconds and tap Retry.',
    };
  }
  return {
    status: 500,
    message:
      'Could not generate your short-form package right now. Please try again in a moment.',
  };
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/generate', async (req: Request, res: Response) => {
    try {
      const body = req.body as Partial<GenerationRequest>;
      const topicCheck = validateTopic(typeof body.topic === 'string' ? body.topic : '');
      if (!topicCheck.valid) {
        res.status(400).json({ error: topicCheck.error });
        return;
      }

      if (!isValidPlatform(body.platform)) {
        res.status(400).json({ error: 'Select a valid platform.' });
        return;
      }
      if (!isValidDuration(body.duration)) {
        res.status(400).json({ error: 'Select a valid target duration (15s, 25s, 45s, or 60s).' });
        return;
      }
      if (!isValidLanguage(body.language)) {
        res.status(400).json({ error: 'Select a valid language style.' });
        return;
      }
      if (!isValidTone(body.tone)) {
        res.status(400).json({ error: 'Select a valid tone.' });
        return;
      }

      const refinement = isValidRefinement(body.refinement) ? body.refinement : undefined;
      const ai = getGeminiClient();
      const wordBudget = getTargetWordRange(body.duration);
      const timeBlocks = getTimeBlocksForDuration(body.duration);

      const systemInstruction = `You are a senior short-form retention strategist and scriptwriter for YouTube Shorts, Instagram Reels, and TikTok.
Output valid JSON matching the requested schema. Never include markdown wrappers or commentary.

Rules you must follow:
1. Opening Hooks (5 items): Must cover each of these 5 exact angles in order: Curiosity, Shock / Myth-Busting, Contrarian, Direct Value, Relatable. Every hook MUST be strictly under 12 spoken words and immediately scroll-stopping in the first 3 seconds.
2. Time-Blocked Script (4 segments): Must cover these exact 4 stages in order:
   - "Hook" (${timeBlocks.Hook})
   - "Setup / Twist" (${timeBlocks['Setup / Twist']})
   - "Core Value" (${timeBlocks['Core Value']})
   - "Payoff / CTA" (${timeBlocks['Payoff / CTA']})
   Total spokenNarration across all 4 segments must realistically fit ${body.duration} seconds at natural creator cadence (${wordBudget.min}–${wordBudget.max} total spoken words). Keep spoken lines natural, rhythmic, and ready to read off a teleprompter. Visual cues must be concrete and actionable (camera framing, cut timing, on-screen text, B-roll).
3. Thumbnail & Title Synergy:
   - thumbnailText: Strictly 2 to 4 bold, high-contrast words whose core promise matches and reinforces all 3 titleVariants (never contradictory or generic).
   - titleVariants: Exactly 3 distinct, punchy title variations that expand on thumbnailText rather than repeating it word-for-word.
   - visualConcept: Detailed art direction drawn directly from the script's visual cues and titles—describe subject pose/expression, key prop or screen element, lighting, background palette, and where negative space sits for the text overlay.
   - imagePrompts.canvaCleanPrompt: Complete, copy-ready English prompt for Canva Magic Media or clean scene generators (must specify 9:16 vertical framing, concrete subject/props/lighting from visualConcept, open negative space in the upper third for manual text placement, and end with "no text, no letters, no watermark").
   - imagePrompts.bingTextPrompt: Complete, copy-ready English prompt for Bing Image Creator / Ideogram (must specify 9:16 vertical framing, concrete scene from visualConcept, and explicitly quote the exact thumbnailText string inside double quotes so the generator renders matching headline text in bold high-contrast typography).
4. ${getLanguageGuidance(body.language)}
5. ${getPlatformGuidance(body.platform)}
6. Tone: ${body.tone}.`;

      const userPrompt = `Topic: "${topicCheck.normalized}"
Platform: ${body.platform}
Target Duration: ${body.duration} seconds (target spoken word budget: ${wordBudget.min}-${wordBudget.max} words)
Language / Style: ${body.language}
Tone: ${body.tone}${getRefinementGuidance(refinement, body.previousPackage)}`;

      const response = await generatePackageWithFallback(
        ai,
        systemInstruction,
        userPrompt
      );

      const rawText = (response.text ?? '')
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      if (!rawText) {
        throw new Error('Empty response received from Gemini API.');
      }

      const parsed = JSON.parse(rawText) as RawModelResponse;
      const pkg = normalizeGeneratedPackage(parsed, {
        topic: topicCheck.normalized,
        platform: body.platform,
        duration: body.duration,
        language: body.language,
        tone: body.tone,
        refinement,
      });

      res.json({ package: pkg });
    } catch (error) {
      console.error('[ShortCraft API Error]', error);
      const mapped = mapGeminiError(error);
      res.status(mapped.status).json({ error: mapped.message });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('/{*splat}', (_req: Request, res: Response) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShortCraft Studio server listening on http://localhost:${PORT}`);
  });
}

createApp().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
