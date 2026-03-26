-- =============================================
-- Phase 5: Close CRM Integration Settings
-- =============================================

CREATE TABLE IF NOT EXISTS public.integration_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL UNIQUE DEFAULT 'close',
  api_key TEXT,
  sync_enabled BOOLEAN NOT NULL DEFAULT false,
  sync_direction TEXT NOT NULL DEFAULT 'off' CHECK (sync_direction IN ('push', 'pull', 'two-way', 'off')),
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can view/edit integration settings
CREATE POLICY "Enable read access for authenticated users on integration_settings" 
  ON public.integration_settings FOR SELECT 
  TO authenticated USING (true);

CREATE POLICY "Enable update access for authenticated users on integration_settings" 
  ON public.integration_settings FOR UPDATE 
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable insert access for authenticated users on integration_settings" 
  ON public.integration_settings FOR INSERT 
  TO authenticated WITH CHECK (true);

-- Ensure default record exists
INSERT INTO public.integration_settings (provider, sync_enabled, sync_direction)
VALUES ('close', false, 'off')
ON CONFLICT (provider) DO NOTHING;

-- Trigger to update updated_at
CREATE TRIGGER update_integration_settings_updated_at
BEFORE UPDATE ON public.integration_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
