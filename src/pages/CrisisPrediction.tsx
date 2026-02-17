import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Activity,
  Zap,
  Target,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Users,
  DollarSign,
  Server,
  Database,
  Globe,
  Lock
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
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { Navbar } from "@/components/Navbar";

interface RiskPrediction {
  id: string;
  type: "cyber" | "infrastructure" | "financial" | "natural" | "operational";
  severity: "low" | "medium" | "high" | "critical";
  riskScore: number;
  probability: number;
  factors: string[];
  recommendation: string;
  timestamp: Date;
}

interface EarlyWarning {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  status: "normal" | "warning" | "critical";
  trend: "up" | "down" | "stable";
}

const generatePredictions = (): RiskPrediction[] => [
  {
    id: "1",
    type: "cyber",
    severity: "high",
    riskScore: 78,
    probability: 0.72,
    factors: ["Unusual network traffic", "Multiple failed login attempts", "Outdated security patches"],
    recommendation: "Immediately increase monitoring and review access logs",
    timestamp: new Date()
  },
  {
    id: "2",
    type: "infrastructure",
    severity: "medium",
    riskScore: 52,
    probability: 0.45,
    factors: ["Server load above 80%", "Memory usage trending up", "Aging hardware components"],
    recommendation: "Plan infrastructure upgrade within 30 days",
    timestamp: new Date()
  },
  {
    id: "3",
    type: "financial",
    severity: "high",
    riskScore: 68,
    probability: 0.58,
    factors: ["Budget overrun in 2 departments", "Unexpected vendor costs", "Currency fluctuation impact"],
    recommendation: "Review and adjust Q2 budget allocation",
    timestamp: new Date()
  },
  {
    id: "4",
    type: "operational",
    severity: "low",
    riskScore: 35,
    probability: 0.25,
    factors: ["Minor process inefficiencies", "Staff turnover in 1 department"],
    recommendation: "Continue monitoring current operations",
    timestamp: new Date()
  }
];

const generateEarlyWarnings = (): EarlyWarning[] => [
  { id: "1", metric: "Server CPU Load", value: 85, threshold: 80, status: "warning", trend: "up" },
  { id: "2", metric: "Network Traffic", value: 92, threshold: 75, status: "critical", trend: "up" },
  { id: "3", metric: "Security Alerts", value: 15, threshold: 10, status: "warning", trend: "up" },
  { id: "4", metric: "Database Connections", value: 65, threshold: 80, status: "normal", trend: "stable" },
  { id: "5", metric: "API Response Time", value: 245, threshold: 200, status: "warning", trend: "up" },
  { id: "6", metric: "Active Users", value: 1250, threshold: 2000, status: "normal", trend: "down" }
];

const riskTrendData = [
  { date: "Mon", cyber: 45, infrastructure: 32, financial: 28, operational: 22 },
  { date: "Tue", cyber: 52, infrastructure: 38, financial: 35, operational: 25 },
  { date: "Wed", cyber: 48, infrastructure: 42, financial: 32, operational: 28 },
  { date: "Thu", cyber: 65, infrastructure: 48, financial: 45, operational: 30 },
  { date: "Fri", cyber: 72, infrastructure: 52, financial: 55, operational: 35 },
  { date: "Sat", cyber: 68, infrastructure: 45, financial: 48, operational: 32 },
  { date: "Sun", cyber: 78, infrastructure: 52, financial: 68, operational: 35 }
];

const departmentRiskData = [
  { department: "IT", security: 85, stability: 75, compliance: 90, efficiency: 80 },
  { department: "Finance", security: 70, stability: 85, compliance: 95, efficiency: 75 },
  { department: "Operations", security: 65, stability: 70, compliance: 80, efficiency: 85 },
  { department: "HR", security: 60, stability: 80, compliance: 75, efficiency: 70 },
  { department: "Marketing", security: 55, stability: 65, compliance: 60, efficiency: 90 },
  { department: "Sales", security: 50, stability: 60, compliance: 55, efficiency: 85 }
];

const patternData = [
  { name: "Similar Incidents", count: 12, similarity: 85 },
  { name: "Time Patterns", count: 8, similarity: 72 },
  { name: "Location Clusters", count: 5, similarity: 91 },
  { name: "User Behavior", count: 3, similarity: 68 }
];

