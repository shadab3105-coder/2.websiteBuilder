const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
const model = "deepseek/deepseek-chat"

const callOpenRouter = async (prompt, maxTokens) => {
    const res = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: "system", content: "You must return ONLY valid raw JSON." },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            max_tokens: maxTokens,
            temperature: 0.2
        }),
    });

    return res
}

export const generateResponse = async (prompt) => {
    const DESIRED_MAX_TOKENS = 6000
    const SAFETY_BUFFER = 200

    let res = await callOpenRouter(prompt, DESIRED_MAX_TOKENS)

    if (!res.ok) {
        const errText = await res.text()

        const affordMatch = errText.match(/can only afford (\d+)/i)
        if (res.status === 402 && affordMatch) {
            const affordable = parseInt(affordMatch[1], 10) - SAFETY_BUFFER
            if (affordable > 500) {
                console.log(`retrying with reduced max_tokens: ${affordable}`)
                res = await callOpenRouter(prompt, affordable)
            } else {
                throw new Error("openRouter err: not enough credits, please top up at https://openrouter.ai/settings/credits")
            }
        } else {
            throw new Error("openRouter err" + errText)
        }
    }

    if (!res.ok) {
        const err = await res.text()
        throw new Error("openRouter err" + err)
    }

    const data = await res.json()
    return data.choices[0].message.content
}