import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIncidents } from "@/context/IncidentContext";
import { chatWithAgent } from "@/api/mockApi";
import { Navbar } from "@/components/Navbar";
import { ChatMessage } from "@/types";

export default function Chat() {
  const { chatHistory, addChatMessage, incidents } = useIncidents();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const location = useLocation();
  useEffect(() => {
    // Accept prefilled message passed via navigate state (from VoiceAssistant)
    if ((location as any).state && (location as any).state.prefill) {
      setInput((location as any).state.prefill);
      // clear state so repeated navigations don't overwrite
      try {
        (window.history.replaceState as any)({ ...window.history.state, usr: undefined }, "");
      } catch (e) {}
    }
  }, [location]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setInput("");
    setIsTyping(true);

    try {
      const response = await chatWithAgent(input, chatHistory);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      addChatMessage(aiMessage);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl flex gap-4">
        {/* Sidebar with Recent Incidents */}
        <aside className="hidden lg:block w-64 space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Recent Incidents</h3>
            <div className="space-y-2">
              {incidents.slice(0, 5).map((incident) => (
                <button
                  key={incident.id}
                  className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                  onClick={() => setInput(`Tell me about incident ${incident.id}`)}
                >
                  <div className="font-medium truncate">{incident.title}</div>
                  <div className="text-xs text-muted-foreground">{incident.id}</div>
                </button>
              ))}
            </div>
          </Card>
        </aside>

        {/* Main Chat Area */}
        <Card className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b flex items-center gap-3">
            <Avatar className="bg-gradient-to-br from-primary to-secondary">
              <AvatarFallback className="bg-transparent">
                <Bot className="h-5 w-5 text-white" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">AI Coordinator Agent</h2>
              <p className="text-sm text-muted-foreground">Always here to help</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <Bot className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium">Welcome to AI Assistant</p>
                  <p className="text-sm mt-2">Ask me anything about incidents, assignments, or procedures</p>
                </div>
              )}
              
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="bg-gradient-to-br from-primary to-secondary shrink-0">
                      <AvatarFallback className="bg-transparent">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-primary to-secondary text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="bg-muted shrink-0">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="bg-gradient-to-br from-primary to-secondary shrink-0">
                    <AvatarFallback className="bg-transparent">
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={isTyping || !input.trim()}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
