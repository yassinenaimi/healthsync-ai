/*
 * AISearchResults — Displays the AI-powered insurance search results
 * Shows analysis summary, identified needs, and comparison cards
 * Features: Compare button, View Details, uniform card sizing
 * Design: "Ethereal Care" — glassmorphism, ambient glow
 */

import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Target, AlertCircle } from "lucide-react";
import AIInsuranceCard from "./AIInsuranceCard";
import type { AIInsuranceResult } from "@/lib/api";

interface AISearchResultsProps {
  results: AIInsuranceResult[];
  analysisSummary: string;
  identifiedNeeds: string[];
  isVisible: boolean;
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  onViewDetails: (result: AIInsuranceResult) => void;
}

export default function AISearchResults({
  results,
  analysisSummary,
  identifiedNeeds,
  isVisible,
  comparedIds,
  onToggleCompare,
  onViewDetails,
}: AISearchResultsProps) {
  if (!isVisible || results.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Analysis Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel-strong p-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-semibold text-white mb-1">AI Analysis</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{analysisSummary}</p>
            </div>
          </div>

          {/* Identified needs */}
          {identifiedNeeds.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-slate-400">Identified Needs</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {identifiedNeeds.map((need, i) => (
                  <motion.span
                    key={need}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                  >
                    {need}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Results header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <p className="text-sm text-slate-400">
              <span className="font-mono text-cyan-300 font-semibold">{results.length}</span> insurance plans recommended
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <AlertCircle className="w-3 h-3" />
            Ranked by match quality
          </div>
        </div>

        {/* Results grid — uniform card sizing with flex stretch */}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
          {results.map((result, i) => {
            const cardId = `${result.company_name}-${result.policy_name}`.replace(/\s+/g, "-").toLowerCase();
            return (
              <AIInsuranceCard
                key={`${result.company_name}-${result.policy_name}-${i}`}
                result={result}
                index={i}
                rank={i + 1}
                isCompared={comparedIds.includes(cardId)}
                onToggleCompare={onToggleCompare}
                onViewDetails={onViewDetails}
              />
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
