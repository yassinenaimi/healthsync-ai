/*
 * About — Company information page
 * Design: "Ethereal Care" — consistent with the rest of the app
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Users, Target, Heart, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const values = [
  {
    icon: Shield,
    title: "Transparency",
    description: "We believe Canadians deserve clear, honest information about their insurance options without hidden agendas or sales pressure.",
  },
  {
    icon: Users,
    title: "Accessibility",
    description: "Insurance shouldn't require a degree to understand. We translate complex policy details into plain language everyone can follow.",
  },
  {
    icon: Target,
    title: "Accuracy",
    description: "Our comparison engine uses real plan data from major Canadian providers, ensuring you see accurate coverage details and pricing.",
  },
  {
    icon: Heart,
    title: "Independence",
    description: "We are not affiliated with any insurance carrier. Our recommendations are based solely on your needs, not commissions.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-4">
              About HealthSync
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              We are building a smarter way for Canadians to compare and choose health insurance.
              No sales calls, no bias — just clear data and honest comparisons.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel-strong p-8 sm:p-12 mb-16 text-center"
          >
            <h2 className="font-heading text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Navigating Canadian health insurance can be overwhelming. With dozens of providers, hundreds of plans,
              and complex coverage details, finding the right fit often feels impossible. HealthSync was created to
              change that. We aggregate plan data from Canada's leading insurance providers and present it in a
              clear, comparable format so you can make informed decisions with confidence.
            </p>
          </motion.div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="font-heading text-2xl font-bold text-white text-center mb-10">What We Stand For</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel p-6"
                  >
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-white mb-2">{value.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel p-8 mb-16"
          >
            <h2 className="font-heading text-2xl font-bold text-white mb-6">How Our Engine Works</h2>
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                HealthSync uses a deterministic, rule-based comparison engine — not AI predictions or machine learning.
                When you enter your details (age, province, smoking status, budget), our system queries a database of
                real insurance plans from providers like Blue Cross, Manulife, Sun Life, Canada Life, and more.
              </p>
              <p>
                Each plan's pricing is calculated using the provider's actual pricing modifiers: age-based adjustments,
                smoker surcharges, and optional add-on costs. The result is an accurate monthly premium tailored to
                your specific profile.
              </p>
              <p>
                Plans are then filtered by province availability, coverage type, and budget range, and sorted to help
                you find the best value. You can compare up to three plans side-by-side and simulate real-world
                health events to see your true annual costs.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/discover">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25"
              >
                Start Comparing Plans
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Shield className="w-3 h-3 text-white" />
            </div>
            <span className="font-heading font-semibold text-white text-sm">HealthSync</span>
          </div>
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} HealthSync. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
