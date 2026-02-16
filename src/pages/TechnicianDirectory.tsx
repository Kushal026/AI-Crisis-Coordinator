import { useEffect, useState } from "react";
import { Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getTechnicians } from "@/api/mockApi";
import { Technician } from "@/types";
import { Navbar } from "@/components/Navbar";
import { CardSkeleton } from "@/components/LoadingSkeleton";
import { supabase } from "@/integrations/supabase/client";

export default function TechnicianDirectory() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTechnicians = async () => {
    try {
      const data = await getTechnicians();
      setTechnicians(data);
    } catch (error) {
      console.error("Failed to load technicians:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();

    const channel = supabase
      .channel("technicians-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "technicians" }, () => {
        loadTechnicians();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Technician Directory</h1>
          <p className="text-muted-foreground">View all available technicians and their current status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            technicians.map((tech) => (
              <Card key={tech.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-lg">
                        {tech.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{tech.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">{tech.skill}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="outline" className={`capitalize ${tech.availability === "available" ? "bg-success/20 text-success-foreground border-success" : "bg-destructive/20 text-destructive-foreground border-destructive"}`}>
                      <Circle className={`h-2 w-2 mr-1 fill-current ${tech.availability === "available" ? "text-success" : "text-destructive"}`} />
                      {tech.availability}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium">Skill</span>
                    <Badge variant="secondary" className="capitalize">{tech.skill}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
