// Direct Google Gemini API (no OpenRouter middleman).
// Same exported function signature as config/openRouter.js so it's a
// drop-in replacement wherever generateResponse(prompt) is used.

// Swap to "gemini-2.5-pro" here for higher quality (slower, pricier),
// or keep "gemini-2.5-flash" for fast + cheap (current default).
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const generateResponse = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;

    const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: "You must return ONLY valid raw JSON. No markdown, no code fences, no explanation text." }],
            },
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 60000,
                thinkingConfig: {
                    thinkingBudget: 0,
                },
            },
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error("gemini err" + err);
    }

    const data = await res.json();

    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("");

    if (!text) {
        throw new Error("gemini err: empty response " + JSON.stringify(data));
    }

    return text;
};