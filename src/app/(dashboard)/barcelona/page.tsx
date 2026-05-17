export default function BarcelonaPlanPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Barcelona Plan</h1>
          <p className="text-muted-foreground">
            Execution plan for MSc Sound & Music Computing at UPF Barcelona.
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-2xl">
        <iframe
          src="/Barcelona_MSc_Plan.html"
          className="h-full w-full border-0 bg-white"
          title="Barcelona Execution Plan"
        />
      </div>
    </div>
  );
}
