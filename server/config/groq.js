// Groq API — extremely fast inference (LPU hardware), generous free tier
// (~14,400 requests/day). OpenAI-compatible chat completions format.
// Same exported function signature as the other config/*.js files so
// it's a drop-in replacement wherever generateResponse(prompt) is used.

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// Swap to "openai/gpt-oss-120b" here for stronger reasoning (slower),
// or keep "llama-3.3-70b-versatile" for fast + reliable general use.
const model = "meta-llama/llama-prompt-guard-2-86m";

export const generateResponse = async (prompt) => {
    const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: "You must return ONLY valid raw JSON." },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.2,
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error("groq err" + err);
    }

    const data = await res.json();
    return data.choices[0].message.content;
};