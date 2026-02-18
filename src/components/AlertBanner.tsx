import { useState, useEffect } from "react";
import { AlertTriangle, X, Info, CheckCircle, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

type AlertSeverity = "critical" | "warning" | "info" | "success";

interface AlertBannerProps {
  title: string;
  message: string;
  severity?: AlertSeverity;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const severityConfig = {
  critical: {
    bg: "bg-red-500/10",
    border: "border-red-500/40",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    pulse: "animate-pulse",
    gradient: "from-red-500/30 via-red-500/5 to-transparent",
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.3)]",
    accent: "#ef4444",
  },
  warning: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
    icon: AlertCircle,
    iconColor: "text-amber-500",
    pulse: "",
    gradient: "from-amber-500/30 via-amber-500/5 to-transparent",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.3)]",
    accent: "#f59e0b",
  },
  info: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/40",
    icon: Info,
    iconColor: "text-cyan-500",
    pulse: "",
    gradient: "from-cyan-500/30 via-cyan-500/5 to-transparent",
    glow: "shadow-[0_0_40px_rgba(6,182,212,0.3)]",
    accent: "#06b6d4",
  },
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/40",
    icon: CheckCircle,
    iconColor: "text-green-500",
    pulse: "",
    gradient: "from-green-500/30 via-green-500/5 to-transparent",
    glow: "shadow-[0_0_40px_rgba(34,197,94,0.3)]",
    accent: "#22c55e",
  },
};

export default function AlertBanner({ 
  title, 
  message, 
  severity = "warning",
  onDismiss,
  action 
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const config = severityConfig[severity];
  const Icon = config.icon;

  // Trigger entrance animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 400);
  };

  if (!isVisible && !isLeaving) return null;

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl border backdrop-blur-2xl transition-all duration-500",
        config.bg,
        config.border,
        config.glow,
        isLeaving 
          ? "opacity-0 translate-x-[-20px] scale-95" 
          : "opacity-100 translate-x-0 scale-100"
      )}
    >
      {/* Animated background gradient */}
      <div className={clsx(
        "absolute inset-0 bg-gradient-to-r opacity-50",
        config.gradient,
        severity === "critical" && "animate-pulse"
      )} />
      
      {/* Animated border glow */}
      <div className={clsx(
        "absolute inset-0 rounded-2xl",
        severity === "critical" && "animate-pulse"
      )}>
        <div className={clsx(
          "absolute inset-0 rounded-2xl border border-t-2",
          config.border
        )} style={{
          borderTopColor: config.accent,
        }} />
      </div>
      
      <div className="relative px-5 py-4 flex items-center gap-4">
        {/* Icon with pulsing glow */}
        <div className="relative flex-shrink-0">
          <div className={clsx(
            "p2.5 rounded-xl bg-white/10 border",
            config.border,
            config.iconColor
          )}>
            <Icon className="h-5 w-5" />
          </div>
          {/* Animated glow ring */}
          {severity === "critical" && (
            <div className={clsx(
              "absolute inset-0 rounded-xl animate-ping opacity-30",
              config.bg
            )} />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white">{title}</p>
            {severity === "critical" && (
              <span className={clsx(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                "bg-red-500/20 text-red-400 border border-red-500/40"
              )}>
                Critical
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 truncate mt-0.5">{message}</p>
        </div>
        
        {/* Action */}
        {action && (
          <button
            onClick={action.onClick}
            className={clsx(
              "flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300",
              "bg-white/10 text-white hover:bg-white/20 border border-white/20",
              "hover:shadow-lg hover:scale-105"
            )}
          >
            {action.label}
          </button>
        )}
        
        {/* Dismiss */}
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 duration-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Bottom animated line */}
      <div className={clsx(
        "absolute bottom-0 left-0 right-0 h-0.5",
        severity === "critical" ? "animate-pulse" : ""
      )}>
        <div 
          className="h-full w-full animate-pulse"
          style={{
            background: `linear-gradient(90deg, transparent, ${config.accent}, transparent)`,
            opacity: 0.8
          }}
        />
      </div>
    </div>
  );
}

// Hook for managing multiple alerts
export function useAlertBanner() {
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    title: string;
    message: string;
    severity: AlertSeverity;
    action?: { label: string; onClick: () => void };
  }>>([]);

  const addAlert = (alert: Omit<typeof alerts[0], "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setAlerts((prev) => [...prev, { ...alert, id }]);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return { alerts, addAlert, removeAlert };
}
