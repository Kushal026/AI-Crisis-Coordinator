import { Link } from "react-router-dom";
import { Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export const MobileActions = () => {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex items-center justify-center md:hidden px-4">
      <div className="w-full max-w-3xl rounded-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border border-border/50 px-4 py-2 flex gap-3 items-center justify-center">
        <Link to="/new-incident" className="w-1/2">
          <Button className="w-full gap-2" aria-label="Report new incident">
            <Plus className="h-4 w-4" /> Report
          </Button>
        </Link>
        <Link to="/chat" className="w-1/2">
          <Button variant="outline" className="w-full gap-2" aria-label="Open AI assistant">
            <MessageSquare className="h-4 w-4" /> Assistance
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default MobileActions;
