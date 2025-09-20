import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Droplets, CloudRain, RotateCcw, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useVoiceOutput } from './VoiceOutput';
import { toast } from "@/hooks/use-toast";

interface SensorData {
  soil: number;
  rain: number;
  TiltX: number;
  TiltY: number;
  Temp: number;
  Hum: number;
  pH: number;
  turbidity: number;
  O3: number;
  NH3: number;
  CO2: number;
  timestamp: string;
  sequence: number;
}

interface SensorDashboardProps {
  language: 'english' | 'hindi';
}

const SensorDashboard: React.FC<SensorDashboardProps> = ({ language }) => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previousTiltX, setPreviousTiltX] = useState<number | null>(null);
  const [previousTiltY, setPreviousTiltY] = useState<number | null>(null);
  const { speak } = useVoiceOutput(language);

  const translations = {
    english: {
      sensorData: "Real-time Sensor Data",
      soilMoisture: "Soil Moisture",
      temperature: "Temperature", 
      humidity: "Humidity",
      rainfall: "Rainfall",
      tiltSensor: "Tilt Sensor",
      pH: "Soil pH",
      airQuality: "Air Quality",
      noData: "No sensor data available. Connect your community to view real-time data.",
      erosionRisk: "⚠️ SOIL EROSION RISK DETECTED!",
      landslideRisk: "⚠️ LANDSLIDE RISK DETECTED!",
      temperatureAlert: "⚠️ TEMPERATURE ALERT!",
      erosionAlert: "High soil moisture and rainfall detected. Possible soil erosion risk.",
      landslideAlert: "Tilt sensor value changed. Possible landslide risk detected.",
      tempAlert: "Extreme temperature detected. Take protective measures.",
      status: "Status",
      normal: "Normal",
      warning: "Warning",
      critical: "Critical"
    },
    hindi: {
      sensorData: "रियल-टाइम सेंसर डेटा",
      soilMoisture: "मिट्टी की नमी",
      temperature: "तापमान",
      humidity: "आर्द्रता", 
      rainfall: "बारिश",
      tiltSensor: "झुकाव सेंसर",
      pH: "मिट्टी का pH",
      airQuality: "वायु गुणवत्ता",
      noData: "कोई सेंसर डेटा उपलब्ध नहीं। रियल-टाइम डेटा देखने के लिए अपने समुदाय को जोड़ें।",
      erosionRisk: "⚠️ मिट्टी के कटाव का खतरा!",
      landslideRisk: "⚠️ भूस्खलन का खतरा!",
      temperatureAlert: "⚠️ तापमान चेतावनी!",
      erosionAlert: "उच्च मिट्टी की नमी और बारिश का पता चला। मिट्टी के कटाव का संभावित खतरा।",
      landslideAlert: "झुकाव सेंसर का मान बदल गया। संभावित भूस्खलन का खतरा।",
      tempAlert: "अत्यधिक तापमान का पता चला। सुरक्षात्मक उपाय करें।",
      status: "स्थिति",
      normal: "सामान्य",
      warning: "चेतावनी",
      critical: "गंभीर"
    }
  };

  const t = translations[language];

  useEffect(() => {
    let subscription: any;

    const fetchLatestSensorData = async () => {
      try {
        // Get the latest sensor data from Supabase
        const { data, error } = await supabase
          .from('sensor_data')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const newSensorData: SensorData = {
            soil: data.soil || 0,
            rain: data.rain || 0,
            TiltX: data.TiltX || 0,
            TiltY: data.TiltY || 0,
            Temp: data.Temp || 0,
            Hum: data.Hum || 0,
            pH: data.pH || 7,
            turbidity: data.turbidity || 0,
            O3: data.O3 || 0,
            NH3: data.NH3 || 0,
            CO2: data.CO2 || 0,
            timestamp: data.timestamp || data.created_at,
            sequence: data.sequence || 0
          };

          checkAlerts(newSensorData);
          setSensorData(newSensorData);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sensor data:', error);
        setLoading(false);
      }
    };

    // Initial fetch
    fetchLatestSensorData();

    // Set up real-time subscription for new sensor data
    subscription = supabase
      .channel('sensor_data')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'sensor_data' },
        (payload) => {
          console.log('New sensor data received:', payload);
          const data = payload.new;
          const newSensorData: SensorData = {
            soil: data.soil || 0,
            rain: data.rain || 0,
            TiltX: data.TiltX || 0,
            TiltY: data.TiltY || 0,
            Temp: data.Temp || 0,
            Hum: data.Hum || 0,
            pH: data.pH || 7,
            turbidity: data.turbidity || 0,
            O3: data.O3 || 0,
            NH3: data.NH3 || 0,
            CO2: data.CO2 || 0,
            timestamp: data.timestamp || data.created_at,
            sequence: data.sequence || 0
          };

          checkAlerts(newSensorData);
          setSensorData(newSensorData);
        }
      )
      .subscribe();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [language]);

  const checkAlerts = (data: SensorData) => {
    // Soil erosion alert (high moisture + high rainfall)
    if (data.soil > 70 && data.rain > 50) {
      toast({
        title: t.erosionRisk,
        description: t.erosionAlert,
        variant: "destructive"
      });
      speak(t.erosionAlert);
    }

    // Temperature alert
    if (data.Temp > 45 || data.Temp < 5) {
      toast({
        title: t.temperatureAlert,
        description: t.tempAlert,
        variant: "destructive"
      });
      speak(t.tempAlert);
    }

    // Landslide alert (tilt sensor change)
    if (previousTiltX !== null && Math.abs(data.TiltX - previousTiltX) > 5) {
      toast({
        title: t.landslideRisk,
        description: t.landslideAlert,
        variant: "destructive"
      });
      speak(t.landslideAlert);
    }

    if (previousTiltY !== null && Math.abs(data.TiltY - previousTiltY) > 5) {
      toast({
        title: t.landslideRisk,
        description: t.landslideAlert,
        variant: "destructive"
      });
      speak(t.landslideAlert);
    }
    
    setPreviousTiltX(data.TiltX);
    setPreviousTiltY(data.TiltY);
  };

  const getSensorStatus = (value: number, type: 'moisture' | 'rain' | 'tilt' | 'temp' | 'ph') => {
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
    if (type === 'temp') {
      if (value >= 15 && value <= 35) return { status: t.normal, variant: "default" as const };
      if ((value >= 10 && value < 15) || (value > 35 && value <= 40)) return { status: t.warning, variant: "secondary" as const };
      return { status: t.critical, variant: "destructive" as const };
    }
    if (type === 'ph') {
      if (value >= 6.0 && value <= 7.5) return { status: t.normal, variant: "default" as const };
      if ((value >= 5.5 && value < 6.0) || (value > 7.5 && value <= 8.0)) return { status: t.warning, variant: "secondary" as const };
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              {sensorData.soil}%
            </div>
            <Badge variant={getSensorStatus(sensorData.soil, 'moisture').variant}>
              {getSensorStatus(sensorData.soil, 'moisture').status}
            </Badge>
          </CardContent>
        </Card>

        {/* Temperature */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t.temperature}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {sensorData.Temp}°C
            </div>
            <Badge variant={getSensorStatus(sensorData.Temp, 'temp').variant}>
              {getSensorStatus(sensorData.Temp, 'temp').status}
            </Badge>
          </CardContent>
        </Card>

        {/* Humidity */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Droplets className="h-5 w-5 text-green-500" />
              {t.humidity}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {sensorData.Hum}%
            </div>
            <Badge variant="default">
              {t.normal}
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
              {sensorData.rain}mm
            </div>
            <Badge variant={getSensorStatus(sensorData.rain, 'rain').variant}>
              {getSensorStatus(sensorData.rain, 'rain').status}
            </Badge>
          </CardContent>
        </Card>

        {/* pH Level */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <RotateCcw className="h-5 w-5 text-yellow-500" />
              {t.pH}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {sensorData.pH}
            </div>
            <Badge variant={getSensorStatus(sensorData.pH, 'ph').variant}>
              {getSensorStatus(sensorData.pH, 'ph').status}
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
            <div className="text-2xl font-bold text-primary mb-2">
              X: {sensorData.TiltX}° Y: {sensorData.TiltY}°
            </div>
            <Badge variant={getSensorStatus(Math.max(Math.abs(sensorData.TiltX), Math.abs(sensorData.TiltY)), 'tilt').variant}>
              {getSensorStatus(Math.max(Math.abs(sensorData.TiltX), Math.abs(sensorData.TiltY)), 'tilt').status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground text-center mt-4">
        Last updated: {new Date(sensorData.timestamp).toLocaleString()} | Sequence: {sensorData.sequence}
      </div>
    </div>
  );
};

export default SensorDashboard;