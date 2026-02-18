import { Incident, ChatMessage, DashboardStats, Technician } from "@/types";

const STORAGE_KEYS = {
  incidents: "ai_crisis_incidents",
  technicians: "ai_crisis_technicians",
};

// Initialize default technicians if not present
const initializeDefaultTechnicians = (): Technician[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.technicians);
  if (stored) return JSON.parse(stored);

  const now = new Date().toISOString();
  const defaultTechnicians: Technician[] = [
    { id: "1", name: "John Smith", skill: "electrical", availability: "available", created_at: now, updated_at: now },
    { id: "2", name: "Sarah Johnson", skill: "plumbing", availability: "available", created_at: now, updated_at: now },
    { id: "3", name: "Mike Davis", skill: "hvac", availability: "available", created_at: now, updated_at: now },
    { id: "4", name: "Emily Chen", skill: "network", availability: "available", created_at: now, updated_at: now },
    { id: "5", name: "Robert Wilson", skill: "electrical", availability: "busy", created_at: now, updated_at: now },
    { id: "6", name: "Lisa Brown", skill: "plumbing", availability: "available", created_at: now, updated_at: now },
    { id: "7", name: "David Lee", skill: "hvac", availability: "available", created_at: now, updated_at: now },
    { id: "8", name: "Anna Martinez", skill: "network", availability: "busy", created_at: now, updated_at: now },
  ];

  localStorage.setItem(STORAGE_KEYS.technicians, JSON.stringify(defaultTechnicians));
  return defaultTechnicians;
};

// Initialize sample incidents if not present
const initializeDefaultIncidents = (): Incident[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.incidents);
  if (stored) return JSON.parse(stored);

  const now = new Date().toISOString();
  const defaultIncidents: Incident[] = [
    {
      id: "1",
      incident_id: "INC001",
      title: "Power Outage in Building A",
      description: "Complete power failure affecting the entire east wing",
      location: "Building A, Floor 2",
      category: "electrical",
      priority: "high",
      status: "open",
      assigned_technician: "John Smith",
      assignment_reason: "AI-selected based on skill match (electrical) and availability",
      required_skill: "electrical",
      sop_steps: ["Initial assessment and safety check", "Identify root cause using diagnostic tools", "Apply standard troubleshooting procedures", "Implement solution or escalate if needed", "Verify resolution and document findings"],
      created_at: now,
      updated_at: now,
    },
    {
      id: "2",
      incident_id: "INC002",
      title: "Water Leak in Conference Room",
      description: "Water dripping from ceiling in conference room B",
      location: "Building B, Floor 1",
      category: "plumbing",
      priority: "medium",
      status: "in-progress",
      assigned_technician: "Sarah Johnson",
      assignment_reason: "AI-selected based on skill match (plumbing) and availability",
      required_skill: "plumbing",
      sop_steps: ["Initial assessment and safety check", "Identify root cause using diagnostic tools", "Apply standard troubleshooting procedures", "Implement solution or escalate if needed", "Verify resolution and document findings"],
      created_at: now,
      updated_at: now,
    },
    {
      id: "3",
      incident_id: "INC003",
      title: "HVAC System Failure",
      description: "Air conditioning not working in server room",
      location: "Building A, Floor 3",
      category: "hvac",
      priority: "high",
      status: "open",
      assigned_technician: "Mike Davis",
      assignment_reason: "AI-selected based on skill match (hvac) and availability",
      required_skill: "hvac",
      sop_steps: ["Initial assessment and safety check", "Identify root cause using diagnostic tools", "Apply standard troubleshooting procedures", "Implement solution or escalate if needed", "Verify resolution and document findings"],
      created_at: now,
      updated_at: now,
    },
  ];

  localStorage.setItem(STORAGE_KEYS.incidents, JSON.stringify(defaultIncidents));
  return defaultIncidents;
};

// Generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Generate incident ID
const generateIncidentId = (): string => {
  const incidents = getIncidents();
  const num = incidents.length + 1;
  return `INC${num.toString().padStart(3, "0")}`;
};

