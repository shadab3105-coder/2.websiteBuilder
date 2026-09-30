// Escapes stray raw control characters (literal newlines, tabs, carriage
// returns) that end up INSIDE JSON string values — AI models sometimes
// output real line breaks in the "code" field instead of the required
// \n escape sequence, which breaks JSON.parse with "Unterminated string".
// This walks the text char-by-char, tracking whether we're inside a
// quoted string, and only touches control chars found there.
const sanitizeJsonString = (jsonString) => {
    let result = "";
    let inString = false;
    let isEscaped = false;

    for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString[i];

        if (inString) {
            if (isEscaped) {
                result += char;
                isEscaped = false;
                continue;
            }
            if (char === "\\") {
                result += char;
                isEscaped = true;
                continue;
            }
            if (char === '"') {
                result += char;
                inString = false;
                continue;
            }
            if (char === "\n") { result += "\\n"; continue; }
            if (char === "\r") { result += "\\r"; continue; }
            if (char === "\t") { result += "\\t"; continue; }

            result += char;
        } else {
            if (char === '"') inString = true;
            result += char;
        }
    }

    return result;
};

const extractJson = async (text) => {
    if (!text) {
        return
    }
    const cleaned = text.
         replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

        const firstBrace=cleaned.indexOf('{')
        const closeBrace=cleaned.lastIndexOf('}')
        if(firstBrace===-1 || closeBrace==-1)return null
        const jsonString=cleaned.slice(firstBrace,closeBrace+1)

        try {
            return JSON.parse(jsonString)
        } catch (error) {
            try {
                return JSON.parse(sanitizeJsonString(jsonString))
            } catch (secondError) {
                console.log("extractJson: failed even after sanitizing", secondError.message)
                return null
            }
        }

}
export default extractJson