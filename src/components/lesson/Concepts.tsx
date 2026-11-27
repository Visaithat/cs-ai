"use client";

import type { Lesson } from "@/content/types";
import { setTrack } from "@/lib/actions";
import { useAppState } from "@/lib/store";
import { CodeBlock } from "../CodeBlock";
import { ChevronRight, Lightbulb } from "../Icons";
import { RichText } from "../RichText";
import { Tabs } from "../Tabs";

export function Concepts({ lesson }: { lesson: Lesson }) {
  return (
    <div className="space-y-12">
      {lesson.concepts.map((concept) => (
        <article key={concept.id} aria-labelledby={`concept-${concept.id}`}>
          <h3 id={`concept-${concept.id}`} className="text-lg font-semibold leading-snug">
            {concept.title}
          </h3>
          {concept.paragraphs.map((paragraph, i) => (
            <p key={i} className="mt-3">
              <RichText text={paragraph} />
            </p>
          ))}
          {concept.analogy ? (
            <aside className="analogy-box" aria-label="เปรียบเทียบให้เห็นภาพ">
              <Lightbulb size={18} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-ink" />
              <p className="m-0">
                <strong className="font-semibold text-ink">เห็นภาพง่าย ๆ: </strong>
                <RichText text={concept.analogy} />
              </p>
            </aside>
          ) : null}
          {concept.bullets ? (
            <ul className="mt-4 list-disc space-y-2 pl-6 marker:text-brand">
              {concept.bullets.map((bullet, i) => (
                <li key={i}>
                  <RichText text={bullet} />
                </li>
              ))}
            </ul>
          ) : null}
          {concept.code ? <CodeBlock sample={concept.code} /> : null}

          <details className="why mt-4 border-l-2 border-hair pl-4">
            <summary className="font-medium text-muted hover:text-ink">
              <ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" className="chev shrink-0" />
              <span>{concept.why.title}</span>
            </summary>
            <div className="pb-4 pt-1">
              {concept.why.paragraphs.map((paragraph, i) => (
                <p key={i} className="mt-2">
                  <RichText text={paragraph} />
                </p>
              ))}
            </div>
          </details>
        </article>
      ))}

      <TrackBridge lesson={lesson} />
    </div>
  );
}

function TrackBridge({ lesson }: { lesson: Lesson }) {
  const state = useAppState();

  return (
    <section className="border-t border-hair pt-8" aria-labelledby="bridge-title">
      <h3 id="bridge-title" className="text-lg font-semibold">
        Track Bridge — เลือกมุมมองที่ตรงกับคุณ
      </h3>
      <p className="mt-1 text-sm text-muted">ระบบจำตัวเลือกนี้ไว้สำหรับบทถัดไป</p>
      <div className="mt-3">
        <Tabs
          label="เลือกกลุ่มผู้เรียน"
          value={state.track}
          onChange={(id) => setTrack(id === "student" ? "student" : "web")}
          items={lesson.bridges.map((bridge) => ({
            id: bridge.track,
            label: bridge.label,
            panel: (
              <div>
                <h4 className="font-semibold">{bridge.title}</h4>
                {bridge.body.map((paragraph, i) => (
                  <p key={i} className="mt-2">
                    <RichText text={paragraph} />
                  </p>
                ))}
                {bridge.table ? (
                  <div className="scroll-x mt-3">
                    <table className="w-full min-w-72 border-collapse text-left text-[0.9375rem]">
                      <caption className="sr-only">เทียบเครื่องมือฝั่ง Python/AI กับฝั่ง Web Dev</caption>
                      <thead>
                        <tr>
                          <th scope="col" className="border-b border-line px-3 py-2 text-muted">
                            Python / AI
                          </th>
                          <th scope="col" className="border-b border-line px-3 py-2 text-muted">
                            Web / JS / TS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {bridge.table.map(([py, js]) => (
                          <tr key={py}>
                            <th scope="row" className="border-b border-line px-3 py-2 font-mono text-sm font-medium">
                              {py}
                            </th>
                            <td className="border-b border-line px-3 py-2 font-mono text-sm">≈ {js}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            ),
          }))}
        />
      </div>
    </section>
  );
}
