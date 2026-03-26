-- =============================================
-- Alabama Foreclosure CRM — Initial Schema
-- =============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Helper Functions (created first, used by all tables)
-- =============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 1. USERS (extends Supabase auth.users)
-- =============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create user profile when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'agent')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- 2. COUNTIES
-- =============================================
CREATE TABLE public.counties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Watchlist' CHECK (priority IN ('Primary', 'Secondary', 'Watchlist')),
  notice_source_url TEXT,
  local_paper_url TEXT,
  probate_url TEXT,
  auction_notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_checked TIMESTAMPTZ,
  next_check TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER counties_updated_at
  BEFORE UPDATE ON public.counties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- 3. SCORING CONFIG (created before leads so triggers can reference it)
-- =============================================
CREATE TABLE public.scoring_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, -- occupancy, motivation, title, contactability, timing, equity, tax
  option_value TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category, option_value)
);

CREATE TRIGGER scoring_config_updated_at
  BEFORE UPDATE ON public.scoring_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- 4. TIER THRESHOLDS (created before leads so triggers can reference it)
-- =============================================
CREATE TABLE public.tier_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_name TEXT NOT NULL UNIQUE,
  min_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tier_thresholds_updated_at
  BEFORE UPDATE ON public.tier_thresholds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- 5. LEADS
-- =============================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id TEXT UNIQUE NOT NULL, -- format: AL-XXX-YYYY-NNN
  county_id UUID REFERENCES public.counties(id) ON DELETE SET NULL,
  property_address TEXT NOT NULL,
  borrower_name TEXT,
  notice_first_date DATE,
  sale_date DATE,
  -- days_to_sale is computed by trigger (CURRENT_DATE is not immutable for generated columns)
  days_to_sale INTEGER,
  lender_servicer TEXT,
  foreclosure_firm TEXT,
  occupancy TEXT DEFAULT 'Unknown' CHECK (occupancy IN ('O/O', 'Tenant', 'Vacant', 'Unknown')),
  arv_estimate DECIMAL,
  repair_estimate DECIMAL,
  taxes_liens DECIMAL,
  debt_payoff_estimate DECIMAL,
  -- equity_estimate and equity_margin_pct computed by trigger (keeps them consistent)
  equity_estimate DECIMAL,
  equity_margin_pct DECIMAL,
  motivation TEXT DEFAULT 'Unknown' CHECK (motivation IN ('High', 'Med', 'Low', 'Unknown')),
  title_complexity TEXT DEFAULT 'Unknown' CHECK (title_complexity IN ('Simple', 'Moderate', 'Complex', 'Unknown')),
  contactability TEXT DEFAULT '0' CHECK (contactability IN ('Strong', 'Some', 'Weak', '0')),
  tax_delinquent TEXT DEFAULT 'Unknown' CHECK (tax_delinquent IN ('Yes', 'No', 'Unknown')),
  homestead TEXT DEFAULT 'Unknown' CHECK (homestead IN ('Yes', 'No', 'Unknown')),
  deal_status TEXT NOT NULL DEFAULT 'New' CHECK (deal_status IN ('New', 'Calling', 'Spoke', 'Offer', 'UW', 'Dead', 'Won', 'Watch')),
  zone TEXT, -- computed via trigger: Green, Yellow, Red, Post-sale
  -- Scoring fields (set by application logic or triggers)
  occ_pts INTEGER DEFAULT 0,
  mot_pts INTEGER DEFAULT 0,
  title_pts INTEGER DEFAULT 0,
  contact_pts INTEGER DEFAULT 0,
  timing_pts INTEGER DEFAULT 0,
  equity_pts INTEGER DEFAULT 0,
  tax_pts INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0, -- computed by trigger: sum of all pts
  priority_tier TEXT, -- computed via trigger from tier_thresholds
  next_48h_action TEXT,
  last_contact_date DATE,
  next_action_date DATE,
  target_calls INTEGER,
  suggested_strategy TEXT,
  notes TEXT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  close_crm_lead_id TEXT, -- external ID for Close sync
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compute days_to_sale, zone, equity fields on insert/update
CREATE OR REPLACE FUNCTION public.compute_lead_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- days_to_sale
  IF NEW.sale_date IS NOT NULL THEN
    NEW.days_to_sale := NEW.sale_date - CURRENT_DATE;
  ELSE
    NEW.days_to_sale := NULL;
  END IF;

  -- zone (based on days to sale)
  IF NEW.sale_date IS NOT NULL THEN
    IF NEW.sale_date < CURRENT_DATE THEN
      NEW.zone := 'Post-sale';
    ELSIF (NEW.sale_date - CURRENT_DATE) <= 14 THEN
      NEW.zone := 'Red';
    ELSIF (NEW.sale_date - CURRENT_DATE) <= 45 THEN
      NEW.zone := 'Yellow';
    ELSE
      NEW.zone := 'Green';
    END IF;
  ELSE
    NEW.zone := NULL;
  END IF;

  -- equity_estimate
  IF NEW.arv_estimate IS NOT NULL AND NEW.repair_estimate IS NOT NULL AND NEW.debt_payoff_estimate IS NOT NULL THEN
    NEW.equity_estimate := NEW.arv_estimate - NEW.repair_estimate - NEW.debt_payoff_estimate;
  ELSE
    NEW.equity_estimate := NULL;
  END IF;

  -- equity_margin_pct
  IF NEW.arv_estimate IS NOT NULL AND NEW.arv_estimate > 0 AND NEW.equity_estimate IS NOT NULL THEN
    NEW.equity_margin_pct := (NEW.equity_estimate / NEW.arv_estimate) * 100;
  ELSE
    NEW.equity_margin_pct := NULL;
  END IF;

  -- total_score
  NEW.total_score := COALESCE(NEW.occ_pts, 0) + COALESCE(NEW.mot_pts, 0) +
    COALESCE(NEW.title_pts, 0) + COALESCE(NEW.contact_pts, 0) +
    COALESCE(NEW.timing_pts, 0) + COALESCE(NEW.equity_pts, 0) +
    COALESCE(NEW.tax_pts, 0);

  -- priority_tier (from tier_thresholds table)
  SELECT tier_name INTO NEW.priority_tier
  FROM public.tier_thresholds
  WHERE NEW.total_score >= min_score
  ORDER BY min_score DESC
  LIMIT 1;

  IF NEW.priority_tier IS NULL THEN
    NEW.priority_tier := 'Tier 4';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_compute_fields
  BEFORE INSERT OR UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.compute_lead_fields();

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX idx_leads_county ON public.leads(county_id);
CREATE INDEX idx_leads_status ON public.leads(deal_status);
CREATE INDEX idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX idx_leads_sale_date ON public.leads(sale_date);
CREATE INDEX idx_leads_lead_id ON public.leads(lead_id);
CREATE INDEX idx_leads_total_score ON public.leads(total_score DESC);

