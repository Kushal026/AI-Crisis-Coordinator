import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, StopCircle, Play, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";

const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [browserSupported, setBrowserSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!SpeechRecognition) {
      setBrowserSupported(false);
      return;
    }
    const r = new SpeechRecognition();
    r.continuous = true;
    r.interimResults = true;
    r.lang = "en-US";

    r.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        if (res.isFinal) final += res[0].transcript;
        else interim += res[0].transcript;
      }
      setTranscript((prev) => (final ? prev + " " + final : prev + " " + interim));
    };

    r.onerror = (e: any) => {
      console.error("Speech recognition error", e);
      setListening(false);
    };

    recognitionRef.current = r;
    return () => {
      try {
        r.stop();
      } catch (e) {}
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return alert("Speech Recognition not supported in this browser.");
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      console.warn(e);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setListening(false);
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return alert("Speech Synthesis not supported in this browser.");
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  const sendToAssistant = () => {
    navigate("/chat", { state: { prefill: transcript } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {!browserSupported ? (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Voice Assistant</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">
                <strong>Browser Not Supported:</strong> Speech recognition is not supported in your browser. 
                Please use Chrome, Edge, or Safari for this feature.
              </p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The Voice Assistant uses the Web Speech API which requires a compatible browser.
            </p>
          </Card>
        ) : (
          <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Voice Assistant</h2>
          <p className="text-sm text-muted-foreground mb-4">Use your microphone to dictate messages to the AI assistant.</p>

          <div className="flex gap-3 items-start mb-4">
            <div className="flex-1">
              <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} className="min-h-[120px]" />
            </div>
            <div className="flex flex-col gap-2">
              {!listening ? (
                <Button onClick={startListening} variant="ghost" className="h-12 w-12 p-0" aria-label="Start recording">
                  <Mic className="h-5 w-5" />
                </Button>
              ) : (
                <Button onClick={stopListening} variant="destructive" className="h-12 w-12 p-0" aria-label="Stop recording">
                  <StopCircle className="h-5 w-5" />
                </Button>
              )}
              <Button onClick={() => speakText(transcript)} variant="outline" className="h-10 w-10 p-0" aria-label="Play transcript">
                <Play className="h-4 w-4" />
              </Button>
              <Button onClick={sendToAssistant} className="h-10 w-10 p-0" aria-label="Send to assistant">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Allow microphone access when prompted. Speech recognition quality depends on your browser and microphone.
          </div>
        </Card>
        )}
      </main>
    </div>
  );
}
