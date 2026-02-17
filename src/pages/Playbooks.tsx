import { useState } from "react";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  CheckCircle2,
  AlertTriangle,
  Shield,
  Server,
  Database,
  Lock,
  Flame,
  Zap,
  FileText,
  Plus,
  Search,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";

interface PlaybookStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  responsible: string;
  completed?: boolean;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
  category: "cyber" | "infrastructure" | "data" | "operational";
  severity: "critical" | "high" | "medium";
  estimatedTime: string;
  steps: PlaybookStep[];
  lastUpdated: string;
  usageCount: number;
}

const playbooks: Playbook[] = [
  {
    id: "1",
    name: "Ransomware Attack Response",
    description: "Step-by-step response plan for ransomware attacks including containment, investigation, and recovery",
    category: "cyber",
    severity: "critical",
    estimatedTime: "4-6 hours",
    lastUpdated: "2024-01-15",
    usageCount: 12,
    steps: [
      { id: 1, title: "Initial Detection", description: "Identify and confirm ransomware infection", duration: "15 min", responsible: "SOC Team" },
      { id: 2, title: "Isolate Affected Systems", description: "Immediately disconnect infected systems from network", duration: "30 min", responsible: "IT Operations" },
      { id: 3, title: "Activate Incident Response Team", description: "Notify and assemble the IR team", duration: "20 min", responsible: "Incident Commander" },
      { id: 4, title: "Assess Scope", description: "Determine extent of infection", duration: "1 hour", responsible: "Forensics Team" },
      { id: 5, title: "Begin Recovery", description: "Restore from clean backups", duration: "2-4 hours", responsible: "IT Operations" },
      { id: 6, title: "Post-Incident Review", description: "Document lessons learned", duration: "1 hour", responsible: "All Teams" }
    ]
  },
  {
    id: "2",
    name: "Data Breach Response",
    description: "Comprehensive plan for handling data breaches including notification requirements",
    category: "data",
    severity: "critical",
    estimatedTime: "24-72 hours",
    lastUpdated: "2024-01-20",
    usageCount: 8,
    steps: [
      { id: 1, title: "Contain the Breach", description: "Stop ongoing data exfiltration", duration: "1 hour", responsible: "Security Team" },
      { id: 2, title: "Preserve Evidence", description: "Collect and secure forensic evidence", duration: "2 hours", responsible: "Forensics Team" },
      { id: 3, title: "Assess Data Impact", description: "Identify what data was compromised", duration: "4 hours", responsible: "Data Team" },
      { id: 4, title: "Legal Notification", description: "Engage legal counsel and notify authorities", duration: "24 hours", responsible: "Legal" },
      { id: 5, title: "Customer Notification", description: "Notify affected customers per regulations", duration: "48 hours", responsible: "Communications" }
    ]
  },
  {
    id: "3",
    name: "Server Outage Protocol",
    description: "Recovery procedures for critical server failures",
    category: "infrastructure",
    severity: "high",
    estimatedTime: "2-4 hours",
    lastUpdated: "2024-01-10",
    usageCount: 25,
    steps: [
      { id: 1, title: "Alert Monitoring", description: "Verify outage and alert appropriate teams", duration: "5 min", responsible: "NOC" },
      { id: 2, title: "Initial Assessment", description: "Determine root cause", duration: "30 min", responsible: "Infrastructure Team" },
      { id: 3, title: "Failover Activation", description: "Activate backup systems", duration: "15 min", responsible: "DevOps" },
      { id: 4, title: "Service Restoration", description: "Bring services back online", duration: "1 hour", responsible: "IT Operations" },
      { id: 5, title: "Post-Mortem", description: "Document incident and root cause", duration: "2 hours", responsible: "All Teams" }
    ]
  },
  {
    id: "4",
    name: "DDoS Attack Mitigation",
    description: "Response plan for distributed denial of service attacks",
    category: "cyber",
    severity: "high",
    estimatedTime: "1-3 hours",
    lastUpdated: "2024-01-18",
    usageCount: 15,
    steps: [
      { id: 1, title: "Detect and Confirm", description: "Verify DDoS attack", duration: "10 min", responsible: "SOC" },
      { id: 2, title: "Enable DDoS Protection", description: "Activate cloud protection services", duration: "15 min", responsible: "Network Team" },
      { id: 3, title: "Scale Infrastructure", description: "Scale up to absorb traffic", duration: "30 min", responsible: "DevOps" },
      { id: 4, title: "Block Malicious IPs", description: "Implement IP blocking rules", duration: "20 min", responsible: "Security" },
      { id: 5, title: "Monitor and Adjust", description: "Continuous monitoring and adjustment", duration: "1 hour", responsible: "SOC" }
    ]
  },
  {
    id: "5",
    name: "Fire Emergency Response",
    description: "Emergency procedures for fire incidents in data centers",
    category: "operational",
    severity: "critical",
    estimatedTime: "1-2 hours",
    lastUpdated: "2024-01-05",
    usageCount: 3,
    steps: [
      { id: 1, title: "Fire Detection", description: "Verify fire alarm activation", duration: "2 min", responsible: "Security" },
      { id: 2, title: "Emergency Shutdown", description: "Initiate controlled shutdown of equipment", duration: "10 min", responsible: "Facilities" },
      { id: 3, title: "Evacuation", description: "Evacuate personnel", duration: "15 min", responsible: "Security" },
      { id: 4, title: "Fire Suppression", description: "Activate fire suppression systems", duration: "5 min", responsible: "Facilities" },
      { id: 5, title: "Assessment", description: "Assess damage and plan recovery", duration: "30 min", responsible: "Facilities" }
    ]
  },
  {
    id: "6",
    name: "Database Failure Recovery",
    description: "Recovery procedures for database failures",
    category: "data",
    severity: "high",
    estimatedTime: "1-2 hours",
    lastUpdated: "2024-01-12",
    usageCount: 18,
    steps: [
      { id: 1, title: "Identify Failure Type", description: "Determine database issue", duration: "10 min", responsible: "DBA Team" },
      { id: 2, title: "Failover to Replica", description: "Promote replica if available", duration: "15 min", responsible: "DevOps" },
      { id: 3, title: "Restore from Backup", description: "If needed, restore from backup", duration: "45 min", responsible: "DBA Team" },
      { id: 4, title: "Verify Data Integrity", description: "Check data consistency", duration: "20 min", responsible: "DBA Team" },
      { id: 5, title: "Resume Operations", description: "Bring application back online", duration: "10 min", responsible: "IT Operations" }
    ]
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "cyber": return <Lock className="h-5 w-5" />;
    case "infrastructure": return <Server className="h-5 w-5" />;
    case "data": return <Database className="h-5 w-5" />;
    case "operational": return <Flame className="h-5 w-5" />;
    default: return <FileText className="h-5 w-5" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "cyber": return "text-red-500 bg-red-50 dark:bg-red-950";
    case "infrastructure": return "text-orange-500 bg-orange-50 dark:bg-orange-950";
    case "data": return "text-blue-500 bg-blue-50 dark:bg-blue-950";
    case "operational": return "text-yellow-500 bg-yellow-50 dark:bg-yellow-950";
    default: return "text-gray-500 bg-gray-50";
  }
};

