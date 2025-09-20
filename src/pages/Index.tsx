import React, { useState } from 'react';
import LanguageSelector from '@/components/LanguageSelector';
import SensorDashboard from '@/components/SensorDashboard';
import UserAlerts from '@/components/UserAlerts';
import AIAssistant from '@/components/AIAssistant';
import VoiceOutput from '@/components/VoiceOutput';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Leaf, Gauge, AlertTriangle, Bot } from "lucide-react";

const Index = () => {
  const [language, setLanguage] = useState<'english' | 'hindi'>('english');

  const translations = {
    english: {
      title: "Agricultural Monitoring System",
      subtitle: "Real-time sensor monitoring with intelligent alerts",
      dashboard: "Dashboard",
      alerts: "Report Alerts", 
      assistant: "AI Assistant",
      configureFirebase: "Configure Firebase Connection"
    },
    hindi: {
      title: "कृषि निगरानी प्रणाली",
      subtitle: "बुद्धिमान चेतावनी के साथ रियल-टाइम सेंसर निगरानी",
      dashboard: "डैशबोर्ड",
      alerts: "चेतावनी रिपोर्ट करें",
      assistant: "एआई सहायक",
      configureFirebase: "Firebase कनेक्शन कॉन्फ़िगर करें"
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-secondary/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Leaf className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-primary">
                  {t.title}
                </h1>
                <p className="text-muted-foreground text-sm lg:text-base">
                  {t.subtitle}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <VoiceOutput language={language} />
              <LanguageSelector 
                language={language} 
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        </div>
      </header>


      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              <span className="hidden sm:inline">{t.dashboard}</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">{t.alerts}</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">{t.assistant}</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-8">
            <TabsContent value="dashboard" className="space-y-8">
              <SensorDashboard language={language} />
            </TabsContent>
            
            <TabsContent value="alerts" className="space-y-8">
              <UserAlerts language={language} />
            </TabsContent>
            
            <TabsContent value="assistant" className="space-y-8">
              <AIAssistant language={language} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
