import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceWidgetProps {
  onTranscriptChange?: (transcript: string) => void;
  className?: string;
  compact?: boolean;
}

const SpeechRecognition: any = (typeof window !== "undefined" 
  ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition 
  : null);

export function VoiceWidget({ onTranscriptChange, className, compact = false }: VoiceWidgetProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (final) {
        finalTranscriptRef.current += " " + final;
        setTranscript(finalTranscriptRef.current);
        onTranscriptChange?.(finalTranscriptRef.current);
      } else {
        setTranscript(finalTranscriptRef.current + " " + interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      setIsProcessing(false);
      if (event.error !== "no-speech") {
        setIsSupported(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore errors on cleanup
      }
    };
  }, [onTranscriptChange]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) return;
    
    try {
      finalTranscriptRef.current = "";
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
      setIsProcessing(true);
    } catch (error) {
      console.warn("Failed to start recognition:", error);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsProcessing(false);
    } catch (error) {
      console.warn("Failed to stop recognition:", error);
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis || !text) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
    onTranscriptChange?.("");
  }, [onTranscriptChange]);

  if (!isSupported) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={toggleListening}
          className={cn(
            "h-10 w-10 rounded-full transition-all duration-300",
            isListening && "animate-pulse bg-red-500 hover:bg-red-600"
          )}
          aria-label={isListening ? "Stop recording" : "Start recording"}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
        
        {transcript && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => speakText(transcript)}
              className="h-10 w-10 rounded-full"
              aria-label="Speak transcript"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearTranscript}
              className="text-xs text-muted-foreground"
            >
              Clear
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? "destructive" : "default"}
          onClick={toggleListening}
          className={cn(
            "gap-2 transition-all duration-300",
            isListening && "animate-pulse bg-red-500 hover:bg-red-600"
          )}
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isListening ? (
            <>
              <MicOff className="h-4 w-4" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              <span>Start Voice Input</span>
            </>
          )}
        </Button>

        {transcript && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => speakText(transcript)}
            aria-label="Speak transcript"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {transcript && (
        <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1">
          {transcript.slice(-100)}
          {transcript.length > 100 && "..."}
        </p>
      )}
    </div>
  );
}

export default VoiceWidget;
