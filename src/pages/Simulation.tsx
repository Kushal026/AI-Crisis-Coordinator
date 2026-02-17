import { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  Activity,
  Users,
  Clock,
  Zap,
  Target,
  Shield,
  Server,
  TrendingUp,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";

interface SimulationEvent {
  id: string;
  time: number;
  type: "incident" | "allocation" | "escalation" | "resolution";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface SimulationMetrics {
  totalIncidents: number;
  resolvedIncidents: number;
  avgResponseTime: number;
  resourceUtilization: number;
  teamEfficiency: number;
}

const simulationScenarios = [
  { id: "cyber", name: "Cyber Attack", description: "Simulate a ransomware attack", icon: "🔒" },
  { id: "infrastructure", name: "Infrastructure Failure", description: "Simulate server outage", icon: "🖥️" },
  { id: "natural", name: "Natural Disaster", description: "Simulate flood emergency", icon: "🌊" },
  { id: "financial", name: "Financial Crisis", description: "Simulate budget overrun", icon: "💰" },
  { id: "combined", name: "Multi-Crisis", description: "Simulate multiple simultaneous crises", icon: "⚡" }
];

export default function Simulation() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>("cyber");
  const [simulationTime, setSimulationTime] = useState(0);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [metrics, setMetrics] = useState<SimulationMetrics>({
    totalIncidents: 0,
    resolvedIncidents: 0,
    avgResponseTime: 0,
    resourceUtilization: 0,
    teamEfficiency: 0
  });
  const [autoAllocation, setAutoAllocation] = useState(true);
  const [autoEscalation, setAutoEscalation] = useState(true);

  useEffect(() => {
    let interval: number;
    if (isRunning) {
      interval = window.setInterval(() => {
        setSimulationTime(prev => prev + 1);
        
        // Generate random events
        if (Math.random() > 0.7) {
          const newEvent: SimulationEvent = {
            id: Date.now().toString(),
            time: simulationTime,
            type: Math.random() > 0.5 ? "incident" : "resolution",
            message: Math.random() > 0.5 
              ? "New critical incident detected" 
              : "Incident resolved successfully",
            severity: Math.random() > 0.7 ? "critical" : "medium"
          };
          setEvents(prev => [newEvent, ...prev].slice(0, 20));
        }
        
        // Update metrics
        setMetrics(prev => ({
          totalIncidents: prev.totalIncidents + (Math.random() > 0.8 ? 1 : 0),
          resolvedIncidents: prev.resolvedIncidents + (Math.random() > 0.6 ? 1 : 0),
          avgResponseTime: Math.max(5, prev.avgResponseTime + (Math.random() > 0.5 ? -1 : 2)),
          resourceUtilization: Math.min(100, Math.max(20, prev.resourceUtilization + (Math.random() > 0.5 ? 5 : -3))),
          teamEfficiency: Math.min(100, Math.max(60, prev.teamEfficiency + (Math.random() > 0.5 ? 2 : -1)))
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, simulationTime]);

  const handleStart = () => {
    setIsRunning(true);
    setEvents([{
      id: Date.now().toString(),
      time: 0,
      type: "incident",
      message: `Simulation started: ${simulationScenarios.find(s => s.id === selectedScenario)?.name}`,
      severity: "high"
    }]);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimulationTime(0);
    setEvents([]);
    setMetrics({
      totalIncidents: 0,
      resolvedIncidents: 0,
      avgResponseTime: 0,
      resourceUtilization: 0,
      teamEfficiency: 0
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              Real-Time Simulation Mode
            </h1>
            <p className="text-muted-foreground mt-1">
              Test your crisis response system with simulated scenarios
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-mono bg-black text-green-500 px-4 py-2 rounded-lg">
              {formatTime(simulationTime)}
            </div>
            {isRunning ? (
              <Button variant="destructive" onClick={handlePause} className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button onClick={handleStart} className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            )}
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className={isRunning ? "border-green-500" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={`text-xl font-bold ${isRunning ? "text-green-500" : "text-gray-500"}`}>
                    {isRunning ? "RUNNING" : "IDLE"}
                  </p>
                </div>
                <div className={`w-4 h-4 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Incidents</p>
                  <p className="text-2xl font-bold">{metrics.totalIncidents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold text-green-500">{metrics.resolvedIncidents}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">{metrics.avgResponseTime} min</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Efficiency</p>
                  <p className="text-2xl font-bold text-purple-500">{metrics.teamEfficiency}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="scenario" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scenario">Scenarios</TabsTrigger>
            <TabsTrigger value="settings">Simulation Settings</TabsTrigger>
            <TabsTrigger value="logs">Event Logs</TabsTrigger>
          </TabsList>

          {/* Scenarios Tab */}
          <TabsContent value="scenario" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {simulationScenarios.map((scenario) => (
                <Card 
                  key={scenario.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedScenario === scenario.id 
                      ? "border-green-500 border-2 bg-green-50 dark:bg-green-950" 
                      : ""
                  }`}
                  onClick={() => setSelectedScenario(scenario.id)}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="text-4xl mb-2">{scenario.icon}</div>
                    <p className="font-semibold">{scenario.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{scenario.description}</p>
                    {selectedScenario === scenario.id && (
                      <Badge className="mt-2 bg-green-500">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Live Simulation Dashboard</CardTitle>
                <CardDescription>
                  Watch the simulation unfold in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-4">Resource Utilization</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>IT Team</span>
                          <span>{metrics.resourceUtilization}%</span>
                        </div>
                        <Progress value={metrics.resourceUtilization} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Security Team</span>
                          <span>{Math.max(0, metrics.resourceUtilization - 20)}%</span>
                        </div>
                        <Progress value={Math.max(0, metrics.resourceUtilization - 20)} />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Operations</span>
                          <span>{Math.max(0, metrics.resourceUtilization - 40)}%</span>
                        </div>
                        <Progress value={Math.max(0, metrics.resourceUtilization - 40)} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Auto-Allocation Preview</h4>
                    <div className="space-y-3">
                      {autoAllocation && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center gap-3">
                          <Users className="h-5 w-5 text-blue-500" />
                          <span className="text-sm">AI allocating resources...</span>
                        </div>
                      )}
                      {autoEscalation && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg flex items-center gap-3">
                          <Zap className="h-5 w-5 text-orange-500" />
                          <span className="text-sm">Auto-escalation active</span>
                        </div>
                      )}
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg flex items-center gap-3">
                        <Target className="h-5 w-5 text-green-500" />
                        <span className="text-sm">Resolution rate: {metrics.totalIncidents > 0 ? Math.round((metrics.resolvedIncidents / metrics.totalIncidents) * 100) : 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Configuration</CardTitle>
                <CardDescription>
                  Customize simulation behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="auto-allocation">Auto Resource Allocation</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically allocate team members based on incident type
                      </p>
                    </div>
                    <Switch 
                      id="auto-allocation" 
                      checked={autoAllocation}
                      onCheckedChange={setAutoAllocation}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="auto-escalation">Auto Severity Escalation</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically escalate incidents based on pattern matching
                      </p>
                    </div>
                    <Switch 
                      id="auto-escalation" 
                      checked={autoEscalation}
                      onCheckedChange={setAutoEscalation}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Event Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Simulation Event Log</CardTitle>
                <CardDescription>
                  Real-time events during simulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {events.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No events yet. Start a simulation to see events.
                    </p>
                  ) : (
                    events.map((event) => (
                      <div 
                        key={event.id} 
                        className={`p-3 rounded-lg flex items-center gap-3 ${
                          event.severity === "critical" ? "bg-red-50 dark:bg-red-950" :
                          event.severity === "high" ? "bg-orange-50 dark:bg-orange-950" :
                          "bg-muted"
                        }`}
                      >
                        {event.type === "incident" ? (
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.type} • {event.severity} • T+{formatTime(event.time)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
