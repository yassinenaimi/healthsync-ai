/*
 * AIComparisonModal — Side-by-side comparison of AI-recommended insurance plans
 * Design: "Ethereal Care" — glassmorphism overlay, table format
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ExternalLink, Shield } from "lucide-react";
import type { AIInsuranceResult } from "@/lib/api";

interface AIComparisonModalProps {
  results: AIInsuranceResult[];
  isOpen: boolean;
  onClose: () => void;
}

/* ── Known provider logo map ── */
const KNOWN_LOGOS: Record<string, string> = {
  "blue cross": "https://logo.clearbit.com/bluecross.ca",
  "blue cross blue shield": "https://logo.clearbit.com/bcbs.com",
  "unitedhealth": "https://logo.clearbit.com/uhc.com",
  "unitedhealthcare": "https://logo.clearbit.com/uhc.com",
  "united healthcare": "https://logo.clearbit.com/uhc.com",
  "cigna": "https://logo.clearbit.com/cigna.com",
  "aetna": "https://logo.clearbit.com/aetna.com",
  "humana": "https://logo.clearbit.com/humana.com",
  "kaiser": "https://logo.clearbit.com/kaiserpermanente.org",
  "kaiser permanente": "https://logo.clearbit.com/kaiserpermanente.org",
  "anthem": "https://logo.clearbit.com/anthem.com",
  "sun life": "https://logo.clearbit.com/sunlife.ca",
  "manulife": "https://logo.clearbit.com/manulife.ca",
  "canada life": "https://logo.clearbit.com/canadalife.com",
  "desjardins": "https://logo.clearbit.com/desjardins.com",
  "greenshield": "https://logo.clearbit.com/greenshield.ca",
  "green shield": "https://logo.clearbit.com/greenshield.ca",
  "ia financial": "https://logo.clearbit.com/ia.ca",
  "equitable life": "https://logo.clearbit.com/equitable.ca",
  "ssq": "https://logo.clearbit.com/ssq.ca",
  "gms": "https://logo.clearbit.com/gms.ca",
  "oscar": "https://logo.clearbit.com/hioscar.com",
  "oscar health": "https://logo.clearbit.com/hioscar.com",
  "ambetter": "https://logo.clearbit.com/ambetterhealth.com",
  "molina": "https://logo.clearbit.com/molinahealthcare.com",
};

const KNOWN_WEBSITES: Record<string, string> = {
  "blue cross": "https://www.bluecross.ca",
  "blue cross blue shield": "https://www.bcbs.com",
  "unitedhealth": "https://www.uhc.com",
  "unitedhealthcare": "https://www.uhc.com",
  "united healthcare": "https://www.uhc.com",
  "cigna": "https://www.cigna.com",
  "aetna": "https://www.aetna.com",
  "humana": "https://www.humana.com",
  "kaiser": "https://www.kaiserpermanente.org",
  "kaiser permanente": "https://www.kaiserpermanente.org",
  "anthem": "https://www.anthem.com",
  "sun life": "https://www.sunlife.ca",
  "manulife": "https://www.manulife.ca",
  "canada life": "https://www.canadalife.com",
  "desjardins": "https://www.desjardins.com",
  "greenshield": "https://www.greenshield.ca",
  "ia financial": "https://ia.ca",
  "equitable life": "https://www.equitable.ca",
  "ssq": "https://ssq.ca",
  "gms": "https://www.gms.ca",
  "oscar": "https://www.hioscar.com",
  "oscar health": "https://www.hioscar.com",
  "ambetter": "https://www.ambetterhealth.com",
  "molina": "https://www.molinahealthcare.com",
};

const KNOWN_COLORS: Record<string, string> = {
  "blue cross": "#1E40AF",
  "unitedhealth": "#002677",
  "unitedhealthcare": "#002677",
  "united healthcare": "#002677",
  "cigna": "#0072CE",
  "aetna": "#7B2D8E",
  "humana": "#4CAF50",
  "kaiser": "#004B87",
  "anthem": "#003DA5",
  "sun life": "#DC2626",
  "manulife": "#047857",
  "canada life": "#7C3AED",
  "desjardins": "#059669",
  "greenshield": "#16A34A",
  "ia financial": "#1D4ED8",
  "equitable life": "#B45309",
  "ssq": "#9333EA",
  "gms": "#0891B2",
  "oscar": "#FF5733",
  "ambetter": "#00A3E0",
  "molina": "#00A651",
};

function getLogoUrl(name: string, aiUrl?: string): string | null {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_LOGOS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  if (aiUrl && aiUrl.startsWith("http") && !aiUrl.includes("[object")) return aiUrl;
  return null;
}

