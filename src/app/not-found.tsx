import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl py-16 text-center" aria-labelledby="nf-title">
      <p className="eyebrow">404</p>
      <h1 id="nf-title" className="mt-2 text-2xl font-bold">
        ไม่พบหน้านี้
      </h1>
      <p className="mt-2 text-muted">บทเรียนมีตั้งแต่ Day 1 ถึง Day 180 (/lesson/d001 – /lesson/d180) — เลือกจากห้องสมุดได้เลย</p>
      <Link href="/" className="btn btn-primary mt-6">
        กลับห้องสมุด
      </Link>
    </section>
  );
}
