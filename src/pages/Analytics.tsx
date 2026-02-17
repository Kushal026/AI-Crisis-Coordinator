import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar, 
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  FileText,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Incident, Technician } from "@/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

interface AnalyticsData {
  incidentsByPriority: { name: string; value: number; color: string }[];
  incidentsByCategory: { name: string; value: number }[];
  incidentsByStatus: { name: string; value: number; color: string }[];
  weeklyTrend: { day: string; incidents: number; resolved: number }[];
  technicianPerformance: { name: string; resolved: number; avgTime: number }[];
  monthlyTrend: { month: string; incidents: number; resolved: number }[];
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      const [incidentsRes, techniciansRes] = await Promise.all([
        supabase.from("incidents").select("*").order("created_at", { ascending: false }),
        supabase.from("technicians").select("*"),
      ]);

      const incidentsData = (incidentsRes.data || []) as Incident[];
      const techniciansData = (techniciansRes.data || []) as Technician[];

      setIncidents(incidentsData);
      setTechnicians(techniciansData);

      // Process data for charts
      const analytics = processAnalyticsData(incidentsData, techniciansData);
      setData(analytics);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (incidents: Incident[], technicians: Technician[]): AnalyticsData => {
    // Priority distribution
    const priorityCount: Record<string, number> = {};
    incidents.forEach(inc => {
      priorityCount[inc.priority] = (priorityCount[inc.priority] || 0) + 1;
    });

    const incidentsByPriority = [
      { name: "High", value: priorityCount["high"] || 0, color: "#ef4444" },
      { name: "Medium", value: priorityCount["medium"] || 0, color: "#f59e0b" },
      { name: "Low", value: priorityCount["low"] || 0, color: "#22c55e" },
    ];

    // Category distribution
    const categoryCount: Record<string, number> = {};
    incidents.forEach(inc => {
      categoryCount[inc.category] = (categoryCount[inc.category] || 0) + 1;
    });
    const incidentsByCategory = Object.entries(categoryCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

    // Status distribution
    const statusCount: Record<string, number> = {};
    incidents.forEach(inc => {
      statusCount[inc.status] = (statusCount[inc.status] || 0) + 1;
    });
    const incidentsByStatus = [
      { name: "Open", value: statusCount["open"] || 0, color: "#3b82f6" },
      { name: "In Progress", value: statusCount["in-progress"] || 0, color: "#f59e0b" },
      { name: "Closed", value: statusCount["closed"] || 0, color: "#22c55e" },
    ];

    // Weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayIncidents = incidents.filter(inc => 
        inc.created_at && inc.created_at.startsWith(dateStr)
      );
      const dayResolved = incidents.filter(inc => 
        inc.status === "closed" && inc.updated_at && inc.updated_at.startsWith(dateStr)
      );
      weeklyTrend.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        incidents: dayIncidents.length,
        resolved: dayResolved.length,
      });
    }

    // Technician performance
    const techPerformance: Record<string, { resolved: number; totalTime: number; count: number }> = {};
    technicians.forEach(tech => {
      const techIncidents = incidents.filter(inc => inc.assigned_technician === tech.name);
      const resolved = techIncidents.filter(inc => inc.status === "closed").length;
      techPerformance[tech.name] = { 
        resolved, 
        totalTime: 0, 
        count: techIncidents.length 
      };
    });
    const technicianPerformance = Object.entries(techPerformance).map(([name, stats]) => ({
      name: name.length > 10 ? name.substring(0, 10) + "..." : name,
      resolved: stats.resolved,
      avgTime: stats.count > 0 ? Math.round((stats.totalTime / stats.count) * 10) / 10 : 0,
    }));

    // Monthly trend
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().substring(0, 7);
      const monthIncidents = incidents.filter(inc => 
        inc.created_at && inc.created_at.startsWith(monthStr)
      );
      const monthResolved = incidents.filter(inc => 
        inc.status === "closed" && inc.updated_at && inc.updated_at.startsWith(monthStr)
      );
      monthlyTrend.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        incidents: monthIncidents.length,
        resolved: monthResolved.length,
      });
    }

    return {
      incidentsByPriority,
      incidentsByCategory,
      incidentsByStatus,
      weeklyTrend,
      technicianPerformance,
      monthlyTrend,
    };
  };

  const exportToCSV = () => {
    const headers = ["ID", "Title", "Description", "Location", "Category", "Priority", "Status", "Assigned To", "Created"];
    const rows = incidents.map(inc => [
      inc.incident_id,
      inc.title,
      inc.description,
      inc.location,
      inc.category,
      inc.priority,
      inc.status,
      inc.assigned_technician || "Unassigned",
      new Date(inc.created_at).toLocaleString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `incidents_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const calculateKPIs = () => {
    const total = incidents.length;
    const open = incidents.filter(i => i.status === "open").length;
    const inProgress = incidents.filter(i => i.status === "in-progress").length;
    const closed = incidents.filter(i => i.status === "closed").length;
    const highPriority = incidents.filter(i => i.priority === "high").length;
    const resolved = closed;
    const resolutionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

    return { total, open, inProgress, closed, highPriority, resolved, resolutionRate };
  };

  const kpis = data ? calculateKPIs() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Analytics & Reports
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into incident management performance
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Incidents</p>
                    <p className="text-3xl font-bold text-blue-600">{kpis.total}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">12%</span>
                  <span className="text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">High Priority</p>
                    <p className="text-3xl font-bold text-amber-600">{kpis.highPriority}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <ArrowDownRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">8%</span>
                  <span className="text-muted-foreground ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-3xl font-bold text-green-600">{kpis.closed}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-green-500 font-medium">{kpis.resolutionRate}%</span>
                  <span className="text-muted-foreground ml-1">resolution rate</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Cases</p>
                    <p className="text-3xl font-bold text-purple-600">{kpis.open + kpis.inProgress}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground mr-1" />
                  <span className="text-muted-foreground">Avg 2.5 hrs</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="priority">Priority</TabsTrigger>
            <TabsTrigger value="technicians">Technicians</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Incidents by Status
                  </CardTitle>
                  <CardDescription>Current distribution of incident statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  {data && (
                    <ChartContainer config={{}} className="h-64">
                      <RechartsPieChart>
                        <Pie
                          data={data.incidentsByStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {data.incidentsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </RechartsPieChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Incidents by Category
                  </CardTitle>
                  <CardDescription>Distribution across different categories</CardDescription>
                </CardHeader>
                <CardContent>
                  {data && (
                    <ChartContainer config={{}} className="h-64">
                      <BarChart data={data.incidentsByCategory}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Weekly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Weekly Trend
                  </CardTitle>
                  <CardDescription>Incidents created vs resolved (last 7 days)</CardDescription>
                </CardHeader>
                <CardContent>
                  {data && (
                    <ChartContainer config={{}} className="h-64">
                      <LineChart data={data.weeklyTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="incidents" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Monthly Trend
                  </CardTitle>
                  <CardDescription>Incidents created vs resolved (last 6 months)</CardDescription>
                </CardHeader>
                <CardContent>
                  {data && (
                    <ChartContainer config={{}} className="h-64">
                      <AreaChart data={data.monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="incidents" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="resolved" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                      </AreaChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Priority Tab */}
          <TabsContent value="priority" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Priority Distribution
                </CardTitle>
                <CardDescription>Breakdown of incidents by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                {data && (
                  <ChartContainer config={{}} className="h-80">
                    <BarChart data={data.incidentsByPriority} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {data.incidentsByPriority.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technicians Tab */}
          <TabsContent value="technicians" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Technician Performance
                </CardTitle>
                <CardDescription>Number of incidents resolved by each technician</CardDescription>
              </CardHeader>
              <CardContent>
                {data && (
                  <ChartContainer config={{}} className="h-80">
                    <BarChart data={data.technicianPerformance}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="resolved" fill="#22c55e" radius={[4, 4, 0, 0]} name="Resolved" />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            {/* Technician List */}
            <Card>
              <CardHeader>
                <CardTitle>Technician Directory</CardTitle>
                <CardDescription>Current team status and workload</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {technicians.map((tech) => {
                    const assignedCount = incidents.filter(i => i.assigned_technician === tech.name && i.status !== "closed").length;
                    const resolvedCount = incidents.filter(i => i.assigned_technician === tech.name && i.status === "closed").length;
                    
                    return (
                      <div key={tech.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{tech.name}</p>
                            <p className="text-sm text-muted-foreground capitalize">{tech.skill}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold">{assignedCount}</p>
                            <p className="text-xs text-muted-foreground">Active</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{resolvedCount}</p>
                            <p className="text-xs text-muted-foreground">Resolved</p>
                          </div>
                          <Badge variant={tech.availability === "available" ? "default" : "secondary"}>
                            {tech.availability}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
