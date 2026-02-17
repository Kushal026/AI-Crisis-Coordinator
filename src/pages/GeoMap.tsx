import { useState } from "react";
import { 
  MapPin, 
  AlertTriangle, 
  Activity, 
  Users, 
  Server,
  Globe,
  Lock,
  Cloud,
  DollarSign,
  Flame,
  Filter,
  Layers,
  RefreshCw,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";

interface CrisisLocation {
  id: string;
  location: string;
  lat: number;
  lng: number;
  type: "cyber" | "infrastructure" | "financial" | "natural";
  severity: "low" | "medium" | "high" | "critical";
  incidents: number;
  riskScore: number;
  teamsDeployed: number;
  lastUpdate: string;
}

interface TeamMovement {
  id: string;
  teamName: string;
  from: string;
  to: string;
  status: "en_route" | "on_site" | "returning";
  eta: string;
}

const crisisLocations: CrisisLocation[] = [
  { id: "1", location: "New York HQ", lat: 40.7128, lng: -74.0060, type: "cyber", severity: "critical", incidents: 5, riskScore: 92, teamsDeployed: 3, lastUpdate: "2 min ago" },
  { id: "2", location: "San Francisco Data Center", lat: 37.7749, lng: -122.4194, type: "infrastructure", severity: "high", incidents: 3, riskScore: 78, teamsDeployed: 2, lastUpdate: "5 min ago" },
  { id: "3", location: "Chicago Office", lat: 41.8781, lng: -87.6298, type: "financial", severity: "medium", incidents: 2, riskScore: 55, teamsDeployed: 1, lastUpdate: "12 min ago" },
  { id: "4", location: "Austin Branch", lat: 30.2672, lng: -97.7431, type: "cyber", severity: "low", incidents: 1, riskScore: 32, teamsDeployed: 1, lastUpdate: "25 min ago" },
  { id: "5", location: "Seattle Hub", lat: 47.6062, lng: -122.3321, type: "infrastructure", severity: "high", incidents: 4, riskScore: 75, teamsDeployed: 2, lastUpdate: "8 min ago" },
  { id: "6", location: "Boston Research", lat: 42.3601, lng: -71.0589, type: "natural", severity: "medium", incidents: 2, riskScore: 48, teamsDeployed: 1, lastUpdate: "15 min ago" }
];

const teamMovements: TeamMovement[] = [
  { id: "1", teamName: "Alpha Team", from: "HQ", to: "NYC Data Center", status: "en_route", eta: "15 min" },
  { id: "2", teamName: "Beta Team", from: "Chicago", to: "St. Louis", status: "on_site", eta: "Active" },
  { id: "3", teamName: "Gamma Team", from: "Austin", to: "Houston", status: "returning", eta: "30 min" },
  { id: "4", teamName: "Delta Team", from: "Seattle", to: "Portland", status: "en_route", eta: "45 min" }
];

const regionRisks = [
  { region: "Northeast", risk: 85, incidents: 12, type: "cyber" },
  { region: "Southeast", risk: 45, incidents: 5, type: "infrastructure" },
  { region: "Midwest", risk: 62, incidents: 8, type: "financial" },
  { region: "Southwest", risk: 38, incidents: 3, type: "natural" },
  { region: "West Coast", risk: 72, incidents: 10, type: "cyber" }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical": return "bg-red-500";
    case "high": return "bg-orange-500";
    case "medium": return "bg-yellow-500";
    default: return "bg-green-500";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "cyber": return <Lock className="h-4 w-4" />;
    case "infrastructure": return <Server className="h-4 w-4" />;
    case "financial": return <DollarSign className="h-4 w-4" />;
    case "natural": return <Flame className="h-4 w-4" />;
    default: return <Globe className="h-4 w-4" />;
  }
};