export default function Playbooks() {
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPlaybooks = playbooks.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              Crisis Playbook Library
            </h1>
            <p className="text-muted-foreground mt-1">
              Pre-defined response templates for rapid crisis management
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Playbook
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Playbooks</p>
                  <p className="text-3xl font-bold">{playbooks.length}</p>
                </div>
                <BookOpen className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-3xl font-bold text-red-500">
                    {playbooks.filter(p => p.severity === "critical").length}
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
                  <p className="text-sm text-muted-foreground">Total Deployments</p>
                  <p className="text-3xl font-bold text-green-500">
                    {playbooks.reduce((acc, p) => acc + p.usageCount, 0)}
                  </p>
                </div>
                <Zap className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-3xl font-bold">4</p>
                </div>
                <Shield className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="library" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library">Playbook Library</TabsTrigger>
            <TabsTrigger value="details">Playbook Details</TabsTrigger>
          </TabsList>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search playbooks..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {["all", "cyber", "infrastructure", "data", "operational"].map((cat) => (
                  <Button 
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaybooks.map((playbook) => (
                <Card 
                  key={playbook.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedPlaybook(playbook)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${getCategoryColor(playbook.category)}`}>
                        {getCategoryIcon(playbook.category)}
                      </div>
                      <Badge variant={playbook.severity === "critical" ? "destructive" : "outline"}>
                        {playbook.severity}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{playbook.name}</CardTitle>
                    <CardDescription>{playbook.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {playbook.estimatedTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-4 w-4" />
                        Used {playbook.usageCount} times
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Updated: {playbook.lastUpdated}
                      </span>
                      <Button size="sm" variant="outline" className="gap-1">
                        View <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {selectedPlaybook ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${getCategoryColor(selectedPlaybook.category)}`}>
                        {getCategoryIcon(selectedPlaybook.category)}
                      </div>
                      <div>
                        <CardTitle>{selectedPlaybook.name}</CardTitle>
                        <CardDescription>{selectedPlaybook.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button className="gap-2">
                        <Play className="h-4 w-4" />
                        Deploy Playbook
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Est. Time: {selectedPlaybook.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Used {selectedPlaybook.usageCount} times</span>
                    </div>
                    <Badge variant={selectedPlaybook.severity === "critical" ? "destructive" : "outline"}>
                      {selectedPlaybook.severity} severity
                    </Badge>
                  </div>

                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Response Steps
                  </h3>
                  <div className="space-y-4">
                    {selectedPlaybook.steps.map((step, idx) => (
                      <div key={step.id} className="flex gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{step.title}</h4>
                            <Badge variant="outline">{step.duration}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            Responsible: {step.responsible}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline">
                      Edit Playbook
                    </Button>
                    <Button className="gap-2">
                      <Play className="h-4 w-4" />
                      Deploy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <p className="text-muted-foreground">Select a playbook from the library to view details</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
