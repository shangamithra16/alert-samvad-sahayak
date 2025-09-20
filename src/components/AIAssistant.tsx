import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useVoiceOutput } from './VoiceOutput';
import { supabase } from "@/integrations/supabase/client";

interface AIAssistantProps {
  language: 'english' | 'hindi';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: language === 'english' 
      ? "Hello! I'm your AI agricultural assistant. How can I help you with your farming needs today?"
      : "नमस्ते! मैं आपका एआई कृषि सहायक हूँ। आज मैं आपकी कृषि आवश्यकताओं में कैसे मदद कर सकता हूँ?"
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { speak } = useVoiceOutput(language);

  const translations = {
    english: {
      title: "AI Agricultural Assistant",
      chatPlaceholder: "Ask me about agriculture, crops, weather, or any farming question...",
      send: "Send",
      errorOccurred: "An error occurred while processing your request.",
      authRequired: "Please log in to use the AI assistant."
    },
    hindi: {
      title: "एआई कृषि सहायक",
      chatPlaceholder: "कृषि, फसलों, मौसम या किसी भी कृषि प्रश्न के बारे में पूछें...",
      send: "भेजें",
      errorOccurred: "आपके अनुरोध को संसाधित करते समय एक त्रुटि हुई।",
      authRequired: "एआई सहायक का उपयोग करने के लिए कृपया लॉग इन करें।"
    }
  };

  const t = translations[language];

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      console.log('Sending AI request via secure Edge Function');
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
          language: language
        }
      });

      if (error) {
        console.error('Edge Function Error:', error);
        if (error.message?.includes('JWT')) {
          throw new Error(t.authRequired);
        }
        throw new Error(`AI service error: ${error.message}`);
      }

      if (!data || !data.message) {
        throw new Error('Invalid response from AI service');
      }
      
      const assistantMessage = data.message;
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      speak(assistantMessage);
      
    } catch (error) {
      console.error('AI Assistant Error:', error);
      toast({
        title: t.errorOccurred,
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          {t.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/30 rounded-lg">
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                  {language === 'english' ? 'Thinking...' : 'सोच रहा है...'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            placeholder={t.chatPlaceholder}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={2}
          />
          <Button onClick={sendMessage} disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;