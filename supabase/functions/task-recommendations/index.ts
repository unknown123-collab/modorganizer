import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tasks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build prompt for AI to analyze overlapping tasks
    const systemPrompt = `You are an expert task prioritization assistant. Analyze overlapping or conflicting tasks and provide comprehensive recommendations for ${tasks.length} tasks.

Consider these critical factors:
1. **Urgency**: Fixed deadlines, time-sensitive events (defenses, presentations, meetings)
2. **Impact**: Academic, professional, career outcomes, project criticality
3. **Flexibility**: Which tasks can be rescheduled without major consequences
4. **Priority Level**: urgent-important > urgent-notImportant > notUrgent-important > notUrgent-notImportant
5. **Dependencies**: Tasks that block other work
6. **Duration**: Task length and complexity

Provide a clear prioritization ranking and specific rescheduling options for lower-priority tasks.`;

    const userPrompt = `${tasks.length} tasks are overlapping in the same time slot. Analyze all tasks and provide a complete prioritization:

${tasks.map((t: any, idx: number) => `
Task ${idx + 1}:
- Title: ${t.title}
- Description: ${t.description || 'No description'}
- Category: ${t.category || 'No category'}
- Priority Level: ${t.priority}
- Scheduled Time: ${new Date(t.time_starts).toLocaleString()} to ${new Date(t.time_ends).toLocaleString()}
- Duration: ${Math.round((new Date(t.time_ends).getTime() - new Date(t.time_starts).getTime()) / 60000)} minutes
`).join('\n')}

Provide:
1. The recommended task to execute first (highest priority)
2. Clear ranking of all tasks by priority
3. Specific rescheduling suggestions for tasks that should be moved
4. Detailed reasoning considering urgency, impact, and flexibility`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "prioritize_tasks",
              description: "Return comprehensive task prioritization with ranking and rescheduling options",
              parameters: {
                type: "object",
                properties: {
                  recommended_task_index: {
                    type: "number",
                    description: "Index of the highest priority task to execute first (0-based)"
                  },
                  reasoning: {
                    type: "string",
                    description: "Detailed explanation considering urgency, impact, flexibility, and deadlines"
                  },
                  key_factors: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key factors that influenced the decision (urgency, impact, flexibility, etc.)"
                  },
                  task_ranking: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task_index: { type: "number" },
                        rank: { type: "number" },
                        should_reschedule: { type: "boolean" }
                      }
                    },
                    description: "Complete ranking of all tasks with rescheduling flags"
                  },
                  rescheduling_suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        task_index: { type: "number" },
                        suggestion: { type: "string" }
                      }
                    },
                    description: "Specific rescheduling suggestions for tasks that should be moved"
                  }
                },
                required: ["recommended_task_index", "reasoning", "key_factors", "task_ranking", "rescheduling_suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "prioritize_tasks" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const recommendation = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(recommendation),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("task-recommendations error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});