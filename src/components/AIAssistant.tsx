import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, MessageCircle, Key } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useVoiceOutput } from './VoiceOutput';

interface AIAssistantProps {
  language: 'english' | 'hindi';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [loading, setLoading] = useState(false);
  const { speak } = useVoiceOutput(language);

  const translations = {
    english: {
      title: "AI Agricultural Assistant",
      apiKeyLabel: "OpenAI API Key",
      apiKeyPlaceholder: "Enter your OpenAI API key...",
      saveKey: "Save Key",
      chatPlaceholder: "Ask me about agriculture, crops, weather, or any farming question...",
      send: "Send",
      welcome: "Hello! I'm your AI agricultural assistant. How can I help you with your farming needs today?",
      apiKeyRequired: "Please enter your OpenAI API key to use the AI assistant.",
      errorOccurred: "An error occurred while processing your request."
    },
    hindi: {
      title: "एआई कृषि सहायक",
      apiKeyLabel: "OpenAI API की",
      apiKeyPlaceholder: "अपनी OpenAI API की दर्ज करें...",
      saveKey: "की सेव करें",
      chatPlaceholder: "कृषि, फसलों, मौसम या किसी भी कृषि प्रश्न के बारे में पूछें...",
      send: "भेजें",
      welcome: "नमस्ते! मैं आपका एआई कृषि सहायक हूँ। आज मैं आपकी कृषि आवश्यकताओं में कैसे मदद कर सकता हूँ?",
      apiKeyRequired: "एआई सहायक का उपयोग करने के लिए कृपया अपनी OpenAI API की दर्ज करें।",
      errorOccurred: "आपके अनुरोध को संसाधित करते समय एक त्रुटि हुई।"
    }
  };

  const t = translations[language];

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey);
      toast({
        title: language === 'english' ? "API Key Saved" : "API की सेव हो गई",
        description: language === 'english' 
          ? "Your OpenAI API key has been saved locally." 
          : "आपकी OpenAI API की स्थानीय रूप से सेव हो गई है।"
      });
      
      // Add welcome message
      if (messages.length === 0) {
        setMessages([{ role: 'assistant', content: t.welcome }]);
      }
    }
  };

  const sendMessage = async () => {
    if (!apiKey.trim()) {
      toast({
        title: t.apiKeyRequired,
        variant: "destructive"
      });
      return;
    }

    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert agricultural assistant. Provide helpful advice about farming, crops, weather, soil, pests, and agricultural best practices. Respond in ${language === 'english' ? 'English' : 'Hindi'}.`
            },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      speak(assistantMessage);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: t.errorOccurred,
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
        
        {/* API Key Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t.apiKeyLabel}</label>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder={t.apiKeyPlaceholder}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={saveApiKey} size="sm">
              <Key className="h-4 w-4 mr-1" />
              {t.saveKey}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/30 rounded-lg">
          {messages.length === 0 && apiKey && (
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2" />
              <p>{language === 'english' ? 'Start a conversation!' : 'बातचीत शुरू करें!'}</p>
            </div>
          )}
          
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
          <Button onClick={sendMessage} disabled={loading || !apiKey.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;