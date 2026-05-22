"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Scenario {
  id: string;
  label: string;
  country: string;
  grossAnnual: number;
  currency: string;
  expectedNet?: number | null;
  notes?: string | null;
}

export function SalaryCalculatorClient({
  preCalculatedScenarios,
}: {
  preCalculatedScenarios: Scenario[];
}) {
  // Inputs
  const [grossSalary, setGrossSalary] = useState<number>(75000);
  const [country, setCountry] = useState<"ES" | "DE">("ES");
  const [loanAmountInr, setLoanAmountInr] = useState<number>(2200000); // Default 22 Lakhs

  // Conversions (1 EUR = 95 INR)
  const eurToInr = 95;

  // Tax calculations
  const calculateMonthlyNet = (gross: number, selectedCountry: "ES" | "DE") => {
    const monthlyGross = gross / 12;
    let taxRate = 0.3; // Default

    if (selectedCountry === "ES") {
      // Spain tax brackets approximate
      if (gross <= 35000) taxRate = 0.22;
      else if (gross <= 60000) taxRate = 0.28;
      else taxRate = 0.35;
    } else {
      // Germany tax brackets (Class 1 single)
      if (gross <= 45000) taxRate = 0.33;
      else if (gross <= 80000) taxRate = 0.39;
      else taxRate = 0.43;
    }

    return Math.round(monthlyGross * (1 - taxRate));
  };

  const monthlyNetEur = calculateMonthlyNet(grossSalary, country);
  const monthlyNetInr = monthlyNetEur * eurToInr;

  // Loan EMI calculations
  // SBI: 9.5% floating, 15-year (180 months) tenure
  // HDFC: 12% fixed, 10-year (120 months) tenure
  const calculateEMI = (principal: number, annualRate: number, tenureYears: number) => {
    const r = annualRate / 12 / 100;
    const n = tenureYears * 12;
    if (r === 0) return principal / n;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };

  const sbiEmi = calculateEMI(loanAmountInr, 9.5, 15);
  const hdfcEmi = calculateEMI(loanAmountInr, 12, 10);

  // EMI in EUR
  const sbiEmiEur = Math.round(sbiEmi / eurToInr);
  const hdfcEmiEur = Math.round(hdfcEmi / eurToInr);

  // Debt-to-income (DTI)
  const sbiDti = ((sbiEmiEur / monthlyNetEur) * 100).toFixed(1);
  const hdfcDti = ((hdfcEmiEur / monthlyNetEur) * 100).toFixed(1);

  // Quick Preset Clicker
  const handleApplyPreset = (preset: Scenario) => {
    setGrossSalary(preset.grossAnnual);
    setCountry(preset.country.toLowerCase().includes("germany") ? "DE" : "ES");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Inputs Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Gross Salary Slider */}
        <div className="glass-card space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-foreground">Expected Gross Annual Salary</h3>
            <span className="text-xl font-extrabold text-primary">
              €{grossSalary.toLocaleString("en-US")}
            </span>
          </div>

          <Slider
            min={40000}
            max={150000}
            step={5000}
            value={[grossSalary]}
            onValueChange={(val) => setGrossSalary(val[0])}
            className="py-4"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>€40k (Entry Level)</span>
            <span>€95k (Senior DSP)</span>
            <span>€150k (Lead Audio ML)</span>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-secondary block">
              Target Country Tax Jurisdiction
            </label>
            <Tabs
              value={country}
              onValueChange={(val) => setCountry(val as "ES" | "DE")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 bg-white/5 p-1">
                <TabsTrigger value="ES">🇪🇸 Spain (Approx. ~25-35% tax)</TabsTrigger>
                <TabsTrigger value="DE">🇩🇪 Germany (Approx. ~33-43% tax)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Loan Slider */}
        <div className="glass-card space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-foreground">Total Education Loan Principal</h3>
            <span className="text-xl font-extrabold text-cyan-400">
              ₹{(loanAmountInr / 100000).toFixed(1)} Lakhs
            </span>
          </div>

          <Slider
            min={1000000}
            max={3000000}
            step={100000}
            value={[loanAmountInr]}
            onValueChange={(val) => setLoanAmountInr(val[0])}
            className="py-4"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹10 Lakhs</span>
            <span>₹22 Lakhs (UPF 2027 Seed)</span>
            <span>₹30 Lakhs</span>
          </div>
        </div>

        {/* Pre-calculated Presets */}
        <div className="glass-card space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-secondary">
            Preset Industry Targets
          </h4>
          <div className="grid gap-3 sm:grid-cols-3">
            {preCalculatedScenarios.map((sc, idx) => (
              <button
                key={sc.id || idx}
                onClick={() => handleApplyPreset(sc)}
                className="text-left rounded-xl border border-white/5 bg-white/[0.02] p-3 transition-all hover:bg-white/[0.06] hover:scale-[1.02]"
              >
                <span className="text-[10px] text-muted-foreground block truncate">
                  {sc.country}
                </span>
                <span className="text-xs font-bold text-foreground block truncate mt-1">
                  {sc.label.split(" — ")[0]}
                </span>
                <span className="text-xs font-semibold text-primary block mt-1">
                  €{sc.grossAnnual.toLocaleString("en-US")}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Outputs Column */}
      <div className="space-y-6">
        {/* ROI Breakdown */}
        <div className="glass-card bg-gradient-to-br from-card to-primary/5 border border-white/10 space-y-6">
          <h3 className="text-lg font-bold text-foreground border-b border-white/5 pb-2">
            Monthly ROI Analysis
          </h3>

          {/* Income block */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Estimated Monthly Net Pay
            </span>
            <div className="text-3xl font-extrabold text-foreground">
              €{monthlyNetEur.toLocaleString("en-US")}
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              (₹{monthlyNetInr.toLocaleString("en-IN")} / mo)
            </span>
          </div>

          {/* SBI Card */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-foreground">SBI Ed-Vantage</span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                9.5% floating · 15 yr
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] text-muted-foreground block">Monthly Repayment</span>
                <span className="text-xl font-bold text-foreground">
                  ₹{sbiEmi.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">DTI Ratio</span>
                <span
                  className={`text-sm font-bold ${
                    parseFloat(sbiDti) > 20 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {sbiDti}% of Net
                </span>
              </div>
            </div>
          </div>

          {/* HDFC Card */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-foreground">HDFC Credila</span>
              <span className="text-xs font-semibold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                12% fixed · 10 yr
              </span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] text-muted-foreground block">Monthly Repayment</span>
                <span className="text-xl font-bold text-foreground">
                  ₹{hdfcEmi.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">DTI Ratio</span>
                <span
                  className={`text-sm font-bold ${
                    parseFloat(hdfcDti) > 20 ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {hdfcDti}% of Net
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy advice */}
        <div className="glass-card bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
          <h4 className="text-xs font-bold text-foreground">💡 Financial Management Note</h4>
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
            The ideal **Debt-to-Income (DTI) ratio** is **below 15%**. Using SBI collateral loan on a ₹22L principal keeps your DTI ratio at approximately **9-12%** for a standard mid-level tech salary (€55k-€75k) in Barcelona or Berlin. Pledging collateral saves up to **₹6,000/month** in repayment compared to HDFC Credila.
          </p>
        </div>
      </div>
    </div>
  );
}
