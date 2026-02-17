import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export const Notifications = () => {
  useEffect(() => {
    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          const type = payload.eventType || payload.type || payload.event;
          const record = payload.new || payload.record || payload;
          if (!record) return;

          const title = record.title || `Incident ${record.id}`;
          const msg = type === "INSERT" ? "New incident reported" : type === "UPDATE" ? "Incident updated" : "Incident event";

          toast(title, {
            description: msg,
            action: (
              <button
                onClick={() => window.location.assign(`/incident/${record.id}`)}
                className="underline text-primary"
              >
                View
              </button>
            ),
          });
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return null;
};

export default Notifications;
