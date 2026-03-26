export class CloseCRMClient {
  private apiKey: string;
  private baseUrl = "https://api.close.com/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchClose(endpoint: string, options: RequestInit = {}) {
    const authHeader = btoa(`${this.apiKey}:`);
    const defaultHeaders = {
      "Authorization": `Basic ${authHeader}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Close API Error (${res.status}): ${errText}`);
    }

    return res.json();
  }

  // Abstract mappings based on standard payload rules for Close.com POST /lead/
  public async pushLead(lead: any) {
    // 1. Map Contact info
    const contact: any = {
      name: lead.borrower_name || "Unknown Owner",
    };
    if (lead.phone) contact.phones = [{ phone: lead.phone, type: "office" }];
    if (lead.email) contact.emails = [{ email: lead.email, type: "office" }];

    // 2. Map Address info
    const address: any = {
      address_1: lead.property_address,
      state: "AL", // Alabama context
    };

    // 3. Status mapping (attempt exact string match, Close usually ignores or forces creation of status if settings allow, 
    // but ideally we map deal_status to status_id. For MVP we push deal_status into a custom schema).
    
    // We append custom fields generically
    const custom: Record<string, any> = {
      "Alabama Lead ID": lead.id,
      "Sale Date": lead.sale_date,
      "ARV Estimate": lead.arv_estimate,
      "Repair Estimate": lead.repair_estimate,
      "Equity Estimate": lead.equity_estimate,
      "Priority Tier": lead.priority_tier,
      "Zone": lead.zone,
    };

    const payload: any = {
      name: `${lead.property_address} - ${lead.borrower_name || "Unknown"}`,
      contacts: [contact],
      addresses: [address],
      custom
    };

    // If it already has a Close CRM Lead ID, we update, else create.
    if (lead.close_crm_lead_id) {
       return await this.fetchClose(`/lead/${lead.close_crm_lead_id}/`, {
         method: 'PUT',
         body: JSON.stringify(payload)
       });
    } else {
       return await this.fetchClose(`/lead/`, {
         method: 'POST',
         body: JSON.stringify(payload)
       });
    }
  }

  public async pushActivity(activity: any, closeLeadId: string) {
    let endpoint = "/activity/note/";
    let payload: any = {
       lead_id: closeLeadId,
    };

    if (activity.activity_type === 'note') {
       payload.note = activity.body || "Empty note";
    } else if (activity.activity_type === 'call') {
       endpoint = "/activity/call/";
       payload.note = activity.body;
       payload.direction = activity.direction;
       payload.duration = activity.metadata?.duration;
    } else if (activity.activity_type === 'sms') {
       endpoint = "/activity/sms/";
       payload.text = activity.body;
       payload.direction = activity.direction;
       payload.status = "sent";
    } else if (activity.activity_type === 'email') {
       endpoint = "/activity/email/";
       payload.body_text = activity.body;
       payload.subject = activity.metadata?.subject || "Logged Email";
       payload.direction = activity.direction;
       payload.status = "sent";
    }

    return await this.fetchClose(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
}
