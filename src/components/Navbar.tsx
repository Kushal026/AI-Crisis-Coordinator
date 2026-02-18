import { Link, useLocation } from "react-router-dom";
import { Activity, Menu, X, LogOut, Settings, Bell, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import GlobalSearch from "./GlobalSearch";

const mainNavItems = [
  { name: "Dashboard", path: "/" },
  { name: "Incidents", path: "/history" },
  { name: "AI Chat", path: "/chat" },
  { name: "Analytics", path: "/analytics" },
];

const moreNavItems = [
  { name: "New Incident", path: "/new-incident" },
  { name: "Prediction", path: "/prediction" },
  { name: "Allocation", path: "/allocation" },
  { name: "Geo Map", path: "/geo-map" },
  { name: "Simulation", path: "/simulation" },
  { name: "Playbooks", path: "/playbooks" },
  { name: "Technicians", path: "/technicians" },
];

export const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const { signOut, user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="rounded-lg bg-gradient-to-br from-primary to-purple-600 p-1.5">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium hidden sm:inline-block">AI Crisis</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {mainNavItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "text-sm font-medium transition-all",
                    isActive(item.path) 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            
            {/* More Dropdown */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              >
                More
              </Button>
              {moreMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 rounded-md border bg-background shadow-lg overflow-hidden">
                  {moreNavItems.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path}
                      onClick={() => setMoreMenuOpen(false)}
                    >
                      <Button
                        variant={isActive(item.path) ? "secondary" : "ghost"}
                        className="w-full justify-start text-sm rounded-none"
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:block w-64">
              <GlobalSearch />
            </div>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Bell className="h-4 w-4" />
            </Button>
            
            <Link to="/settings">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut} 
              className="text-muted-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-1">
            {mainNavItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive(item.path) && "bg-primary text-primary-foreground"
                  )}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            
            <div className="pt-2 pb-1">
              <p className="px-2 text-xs font-medium text-muted-foreground">More</p>
            </div>
            
            {moreNavItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive(item.path) && "bg-primary text-primary-foreground"
                  )}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            
            <div className="border-t pt-4 mt-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-500" 
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
