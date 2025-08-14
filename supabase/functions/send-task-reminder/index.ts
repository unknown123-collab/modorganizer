import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaskReminderRequest {
  email: string;
  userName: string;
  taskTitle: string;
  taskDescription?: string;
  scheduledDate: string;
  reminderType: 'tomorrow' | 'today';
}

const getReminderContent = (type: 'tomorrow' | 'today', taskTitle: string) => {
  const tomorrowMessages = [
    "⏰ Reminder: Your task kicks off tomorrow. Please take a moment to prepare so you're ready to go!",
    "🚀 Heads‑up! Your task begins tomorrow — gear up and get set for success.",
    "📅 Friendly Reminder: Task starts tomorrow. Double‑check your plans and be ready to shine.",
    "⚡ Almost Go Time: Your task starts tomorrow — prep today, ace it tomorrow."
  ];

  const todayMessages = [
    "🔔 Reminder: Your task begins today. Please get everything set and ready before the start time.",
    "⚡ It's Go Time: Your task starts today — bring your A‑game and make it count!",
    "📋 Heads‑up: Today's the day! Your task is about to begin, so prep up and enjoy the process.",
    "🎯 Hoy! Ngayon na ang simula ng task mo — ayusin mo na lahat para smooth sailing."
  ];

  const messages = type === 'tomorrow' ? tomorrowMessages : todayMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  return {
    subject: type === 'tomorrow' ? `Tomorrow: ${taskTitle} - MODO Reminder` : `Today: ${taskTitle} - MODO Reminder`,
    message: randomMessage
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userName, taskTitle, taskDescription, scheduledDate, reminderType }: TaskReminderRequest = await req.json();
    
    const { subject, message } = getReminderContent(reminderType, taskTitle);
    
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">MODO</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Task Reminder</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-size: 18px; color: #333; margin: 0 0 15px 0;">Hi ${userName}!</p>
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 20px 0;">${message}</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">📋 Task Details</h3>
            <p style="color: #555; margin: 0 0 8px 0;"><strong>Task:</strong> ${taskTitle}</p>
            ${taskDescription ? `<p style="color: #555; margin: 0 0 8px 0;"><strong>Description:</strong> ${taskDescription}</p>` : ''}
            <p style="color: #555; margin: 0;"><strong>Scheduled:</strong> ${new Date(scheduledDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p style="margin: 0;">You're receiving this because you have task reminders enabled in MODO.</p>
          <p style="margin: 5px 0 0 0;">Keep crushing your goals! 💪</p>
        </div>
      </div>
    `;

    const emailResponse = await resend.emails.send({
      from: "MODO <onboarding@resend.dev>",
      to: [email],
      subject: subject,
      html: emailHtml,
    });

    console.log("Task reminder email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending task reminder email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);