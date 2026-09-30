// // Finds {{IMG: keyword description}} placeholders inside AI-generated HTML
// // and replaces them with a REAL image URL found by actually searching
// // Unsplash for that keyword.

// const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

// const FALLBACK_IMAGE =
//     "data:image/svg+xml;charset=UTF-8," +
//     encodeURIComponent(
//         `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
//             <rect width="1200" height="800" fill="#e5e7eb"/>
//             <g fill="#9ca3af">
//                 <circle cx="600" cy="330" r="70"/>
//                 <path d="M420 560 L560 420 L680 540 L780 440 L900 560 L900 620 L420 620 Z"/>
//             </g>
//         </svg>`
//     );

// const PLACEHOLDER_REGEX = /\{\{\s*IMG\s*:\s*([^}]+?)\s*\}\}/gi;

// const RAW_IMG_TAG_REGEX = /<img\b[^>]*\bsrc=["']https:\/\/images\.unsplash\.com\/[^"']*["'][^>]*>/gi;
// const ALT_ATTR_REGEX = /\balt=["']([^"']*)["']/i;
// const SRC_ATTR_REGEX = /\bsrc=["'][^"']*["']/i;

// const RAW_CSS_URL_REGEX = /url\((['"]?)(https:\/\/images\.unsplash\.com\/[^'")]+)\1\)/gi;

// const cache = new Map();

// const searchUnsplash = async (keyword) => {
//     if (cache.has(keyword)) return cache.get(keyword);

//     const accessKey = process.env.UNSPLASH_ACCESS_KEY;
//     if (!accessKey) {
//         cache.set(keyword, FALLBACK_IMAGE);
//         return FALLBACK_IMAGE;
//     }

//     try {
//         const url = `${UNSPLASH_SEARCH_URL}?query=${encodeURIComponent(
//             keyword
//         )}&per_page=1&orientation=landscape&content_filter=high`;

//         const res = await fetch(url, {
//             headers: { Authorization: `Client-ID ${accessKey}` },
//         });

//         if (!res.ok) throw new Error(`unsplash status ${res.status}`);

//         const data = await res.json();
//         const photo = data?.results?.[0];

//         const finalUrl = photo
//             ? `${photo.urls.raw}&auto=format&fit=crop&w=1200&q=80`
//             : FALLBACK_IMAGE;

//         cache.set(keyword, finalUrl);
//         return finalUrl;
//     } catch (error) {
//         console.log("unsplash search failed for", keyword, error.message);
//         cache.set(keyword, FALLBACK_IMAGE);
//         return FALLBACK_IMAGE;
//     }
// };

// const resolveImages = async (html) => {
//     if (!html) return html;

//     let result = html;

//     if (result.includes("{{IMG:")) {
//         const matches = [...result.matchAll(PLACEHOLDER_REGEX)];
//         if (matches.length > 0) {
//             const uniqueKeywords = [...new Set(matches.map((m) => m[1].trim()))];
//             const resolved = await Promise.all(
//                 uniqueKeywords.map(async (keyword) => [keyword, await searchUnsplash(keyword)])
//             );
//             const keywordToUrl = new Map(resolved);
//             result = result.replace(PLACEHOLDER_REGEX, (_, rawKeyword) => {
//                 const keyword = rawKeyword.trim();
//                 return keywordToUrl.get(keyword) || FALLBACK_IMAGE;
//             });
//         }
//     }

//     const rawImgTags = [...result.matchAll(RAW_IMG_TAG_REGEX)];
//     for (const match of rawImgTags) {
//         const tag = match[0];
//         const altMatch = tag.match(ALT_ATTR_REGEX);
//         const keyword = (altMatch && altMatch[1].trim()) || "product photo";
//         const newUrl = await searchUnsplash(keyword);
//         const newTag = tag.replace(SRC_ATTR_REGEX, `src="${newUrl}"`);
//         result = result.replace(tag, newTag);
//     }

//     result = result.replace(RAW_CSS_URL_REGEX, () => `url('${FALLBACK_IMAGE}')`);

//     return result;
// };

// export default resolveImages;


// Finds {{IMG: keyword description}} placeholders inside AI-generated HTML
// and replaces them with a REAL image URL found by actually searching a
// real photo library for that keyword. Pexels is tried first (200
// requests/hour free tier — much more generous than Unsplash's 50/hour
// demo limit), with Unsplash as a secondary backup, and a guaranteed
// inline placeholder as the final fallback.