export default function GeoMap() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<CrisisLocation | null>(null);

  const filteredLocations = selectedFilter === "all" 
    ? crisisLocations 
    : crisisLocations.filter(l => l.type === selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Globe className="h-8 w-8 text-blue-500" />
              Geo-Intelligence Map
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time crisis visualization and team deployment tracking
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button className="gap-2">
              <Zap className="h-4 w-4" />
              Live Mode
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Regions</p>
                  <p className="text-3xl font-bold">{crisisLocations.length}</p>
                </div>
                <MapPin className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Alerts</p>
                  <p className="text-3xl font-bold text-red-500">
                    {crisisLocations.filter(l => l.severity === "critical").length}
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
                  <p className="text-sm text-muted-foreground">Teams Deployed</p>
                  <p className="text-3xl font-bold text-green-500">{teamMovements.length}</p>
                </div>
                <Users className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-3xl font-bold text-purple-500">18 min</p>
                </div>
                <Activity className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="map" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">Crisis Map</TabsTrigger>
            <TabsTrigger value="teams">Team Movements</TabsTrigger>
            <TabsTrigger value="regions">Region Analysis</TabsTrigger>
          </TabsList>

          {/* Crisis Map Tab */}
          <TabsContent value="map" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Filters */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant={selectedFilter === "all" ? "default" : "outline"} 
                      className="w-full justify-start"
                      onClick={() => setSelectedFilter("all")}
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      All Types
                    </Button>
                    <Button 
                      variant={selectedFilter === "cyber" ? "default" : "outline"} 
                      className="w-full justify-start"
                      onClick={() => setSelectedFilter("cyber")}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Cyber
                    </Button>
                    <Button 
                      variant={selectedFilter === "infrastructure" ? "default" : "outline"} 
                      className="w-full justify-start"
                      onClick={() => setSelectedFilter("infrastructure")}
                    >
                      <Server className="h-4 w-4 mr-2" />
                      Infrastructure
                    </Button>
                    <Button 
                      variant={selectedFilter === "financial" ? "default" : "outline"} 
                      className="w-full justify-start"
                      onClick={() => setSelectedFilter("financial")}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Financial
                    </Button>
                    <Button 
                      variant={selectedFilter === "natural" ? "default" : "outline"} 
                      className="w-full justify-start"
                      onClick={() => setSelectedFilter("natural")}
                    >
                      <Flame className="h-4 w-4 mr-2" />
                      Natural
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Map Area */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Live Crisis Map</CardTitle>
                  <CardDescription>
                    Interactive map showing crisis clusters and severity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Simulated Map */}
                  <div className="relative h-[500px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg overflow-hidden">
                    {/* Grid overlay */}
                    <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-20">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="border border-blue-300" />
                      ))}
                    </div>
                    
                    {/* Map markers */}
                    {filteredLocations.map((location) => (
                      <div
                        key={location.id}
                        className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: `${((location.lng + 130) / 70) * 100}%`,
                          top: `${((50 - location.lat) / 30) * 100}%`
                        }}
                        onClick={() => setSelectedLocation(location)}
                      >
                        <div className={`relative ${getSeverityColor(location.severity)} rounded-full p-2 shadow-lg hover:scale-110 transition-transform`}>
                          {getTypeIcon(location.type)}
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-gray-500" />
                        </div>
                        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
                          {location.incidents} incidents
                        </div>
                      </div>
                    ))}

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
                      <p className="text-xs font-semibold mb-2">Severity</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="text-xs">Critical</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full" />
                          <span className="text-xs">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                          <span className="text-xs">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="text-xs">Low</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Location Details */}
                  {selectedLocation && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{selectedLocation.location}</h3>
                          <p className="text-sm text-muted-foreground">
                            Risk Score: {selectedLocation.riskScore} | Teams: {selectedLocation.teamsDeployed}
                          </p>
                        </div>
                        <Badge className={getSeverityColor(selectedLocation.severity)}>
                          {selectedLocation.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Team Movements Tab */}
          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Real-Time Team Movements
                </CardTitle>
                <CardDescription>
                  Track response teams and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMovements.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{team.teamName}</p>
                          <p className="text-sm text-muted-foreground">
                            {team.from} → {team.to}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant="outline"
                          className={
                            team.status === "en_route" ? "text-blue-500" :
                            team.status === "on_site" ? "text-green-500" :
                            "text-gray-500"
                          }
                        >
                          {team.status === "en_route" ? "🚗 En Route" :
                           team.status === "on_site" ? "✅ On Site" :
                           "🔄 Returning"}
                        </Badge>
                        <span className="text-sm font-medium">{team.eta}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Region Analysis Tab */}
          <TabsContent value="regions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Region Risk Scores</CardTitle>
                  <CardDescription>
                    Heat intensity visualization by region
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {regionRisks.map((region, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{region.region}</span>
                          <span className="text-sm text-muted-foreground">
                            {region.incidents} incidents
                          </span>
                        </div>
                        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              region.risk > 70 ? "bg-red-500" :
                              region.risk > 50 ? "bg-orange-500" :
                              "bg-yellow-500"
                            }`}
                            style={{ width: `${region.risk}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Risk: {region.risk}%</span>
                          <span className="capitalize">{region.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Radius Analysis</CardTitle>
                  <CardDescription>
                    Disaster impact zones and coverage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {crisisLocations.slice(0, 4).map((location) => (
                      <div key={location.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(location.type)}
                            <span className="font-medium">{location.location}</span>
                          </div>
                          <Badge variant="outline">{location.type}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Radius</p>
                            <p className="font-medium">{Math.round(location.riskScore / 10)} km</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Affected</p>
                            <p className="font-medium">{location.incidents * 250}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Coverage</p>
                            <p className="font-medium">{100 - Math.round(location.riskScore / 3)}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
