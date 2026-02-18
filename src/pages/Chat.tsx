import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIncidents } from "@/context/IncidentContext";
import { chatWithAgent } from "@/api/mockApi";
import { ChatMessage } from "@/types";
import { VoiceWidget } from "@/components/VoiceWidget";
import Sidebar from "@/components/Sidebar";

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
    if ((location as any).state && (location as any).state.prefill) {
      setInput((location as any).state.prefill);
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
    <Sidebar>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Sidebar with Recent Incidents */}
        <aside className="hidden lg:block w-72 border-r border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="p-4">
            <h3 className="font-semibold mb-3 text-sm text-white/60">Recent Incidents</h3>
            <div className="space-y-2">
              {incidents.slice(0, 5).map((incident) => (
                <button
                  key={incident.id}
                  className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors text-sm border border-transparent hover:border-white/5"
                  onClick={() => setInput(`Tell me about incident ${incident.id}`)}
                >
                  <div className="font-medium text-white truncate">{incident.title}</div>
                  <div className="text-xs text-white/30">{incident.id}</div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl m-4 mr-4 overflow-hidden">
          {/* Chat Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <Avatar className="bg-gradient-to-br from-primary to-purple-600">
              <AvatarFallback className="bg-transparent">
                <Bot className="h-5 w-5 text-white" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-white">AI Coordinator</h2>
              <p className="text-sm text-white/40">Voice-enabled assistant</p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-400">Online</span>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            <div className="space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center text-white/40 py-12">
                  <div className="relative inline-block">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 inline-block mb-4">
                      <MessageSquare className="h-12 w-12 text-primary" />
                    </div>
                    <Sparkles className="h-5 w-5 absolute -top-1 -right-2 text-amber-500 animate-pulse" />
                  </div>
                  <p className="text-xl font-semibold text-white mb-2">AI Coordinator</p>
                  <p className="text-sm max-w-sm mx-auto text-white/40 mb-4">
                    Type or speak to ask about incidents, assignments, or procedures
                  </p>
                  <div className="flex justify-center">
                    <VoiceWidget compact onTranscriptChange={(text) => setInput(text)} />
                  </div>
                </div>
              )}
              
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="bg-gradient-to-br from-primary to-purple-600 shrink-0">
                      <AvatarFallback className="bg-transparent">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-primary to-purple-600 text-white"
                        : "bg-white/10 text-white/90 border border-white/10"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="bg-white/10 shrink-0">
                      <AvatarFallback>
                        <User className="h-4 w-4 text-white/60" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="bg-gradient-to-br from-primary to-purple-600 shrink-0">
                    <AvatarFallback className="bg-transparent">
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 items-end"
            >
              <div className="flex-1 flex items-end gap-2">
                <input
                  type="text"
                  placeholder="Type your message or use voice..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isTyping}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                />
                <VoiceWidget 
                  compact 
                  onTranscriptChange={(text) => {
                    setInput(text);
                  }} 
                  className="shrink-0"
                />
              </div>
              <Button
                type="submit"
                disabled={isTyping || !input.trim()}
                size="icon"
                className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