-- =============================================
-- 6. ACTIVITIES
-- =============================================
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'call', 'sms', 'email', 'comment', 'note', 'status_change',
    'field_change', 'voicemail', 'meeting', 'task'
  )),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  channel TEXT, -- Phone, SMS, Email, Door knock, Mail, etc.
  subject TEXT,
  body TEXT,
  result TEXT, -- e.g., 'No answer', 'Left VM', 'Spoke with owner'
  spoke_with TEXT,
  offer_ask TEXT,
  owner_motivation TEXT,
  follow_up_date DATE,
  next_step TEXT,
  duration_seconds INTEGER,
  metadata JSONB DEFAULT '{}',
  close_crm_activity_id TEXT, -- external ID for Close sync
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX idx_activities_lead ON public.activities(lead_id);
CREATE INDEX idx_activities_created ON public.activities(created_at DESC);
CREATE INDEX idx_activities_type ON public.activities(activity_type);
CREATE INDEX idx_activities_user ON public.activities(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_thresholds ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- COUNTIES policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view counties" ON public.counties
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage counties" ON public.counties
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- LEADS policies
CREATE POLICY "Admins can manage all leads" ON public.leads
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can view assigned leads" ON public.leads
  FOR SELECT USING (
    assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Agents can update assigned leads" ON public.leads
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ACTIVITIES policies
CREATE POLICY "Users can view activities for accessible leads" ON public.activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = activities.lead_id
      AND (leads.assigned_to = auth.uid() OR
           EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Users can create activities for accessible leads" ON public.activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE leads.id = lead_id
      AND (leads.assigned_to = auth.uid() OR
           EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
    )
  );

CREATE POLICY "Admins can manage all activities" ON public.activities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- SCORING CONFIG policies (read for all, write for admins)
CREATE POLICY "Authenticated users can view scoring config" ON public.scoring_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage scoring config" ON public.scoring_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- TIER THRESHOLDS policies
CREATE POLICY "Authenticated users can view tier thresholds" ON public.tier_thresholds
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage tier thresholds" ON public.tier_thresholds
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );
