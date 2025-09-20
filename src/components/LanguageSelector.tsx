import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  language: 'english' | 'hindi';
  onLanguageChange: (language: 'english' | 'hindi') => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onLanguageChange }) => {
  const translations = {
    english: {
      selectLanguage: "Select Language",
      english: "English",
      hindi: "Hindi"
    },
    hindi: {
      selectLanguage: "भाषा चुनें",
      english: "अंग्रेजी",
      hindi: "हिंदी"
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-sm border">
      <Globe className="h-5 w-5 text-primary" />
      <Select value={language} onValueChange={onLanguageChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder={translations[language].selectLanguage} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="english">{translations[language].english}</SelectItem>
          <SelectItem value="hindi">{translations[language].hindi}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;