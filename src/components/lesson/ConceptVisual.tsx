"use client";

import type { LessonVisual, LessonVisualId } from "@/content/types";
import { useReducedMotion } from "@/lib/store";
import { AsyncioLoopVisual, SchemaGateVisual, TicketPipelineVisual } from "./visuals/phase1Visuals";
import {
  CollectionsPipelineVisual,
  EnvSettingsVisual,
  JsonlStreamVisual,
  NestedSchemaVisual,
  PytestFixturesVisual,
  StructlogFlowVisual,
} from "./visuals/phase1BlockVisualsA";
import {
  CircuitBreakerVisual,
  HttpxTimeoutVisual,
  MockParametrizeVisual,
  RetryBackoffVisual,
} from "./visuals/phase1BlockVisualsB";
import {
  GitPackageCliVisual,
  Phase1CapstoneArchVisual,
  SemaphoreStreamVisual,
  SqlCacheArchVisual,
} from "./visuals/phase1BlockVisualsC";
import { CosineVectorsVisual, PolarsLazyVisual, ThaiTokenizeVisual } from "./visuals/phase2Visuals";
import {
  DirtyDataCleanVisual,
  DuckdbParquetVisual,
  MlVsLlmMatrixVisual,
  ProbExpectedValueVisual,
  VectorDotNormVisual,
} from "./visuals/phase2BlockVisualsA";
import {
  DataLeakageSplitVisual,
  PrecisionRecallThreshVisual,
  RegressionResidualsVisual,
  SklearnPipelineVisual,
} from "./visuals/phase2BlockVisualsB";
import {
  DriftOnnxMonitorVisual,
  LightgbmBoostingVisual,
  Phase2MlPipelineVisual,
  ThaiCvTuningVisual,
} from "./visuals/phase2BlockVisualsC";
import { BpeTokensVisual, SelfAttentionVisual, StructuredOutputVisual } from "./visuals/phase3Visuals";
import {
  DenseEmbeddingsMapVisual,
  EmbeddingModelTradeoffVisual,
  PostTrainingStagesVisual,
  PytorchAutogradVisual,
  SoftmaxTemperatureVisual,
} from "./visuals/phase3BlockVisualsA";
import {
  LlmContextAnatomyVisual,
  PromptCacheRoutingVisual,
  StreamingTtftVisual,
  ValidationRepairLoopVisual,
} from "./visuals/phase3BlockVisualsB";
import {
  FinetuneVsRagLoraVisual,
  MultimodalBatchFlowVisual,
  OllamaQuantizationVisual,
  Phase3ExtractorArchVisual,
} from "./visuals/phase3BlockVisualsC";
import { HybridRrfVisual, LangGraphLoopVisual, McpArchitectureVisual } from "./visuals/phase4Visuals";
import {
  ChunkingOverlapVisual,
  NaiveRagFailuresVisual,
  RerankerQueryTransformVisual,
  ThaiBm25IndexVisual,
  VectorIndexHnswVisual,
} from "./visuals/phase4BlockVisualsA";
import {
  AclTenantFilterVisual,
  AnthropicWorkflowsVisual,
  GroundedCitationsVisual,
  ToolCallingSafetyVisual,
} from "./visuals/phase4BlockVisualsB";
import {
  HitlCheckpointVisual,
  LanggraphGuardrailsVisual,
  McpServerClientVisual,
  Phase4RagAgentArchVisual,
} from "./visuals/phase4BlockVisualsC";
import { FastApiSseVisual, PdpaRedactionVisual, RagTriadVisual } from "./visuals/phase5Visuals";
import {
  CiEvalGateVisual,
  GoldenDatasetEvalsVisual,
  IngestionJobQueueVisual,
  LangfuseTraceWaterfallVisual,
  LatencyCostDashboardVisual,
  LlmJudgeBiasVisual,
  OtelGenaiSpansVisual,
  PromptfooRegressionVisual,
} from "./visuals/phase5BlockVisualsA";
import {
  CapacityCostCalcVisual,
  CloudDeployHealthVisual,
  ComposeLocalStackVisual,
  DockerMultistageVisual,
  GuardrailSandboxVisual,
  OwaspLlmTop10Visual,
  Phase5ProdArchVisual,
  SemanticCacheTieringVisual,
  VllmPagedAttentionVisual,
} from "./visuals/phase5BlockVisualsB";
import { CapstoneAdrVisual, CapstoneRubricVisual, RetrievalBenchmarkVisual } from "./visuals/phase6Visuals";
import {
  CapstoneCoreRouterVisual,
  CapstoneEvalTelemetryVisual,
  CapstoneHybridIngestVisual,
  CapstoneLoadDefenseVisual,
  CapstoneScaffoldCorpusVisual,
  CapstoneSecureDeployVisual,
} from "./visuals/phase6BlockVisuals";

