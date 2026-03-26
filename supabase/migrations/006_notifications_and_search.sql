-- =============================================
-- Phase 6: Notifications and Search
-- =============================================

-- Enable pg_trgm for fuzzy search on addresses and names
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" 
  ON public.notifications FOR SELECT 
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  TO authenticated USING (auth.uid() = user_id);

-- 2. Indexes for faster global search
CREATE INDEX IF NOT EXISTS idx_leads_address_trgm ON public.leads USING gin (property_address gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_borrower_trgm ON public.leads USING gin (borrower_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_lead_id_trgm ON public.leads USING gin (lead_id gin_trgm_ops);

-- 3. Automatic Notification Triggers (Example: Assignment)
CREATE OR REPLACE FUNCTION public.notify_on_lead_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.assigned_to IS NOT NULL) OR 
     (TG_OP = 'UPDATE' AND NEW.assigned_to IS DISTINCT FROM OLD.assigned_to) THEN
    
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.assigned_to,
      'New Lead Assigned',
      'You have been assigned a new lead: ' || NEW.property_address,
      'info',
      '/leads/' || NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_lead_assigned
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_lead_assignment();

-- 4. Function to generate approaching sale notifications
-- This should be called by a cron job
CREATE OR REPLACE FUNCTION public.check_approaching_sales()
RETURNS void AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, link)
  SELECT 
    l.assigned_to,
    'Urgent: Sale Date Approaching',
    'Sale date for ' || l.property_address || ' is in ' || l.days_to_sale || ' days!',
    'warning',
    '/leads/' || l.id
  FROM public.leads l
  WHERE l.assigned_to IS NOT NULL 
    AND l.days_to_sale IS NOT NULL
    AND l.days_to_sale <= 3
    AND l.days_to_sale >= 0
    AND NOT EXISTS (
      SELECT 1 FROM public.notifications n 
      WHERE n.user_id = l.assigned_to 
        AND n.link = '/leads/' || l.id 
        AND n.title = 'Urgent: Sale Date Approaching'
        AND n.created_at > (now() - INTERVAL '24 hours')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
