export default {
  async fetch(request, env) {
    // 1. Headers za CORS - Tunaziruhusu hapa kwanza
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://lyra-luxury.pages.dev",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // 2. SHUGHULIKIA "OPTIONS" (Preflight)
    // Hii ndio sehemu inayoziba lile kosa la "Preflight request doesn't pass"
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // 3. LOGIC YA AI
    try {
      if (request.method === "POST") {
        const { messages } = await request.json();
        const apiKey = env.GEMINI_API_KEY;

        // Hapa ndipo tunaita Gemini
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: messages.map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }]
              }))
            })
          }
        );

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI";

        // RUDISHA JIBU NA HEADERS ZA CORS
        return new Response(JSON.stringify({ reply: text }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response("Method not allowed", { status: 405, headers: corsHeaders });

    } catch (e) {
      // HATA KAMA AI INAFELI, LAZIMA URUDISHE CORS HEADERS ILI UONE ERROR
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};
