import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskBoard } from "@/components/tasks/TaskBoard";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Kanban for execution — drag-free MVP with fast status updates."
      />
      <TaskBoard initialTasks={tasks} />
    </div>
  );
}
