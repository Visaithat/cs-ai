/**
 * Content schema for Neural Path lessons.
 *
 * Prose strings support a tiny inline markup (see `components/RichText.tsx`):
 *   **bold**   `code`   {{glossary-id}}   {{glossary-id|custom label}}
 * Everything a learner reads lives in `src/content`; components never hard-code lesson copy.
 */

export interface GlossaryTerm {
  id: string;
  /** canonical English term as used in docs and teams */
  term: string;
  /** short Thai name / gloss */
  thai: string;
  /** one-line definition for the hover/focus popover */
  short: string;
  /** plain-Thai explanation for the sheet */
  plain: string;
  analogy: string;
  example?: { language: "python" | "bash" | "json" | "text"; code: string };
  related: Array<{ label: string; lessonId?: string }>;
}

export interface CodeSample {
  language: "python" | "bash" | "json" | "text" | "sql" | "yaml" | "dockerfile";
  code: string;
  caption?: string;
  filename?: string;
}

export type LessonKind = "lesson" | "review" | "checkpoint" | "milestone" | "final";

export type ExerciseMode = "browser-simulated" | "offline-practice";

export type LessonVisualId =
  | "schema-gate"
  | "collections-pipeline"
  | "nested-schema"
  | "ticket-pipeline"
  | "jsonl-stream"
  | "structlog-flow"
  | "env-settings"
  | "pytest-fixtures"
  | "mock-parametrize"
  | "httpx-timeout"
  | "retry-backoff"
  | "circuit-breaker"
  | "asyncio-loop"
  | "semaphore-stream"
  | "git-package-cli"
  | "sql-cache-arch"
  | "phase1-capstone-arch"
  | "polars-lazy"
  | "dirty-data-clean"
  | "duckdb-parquet"
  | "vector-dot-norm"
  | "cosine-vectors"
  | "prob-expected-value"
  | "ml-vs-llm-matrix"
  | "data-leakage-split"
  | "sklearn-pipeline"
  | "precision-recall-thresh"
  | "regression-residuals"
  | "lightgbm-boosting"
  | "thai-tokenize"
  | "thai-cv-tuning"
  | "drift-onnx-monitor"
  | "phase2-ml-pipeline"
  | "pytorch-autograd"
  | "softmax-temperature"
  | "self-attention"
  | "bpe-tokens"
  | "post-training-stages"
  | "dense-embeddings-map"
  | "embedding-model-tradeoff"
  | "llm-context-anatomy"
  | "streaming-ttft"
  | "structured-output"
  | "validation-repair-loop"
  | "prompt-cache-routing"
  | "multimodal-batch-flow"
  | "ollama-quantization"
  | "finetune-vs-rag-lora"
  | "phase3-extractor-arch"
  | "naive-rag-failures"
  | "chunking-overlap"
  | "vector-index-hnsw"
  | "thai-bm25-index"
  | "hybrid-rrf"
  | "reranker-query-transform"
  | "grounded-citations"
  | "acl-tenant-filter"
  | "tool-calling-safety"
  | "anthropic-workflows"
  | "mcp-architecture"
  | "mcp-server-client"
  | "langgraph-loop"
  | "langgraph-guardrails"
  | "hitl-checkpoint"
  | "phase4-rag-agent-arch"
  | "rag-triad"
  | "fastapi-sse"
  | "pdpa-redaction"
  | "golden-dataset-evals"
  | "llm-judge-bias"
  | "promptfoo-regression"
  | "ci-eval-gate"
  | "otel-genai-spans"
  | "langfuse-trace-waterfall"
  | "latency-cost-dashboard"
  | "ingestion-job-queue"
  | "docker-multistage"
  | "compose-local-stack"
  | "cloud-deploy-health"
  | "vllm-paged-attention"
  | "semantic-cache-tiering"
  | "capacity-cost-calc"
  | "owasp-llm-top10"
  | "guardrail-sandbox"
  | "phase5-prod-arch"
  | "capstone-adr"
  | "capstone-scaffold-corpus"
  | "capstone-hybrid-ingest"
  | "retrieval-benchmark"
  | "capstone-core-router"
  | "capstone-eval-telemetry"
  | "capstone-secure-deploy"
  | "capstone-load-defense"
  | "capstone-rubric";

export type LessonIconId =
  | "shield-check"
  | "list-filter"
  | "folder-open"
  | "scroll-text"
  | "key-round"
  | "flask-conical"
  | "test-tubes"
  | "badge-check"
  | "globe"
  | "refresh-cw"
  | "gauge"
  | "package"
  | "database"
  | "hard-drive"
  | "rocket"
  | "git-branch"
  | "cpu"
  | "table"
  | "compass"
  | "scissors"
  | "sparkles"
  | "coins"
  | "braces"
  | "layers"
  | "plug"
  | "workflow"
  | "triangle"
  | "zap"
  | "lock"
  | "file-text"
  | "bar-chart-3"
  | "award"
  | "filter"
  | "sigma"
  | "scale"
  | "split"
  | "sliders-horizontal"
  | "trending-up"
  | "git-merge"
  | "activity"
  | "timer"
  | "brain"
  | "radar"
  | "message-square"
  | "wrench"
  | "image"
  | "boxes"
  | "file-code"
  | "git-compare"
  | "search"
  | "book-marked"
  | "shield-alert"
  | "route"
  | "server"
  | "user-check";

