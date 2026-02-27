/*
 * Home — Landing page with Apple-style minimalist aesthetic
 * "Insurance that speaks your language"
 * Design: "Ethereal Care" — deep navy, glassmorphism, ambient glow
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, MessageSquare, BarChart3, Calculator, Shield, Sparkles, Users, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

const HERO_BG = "https://private-us-east-1.manuscdn.com/sessionFile/tFFY3yQ8e2XOUcC7AqQ3uG/sandbox/TUWdYnMhGrYnSlTBBMegGY-img-1_1771912470000_na1fn_aGVyby1iZw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdEZGWTN5UThlMlhPVWNDN0FxUTN1Ry9zYW5kYm94L1RVV2RZbk1oR3JZblNsVEJCTWVnR1ktaW1nLTFfMTc3MTkxMjQ3MDAwMF9uYTFmbl9hR1Z5YnkxaVp3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=D9U9rqSFLAgLBnUQFXeTV8S3MyIWZqhiW3fGYbjlnZt5VkW1f7nkfmMFSEpZ7UIWxwowupyxYvEEx-hdr-x2p0aU~M2V2vlE8j~xg6XV7Ic4q-ciMJ0YJbHwo~8bn8njl14WCqnS19EBiQqzwCV8zbrE16qY3fORVkPrpKMueX0R62xUS2bcnItHzkpRQFXKdwshqaLJ-yqXtnsXqkuev6BQaBwF~qR4hyUMJnQDF0-B7e3l0yZKJIesyA3zzJfNcgfssfBLVoOtfVSuZsSQRhyIh2jTKAF77FaV9mq9h1I34rIzgDAL~VgwqLfMjSKF1OyI-6GVxVweomfyY8mqOA__";

const features = [
  {
    icon: MessageSquare,
    title: "Plain English Discovery",
    description: "Describe your life situation in your own words. Our engine matches your needs to the right plans.",
    href: "/discover",
  },
  {
    icon: BarChart3,
    title: "Smart Comparison",
    description: "Compare up to 3 plans side-by-side with detailed breakdowns of every coverage category.",
    href: "/compare",
  },
  {
    icon: Calculator,
    title: "True Cost Simulator",
    description: "See your real annual costs with interactive 12-month projections and simulated health events.",
    href: "/simulator",
  },
];

const stats = [
  { value: "20+", label: "Insurance Plans" },
  { value: "10+", label: "Providers" },
  { value: "13", label: "Provinces & Territories" },
  { value: "100%", label: "Free to Use" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-medium text-cyan-300">Smart Health Insurance Comparison</span>
            </div>

            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              <span className="text-white">Insurance that</span>
              <br />
              <span className="text-gradient-cyan">speaks your language</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop filling out forms. Just tell us about your life, and we'll match you with the best
              Canadian health insurance plans for you and your family.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/discover">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  Start Discovering
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              </Link>
              <Link href="/compare">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/[0.06] text-slate-300 font-medium text-sm border border-white/10 hover:bg-white/[0.1] hover:text-white transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  Compare Plans
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-1.5">
              <div className="w-1.5 h-2.5 rounded-full bg-cyan-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-heading text-3xl sm:text-4xl font-bold text-gradient-cyan">{stat.value}</p>
                <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              A smarter way to find coverage
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Three powerful tools designed to help you make confident decisions about your health insurance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <Link href={feature.href}>
                    <div className="glass-panel p-6 h-full group hover:border-cyan-500/30 transition-all duration-300 hover:glow-cyan">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-colors">
                        <Icon className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-white mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                      <div className="mt-4 flex items-center gap-1 text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Try it <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Three simple steps to find your ideal health insurance plan.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: MessageSquare, title: "Tell us your story", desc: "Describe your family, health needs, and budget in plain English. No forms, no jargon." },
              { step: "02", icon: Zap, title: "We find your match", desc: "Our engine filters 20+ plans across major Canadian providers to find your best options." },
              { step: "03", icon: Shield, title: "Compare with confidence", desc: "See true costs, coverage details, and side-by-side comparisons to make an informed choice." },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative"
                >
                  <div className="text-6xl font-heading font-bold text-white/[0.04] absolute -top-4 -left-2">{item.step}</div>
                  <div className="relative pt-8">
                    <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel-strong p-10 sm:p-14"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to find your plan?
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Join thousands of Canadians who found their perfect health insurance match with HealthSync.
            </p>
            <Link href="/discover">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/25"
              >
                <Sparkles className="w-4 h-4" />
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-semibold text-white">HealthSync</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link href="/discover" className="text-slate-400 hover:text-cyan-400 transition-colors">Discover</Link>
              <Link href="/compare" className="text-slate-400 hover:text-cyan-400 transition-colors">Compare</Link>
              <Link href="/simulator" className="text-slate-400 hover:text-cyan-400 transition-colors">Simulator</Link>
              <Link href="/about" className="text-slate-400 hover:text-cyan-400 transition-colors">About</Link>
              <Link href="/contact" className="text-slate-400 hover:text-cyan-400 transition-colors">Contact</Link>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/5">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} HealthSync. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              HealthSync is an independent comparison platform. We are not an insurance provider.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
