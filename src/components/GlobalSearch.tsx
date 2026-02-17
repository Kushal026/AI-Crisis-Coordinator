import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Users, X, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Incident, Technician } from "@/types";

interface SearchResult {
  type: "incident" | "technician";
  id: string;
  title: string;
  subtitle: string;
  priority?: string;
  status?: string;
}

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && incidents.length === 0) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (query.trim()) {
      searchData(query);
    } else {
      setResults([]);
    }
  }, [query]);

  const loadData = async () => {
    try {
      const [incidentsRes, techniciansRes] = await Promise.all([
        supabase.from("incidents").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("technicians").select("*").order("name"),
      ]);
      setIncidents((incidentsRes.data || []) as Incident[]);
      setTechnicians((techniciansRes.data || []) as Technician[]);
    } catch (error) {
      console.error("Failed to load search data:", error);
    }
  };

  const searchData = async (searchQuery: string) => {
    setIsLoading(true);
    const queryLower = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search incidents
    const matchedIncidents = incidents.filter(
      (inc) =>
        inc.title.toLowerCase().includes(queryLower) ||
        inc.description.toLowerCase().includes(queryLower) ||
        inc.incident_id.toLowerCase().includes(queryLower) ||
        inc.location.toLowerCase().includes(queryLower) ||
        inc.category.toLowerCase().includes(queryLower)
    );

    matchedIncidents.slice(0, 5).forEach((inc) => {
      searchResults.push({
        type: "incident",
        id: inc.id,
        title: inc.title,
        subtitle: `${inc.incident_id} • ${inc.location}`,
        priority: inc.priority,
        status: inc.status,
      });
    });

    // Search technicians
    const matchedTechnicians = technicians.filter(
      (tech) =>
        tech.name.toLowerCase().includes(queryLower) ||
        tech.skill.toLowerCase().includes(queryLower)
    );

    matchedTechnicians.slice(0, 5).forEach((tech) => {
      searchResults.push({
        type: "technician",
        id: tech.id,
        title: tech.name,
        subtitle: `${tech.skill} • ${tech.availability}`,
        status: tech.availability,
      });
    });

    setResults(searchResults);
    setIsLoading(false);
  };

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    if (result.type === "incident") {
      navigate(`/incident/${result.id}`);
    } else {
      navigate("/technicians");
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "open": return "bg-blue-500";
      case "in-progress": return "bg-amber-500";
      case "closed": return "bg-green-500";
      case "available": return "bg-green-500";
      case "busy": return "bg-amber-500";
      default: return "bg-muted";
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 sm:w-64 sm:h-10 sm:justify-start sm:px-3 sm:text-sm"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Search incidents, technicians...</span>
        <span className="inline sm:hidden">Search</span>
        <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="border-b px-3" cmdk-input-wrapper="">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput 
            placeholder="Search incidents, technicians..." 
            value={query}
            onValueChange={setQuery}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-3"
            >
              <X className="h-4 w-4 opacity-50 hover:opacity-100" />
            </button>
          )}
        </div>
        <CommandList className="max-h-[300px] overflow-y-auto p-2">
          {query === "" && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              <p>Start typing to search...</p>
              <p className="text-xs mt-1">Search incidents by title, ID, location, or category</p>
            </div>
          )}
          
          {query !== "" && results.length === 0 && !isLoading && (
            <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
              No results found for "{query}"
            </CommandEmpty>
          )}

          {results.filter(r => r.type === "incident").length > 0 && (
            <CommandGroup heading="Incidents">
              {results
                .filter(r => r.type === "incident")
                .map((result) => (
                  <CommandItem
                    key={result.id}
                    value={`${result.title} ${result.subtitle}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        {result.priority && (
                          <Badge className={`text-[10px] h-5 ${getPriorityColor(result.priority)}`}>
                            {result.priority}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    {result.status && (
                      <Badge variant="outline" className={`text-[10px] h-5 ${getStatusColor(result.status)} text-white`}>
                        {result.status}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </CommandItem>
                ))}
            </CommandGroup>
          )}

          {results.filter(r => r.type === "incident").length > 0 && results.filter(r => r.type === "technician").length > 0 && (
            <CommandSeparator />
          )}

          {results.filter(r => r.type === "technician").length > 0 && (
            <CommandGroup heading="Technicians">
              {results
                .filter(r => r.type === "technician")
                .map((result) => (
                  <CommandItem
                    key={result.id}
                    value={`${result.title} ${result.subtitle}`}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    {result.status && (
                      <Badge variant="outline" className={`text-[10px] h-5 ${getStatusColor(result.status)} text-white`}>
                        {result.status}
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </CommandItem>
                ))}
            </CommandGroup>
          )}
        </CommandList>

        {query !== "" && results.length > 0 && (
          <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Press <kbd className="font-mono">↵</kbd> to select</span>
            <span><kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to navigate</span>
          </div>
        )}
      </CommandDialog>
    </>
  );
}
