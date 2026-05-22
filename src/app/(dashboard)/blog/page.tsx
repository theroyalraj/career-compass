import { prisma } from "@/lib/db";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany();

  const ideas = posts.filter((p) => p.status === "idea");
  const drafts = posts.filter((p) => p.status === "drafting" || p.status === "draft");
  const published = posts.filter((p) => p.status === "published");

  const renderColumn = (title: string, list: typeof posts, badgeColor: string) => (
    <div className="glass-card flex flex-col space-y-4">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${badgeColor}`} />
          {title}
        </h3>
        <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground">
          {list.length}
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {list.length > 0 ? (
          list.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-white/5 bg-white/[0.01] p-4 space-y-3 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden group"
            >
              <div>
                {post.audience && (
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Target: {post.audience}
                  </span>
                )}
                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug mt-2">
                  {post.title}
                </h4>
              </div>

              {post.outlineMd && (
                <p className="text-xs text-muted-foreground line-clamp-2">{post.outlineMd}</p>
              )}

              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[10px] text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              {post.publishedUrl && (
                <a
                  href={post.publishedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-emerald-400 hover:underline block pt-1"
                >
                  View Article ↗
                </a>
              )}
              {post.publishedAt && (
                <span className="text-[10px] text-muted-foreground block font-mono">
                  Pub: {format(new Date(post.publishedAt), "MMM dd, yyyy")}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="h-full flex items-center justify-center py-8">
            <p className="text-xs text-muted-foreground text-center">No posts logged</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Thought Leadership
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Blog Writing Board
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Track your writing pipeline and publications. Authoring technical reviews cements your audio ML credibility in the European job market.
          </p>
        </div>
      </div>

      {/* Kanban Pipeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        {renderColumn("Idea Backlog", ideas, "bg-cyan-500")}
        {renderColumn("Drafting", drafts, "bg-primary")}
        {renderColumn("Published", published, "bg-emerald-400")}
      </div>
    </div>
  );
}
