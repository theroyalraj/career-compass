import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const [tasks, jobs, contacts] = await Promise.all([
    prisma.task.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 6,
    }),
    prisma.job.findMany({
      where: {
        OR: [
          { company: { contains: q, mode: "insensitive" } },
          { role: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
    }),
    prisma.contact.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { company: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
    }),
  ]);

  const results: {
    type: string;
    id: string;
    title: string;
    subtitle?: string;
  }[] = [];

  for (const t of tasks) {
    results.push({
      type: "task",
      id: t.id,
      title: t.title,
      subtitle: t.status,
    });
  }
  for (const j of jobs) {
    results.push({
      type: "job",
      id: j.id,
      title: `${j.company} — ${j.role}`,
      subtitle: j.status,
    });
  }
  for (const c of contacts) {
    results.push({
      type: "contact",
      id: c.id,
      title: c.name,
      subtitle: c.company ?? undefined,
    });
  }

  const lower = q.toLowerCase();
  const pages: { id: string; title: string }[] = [
    { id: "/finance", title: "Finance" },
    { id: "/fx", title: "FX" },
    { id: "/visa", title: "Visa" },
    { id: "/interview", title: "Interview prep" },
    { id: "/dream-list", title: "Dream list" },
    { id: "/settings", title: "Settings" },
  ].filter((p) => p.title.toLowerCase().includes(lower));

  for (const p of pages) {
    results.push({ type: "page", id: p.id, title: p.title });
  }

  return NextResponse.json({ results: results.slice(0, 20) });
}
