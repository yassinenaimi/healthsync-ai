/*
 * Compare — Side-by-side plan comparison page
 * Select up to 3 plans for detailed table comparison
 * Design: "Ethereal Care" — glassmorphism, ambient glow
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Plus, X, Search, Loader2, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import TrueCostChart from "@/components/TrueCostChart";
import { useInsuranceEngine } from "@/hooks/useInsuranceEngine";
import type { BrowsePlan } from "@/lib/api";

function ProviderLogo({ plan, size = "md" }: { plan: BrowsePlan; size?: "sm" | "md" }) {
  const [error, setError] = useState(false);
  const dim = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  const imgDim = size === "sm" ? "w-5 h-5" : "w-7 h-7";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const rounded = size === "sm" ? "rounded-lg" : "rounded-xl";
  return (
    <div
      className={`${dim} ${rounded} flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0`}
      style={{ backgroundColor: plan.provider_logo_color + "20" }}
    >
      {plan.provider_logo_url && !error ? (
        <img
          src={plan.provider_logo_url}
          alt={plan.provider}
          className={`${imgDim} object-contain`}
          onError={() => setError(true)}
        />
      ) : (
        <span className={`font-bold ${textSize}`} style={{ color: plan.provider_logo_color }}>
          {plan.provider.charAt(0)}
        </span>
      )}
    </div>
  );
}

const COMPARISON_BG = "https://private-us-east-1.manuscdn.com/sessionFile/tFFY3yQ8e2XOUcC7AqQ3uG/sandbox/TUWdYnMhGrYnSlTBBMegGY-img-4_1771912470000_na1fn_Y29tcGFyaXNvbi1iZw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdEZGWTN5UThlMlhPVWNDN0FxUTN1Ry9zYW5kYm94L1RVV2RZbk1oR3JZblNsVEJCTWVnR1ktaW1nLTRfMTc3MTkxMjQ3MDAwMF9uYTFmbl9ZMjl0Y0dGeWFYTnZiaTFpWncuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=oacLuXSO7M~6hHZhEfpVoVciWRqQN8I2PLWHB6SsLyCn--g-~fv2T93v~UZX4xBbCRIJH8GL1lh0CeWeSSJg~mUuu5rFS7kdHiTNRiWq2LIlx5HHhykMpGw4xPWbvPW15OsnhRz6Gm4KvSKlOytGdco5EDYceaw5yVg0JNv7u8PXDe0QCeltcqAKUDINyoXwji0YqfILJif7B1tuYKq6aqIKcjpvxyMrxkQbe1FEigWoDzZkV00sd8qPOBeLZ8YU16QQyOoSkncnip96ViTuarfKJ1d0zK8LNl~8zlkVtCyK4mReHpZdj3LM85cDqQ1sj6f433DKFjSXdnetzpMYJQ__";

export default function Compare() {
  const { allPlans, trueCostEvents, calculateTrueCost, loading } = useInsuranceEngine();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedPlans = useMemo(() => {
    return selectedIds.map((id) => allPlans.find((p) => p.id === id)!).filter(Boolean);
  }, [selectedIds, allPlans]);

  const availablePlans = useMemo(() => {
    let plans = allPlans.filter((p) => !selectedIds.includes(p.id));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      plans = plans.filter(
        (p) => p.provider.toLowerCase().includes(q) || p.plan_name.toLowerCase().includes(q)
      );
    }
    return plans;
  }, [selectedIds, searchTerm, allPlans]);

  const addPlan = (id: number) => {
    if (selectedIds.length >= 3) return;
    setSelectedIds((prev) => [...prev, id]);
  };

  const removePlan = (id: number) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  };

  const comparisonRows = useMemo(() => {
    if (selectedPlans.length === 0) return [];
    return [
      { label: "Monthly Premium", values: selectedPlans.map((p) => `$${p.monthly_premium}`), category: "price" },
      { label: "Annual Premium", values: selectedPlans.map((p) => `$${p.annual_premium}`), category: "price" },
      { label: "Deductible", values: selectedPlans.map((p) => `$${p.deductible}`), category: "price" },
      { label: "Drug Coverage", values: selectedPlans.map((p) => `${p.drug_coverage.percentage}%`), category: "drugs" },
      { label: "Drug Annual Cap", values: selectedPlans.map((p) => `$${p.drug_coverage.annual_cap.toLocaleString()}`), category: "drugs" },
      { label: "Drug Deductible", values: selectedPlans.map((p) => `$${p.drug_coverage.deductible}`), category: "drugs" },
      { label: "Dental Basic", values: selectedPlans.map((p) => `${p.dental_coverage.basic_percentage}%`), category: "dental" },
      { label: "Dental Major", values: selectedPlans.map((p) => `${p.dental_coverage.major_percentage}%`), category: "dental" },
      { label: "Dental Limit", values: selectedPlans.map((p) => `$${p.dental_coverage.annual_limit.toLocaleString()}`), category: "dental" },
      { label: "Orthodontic", values: selectedPlans.map((p) => p.dental_coverage.orthodontic_limit > 0 ? `$${p.dental_coverage.orthodontic_limit.toLocaleString()}` : "\u2014"), category: "dental" },
      { label: "Vision Eyewear", values: selectedPlans.map((p) => `$${p.vision_coverage.eyewear_amount}`), category: "vision" },
      { label: "Vision Exam", values: selectedPlans.map((p) => `$${p.vision_coverage.exam_amount}`), category: "vision" },
      { label: "Massage (annual)", values: selectedPlans.map((p) => `$${p.paramedical.massage.annual_max}`), category: "paramedical" },
      { label: "Chiro (annual)", values: selectedPlans.map((p) => `$${p.paramedical.chiropractic.annual_max}`), category: "paramedical" },
      { label: "Physio (annual)", values: selectedPlans.map((p) => `$${p.paramedical.physiotherapy.annual_max}`), category: "paramedical" },
      { label: "Rating", values: selectedPlans.map((p) => `${p.rating}/5`), category: "overall" },
    ];
  }, [selectedPlans]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src={COMPARISON_BG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-4">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-cyan-300">Side-by-Side Comparison</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
              Compare Plans
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-sm">
              Select up to 3 plans to compare coverage, costs, and benefits in detail.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="glass-panel p-12 text-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading plans from database...</p>
          </div>
        ) : (
          <>
            {/* Plan selector */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[0, 1, 2].map((slot) => {
                const plan = selectedPlans[slot];
                return (
                  <motion.div
                    key={slot}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: slot * 0.1 }}
                    className={`glass-panel p-4 min-h-[120px] flex items-center justify-center ${
                      plan ? "border-cyan-500/30" : "border-dashed border-white/20"
                    }`}
                  >
                    {plan ? (
                      <div className="w-full">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <ProviderLogo plan={plan} size="md" />
                            <div>
                              <p className="text-xs text-slate-400">{plan.provider}</p>
                              <p className="text-sm font-medium text-white">{plan.plan_name}</p>
                              <p className="text-xs font-mono text-cyan-300">${plan.monthly_premium}/mo</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removePlan(plan.id)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Plus className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                        <p className="text-xs text-slate-500">Select Plan {slot + 1}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Plan picker */}
            {selectedIds.length < 3 && (
              <div className="glass-panel p-5 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search plans..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[300px] overflow-auto">
                  {availablePlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => addPlan(plan.id)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/20 transition-all text-left"
                    >
                      <ProviderLogo plan={plan} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 truncate">{plan.provider}</p>
                        <p className="text-sm text-white truncate">{plan.plan_name}</p>
                        <p className="text-xs font-mono text-slate-300">${plan.monthly_premium}/mo</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comparison table */}
            {selectedPlans.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel-strong p-6 mb-8"
              >
                <h2 className="font-heading text-lg font-semibold text-white mb-4">Detailed Comparison</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider w-40">Feature</th>
                        {selectedPlans.map((plan) => (
                          <th key={plan.id} className="text-center py-3 px-3">
                            <span className="text-white font-medium text-xs">{plan.plan_name}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row, i) => (
                        <tr key={row.label} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                          <td className="py-2.5 px-3 text-slate-400 text-xs">{row.label}</td>
                          {row.values.map((val, idx) => (
                            <td key={idx} className="py-2.5 px-3 text-center font-mono text-xs text-slate-300">
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* True Cost Chart */}
            {selectedPlans.length >= 2 && (
              <TrueCostChart
                plans={selectedPlans}
                events={trueCostEvents}
                calculateTrueCost={calculateTrueCost}
              />
            )}

            {/* Enrollment links */}
            {selectedPlans.length >= 2 && (
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {selectedPlans.map((plan) => (
                  plan.enrollment_url ? (
                    <a
                      key={plan.id}
                      href={plan.enrollment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Enroll: {plan.plan_name}
                    </a>
                  ) : null
                ))}
              </div>
            )}

            {selectedPlans.length < 2 && (
              <div className="glass-panel p-12 text-center">
                <BarChart3 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Select at least 2 plans to see the comparison</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
