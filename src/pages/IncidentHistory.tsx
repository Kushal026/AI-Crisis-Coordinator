import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIncidents } from "@/context/IncidentContext";
import { Navbar } from "@/components/Navbar";
import { TableSkeleton } from "@/components/LoadingSkeleton";

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "bg-destructive text-destructive-foreground";
    case "medium": return "bg-warning text-warning-foreground";
    case "low": return "bg-success text-success-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "closed": return "bg-success/20 text-success-foreground border-success";
    case "in-progress": return "bg-info/20 text-info-foreground border-info";
    case "open": return "bg-warning/20 text-warning-foreground border-warning";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function IncidentHistory() {
  const { incidents, isLoading } = useIncidents();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.incident_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === "all" || incident.priority === filterPriority;
      const matchesCategory = filterCategory === "all" || incident.category === filterCategory;
      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [incidents, searchTerm, filterPriority, filterCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Incident History</h1>
          <p className="text-muted-foreground">View and manage all reported incidents</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by title or ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="mechanical">Mechanical</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="IT support">IT Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-6"><TableSkeleton /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">No incidents found</TableCell>
                    </TableRow>
                  ) : (
                    filteredIncidents.map((incident) => (
                      <TableRow key={incident.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{incident.incident_id}</TableCell>
                        <TableCell className="font-medium max-w-xs truncate">{incident.title}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(incident.priority)} variant="secondary">{incident.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(incident.status)} variant="outline">{incident.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{incident.assigned_technician || "Unassigned"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(incident.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/incident/${incident.incident_id}`}>
                            <Button variant="ghost" size="sm" className="gap-2"><Eye className="h-4 w-4" />View</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