export interface LessonVisual {
  id: LessonVisualId;
  title: string;
  caption: string;
  alt: string;
}

export interface BigPictureStep {
  /** index of the node in assets/ai-loop.svg (0 = Problem … 5 = Monitor, 6 = feedback arc) */
  node: number;
  title: string;
  body: string;
  /** how Day 1 touches this stage (preserved for d001) */
  day1?: string;
  /** how this lesson touches this stage (used for d002–d180) */
  lessonNote?: string;
}

export interface Concept {
  id: string;
  title: string;
  paragraphs: string[];
  /** everyday Thai analogy illustrating the concept */
  analogy?: string;
  code?: CodeSample;
  bullets?: string[];
  why: { title: string; paragraphs: string[] };
}

export interface BridgeNote {
  track: "web" | "student";
  label: string;
  title: string;
  body: string[];
  table?: Array<[string, string]>;
}

export interface WorkedStep {
  title: string;
  explain: string;
  code: CodeSample;
  output?: string;
}

export interface PayloadPreset {
  id: string;
  label: string;
  payload: Record<string, unknown>;
  note: string;
}

export interface Hint {
  level: 1 | 2 | 3;
  title: string;
  body: string;
  code?: CodeSample;
}

export interface Mistake {
  title: string;
  symptom: string;
  fix: string;
  code?: CodeSample;
}

export interface QuizOption {
  id: string;
  text: string;
  /** why this option is right/wrong, shown when the learner picks it */
  why: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
  answer: string;
  explanation: string;
  /** retrieval-practice card created when the learner misses the question */
  review: { prompt: string; answer: string };
}

export interface ReviewCard {
  id: string;
  prompt: string;
  answer: string;
}

export interface SourceLink {
  label: string;
  href: string;
}

export interface Lesson {
  id: string;
  day: number;
  /** curriculum day kind; omitted on Day 1 (defaults to "lesson") */
  kind?: LessonKind;
  phase: { index: number; title: string };
  block: string;
  titleTh: string;
  titleEn: string;
  tagline: string;
  minutes: number;
  tools: string[];
  /** recommended earlier days (never required or locked) */
  recommendedDays?: number[];
  /** review/checkpoint/milestone days only: earlier days revisited */
  reviewsDays?: number[];
  /** false when 100% local/offline; true when cloud API optional/used */
  requiresApiKey?: boolean;
  /** short Thai badge describing API key / local execution posture */
  apiKeyNote?: string;
  /** minimal icon identifier for the chapter opener & shelf badge */
  icon?: LessonIconId;
  /** subtle editorial cover illustration for the chapter opener */
  coverImage?: string;
  /** topic-specific interactive animated SVG concept diagram */
  visual?: LessonVisual;
  /** explicit UI capability flags so UI only enables Day 1 sandboxes where implemented */
  interactive?: {
    payloadLab: boolean;
    browserChecker: boolean;
  };
  schedule: Array<{ from: number; to: number; label: string; anchor: string }>;
  bigPicture: { alt: string; caption: string; steps: BigPictureStep[] };
  objectives: string[];
  prerequisites: string[];
  setup: {
    intro: string;
    commands: CodeSample;
    steps: Array<{ id: string; label: string }>;
    note: string;
  };
  concepts: Concept[];
  bridges: BridgeNote[];
  workedExample: { intro: string; steps: WorkedStep[]; gotcha: string };
  payloadLab: { intro: string; presets: PayloadPreset[] };
  exercise: {
    /** "browser-simulated" for Day 1; "offline-practice" for Days 2–180 */
    mode?: ExerciseMode;
    /** explicitly false when there is no answer-submission auto-checker */
    checkerAvailable?: boolean;
    /** explicit Thai notice explaining offline practice vs auto-checking */
    checkerNotice?: string;
    /** local self-verification checklist for offline practice prompts */
    selfCheck?: string[];
    intro: string;
    requirements: string[];
    starter: CodeSample;
    tests: CodeSample;
    acceptance: string;
    hints: Hint[];
    localRun: CodeSample;
  };
  mistakes: Mistake[];
  quiz: { intro: string; questions: QuizQuestion[] };
  summary: {
    takeaways: string[];
    reviewNote: string;
    next: { day: number; title: string; available: boolean };
    /** true on Day 180 (Final Defense & Graduation) */
    isFinalDay?: boolean;
    graduationNote?: string;
  };
  reviewCards: ReviewCard[];
  sources: SourceLink[];
  glossary: string[];
}

export interface RoadmapPhase {
  index: number;
  title: string;
  /** human label, e.g. "Days 1–32" */
  days: string;
  /** first and last day of the phase (inclusive) */
  from: number;
  to: number;
  focus: string;
  milestone: string;
  /** phases whose material is recommended (never required) first, from the curriculum dependency graph */
  after: number[];
}
