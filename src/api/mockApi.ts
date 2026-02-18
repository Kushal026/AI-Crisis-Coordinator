import { Incident, ChatMessage, DashboardStats, Technician } from "@/types";
import * as localApi from "./localApi";

/**
 * Submit a new incident
 */
export const submitIncident = async (incidentData: Partial<Incident>): Promise<Incident> => {
  return await localApi.submitIncident(incidentData);
};

/**
 * Get all incidents
 */
export const getIncidents = async (): Promise<Incident[]> => {
  return localApi.getIncidents();
};

/**
 * Get incident by ID (incident_id like INC001 or uuid)
 */
export const getIncidentById = async (id: string): Promise<Incident | null> => {
  return await localApi.getIncidentById(id);
};

/**
 * Get all technicians
 */
export const getTechnicians = async (): Promise<Technician[]> => {
  return localApi.getTechnicians();
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
export const getDashboardStats = async (): Promise<DashboardStats> => {
  return localApi.getDashboardStats();
};

/**
 * Update incident status
 */
export const updateIncidentStatus = async (id: string, status: string): Promise<Incident | null> => {
  return await localApi.updateIncidentStatus(id, status);
};

/**
 * Update technician availability
 */
export const updateTechnicianAvailability = async (id: string, availability: string): Promise<Technician | null> => {
  return await localApi.updateTechnicianAvailability(id, availability);
};
