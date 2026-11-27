"use client";

import type { Lesson } from "@/content/types";
import { setSetupStep } from "@/lib/actions";
import { getLesson as getProgress } from "@/lib/progress";
import { useAppState } from "@/lib/store";
import { Callout } from "../Callout";
import { CodeBlock } from "../CodeBlock";
import { RichText } from "../RichText";

export function SetupCheck({ lesson }: { lesson: Lesson }) {
  const state = useAppState();
  const progress = getProgress(state, lesson.id);
  const done = lesson.setup.steps.filter((s) => progress.setup[s.id]).length;

  return (
    <div>
      <p>
        <RichText text={lesson.setup.intro} />
      </p>
      <CodeBlock sample={lesson.setup.commands} />

      <fieldset className="mt-2">
        <legend className="p-0 pb-1 font-semibold">
          เช็กลิสต์ติดตั้ง{" "}
          <span className="font-normal text-muted tabular-nums">
            ({done}/{lesson.setup.steps.length})
          </span>
        </legend>
        <ul className="space-y-1">
          {lesson.setup.steps.map((step) => {
            const checked = Boolean(progress.setup[step.id]);
            return (
              <li key={step.id}>
                <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => setSetupStep(lesson.id, step.id, event.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[color:var(--brand)]"
                  />
                  <span className={checked ? "text-muted line-through decoration-1" : ""}>
                    <RichText text={step.label} allowTerms={false} />
                    {checked ? <span className="sr-only"> (เสร็จแล้ว)</span> : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <Callout tone="info" title="ติดขัด?">
        <RichText text={lesson.setup.note} />
      </Callout>
    </div>
  );
}
