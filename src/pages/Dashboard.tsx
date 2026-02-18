import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  Users, 
  Clock, 
  TrendingUp, 
  Plus, 
  MessageSquare, 
  BarChart3, 
  History, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  Activity,
  Zap,
  Shield,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  Cpu,
  Globe,
  HardDrive,
  Wifi
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/api/mockApi";
import { DashboardStats, Incident } from "@/types";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import AlertBanner from "@/components/AlertBanner";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentIncidents, setRecentIncidents] = useState<Incident[]>([]);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentIncidents = async () => {
    try {
      const { data } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentIncidents((data || []) as Incident[]);
    } catch (error) {
      console.error("Failed to load recent incidents:", error);
    }
  };

  useEffect(() => {
    loadStats();
    loadRecentIncidents();

    const incChannel = supabase
      .channel("dashboard-incidents")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => {
        loadStats();
        loadRecentIncidents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(incChannel);
    };
  }, []);

  const statCards = stats
    ? [
        { title: "Total Incidents", value: stats.totalIncidents, trend: 12, icon: AlertTriangle, color: "danger" as const, sparklineData: [12, 19, 15, 25, 22, 30, 28] },
        { title: "Active Cases", value: stats.highPriorityIncidents, trend: -5, icon: Activity, color: "warning" as const, sparklineData: [8, 12, 10, 6, 9, 7, 5] },
        { title: "Technicians", value: stats.availableTechnicians, trend: 8, icon: Users, color: "success" as const, sparklineData: [15, 18, 20, 22, 19, 24, 28] },
        { title: "Avg Resolution", value: `${stats.avgResolutionTime}h`, trend: -15, icon: Clock, color: "info" as const, sparklineData: [4.5, 4.2, 3.8, 3.5, 3.2, 2.9, 2.5] },
      ]
    : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]";
      case "medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]";
      case "low": return "bg-green-500/20 text-green-400 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]";
      default: return "bg-white/10 text-white/50 border-white/10";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "resolved": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default: return "bg-white/10 text-white/50 border-white/10";
    }
  };

  return (
    <Sidebar>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Alert Banner */}
        <AlertBanner
          title="Critical Incident Detected"
          message="Server outage in US-EAST-2 region affecting 3 services. Immediate attention required."
          severity="critical"
          action={{
            label: "View Details",
            onClick: () => console.log("View incident")
          }}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative">
            <h1 className="text-3xl font-bold text-white tracking-tight">Operations Dashboard</h1>
            <p className="text-white/40 text-sm mt-1 font-medium">Real-time crisis monitoring and response center</p>
            {/* Animated dot */}
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-400 font-medium">Live</span>
              <span className="text-white/20">•</span>
              <span className="text-xs text-white/30">Last updated: Just now</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/new-incident">
              <Button className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                New Incident
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              trendLabel="vs last week"
              icon={stat.icon}
              color={stat.color}
              sparklineData={stat.sparklineData}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Incidents */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden">
              {/* Card header with gradient border */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-cyan-500/20 h-px" />
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-6">
                  <CardTitle className="text-white text-lg font-semibold flex items-center gap-3">
                    <div className="relative">
                      <Radio className="h-4 w-4 text-primary animate-pulse" />
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    Live Incidents
                    <Badge variant="secondary" className="ml-2 bg-red-500/20 text-red-400 text-[10px] border-red-500/30">
                      {recentIncidents.length} Active
                    </Badge>
                  </CardTitle>
                  <Link to="/history">
                    <Button variant="ghost" size="sm" className="text-white/50 hover:text-white hover:bg-white/10">
                      View All <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
              </div>
              <CardContent className="px-6 pb-6">
                {recentIncidents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative inline-block">
                      <Shield className="h-16 w-16 mx-auto mb-4 text-white/10" />
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent blur-xl rounded-full" />
                    </div>
                    <p className="text-white/40 text-lg font-medium">All Clear</p>
                    <p className="text-white/20 text-sm mt-1">No active incidents at this time</p>
                    <Link to="/new-incident">
                      <Button variant="outline" size="sm" className="mt-6 border-white/10 text-white/50 hover:text-white hover:bg-white/5 hover:border-white/20">
                        Report First Incident
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentIncidents.map((incident) => (
                      <Link key={incident.id} to={`/incident/${incident.id}`}>
                        <div className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-xl border ${getPriorityColor(incident.priority)}`}>
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-white font-medium group-hover:text-primary transition-colors">{incident.title}</p>
                              <div className="flex items-center gap-4 mt-1.5 text-xs text-white/40">
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3" />
                                  {incident.location}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(incident.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`text-[10px] border ${getStatusColor(incident.status)}`}>
                              {incident.status}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-transparent to-pink-500/20 h-px" />
                <CardHeader className="pb-2 pt-5 px-6">
                  <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
              </div>
              <CardContent className="space-y-2 px-6 pb-6">
                <Link to="/chat" className="block">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-pink-500/20 border border-purple-500/20 hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <MessageSquare className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">AI Assistant</p>
                        <p className="text-white/40 text-xs">Chat with AI for help</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-purple-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </Link>
                <Link to="/analytics" className="block">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/20">
                        <BarChart3 className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Analytics</p>
                        <p className="text-white/40 text-xs">View detailed reports</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/30 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
                <Link to="/prediction" className="block">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">Predictions</p>
                        <p className="text-white/40 text-xs">AI-powered insights</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/30 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-transparent to-cyan-500/20 h-px" />
                <CardHeader className="pb-2 pt-5 px-6">
                  <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    System Status
                  </CardTitle>
                </CardHeader>
              </div>
              <CardContent className="space-y-5 px-6 pb-6">
                <div className="group">
                  <div className="flex items-center justify-between text-sm mb-2.5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-white/60">API Services</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-medium">99.9%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[99.9%] rounded-full bg-gradient-to-r from-green-500 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.7)] transition-shadow" />
                  </div>
                </div>
                <div className="group">
                  <div className="flex items-center justify-between text-sm mb-2.5">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-white/60">AI Processing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-medium">98.5%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[98.5%] rounded-full bg-gradient-to-r from-purple-500 to-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.5)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] transition-shadow" />
                  </div>
                </div>
                <div className="group">
                  <div className="flex items-center justify-between text-sm mb-2.5">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-white/60">Database</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-medium">100%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] group-hover:shadow-[0_0_20px_rgba(245,158,11,0.7)] transition-shadow" />
                  </div>
                </div>
                <div className="group">
                  <div className="flex items-center justify-between text-sm mb-2.5">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="text-white/60">Network</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-medium">99.7%</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[99.7%] rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.7)] transition-shadow" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/10 hover:border-primary/30 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)] transition-all duration-500 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-white font-semibold text-lg">Smart Assignment</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">AI automatically assigns incidents to the best-suited technician based on skills and availability.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)] transition-all duration-500 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                <Activity className="h-5 w-5 text-cyan-500" />
              </div>
              <h3 className="text-white font-semibold text-lg">Real-time Triage</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">Intelligent priority classification ensures critical incidents get immediate attention.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent backdrop-blur-xl border border-white/10 hover:border-amber-500/30 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] transition-all duration-500 group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-amber-500/20 group-hover:bg-amber-500/30 transition-colors">
                <Zap className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="text-white font-semibold text-lg">SOP Guidance</h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">Step-by-step procedures generated by AI to guide technicians through resolution.</p>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
