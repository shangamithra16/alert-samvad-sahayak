import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bug, CloudRain, AlertTriangle, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useVoiceOutput } from './VoiceOutput';

interface UserAlertsProps {
  language: 'english' | 'hindi';
}

const UserAlerts: React.FC<UserAlertsProps> = ({ language }) => {
  const [alertType, setAlertType] = useState<string>('');
  const [alertDescription, setAlertDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { speak } = useVoiceOutput(language);

  const translations = {
    english: {
      title: "Report Agricultural Alerts",
      selectType: "Select Alert Type",
      pestAttack: "Pest Attack",
      heavyRainfall: "Heavy Rainfall",
      otherIssue: "Other Issue",
      description: "Description",
      descriptionPlaceholder: "Provide detailed description of the issue...",
      submitAlert: "Submit Alert",
      success: "Alert Submitted Successfully",
      successMessage: "Your alert has been recorded and relevant authorities will be notified.",
      fillAllFields: "Please fill all fields"
    },
    hindi: {
      title: "कृषि चेतावनी रिपोर्ट करें",
      selectType: "चेतावनी का प्रकार चुनें",
      pestAttack: "कीट आक्रमण",
      heavyRainfall: "भारी बारिश",
      otherIssue: "अन्य समस्या",
      description: "विवरण",
      descriptionPlaceholder: "समस्या का विस्तृत विवरण दें...",
      submitAlert: "चेतावनी भेजें",
      success: "चेतावनी सफलतापूर्वक भेजी गई",
      successMessage: "आपकी चेतावनी दर्ज हो गई है और संबंधित अधिकारियों को सूचित किया जाएगा।",
      fillAllFields: "कृपया सभी फ़ील्ड भरें"
    }
  };

  const t = translations[language];

  const handleSubmitAlert = async () => {
    if (!alertType || !alertDescription.trim()) {
      toast({
        title: t.fillAllFields,
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: t.success,
        description: t.successMessage,
      });
      
      speak(t.successMessage);
      
      // Reset form
      setAlertType('');
      setAlertDescription('');
      setSubmitting(false);
    }, 1500);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'pest':
        return <Bug className="h-5 w-5" />;
      case 'rainfall':
        return <CloudRain className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-warning" />
          {t.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            {t.selectType}
          </label>
          <Select value={alertType} onValueChange={setAlertType}>
            <SelectTrigger>
              <SelectValue placeholder={t.selectType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pest">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  {t.pestAttack}
                </div>
              </SelectItem>
              <SelectItem value="rainfall">
                <div className="flex items-center gap-2">
                  <CloudRain className="h-4 w-4" />
                  {t.heavyRainfall}
                </div>
              </SelectItem>
              <SelectItem value="other">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  {t.otherIssue}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            {t.description}
          </label>
          <Textarea
            placeholder={t.descriptionPlaceholder}
            value={alertDescription}
            onChange={(e) => setAlertDescription(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          onClick={handleSubmitAlert}
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
              {language === 'english' ? 'Submitting...' : 'भेजा जा रहा है...'}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {t.submitAlert}
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserAlerts;