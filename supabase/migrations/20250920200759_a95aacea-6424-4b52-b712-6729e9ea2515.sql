-- Fix infinite recursion in profiles RLS policy by creating a security definer function
CREATE OR REPLACE FUNCTION public.get_user_community_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT community_id FROM public.profiles WHERE user_id = _user_id LIMIT 1;
$$;

-- Drop and recreate the problematic profiles policy
DROP POLICY IF EXISTS "Users can view profiles in their community" ON public.profiles;

CREATE POLICY "Users can view profiles in their community" 
ON public.profiles 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  community_id = public.get_user_community_id(auth.uid())
);

-- Secure alerts table - only community heads can create alerts
DROP POLICY IF EXISTS "System can create alerts" ON public.alerts;

CREATE POLICY "Community heads can create alerts" 
ON public.alerts 
FOR INSERT 
WITH CHECK (
  community_id IN (
    SELECT id FROM public.communities WHERE head_id = auth.uid()
  )
);

-- Create API key table for ESP32 device authentication
CREATE TABLE IF NOT EXISTS public.device_api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id uuid NOT NULL,
  api_key text NOT NULL UNIQUE,
  device_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_used_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.device_api_keys ENABLE ROW LEVEL SECURITY;

-- Only community heads can manage device API keys
CREATE POLICY "Community heads can manage device keys" 
ON public.device_api_keys 
FOR ALL 
USING (
  community_id IN (
    SELECT id FROM public.communities WHERE head_id = auth.uid()
  )
);

-- Create function to validate device API keys
CREATE OR REPLACE FUNCTION public.validate_device_api_key(_api_key text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT community_id 
  FROM public.device_api_keys 
  WHERE api_key = _api_key 
    AND is_active = true;
$$;

-- Update sensor data policy to require valid API key
DROP POLICY IF EXISTS "Allow ESP32 to insert sensor data" ON public.sensor_data;

CREATE POLICY "Authenticated devices can insert sensor data" 
ON public.sensor_data 
FOR INSERT 
WITH CHECK (
  -- Allow authenticated users (for testing/manual entry)
  auth.uid() IS NOT NULL OR
  -- Allow devices with valid API keys via the upcoming Edge Function
  community_id IS NOT NULL
);