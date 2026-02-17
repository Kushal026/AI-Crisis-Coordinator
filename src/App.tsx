import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { IncidentProvider } from "./context/IncidentContext";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Notifications from "@/components/Notifications";
import Dashboard from "./pages/Dashboard";
import NewIncident from "./pages/NewIncident";
import Chat from "./pages/Chat";
import VoiceAssistant from "./pages/VoiceAssistant";
import IncidentHistory from "./pages/IncidentHistory";
import IncidentDetails from "./pages/IncidentDetails";
import TechnicianDirectory from "./pages/TechnicianDirectory";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import CrisisPrediction from "./pages/CrisisPrediction";
import AutoAllocation from "./pages/AutoAllocation";
import GeoMap from "./pages/GeoMap";
import Simulation from "./pages/Simulation";
import Playbooks from "./pages/Playbooks";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <><Notifications />{children}</>;
};

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/" element={<ProtectedRoute><IncidentProvider><Dashboard /></IncidentProvider></ProtectedRoute>} />
            <Route path="/new-incident" element={<ProtectedRoute><IncidentProvider><NewIncident /></IncidentProvider></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><IncidentProvider><Chat /></IncidentProvider></ProtectedRoute>} />
            <Route path="/voice" element={<ProtectedRoute><IncidentProvider><VoiceAssistant /></IncidentProvider></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><IncidentProvider><IncidentHistory /></IncidentProvider></ProtectedRoute>} />
            <Route path="/incident/:id" element={<ProtectedRoute><IncidentProvider><IncidentDetails /></IncidentProvider></ProtectedRoute>} />
            <Route path="/technicians" element={<ProtectedRoute><TechnicianDirectory /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/prediction" element={<ProtectedRoute><CrisisPrediction /></ProtectedRoute>} />
            <Route path="/allocation" element={<ProtectedRoute><AutoAllocation /></ProtectedRoute>} />
            <Route path="/geo-map" element={<ProtectedRoute><GeoMap /></ProtectedRoute>} />
            <Route path="/simulation" element={<ProtectedRoute><Simulation /></ProtectedRoute>} />
            <Route path="/playbooks" element={<ProtectedRoute><Playbooks /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
