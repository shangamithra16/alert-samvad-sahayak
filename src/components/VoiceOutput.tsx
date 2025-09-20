import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface VoiceOutputProps {
  language: 'english' | 'hindi';
}

export const useVoiceOutput = (language: 'english' | 'hindi') => {
  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language based on selection
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
    }
  }, [language]);

  return { speak };
};

const VoiceOutput: React.FC<VoiceOutputProps> = ({ language }) => {
  const { speak } = useVoiceOutput(language);

  const testVoice = () => {
    const testTexts = {
      english: "Agricultural monitoring system is active. All sensors are working properly.",
      hindi: "कृषि निगरानी प्रणाली सक्रिय है। सभी सेंसर ठीक से काम कर रहे हैं।"
    };
    speak(testTexts[language]);
  };

  return (
    <Button 
      onClick={testVoice}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Volume2 className="h-4 w-4" />
      {language === 'english' ? 'Test Voice' : 'आवाज़ का परीक्षण'}
    </Button>
  );
};

export default VoiceOutput;