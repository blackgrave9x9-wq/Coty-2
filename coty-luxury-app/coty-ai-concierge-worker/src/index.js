export default {
  async fetch(request, env) {
    // CORS Headers: Tunaruhusu website yako ya lyra-luxury.pages.dev
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://lyra-luxury.pages.dev",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Kushughulikia Preflight (OPTIONS) - Hii ndiyo inayozuia CORS error
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { messages } = await request.json();
      const apiKey = env.GEMINI_API_KEY;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.map(m => ({ 
            role: m.role === 'assistant' ? 'model' : 'user', 
            parts: [{ text: m.content }] 
          }))
        })
      });

      const data = await response.json();
      
      // Rudisha jibu na CORS headers
      return new Response(JSON.stringify(data), {
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
