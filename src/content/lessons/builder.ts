import type {
  BigPictureStep,
  BridgeNote,
  CodeSample,
  Concept,
  Hint,
  Lesson,
  LessonIconId,
  LessonKind,
  LessonVisual,
  Mistake,
  QuizQuestion,
  ReviewCard,
  SourceLink,
  WorkedStep,
} from "../types";
import { PHASES, SCHEDULE_BLOCKS, TOTAL_DAYS } from "../schedule";
import { lessonIdForDay } from "../library";

export const PHASE_COVERS: Record<number, string> = {
  1: "/assets/illustrations/phase-1-python.jpg",
  2: "/assets/illustrations/phase-2-data-ml.jpg",
  3: "/assets/illustrations/phase-3-llm.jpg",
  4: "/assets/illustrations/phase-4-rag-agents.jpg",
  5: "/assets/illustrations/phase-5-ops-security.jpg",
  6: "/assets/illustrations/phase-6-capstone.jpg",
};

const AI_LOOP_ALT =
  "แผนภาพวงจรวิศวกรรม AI: Problem → Data → Model → Evaluation → App → Monitor แล้ววนกลับไปจุดเริ่มต้นผ่านลูกศร feedback";

const AI_LOOP_STAGE_NAME: Record<number, string> = {
  0: "Problem",
  1: "Data",
  2: "Model",
  3: "Evaluation",
  4: "App",
  5: "Monitor",
  6: "Feedback",
};

export interface LessonBlueprint {
  day: number;
  titleTh: string;
  tagline: string;
  icon: LessonIconId;
  visual: LessonVisual;
  coverImage?: string;
  requiresApiKey?: boolean;
  apiKeyNote?: string;
  tools?: string[];
  /** 2–4 focused connections to the AI Engineering Loop (nodes 0..6) */
  bigPicture: Array<{ node: 0 | 1 | 2 | 3 | 4 | 5 | 6; heading: string; body: string; lessonNote: string }>;
  objectives: string[];
  prerequisites: string[];
  setup: {
    intro: string;
    commands: string;
    commandLang?: CodeSample["language"];
    steps: Array<[string, string]>;
    note?: string;
  };
  concepts: Array<{
    id: string;
    title: string;
    paragraphs: string[];
    analogy: string;
    bullets?: string[];
    code?: CodeSample;
    whyTitle: string;
    whyParagraphs: string[];
  }>;
  bridges: {
    web: { title: string; body: string[]; table?: Array<[string, string]> };
    student: { title: string; body: string[] };
  };
  workedExample: {
    intro: string;
    steps: WorkedStep[];
    gotcha: string;
  };
  practice: {
    intro: string;
    requirements: string[];
    starter: CodeSample;
    verification: CodeSample;
    selfCheck: string[];
    acceptance: string;
    hints: [
      { body: string },
      { body: string },
      { body: string; code?: CodeSample },
    ];
    localRun: CodeSample;
  };
  mistakes: Mistake[];
  quiz: {
    intro?: string;
    questions: QuizQuestion[];
  };
  takeaways: string[];
  reviewCards: ReviewCard[];
  sources: SourceLink[];
  glossary: string[];
  graduationNote?: string;
}

function getScheduleMeta(day: number): {
  kind: LessonKind;
  blockId: string;
  titleEn: string;
  phase: { index: number; title: string };
  tools: string[];
  recommendedDays: number[];
  reviewsDays: number[];
  nextDayTitle: string | null;
  nextReviewDay: number;
} {
  const blockIndex = Math.ceil(day / 4) - 1;
  const block = SCHEDULE_BLOCKS[blockIndex];
  if (!block) throw new Error(`No schedule block for day ${day}`);

  const phase = PHASES.find((p) => day >= p.from && day <= p.to);
  if (!phase) throw new Error(`No phase for day ${day}`);

  const offset = day - block.from;
  const studyDays = [block.from, block.from + 1, block.from + 2];
  const isReview = offset === 3;
  const kind: LessonKind = isReview ? block.review.kind : "lesson";
  const rawTitle = isReview ? block.review.title : block.days[offset];
  const titleEn =
    kind === "review"
      ? `Review: ${rawTitle}`
      : kind === "checkpoint"
        ? `Checkpoint: ${rawTitle}`
        : rawTitle;

  const recommendedDays = isReview
    ? studyDays
    : offset > 0
      ? studyDays.slice(0, offset)
      : day > 1
        ? [day - 1]
        : [];
  const reviewsDays = isReview ? studyDays : [];

  let nextDayTitle: string | null = null;
  if (day < TOTAL_DAYS) {
    const nextDay = day + 1;
    const nextBlock = SCHEDULE_BLOCKS[Math.ceil(nextDay / 4) - 1];
    const nextOffset = nextDay - nextBlock.from;
    const nextRaw = nextOffset === 3 ? nextBlock.review.title : nextBlock.days[nextOffset];
    nextDayTitle =
      nextOffset === 3 && nextBlock.review.kind === "review"
        ? `Review: ${nextRaw}`
        : nextOffset === 3 && nextBlock.review.kind === "checkpoint"
          ? `Checkpoint: ${nextRaw}`
          : nextRaw;
  }

  const nextReviewDay = isReview ? Math.min(TOTAL_DAYS, day + 4) : block.from + 3;

  return {
    kind,
    blockId: block.id,
    titleEn,
    phase: { index: phase.index, title: phase.title },
    tools: block.tools,
    recommendedDays,
    reviewsDays,
    nextDayTitle,
    nextReviewDay,
  };
}

