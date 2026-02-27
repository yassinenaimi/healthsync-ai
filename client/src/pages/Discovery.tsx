/*
 * Discovery — Plan browsing, AI-powered story search, and filtering interface
 * Split-screen: AI story input + filters on left, dynamic plan cards on right
 * Design: "Ethereal Care" — glassmorphism, ambient glow, spring animations
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, ArrowUpDown, X, Filter, Loader2, Sparkles, MessageSquare, Shield, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import PlanCard from "@/components/PlanCard";
import BodyMap from "@/components/BodyMap";
import PlanDetailModal from "@/components/PlanDetailModal";
import ComparisonModal from "@/components/ComparisonModal";
import AIStoryInput from "@/components/AIStoryInput";
import AISearchResults from "@/components/AISearchResults";
import AIPlanDetailModal from "@/components/AIPlanDetailModal";
import AIComparisonModal from "@/components/AIComparisonModal";
import { useInsuranceEngine, type SortOption } from "@/hooks/useInsuranceEngine";
import { provinces, type CoverageCategory, type InsurancePlan } from "@/lib/data";
import { aiSearchInsurance, type AIInsuranceResult } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const BODY_MAP_BG = "https://private-us-east-1.manuscdn.com/sessionFile/tFFY3yQ8e2XOUcC7AqQ3uG/sandbox/TUWdYnMhGrYnSlTBBMegGY-img-2_1771912467000_na1fn_Ym9keS1tYXAtYmc.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdEZGWTN5UThlMlhPVWNDN0FxUTN1Ry9zYW5kYm94L1RVV2RZbk1oR3JZblNsVEJCTWVnR1ktaW1nLTJfMTc3MTkxMjQ2NzAwMF9uYTFmbl9ZbTlrZVMxdFlYQXRZbWMuanBnP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=IndqJxTWGYi2LjGEXiT26T~Ngi-8GpPHy7BCTZV8XO71zudwnfKkh--f2E3Ib-0PyL1Z3~-YNgfO4ptfu4icxknD~nyRPdu9oxXRLi2LBav3fW~NHLwFAM4VtjYDLh955mYXl2WW1sqbe89aO6eTZJS-p0B3fo5FqukbUxX1dGtFFc6nWuJM-KqdedPOQxGZhQCIPvtnKmkdyuLhef-rkApO1wB8Hc4tD2jpOOjb~hdUNMoiwvbCNB2dkTEMux2qKAF~pBkJIWIA5GGTXJSSopYoDECQ-9jamlBjVy~tUcU7Rca7CVeJxroD1qZr8slCvD-VgHFmJb2yAEZVH~JuGw__";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "rating", label: "Top Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "coverage", label: "Best Coverage" },
  { value: "provider", label: "Provider A-Z" },
];

export default function Discovery() {
  const {
    filters, sortBy, filteredPlans, comparedPlanIds, comparedPlans,
    updateFilters, resetFilters, setSortBy, toggleCompare, loading, error,
  } = useInsuranceEngine();

  const [showFilters, setShowFilters] = useState(false);
  const [showBodyMap, setShowBodyMap] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // AI Search state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AIInsuranceResult[]>([]);
  const [aiSummary, setAiSummary] = useState("");
  const [aiNeeds, setAiNeeds] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAIResults, setShowAIResults] = useState(false);

  // AI Compare & Detail state
  const [aiComparedIds, setAiComparedIds] = useState<string[]>([]);
  const [showAIComparison, setShowAIComparison] = useState(false);
  const [selectedAIResult, setSelectedAIResult] = useState<AIInsuranceResult | null>(null);

  const handleBodyMapSelect = useCallback((category: CoverageCategory) => {
    const current = filters.mustHaves;
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    updateFilters({ mustHaves: updated });
  }, [filters.mustHaves, updateFilters]);

  const handleAISearch = useCallback(async (story: string) => {
    setAiLoading(true);
    setAiError(null);
    setShowAIResults(false);
    setAiComparedIds([]);

    try {
      const response = await aiSearchInsurance(story);
      setAiResults(response.results);
      setAiSummary(response.analysis_summary);
      setAiNeeds(response.identified_needs);
      setShowAIResults(true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "AI search failed. Please try again.";
      setAiError(errorMsg);
    } finally {
      setAiLoading(false);
    }
  }, []);

  const handleAIReset = useCallback(() => {
    setAiResults([]);
    setAiSummary("");
    setAiNeeds([]);
    setAiError(null);
    setShowAIResults(false);
    setAiComparedIds([]);
  }, []);

  const handleAIToggleCompare = useCallback((id: string) => {
    setAiComparedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const handleAIViewDetails = useCallback((result: AIInsuranceResult) => {
    setSelectedAIResult(result);
  }, []);

  // Get compared AI results for comparison modal
  const aiComparedResults = aiResults.filter((r) => {
    const cardId = `${r.company_name}-${r.policy_name}`.replace(/\s+/g, "-").toLowerCase();
    return aiComparedIds.includes(cardId);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Split screen layout */}
          <div className="grid lg:grid-cols-[420px_1fr] gap-6">
            {/* Left panel — AI Story Input, Search & Filters */}
            <div className="space-y-4">
              {/* AI Story Input */}
              <AIStoryInput
                onSearch={handleAISearch}
                isLoading={aiLoading}
                hasResults={showAIResults}
                onReset={handleAIReset}
              />

              {/* AI Error */}
              <AnimatePresence>
                {aiError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-panel p-4 border-red-500/30"
                  >
                    <p className="text-xs text-red-400">{aiError}</p>
                    <button
                      onClick={() => setAiError(null)}
                      className="text-[10px] text-slate-400 hover:text-white mt-1 transition-colors"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search (traditional) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel-strong p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <h2 className="font-heading text-sm font-semibold text-white">Search Plans</h2>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Search by provider name, plan name, or feature keywords.
                </p>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                    placeholder="e.g., Blue Cross, dental, family..."
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Search className="w-4 h-4 text-slate-500" />
                  </div>
                </div>
              </motion.div>

              {/* Body Map Toggle */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <button
                  onClick={() => setShowBodyMap(!showBodyMap)}
                  className="w-full glass-panel p-4 flex items-center justify-between hover:border-cyan-500/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="5" r="3" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                        <line x1="10" y1="22" x2="12" y2="16" />
                        <line x1="14" y1="22" x2="12" y2="16" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-white">Body Map Selector</span>
                  </div>
                  <span className="text-xs text-slate-400">{showBodyMap ? "Hide" : "Show"}</span>
                </button>
              </motion.div>

              {/* Body Map */}
              <AnimatePresence>
                {showBodyMap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="glass-panel p-4 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        <img src={BODY_MAP_BG} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-xs text-slate-400 mb-2 text-center">Click body regions to filter by coverage type</p>
                        <BodyMap
                          onSelectCoverage={handleBodyMapSelect}
                          selectedCategories={filters.mustHaves}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full glass-panel p-4 flex items-center justify-between hover:border-cyan-500/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">Advanced Filters</span>
                  </div>
                  <span className="text-xs text-slate-400">{showFilters ? "Hide" : "Show"}</span>
                </button>
              </motion.div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="glass-panel p-5 space-y-4">
                      {/* Province */}
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Province</label>
                        <Select value={filters.province || "all"} onValueChange={(v) => updateFilters({ province: v === "all" ? "" : v as any })}>
                          <SelectTrigger className="bg-white/[0.05] border-white/10 text-sm text-white">
                            <SelectValue placeholder="All Provinces" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10">
                            <SelectItem value="all">All Provinces</SelectItem>
                            {provinces.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Plan Type */}
                      <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">Plan Type</label>
                        <Select value={filters.planType || "all"} onValueChange={(v) => updateFilters({ planType: v === "all" ? "" : v as any })}>
                          <SelectTrigger className="bg-white/[0.05] border-white/10 text-sm text-white">
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10">
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="couple">Couple</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Max Premium */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs text-slate-400">Max Monthly Premium</label>
                          <span className="text-xs font-mono text-cyan-300">${filters.maxPremium}</span>
                        </div>
                        <Slider
                          value={[filters.maxPremium]}
                          onValueChange={([v]) => updateFilters({ maxPremium: v })}
                          min={50}
                          max={500}
                          step={10}
                          className="w-full"
                        />
                      </div>

                      {/* Reset */}
                      <button
                        onClick={resetFilters}
                        className="w-full py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 transition-all"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Compare button for regular plans */}
              {!showAIResults && comparedPlanIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <button
                    onClick={() => setShowComparison(true)}
                    className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                  >
                    Compare {comparedPlanIds.length} Plan{comparedPlanIds.length > 1 ? "s" : ""}
                  </button>
                </motion.div>
              )}

              {/* Compare button for AI results */}
              {showAIResults && aiComparedIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <button
                    onClick={() => setShowAIComparison(true)}
                    className="w-full py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                  >
                    Compare {aiComparedIds.length} AI Plan{aiComparedIds.length > 1 ? "s" : ""}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Right panel — AI Results or Plan Cards */}
            <div>
              {/* Show AI Results when available */}
              {showAIResults ? (
                <AISearchResults
                  results={aiResults}
                  analysisSummary={aiSummary}
                  identifiedNeeds={aiNeeds}
                  isVisible={showAIResults}
                  comparedIds={aiComparedIds}
                  onToggleCompare={handleAIToggleCompare}
                  onViewDetails={handleAIViewDetails}
                />
              ) : (
                <>
                  {/* Show plan grid when plans are loaded from DB */}
                  {!loading && !error && filteredPlans.length > 0 && (
                    <>
                      {/* Sort & Count */}
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-400">
                          <span className="font-mono text-cyan-300 font-semibold">{filteredPlans.length}</span> plans found
                        </p>
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                            <SelectTrigger className="bg-white/[0.05] border-white/10 text-xs text-white w-[160px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10">
                              {sortOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Active filters */}
                      {(filters.province || filters.planType || filters.mustHaves.length > 0 || filters.maxPremium < 500) && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {filters.province && (
                            <FilterBadge label={`Province: ${filters.province}`} onRemove={() => updateFilters({ province: "" })} />
                          )}
                          {filters.planType && (
                            <FilterBadge label={`Type: ${filters.planType}`} onRemove={() => updateFilters({ planType: "" })} />
                          )}
                          {filters.maxPremium < 500 && (
                            <FilterBadge label={`Max: $${filters.maxPremium}/mo`} onRemove={() => updateFilters({ maxPremium: 500 })} />
                          )}
                          {filters.mustHaves.map((c) => (
                            <FilterBadge
                              key={c}
                              label={c}
                              onRemove={() => updateFilters({ mustHaves: filters.mustHaves.filter((x) => x !== c) })}
                            />
                          ))}
                        </div>
                      )}

                      {/* Plan grid */}
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
                        <AnimatePresence mode="popLayout">
                          {filteredPlans.map((plan, i) => (
                            <PlanCard
                              key={plan.id}
                              plan={plan}
                              index={i}
                              isCompared={comparedPlanIds.includes(plan.id)}
                              onToggleCompare={toggleCompare}
                              onViewDetails={setSelectedPlan}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </>
                  )}

                  {/* Loading state */}
                  {loading && (
                    <div className="glass-panel p-12 text-center">
                      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">Loading plans...</p>
                    </div>
                  )}

                  {/* Friendly welcome state — shown when no plans loaded (DB unavailable or empty) */}
                  {!loading && (error || filteredPlans.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Hero welcome card */}
                      <div className="glass-panel p-8 sm:p-10 text-center relative overflow-hidden">
                        {/* Ambient glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-5 border border-cyan-500/10">
                            <Sparkles className="w-8 h-8 text-cyan-400" />
                          </div>

                          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
                            Tell us your <span className="text-gradient-cyan">story</span>
                          </h2>
                          <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto mb-6 leading-relaxed">
                            Describe your health needs, family situation, and budget in plain English.
                            Our AI will find the best Canadian insurance plans for you.
                          </p>

                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                            <MessageSquare className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs sm:text-sm text-cyan-300 font-medium">Use the AI Search panel on the left to get started</span>
                          </div>
                        </div>
                      </div>

                      {/* Feature highlights */}
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="glass-panel p-5 text-center">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                            <Shield className="w-5 h-5 text-emerald-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-white mb-1">Real Plans</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">AI-powered search finds actual Canadian insurance plans from trusted providers.</p>
                        </div>
                        <div className="glass-panel p-5 text-center">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                            <Heart className="w-5 h-5 text-purple-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-white mb-1">Personalized</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">Tailored recommendations based on your unique health needs and family situation.</p>
                        </div>
                        <div className="glass-panel p-5 text-center">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-3">
                            <Search className="w-5 h-5 text-cyan-400" />
                          </div>
                          <h3 className="text-sm font-semibold text-white mb-1">Compare</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">Compare plans side-by-side with detailed coverage breakdowns and true costs.</p>
                        </div>
                      </div>

                      {/* Example prompts */}
                      <div className="glass-panel p-6">
                        <p className="text-xs text-slate-500 mb-3 text-center">Try saying something like...</p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {[
                            "Family of 4 in Ontario, need dental and vision",
                            "Single in BC, need massage therapy coverage",
                            "Couple in Quebec, budget $200/month",
                            "Senior in Alberta, need prescription drugs",
                          ].map((example, i) => (
                            <div
                              key={i}
                              className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-slate-400 italic"
                            >
                              "{example}"
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PlanDetailModal plan={selectedPlan} isOpen={!!selectedPlan} onClose={() => setSelectedPlan(null)} />
      <ComparisonModal plans={comparedPlans} isOpen={showComparison} onClose={() => setShowComparison(false)} />
      <AIPlanDetailModal result={selectedAIResult} isOpen={!!selectedAIResult} onClose={() => setSelectedAIResult(null)} />
      <AIComparisonModal results={aiComparedResults} isOpen={showAIComparison} onClose={() => setShowAIComparison(false)} />
    </div>
  );
}

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}
