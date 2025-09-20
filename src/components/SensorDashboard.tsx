import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, CloudRain, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { database } from '@/config/firebase';
import { ref, onValue, off } from 'firebase/database';
import { useVoiceOutput } from './VoiceOutput';
import { toast } from "@/hooks/use-toast";

interface SensorData {
  soilMoisture: number;
  rainfall: number;
  tilt: number;
  timestamp: number;
}

interface SensorDashboardProps {
  language: 'english' | 'hindi';
}

const SensorDashboard: React.FC<SensorDashboardProps> = ({ language }) => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousTilt, setPreviousTilt] = useState<number | null>(null);
  const { speak } = useVoiceOutput(language);

  const translations = {
    english: {
      sensorData: "Real-time Sensor Data",
      soilMoisture: "Soil Moisture",
      rainfall: "Rainfall",
      tiltSensor: "Tilt Sensor",
      noData: "No data available",
      erosionRisk: "⚠️ SOIL EROSION RISK DETECTED!",
      landslideRisk: "⚠️ LANDSLIDE RISK DETECTED!",
      erosionAlert: "High soil moisture and rainfall detected. Possible soil erosion risk.",
      landslideAlert: "Tilt sensor value changed. Possible landslide risk detected.",
      status: "Status",
      normal: "Normal",
      warning: "Warning",
      critical: "Critical"
    },
    hindi: {
      sensorData: "रियल-टाइम सेंसर डेटा",
      soilMoisture: "मिट्टी की नमी",
      rainfall: "बारिश",
      tiltSensor: "झुकाव सेंसर",
      noData: "कोई डेटा उपलब्ध नहीं",
      erosionRisk: "⚠️ मिट्टी के कटाव का खतरा!",
      landslideRisk: "⚠️ भूस्खलन का खतरा!",
      erosionAlert: "उच्च मिट्टी की नमी और बारिश का पता चला। मिट्टी के कटाव का संभावित खतरा।",
      landslideAlert: "झुकाव सेंसर का मान बदल गया। संभावित भूस्खलन का खतरा।",
      status: "स्थिति",
      normal: "सामान्य",
      warning: "चेतावनी",
      critical: "गंभीर"
    }
  };

  const t = translations[language];

  useEffect(() => {
    const sensorRef = ref(database, 'sensors');
    
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newSensorData: SensorData = {
          soilMoisture: data.soilMoisture || 0,
          rainfall: data.rainfall || 0,
          tilt: data.tilt || 0,
          timestamp: data.timestamp || Date.now()
        };

        // Check for alerts
        checkAlerts(newSensorData);
        
        setSensorData(newSensorData);
        setLoading(false);
      }
    }, (error) => {
      console.error('Firebase error:', error);
      setLoading(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Firebase. Please check your configuration.",
        variant: "destructive"
      });
    });

    return () => off(sensorRef, 'value', unsubscribe);
  }, [language]);

  const checkAlerts = (data: SensorData) => {
    // Soil erosion alert (high moisture + high rainfall)
    if (data.soilMoisture > 70 && data.rainfall > 50) {
      toast({
        title: t.erosionRisk,
        description: t.erosionAlert,
        variant: "destructive"
      });
      speak(t.erosionAlert);
    }

    // Landslide alert (tilt sensor change)
    if (previousTilt !== null && Math.abs(data.tilt - previousTilt) > 5) {
      toast({
        title: t.landslideRisk,
        description: t.landslideAlert,
        variant: "destructive"
      });
      speak(t.landslideAlert);
    }
    
    setPreviousTilt(data.tilt);
  };

  const getSensorStatus = (value: number, type: 'moisture' | 'rain' | 'tilt') => {
    if (type === 'moisture') {
      if (value < 30) return { status: t.normal, variant: "default" as const };
      if (value < 70) return { status: t.warning, variant: "secondary" as const };
      return { status: t.critical, variant: "destructive" as const };
    }
    if (type === 'rain') {
      if (value < 25) return { status: t.normal, variant: "default" as const };
      if (value < 50) return { status: t.warning, variant: "secondary" as const };
      return { status: t.critical, variant: "destructive" as const };
    }
    // tilt
    if (Math.abs(value) < 5) return { status: t.normal, variant: "default" as const };
    if (Math.abs(value) < 10) return { status: t.warning, variant: "secondary" as const };
    return { status: t.critical, variant: "destructive" as const };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading sensor data...</p>
        </CardContent>
      </Card>
    );
  }

  if (!sensorData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-warning" />
          <p className="text-muted-foreground">{t.noData}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary mb-6">{t.sensorData}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Soil Moisture */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="h-5 w-5 text-blue-500" />
              {t.soilMoisture}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {sensorData.soilMoisture}%
            </div>
            <Badge variant={getSensorStatus(sensorData.soilMoisture, 'moisture').variant}>
              {getSensorStatus(sensorData.soilMoisture, 'moisture').status}
            </Badge>
          </CardContent>
        </Card>

        {/* Rainfall */}
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CloudRain className="h-5 w-5 text-indigo-500" />
              {t.rainfall}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {sensorData.rainfall}mm
            </div>
            <Badge variant={getSensorStatus(sensorData.rainfall, 'rain').variant}>
              {getSensorStatus(sensorData.rainfall, 'rain').status}
            </Badge>
          </CardContent>
        </Card>

        {/* Tilt Sensor */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <RotateCcw className="h-5 w-5 text-purple-500" />
              {t.tiltSensor}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {sensorData.tilt}°
            </div>
            <Badge variant={getSensorStatus(sensorData.tilt, 'tilt').variant}>
              {getSensorStatus(sensorData.tilt, 'tilt').status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground text-center mt-4">
        Last updated: {new Date(sensorData.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default SensorDashboard;