export const OFFLINE_CHECKER_NOTICE =
  "โจทย์ฝึกปฏิบัติบนเครื่องของคุณ (Offline Practice Prompt) — บทเรียนนี้ยังไม่มีระบบส่งคำตอบหรือตรวจโค้ดอัตโนมัติในเบราว์เซอร์ ให้คัดลอกโค้ดไปรันและตรวจสอบด้วยตัวเองตามเช็กลิสต์ด้านล่าง";

/** Concise helper to build a validated 4-option multiple-choice QuizQuestion. */
export function mc(
  id: string,
  prompt: string,
  options: [
    [string, string],
    [string, string],
    [string, string],
    [string, string],
  ],
  answer: "A" | "B" | "C" | "D",
  explanation: string,
  reviewPrompt: string,
  reviewAnswer: string,
): QuizQuestion {
  const letters = ["A", "B", "C", "D"] as const;
  return {
    id,
    prompt,
    options: options.map(([text, why], idx) => ({ id: letters[idx], text, why })),
    answer,
    explanation,
    review: { prompt: reviewPrompt, answer: reviewAnswer },
  };
}

/** Concise helper to build a spaced-repetition ReviewCard. */
export function rc(id: string, prompt: string, answer: string): ReviewCard {
  return { id, prompt, answer };
}

/**
 * Assemble a complete, type-safe `Lesson` for Days 2–180 from a compact `LessonBlueprint`.
 * Preserves 100% structural compatibility with existing components while setting explicit
 * metadata flags (`kind`, `interactive`, `exercise.mode`, `exercise.checkerAvailable`, etc.)
 * for the UI layer.
 */
