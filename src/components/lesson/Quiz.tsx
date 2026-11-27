"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Lesson } from "@/content/types";
import { checkAnswer, chooseAnswer, resetQuiz } from "@/lib/actions";
import { getLesson as getProgress } from "@/lib/progress";
import { useAppState, useHydrated } from "@/lib/store";
import { ArrowDown, ArrowRight, Check, RotateCcw, X } from "../Icons";
import { RichText } from "../RichText";

export function Quiz({ lesson }: { lesson: Lesson }) {
  const { questions, intro } = lesson.quiz;
  const state = useAppState();
  const hydrated = useHydrated();
  const progress = getProgress(state, lesson.id);
  const quiz = hydrated ? progress.quiz : { answers: {}, checked: {} };

  const answeredCount = questions.filter((q) => quiz.checked[q.id]).length;
  const firstOpen = questions.findIndex((q) => !quiz.checked[q.id]);
  const [cursor, setCursor] = useState<number | null>(null);
  const index = cursor ?? (firstOpen === -1 ? questions.length : firstOpen);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const headingId = useId();

  const correct = questions.filter((q) => quiz.checked[q.id] && quiz.answers[q.id] === q.answer).length;
  const question = questions[index];

  const checkedCurrent = question ? Boolean(quiz.checked[question.id]) : false;
  useEffect(() => {
    if (checkedCurrent) feedbackRef.current?.focus();
  }, [checkedCurrent, question?.id]);

  return (
    <div className="card p-5 sm:p-6">
      <p>
        <RichText text={intro} />
      </p>

      <ol className="mt-4 flex flex-wrap gap-2" aria-label="ความคืบหน้าควิซ">
        {questions.map((q, i) => {
          const done = quiz.checked[q.id];
          const right = done && quiz.answers[q.id] === q.answer;
          return (
            <li key={q.id}>
              <button
                type="button"
                onClick={() => setCursor(i)}
                aria-current={i === index ? "step" : undefined}
                aria-label={`ข้อ ${i + 1}${done ? (right ? " ตอบถูก" : " ตอบผิด") : " ยังไม่ได้ตอบ"}`}
                className={`inline-flex h-11 w-11 items-center justify-center rounded-full border text-sm font-bold ${
                  i === index ? "border-brand bg-brand-soft/40 font-bold text-ink" : "border-line"
                }`}
              >
                {done ? (
                  right ? (
                    <Check size={16} strokeWidth={2.2} aria-hidden="true" className="text-success" />
                  ) : (
                    <X size={16} strokeWidth={2.2} aria-hidden="true" className="text-danger" />
                  )
                ) : (
                  <span aria-hidden="true">{i + 1}</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {question ? (
        <QuestionCard
          key={question.id}
          lesson={lesson}
          index={index}
          total={questions.length}
          selected={quiz.answers[question.id]}
          checked={Boolean(quiz.checked[question.id])}
          feedbackRef={feedbackRef}
          onChecked={() => setCursor(index)}
          onNext={() => setCursor(index + 1 >= questions.length ? questions.length : index + 1)}
          questionId={question.id}
        />
      ) : (
        <div className="mt-5" aria-labelledby={headingId}>
          <h3 id={headingId} className="text-lg font-semibold">
            สรุปผลควิซ: {correct}/{questions.length} ข้อ
          </h3>
          <p className="mt-1">
            {answeredCount < questions.length
              ? "ยังมีข้อที่ยังไม่ได้ตอบ — กดหมายเลขข้อด้านบนเพื่อกลับไปทำ"
              : correct === questions.length
                ? "เยี่ยม! ตอบถูกครบทุกข้อ คุณพร้อมไปต่อ"
                : "ข้อที่พลาดถูกเพิ่มเข้าคิวทบทวนแล้ว — ดูได้ที่หน้าหลักและจะกลับมาถามตามรอบ Spaced Review (+3 / +8 / +16 วัน)"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => {
                resetQuiz(lesson.id);
                setCursor(0);
              }}
            >
              <RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" /> ทำควิซใหม่
            </button>
            <a href="#summary" className="btn btn-primary">
              ไปที่สรุปบท <ArrowDown size={16} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  lesson,
  index,
  total,
  selected,
  checked,
  feedbackRef,
  onChecked,
  onNext,
  questionId,
}: {
  lesson: Lesson;
  index: number;
  total: number;
  selected: string | undefined;
  checked: boolean;
  feedbackRef: React.RefObject<HTMLDivElement | null>;
  onChecked: () => void;
  onNext: () => void;
  questionId: string;
}) {
  const question = lesson.quiz.questions.find((q) => q.id === questionId)!;
  const name = useId();
  const chosen = question.options.find((o) => o.id === selected);
  const right = checked && selected === question.answer;
  const correctOption = question.options.find((o) => o.id === question.answer)!;
  const isLast = index + 1 >= total;

  return (
    <form
      className="mt-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (selected && !checked) {
          onChecked();
          checkAnswer(lesson.id, question, selected);
        }
      }}
    >
      <fieldset>
        <legend className="text-lg font-semibold leading-snug">
          <span className="mr-2 text-sm font-normal text-muted tabular-nums">
            ข้อ {index + 1}/{total}
          </span>
          <RichText text={question.prompt} />
        </legend>

        <div className="mt-3 space-y-2" role="radiogroup" aria-label={`ตัวเลือกข้อ ${index + 1}`}>
          {question.options.map((option) => {
            const isSelected = selected === option.id;
            const isCorrect = checked && option.id === question.answer;
            const isWrongPick = checked && isSelected && option.id !== question.answer;
            return (
              <label
                key={option.id}
                className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border p-3.5 ${
                  isCorrect ? "border-success bg-[color:var(--success-soft)]" : isWrongPick ? "border-danger bg-[color:var(--danger-soft)]" : isSelected ? "border-brand bg-brand-soft/20" : "border-hair hover:border-brand"
                } ${checked ? "cursor-default" : ""}`}
              >
                <input
                  type="radio"
                  name={name}
                  value={option.id}
                  checked={isSelected}
                  disabled={checked}
                  onChange={() => chooseAnswer(lesson.id, question.id, option.id)}
                  className="mt-1.5 h-5 w-5 shrink-0 accent-[color:var(--brand)]"
                />
                <span>
                  <span className="mr-1.5 font-mono font-bold">{option.id})</span>
                  <RichText text={option.text} allowTerms={false} />
                  {isCorrect ? <span className="ml-2 font-semibold text-success">✓ คำตอบที่ถูก</span> : null}
                  {isWrongPick ? <span className="ml-2 font-semibold text-danger">✕ ที่คุณเลือก</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {!checked ? (
        <div className="mt-4">
          <button type="submit" className="btn btn-primary" disabled={!selected}>
            ตรวจคำตอบ
          </button>
          {!selected ? <span className="ml-3 text-sm text-muted">เลือกคำตอบก่อน</span> : null}
        </div>
      ) : (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="status"
          className={`mt-4 rounded-xl border-l-4 border-y border-r p-4 outline-none ${right ? "border-l-success bg-[color:var(--success-soft)]" : "border-l-warning bg-[color:var(--warning-soft)]"}`}
          style={{ borderTopColor: "var(--line)", borderBottomColor: "var(--line)", borderRightColor: "var(--line)" }}
        >
          <p className="flex items-center gap-2 text-lg font-bold">
            {right ? <Check size={19} strokeWidth={2.2} aria-hidden="true" className="text-success" /> : <X size={19} strokeWidth={2.2} aria-hidden="true" className="text-danger" />}
            {right ? "ถูกต้อง!" : "ยังไม่ถูก — มาดูเหตุผลกัน"}
          </p>
          {chosen ? (
            <p className="mt-2">
              <strong>ตัวเลือก {chosen.id}:</strong> <RichText text={chosen.why} allowTerms={false} />
            </p>
          ) : null}
          {!right ? (
            <p className="mt-2">
              <strong>คำตอบที่ถูกคือ {correctOption.id}:</strong> <RichText text={correctOption.why} allowTerms={false} />
            </p>
          ) : null}
          <p className="mt-2">
            <strong>สรุป:</strong> <RichText text={question.explanation} />
          </p>
          {!right ? <p className="mt-2 text-sm text-muted">เพิ่มข้อนี้เข้าคิวทบทวนแล้ว (+3 / +8 / +16 วัน)</p> : null}
          <button type="button" className="btn btn-primary mt-3" onClick={onNext}>
            {isLast ? "ดูสรุปผล" : "ข้อถัดไป"} <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      )}
    </form>
  );
}
