import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-device-api-key',
};

interface SensorData {
  sequence: number;
  soil?: number;
  rain?: number;
  pH?: number;
  Hum?: number;
  Temp?: number;
  turbidity?: number;
  O3?: number;
  NH3?: number;
  CO2?: number;
  TiltX?: number;
  TiltY?: number;
  timestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get device API key from header
    const deviceApiKey = req.headers.get('x-device-api-key');
    
    if (!deviceApiKey) {
      console.error('Missing device API key');
      return new Response(JSON.stringify({ error: 'Device API key required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Validating device API key:', deviceApiKey.substring(0, 8) + '...');

    // Validate device API key and get community_id
    const { data: communityId, error: validationError } = await supabase
      .rpc('validate_device_api_key', { _api_key: deviceApiKey });

    if (validationError || !communityId) {
      console.error('Invalid device API key:', validationError);
      return new Response(JSON.stringify({ error: 'Invalid device API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Valid device API key for community:', communityId);

    // Update last_used_at for the API key
    await supabase
      .from('device_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('api_key', deviceApiKey);

    // Parse sensor data from request
    const sensorData: SensorData = await req.json();

    // Validate required fields
    if (typeof sensorData.sequence !== 'number') {
      throw new Error('sequence field is required and must be a number');
    }

    // Prepare data for insertion
    const insertData = {
      community_id: communityId,
      sequence: sensorData.sequence,
      soil: sensorData.soil,
      rain: sensorData.rain,
      pH: sensorData.pH,
      Hum: sensorData.Hum,
      Temp: sensorData.Temp,
      turbidity: sensorData.turbidity,
      O3: sensorData.O3,
      NH3: sensorData.NH3,
      CO2: sensorData.CO2,
      TiltX: sensorData.TiltX,
      TiltY: sensorData.TiltY,
      timestamp: sensorData.timestamp || new Date().toISOString(),
    };

    console.log('Inserting sensor data:', { sequence: insertData.sequence, community_id: communityId });

    // Insert sensor data using service role (bypasses RLS)
    const { data, error } = await supabase
      .from('sensor_data')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Database insertion error:', error);
      throw new Error(`Failed to insert sensor data: ${error.message}`);
    }

    console.log('Sensor data inserted successfully:', data[0]?.id);

    // Check for alerts based on sensor readings
    await checkAndCreateAlerts(supabase, communityId, insertData);

    return new Response(JSON.stringify({ 
      success: true, 
      id: data[0]?.id,
      message: 'Sensor data ingested successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sensor-data-ingestion function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkAndCreateAlerts(supabase: any, communityId: string, sensorData: any) {
  const alerts = [];

  // Temperature alerts
  if (sensorData.Temp !== null && sensorData.Temp !== undefined) {
    if (sensorData.Temp > 45) {
      alerts.push({
        community_id: communityId,
        type: 'weather',
        severity: 'high',
        title: 'High Temperature Alert',
        message: `Extreme temperature detected: ${sensorData.Temp}°C. Take immediate action to protect crops.`,
        sensor_data_id: null // Will be set after sensor data insertion
      });
    } else if (sensorData.Temp < 5) {
      alerts.push({
        community_id: communityId,
        type: 'weather',
        severity: 'high',
        title: 'Low Temperature Alert',
        message: `Freezing temperature detected: ${sensorData.Temp}°C. Protect sensitive crops from frost damage.`,
        sensor_data_id: null
      });
    }
  }

  // Soil moisture alerts
  if (sensorData.soil !== null && sensorData.soil !== undefined) {
    if (sensorData.soil < 20) {
      alerts.push({
        community_id: communityId,
        type: 'irrigation',
        severity: 'medium',
        title: 'Low Soil Moisture',
        message: `Soil moisture is critically low: ${sensorData.soil}%. Consider irrigation.`,
        sensor_data_id: null
      });
    }
  }

  // pH alerts
  if (sensorData.pH !== null && sensorData.pH !== undefined) {
    if (sensorData.pH < 5.5 || sensorData.pH > 8.5) {
      alerts.push({
        community_id: communityId,
        type: 'soil',
        severity: 'medium',
        title: 'Soil pH Alert',
        message: `Soil pH is outside optimal range: ${sensorData.pH}. Consider soil treatment.`,
        sensor_data_id: null
      });
    }
  }

  // Insert alerts if any were generated
  if (alerts.length > 0) {
    console.log(`Creating ${alerts.length} alerts for community ${communityId}`);
    
    const { error: alertError } = await supabase
      .from('alerts')
      .insert(alerts);
    
    if (alertError) {
      console.error('Error creating alerts:', alertError);
    } else {
      console.log('Alerts created successfully');
    }
  }
}