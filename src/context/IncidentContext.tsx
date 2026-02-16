import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Incident, ChatMessage } from "@/types";
import { getIncidents } from "@/api/mockApi";
import { supabase } from "@/integrations/supabase/client";

interface IncidentContextType {
  incidents: Incident[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
  refreshIncidents: () => Promise<void>;
  addIncident: (incident: Incident) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshIncidents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getIncidents();
      setIncidents(data);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addIncident = (incident: Incident) => {
    setIncidents((prev) => [incident, ...prev]);
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatHistory((prev) => [...prev, message]);
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  useEffect(() => {
    refreshIncidents();

    // Real-time subscription for incidents
    const channel = supabase
      .channel("incidents-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        () => {
          refreshIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshIncidents]);

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        chatHistory,
        isLoading,
        refreshIncidents,
        addIncident,
        addChatMessage,
        clearChat,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error("useIncidents must be used within an IncidentProvider");
  }
  return context;
};
