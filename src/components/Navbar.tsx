import { Link, useLocation } from "react-router-dom";
import { Activity, Menu, X, LogOut, BarChart3, Settings, Brain, Globe, BookOpen, Play, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import GlobalSearch from "./GlobalSearch";

const navigationItems = [
  { name: "Dashboard", path: "/" },
  { name: "New Incident", path: "/new-incident" },
  { name: "AI Chat", path: "/chat" },
  { name: "Voice", path: "/voice" },
  { name: "History", path: "/history" },
  { name: "Technicians", path: "/technicians" },
  { name: "Prediction", path: "/prediction", icon: Brain },
  { name: "Allocation", path: "/allocation", icon: Users },
  { name: "Geo Map", path: "/geo-map", icon: Globe },
  { name: "Simulation", path: "/simulation", icon: Play },
  { name: "Playbooks", path: "/playbooks", icon: BookOpen },
  { name: "Analytics", path: "/analytics" },
];

export const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut, user } = useAuth();

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <div className="rounded-lg bg-gradient-to-br from-primary to-secondary p-2">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline-block">AI Crisis Coordinator</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            <GlobalSearch />
            {navigationItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className={cn("transition-all", location.pathname === item.path && "bg-primary text-primary-foreground")}
                  aria-current={location.pathname === item.path ? "page" : undefined}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            <Link to="/settings">
              <Button
                variant={location.pathname === "/settings" ? "default" : "ghost"}
                size="icon"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <GlobalSearch />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t py-4 space-y-2">
            {navigationItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  className={cn("w-full justify-start", location.pathname === item.path && "bg-primary text-primary-foreground")}
                  aria-current={location.pathname === item.path ? "page" : undefined}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={location.pathname === "/settings" ? "default" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