export function defineLesson(bp: LessonBlueprint): Lesson {
  const meta = getScheduleMeta(bp.day);
  const id = lessonIdForDay(bp.day);
  const isReviewLike = meta.kind !== "lesson";
  const isFinalDay = bp.day === TOTAL_DAYS;

  const schedule = isReviewLike
    ? [
        { from: 0, to: 10, label: "Interleaved recall & quiz", anchor: "quiz" },
        { from: 10, to: 25, label: "Offline mini-integration / debugging lab", anchor: "try-it" },
        { from: 25, to: 30, label: "Error log & review queue", anchor: "summary" },
      ]
    : [
        { from: 0, to: 4, label: "Setup & warm-up", anchor: "setup" },
        { from: 4, to: 13, label: "Core concepts + worked example", anchor: "concepts" },
        { from: 13, to: 25, label: "Offline practice prompt", anchor: "try-it" },
        { from: 25, to: 30, label: "Quick quiz + spaced review", anchor: "quiz" },
      ];

  const bigPictureSteps: BigPictureStep[] = bp.bigPicture.map((s) => ({
    node: s.node,
    title: `${AI_LOOP_STAGE_NAME[s.node]} — ${s.heading}`,
    body: s.body,
    lessonNote: s.lessonNote,
  }));

  const concepts: Concept[] = bp.concepts.map((c) => ({
    id: c.id,
    title: c.title,
    paragraphs: c.paragraphs,
    analogy: c.analogy,
    bullets: c.bullets,
    code: c.code,
    why: { title: c.whyTitle, paragraphs: c.whyParagraphs },
  }));

  const bridges: BridgeNote[] = [
    {
      track: "web",
      label: "Junior Web/App Dev",
      title: bp.bridges.web.title,
      body: bp.bridges.web.body,
      table: bp.bridges.web.table,
    },
    {
      track: "student",
      label: "นักศึกษาปี 1",
      title: bp.bridges.student.title,
      body: bp.bridges.student.body,
    },
  ];

  const hints: Hint[] = [
    { level: 1, title: "Level 1 · Conceptual Nudge", body: bp.practice.hints[0].body },
    { level: 2, title: "Level 2 · Structure & API Clue", body: bp.practice.hints[1].body },
    {
      level: 3,
      title: "Level 3 · Concrete Walkthrough",
      body: bp.practice.hints[2].body,
      code: bp.practice.hints[2].code,
    },
  ];

  const quizCount = bp.quiz.questions.length;
  const quizIntro =
    bp.quiz.intro ??
    `${quizCount} ข้อ เลือกคำตอบแล้วกด **ตรวจคำตอบ** เพื่อดูเหตุผลทันที ข้อที่พลาดจะเข้าคิวทบทวนอัตโนมัติ`;

  const reviewNote = isFinalDay
    ? "ยินดีด้วยที่เดินทางครบ 180 วัน! ใช้การ์ดทบทวนด้านล่างและ Capstone Rubric เตรียมพร้อมก่อนสัมภาษณ์หรือนำเสนอผลงานจริง"
    : isReviewLike
      ? `หลังจบรอบทบทวน Day ${bp.day} ระบบจะดึงการ์ดที่ยังพลาดกลับมาทวนในอีก +3, +8 และ +16 วัน — บันทึกข้อผิดพลาดที่เจอบ่อยไว้ใน Error Log ของคุณ`
      : `เมื่อกดเสร็จสิ้นบท การ์ดทบทวนจะถูกเพิ่มเข้าคิว เพื่อกลับมาทวนในรอบ **Day ${meta.nextReviewDay}** และตามจังหวะ +3 / +8 / +16 วัน`;

  const apiKeyNote =
    bp.apiKeyNote ??
    (bp.requiresApiKey
      ? "รองรับทั้ง LLM API จริงและโหมด mock / local Ollama บนเครื่อง"
      : "รันบนเครื่องคุณได้ 100% ไม่ต้องใช้ API key");

  return {
    id,
    day: bp.day,
    kind: meta.kind,
    phase: meta.phase,
    block: meta.blockId,
    titleTh: bp.titleTh,
    titleEn: meta.titleEn,
    tagline: bp.tagline,
    minutes: 30,
    tools: bp.tools ?? meta.tools,
    recommendedDays: meta.recommendedDays,
    reviewsDays: meta.reviewsDays,
    requiresApiKey: bp.requiresApiKey ?? false,
    apiKeyNote,
    icon: bp.icon,
    coverImage: bp.coverImage ?? PHASE_COVERS[meta.phase.index],
    visual: bp.visual,
    interactive: { payloadLab: false, browserChecker: false },
    schedule,
    bigPicture: {
      alt: AI_LOOP_ALT,
      caption: `จุดที่ Day ${bp.day} เชื่อมต่อกับวงจรวิศวกรรม AI — กดทีละขั้นเพื่อดูบทบาทของวันนี้ในระบบจริง`,
      steps: bigPictureSteps,
    },
    objectives: bp.objectives,
    prerequisites: bp.prerequisites,
    setup: {
      intro: bp.setup.intro,
      commands: {
        language: bp.setup.commandLang ?? "bash",
        filename: "terminal",
        code: bp.setup.commands,
      },
      steps: bp.setup.steps.map(([stepId, label]) => ({ id: `${id}-${stepId}`, label })),
      note:
        bp.setup.note ??
        "ถ้ายังไม่ได้ติดตั้งเครื่องมือครบ สามารถอ่านแนวคิด ตัวอย่างโค้ด และทำควิซในหน้านี้ให้จบก่อน แล้วค่อยกลับมารันบนเครื่องทีหลังได้",
    },
    concepts,
    bridges,
    workedExample: bp.workedExample,
    // Structural fallback only: UI should hide PayloadLab when `lesson.interactive?.payloadLab === false`.
    payloadLab: {
      intro: "บทเรียนนี้เน้นการฝึกปฏิบัติบนเครื่องของคุณในหัวข้อด้านล่าง (ไม่มี Payload Lab จำลองในเบราว์เซอร์)",
      presets: [
        {
          id: `${id}-note`,
          label: `Day ${bp.day} ใช้ Offline Practice Prompt`,
          payload: { day: bp.day, mode: "offline-practice", checkerAvailable: false },
          note: OFFLINE_CHECKER_NOTICE,
        },
      ],
    },
    exercise: {
      mode: "offline-practice",
      checkerAvailable: false,
      checkerNotice: OFFLINE_CHECKER_NOTICE,
      selfCheck: bp.practice.selfCheck,
      intro: `${bp.practice.intro} *(โจทย์ฝึกทำบนเครื่องเอง — ไม่มีตัวส่งคำตอบหรือตรวจอัตโนมัติในเบราว์เซอร์)*`,
      requirements: bp.practice.requirements,
      starter: bp.practice.starter,
      tests: bp.practice.verification,
      acceptance: `${bp.practice.acceptance} (ตรวจผลด้วยตัวเองบนเครื่อง — ไม่มีระบบตรวจอัตโนมัติในหน้าเว็บ)`,
      hints,
      localRun: bp.practice.localRun,
    },
    mistakes: bp.mistakes,
    quiz: {
      intro: quizIntro,
      questions: bp.quiz.questions,
    },
    summary: {
      takeaways: bp.takeaways,
      reviewNote,
      next: isFinalDay
        ? {
            day: 1,
            title: "ทบทวนเส้นทางทั้งหมดจาก Day 1 หรือเลือกเปิดบทที่อยากย้ำจากห้องสมุด",
            available: true,
          }
        : {
            day: bp.day + 1,
            title: meta.nextDayTitle ?? `Day ${bp.day + 1}`,
            available: true,
          },
      isFinalDay: isFinalDay || undefined,
      graduationNote: bp.graduationNote,
    },
    reviewCards: bp.reviewCards,
    sources: bp.sources,
    glossary: bp.glossary,
  };
}
