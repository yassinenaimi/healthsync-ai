/*
 * AIInsuranceCard — Displays a single AI-recommended insurance plan
 * Design: "Ethereal Care" — glassmorphism with comparison ranking
 * Features: Company logos, coverage bars, View Details, Compare button
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Plus, Minus, Check, Trophy, TrendingUp, Shield, Pill, Smile, Eye, Hand, ExternalLink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { AIInsuranceResult } from "@/lib/api";

interface AIInsuranceCardProps {
  result: AIInsuranceResult;
  index: number;
  rank: number;
  isCompared?: boolean;
  onToggleCompare?: (id: string) => void;
  onViewDetails?: (result: AIInsuranceResult) => void;
}

const rankColors: Record<number, { border: string; bg: string; text: string; badge: string }> = {
  1: {
    border: "border-amber-400/40",
    bg: "from-amber-500/10 to-yellow-500/5",
    text: "text-amber-300",
    badge: "bg-gradient-to-r from-amber-500 to-yellow-500",
  },
  2: {
    border: "border-slate-300/30",
    bg: "from-slate-400/10 to-slate-300/5",
    text: "text-slate-300",
    badge: "bg-gradient-to-r from-slate-400 to-slate-300",
  },
  3: {
    border: "border-orange-400/30",
    bg: "from-orange-500/10 to-amber-600/5",
    text: "text-orange-300",
    badge: "bg-gradient-to-r from-orange-500 to-amber-600",
  },
};

/* ── Known provider logo map (reliable fallbacks) ── */
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
  "medavie": "https://logo.clearbit.com/medavie.bluecross.ca",
  "medavie blue cross": "https://logo.clearbit.com/medavie.bluecross.ca",
  "molina": "https://logo.clearbit.com/molinahealthcare.com",
  "centene": "https://logo.clearbit.com/centene.com",
  "wellcare": "https://logo.clearbit.com/wellcare.com",
  "oscar": "https://logo.clearbit.com/hioscar.com",
  "oscar health": "https://logo.clearbit.com/hioscar.com",
  "ambetter": "https://logo.clearbit.com/ambetterhealth.com",
  "caresource": "https://logo.clearbit.com/caresource.com",
};

/* ── Known provider website map (reliable fallback URLs) ── */
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
  "medavie": "https://www.medavie.bluecross.ca",
  "medavie blue cross": "https://www.medavie.bluecross.ca",
  "molina": "https://www.molinahealthcare.com",
  "centene": "https://www.centene.com",
  "wellcare": "https://www.wellcare.com",
  "oscar": "https://www.hioscar.com",
  "oscar health": "https://www.hioscar.com",
  "ambetter": "https://www.ambetterhealth.com",
  "caresource": "https://www.caresource.com",
};

/* ── Provider brand colors ── */
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
  "medavie": "#1E40AF",
  "medavie blue cross": "#1E40AF",
  "molina": "#00A651",
  "centene": "#003366",
  "wellcare": "#00529B",
  "oscar": "#FF5733",
  "oscar health": "#FF5733",
  "ambetter": "#00A3E0",
  "caresource": "#E31837",
};

