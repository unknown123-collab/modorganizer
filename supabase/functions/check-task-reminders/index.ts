import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 Checking for task reminders...");
    
    // Get current date and tomorrow's date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    console.log(`📅 Today: ${today.toISOString()}, Tomorrow: ${tomorrow.toISOString()}`);

    // Get time blocks scheduled for tomorrow (for tomorrow reminders) - only for users with notifications enabled
    const { data: tomorrowBlocks, error: tomorrowError } = await supabase
      .from('time_blocks')
      .select(`
        *,
        tasks:task_id (
          id,
          title,
          description
        ),
        profiles:user_id (
          email,
          full_name
        ),
        user_settings:user_id (
          email_notifications
        )
      `)
      .gte('start_time', tomorrow.toISOString())
      .lt('start_time', dayAfterTomorrow.toISOString())
      .eq('completed', false);

    if (tomorrowError) {
      console.error("Error fetching tomorrow's time blocks:", tomorrowError);
      throw tomorrowError;
    }

    console.log(`📨 Found ${tomorrowBlocks?.length || 0} time blocks for tomorrow`);

    // Get time blocks scheduled for today (for today reminders) - only for users with notifications enabled
    const { data: todayBlocks, error: todayError } = await supabase
      .from('time_blocks')
      .select(`
        *,
        tasks:task_id (
          id,
          title,
          description
        ),
        profiles:user_id (
          email,
          full_name
        ),
        user_settings:user_id (
          email_notifications
        )
      `)
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .eq('completed', false);

    if (todayError) {
      console.error("Error fetching today's time blocks:", todayError);
      throw todayError;
    }

    console.log(`📨 Found ${todayBlocks?.length || 0} time blocks for today`);

    let emailsSent = 0;

    // Send tomorrow reminders
    if (tomorrowBlocks && tomorrowBlocks.length > 0) {
      for (const block of tomorrowBlocks) {
        if (block.tasks && block.profiles && block.user_settings?.email_notifications !== false) {
          try {
            const response = await fetch(`${supabaseUrl}/functions/v1/send-task-reminder`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                email: block.profiles.email,
                userName: block.profiles.full_name || 'there',
                taskTitle: block.tasks.title,
                taskDescription: block.tasks.description,
                scheduledDate: block.start_time,
                reminderType: 'tomorrow'
              }),
            });

            if (response.ok) {
              console.log(`✅ Tomorrow reminder sent for task: ${block.tasks.title}`);
              emailsSent++;
            } else {
              console.error(`❌ Failed to send tomorrow reminder for task: ${block.tasks.title}`);
            }
          } catch (emailError) {
            console.error(`❌ Error sending tomorrow reminder:`, emailError);
          }
        }
      }
    }

    // Send today reminders
    if (todayBlocks && todayBlocks.length > 0) {
      for (const block of todayBlocks) {
        if (block.tasks && block.profiles && block.user_settings?.email_notifications !== false) {
          try {
            const response = await fetch(`${supabaseUrl}/functions/v1/send-task-reminder`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                email: block.profiles.email,
                userName: block.profiles.full_name || 'there',
                taskTitle: block.tasks.title,
                taskDescription: block.tasks.description,
                scheduledDate: block.start_time,
                reminderType: 'today'
              }),
            });

            if (response.ok) {
              console.log(`✅ Today reminder sent for task: ${block.tasks.title}`);
              emailsSent++;
            } else {
              console.error(`❌ Failed to send today reminder for task: ${block.tasks.title}`);
            }
          } catch (emailError) {
            console.error(`❌ Error sending today reminder:`, emailError);
          }
        }
      }
    }

    const result = {
      success: true,
      message: `Task reminder check completed`,
      tomorrowTasksFound: tomorrowBlocks?.length || 0,
      todayTasksFound: todayBlocks?.length || 0,
      emailsSent,
      timestamp: new Date().toISOString()
    };

    console.log("📊 Task reminder summary:", result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ Error in check-task-reminders function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);