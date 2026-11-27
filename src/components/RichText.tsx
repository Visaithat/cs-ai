import { Fragment, type ReactNode } from "react";
import { GlossaryTerm } from "./Glossary";

/**
 * Inline markup used by lesson copy:
 *   **bold**   *italic*   `code`   {{term-id}}   {{term-id|label with `code`}}
 */
const TOKEN = /(\*\*[^*]+?\*\*|`[^`]+`|\{\{[^}]+\}\}|\*[^*\n]+?\*)/g;

export function renderInline(text: string, keyPrefix = "r", allowTerms = true): ReactNode[] {
  return text.split(TOKEN).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{renderInline(part.slice(2, -2), key, allowTerms)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={key} className="inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const [id, ...rest] = part.slice(2, -2).split("|");
      const label = rest.join("|").trim();
      if (!allowTerms) return <Fragment key={key}>{label ? renderInline(label, key, false) : id}</Fragment>;
      return (
        <GlossaryTerm key={key} id={id.trim()}>
          {label ? renderInline(label, key, false) : undefined}
        </GlossaryTerm>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

export function RichText({ text, allowTerms = true }: { text: string; allowTerms?: boolean }) {
  return <>{renderInline(text, "t", allowTerms)}</>;
}

/** Strip markup for aria-labels / plain contexts. */
export function plain(text: string): string {
  return text
    .replace(/\{\{[^}|]+\|([^}]+)\}\}/g, "$1")
    .replace(/\{\{([^}]+)\}\}/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1");
}
