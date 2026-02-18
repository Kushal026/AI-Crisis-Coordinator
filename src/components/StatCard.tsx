import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { clsx } from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "primary" | "success" | "warning" | "danger" | "info";
  sparklineData?: number[];
}

const colorClasses = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.4)]",
    gradient: "from-primary/30 via-primary/10 to-transparent",
    border: "border-primary/30",
    accent: "#8b5cf6",
  },
  success: {
    bg: "bg-green-500/10",
    text: "text-green-500",
    glow: "shadow-[0_0_30px_rgba(34,197,94,0.4)]",
    gradient: "from-green-500/30 via-green-500/10 to-transparent",
    border: "border-green-500/30",
    accent: "#22c55e",
  },
  warning: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.4)]",
    gradient: "from-amber-500/30 via-amber-500/10 to-transparent",
    border: "border-amber-500/30",
    accent: "#f59e0b",
  },
  danger: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    glow: "shadow-[0_0_30px_rgba(239,68,68,0.4)]",
    gradient: "from-red-500/30 via-red-500/10 to-transparent",
    border: "border-red-500/30",
    accent: "#ef4444",
  },
  info: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    glow: "shadow-[0_0_30px_rgba(6,182,212,0.4)]",
    gradient: "from-cyan-500/30 via-cyan-500/10 to-transparent",
    border: "border-cyan-500/30",
    accent: "#06b6d4",
  },
};

// Enhanced sparkline component with gradient fill
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 80;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id={`glow-${color.replace('#', '')}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#glow-${color.replace('#', '')})`}
        className="drop-shadow-lg"
      />
    </svg>
  );
}

// Enhanced animated counter with easing
function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const startValue = 0;
    const endValue = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.]/g, ""));
    
    if (isNaN(endValue)) {
      setCount(0);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startValue + (endValue - startValue) * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{count}</span>;
}

export default function StatCard({ 
  title, 
  value, 
  trend, 
  trendLabel, 
  icon: Icon, 
  color = "primary",
  sparklineData 
}: StatCardProps) {
  const colors = colorClasses[color];
  const isPositive = trend && trend > 0;
  const isNegative = trend && trend < 0;

  return (
    <div className="relative group">
      {/* Ambient glow on hover */}
      <div className={clsx(
        "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 blur-2xl",
        colors.gradient
      )} />
      
      {/* Main card with glass effect */}
      <div className={clsx(
        "relative bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent backdrop-blur-2xl border rounded-2xl p-5 transition-all duration-500 hover:scale-[1.02]",
        colors.border,
        "hover:shadow-xl hover:shadow-black/20"
      )}>
        {/* Subtle top gradient line */}
        <div className={clsx(
          "absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-50",
          colors.text
        )} />
        
        <div className="flex items-start justify-between mb-4">
          {/* Icon with glow effect */}
          <div className={clsx(
            "relative p-3 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all",
            colors.text,
            "group-hover:shadow-lg"
          )}>
            <div className={clsx(
              "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg",
              colors.bg
            )} />
            <Icon className="h-5 w-5 relative z-10" />
          </div>
          
          {/* Sparkline */}
          {sparklineData && (
            <Sparkline data={sparklineData} color={colors.accent} />
          )}
        </div>

        {/* Title */}
        <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">{title}</p>

        {/* Value with enhanced typography */}
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold text-white tracking-tight">
            {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
          </span>
        </div>

        {/* Trend with enhanced styling */}
        {trend !== undefined && (
          <div className="flex items-center gap-2 mt-3">
            <div className={clsx(
              "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold",
              isPositive ? "bg-green-500/10 text-green-400" : isNegative ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/40"
            )}>
              {isPositive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : isNegative ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              <span>{isPositive ? "+" : ""}{trend}%</span>
            </div>
            {trendLabel && (
              <span className="text-xs text-white/30">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
