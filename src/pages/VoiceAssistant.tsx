import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

export default function VoiceAssistant() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to chat after a brief moment
    const timer = setTimeout(() => {
      // Don't redirect automatically, just show the message
    }, 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Voice Assistant</h2>
            <p className="text-muted-foreground">
              Voice functionality has been integrated directly into the AI Chat
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="font-medium">New Experience</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              You can now use voice input directly in the AI Chat. Simply click the microphone button 
              to start speaking, and your words will be transcribed in real-time.
            </p>
            <ul className="text-sm text-muted-foreground text-left space-y-2">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Speak naturally and see your words appear
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                AI understands context from voice input
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Seamless voice-to-text experience
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate("/chat")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              <Mic className="h-4 w-4 mr-2" />
              Try Voice Chat
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
