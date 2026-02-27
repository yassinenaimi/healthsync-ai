/*
 * Simulator — True Cost Simulator page
 * Interactive 12-month cost projections with simulated healthcare events
 * Design: "Ethereal Care" — glassmorphism, dark charts, ambient glow
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Plus, X, Zap, DollarSign, TrendingUp, Search, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import TrueCostChart from "@/components/TrueCostChart";
import { useInsuranceEngine, type TrueCostEvent } from "@/hooks/useInsuranceEngine";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { nanoid } from "nanoid";

const SIMULATOR_BG = "https://private-us-east-1.manuscdn.com/sessionFile/tFFY3yQ8e2XOUcC7AqQ3uG/sandbox/TUWdYnMhGrYnSlTBBMegGY-img-3_1771912456000_na1fn_Y29zdC1zaW11bGF0b3ItYmc.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdEZGWTN5UThlMlhPVWNDN0FxUTN1Ry9zYW5kYm94L1RVV2RZbk1oR3JZblNsVEJCTWVnR1ktaW1nLTNfMTc3MTkxMjQ1NjAwMF9uYTFmbl9ZMjl6ZEMxemFXMTFiR0YwYjNJdFltYy5qcGc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NOD28DlmsFWL~Abw055GAN~Sn6d5f-ytQy0QcIp71Z5lIM-Gfs0NYTV3isgQJGum6fnHEu5eimpXS75tUSycNrGuUD2Fn7TYzJ7~uFjRydtfM2c6zRRuxUa4sFwMvne4vUhPWrFvvE~bJKTAtX83uivUzgfD~Eq9E0jUw2u5ZaabG~oSwByU0Lfu64KX3TGep00PeZ70nHSjtdXo7hzd~B5TetWEJaK9JP5rt1KRDYhNbMMLj111d0zRD7CSt0MFKVyDVAADvjJ1HkOaBigEovzjAOmwDzTl4AKAXjLaU-TUJpiOfzWhHeayo2ybbnfV~L-gO6Kjy~xu9Ny4Te3tIQ__";

const presetEvents: Omit<TrueCostEvent, "id">[] = [
  { month: 3, description: "Dental cleaning", amount: 250, category: "dental" },
  { month: 6, description: "$2,000 dental emergency", amount: 2000, category: "dental" },
  { month: 2, description: "New glasses", amount: 400, category: "vision" },
  { month: 4, description: "Monthly prescriptions", amount: 150, category: "drugs" },
  { month: 8, description: "Monthly prescriptions", amount: 150, category: "drugs" },
  { month: 5, description: "Massage therapy (5 sessions)", amount: 500, category: "paramedical" },
  { month: 9, description: "Physiotherapy (10 sessions)", amount: 800, category: "paramedical" },
  { month: 1, description: "Asthma medication", amount: 300, category: "drugs" },
  { month: 7, description: "Root canal", amount: 1500, category: "dental" },
  { month: 11, description: "Eye exam + contacts", amount: 350, category: "vision" },
];

export default function Simulator() {
  const { allPlans, calculateTrueCost, loading } = useInsuranceEngine();
  const [selectedPlanIds, setSelectedPlanIds] = useState<number[]>([]);
  const [events, setEvents] = useState<TrueCostEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Custom event form
  const [newEventMonth, setNewEventMonth] = useState("1");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventAmount, setNewEventAmount] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<TrueCostEvent["category"]>("dental");

  const selectedPlans = useMemo(() => {
    return selectedPlanIds.map((id) => allPlans.find((p) => p.id === id)!).filter(Boolean);
  }, [selectedPlanIds, allPlans]);

  const availablePlans = useMemo(() => {
    let plans = allPlans.filter((p) => !selectedPlanIds.includes(p.id));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      plans = plans.filter(
        (p) => p.provider.toLowerCase().includes(q) || p.plan_name.toLowerCase().includes(q)
      );
    }
    return plans;
  }, [selectedPlanIds, searchTerm, allPlans]);

  const addPlan = (id: number) => {
    if (selectedPlanIds.length >= 5) return;
    setSelectedPlanIds((prev) => [...prev, id]);
  };

  const removePlan = (id: number) => {
    setSelectedPlanIds((prev) => prev.filter((x) => x !== id));
  };

  const addPresetEvent = (preset: Omit<TrueCostEvent, "id">) => {
    setEvents((prev) => [...prev, { ...preset, id: nanoid() }]);
  };

  const addCustomEvent = () => {
    if (!newEventDesc || !newEventAmount) return;
    setEvents((prev) => [
      ...prev,
      {
        id: nanoid(),
        month: parseInt(newEventMonth),
        description: newEventDesc,
        amount: parseFloat(newEventAmount),
        category: newEventCategory,
      },
    ]);
    setNewEventDesc("");
    setNewEventAmount("");
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    if (selectedPlans.length === 0) return [];
    return selectedPlans.map((plan) => {
      const costs = calculateTrueCost(plan, events);
      const totalCost = costs[costs.length - 1]?.cumulative || 0;
      return {
        plan,
        totalCost,
        monthlyAvg: Math.round(totalCost / 12),
      };
    });
  }, [selectedPlans, events, calculateTrueCost]);

  const cheapestPlan = useMemo(() => {
    if (summaryStats.length === 0) return null;
    return summaryStats.reduce((min, s) => (s.totalCost < min.totalCost ? s : min), summaryStats[0]);
  }, [summaryStats]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <img src={SIMULATOR_BG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-medium text-amber-300">True Cost Simulator</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">
              See Your Real Costs
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-sm">
              Add healthcare events throughout the year and see how different plans handle the costs.
              Formula: (Premium x 12) + (Claims x (1 - Coverage%)) + Deductibles
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
          <div className="grid lg:grid-cols-[380px_1fr] gap-6">
            {/* Left — Controls */}
            <div className="space-y-4">
              {/* Plan selector */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-panel-strong p-5">
                <h3 className="font-heading text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Select Plans to Compare
                </h3>

                {/* Selected */}
                <div className="space-y-2 mb-3">
                  {selectedPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.05] border border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded flex items-center justify-center overflow-hidden border border-white/10" style={{ backgroundColor: plan.provider_logo_color + "20" }}>
                          {plan.provider_logo_url ? (
                            <img src={plan.provider_logo_url} alt={plan.provider} className="w-4 h-4 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling && ((e.target as HTMLImageElement).parentElement!.innerHTML = `<span class='text-[10px] font-bold' style='color:${plan.provider_logo_color}'>${plan.provider.charAt(0)}</span>`); }} />
                          ) : (
                            <span className="text-[10px] font-bold" style={{ color: plan.provider_logo_color }}>{plan.provider.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-xs text-white truncate">{plan.plan_name}</span>
                      </div>
                      <button onClick={() => removePlan(plan.id)} className="p-1 text-slate-400 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {selectedPlanIds.length < 5 && (
                  <>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search plans..."
                        className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/30"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-auto space-y-1">
                      {availablePlans.slice(0, 10).map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => addPlan(plan.id)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg text-left hover:bg-white/[0.05] transition-colors"
                        >
                          <Plus className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                          <span className="text-xs text-slate-300 truncate">{plan.provider} — {plan.plan_name}</span>
                          <span className="text-[10px] font-mono text-slate-500 ml-auto">${plan.monthly_premium}/mo</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>

              {/* Healthcare Events */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel-strong p-5">
                <h3 className="font-heading text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Healthcare Events
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">
                  Add simulated events to see how plans handle unexpected costs.
                </p>

                {/* Active events */}
                <div className="space-y-1.5 mb-3">
                  <AnimatePresence>
                    {events.map((event) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-amber-500/5 border border-amber-500/15"
                      >
                        <div>
                          <p className="text-xs text-white">{event.description}</p>
                          <p className="text-[10px] text-slate-400">Month {event.month} · ${event.amount.toLocaleString()}</p>
                        </div>
                        <button onClick={() => removeEvent(event.id)} className="p-1 text-slate-400 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Preset events */}
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Quick Add:</p>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {presetEvents.slice(0, 6).map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => addPresetEvent(preset)}
                      className="p-2 rounded-lg text-left bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-amber-500/20 transition-all"
                    >
                      <p className="text-[10px] text-white truncate">{preset.description}</p>
                      <p className="text-[9px] text-slate-500">Mo. {preset.month} · ${preset.amount}</p>
                    </button>
                  ))}
                </div>

                {/* Custom event form */}
                <div className="border-t border-white/10 pt-3 space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Custom Event:</p>
                  <input
                    type="text"
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                    placeholder="Description"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/30"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={newEventMonth} onValueChange={setNewEventMonth}>
                      <SelectTrigger className="bg-white/[0.05] border-white/10 text-xs text-white h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>Mo. {i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="number"
                      value={newEventAmount}
                      onChange={(e) => setNewEventAmount(e.target.value)}
                      placeholder="$"
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500/30"
                    />
                    <Select value={newEventCategory} onValueChange={(v) => setNewEventCategory(v as TrueCostEvent["category"])}>
                      <SelectTrigger className="bg-white/[0.05] border-white/10 text-xs text-white h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem value="dental">Dental</SelectItem>
                        <SelectItem value="drugs">Drugs</SelectItem>
                        <SelectItem value="vision">Vision</SelectItem>
                        <SelectItem value="paramedical">Paramedical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    onClick={addCustomEvent}
                    disabled={!newEventDesc || !newEventAmount}
                    className="w-full py-2 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/20 hover:bg-amber-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    Add Event
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right — Chart & Summary */}
            <div className="space-y-6">
              <TrueCostChart
                plans={selectedPlans}
                events={events}
                calculateTrueCost={calculateTrueCost}
              />

              {/* Summary cards */}
              {summaryStats.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summaryStats.map((stat) => (
                    <motion.div
                      key={stat.plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`glass-panel p-4 ${
                        cheapestPlan?.plan.id === stat.plan.id ? "border-cyan-500/40 glow-cyan" : ""
                      }`}
                    >
                      {cheapestPlan?.plan.id === stat.plan.id && (
                        <div className="flex items-center gap-1 mb-2">
                          <DollarSign className="w-3 h-3 text-cyan-400" />
                          <span className="text-[10px] font-medium text-cyan-300 uppercase tracking-wider">Best Value</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: stat.plan.provider_logo_color + "99" }}
                        >
                          {stat.plan.provider.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">{stat.plan.provider}</p>
                          <p className="text-sm font-medium text-white">{stat.plan.plan_name}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">Total Annual Cost</span>
                          <span className="text-sm font-mono font-semibold text-white">${stat.totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">Monthly Average</span>
                          <span className="text-xs font-mono text-slate-300">${stat.monthlyAvg}/mo</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-400">Premium Only</span>
                          <span className="text-xs font-mono text-slate-300">${stat.plan.annual_premium}/yr</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Formula explanation */}
              <div className="glass-panel p-5">
                <h3 className="font-heading text-sm font-semibold text-white mb-2">How We Calculate True Cost</h3>
                <div className="font-mono text-xs text-cyan-300 bg-cyan-500/5 p-3 rounded-lg border border-cyan-500/10 mb-3">
                  True Cost = (Monthly Premium x 12) + (Claims x (1 - Coverage%)) + Deductible
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The True Cost Simulator goes beyond just comparing premiums. It factors in your expected healthcare usage,
                  coverage percentages, annual caps, and deductibles to show you what you'll actually spend over 12 months.
                  Add healthcare events like dental emergencies, prescription refills, or physiotherapy sessions to see how
                  each plan handles your specific needs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
