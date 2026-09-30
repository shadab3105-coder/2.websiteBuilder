// Replaces the old JSON-based extraction. Asking an AI model to wrap
// large HTML/CSS/JS inside a JSON string means it must perfectly escape
// every quote and backslash — in practice this reliably breaks on real
// websites (unterminated strings, bad escape sequences, truncation).
// Instead we ask the model for plain-text marker blocks and split on
// those markers directly, so no JSON escaping is ever required for the
// actual code content.

const extractBetween = (text, startMarker, endMarker) => {
    const startIndex = text.indexOf(startMarker)
    if (startIndex === -1) return null
    const contentStart = startIndex + startMarker.length
    const endIndex = text.indexOf(endMarker, contentStart)
    if (endIndex === -1) return null
    return text.slice(contentStart, endIndex).trim()
}

const extractStructured = async (text) => {
    if (!text) return null

    const cleaned = text.replace(/```[a-zA-Z]*\n?/g, "").trim()

    const message = extractBetween(cleaned, "===MESSAGE===", "===CODE===")
    const code = extractBetween(cleaned, "===CODE===", "===END===")

    if (!code) return null

    const result = { message: message || "", code }

    if (cleaned.includes("===BACKEND_FILE:")) {
        const afterEnd = cleaned.slice(cleaned.indexOf("===END===") + "===END===".length)
        const fileRegex = /===BACKEND_FILE:\s*([^\n=]+?)\s*===/g
        const matches = [...afterEnd.matchAll(fileRegex)]

        if (matches.length > 0) {
            const backend = {}
            for (let i = 0; i < matches.length; i++) {
                const filePath = matches[i][1].trim()
                const contentStart = matches[i].index + matches[i][0].length
                const contentEnd = i + 1 < matches.length
                    ? matches[i + 1].index
                    : afterEnd.indexOf("===END_BACKEND===", contentStart)
                const fileContent = (contentEnd === -1 ? afterEnd.slice(contentStart) : afterEnd.slice(contentStart, contentEnd)).trim()
                backend[filePath] = fileContent
            }
            result.backend = backend
        }
    }

    return result
}

export default extractStructured