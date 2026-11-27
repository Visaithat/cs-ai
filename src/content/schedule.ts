/**
 * Raw 180-day schedule, transcribed from docs/curriculum.md §4 (45 four-day blocks).
 * Pure data: no UI, no derived fields. `library.ts` turns this into the per-day catalogue.
 *
 * Each block is four days: three study days (`days`) followed by one review / checkpoint /
 * milestone day (`review`). Titles are the English curriculum titles with markdown stripped.
 */

import type { RoadmapPhase } from "./types";

export type ReviewKind = "review" | "checkpoint" | "milestone" | "final";

export interface ScheduleBlock {
  id: string;
  /** first day of the block; the block always spans `from … from + 3` */
  from: number;
  tools: string[];
  /** titles of the first three (study) days */
  days: [string, string, string];
  review: { kind: ReviewKind; title: string };
}

export const TOTAL_DAYS = 180;

/** Phase overview, from docs/curriculum.md §2 (dependency graph) and §3. */
export const PHASES: RoadmapPhase[] = [
  { index: 1, title: "Modern Python & Async Foundation", days: "Days 1–32", from: 1, to: 32, focus: "Python, uv, Pydantic, asyncio, pytest", milestone: "Resilient Async Data Fetcher CLI", after: [] },
  { index: 2, title: "Data, Math Intuition & Classical ML", days: "Days 33–60", from: 33, to: 60, focus: "Polars, DuckDB, scikit-learn, LightGBM", milestone: "Churn/Ticket Priority ML Pipeline", after: [1] },
  { index: 3, title: "Neural Nets, Embeddings & Core LLM", days: "Days 61–92", from: 61, to: 92, focus: "PyTorch, embeddings, LLM APIs, structured outputs", milestone: "Typed Thai Document Classifier & Extractor", after: [1, 2] },
  { index: 4, title: "Thai Hybrid RAG, Tools, MCP & Agents", days: "Days 93–124", from: 93, to: 124, focus: "PyThaiNLP, vector search, MCP, LangGraph", milestone: "Thai Knowledge RAG + Controlled Agent", after: [2, 3] },
  { index: 5, title: "Evals, Observability, Deploy & Security", days: "Days 125–156", from: 125, to: 156, focus: "Ragas, Promptfoo, Langfuse, FastAPI, Docker, OWASP/PDPA", milestone: "Evaluated & Guarded AI Microservice", after: [3, 4] },
  { index: 6, title: "Production Capstone & Defense", days: "Days 157–180", from: 157, to: 180, focus: "End-to-end Thai/bilingual support assistant", milestone: "Deployed Production Thai AI Assistant", after: [5] },
];

const r = (title: string): ScheduleBlock["review"] => ({ kind: "review", title });
const c = (title: string): ScheduleBlock["review"] => ({ kind: "checkpoint", title });
const m = (title: string): ScheduleBlock["review"] => ({ kind: "milestone", title });