export default function CrisisPrediction() {
  const [predictions, setPredictions] = useState<RiskPrediction[]>([]);
  const [warnings, setWarnings] = useState<EarlyWarning[]>([]);
  const [overallRisk, setOverallRisk] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPredictions(generatePredictions());
      setWarnings(generateEarlyWarnings());
      const avgRisk = generatePredictions().reduce((acc, p) => acc + p.riskScore, 0) / 4;
      setOverallRisk(Math.round(avgRisk));
      setIsAnalyzing(false);
    }, 1500);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      default: return "bg-green-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "text-red-500";
      case "warning": return "text-yellow-500";
      default: return "text-green-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-500" />
              AI Crisis Prediction Engine
            </h1>
            <p className="text-muted-foreground mt-1">
              Machine learning-powered risk assessment and early warning system
            </p>
          </div>
          <Button onClick={() => window.location.reload()} className="gap-2">
            <Zap className="h-4 w-4" />
            Run Analysis
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className={overallRisk > 70 ? "border-red-500 border-2" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Risk Score</p>
                  <p className={`text-4xl font-bold ${overallRisk > 70 ? "text-red-500" : overallRisk > 50 ? "text-yellow-500" : "text-green-500"}`}>
                    {isAnalyzing ? "..." : overallRisk}
                  </p>
                </div>
                <Shield className={`h-12 w-12 ${overallRisk > 70 ? "text-red-500" : "text-green-500"}`} />
              </div>
              <Progress value={overallRisk} className="mt-4" />
              <p className="text-xs text-muted-foreground mt-2">
                {overallRisk > 70 ? "⚠️ High Risk - Immediate Action Required" : overallRisk > 50 ? "⚡ Moderate Risk - Monitor Closely" : "✅ Low Risk - Continue Monitoring"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Predictions</p>
                  <p className="text-3xl font-bold">{predictions.length}</p>
                </div>
                <Target className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                  <p className="text-3xl font-bold text-red-500">
                    {warnings.filter(w => w.status === "critical").length}
                  </p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Patterns Detected</p>
                  <p className="text-3xl font-bold">28</p>
                </div>
                <Activity className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="predictions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="predictions">Risk Predictions</TabsTrigger>
            <TabsTrigger value="warnings">Early Warnings</TabsTrigger>
            <TabsTrigger value="trends">Risk Trends</TabsTrigger>
            <TabsTrigger value="patterns">Pattern Detection</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predictions.map((prediction) => (
                <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {prediction.type === "cyber" && <Lock className="h-5 w-5 text-red-500" />}
                        {prediction.type === "infrastructure" && <Server className="h-5 w-5 text-orange-500" />}
                        {prediction.type === "financial" && <DollarSign className="h-5 w-5 text-yellow-500" />}
                        {prediction.type === "natural" && <Globe className="h-5 w-5 text-blue-500" />}
                        {prediction.type === "operational" && <Activity className="h-5 w-5 text-purple-500" />}
                        <span className="font-semibold capitalize">{prediction.type} Threat</span>
                      </div>
                      <Badge className={getSeverityColor(prediction.severity)}>
                        {prediction.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Risk Score</p>
                        <p className="text-2xl font-bold">{prediction.riskScore}/100</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Probability</p>
                        <p className="text-2xl font-bold">{(prediction.probability * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium">Contributing Factors:</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {prediction.factors.map((factor, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        🤖 AI Recommendation: {prediction.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="warnings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Early Warning System
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of key risk indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {warnings.map((warning) => (
                    <div key={warning.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${warning.status === "critical" ? "bg-red-100" : warning.status === "warning" ? "bg-yellow-100" : "bg-green-100"}`}>
                          {warning.status === "critical" ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : warning.status === "warning" ? (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{warning.metric}</p>
                          <p className="text-sm text-muted-foreground">
                            Threshold: {warning.threshold}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getStatusColor(warning.status)}`}>
                            {warning.value}
                          </p>
                          <div className="flex items-center gap-1">
                            {warning.trend === "up" ? (
                              <ArrowUpRight className="h-4 w-4 text-red-500" />
                            ) : warning.trend === "down" ? (
                              <ArrowDownRight className="h-4 w-4 text-green-500" />
                            ) : (
                              <Activity className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="text-xs text-muted-foreground capitalize">{warning.trend}</span>
                          </div>
                        </div>
                        <Progress 
                          value={(warning.value / warning.threshold) * 100} 
                          className="w-24"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Score Trends</CardTitle>
                  <CardDescription>7-day risk analysis by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <LineChart data={riskTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="cyber" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="infrastructure" stroke="#f97316" strokeWidth={2} />
                      <Line type="monotone" dataKey="financial" stroke="#eab308" strokeWidth={2} />
                      <Line type="monotone" dataKey="operational" stroke="#8b5cf6" strokeWidth={2} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Risk Exposure</CardTitle>
                  <CardDescription>Security posture by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={{}} className="h-[300px]">
                    <RadarChart data={departmentRiskData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="department" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Security" dataKey="security" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
                      <Radar name="Stability" dataKey="stability" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </RadarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI Pattern Detection
                </CardTitle>
                <CardDescription>
                  Historical data analysis to identify recurring crisis patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patternData.map((pattern, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                          <BarChart3 className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">{pattern.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {pattern.count} similar patterns found
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{pattern.similarity}%</p>
                        <p className="text-xs text-muted-foreground">Similarity Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto Severity Escalation</CardTitle>
                <CardDescription>
                  AI-powered automatic severity adjustment based on pattern matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span>3 incidents auto-escalated today</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span>Pattern matching running every 5 minutes</span>
                    </div>
                    <Badge variant="outline" className="text-blue-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
