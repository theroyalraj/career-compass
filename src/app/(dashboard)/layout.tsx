import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { prisma } from "@/lib/db";
import type { DreamListMode } from "@/lib/dream-list-types";
import { SenseiWidget } from "@/components/layout/SenseiWidget";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await prisma.settings.findUnique({ where: { id: "singleton" } });
  const dreamListMode: DreamListMode =
    settings?.dreamListMode === "colleges" ? "colleges" : "companies";

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <div className="fixed inset-y-0 left-0 z-40 w-64 lg:w-72">
          <Sidebar />
        </div>
      </div>
      <div className="flex flex-1 flex-col md:pl-64 lg:pl-72">
        <div className="gradient-mesh fixed inset-0 -z-10 opacity-90" />
        <Topbar dreamListMode={dreamListMode} />
        <main className="relative flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <SenseiWidget />
      </div>
    </div>
  );
}
