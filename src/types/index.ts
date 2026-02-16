export type Priority = "low" | "medium" | "high";
export type Status = "open" | "in-progress" | "closed";
export type Category = "electrical" | "networking" | "mechanical" | "security" | "IT support" | "other";
export type Availability = "available" | "busy";

export interface Technician {
  id: string;
  name: string;
  skill: string;
  availability: Availability;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: string;
  incident_id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: string;
  status: string;
  assigned_technician?: string | null;
  assignment_reason?: string | null;
  required_skill?: string | null;
  sop_steps?: string[] | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalIncidents: number;
  highPriorityIncidents: number;
  availableTechnicians: number;
  avgResolutionTime: string;
}
