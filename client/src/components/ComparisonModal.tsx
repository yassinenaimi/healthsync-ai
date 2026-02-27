/*
 * ComparisonModal — Glass-morphism comparison overlay
 * Side-by-side plan analysis in table format
 * Design: "Ethereal Care" — frosted glass, ambient glow
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ExternalLink } from "lucide-react";
import type { BrowsePlan } from "@/lib/api";

interface ComparisonModalProps {
  plans: BrowsePlan[];
  isOpen: boolean;
  onClose: () => void;
}

function ProviderLogo({ plan }: { plan: BrowsePlan }) {
  const [error, setError] = useState(false);
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-white/10"
      style={{ backgroundColor: plan.provider_logo_color + "20" }}
    >
      {plan.provider_logo_url && !error ? (
        <img
          src={plan.provider_logo_url}
          alt={plan.provider}
          className="w-6 h-6 object-contain"
          onError={() => setError(true)}
        />
      ) : (
        <span className="text-white font-bold text-xs" style={{ color: plan.provider_logo_color }}>
          {plan.provider.charAt(0)}
        </span>
      )}
    </div>
  );
}

export default function ComparisonModal({ plans, isOpen, onClose }: ComparisonModalProps) {
  if (!isOpen || plans.length === 0) return null;

  const rows = [
    { label: "Monthly Premium", getValue: (p: BrowsePlan) => `$${p.monthly_premium}`, highlight: "low" as const },
    { label: "Annual Premium", getValue: (p: BrowsePlan) => `$${p.annual_premium}`, highlight: "low" as const },
    { label: "Deductible", getValue: (p: BrowsePlan) => `$${p.deductible}`, highlight: "low" as const },
    { label: "Drug Coverage", getValue: (p: BrowsePlan) => `${p.drug_coverage.percentage}%`, highlight: "high" as const },
    { label: "Drug Annual Cap", getValue: (p: BrowsePlan) => `$${p.drug_coverage.annual_cap.toLocaleString()}`, highlight: "high" as const },
    { label: "Dental Basic", getValue: (p: BrowsePlan) => `${p.dental_coverage.basic_percentage}%`, highlight: "high" as const },
    { label: "Dental Major", getValue: (p: BrowsePlan) => `${p.dental_coverage.major_percentage}%`, highlight: "high" as const },
    { label: "Dental Limit", getValue: (p: BrowsePlan) => `$${p.dental_coverage.annual_limit.toLocaleString()}`, highlight: "high" as const },
    { label: "Orthodontic", getValue: (p: BrowsePlan) => p.dental_coverage.orthodontic_limit > 0 ? `$${p.dental_coverage.orthodontic_limit.toLocaleString()}` : "\u2014", highlight: "high" as const },
    { label: "Vision Eyewear", getValue: (p: BrowsePlan) => `$${p.vision_coverage.eyewear_amount}`, highlight: "high" as const },
    { label: "Vision Frequency", getValue: (p: BrowsePlan) => p.vision_coverage.frequency, highlight: "none" as const },
    { label: "Massage (annual)", getValue: (p: BrowsePlan) => `$${p.paramedical.massage.annual_max}`, highlight: "high" as const },
    { label: "Chiro (annual)", getValue: (p: BrowsePlan) => `$${p.paramedical.chiropractic.annual_max}`, highlight: "high" as const },
    { label: "Physio (annual)", getValue: (p: BrowsePlan) => `$${p.paramedical.physiotherapy.annual_max}`, highlight: "high" as const },
    { label: "Rating", getValue: (p: BrowsePlan) => `${p.rating}/5`, highlight: "high" as const },
  ];

  const getBestValue = (row: typeof rows[0]) => {
    if (row.highlight === "none") return -1;
    const values = plans.map((p) => {
      const val = row.getValue(p).replace(/[$,%/5]/g, "").replace(/,/g, "").replace("\u2014", "0");
      return parseFloat(val) || 0;
    });
    if (row.highlight === "low") return values.indexOf(Math.min(...values));
    return values.indexOf(Math.max(...values));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative glass-panel-strong p-6 max-w-4xl w-full max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-semibold text-white">Plan Comparison</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-slate-400 font-medium text-xs uppercase tracking-wider w-40">Feature</th>
                    {plans.map((plan) => (
                      <th key={plan.id} className="text-center py-3 px-3">
                        <div className="flex flex-col items-center gap-1">
                          <ProviderLogo plan={plan} />
                          <span className="text-white font-medium text-xs">{plan.provider}</span>
                          <span className="text-slate-400 text-[10px]">{plan.plan_name}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const bestIdx = getBestValue(row);
                    return (
                      <tr key={row.label} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                        <td className="py-2.5 px-3 text-slate-400 text-xs">{row.label}</td>
                        {plans.map((plan, idx) => (
                          <td
                            key={plan.id}
                            className={`py-2.5 px-3 text-center font-mono text-xs ${
                              bestIdx === idx ? "text-cyan-300 font-semibold" : "text-slate-300"
                            }`}
                          >
                            {row.getValue(plan)}
                            {bestIdx === idx && row.highlight !== "none" && (
                              <Check className="w-3 h-3 inline-block ml-1 text-cyan-400" />
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Enrollment links row */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {plans.map((plan) => (
                <div key={plan.id} className="glass-panel p-3">
                  <p className="text-xs font-medium text-white mb-2">{plan.plan_name}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {plan.highlights.map((h) => (
                      <span key={h} className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {h}
                      </span>
                    ))}
                  </div>
                  {plan.enrollment_url && (
                    <a
                      href={plan.enrollment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-200"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Enroll on {plan.provider}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
