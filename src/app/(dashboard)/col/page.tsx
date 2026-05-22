import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CostOfLivingPage() {
  const cities = await prisma.cityCOL.findMany({
    orderBy: { totalMin: "asc" },
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-card via-card to-primary/5 p-8 shadow-2xl">
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
            Financial Planning
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            Cost of Living Analysis
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Compare monthly estimated expenses between EU tech hubs and your primary target, Barcelona. Calibrated with 2026 data.
          </p>
        </div>
      </div>

      {/* Main comparative grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cities.map((city) => {
          const isBarcelona = city.city === "Barcelona";
          return (
            <div
              key={city.id}
              className={`glass-card relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                isBarcelona
                  ? "border-2 border-primary/50 bg-gradient-to-b from-primary/5 to-transparent"
                  : ""
              }`}
            >
              {isBarcelona && (
                <div className="absolute right-3 top-3 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                  Primary Destination
                </div>
              )}
              <h3 className="text-2xl font-bold text-foreground">
                {city.city}, <span className="text-muted-foreground">{city.country}</span>
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">Source: {city.source}</p>

              <div className="mt-6 space-y-4">
                {/* Total Range */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Estimated Monthly Budget
                  </span>
                  <div className="mt-1 text-2xl font-bold text-foreground">
                    {city.currency} {city.totalMin} - {city.totalMax}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    (₹{(city.totalMin * 95).toLocaleString("en-IN")} - ₹{(city.totalMax * 95).toLocaleString("en-IN")}/mo)
                  </span>
                </div>

                {/* Line Items */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-muted-foreground">Rent (Shared flat)</span>
                    <span className="font-semibold text-foreground">
                      {city.currency} {city.rentMin} - {city.rentMax}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-muted-foreground">Groceries (Est.)</span>
                    <span className="font-semibold text-foreground">
                      {city.currency} {city.groceriesMin} - {city.groceriesMax}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-muted-foreground">Public Transport</span>
                    <span className="font-semibold text-foreground">
                      {city.currency} {city.transport}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-muted-foreground">Utilities (Flat)</span>
                    <span className="font-semibold text-foreground">
                      {city.currency} {city.utilities}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 py-1">
                    <span className="text-muted-foreground">Internet & Sim</span>
                    <span className="font-semibold text-foreground">
                      {city.currency} {city.internet}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Dining Out (Per meal)</span>
                    <span className="font-semibold text-foreground">
                      {city.currency} {city.diningPerMeal}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison analysis card */}
      <div className="glass-card">
        <h3 className="text-xl font-bold text-foreground">Strategic Financial Insight</h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Barcelona stands out as the most cost-effective target city in this analysis, requiring approximately{" "}
          <strong className="text-foreground">30% to 40% less capital</strong> monthly compared to expensive cities like Munich or Amsterdam.
          This reduced cost baseline directly lowers your required student loan size, meaning you can maintain a comfortable lifestyle with an average budget of{" "}
          <span className="text-foreground font-semibold">€1,100 - €1,400/month</span>, which is readily coverable by remote consulting work or part-time internships.
        </p>
      </div>
    </div>
  );
}
