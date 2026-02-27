/*
 * PlanDetailModal — Detailed view of a single insurance plan
 * Design: "Ethereal Care" — glassmorphism overlay
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Pill, Smile, Eye, Hand, MapPin, ExternalLink, Globe } from "lucide-react";
import type { BrowsePlan } from "@/lib/api";

interface PlanDetailModalProps {
  plan: BrowsePlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanDetailModal({ plan, isOpen, onClose }: PlanDetailModalProps) {
  const [logoError, setLogoError] = useState(false);

  if (!plan) return null;

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

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10"
                style={{ backgroundColor: plan.provider_logo_color + "20" }}
              >
                {plan.provider_logo_url && !logoError ? (
                  <img
                    src={plan.provider_logo_url}
                    alt={plan.provider}
                    className="w-10 h-10 object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-white font-heading font-bold text-xl" style={{ color: plan.provider_logo_color }}>
                    {plan.provider.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-400">{plan.provider}</p>
                  {plan.provider_website && (
                    <a
                      href={plan.provider_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      title={`Visit ${plan.provider} website`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <h2 className="font-heading text-xl font-semibold text-white">{plan.plan_name}</h2>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(plan.rating) ? "text-amber-400 fill-current" : "text-slate-600"}`} />
                  ))}
                  <span className="text-xs text-slate-400 ml-1 font-mono">{plan.rating}</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="glass-panel p-4 mb-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-mono text-3xl font-bold text-white">${plan.monthly_premium}</span>
                  <span className="text-sm text-slate-400 ml-1">/month</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-slate-300">${plan.annual_premium}/year</p>
                  <p className="text-xs text-slate-500">Deductible: ${plan.deductible}</p>
                </div>
              </div>
            </div>

            {/* Enrollment CTA */}
            {plan.enrollment_url && (
              <a
                href={plan.enrollment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 transition-all duration-200 shadow-lg shadow-emerald-500/20"
              >
                <ExternalLink className="w-4 h-4" />
                Enroll Now on {plan.provider}
              </a>
            )}

            {/* Coverage sections */}
            <div className="space-y-3">
              <CoverageSection icon={<Pill className="w-4 h-4 text-cyan-400" />} title="Prescription Drugs">
                <DetailRow label="Coverage" value={`${plan.drug_coverage.percentage}%`} />
                <DetailRow label="Annual Cap" value={`$${plan.drug_coverage.annual_cap.toLocaleString()}`} />
                <DetailRow label="Deductible" value={`$${plan.drug_coverage.deductible}`} />
              </CoverageSection>

              <CoverageSection icon={<Smile className="w-4 h-4 text-cyan-400" />} title="Dental Care">
                <DetailRow label="Basic" value={`${plan.dental_coverage.basic_percentage}%`} />
                <DetailRow label="Major" value={`${plan.dental_coverage.major_percentage}%`} />
                <DetailRow label="Annual Limit" value={`$${plan.dental_coverage.annual_limit.toLocaleString()}`} />
                <DetailRow label="Orthodontic" value={plan.dental_coverage.orthodontic_limit > 0 ? `$${plan.dental_coverage.orthodontic_limit.toLocaleString()}` : "Not covered"} />
              </CoverageSection>

              <CoverageSection icon={<Eye className="w-4 h-4 text-cyan-400" />} title="Vision Care">
                <DetailRow label="Eye Exam" value={`$${plan.vision_coverage.exam_amount}`} />
                <DetailRow label="Eyewear" value={`$${plan.vision_coverage.eyewear_amount}`} />
                <DetailRow label="Frequency" value={plan.vision_coverage.frequency} />
              </CoverageSection>

              <CoverageSection icon={<Hand className="w-4 h-4 text-cyan-400" />} title="Paramedical Services">
                <DetailRow label="Massage" value={`$${plan.paramedical.massage.per_visit}/visit · $${plan.paramedical.massage.annual_max}/yr`} />
                <DetailRow label="Chiropractic" value={`$${plan.paramedical.chiropractic.per_visit}/visit · $${plan.paramedical.chiropractic.annual_max}/yr`} />
                <DetailRow label="Physiotherapy" value={`$${plan.paramedical.physiotherapy.per_visit}/visit · $${plan.paramedical.physiotherapy.annual_max}/yr`} />
              </CoverageSection>
            </div>

            {/* Provinces */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {plan.provinces.map((p) => (
                <span key={p} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-slate-300 border border-white/10">
                  {p}
                </span>
              ))}
            </div>

            {/* Highlights */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {plan.highlights.map((h) => (
                <span key={h} className="px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {h}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CoverageSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="glass-panel p-3">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="text-sm font-medium text-white">{title}</h3>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-mono text-slate-200">{value}</span>
    </div>
  );
}
