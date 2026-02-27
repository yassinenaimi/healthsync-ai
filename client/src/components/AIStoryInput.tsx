/*
 * AIStoryInput — Text input area for the user's health story
 * Includes example prompts and AI search trigger
 * Design: "Ethereal Care" — glassmorphism, ambient glow
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Search, Loader2, Sparkles, RotateCcw } from "lucide-react";

interface AIStoryInputProps {
  onSearch: (story: string) => void;
  isLoading: boolean;
  hasResults: boolean;
  onReset: () => void;
}

const exampleStories = [
  "I need a plan for a family of 4 in Ontario. My son needs asthma meds and my daughter needs braces. We also want good vision coverage.",
  "Single person in BC, looking for comprehensive dental and vision coverage. I also need massage therapy for chronic back pain.",
  "Couple in Quebec, we need good drug coverage and physiotherapy. Budget around $200/month.",
  "I have a kid with cancer, I need back massages, my eyes hurt, and I need dental work.",
  "Best rated family plan with orthodontic coverage and mental health support.",
  "I'm a senior, 65 years old, need prescription drug coverage and regular chiropractic visits. Living in Alberta.",
];

export default function AIStoryInput({ onSearch, isLoading, hasResults, onReset }: AIStoryInputProps) {
  const [story, setStory] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSearch = () => {
    if (story.trim().length >= 10 && !isLoading) {
      onSearch(story.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setStory(example);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-panel-strong p-5"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <h2 className="font-heading text-sm font-semibold text-white">Plain English Discovery</h2>
          <p className="text-[10px] text-slate-500">Powered by Gemini AI with Google Search</p>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3">
        Describe your situation and we'll find the right plans for you.
      </p>

      {/* Textarea */}
      <div className="relative mb-3">
        <textarea
          ref={textareaRef}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., I need a plan for a family of 4. My son needs asthma meds..."
          rows={4}
          maxLength={2000}
          disabled={isLoading}
          className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all resize-none disabled:opacity-50"
        />
        <button
          onClick={handleSearch}
          disabled={story.trim().length < 10 || isLoading}
          className="absolute right-3 bottom-3 w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Character count */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-slate-500">
          {story.length}/2000 characters
        </span>
        {hasResults && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            New search
          </button>
        )}
      </div>

      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="glass-panel p-3 flex items-center gap-3">
              <div className="relative">
                <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                <div className="absolute inset-0 w-5 h-5 rounded-full bg-cyan-400/20 animate-ping" />
              </div>
              <div>
                <p className="text-xs text-white font-medium">Searching real insurance providers...</p>
                <p className="text-[10px] text-slate-400">Using Google Search to find verified policies</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Example stories */}
      {!hasResults && (
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Try an example:
          </p>
          <div className="space-y-1.5">
            {exampleStories.map((example, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="w-full text-left px-3 py-2 rounded-lg text-[11px] text-slate-400 bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:text-slate-300 hover:border-cyan-500/20 transition-all duration-200 line-clamp-2 disabled:opacity-50"
              >
                "{example.substring(0, 80)}..."
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Search button (full-width) */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSearch}
        disabled={story.trim().length < 10 || isLoading}
        className="w-full mt-3 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing your story...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            AI Search
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
