export default {
  async fetch(request, env, ctx) {
    // CORS Headers: Tunaruhusu website yako ya Pages kuwasiliana na Worker
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://cotycostumerservice.blackgrave9x9.workers.dev/",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Kushughulikia "Preflight" request (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Hapa ndipo kodi yako ya Gemini inapoanza
      const { messages, tools } = await request.json();
      const apiKey = env.GEMINI_API_KEY;

      // ... (Hapa weka kodi yako ya kupiga Gemini API) ...

      // Mfano wa Response (Hakikisha unaongeza corsHeaders kwenye response yako)
      return new Response(JSON.stringify({ /* data zako */ }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
}
