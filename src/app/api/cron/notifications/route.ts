import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Verify Cron secret
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Call the database function to generate notifications for approaching sales
    const { error } = await supabaseAdmin.rpc('check_approaching_sales');

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Approaching sales notifications checked.' });
  } catch (error: any) {
    console.error("Cron Notifications Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