/**
 * Submit a new incident
 */
export const submitIncident = async (incidentData: Partial<Incident>): Promise<Incident> => {
  const technicians = getTechnicians();
  
  // Find best available technician by skill match
  const assignedTech = technicians.find(
    (t) => t.availability === "available" && t.skill === (incidentData.category || "other")
  );

  const newIncident: Incident = {
    id: generateId(),
    incident_id: generateIncidentId(),
    title: incidentData.title || "",
    description: incidentData.description || "",
    location: incidentData.location || "",
    category: incidentData.category || "other",
    priority: incidentData.priority || "medium",
    status: "open",
    assigned_technician: assignedTech?.name || null,
    assignment_reason: assignedTech
      ? `AI-selected based on skill match (${assignedTech.skill}) and availability`
      : "No available technician with matching skill",
    required_skill: incidentData.category,
    sop_steps: [
      "Initial assessment and safety check",
      "Identify root cause using diagnostic tools",
      "Apply standard troubleshooting procedures",
      "Implement solution or escalate if needed",
      "Verify resolution and document findings",
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const incidents = getIncidents();
  incidents.unshift(newIncident);
  localStorage.setItem(STORAGE_KEYS.incidents, JSON.stringify(incidents));

  return newIncident;
};

/**
 * Get all incidents
 */
export const getIncidents = (): Incident[] => {
  initializeDefaultTechnicians();
  const stored = localStorage.getItem(STORAGE_KEYS.incidents);
  if (!stored) {
    return initializeDefaultIncidents();
  }
  return JSON.parse(stored);
};

/**
 * Get incident by ID
 */
export const getIncidentById = async (id: string): Promise<Incident | null> => {
  const incidents = getIncidents();
  return incidents.find((i) => i.incident_id === id || i.id === id) || null;
};

/**
 * Get all technicians
 */
export const getTechnicians = (): Technician[] => {
  return initializeDefaultTechnicians();
};

/**
 * Chat with AI agent (mock for now)
 */
export const chatWithAgent = async (message: string, conversationHistory: ChatMessage[]): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const responses = [
    "I've analyzed your request. Based on the incident details, I recommend escalating this to a senior technician with electrical expertise.",
    "The current status shows high-priority incidents. Would you like me to help prioritize them based on business impact?",
    "I've reviewed the SOP for this type of incident. The key steps include safety verification, diagnostic assessment, and targeted intervention.",
    "Based on historical data, similar incidents were resolved in an average of 2.5 hours. I can assign the most suitable technician now.",
    "I can help with that. Let me check the current workload of available technicians and suggest the best assignment.",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = (): DashboardStats => {
  const incidents = getIncidents();
  const technicians = getTechnicians();

  return {
    totalIncidents: incidents.length,
    highPriorityIncidents: incidents.filter((i) => i.priority === "high").length,
    availableTechnicians: technicians.filter((t) => t.availability === "available").length,
    avgResolutionTime: "2.5 hrs",
  };
};

/**
 * Update incident status
 */
export const updateIncidentStatus = async (id: string, status: string): Promise<Incident | null> => {
  const incidents = getIncidents();
  const index = incidents.findIndex((i) => i.id === id || i.incident_id === id);
  
  if (index === -1) return null;
  
  incidents[index].status = status;
  localStorage.setItem(STORAGE_KEYS.incidents, JSON.stringify(incidents));
  
  return incidents[index];
};

/**
 * Update technician availability
 */
export const updateTechnicianAvailability = async (id: string, availability: string): Promise<Technician | null> => {
  const technicians = getTechnicians();
  const index = technicians.findIndex((t) => t.id === id);
  
  if (index === -1) return null;
  
  technicians[index].availability = availability as "available" | "busy";
  localStorage.setItem(STORAGE_KEYS.technicians, JSON.stringify(technicians));
  
  return technicians[index];
};
