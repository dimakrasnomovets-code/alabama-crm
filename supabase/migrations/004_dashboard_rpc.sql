-- =============================================
-- Phase 4: Dashboard RPCs
-- =============================================

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(start_date text DEFAULT NULL, end_date text DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  
  v_total_leads INTEGER;
  v_action_due_today INTEGER;
  v_avg_score NUMERIC;
  v_total_equity NUMERIC;
  
  v_zone_dist JSONB;
  v_tier_dist JSONB;
  v_funnel_dist JSONB;
  v_county_dist JSONB;
BEGIN

  -- Parse dates if provided, else use very wide range
  IF start_date IS NOT NULL THEN
    v_start := start_date::TIMESTAMPTZ;
  ELSE
    v_start := '2000-01-01'::TIMESTAMPTZ;
  END IF;

  IF end_date IS NOT NULL THEN
    v_end := end_date::TIMESTAMPTZ;
  ELSE
    v_end := '2100-01-01'::TIMESTAMPTZ;
  END IF;

  -- 1. Get Top-Level KPIs (filtering by lead created_at)
  SELECT 
    COUNT(id),
    COUNT(id) FILTER (WHERE next_action_date = CURRENT_DATE),
    COALESCE(AVG(total_score), 0),
    COALESCE(SUM(equity_estimate), 0)
  INTO 
    v_total_leads, 
    v_action_due_today, 
    v_avg_score, 
    v_total_equity
  FROM public.leads
  WHERE created_at >= v_start AND created_at <= v_end;

  -- 2. Zone Distribution
  SELECT COALESCE(jsonb_object_agg(COALESCE(zone, 'Unzoned'), count_val), '{}'::jsonb)
  INTO v_zone_dist
  FROM (
    SELECT zone, COUNT(id) as count_val 
    FROM public.leads 
    WHERE created_at >= v_start AND created_at <= v_end
    GROUP BY zone
  ) sub;

  -- 3. Tier Distribution
  SELECT COALESCE(jsonb_object_agg(COALESCE(priority_tier, 'Un-tiered'), count_val), '{}'::jsonb)
  INTO v_tier_dist
  FROM (
    SELECT priority_tier, COUNT(id) as count_val 
    FROM public.leads 
    WHERE created_at >= v_start AND created_at <= v_end
    GROUP BY priority_tier
  ) sub;

  -- 4. Pipeline Funnel (deal_status)
  SELECT COALESCE(jsonb_object_agg(COALESCE(deal_status, 'Unknown'), count_val), '{}'::jsonb)
  INTO v_funnel_dist
  FROM (
    SELECT deal_status, COUNT(id) as count_val 
    FROM public.leads 
    WHERE created_at >= v_start AND created_at <= v_end
    GROUP BY deal_status
  ) sub;

  -- 5. County Distribution
  SELECT COALESCE(jsonb_object_agg(COALESCE(c.name, 'Unknown'), count_val), '{}'::jsonb)
  INTO v_county_dist
  FROM (
    SELECT c.name, COUNT(l.id) as count_val 
    FROM public.leads l
    LEFT JOIN public.counties c ON l.county_id = c.id
    WHERE l.created_at >= v_start AND l.created_at <= v_end
    GROUP BY c.name
  ) sub;

  RETURN jsonb_build_object(
    'kpis', jsonb_build_object(
      'total_leads', v_total_leads,
      'action_due_today', v_action_due_today,
      'avg_score', v_avg_score,
      'total_equity', v_total_equity
    ),
    'distributions', jsonb_build_object(
      'zones', v_zone_dist,
      'tiers', v_tier_dist,
      'pipeline', v_funnel_dist,
      'counties', v_county_dist
    )
  );
END;
$$;


CREATE OR REPLACE FUNCTION public.get_activity_volume(start_date text DEFAULT NULL, end_date text DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
  v_result JSONB;
BEGIN

  IF start_date IS NOT NULL THEN
    v_start := start_date::TIMESTAMPTZ;
  ELSE
    v_start := CURRENT_DATE - INTERVAL '30 days';
  END IF;

  IF end_date IS NOT NULL THEN
    v_end := end_date::TIMESTAMPTZ;
  ELSE
    v_end := '2100-01-01'::TIMESTAMPTZ;
  END IF;

  -- Group by date and type
  SELECT COALESCE(jsonb_agg(row_to_json(sub)), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT 
      DATE(created_at) as date_val,
      activity_type,
      COUNT(id) as count_val
    FROM public.activities
    WHERE created_at >= v_start AND created_at <= v_end
      AND activity_type IN ('call', 'sms', 'note', 'email', 'meeting')
    GROUP BY DATE(created_at), activity_type
    ORDER BY DATE(created_at) ASC
  ) sub;

  RETURN v_result;
END;
$$;
