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
    const systemPrompt = `You are an expert task prioritization assistant. Analyze overlapping tasks and recommend which should be prioritized based on their descriptions, categories, and urgency. Consider:
1. Business impact and deadlines
2. Dependencies mentioned in descriptions
3. Client-facing vs internal tasks
4. Urgency indicators in the description
5. Task categories and their relative importance

Provide clear, actionable reasoning for your recommendation.`;

    const userPrompt = `Analyze these overlapping tasks and recommend which should be prioritized:

${tasks.map((t: any, idx: number) => `
Task ${idx + 1}:
- Title: ${t.title}
- Description: ${t.description || 'No description'}
- Category: ${t.category || 'No category'}
- Priority: ${t.priority}
- Time: ${t.time_starts} to ${t.time_ends}
`).join('\n')}

Return your analysis with the recommended task and reasoning.`;

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
              description: "Return task prioritization recommendation with reasoning",
              parameters: {
                type: "object",
                properties: {
                  recommended_task_index: {
                    type: "number",
                    description: "Index of the recommended task (0-based)"
                  },
                  reasoning: {
                    type: "string",
                    description: "Clear explanation for why this task should be prioritized"
                  },
                  key_factors: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key factors that influenced the decision"
                  }
                },
                required: ["recommended_task_index", "reasoning", "key_factors"],
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