const VISUAL_MAP: Record<LessonVisualId, React.ComponentType<{ reduced?: boolean }>> = {
  "schema-gate": SchemaGateVisual,
  "collections-pipeline": CollectionsPipelineVisual,
  "nested-schema": NestedSchemaVisual,
  "ticket-pipeline": TicketPipelineVisual,
  "jsonl-stream": JsonlStreamVisual,
  "structlog-flow": StructlogFlowVisual,
  "env-settings": EnvSettingsVisual,
  "pytest-fixtures": PytestFixturesVisual,
  "mock-parametrize": MockParametrizeVisual,
  "httpx-timeout": HttpxTimeoutVisual,
  "retry-backoff": RetryBackoffVisual,
  "circuit-breaker": CircuitBreakerVisual,
  "asyncio-loop": AsyncioLoopVisual,
  "semaphore-stream": SemaphoreStreamVisual,
  "git-package-cli": GitPackageCliVisual,
  "sql-cache-arch": SqlCacheArchVisual,
  "phase1-capstone-arch": Phase1CapstoneArchVisual,
  "polars-lazy": PolarsLazyVisual,
  "dirty-data-clean": DirtyDataCleanVisual,
  "duckdb-parquet": DuckdbParquetVisual,
  "vector-dot-norm": VectorDotNormVisual,
  "cosine-vectors": CosineVectorsVisual,
  "prob-expected-value": ProbExpectedValueVisual,
  "ml-vs-llm-matrix": MlVsLlmMatrixVisual,
  "data-leakage-split": DataLeakageSplitVisual,
  "sklearn-pipeline": SklearnPipelineVisual,
  "precision-recall-thresh": PrecisionRecallThreshVisual,
  "regression-residuals": RegressionResidualsVisual,
  "lightgbm-boosting": LightgbmBoostingVisual,
  "thai-tokenize": ThaiTokenizeVisual,
  "thai-cv-tuning": ThaiCvTuningVisual,
  "drift-onnx-monitor": DriftOnnxMonitorVisual,
  "phase2-ml-pipeline": Phase2MlPipelineVisual,
  "pytorch-autograd": PytorchAutogradVisual,
  "softmax-temperature": SoftmaxTemperatureVisual,
  "self-attention": SelfAttentionVisual,
  "bpe-tokens": BpeTokensVisual,
  "post-training-stages": PostTrainingStagesVisual,
  "dense-embeddings-map": DenseEmbeddingsMapVisual,
  "embedding-model-tradeoff": EmbeddingModelTradeoffVisual,
  "llm-context-anatomy": LlmContextAnatomyVisual,
  "streaming-ttft": StreamingTtftVisual,
  "structured-output": StructuredOutputVisual,
  "validation-repair-loop": ValidationRepairLoopVisual,
  "prompt-cache-routing": PromptCacheRoutingVisual,
  "multimodal-batch-flow": MultimodalBatchFlowVisual,
  "ollama-quantization": OllamaQuantizationVisual,
  "finetune-vs-rag-lora": FinetuneVsRagLoraVisual,
  "phase3-extractor-arch": Phase3ExtractorArchVisual,
  "naive-rag-failures": NaiveRagFailuresVisual,
  "chunking-overlap": ChunkingOverlapVisual,
  "vector-index-hnsw": VectorIndexHnswVisual,
  "thai-bm25-index": ThaiBm25IndexVisual,
  "hybrid-rrf": HybridRrfVisual,
  "reranker-query-transform": RerankerQueryTransformVisual,
  "grounded-citations": GroundedCitationsVisual,
  "acl-tenant-filter": AclTenantFilterVisual,
  "tool-calling-safety": ToolCallingSafetyVisual,
  "anthropic-workflows": AnthropicWorkflowsVisual,
  "mcp-architecture": McpArchitectureVisual,
  "mcp-server-client": McpServerClientVisual,
  "langgraph-loop": LangGraphLoopVisual,
  "langgraph-guardrails": LanggraphGuardrailsVisual,
  "hitl-checkpoint": HitlCheckpointVisual,
  "phase4-rag-agent-arch": Phase4RagAgentArchVisual,
  "rag-triad": RagTriadVisual,
  "fastapi-sse": FastApiSseVisual,
  "pdpa-redaction": PdpaRedactionVisual,
  "golden-dataset-evals": GoldenDatasetEvalsVisual,
  "llm-judge-bias": LlmJudgeBiasVisual,
  "promptfoo-regression": PromptfooRegressionVisual,
  "ci-eval-gate": CiEvalGateVisual,
  "otel-genai-spans": OtelGenaiSpansVisual,
  "langfuse-trace-waterfall": LangfuseTraceWaterfallVisual,
  "latency-cost-dashboard": LatencyCostDashboardVisual,
  "ingestion-job-queue": IngestionJobQueueVisual,
  "docker-multistage": DockerMultistageVisual,
  "compose-local-stack": ComposeLocalStackVisual,
  "cloud-deploy-health": CloudDeployHealthVisual,
  "vllm-paged-attention": VllmPagedAttentionVisual,
  "semantic-cache-tiering": SemanticCacheTieringVisual,
  "capacity-cost-calc": CapacityCostCalcVisual,
  "owasp-llm-top10": OwaspLlmTop10Visual,
  "guardrail-sandbox": GuardrailSandboxVisual,
  "phase5-prod-arch": Phase5ProdArchVisual,
  "capstone-adr": CapstoneAdrVisual,
  "capstone-scaffold-corpus": CapstoneScaffoldCorpusVisual,
  "capstone-hybrid-ingest": CapstoneHybridIngestVisual,
  "retrieval-benchmark": RetrievalBenchmarkVisual,
  "capstone-core-router": CapstoneCoreRouterVisual,
  "capstone-eval-telemetry": CapstoneEvalTelemetryVisual,
  "capstone-secure-deploy": CapstoneSecureDeployVisual,
  "capstone-load-defense": CapstoneLoadDefenseVisual,
  "capstone-rubric": CapstoneRubricVisual,
};

/**
 * Interactive, animated SVG concept visualizer rendered inside every authored chapter.
 * Strictly honours `prefers-reduced-motion` and adapts to Light/Dark CSS variables.
 */
export function ConceptVisual({ visual }: { visual: LessonVisual }) {
  const reduced = useReducedMotion();
  const Diagram = VISUAL_MAP[visual.id];
  if (!Diagram) return null;

  return (
    <figure className="card m-0 p-4 sm:p-5" aria-label={visual.alt}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold leading-snug">{visual.title}</h3>
        <span className="eyebrow">ภาพเคลื่อนไหวโต้ตอบ</span>
      </div>
      <Diagram reduced={reduced} />
      <figcaption className="mt-3 text-sm text-muted">{visual.caption}</figcaption>
    </figure>
  );
}