export const SCHEDULE_BLOCKS: ScheduleBlock[] = [
  /* ---------------------------- Phase 1 · Days 1–32 ---------------------------- */
  {
    id: "B01", from: 1, tools: ["uv", "Pydantic v2", "Ruff"],
    days: ["Modern Python (uv) & Type-Safe Payloads (Pydantic v2)", "Python Collections, Comprehensions & Type Hints", "Pydantic Validators, Nested Models & JSON Serialization"],
    review: r("Quiz + Build validated Thai Support Ticket parser"),
  },
  {
    id: "B02", from: 5, tools: ["pathlib", "structlog", "pydantic-settings"],
    days: ["File I/O, pathlib & Streaming JSONL Datasets", "Error Handling, Custom Exceptions & Logging (structlog)", "Environment Config with pydantic-settings & .env Hygiene"],
    review: r("Quiz + Refactor script with config & structured logs"),
  },
  {
    id: "B03", from: 9, tools: ["pytest", "Ruff"],
    days: ["Unit Testing Fundamentals with pytest & Fixtures", "Parametrized Tests & Mocking External Calls", "Code Quality Automation (Ruff lint/format + pre-commit basics)"],
    review: r("Quiz + Add 90% coverage test suite to Ticket parser"),
  },
  {
    id: "B04", from: 13, tools: ["httpx", "tenacity"],
    days: ["HTTP Clients with httpx, Timeouts & Status Codes", "Retry with Exponential Backoff & Jitter (tenacity)", "Rate Limiting, Idempotency & Circuit Breaker Patterns"],
    review: r("Quiz + Debug flaky mock API client under rate limits"),
  },
  {
    id: "B05", from: 17, tools: ["asyncio", "httpx"],
    days: ["asyncio Mental Model (Event Loop, Coroutines, await)", "Concurrent Requests with asyncio.gather & Semaphore", "Async Generators & Streaming Responses (SSE basics)"],
    review: r("Quiz + Speed up 20-call batch pipeline 5x safely"),
  },
  {
    id: "B06", from: 21, tools: ["Git", "uv", "Typer"],
    days: ["Git Workflow for AI Teams (Branches, PRs, .gitignore for data/keys)", "Packaging & Project Structure (src/ layout, pyproject.toml)", "CLI Tooling with Typer + Progress Reporting"],
    review: r("Quiz + Package Ticket Processor as installable CLI"),
  },
  {
    id: "B07", from: 25, tools: ["SQL", "SQLite"],
    days: ["SQL Refresher for AI Engineers (JOIN, GROUP BY, Window basics)", "SQLite / PostgreSQL Parameterized Queries & Migrations", "Caching Patterns (In-memory LRU vs Disk/SQLite cache for API cost)"],
    review: r("Quiz + Add persistent SQLite response cache to CLI"),
  },
  {
    id: "B08", from: 29, tools: ["All Phase 1 tools"],
    days: ["Phase 1 Mini-Project Spec & Architecture", "Build Async Ingestion & Validation Pipeline", "Add Retries, Cache & pytest Suite"],
    review: c("Phase 1 Demo, Code Review Checklist & Cumulative Quiz"),
  },

  /* ---------------------------- Phase 2 · Days 33–60 --------------------------- */
  {
    id: "B09", from: 33, tools: ["Polars", "DuckDB"],
    days: ["Tabular Data with Polars (DataFrames, Expressions, Lazy mode)", "Cleaning Dirty Real-World Data (Nulls, Duplicates, Thai Dates/UTF-8)", "Local Analytics at Scale with DuckDB over CSV/Parquet"],
    review: r("Quiz + Clean & aggregate 100k Thai e-commerce rows"),
  },
  {
    id: "B10", from: 37, tools: ["NumPy"],
    days: ["Vectors, Dot Product & Norms (NumPy Intuition)", "Cosine Similarity vs Euclidean Distance (Why embeddings use Cosine)", "Probability, Distributions & Expected Value for AI Systems"],
    review: r("Quiz + Implement mini cosine similarity search in NumPy"),
  },
  {
    id: "B11", from: 41, tools: ["scikit-learn"],
    days: ["When to Use Classical ML vs LLM (Cost/Latency Decision Matrix)", "Train/Val/Test Split & Preventing Data Leakage", "Baseline Classifier with scikit-learn (Pipeline, ColumnTransformer)"],
    review: r("Quiz + Catch & fix deliberate data leakage bug"),
  },
  {
    id: "B12", from: 45, tools: ["scikit-learn", "LightGBM"],
    days: ["Classification Metrics (Precision, Recall, F1, PR-AUC for Imbalanced Data)", "Regression Metrics (MAE, RMSE) & Error Analysis", "Gradient Boosting for Tabular Data with LightGBM"],
    review: r("Quiz + Tune threshold for business cost (FP vs FN)"),
  },
  {
    id: "B13", from: 49, tools: ["PyThaiNLP", "scikit-learn"],
    days: ["Text Features (TF-IDF) & Thai Word Segmentation (PyThaiNLP newmm)", "Fast Thai Text Classifier (TF-IDF + Logistic Regression Baseline)", "Cross-Validation & Hyperparameter Tuning without Overfitting"],
    review: r("Quiz + Compare Thai TF-IDF baseline vs raw whitespace split"),
  },
  {
    id: "B14", from: 53, tools: ["LightGBM", "PyThaiNLP"],
    days: ["Model Serialization (joblib / ONNX), Versioning & Data Cards", "Feature Drift & Monitoring Classical ML in Production", "Phase 2 Mini-Project: Design Ticket Priority ML Pipeline"],
    review: r("Quiz + Train & evaluate end-to-end ML pipeline"),
  },
  {
    id: "B15", from: 57, tools: ["All Phase 2 tools"],
    days: ["Error Analysis on Misclassified Thai Tickets", "Export & Benchmark Inference Latency (<10ms)", "Write Reproducible Training & Inference Tests"],
    review: c("Phase 2 Demo, ML vs LLM Trade-off Memo & Quiz"),
  },

  /* ---------------------------- Phase 3 · Days 61–92 --------------------------- */
  {
    id: "B16", from: 61, tools: ["PyTorch"],
    days: ["Tensors, Autograd & Gradient Descent in PyTorch", "Building & Training a 2-Layer Neural Net Loop", "Loss Functions, Softmax, Temperature & Overfitting Controls"],
    review: r("Quiz + Debug exploding/vanishing loss in tiny PyTorch net"),
  },
  {
    id: "B17", from: 65, tools: ["tiktoken", "transformers"],
    days: ["Transformer Architecture Intuition (Self-Attention, Positional Info)", "Tokenizers & BPE Deep Dive (Why Thai uses 1.5x–3x more tokens)", "Pre-training vs SFT vs RLHF/DPO (How models become instruction-following)"],
    review: r("Quiz + Benchmark Thai vs English token cost across tokenizers"),
  },
  {
    id: "B18", from: 69, tools: ["Sentence-Transformers"],
    days: ["Dense Text Embeddings (Sentence-Transformers Multilingual)", "Semantic Search & Nearest Neighbors on Thai Sentences", "Choosing Embedding Models (Dimensions, Context Limit, Thai Quality, Cost)"],
    review: r("Quiz + Compare 2 multilingual embeddings on Thai code-switching"),
  },
  {
    id: "B19", from: 73, tools: ["Official LLM SDK", "httpx"],
    days: ["Calling Production LLM APIs (System/User roles, Sampling params)", "Context Engineering Fundamentals (Clarity, Delimiters, Few-Shot)", "Streaming UX (SSE), Time-to-First-Token (TTFT) & Cancellation"],
    review: r("Quiz + Build streaming CLI chat with token/cost counter"),
  },
  {
    id: "B20", from: 77, tools: ["Official SDK", "Pydantic v2"],
    days: ["Structured Outputs with Pydantic + Strict JSON Schema", "Validation-Repair Loop & Deterministic Fallbacks", "Handling Long Contexts, Prompt Caching & Model Routing (Small vs Frontier)"],
    review: r("Quiz + Build 99%-valid Thai invoice/ticket JSON extractor"),
  },
  {
    id: "B21", from: 81, tools: ["Ollama", "Official SDK"],
    days: ["Multimodal Inputs (Vision/PDF-to-Image for Thai receipts & tables)", "Batch APIs & Offline Async Processing for Cost Reduction", "Running Local Open-Weights Models with Ollama (Quantization GGUF basics)"],
    review: r("Quiz + Benchmark Cloud API vs Local Ollama on extraction task"),
  },
  {
    id: "B22", from: 85, tools: ["Pydantic v2", "SDK", "Ollama"],
    days: ["When to Fine-Tune vs Prompt vs RAG (Decision Framework)", "LoRA / QLoRA Intuition & Dataset Quality Requirements", "Phase 3 Mini-Project: Design Thai Document Classifier & Extractor"],
    review: r("Quiz + Implement extraction pipeline with routing & cache"),
  },
  {
    id: "B23", from: 89, tools: ["All Phase 3 tools"],
    days: ["Add Edge-Case Handling (Slang, Typos, Mixed Thai-English)", "Measure Accuracy, Latency & Cost/1k Docs", "Refactor Prompt Templates as Versioned Files"],
    review: c("Phase 3 Demo (Compare ML Baseline vs LLM Extractor)"),
  },

  /* --------------------------- Phase 4 · Days 93–124 --------------------------- */
  {
    id: "B24", from: 93, tools: ["PyMuPDF / parser", "tokenizers"],
    days: ["Naive RAG Architecture & Why It Fails in Production", "Document Ingestion & Parsing (Markdown, HTML, Messy Thai PDFs/Tables)", "Chunking Strategies (Recursive, Token-aware, Structural + Overlap)"],
    review: r("Quiz + Inspect bad chunks and fix broken table/heading splits"),
  },
  {
    id: "B25", from: 97, tools: ["pgvector", "Qdrant", "PyThaiNLP"],
    days: ["Vector Indexing with pgvector (HNSW, Metadata Filtering)", "Dedicated Vector Store with Qdrant (Hybrid Collections, Payload Filter)", "Thai Lexical Search with PyThaiNLP + BM25 (rank_bm25)"],
    review: r("Quiz + Build Thai BM25 index vs Vector index comparison"),
  },
  {
    id: "B26", from: 101, tools: ["Qdrant / pgvector", "Reranker"],
    days: ["Hybrid Search Fusion (Reciprocal Rank Fusion — RRF)", "Cross-Encoder Reranking (bge-reranker / Rerank API)", "Query Transformation (Rewriting, HyDE, Multi-Query with Latency Guard)"],
    review: r("Quiz + Measure Recall@5 gain: Dense vs Hybrid vs +Rerank"),
  },
  {
    id: "B27", from: 105, tools: ["Qdrant / pgvector", "Pydantic"],
    days: ["Grounded Generation & Inline Citations ([doc_id#chunk])", "Abstention (\"I don't know\") & Handling Conflicting/Stale Docs", "Incremental Indexing, Deduplication & Access-Control Filtering (ACL)"],
    review: r("Quiz + Enforce tenant ACL filter so User A never sees User B's docs"),
  },
  {
    id: "B28", from: 109, tools: ["Official SDK", "Pydantic"],
    days: ["Native Tool / Function Calling with Strict Schemas", "Designing Idempotent, Safe Tools & Informative Tool Errors", "Workflow Patterns (Routing, Chaining, Parallelization — Anthropic Patterns)"],
    review: r("Quiz + Build multi-tool order lookup + RAG router without heavy framework"),
  },
  {
    id: "B29", from: 113, tools: ["MCP Python SDK"],
    days: ["Model Context Protocol (MCP) Architecture (Host, Client, Server)", "Building a Local MCP Server (Tools & Resources in Python)", "Connecting Your AI App to an MCP Server Safely"],
    review: r("Quiz + Expose internal SQLite/Knowledge lookup via MCP"),
  },
  {
    id: "B30", from: 117, tools: ["LangGraph"],
    days: ["Controlled Agent Loops with LangGraph (State, Nodes, Edges)", "Guarded Execution (Max Steps, Tool Budget, Loop Detection)", "Persistent Memory & Human-in-the-Loop Approval Checkpoints"],
    review: r("Quiz + Debug infinite tool-calling loop in LangGraph"),
  },
  {
    id: "B31", from: 121, tools: ["All Phase 4 tools"],
    days: ["Phase 4 Mini-Project: Wire Hybrid RAG + MCP Tool + LangGraph", "Citation Verification & Fallback Handling", "Integration Tests on 15 Realistic Thai Queries"],
    review: c("Phase 4 Demo & Architecture Review"),
  },

  /* -------------------------- Phase 5 · Days 125–156 --------------------------- */
  {
    id: "B32", from: 125, tools: ["pytest", "JSONL"],
    days: ["Eval-Driven Development & Building a Golden Dataset (30–50 cases)", "Deterministic Evals (Schema, Tool Selection, Retrieval Recall@k/MRR)", "LLM-as-a-Judge & Bias Mitigation (Position/Verbosity Bias)"],
    review: r("Quiz + Calibrate LLM Judge agreement against your own labels"),
  },
  {
    id: "B33", from: 129, tools: ["Ragas", "Promptfoo", "GitHub Actions"],
    days: ["RAG Triad Evaluation with Ragas (Faithfulness, Context Precision/Recall)", "Prompt & Model Regression Testing with Promptfoo", "Running Automated Eval Gates in GitHub Actions CI"],
    review: r("Quiz + Intentionally break a prompt and watch CI eval gate catch it"),
  },
  {
    id: "B34", from: 133, tools: ["Langfuse", "OpenTelemetry"],
    days: ["Observability Fundamentals & OpenTelemetry GenAI SemConv", "End-to-End LLM/RAG Tracing with Langfuse (Spans, Prompts, Scores)", "Cost, Latency (P50/P95) & Token Dashboards + Alerting"],
    review: r("Quiz + Diagnose P95 latency bottleneck from trace waterfall"),
  },
  {
    id: "B35", from: 137, tools: ["FastAPI", "Uvicorn"],
    days: ["Production AI API with FastAPI (Async Lifespan, Dependency Injection)", "Streaming SSE Endpoints, Timeouts & Graceful Degradation", "Background Jobs & Queueing for Heavy Document Ingestion"],
    review: r("Quiz + Load-test FastAPI SSE endpoint with concurrent users"),
  },
  {
    id: "B36", from: 141, tools: ["Docker", "Cloud PaaS"],
    days: ["Production Dockerfile for Python/uv (Multi-stage, Non-root, Small image)", "docker compose Local Stack (API + Postgres/pgvector + Langfuse)", "Cloud Deployment (Cloud Run / Fly.io) + Secrets & Health Checks"],
    review: r("Quiz + Deploy staging API & verify /healthz + trace delivery"),
  },
  {
    id: "B37", from: 145, tools: ["vLLM (concepts/bench)", "Cache"],
    days: ["Self-Hosted Inference Economics (vLLM, PagedAttention, Quantization)", "Semantic Caching, Prompt Compression & Model Tiering", "Capacity Planning & Cost Calculator (Per-User Monthly Budget)"],
    review: r("Quiz + Optimize a mock AI service to cut cost by 40% without eval drop"),
  },
  {
    id: "B38", from: 149, tools: ["OWASP Checklist", "Regex/Pydantic Guardrails"],
    days: ["OWASP Top 10 for LLM Apps (LLM01 Prompt Injection, LLM02 Sensitive Info, LLM06 Excessive Agency)", "Building Input/Output Guardrails & Least-Privilege Tool Sandbox", "Thai PDPA Engineering (PII Detection/Redaction: Thai ID, Phone, Name + Audit Log)"],
    review: r("Quiz + Red-team your own RAG app with 10 Thai/EN injection attacks"),
  },
  {
    id: "B39", from: 153, tools: ["All Phase 5 tools"],
    days: ["Phase 5 Mini-Project: Add Guardrails, PII Masking & Langfuse to API", "Run Full Promptfoo Security + Quality Eval Suite", "Write Incident Runbook (Provider Outage, Cost Spike, Prompt Injection)"],
    review: c("Phase 5 Production-Readiness Audit"),
  },

  /* -------------------------- Phase 6 · Days 157–180 --------------------------- */
  {
    id: "B40", from: 157, tools: ["ADR.md", "Repo", "Corpus"],
    days: ["Problem Framing, User Stories & Architecture Diagram (ADR)", "Repo Scaffold (uv, Ruff, pytest, docker compose)", "Prepare Thai/Bilingual Knowledge Corpus (20+ docs, tables, FAQs)"],
    review: m("Milestone 1: Architecture & Corpus Sign-off"),
  },
  {
    id: "B41", from: 161, tools: ["Hybrid Retrieval Module"],
    days: ["Build Ingestion Pipeline + Token-Aware Chunking", "Implement PyThaiNLP BM25 + pgvector/Qdrant Hybrid Search", "Add Cross-Encoder Reranker + Metadata/ACL Filtering"],
    review: m("Milestone 2: Retrieval Benchmark (Recall@5 >= 0.85)"),
  },
  {
    id: "B42", from: 165, tools: ["RAG", "MCP", "LangGraph"],
    days: ["Implement Grounded Answer Generation with Strict Citations", "Build MCP Server for Mock Order/Ticket Lookup (Read-only + Safe Write Gate)", "Wire LangGraph Router (FAQ RAG vs Tool Lookup vs Escalation)"],
    review: m("Milestone 3: End-to-End Core Flow Demo"),
  },
  {
    id: "B43", from: 169, tools: ["Eval Harness", "Traces"],
    days: ["Create 40-Case Golden Eval Dataset (Thai, Code-Switch, Unanswerable, Attack)", "Run Ragas + Promptfoo Evals & Fix Top 3 Failure Modes", "Integrate Langfuse Traces & Cost/Latency Telemetry"],
    review: m("Milestone 4: Eval Report Passing Quality Gates"),
  },
  {
    id: "B44", from: 173, tools: ["Live URL", "CI Pipeline"],
    days: ["Add PDPA PII Redaction Middleware & OWASP Injection Defenses", "Wrap in FastAPI SSE + Simple Web Chat UI / Swagger Demo", "Containerize (Docker) & Deploy to Staging Cloud + GitHub Actions CI"],
    review: m("Milestone 5: Live Deployed Staging + Red-Team Pass"),
  },
  {
    id: "B45", from: 177, tools: ["Portfolio-Ready Repo", "Demo"],
    days: ["Load & Failure Testing (Fallback when LLM times out)", "Polish README.md, Architecture Diagram & Eval/Cost Metrics Table", "Record 3-Minute Technical Demo + Prepare Interview Q&A"],
    review: { kind: "final", title: "Final Defense: Capstone Rubric Evaluation & Graduation" },
  },
];
