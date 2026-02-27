/*
 * Developer Page — Hidden admin panel for Gemini API key management
 * Accessible only via direct link: /developer
 * Not listed in navigation or sitemap
 * Design: "Ethereal Care" — matches the existing dark theme
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  RefreshCw,
  Activity,
  Zap,
  BarChart3,
  Trash2,
  Copy,
  Shield,
  Clock,
  Cpu,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const api = axios.create({ baseURL: `${API_BASE_URL}/api`, timeout: 30000 });

interface ApiKeyInfo {
  configured: boolean;
  maskedKey: string;
  keyLength?: number;
  message: string;
}

interface TestResult {
  live: boolean;
  message?: string;
  error?: string;
  errorCode?: string;
  testResponse?: string;
  tokenInfo?: { promptTokens: number; completionTokens: number; totalTokens: number };
  testedModel?: string;
  testedAt?: string;
}

interface TokenUsageData {
  summary: {
    totalRequests: number;
    totalPromptTokens: number;
    totalCompletionTokens: number;
    totalTokensUsed: number;
    trackingSince: string | null;
  };
  modelBreakdown: Record<
    string,
    { requests: number; promptTokens: number; completionTokens: number; totalTokens: number }
  >;
  recentRequests: Array<{
    timestamp: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    endpoint: string;
  }>;
}

export default function Developer() {
  const [apiKeyInfo, setApiKeyInfo] = useState<ApiKeyInfo | null>(null);
  const [newApiKey, setNewApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageData | null>(null);
  const [loading, setLoading] = useState({ key: false, test: false, update: false, usage: false, reset: false });
  const [updateSuccess, setUpdateSuccess] = useState<boolean | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch current API key info
  const fetchApiKey = useCallback(async () => {
    setLoading((l) => ({ ...l, key: true }));
    try {
      const res = await api.get("/developer/api-key");
      setApiKeyInfo(res.data);
    } catch (err) {
      console.error("Failed to fetch API key info:", err);
    } finally {
      setLoading((l) => ({ ...l, key: false }));
    }
  }, []);

  // Test API key
  const testApiKey = useCallback(async () => {
    setLoading((l) => ({ ...l, test: true }));
    setTestResult(null);
    try {
      const res = await api.get("/developer/api-key/test");
      setTestResult(res.data);
    } catch (err) {
      setTestResult({ live: false, error: "Failed to connect to server." });
    } finally {
      setLoading((l) => ({ ...l, test: false }));
    }
  }, []);

  // Update API key
  const updateApiKey = useCallback(async () => {
    if (!newApiKey.trim()) return;
    setLoading((l) => ({ ...l, update: true }));
    setUpdateSuccess(null);
    try {
      const res = await api.post("/developer/api-key", { apiKey: newApiKey.trim() });
      if (res.data.success) {
        setUpdateSuccess(true);
        setNewApiKey("");
        fetchApiKey();
        setTestResult(null);
      } else {
        setUpdateSuccess(false);
      }
    } catch (err) {
      setUpdateSuccess(false);
    } finally {
      setLoading((l) => ({ ...l, update: false }));
      setTimeout(() => setUpdateSuccess(null), 4000);
    }
  }, [newApiKey, fetchApiKey]);

  // Fetch token usage
  const fetchTokenUsage = useCallback(async () => {
    setLoading((l) => ({ ...l, usage: true }));
    try {
      const res = await api.get("/developer/token-usage");
      setTokenUsage(res.data);
    } catch (err) {
      console.error("Failed to fetch token usage:", err);
    } finally {
      setLoading((l) => ({ ...l, usage: false }));
    }
  }, []);

  // Reset token usage
  const resetTokenUsage = useCallback(async () => {
    setLoading((l) => ({ ...l, reset: true }));
    try {
      await api.post("/developer/token-usage/reset");
      fetchTokenUsage();
    } catch (err) {
      console.error("Failed to reset token usage:", err);
    } finally {
      setLoading((l) => ({ ...l, reset: false }));
    }
  }, [fetchTokenUsage]);

  // Copy masked key
  const copyMaskedKey = useCallback(() => {
    if (apiKeyInfo?.maskedKey) {
      navigator.clipboard.writeText(apiKeyInfo.maskedKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [apiKeyInfo]);

  useEffect(() => {
    fetchApiKey();
    fetchTokenUsage();
  }, [fetchApiKey, fetchTokenUsage]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">Developer Access Only</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-2">
            Developer <span className="text-gradient-cyan">Console</span>
          </h1>
          <p className="text-slate-400 max-w-xl">
            Manage your Gemini API key, test connectivity, and monitor token usage. This page is hidden and accessible only by direct link.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {/* ── API Key Management Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-semibold text-white">Gemini API Key</h2>
                <p className="text-xs text-slate-400">Manage your Google Gemini API key</p>
              </div>
            </div>

            {/* Current Key Status */}
            <div className="mb-6 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Current Key Status</span>
                {loading.key ? (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                ) : apiKeyInfo?.configured ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                    <XCircle className="w-3 h-3" /> Not Configured
                  </span>
                )}
              </div>
              {apiKeyInfo?.maskedKey && (
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] text-sm font-mono text-slate-300 border border-white/[0.06] overflow-hidden text-ellipsis">
                    {showKey ? apiKeyInfo.maskedKey : "•".repeat(30)}
                  </code>
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                    title={showKey ? "Hide key" : "Show masked key"}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={copyMaskedKey}
                    className="p-2 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                    title="Copy masked key"
                  >
                    {copySuccess ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Update Key Form */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Enter New API Key
              </label>
              <div className="flex gap-3">
                <input
                  type="password"
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-slate-500 text-sm font-mono focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={updateApiKey}
                  disabled={loading.update || !newApiKey.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading.update ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  {loading.update ? "Saving..." : "Save Key"}
                </motion.button>
              </div>

              <AnimatePresence>
                {updateSuccess === true && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 text-emerald-400 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    API key updated successfully! It's active immediately.
                  </motion.div>
                )}
                {updateSuccess === false && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 flex items-center gap-2 text-red-400 text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Failed to update API key. Please try again.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* ── API Key Liveness Test Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-white">Liveness Check</h2>
                  <p className="text-xs text-slate-400">Test if the Gemini API key is working</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={testApiKey}
                disabled={loading.test}
                className="px-5 py-2.5 rounded-xl bg-white/[0.06] text-slate-300 font-medium text-sm border border-white/10 hover:bg-white/[0.1] hover:text-white transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading.test ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {loading.test ? "Testing..." : "Run Test"}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {loading.test && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center gap-3"
                >
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  <span className="text-slate-400 text-sm">Sending test request to Gemini API...</span>
                </motion.div>
              )}

              {!loading.test && testResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-5 rounded-xl border ${
                    testResult.live
                      ? "bg-emerald-500/[0.05] border-emerald-500/20"
                      : "bg-red-500/[0.05] border-red-500/20"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {testResult.live ? (
                      <CheckCircle className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                    <span className={`font-heading text-lg font-semibold ${testResult.live ? "text-emerald-300" : "text-red-300"}`}>
                      {testResult.live ? "API Key is Live!" : "API Key Test Failed"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-3">
                    {testResult.message || testResult.error}
                  </p>
                  {testResult.live && testResult.tokenInfo && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="p-3 rounded-lg bg-white/[0.03]">
                        <p className="text-xs text-slate-500 mb-1">Prompt Tokens</p>
                        <p className="text-lg font-mono font-semibold text-cyan-300">{testResult.tokenInfo.promptTokens}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.03]">
                        <p className="text-xs text-slate-500 mb-1">Completion Tokens</p>
                        <p className="text-lg font-mono font-semibold text-cyan-300">{testResult.tokenInfo.completionTokens}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.03]">
                        <p className="text-xs text-slate-500 mb-1">Total Tokens</p>
                        <p className="text-lg font-mono font-semibold text-cyan-300">{testResult.tokenInfo.totalTokens}</p>
                      </div>
                    </div>
                  )}
                  {testResult.testedModel && (
                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Model: {testResult.testedModel}</span>
                      {testResult.testedAt && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(testResult.testedAt).toLocaleString()}</span>
                      )}
                    </div>
                  )}
                  {testResult.errorCode && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      Error Code: {testResult.errorCode}
                    </div>
                  )}
                </motion.div>
              )}

              {!loading.test && !testResult && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
                >
                  <Zap className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Click "Run Test" to check if your API key is working.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ── Token Usage Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-white">Token Usage</h2>
                  <p className="text-xs text-slate-400">Monitor API token consumption</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchTokenUsage}
                  disabled={loading.usage}
                  className="p-2.5 rounded-xl bg-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.1] transition-all disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading.usage ? "animate-spin" : ""}`} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetTokenUsage}
                  disabled={loading.reset}
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  title="Reset counters"
                >
                  <Trash2 className={`w-4 h-4 ${loading.reset ? "animate-spin" : ""}`} />
                </motion.button>
              </div>
            </div>

            {/* Summary Stats */}
            {tokenUsage && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-xs text-slate-500 mb-1">Total Requests</p>
                    <p className="text-2xl font-heading font-bold text-white">{tokenUsage.summary.totalRequests.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-xs text-slate-500 mb-1">Prompt Tokens</p>
                    <p className="text-2xl font-heading font-bold text-cyan-300">{tokenUsage.summary.totalPromptTokens.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-xs text-slate-500 mb-1">Completion Tokens</p>
                    <p className="text-2xl font-heading font-bold text-purple-300">{tokenUsage.summary.totalCompletionTokens.toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-xs text-slate-500 mb-1">Total Tokens</p>
                    <p className="text-2xl font-heading font-bold text-gradient-cyan">{tokenUsage.summary.totalTokensUsed.toLocaleString()}</p>
                  </div>
                </div>

                {/* Model Breakdown */}
                {Object.keys(tokenUsage.modelBreakdown).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Usage by Model</h3>
                    <div className="space-y-2">
                      {Object.entries(tokenUsage.modelBreakdown).map(([model, data]) => (
                        <div
                          key={model}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/[0.04]"
                        >
                          <div className="flex items-center gap-3">
                            <Cpu className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm font-mono text-slate-300">{model}</span>
                          </div>
                          <div className="flex items-center gap-6 text-xs text-slate-400">
                            <span>{data.requests} req</span>
                            <span>{data.totalTokens.toLocaleString()} tokens</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Requests */}
                {tokenUsage.recentRequests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-3">Recent Requests</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-slate-500 border-b border-white/[0.06]">
                            <th className="pb-2 pr-4">Time</th>
                            <th className="pb-2 pr-4">Model</th>
                            <th className="pb-2 pr-4">Endpoint</th>
                            <th className="pb-2 pr-4 text-right">Prompt</th>
                            <th className="pb-2 pr-4 text-right">Completion</th>
                            <th className="pb-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-400">
                          {tokenUsage.recentRequests.map((req, i) => (
                            <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                              <td className="py-2 pr-4 text-xs font-mono">
                                {new Date(req.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="py-2 pr-4 text-xs font-mono text-cyan-400">{req.model}</td>
                              <td className="py-2 pr-4 text-xs font-mono">{req.endpoint}</td>
                              <td className="py-2 pr-4 text-right font-mono">{req.promptTokens}</td>
                              <td className="py-2 pr-4 text-right font-mono">{req.completionTokens}</td>
                              <td className="py-2 text-right font-mono text-white">{req.totalTokens}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {tokenUsage.recentRequests.length === 0 && (
                  <div className="p-6 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                    <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No token usage recorded yet. Usage will appear here after AI search requests.</p>
                  </div>
                )}

                {tokenUsage.summary.trackingSince && (
                  <p className="mt-4 text-xs text-slate-600 text-center">
                    Tracking since {new Date(tokenUsage.summary.trackingSince).toLocaleString()}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
