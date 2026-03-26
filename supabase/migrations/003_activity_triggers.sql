-- =============================================
-- Phase 3: Activity Triggers for Auto-Logging
-- =============================================

-- Trigger function to auto-log lead creation and updates
CREATE OR REPLACE FUNCTION public.log_lead_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_assigned_name TEXT;
  v_old_assigned_name TEXT;
  v_field_key TEXT;
  v_old_val TEXT;
  v_new_val TEXT;
  v_changes JSONB;
BEGIN
  -- 1. Handle INSERT (New Lead)
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.activities (
      lead_id, activity_type, body, metadata
    ) VALUES (
      NEW.id, 'note', 'Lead created', '{"source": "system"}'::jsonb
    );
    
    -- If created with an assignee, log that too
    IF NEW.assigned_to IS NOT NULL THEN
      SELECT full_name INTO v_assigned_name FROM public.users WHERE id = NEW.assigned_to;
      INSERT INTO public.activities (
        lead_id, activity_type, body, metadata
      ) VALUES (
        NEW.id, 'note', 'Lead assigned to ' || COALESCE(v_assigned_name, 'Unknown User'), '{"source": "system"}'::jsonb
      );
    END IF;
    
    RETURN NEW;
  END IF;

  -- 2. Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    
    -- Check Deal Status Change
    IF NEW.deal_status IS DISTINCT FROM OLD.deal_status THEN
      INSERT INTO public.activities (
        lead_id, activity_type, body, metadata
      ) VALUES (
        NEW.id, 'status_change', 
        'Status changed from ' || COALESCE(OLD.deal_status, 'None') || ' → ' || NEW.deal_status,
        jsonb_build_object('old_status', OLD.deal_status, 'new_status', NEW.deal_status)
      );
    END IF;

    -- Check Assigned To Change
    IF NEW.assigned_to IS DISTINCT FROM OLD.assigned_to THEN
      IF NEW.assigned_to IS NOT NULL THEN
        SELECT full_name INTO v_assigned_name FROM public.users WHERE id = NEW.assigned_to;
        INSERT INTO public.activities (
          lead_id, activity_type, body, metadata
        ) VALUES (
          NEW.id, 'note', 'Lead assigned to ' || COALESCE(v_assigned_name, 'Unknown User'), 
          jsonb_build_object('old_assigned_to', OLD.assigned_to, 'new_assigned_to', NEW.assigned_to)
        );
      ELSE
        INSERT INTO public.activities (
          lead_id, activity_type, body, metadata
        ) VALUES (
          NEW.id, 'note', 'Lead unassigned', 
          jsonb_build_object('old_assigned_to', OLD.assigned_to)
        );
      END IF;
    END IF;

    -- General Field Changes
    -- We will check a set of important fields to avoid logging system updates (like updated_at or total_score)
    IF NEW.property_address IS DISTINCT FROM OLD.property_address THEN
      INSERT INTO public.activities (lead_id, activity_type, body, metadata) VALUES 
      (NEW.id, 'field_change', 'Field Property Address updated: ' || COALESCE(OLD.property_address, 'None') || ' → ' || NEW.property_address,
       jsonb_build_object('field', 'property_address', 'old', OLD.property_address, 'new', NEW.property_address));
    END IF;

    IF NEW.sale_date IS DISTINCT FROM OLD.sale_date THEN
      INSERT INTO public.activities (lead_id, activity_type, body, metadata) VALUES 
      (NEW.id, 'field_change', 'Field Sale Date updated: ' || COALESCE(OLD.sale_date::text, 'None') || ' → ' || NEW.sale_date::text,
       jsonb_build_object('field', 'sale_date', 'old', OLD.sale_date, 'new', NEW.sale_date));
    END IF;
    
    IF NEW.arv_estimate IS DISTINCT FROM OLD.arv_estimate THEN
      INSERT INTO public.activities (lead_id, activity_type, body, metadata) VALUES 
      (NEW.id, 'field_change', 'Field ARV Estimate updated: ' || COALESCE(OLD.arv_estimate::text, 'None') || ' → ' || NEW.arv_estimate::text,
       jsonb_build_object('field', 'arv_estimate', 'old', OLD.arv_estimate, 'new', NEW.arv_estimate));
    END IF;
    
    IF NEW.repair_estimate IS DISTINCT FROM OLD.repair_estimate THEN
      INSERT INTO public.activities (lead_id, activity_type, body, metadata) VALUES 
      (NEW.id, 'field_change', 'Field Repair Estimate updated: ' || COALESCE(OLD.repair_estimate::text, 'None') || ' → ' || NEW.repair_estimate::text,
       jsonb_build_object('field', 'repair_estimate', 'old', OLD.repair_estimate, 'new', NEW.repair_estimate));
    END IF;

    IF NEW.motivation IS DISTINCT FROM OLD.motivation THEN
      INSERT INTO public.activities (lead_id, activity_type, body, metadata) VALUES 
      (NEW.id, 'field_change', 'Field Motivation updated: ' || COALESCE(OLD.motivation, 'None') || ' → ' || NEW.motivation,
       jsonb_build_object('field', 'motivation', 'old', OLD.motivation, 'new', NEW.motivation));
    END IF;

    IF NEW.contactability IS DISTINCT FROM OLD.contactability THEN
      INSERT INTO public.activities (lead_id, activity_type, body, metadata) VALUES 
      (NEW.id, 'field_change', 'Field Contactability updated: ' || COALESCE(OLD.contactability, 'None') || ' → ' || NEW.contactability,
       jsonb_build_object('field', 'contactability', 'old', OLD.contactability, 'new', NEW.contactability));
    END IF;

    IF NEW.occupancy IS DISTINCT FROM OLD.occupancy THEN
      INSERT INTO public.activities (lead_id, activity_type, body, metadata) VALUES 
      (NEW.id, 'field_change', 'Field Occupancy updated: ' || COALESCE(OLD.occupancy, 'None') || ' → ' || NEW.occupancy,
       jsonb_build_object('field', 'occupancy', 'old', OLD.occupancy, 'new', NEW.occupancy));
    END IF;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to leads table
DROP TRIGGER IF EXISTS leads_activity_log ON public.leads;
CREATE TRIGGER leads_activity_log
  AFTER INSERT OR UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.log_lead_activity();