function getReliableLogoUrl(companyName: string, aiLogoUrl?: string): string | null {
  const key = companyName.toLowerCase().trim();
  // First check our known logos map
  for (const [k, v] of Object.entries(KNOWN_LOGOS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Fall back to AI-provided URL if it looks valid
  if (aiLogoUrl && aiLogoUrl.startsWith("http") && !aiLogoUrl.includes("[object")) {
    return aiLogoUrl;
  }
  // Last resort: try clearbit with cleaned company name
  const domain = key.replace(/\s+/g, "").replace(/insurance|health|care|group|inc|corp|ltd/gi, "");
  if (domain.length > 2) {
    return `https://logo.clearbit.com/${domain}.com`;
  }
  return null;
}

function getReliableUrl(companyName: string, aiUrl?: string): string {
  const key = companyName.toLowerCase().trim();
  // Check known websites first
  for (const [k, v] of Object.entries(KNOWN_WEBSITES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Use AI URL only if it looks valid
  if (aiUrl && aiUrl.startsWith("http") && !aiUrl.includes("[object") && aiUrl !== "#") {
    return aiUrl;
  }
  // Fallback: construct a search URL
  return `https://www.google.com/search?q=${encodeURIComponent(companyName + " health insurance")}`;
}

function getProviderColor(companyName: string): string {
  const key = companyName.toLowerCase().trim();
  for (const [k, v] of Object.entries(KNOWN_COLORS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  // Generate a consistent color from the name
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

/* ── Parse estimated cost to get a numeric value for display ── */
function parseCostRange(cost: string): { low: number; high: number; display: string } {
  const numbers = cost.match(/\d[\d,]*/g);
  if (numbers && numbers.length >= 2) {
    return {
      low: parseInt(numbers[0].replace(/,/g, "")),
      high: parseInt(numbers[1].replace(/,/g, "")),
      display: cost,
    };
  }
  if (numbers && numbers.length === 1) {
    const val = parseInt(numbers[0].replace(/,/g, ""));
    return { low: val, high: val, display: cost };
  }
  return { low: 0, high: 0, display: cost };
}

export default function AIInsuranceCard({ result, index, rank, isCompared = false, onToggleCompare, onViewDetails }: AIInsuranceCardProps) {
  const [logoError, setLogoError] = useState(false);
  const rankStyle = rankColors[rank] || {
    border: "border-cyan-500/20",
    bg: "from-cyan-500/5 to-blue-500/5",
    text: "text-cyan-300",
    badge: "bg-gradient-to-r from-cyan-500 to-blue-500",
  };

  const stars = Array.from({ length: 5 }, (_, i) => i < result.rating);
  const logoUrl = getReliableLogoUrl(result.company_name, result.logo_url);
  const reliableUrl = getReliableUrl(result.company_name, result.url);
  const brandColor = getProviderColor(result.company_name);
  const costInfo = parseCostRange(result.estimated_monthly_cost);
  const cardId = `${result.company_name}-${result.policy_name}`.replace(/\s+/g, "-").toLowerCase();

  /* ── Estimate coverage scores from highlights text ── */
  const highlightText = result.coverage_highlights.join(" ").toLowerCase();
  const drugScore = highlightText.includes("drug") || highlightText.includes("prescription") || highlightText.includes("pharma") ? 80 : 40;
  const dentalScore = highlightText.includes("dental") || highlightText.includes("orthodon") ? 75 : 30;
  const visionScore = highlightText.includes("vision") || highlightText.includes("eye") || highlightText.includes("optical") ? 70 : 25;
  const paraScore = highlightText.includes("chiro") || highlightText.includes("massage") || highlightText.includes("physio") || highlightText.includes("paramedical") ? 65 : 20;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-panel p-5 relative group transition-all duration-300 flex flex-col ${
        isCompared ? "border-cyan-500/40 glow-cyan" : `hover:glow-cyan ${rankStyle.border}`
      }`}
    >
      {/* Rank badge */}
      {rank <= 3 && (
        <div className={`absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full ${rankStyle.badge} flex items-center justify-center shadow-lg z-10`}>
          {rank === 1 ? (
            <Trophy className="w-4 h-4 text-white" />
          ) : (
            <span className="text-xs font-bold text-white">#{rank}</span>
          )}
        </div>
      )}

      {/* Gradient overlay for top-ranked */}
      {rank <= 3 && (
        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${rankStyle.bg} pointer-events-none`} />
      )}

      <div className="relative z-[1] flex flex-col flex-1">
        {/* Provider header with logo */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10 flex-shrink-0"
              style={{ backgroundColor: brandColor + "20" }}
            >
              {logoUrl && !logoError ? (
                <img
                  src={logoUrl}
                  alt={result.company_name}
                  className="w-7 h-7 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-heading font-bold text-sm" style={{ color: brandColor }}>
                  {result.company_name.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 font-medium truncate">{result.company_name}</p>
              <h3 className="font-heading font-semibold text-white text-sm leading-tight line-clamp-2">{result.policy_name}</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-amber-400 flex-shrink-0 ml-2">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-mono font-medium">{result.rating}</span>
          </div>
        </div>

        {/* Price estimate */}
        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-white">
              {costInfo.low > 0 ? `$${costInfo.low}` : costInfo.display}
            </span>
            {costInfo.high > costInfo.low && (
              <span className="text-xs text-slate-400">-${costInfo.high}/month</span>
            )}
            {costInfo.low > 0 && costInfo.high === costInfo.low && (
              <span className="text-xs text-slate-400">/month</span>
            )}
          </div>
          {costInfo.low > 0 && (
            <p className="text-xs text-slate-500 font-mono">${costInfo.low * 12}{costInfo.high > costInfo.low ? `-$${costInfo.high * 12}` : ""}/year</p>
          )}
        </div>

        {/* Coverage bars — styled like the old PlanCard */}
        <div className="space-y-2.5 mb-4">
          <CoverageBar icon={<Pill className="w-3 h-3" />} label="Drugs" value={drugScore} detail={drugScore >= 60 ? "Included" : "Limited"} />
          <CoverageBar icon={<Smile className="w-3 h-3" />} label="Dental" value={dentalScore} detail={dentalScore >= 60 ? "Included" : "Limited"} />
          <CoverageBar icon={<Eye className="w-3 h-3" />} label="Vision" value={visionScore} detail={visionScore >= 60 ? "Included" : "Limited"} />
          <CoverageBar icon={<Hand className="w-3 h-3" />} label="Paramedical" value={paraScore} detail={paraScore >= 60 ? "Included" : "Limited"} />
        </div>

        {/* Coverage highlights as badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {result.coverage_highlights.slice(0, 4).map((highlight, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 line-clamp-1">
              {highlight.length > 30 ? highlight.substring(0, 28) + "…" : highlight}
            </span>
          ))}
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1" />

        {/* Actions — Compare + View Details */}
        <div className="flex gap-2 mb-2">
          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(cardId)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                isCompared
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-white/[0.06] text-slate-300 border border-white/10 hover:bg-white/[0.1] hover:text-white"
              }`}
            >
              {isCompared ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {isCompared ? "Remove" : "Compare"}
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(result)}
              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border border-cyan-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-200"
            >
              View Details
            </button>
          )}
        </div>

        {/* Visit Site link */}
        <a
          href={reliableUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all duration-200"
        >
          <ExternalLink className="w-3 h-3" />
          Visit {result.company_name}
        </a>
      </div>
    </motion.div>
  );
}

function CoverageBar({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-slate-400 w-4 flex-shrink-0">{icon}</div>
      <span className="text-[11px] text-slate-400 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1">
        <Progress value={value} className="h-1.5 bg-white/[0.06]" />
      </div>
      <span className="text-[11px] font-mono text-slate-300 w-14 text-right flex-shrink-0">{detail}</span>
    </div>
  );
}
