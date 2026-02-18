import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  PlusCircle, 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Users,
  Brain,
  MapPin,
  Play,
  BookOpen,
  Settings,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Shield,
  AlertTriangle,
  Sparkles,
  Activity,
  Target,
  FlaskConical,
  UserCircle,
  Network
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Incidents", href: "/history", icon: AlertTriangle },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const secondaryNavItems: NavItem[] = [
  { name: "New Incident", href: "/new-incident", icon: PlusCircle },
  { name: "Prediction", href: "/prediction", icon: Brain },
  { name: "Allocation", href: "/allocation", icon: Users },
  { name: "Geo Map", href: "/geo-map", icon: MapPin },
  { name: "Simulation", href: "/simulation", icon: Play },
  { name: "Playbooks", href: "/playbooks", icon: BookOpen },
  { name: "Technicians", href: "/technicians", icon: UserCircle },
];

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const currentPage = mainNavItems.find(i => isActive(i.href))?.name || 
                      secondaryNavItems.find(i => isActive(i.href))?.name || 
                      "Dashboard";

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Animated background */}
      <div className="fixed inset-0 bg-[#030712]">
        {/* Ambient gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px] opacity-50" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] opacity-30" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-xl"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-40 h-screen w-72 transform transition-transform duration-500 ease-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-[#0d1117]/95 via-[#0d1117]/90 to-[#0d1117]/95 backdrop-blur-2xl border-r border-white/5">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-20 border-b border-white/5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary/30">
                <Shield className="h-5 w-5 text-white" />
              </div>
              {/* Glowing dot indicator */}
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">Crisis Command</h1>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">AI Operations Center</p>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-5">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white/40 text-sm hover:bg-white/10 hover:border-white/10 hover:text-white/60 transition-all duration-300 group">
              <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-white/30 font-mono">⌘K</kbd>
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            <div className="px-3 py-3">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Main</p>
            </div>
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-primary/20 to-purple-500/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {/* Active indicator glow */}
                {isActive(item.href) && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-r-full shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
                  </>
                )}
                <item.icon className={clsx(
                  "h-5 w-5 relative z-10 transition-all duration-300",
                  isActive(item.href) 
                    ? "text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" 
                    : "text-white/40 group-hover:text-white/70 group-hover:scale-110"
                )} />
                <span className="text-sm font-semibold relative z-10">{item.name}</span>
                {isActive(item.href) && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,1)] relative z-10" />
                )}
              </Link>
            ))}

            <div className="px-3 py-4 mt-2">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Operations</p>
            </div>
            {secondaryNavItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-primary/20 to-purple-500/10 text-white"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive(item.href) && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-r-full shadow-[0_0_15px_rgba(139,92,246,0.8)]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
                  </>
                )}
                <item.icon className={clsx(
                  "h-5 w-5 relative z-10 transition-all duration-300",
                  isActive(item.href) 
                    ? "text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" 
                    : "text-white/40 group-hover:text-white/70 group-hover:scale-110"
                )} />
                <span className="text-sm font-semibold relative z-10">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-white/5 space-y-1">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all group"
            >
              <Settings className="h-5 w-5 text-white/40 group-hover:text-white group-hover:scale-110 transition-all" />
              <span className="text-sm font-semibold">Settings</span>
            </Link>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all group"
            >
              <LogOut className="h-5 w-5 text-white/40 group-hover:text-red-400 group-hover:scale-110 transition-all" />
              <span className="text-sm font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 h-20 bg-[#0d1117]/80 backdrop-blur-2xl border-b border-white/5">
          <div className="flex items-center justify-between h-full px-6 lg:px-8">
            {/* Left side - Breadcrumb/Title */}
            <div className="flex items-center gap-4 ml-12 lg:ml-0">
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/40">Operations</span>
                <span className="text-white/20">/</span>
                <span className="text-sm font-semibold text-white">{currentPage}</span>
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Status indicator */}
              <div className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]"></span>
                </span>
                <span className="text-xs font-semibold text-green-400">System Online</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all group">
                <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              </button>

              {/* AI Assistant */}
              <Link
                to="/chat"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-white text-sm font-semibold hover:opacity-90 transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
              >
                <Sparkles className="h-4 w-4" />
                <span>AI Assist</span>
              </Link>

              {/* Profile */}
              <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white/5 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                  A
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="relative">
          {children}
        </main>
      </div>
    </div>
  );
}

export { Sidebar };
