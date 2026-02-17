import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Users, Clock, TrendingUp, Plus, MessageSquare, BarChart3, Settings, Mic, History, ArrowRight, MapPin, Calendar, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/api/mockApi";
import { DashboardStats, Incident } from "@/types";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { Navbar } from "@/components/Navbar";
import MobileActions from "@/components/MobileActions";
import StatCard from "@/components/StatCard";
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

    // Real-time updates for dashboard stats
    const incChannel = supabase
      .channel("dashboard-incidents")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => {
        loadStats();
        loadRecentIncidents();
      })
      .subscribe();

    const techChannel = supabase
      .channel("dashboard-technicians")
      .on("postgres_changes", { event: "*", schema: "public", table: "technicians" }, () => loadStats())
      .subscribe();

    return () => {
      supabase.removeChannel(incChannel);
      supabase.removeChannel(techChannel);
    };
  }, []);

  const statCards = stats
    ? [
        { title: "Total Incidents Today", value: stats.totalIncidents, icon: TrendingUp, color: "text-info" },
        { title: "High-Priority Incidents", value: stats.highPriorityIncidents, icon: AlertCircle, color: "text-destructive" },
        { title: "Technicians Available", value: stats.availableTechnicians, icon: Users, color: "text-success" },
        { title: "Avg Resolution Time", value: stats.avgResolutionTime, icon: Clock, color: "text-warning" },
      ]
    : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const quickActions = [
    { title: "Report Incident", description: "Create a new incident report", icon: Plus, path: "/new-incident", color: "from-blue-500 to-cyan-500" },
    { title: "AI Assistant", description: "Chat with AI for help", icon: MessageSquare, path: "/chat", color: "from-purple-500 to-pink-500" },
    { title: "Voice Command", description: "Use voice to create incidents", icon: Mic, path: "/voice", color: "from-amber-500 to-orange-500" },
    { title: "View Analytics", description: "See detailed reports", icon: BarChart3, path: "/analytics", color: "from-green-500 to-emerald-500" },
    { title: "Incident History", description: "Browse all incidents", icon: History, path: "/history", color: "from-indigo-500 to-violet-500" },
    { title: "Settings", description: "Configure preferences", icon: Settings, path: "/settings", color: "from-gray-500 to-slate-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="mb-8 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Crisis Coordinator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Intelligent incident management powered by AI. Real-time coordination, automated assignment, and smart
            resource allocation.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            statCards.map((stat, index) => (
              <StatCard key={index} title={stat.title} value={stat.value} Icon={stat.icon} color={stat.color} />
            ))
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Link key={action.path} to={action.path}>
                <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer h-full border-border/50 hover:border-primary/50">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-medium text-sm">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Incidents */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Incidents
                </CardTitle>
                <Link to="/history">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentIncidents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No incidents yet</p>
                    <Link to="/new-incident">
                      <Button variant="outline" size="sm" className="mt-3">
                        Report First Incident
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentIncidents.map((incident) => (
                      <Link key={incident.id} to={`/incident/${incident.id}`}>
                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{incident.title}</p>
                              <Badge className={`text-[10px] h-5 flex-shrink-0 ${getPriorityColor(incident.priority)}`}>
                                {incident.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {incident.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(incident.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize ml-2">
                            {incident.status}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">{stats?.totalIncidents || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Incidents</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium">{stats?.highPriorityIncidents || 0}</p>
                      <p className="text-xs text-muted-foreground">High Priority</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">{stats?.availableTechnicians || 0}</p>
                      <p className="text-xs text-muted-foreground">Technicians Available</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">{stats?.avgResolutionTime || "N/A"}</p>
                      <p className="text-xs text-muted-foreground">Avg Resolution</p>
                    </div>
                  </div>
                </div>
                <Link to="/analytics">
                  <Button variant="outline" className="w-full mt-2 gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Full Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Smart Assignment</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              AI automatically assigns incidents to the best-suited technician based on skills and availability.
            </CardContent>
          </Card>
          <Card className="border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Real-time Triage</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Intelligent priority classification ensures critical incidents get immediate attention.
            </CardContent>
          </Card>
          <Card className="border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">SOP Guidance</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Step-by-step procedures generated by AI to guide technicians through resolution.
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileActions />
    </div>
  );
}
