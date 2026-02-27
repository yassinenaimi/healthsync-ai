/*
 * AIPlanDetailModal — Detailed view of an AI-recommended insurance plan
 * Shows coverage breakdown, explanation, and enrollment link
 * Design: "Ethereal Care" — glassmorphism overlay, matching old PlanDetailModal style
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Pill, Smile, Eye, Hand, ExternalLink, TrendingUp, Check, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { AIInsuranceResult } from "@/lib/api";

interface AIPlanDetailModalProps {
  result: AIInsuranceResult | null;
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
  "ssq insurance": "https://logo.clearbit.com/ssq.ca",
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
  "green shield": "https://www.greenshield.ca",
  "ia financial": "https://ia.ca",
  "equitable life": "https://www.equitable.ca",
  "ssq": "https://ssq.ca",
  "ssq insurance": "https://ssq.ca",
  "gms": "https://www.gms.ca",
  "oscar": "https://www.hioscar.com",
  "oscar health": "https://www.hioscar.com",
  "ambetter": "https://www.ambetterhealth.com",
  "molina": "https://www.molinahealthcare.com",
};

const KNOWN_COLORS: Record<string, string> = {
  "blue cross": "#1E40AF",
  "blue cross blue shield": "#1E40AF",
  "unitedhealth": "#002677",
  "unitedhealthcare": "#002677",
  "united healthcare": "#002677",
  "cigna": "#0072CE",
  "aetna": "#7B2D8E",
  "humana": "#4CAF50",
  "kaiser": "#004B87",
  "kaiser permanente": "#004B87",
  "anthem": "#003DA5",
  "sun life": "#DC2626",
  "manulife": "#047857",
  "canada life": "#7C3AED",
  "desjardins": "#059669",
  "greenshield": "#16A34A",
  "green shield": "#16A34A",
  "ia financial": "#1D4ED8",
  "equitable life": "#B45309",
  "ssq": "#9333EA",
  "ssq insurance": "#9333EA",
  "gms": "#0891B2",
  "oscar": "#FF5733",
  "oscar health": "#FF5733",
  "ambetter": "#00A3E0",
  "molina": "#00A651",
};

function getReliableLogoUrl(companyName: string, aiLogoUrl?: string): string | null {
  const key = companyName.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_LOGOS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  if (aiLogoUrl && aiLogoUrl.startsWith("http") && !aiLogoUrl.includes("[object")) return aiLogoUrl;
  const domain = key.replace(/\s+/g, "").replace(/insurance|health|care|group|inc|corp|ltd/gi, "");
  if (domain.length > 2) return `https://logo.clearbit.com/${domain}.com`;
  return null;
}

function getReliableUrl(companyName: string, aiUrl?: string): string {
  const key = companyName.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_WEBSITES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  if (aiUrl && aiUrl.startsWith("http") && !aiUrl.includes("[object") && aiUrl !== "#") return aiUrl;
  return `https://www.google.com/search?q=${encodeURIComponent(companyName + " health insurance")}`;
}

function getProviderColor(companyName: string): string {
  const key = companyName.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_COLORS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 60%, 45%)`;
}

export default function AIPlanDetailModal({ result, isOpen, onClose }: AIPlanDetailModalProps) {
  const [logoError, setLogoError] = useState(false);

  if (!result) return null;

  const logoUrl = getReliableLogoUrl(result.company_name, result.logo_url);
  const reliableUrl = getReliableUrl(result.company_name, result.url);
  const brandColor = getProviderColor(result.company_name);

  const highlightText = result.coverage_highlights.join(" ").toLowerCase();
  const drugScore = highlightText.includes("drug") || highlightText.includes("prescription") || highlightText.includes("pharma") ? 80 : 40;
  const dentalScore = highlightText.includes("dental") || highlightText.includes("orthodon") ? 75 : 30;
  const visionScore = highlightText.includes("vision") || highlightText.includes("eye") || highlightText.includes("optical") ? 70 : 25;
  const paraScore = highlightText.includes("chiro") || highlightText.includes("massage") || highlightText.includes("physio") || highlightText.includes("paramedical") ? 65 : 20;

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
            className="relative glass-panel-strong p-6 max-w-lg w-full max-h-[85vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>

            {/* Header with logo */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0"
                style={{ backgroundColor: brandColor + "20" }}
              >
                {logoUrl && !logoError ? (
                  <img
                    src={logoUrl}
                    alt={result.company_name}
                    className="w-10 h-10 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="font-heading font-bold text-xl" style={{ color: brandColor }}>
                    {result.company_name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-400">{result.company_name}</p>
                <h2 className="font-heading text-xl font-semibold text-white">{result.policy_name}</h2>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(result.rating) ? "text-amber-400 fill-current" : "text-slate-600"}`} />
                  ))}
                  <span className="text-xs text-slate-400 ml-1 font-mono">{result.rating}</span>
                </div>
              </div>
            </div>

            {/* Best for badge */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
                Best for: {result.best_for}
              </span>
            </div>

            {/* Price */}
            <div className="glass-panel p-4 mb-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-3xl font-bold text-white">{result.estimated_monthly_cost}</span>
                </div>
              </div>
            </div>

            {/* Enrollment CTA */}
            <a
              href={reliableUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 shadow-lg shadow-emerald-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              Visit {result.company_name}
            </a>

            {/* AI Explanation */}
            <div className="glass-panel p-4 mb-4">
              <h3 className="text-sm font-medium text-white mb-2">Why This Plan</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{result.explanation}</p>
            </div>

            {/* Coverage sections with visual bars */}
            <div className="space-y-3">
              <CoverageSection icon={<Pill className="w-4 h-4 text-cyan-400" />} title="Prescription Drugs" score={drugScore}>
                <p className="text-xs text-slate-300">
                  {drugScore >= 60
                    ? "This plan includes prescription drug coverage based on the AI analysis."
                    : "Limited or no specific drug coverage mentioned. Contact the provider for details."}
                </p>
              </CoverageSection>

              <CoverageSection icon={<Smile className="w-4 h-4 text-cyan-400" />} title="Dental Care" score={dentalScore}>
                <p className="text-xs text-slate-300">
                  {dentalScore >= 60
                    ? "Dental coverage is included in this plan based on the AI analysis."
                    : "Limited or no specific dental coverage mentioned. Contact the provider for details."}
                </p>
              </CoverageSection>

              <CoverageSection icon={<Eye className="w-4 h-4 text-cyan-400" />} title="Vision Care" score={visionScore}>
                <p className="text-xs text-slate-300">
                  {visionScore >= 60
                    ? "Vision care coverage is included in this plan based on the AI analysis."
                    : "Limited or no specific vision coverage mentioned. Contact the provider for details."}
                </p>
              </CoverageSection>

              <CoverageSection icon={<Hand className="w-4 h-4 text-cyan-400" />} title="Paramedical Services" score={paraScore}>
                <p className="text-xs text-slate-300">
                  {paraScore >= 60
                    ? "Paramedical services (massage, chiropractic, physiotherapy) are included."
                    : "Limited or no specific paramedical coverage mentioned. Contact the provider for details."}
                </p>
              </CoverageSection>
            </div>

            {/* Coverage Highlights */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-white mb-2">Coverage Highlights</h3>
              <div className="space-y-1.5">
                {result.coverage_highlights.map((highlight, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-slate-300">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <p className="text-[10px] text-amber-300/70 leading-relaxed">
                <strong>Note:</strong> Coverage details are AI-estimated based on publicly available information. Actual coverage, pricing, and terms may vary. Please visit the provider's website or contact them directly for accurate plan details and enrollment.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CoverageSection({ icon, title, score, children }: { icon: React.ReactNode; title: string; score: number; children: React.ReactNode }) {
  return (
    <div className="glass-panel p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium text-white flex-1">{title}</h3>
        <span className="text-[10px] font-mono text-slate-400">{score >= 60 ? "Covered" : "Limited"}</span>
      </div>
      <Progress value={score} className="h-1.5 bg-white/[0.06] mb-2" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}
