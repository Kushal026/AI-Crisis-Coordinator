import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Users, Clock, TrendingUp, Plus, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/api/mockApi";
import { DashboardStats } from "@/types";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    loadStats();

    // Real-time updates for dashboard stats
    const incChannel = supabase
      .channel("dashboard-incidents")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => loadStats())
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

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/new-incident">
            <Button size="lg" className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
              <Plus className="h-5 w-5" />
              Report New Incident
            </Button>
          </Link>
          <Link to="/chat">
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-primary text-primary hover:bg-primary/10">
              <MessageSquare className="h-5 w-5" />
              Open AI Assistant
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            statCards.map((stat, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))
          )}
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
    </div>
  );
}
