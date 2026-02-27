/*
 * PlanCard — Animated insurance plan card with glassmorphism
 * Design: "Ethereal Care" — frosted glass, ambient glow, spring animations
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Check, Plus, Minus, Pill, Eye, Smile, Hand, ExternalLink } from "lucide-react";
import type { BrowsePlan } from "@/lib/api";
import { Progress } from "@/components/ui/progress";

interface PlanCardProps {
  plan: BrowsePlan;
  index: number;
  isCompared: boolean;
  onToggleCompare: (id: number) => void;
  onViewDetails?: (plan: BrowsePlan) => void;
}

export default function PlanCard({ plan, index, isCompared, onToggleCompare, onViewDetails }: PlanCardProps) {
  const [logoError, setLogoError] = useState(false);
  const drugScore = Math.min(100, (plan.drug_coverage.percentage / 100) * 100);
  const dentalScore = Math.min(100, (plan.dental_coverage.annual_limit / 5000) * 100);
  const visionScore = Math.min(100, (plan.vision_coverage.eyewear_amount / 500) * 100);
  const paraScore = Math.min(100, (plan.paramedical.massage.annual_max / 2000) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`glass-panel p-5 relative group transition-all duration-300 flex flex-col ${
        isCompared ? "border-cyan-500/40 glow-cyan" : "hover:border-cyan-500/20"
      }`}
    >
      {/* Provider badge */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border border-white/10"
            style={{ backgroundColor: plan.provider_logo_color + "20" }}
          >
            {plan.provider_logo_url && !logoError ? (
              <img
                src={plan.provider_logo_url}
                alt={plan.provider}
                className="w-7 h-7 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-white font-heading font-bold text-sm" style={{ color: plan.provider_logo_color }}>
                {plan.provider.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">{plan.provider}</p>
            <h3 className="font-heading font-semibold text-white text-sm leading-tight">{plan.plan_name}</h3>
          </div>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span className="text-xs font-mono font-medium">{plan.rating}</span>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-bold text-white">${plan.monthly_premium}</span>
          <span className="text-xs text-slate-400">/month</span>
        </div>
        <p className="text-xs text-slate-500 font-mono">${plan.annual_premium}/year</p>
      </div>

      {/* Coverage bars */}
      <div className="space-y-2.5 mb-4">
        <CoverageBar icon={<Pill className="w-3 h-3" />} label="Drugs" value={drugScore} detail={`${plan.drug_coverage.percentage}%`} />
        <CoverageBar icon={<Smile className="w-3 h-3" />} label="Dental" value={dentalScore} detail={`$${plan.dental_coverage.annual_limit}`} />
        <CoverageBar icon={<Eye className="w-3 h-3" />} label="Vision" value={visionScore} detail={`$${plan.vision_coverage.eyewear_amount}`} />
        <CoverageBar icon={<Hand className="w-3 h-3" />} label="Paramedical" value={paraScore} detail={`$${plan.paramedical.massage.annual_max}`} />
      </div>

      {/* Highlights */}
      <div className="flex flex-wrap gap-1.5 mb-4 flex-shrink-0">
        {plan.highlights.map((h) => (
          <span key={h} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            {h}
          </span>
        ))}
        {plan.deductible === 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
            $0 Deductible
          </span>
        )}
      </div>

      {/* Spacer to push actions to bottom */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex gap-2 mb-2">
        <button
          onClick={() => onToggleCompare(plan.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
            isCompared
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              : "bg-white/[0.06] text-slate-300 border border-white/10 hover:bg-white/[0.1] hover:text-white"
          }`}
        >
          {isCompared ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {isCompared ? "Remove" : "Compare"}
        </button>
        <button
          onClick={() => onViewDetails?.(plan)}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 border border-cyan-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-200"
        >
          View Details
        </button>
      </div>

      {/* Enrollment link */}
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
      <span className="text-[11px] font-mono text-slate-300 w-10 text-right flex-shrink-0">{detail}</span>
    </div>
  );
}
