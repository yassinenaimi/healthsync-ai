/*
 * BodyMap — Interactive SVG human body diagram
 * Hovering body parts highlights corresponding coverage types
 * Design: "Ethereal Care" — glowing regions, ambient light
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Smile, Pill, Hand } from "lucide-react";
import type { CoverageCategory } from "@/lib/data";

interface BodyMapProps {
  onSelectCoverage: (category: CoverageCategory) => void;
  selectedCategories: CoverageCategory[];
}

interface BodyRegion {
  id: CoverageCategory;
  label: string;
  icon: React.ReactNode;
  description: string;
  path: string;
  labelPos: { x: number; y: number };
}

const bodyRegions: BodyRegion[] = [
  {
    id: "vision",
    label: "Vision Care",
    icon: <Eye className="w-4 h-4" />,
    description: "Eye exams, glasses, contacts",
    path: "M 140,55 C 140,45 160,45 160,55 C 160,65 140,65 140,55 Z M 170,55 C 170,45 190,45 190,55 C 190,65 170,65 170,55 Z",
    labelPos: { x: 240, y: 55 },
  },
  {
    id: "dental",
    label: "Dental Care",
    icon: <Smile className="w-4 h-4" />,
    description: "Cleanings, fillings, orthodontics",
    path: "M 145,80 Q 165,95 185,80 Q 185,90 165,95 Q 145,90 145,80 Z",
    labelPos: { x: 240, y: 85 },
  },
  {
    id: "drugs",
    label: "Prescription Drugs",
    icon: <Pill className="w-4 h-4" />,
    description: "Medications, pharmacy coverage",
    path: "M 130,120 L 200,120 L 210,200 Q 210,220 195,220 L 135,220 Q 120,220 120,200 Z",
    labelPos: { x: 240, y: 170 },
  },
  {
    id: "massage",
    label: "Massage Therapy",
    icon: <Hand className="w-4 h-4" />,
    description: "RMT, deep tissue, relaxation",
    path: "M 100,130 L 130,120 L 120,200 L 80,180 Z M 200,120 L 230,130 L 250,180 L 210,200 Z",
    labelPos: { x: 20, y: 155 },
  },
  {
    id: "chiropractic",
    label: "Chiropractic",
    icon: <Hand className="w-4 h-4" />,
    description: "Spinal adjustments, alignment",
    path: "M 158,120 L 172,120 L 175,220 L 155,220 Z",
    labelPos: { x: 240, y: 220 },
  },
  {
    id: "physiotherapy",
    label: "Physiotherapy",
    icon: <Hand className="w-4 h-4" />,
    description: "Rehab, injury recovery",
    path: "M 135,225 L 155,225 L 150,330 L 130,330 Z M 175,225 L 195,225 L 200,330 L 180,330 Z",
    labelPos: { x: 240, y: 280 },
  },
];

export default function BodyMap({ onSelectCoverage, selectedCategories }: BodyMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<CoverageCategory | null>(null);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 330 360" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Background glow */}
        <defs>
          <radialGradient id="bodyGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="rgba(6,182,212,0.08)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0)" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ellipse cx="165" cy="180" rx="120" ry="170" fill="url(#bodyGlow)" />

        {/* Body outline */}
        <path
          d="M 165,20 C 140,20 125,35 125,55 C 125,75 135,90 145,95 L 130,120 L 100,130 L 75,180 L 85,185 L 120,200 L 120,220 L 135,225 L 130,330 L 150,335 L 155,225 L 165,225 L 175,225 L 180,335 L 200,330 L 195,225 L 210,220 L 210,200 L 245,185 L 255,180 L 230,130 L 200,120 L 185,95 C 195,90 205,75 205,55 C 205,35 190,20 165,20 Z"
          fill="none"
          stroke="rgba(148,163,184,0.2)"
          strokeWidth="1.5"
        />

        {/* Interactive regions */}
        {bodyRegions.map((region) => {
          const isHovered = hoveredRegion === region.id;
          const isSelected = selectedCategories.includes(region.id);
          return (
            <g key={region.id}>
              <path
                d={region.path}
                fill={isHovered || isSelected ? "rgba(6,182,212,0.25)" : "rgba(6,182,212,0.05)"}
                stroke={isHovered || isSelected ? "rgba(6,182,212,0.6)" : "rgba(6,182,212,0.15)"}
                strokeWidth={isHovered || isSelected ? 2 : 1}
                filter={isHovered ? "url(#glow)" : undefined}
                className="cursor-pointer transition-all duration-300"
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => onSelectCoverage(region.id)}
              />
              {/* Connection line */}
              {(isHovered || isSelected) && (
                <line
                  x1={region.labelPos.x < 165 ? 100 : 220}
                  y1={region.labelPos.y}
                  x2={region.labelPos.x}
                  y2={region.labelPos.y}
                  stroke="rgba(6,182,212,0.3)"
                  strokeWidth="1"
                  strokeDasharray="4 2"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating labels */}
      <AnimatePresence>
        {bodyRegions.map((region) => {
          const isVisible = hoveredRegion === region.id || selectedCategories.includes(region.id);
          if (!isVisible) return null;
          const isLeft = region.labelPos.x < 165;
          return (
            <motion.div
              key={region.id}
              initial={{ opacity: 0, x: isLeft ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLeft ? 10 : -10 }}
              className="absolute glass-panel px-3 py-2 pointer-events-none"
              style={{
                left: `${(region.labelPos.x / 330) * 100}%`,
                top: `${(region.labelPos.y / 360) * 100}%`,
                transform: isLeft ? "translateX(-100%) translateY(-50%)" : "translateY(-50%)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">{region.icon}</span>
                <div>
                  <p className="text-xs font-medium text-white whitespace-nowrap">{region.label}</p>
                  <p className="text-[10px] text-slate-400 whitespace-nowrap">{region.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
