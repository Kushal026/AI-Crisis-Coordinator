import { useState } from "react";
import { 
  Users, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Zap,
  Target,
  Gauge,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { Navbar } from "@/components/Navbar";

interface Technician {
  id: string;
  name: string;
  skills: string[];
  location: string;
  availability: number;
  rating: number;
  costPerHour: number;
  currentLoad: number;
  activeIncidents: number;
  matchScore?: number;
}

interface Incident {
  id: string;
  title: string;
  category: string;
  priority: string;
  requiredSkills: string[];
  estimatedHours: number;
  location: string;
}

const technicians: Technician[] = [
  { id: "1", name: "John Smith", skills: ["Network Security", "Firewall", "Penetration Testing"], location: "New York", availability: 85, rating: 4.8, costPerHour: 120, currentLoad: 65, activeIncidents: 3 },
  { id: "2", name: "Sarah Johnson", skills: ["Cloud Security", "AWS", "Azure"], location: "San Francisco", availability: 70, rating: 4.9, costPerHour: 150, currentLoad: 80, activeIncidents: 4 },
  { id: "3", name: "Mike Chen", skills: ["Incident Response", "Malware Analysis", "Forensics"], location: "Chicago", availability: 90, rating: 4.7, costPerHour: 130, currentLoad: 55, activeIncidents: 2 },
  { id: "4", name: "Emily Davis", skills: ["Data Protection", "GDPR", "Compliance"], location: "Boston", availability: 60, rating: 4.6, costPerHour: 110, currentLoad: 45, activeIncidents: 2 },
  { id: "5", name: "Alex Thompson", skills: ["Network Security", "VPN", "Encryption"], location: "Seattle", availability: 75, rating: 4.5, costPerHour: 100, currentLoad: 70, activeIncidents: 3 },
  { id: "6", name: "Jessica Lee", skills: ["Application Security", "Code Review", "DevSecOps"], location: "Austin", availability: 95, rating: 4.9, costPerHour: 140, currentLoad: 40, activeIncidents: 1 }
];

const pendingIncidents: Incident[] = [
  { id: "INC-001", title: "Critical Server Breach", category: "Cyber", priority: "Critical", requiredSkills: ["Incident Response", "Network Security"], estimatedHours: 8, location: "New York" },
  { id: "INC-002", title: "Data Leak Investigation", category: "Data", priority: "High", requiredSkills: ["Forensics", "Data Protection"], estimatedHours: 12, location: "San Francisco" },
  { id: "INC-003", title: "Cloud Infrastructure Audit", category: "Infrastructure", priority: "Medium", requiredSkills: ["Cloud Security", "AWS"], estimatedHours: 16, location: "Chicago" },
  { id: "INC-004", title: "Phishing Attack Response", category: "Cyber", priority: "High", requiredSkills: ["Incident Response", "Email Security"], estimatedHours: 4, location: "Boston" }
];

const allocationData = [
  { name: "Optimal", value: 65, color: "#22c55e" },
  { name: "Good", value: 25, color: "#3b82f6" },
  { name: "Needs Review", value: 10, color: "#f59e0b" }
];

const skillMatchData = [
  { skill: "Network Security", matched: 85, unmatched: 15 },
  { skill: "Cloud Security", matched: 72, unmatched: 28 },
  { skill: "Incident Response", matched: 90, unmatched: 10 },
  { skill: "Data Protection", matched: 68, unmatched: 32 },
  { skill: "Compliance", matched: 75, unmatched: 25 }
];

const costSavingsData = [
  { month: "Jan", actual: 45000, optimal: 38000 },
  { month: "Feb", actual: 42000, optimal: 35000 },
  { month: "Mar", actual: 48000, optimal: 40000 },
  { month: "Apr", actual: 39000, optimal: 32000 },
  { month: "May", actual: 44000, optimal: 36000 },
  { month: "Jun", actual: 41000, optimal: 34000 }
];

export default function AutoAllocation() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [recommendedTechnicians, setRecommendedTechnicians] = useState<Technician[]>([]);

  const calculateMatchScore = (tech: Technician, incident: Incident) => {
    let score = 0;
    
    // Skill matching (40%)
    const matchedSkills = tech.skills.filter(skill => 
      incident.requiredSkills.some(req => skill.toLowerCase().includes(req.toLowerCase()))
    );
    score += (matchedSkills.length / incident.requiredSkills.length) * 40;
    
    // Availability (25%)
    score += (tech.availability / 100) * 25;
    
    // Current load (20%)
    score += ((100 - tech.currentLoad) / 100) * 20;
    
    // Rating (10%)
    score += (tech.rating / 5) * 10;
    
    // Cost efficiency (5%)
    score += ((200 - tech.costPerHour) / 200) * 5;
    
    return Math.round(score);
  };

  const handleRecommend = (incident: Incident) => {
    setSelectedIncident(incident);
    const recommendations = technicians
      .map(tech => ({
        ...tech,
        matchScore: calculateMatchScore(tech, incident)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
    setRecommendedTechnicians(recommendations);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-500";
      case "High": return "bg-orange-500";
      case "Medium": return "bg-yellow-500";
      default: return "bg-green-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              Smart Auto-Allocation Engine
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered resource allocation based on skills, location, and availability
            </p>
          </div>
          <Button className="gap-2">
            <Zap className="h-4 w-4" />
            Auto-Assign All
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Technicians</p>
                  <p className="text-3xl font-bold">{technicians.length}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Incidents</p>
                  <p className="text-3xl font-bold text-orange-500">{pendingIncidents.length}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Match Score</p>
                  <p className="text-3xl font-bold text-green-500">82%</p>
                </div>
                <Target className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cost Savings</p>
                  <p className="text-3xl font-bold text-purple-500">$18K</p>
                </div>
                <Wallet className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="allocation" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="allocation">Resource Allocation</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="analytics">Allocation Analytics</TabsTrigger>
          </TabsList>

          {/* Resource Allocation Tab */}
          <TabsContent value="allocation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pending Incidents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Pending Incidents
                  </CardTitle>
                  <CardDescription>
                    Select an incident to get AI-powered technician recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingIncidents.map((incident) => (
                      <div key={incident.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{incident.id}</span>
                            <Badge className={getPriorityColor(incident.priority)}>
                              {incident.priority}
                            </Badge>
                          </div>
                          <Button size="sm" onClick={() => handleRecommend(incident)}>
                            Recommend
                          </Button>
                        </div>
                        <p className="font-medium mb-1">{incident.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {incident.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {incident.estimatedHours}h
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {incident.location}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Available Technicians */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Available Technicians
                  </CardTitle>
                  <CardDescription>
                    Current workload and availability status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {technicians.map((tech) => (
                      <div key={tech.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {tech.name.split(" ").map(n => n[0]).join("")}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{tech.name}</p>
                              <p className="text-xs text-muted-foreground">{tech.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{tech.rating}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {tech.skills.slice(0, 2).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Load:</span>
                            <Progress value={tech.currentLoad} className="w-16 h-2" />
                            <span>{tech.currentLoad}%</span>
                          </div>
                          <span className="text-green-600 font-medium">${tech.costPerHour}/hr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  AI Recommended Technicians
                </CardTitle>
                <CardDescription>
                  {selectedIncident 
                    ? `Recommendations for ${selectedIncident.id}: ${selectedIncident.title}`
                    : "Select an incident from the Allocation tab to get recommendations"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedIncident ? (
                  <div className="space-y-4">
                    {recommendedTechnicians.map((tech, idx) => (
                      <div key={tech.id} className={`p-4 border rounded-lg ${idx === 0 ? "bg-green-50 border-green-200" : ""}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${idx === 0 ? "bg-green-500" : "bg-blue-500"}`}>
                              <span className="text-white font-bold">#{idx + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {tech.name}
                                {idx === 0 && <Badge className="bg-green-500">Best Match</Badge>}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {tech.location} • ${tech.costPerHour}/hr • Rating: {tech.rating}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">{tech.matchScore}%</p>
                            <p className="text-xs text-muted-foreground">Match Score</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="outline">Load: {tech.currentLoad}%</Badge>
                            <Badge variant="outline">Active: {tech.activeIncidents}</Badge>
                          </div>
                          <Button size="sm">
                            Assign Now <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an incident from the Resource Allocation tab to see AI recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-500" />
                  Budget Optimization Suggestions
                </CardTitle>
                <CardDescription>
                  AI-generated cost optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>Shift 2 incidents to remote technicians</span>
                    </div>
                    <Badge className="bg-green-500">Save $2,400</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span>Schedule maintenance during off-peak hours</span>
                    </div>
                    <Badge className="bg-blue-500">Save $1,800</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Gauge className="h-5 w-5 text-purple-500" />
                      <span>Cross-train technicians for flexibility</span>
                    </div>
                    <Badge className="bg-purple-500">Save $3,200</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Allocation Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[250px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={allocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {allocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {allocationData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Match Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[250px]">
                    <BarChart data={skillMatchData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="skill" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="matched" fill="#22c55e" name="Matched" />
                      <Bar dataKey="unmatched" fill="#f59e0b" name="Unmatched" />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Cost Savings Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[250px]">
                    <LineChart data={costSavingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} name="Actual Cost" />
                      <Line type="monotone" dataKey="optimal" stroke="#22c55e" strokeWidth={2} name="Optimal Cost" />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
