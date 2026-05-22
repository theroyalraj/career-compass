import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ReadingListPage() {
  const items = await prisma.readingItem.findMany({
    orderBy: { addedAt: "desc" },
  });

  const queue = items.filter((i) => i.status === "queue");
  const reading = items.filter((i) => i.status === "reading");
  const completed = items.filter((i) => i.status === "completed");

  const getKindEmoji = (kind: string) => {
    switch (kind.toLowerCase()) {
      case "book":
        return "📘";
      case "paper":
        return "📄";
      default:
        return "🔗";
    }
  };

  const renderColumn = (title: string, list: typeof items, highlightColor: string) => (
    <div className="glass-card flex flex-col space-y-4">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${highlightColor}`} />
          {title}
        </h3>
        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground">
          {list.length}
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {list.length > 0 ? (
          list.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/5 bg-white/[0.01] p-4 space-y-2 hover:bg-white/[0.03] transition-colors relative overflow-hidden group"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-semibold text-secondary flex items-center gap-1">
                  <span>{getKindEmoji(item.kind)}</span>
                  {item.kind}
                </span>
                {item.rating && (
                  <span className="text-xs text-amber-400">★ {item.rating}</span>
                )}
              </div>
              <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                {item.title}
              </h4>
              {item.author && (
                <p className="text-xs text-muted-foreground">Author: {item.author}</p>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-primary hover:underline block pt-1"
                >
                  Visit Resource →
                </a>
              )}
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center py-8">
            <p className="text-xs text-muted-foreground text-center">No materials</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Materials & Research
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            SMC Study Library
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Curate academic papers, tech research blogs, and foundational textbooks supporting your transition to audio ML research.
          </p>
        </div>
      </div>

      {/* Bookshelf Columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {renderColumn("Study Queue", queue, "bg-cyan-500")}
        {renderColumn("In Progress", reading, "bg-primary")}
        {renderColumn("Completed", completed, "bg-emerald-400")}
      </div>
    </div>
  );
}
