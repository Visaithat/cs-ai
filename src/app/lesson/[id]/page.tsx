import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonView } from "@/components/lesson/LessonView";
import { LessonPreview } from "@/components/library/LessonPreview";
import { LESSON_ROUTE_IDS, resolveLessonRoute } from "@/content";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** All 180 days have a stable route; days without a full lesson render a metadata preview. */
export function generateStaticParams() {
  return LESSON_ROUTE_IDS.map((id) => ({ id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const route = resolveLessonRoute(id);
  if (!route) return {};
  if (route.kind === "authored") {
    return { title: `Day ${route.lesson.day} · ${route.lesson.titleEn}`, description: route.lesson.tagline };
  }
  return {
    title: `Day ${route.entry.day} · ${route.entry.shortTitle} (พรีวิว)`,
    description: `พรีวิว Day ${route.entry.day} จากแผนหลักสูตร: ${route.entry.title} — กำลังจัดทำเนื้อหาเต็ม`,
  };
}

export default async function LessonPage({ params }: PageProps) {
  const { id } = await params;
  const route = resolveLessonRoute(id);
  if (!route) notFound();
  if (route.kind === "authored") return <LessonView lesson={route.lesson} />;
  return <LessonPreview entry={route.entry} />;
}