const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";
const UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos";

const FALLBACK_IMAGE =
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
            <rect width="1200" height="800" fill="#e5e7eb"/>
            <g fill="#9ca3af">
                <circle cx="600" cy="330" r="70"/>
                <path d="M420 560 L560 420 L680 540 L780 440 L900 560 L900 620 L420 620 Z"/>
            </g>
        </svg>`
    );

const PLACEHOLDER_REGEX = /\{\{\s*IMG\s*:\s*([^}]+?)\s*\}\}/gi;

const RAW_IMG_TAG_REGEX = /<img\b[^>]*\bsrc=["']https:\/\/images\.unsplash\.com\/[^"']*["'][^>]*>/gi;
const ALT_ATTR_REGEX = /\balt=["']([^"']*)["']/i;
const SRC_ATTR_REGEX = /\bsrc=["'][^"']*["']/i;

const RAW_CSS_URL_REGEX = /url\((['"]?)(https:\/\/images\.unsplash\.com\/[^'")]+)\1\)/gi;

const cache = new Map();

const tryPexels = async (keyword) => {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) return null;

    const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(keyword)}&per_page=1&orientation=landscape`;
    const res = await fetch(url, {
        headers: { Authorization: apiKey },
    });

    if (!res.ok) throw new Error(`pexels status ${res.status}`);

    const data = await res.json();
    const photo = data?.photos?.[0];
    return photo ? photo.src.large2x || photo.src.large || photo.src.original : null;
};

const tryUnsplash = async (keyword) => {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) return null;

    const url = `${UNSPLASH_SEARCH_URL}?query=${encodeURIComponent(
        keyword
    )}&per_page=1&orientation=landscape&content_filter=high`;

    const res = await fetch(url, {
        headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!res.ok) throw new Error(`unsplash status ${res.status}`);

    const data = await res.json();
    const photo = data?.results?.[0];
    return photo ? `${photo.urls.raw}&auto=format&fit=crop&w=1200&q=80` : null;
};

const searchUnsplash = async (keyword) => {
    if (cache.has(keyword)) return cache.get(keyword);

    try {
        const pexelsUrl = await tryPexels(keyword);
        if (pexelsUrl) {
            cache.set(keyword, pexelsUrl);
            return pexelsUrl;
        }
    } catch (error) {
        console.log("pexels search failed for", keyword, error.message);
    }

    try {
        const unsplashUrl = await tryUnsplash(keyword);
        if (unsplashUrl) {
            cache.set(keyword, unsplashUrl);
            return unsplashUrl;
        }
    } catch (error) {
        console.log("unsplash search failed for", keyword, error.message);
    }

    cache.set(keyword, FALLBACK_IMAGE);
    return FALLBACK_IMAGE;
};

const resolveImages = async (html) => {
    if (!html) return html;

    let result = html;

    if (result.includes("{{IMG:")) {
        const matches = [...result.matchAll(PLACEHOLDER_REGEX)];
        if (matches.length > 0) {
            const uniqueKeywords = [...new Set(matches.map((m) => m[1].trim()))];
            const resolved = await Promise.all(
                uniqueKeywords.map(async (keyword) => [keyword, await searchUnsplash(keyword)])
            );
            const keywordToUrl = new Map(resolved);
            result = result.replace(PLACEHOLDER_REGEX, (_, rawKeyword) => {
                const keyword = rawKeyword.trim();
                return keywordToUrl.get(keyword) || FALLBACK_IMAGE;
            });
        }
    }

    const rawImgTags = [...result.matchAll(RAW_IMG_TAG_REGEX)];
    for (const match of rawImgTags) {
        const tag = match[0];
        const altMatch = tag.match(ALT_ATTR_REGEX);
        const keyword = (altMatch && altMatch[1].trim()) || "product photo";
        const newUrl = await searchUnsplash(keyword);
        const newTag = tag.replace(SRC_ATTR_REGEX, `src="${newUrl}"`);
        result = result.replace(tag, newTag);
    }

    result = result.replace(RAW_CSS_URL_REGEX, () => `url('${FALLBACK_IMAGE}')`);

    return result;
};

export default resolveImages;