function getUrl(name: string, aiUrl?: string): string {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_WEBSITES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  if (aiUrl && aiUrl.startsWith("http") && !aiUrl.includes("[object") && aiUrl !== "#") return aiUrl;
  return `https://www.google.com/search?q=${encodeURIComponent(name + " health insurance")}`;
}

function getColor(name: string): string {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_COLORS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 60%, 45%)`;
}

function ProviderLogo({ result }: { result: AIInsuranceResult }) {
  const [error, setError] = useState(false);
  const logoUrl = getLogoUrl(result.company_name, result.logo_url);
  const color = getColor(result.company_name);

  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden border border-white/10"
      style={{ backgroundColor: color + "20" }}
    >
      {logoUrl && !error ? (
        <img
          src={logoUrl}
          alt={result.company_name}
          className="w-6 h-6 object-contain"
          onError={() => setError(true)}
        />
      ) : (
        <span className="font-bold text-xs" style={{ color }}>
          {result.company_name.charAt(0)}
        </span>
      )}
    </div>
  );
}

function hasCoverage(result: AIInsuranceResult, keywords: string[]): string {
  const text = result.coverage_highlights.join(" ").toLowerCase() + " " + result.explanation.toLowerCase();
  return keywords.some(k => text.includes(k)) ? "✓ Included" : "—";
}

export default function AIComparisonModal({ results, isOpen, onClose }: AIComparisonModalProps) {
  if (!isOpen || results.length === 0) return null;

  const rows: { label: string; getValue: (r: AIInsuranceResult) => string; highlight: "high" | "low" | "none" }[] = [
    { label: "Rating", getValue: (r) => `${r.rating}/5`, highlight: "high" },
    { label: "Est. Monthly Cost", getValue: (r) => r.estimated_monthly_cost, highlight: "none" },
    { label: "Best For", getValue: (r) => r.best_for, highlight: "none" },
    { label: "Drug Coverage", getValue: (r) => hasCoverage(r, ["drug", "prescription", "pharma", "medication"]), highlight: "none" },
    { label: "Dental Coverage", getValue: (r) => hasCoverage(r, ["dental", "orthodon", "teeth"]), highlight: "none" },
    { label: "Vision Coverage", getValue: (r) => hasCoverage(r, ["vision", "eye", "optical", "eyewear"]), highlight: "none" },
    { label: "Paramedical", getValue: (r) => hasCoverage(r, ["chiro", "massage", "physio", "paramedical", "acupuncture"]), highlight: "none" },
    { label: "Mental Health", getValue: (r) => hasCoverage(r, ["mental", "psych", "counseling", "therapy"]), highlight: "none" },
  ];

  const getBestValue = (row: typeof rows[0]) => {
    if (row.highlight === "none") return -1;
    const values = results.map((r) => {
      const val = row.getValue(r).replace(/[$,%/5✓—]/g, "").replace(/,/g, "").trim();
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
              <h2 className="font-heading text-xl font-semibold text-white">AI Plan Comparison</h2>
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
                    {results.map((result, i) => (
                      <th key={i} className="text-center py-3 px-3">
                        <div className="flex flex-col items-center gap-1">
                          <ProviderLogo result={result} />
                          <span className="text-white font-medium text-xs">{result.company_name}</span>
                          <span className="text-slate-400 text-[10px] line-clamp-1">{result.policy_name}</span>
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
                        {results.map((result, idx) => {
                          const val = row.getValue(result);
                          return (
                            <td
                              key={idx}
                              className={`py-2.5 px-3 text-center text-xs ${
                                val.includes("✓") ? "text-emerald-300 font-medium" :
                                val === "—" ? "text-slate-500" :
                                bestIdx === idx ? "text-cyan-300 font-semibold font-mono" : "text-slate-300 font-mono"
                              }`}
                            >
                              {val}
                              {bestIdx === idx && row.highlight !== "none" && (
                                <Check className="w-3 h-3 inline-block ml-1 text-cyan-400" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Explanation & links row */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {results.map((result, i) => (
                <div key={i} className="glass-panel p-3">
                  <p className="text-xs font-medium text-white mb-1">{result.policy_name}</p>
                  <p className="text-[10px] text-slate-400 mb-2 line-clamp-2">{result.explanation}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {result.coverage_highlights.slice(0, 3).map((h, j) => (
                      <span key={j} className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {h.length > 25 ? h.substring(0, 23) + "…" : h}
                      </span>
                    ))}
                  </div>
                  <a
                    href={getUrl(result.company_name, result.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-200"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit {result.company_name}
                  </a>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <p className="text-[10px] text-amber-300/70 leading-relaxed">
                <strong>Note:</strong> This comparison is based on AI-estimated data. Actual coverage, pricing, and terms may vary. Please visit each provider's website for accurate details.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
