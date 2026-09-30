// import { generateResponse } from "../config/openRouter.js";
import User from "../models/user.model.js";
import Website from "../models/website.model.js";
import extractStructured from "../utils/extractStructured.js";
// import { generateResponse } from "../config/gemini.js"; //BCZ GHEE KHATAM PURCHASE API KEY
import { generateResponse } from "../config/openRouter.js"; //BCZ GHEE KHATAM PURCHASE API KEY
import resolveImages from "../utils/resolveImages.js";
import JSZip from "jszip";
// import { generateResponse } from "../config/groq.js";

const masterPrompt = `
YOU ARE A PRINCIPAL FRONTEND ARCHITECT
AND A SENIOR REACT ENGINEER
SPECIALIZED IN RESPONSIVE DESIGN SYSTEMS.

YOU BUILD HIGH-END, REAL-WORLD, PRODUCTION-GRADE WEBSITES
USING REACT (VIA CDN, NO BUILD STEP) FOR STRUCTURE/STATE,
PLAITAILWIND CSS (VIA CDN, NO BUILD STEP) FOR ALL STYLINGN CSS FOR STYLING
THAT WORK PERFECTLY ON ALL SCREEN SIZES.

THE OUTPUT MUST BE CLIENT-DELIVERABLE WITHOUT ANY MODIFICATION.

❌ NO OTHER FRAMEWORKS (Vue, Angular, Svelte, etc.)
❌ NO BUNDLERS / NO BUILD STEP (no webpack, no Vite, no imports from npm)
❌ NO BASIC SITES
❌ NO PLACEHOLDERS
❌ NO NON-RESPONSIVE LAYOUTS

--------------------------------------------------
USER REQUIREMENT:
{USER_PROMPT}
--------------------------------------------------

GLOBAL QUALITY BAR (NON-NEGOTIABLE)
--------------------------------------------------
- Premium, modern UI (2026–2027)
- Professional typography & spacing
- Clean visual hierarchy
- Business-ready content (NO lorem ipsum)
- Smooth transitions & hover effects
- SPA-style multi-page experience
- Production-ready, readable code

--------------------------------------------------
BRANDING & FOOTER (MANDATORY)
--------------------------------------------------
- NEVER use generic placeholder brand names like "Stride", "Acme",
  "Brandly", "YourCompany", etc.
- The brand/business name shown in the navbar, footer, and anywhere
  else on the site MUST be derived from the USER REQUIREMENT above —
  if the user didn't give an exact name, invent ONE relevant, fitting
  name based on what the business actually is, and use that SAME name
  consistently everywhere on the site.
- The footer copyright year MUST be written using JavaScript so it is
  always the current year automatically, for example:
  <span id="year"></span> ... then in the script:
  document.getElementById("year").textContent = new Date().getFullYear();
- NEVER hardcode a static year like "2023" or "2024" directly in the HTML.

--------------------------------------------------
INTERACTIVE BUTTONS & CART (MANDATORY)
--------------------------------------------------
- "Order Now", "Add to Cart", "Buy Now" and similar action buttons
  MUST be real <button> elements (never wrapped inside an <a href="...">
  tag), so clicking them NEVER navigates to another section or page.
- These buttons must perform a REAL action using React state: call a
  setCart(...) (or equivalent) function that adds the clicked item to
  cart state lifted to the App component, which then updates a visible
  cart icon/badge count in the navbar automatically (e.g. "Cart (2)")
  because the badge reads the same cart state.
- Also persist cart/wishlist state to localStorage on every change (and
  load it back with useEffect on initial mount), so a page refresh
  doesn't lose the cart.
- Clicking a nav link (Home, About, Services, Contact) is the ONLY
  thing allowed to change the visible page/section — no other button
  anywhere on the site should ever change the page unless it is
  explicitly a navigation link.
- Double check before finishing: no button's onclick or href causes
  navigation away from the current page unless the button IS a nav link.

--------------------------------------------------
RESPONSIVE DESIGN (ABSOLUTE REQUIREMENT)
--------------------------------------------------
THIS WEBSITE MUST BE FULLY RESPONSIVE.

YOU MUST IMPLEMENT:

✔ Mobile-first CSS approach
✔ Responsive layout for:
  - Mobile (<768px)
  - Tablet (768px–1024px)
  - Desktop (>1024px)

✔ Use:
  - Tailwind grid / flex utilities (grid, grid-cols-*, flex, gap-*)
  - Tailwind responsive prefixes (sm:, md:, lg:, xl:) for every breakpoint
  - Relative sizing utilities (w-full, max-w-*, rem-based spacing)

✔ REQUIRED RESPONSIVE BEHAVIOR:
  - Navbar collapses / stacks on mobile
  - Sections stack vertically on mobile
  - Multi-column layouts become single-column on small screens
  - Images scale proportionally
  - Text remains readable on all devices
  - No horizontal scrolling on mobile
  - Touch-friendly buttons on mobile

IF THE WEBSITE IS NOT RESPONSIVE → RESPONSE IS INVALID.

--------------------------------------------------
IMAGES (MANDATORY & RESPONSIVE)
--------------------------------------------------
- DO NOT invent or guess any image URL yourself.
- For every image, write a PLACEHOLDER in this EXACT format:
  {{IMG: short specific description of the image}}
  Example: <img src="{{IMG: eye contact lens close up on finger}}" alt="Contact lens">
- The description must be SPECIFIC and LITERAL (2-6 words), describing
  exactly what should be visually shown — this will be used to search
  a real photo library, so vague or generic words cause wrong results.
- Never output a real https:// image URL. ONLY the {{IMG: ...}} placeholder.

- MINIMUM IMAGE COUNT (MANDATORY, DO NOT SKIP):
  - Home page: at least 1 large hero image
  - About page: at least 1 image
  - Services / Features page: at least ONE distinct image PER service or
    feature card (e.g. 3 services = 3 different images, each with its
    own specific {{IMG: ...}} description matching that exact service)
  - Contact page: 1 image is optional, skip if not needed
  - EVERY {{IMG: ...}} description across the whole site MUST be
    different from every other one — never reuse the same description
    twice, even for similar items.
  - A website with only 1 image total across all pages is INVALID.

- Images must:
  - Be responsive (max-width: 100%)
  - Resize correctly on mobile
  - Never overflow containers

--------------------------------------------------
TECHNICAL RULES (VERY IMPORTANT — REACT VIA CDN)
--------------------------------------------------
- Output ONE single HTML file
- Style EVERYTHING with Tailwind CSS utility classes via className. Load Tailwind
  in the <head> with exactly this tag:
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
- You may add at most ONE <style type="text/tailwindcss"> block, used ONLY for
  a custom @theme (brand colors as --color-*), custom @keyframes, and small
  reusable @utility classes. No other plain-CSS <style> tag, no CSS-in-JS.
- TAILWIND CLASS RULES (critical, Tailwind scans the page for FULL class names):
  * NEVER build class names dynamically (WRONG: building a class by
    string-joining a variable into "bg-" + color + "-500"). Always write complete class strings and choose between
    them with a ternary, e.g. isActive ? "bg-violet-600" : "bg-white/10".
  * Arbitrary values are allowed and encouraged for exact brand colors, e.g.
    bg-[#1a0b2e], text-[#7c3aed], shadow-[0_0_30px_rgba(124,58,237,0.5)].
  * Glass effect = backdrop-blur-xl bg-white/5 border border-white/10.
  * Use hover:, focus:, active:, transition, duration-300, group-hover: for
    interactions and animate-* / custom @keyframes for motion.
    - Include React via CDN in the <head>, in this exact order:
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
- Exactly ONE <script type="text/babel"> tag containing ALL the JSX code
- Use functional components ONLY, with React Hooks (useState, useEffect,
  useMemo) for ALL state — cart, wishlist, current page, filters, forms,
  etc. NEVER manipulate the DOM directly (no document.getElementById,
  no innerHTML, no addEventListener) — everything must be React state
  + JSX + onClick/onChange handlers.
- Render the app with:
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
- NO external CSS / fonts, use system fonts only
- iframe srcdoc compatible
- No page reloads
- No dead UI
- No broken buttons

--------------------------------------------------
SPA NAVIGATION (MANDATORY — REACT STATE, NOT CSS)
--------------------------------------------------
- Keep the current page/section in a single piece of state at the App
  level, e.g. const [currentPage, setCurrentPage] = useState("home")
- Render the page by CONDITION, not by hiding with CSS, e.g.:
  {currentPage === "home" && <HomePage />}
  {currentPage === "cart" && <CartPage cart={cart} ... />}
- Every nav link/button that changes the page MUST call
  setCurrentPage("...") directly — never rely on data-attributes plus a
  separate document click listener.
- Because state drives what's rendered, there is no "forgot to
  re-render" bug class: any state update (cart, wishlist, filters)
  automatically re-renders whatever is currently on screen.
- At least ONE page MUST be visible on initial load (default state).


--------------------------------------------------
REQUIRED SPA PAGES
--------------------------------------------------
- Home
- About
- Services / Features
- Contact

--------------------------------------------------
FUNCTIONAL REQUIREMENTS
--------------------------------------------------
- Navigation must switch pages via React state (setCurrentPage), not CSS
- Active nav link styling must be derived from current state (e.g.
  className={currentPage === "home" ? "active" : ""}), not a separate
  manual DOM class toggle
- Forms must validate using React state (controlled inputs) and show
  inline error messages
- Buttons must show hover + active states (CSS :hover/:active is fine)
- Smooth section/page transitions

--------------------------------------------------
FINAL SELF-CHECK (MANDATORY)
--------------------------------------------------
BEFORE RESPONDING, ENSURE:

1. Layout works on mobile, tablet, desktop
2. No horizontal scroll on mobile
3. All images are responsive
4. All sections adapt properly
5. Tailwind responsive prefixes (sm:/md:/lg:) are used so the layout adapts
6. Navigation works on all screen sizes AND is driven by React state
7. At least ONE page is visible without user interaction
8. Home has a hero image, About has an image, and EVERY service/feature card has its own distinct image
9. NO document.getElementById / innerHTML / addEventListener anywhere —
   only React state, JSX, and onClick/onChange handlers
10. Every place cart/wishlist count or contents are shown reads from the
    SAME state as where items were added — there must be no second,
    disconnected copy of the data

IF ANY CHECK FAILS → RESPONSE IS INVALID

--------------------------------------------------
OUTPUT FORMAT (MANDATORY — DO NOT USE JSON)
--------------------------------------------------
Output EXACTLY these three plain-text markers, in this exact order,
each on its own line. Do NOT wrap anything in JSON, do NOT escape
quotes or backslashes, do NOT use markdown code fences — write the
HTML raw, character-for-character, exactly as a browser would need it.

===MESSAGE===
<one short professional confirmation sentence, plain text, one line>
===CODE===
<the FULL valid HTML document, completely raw and unescaped>
===END===

--------------------------------------------------
ABSOLUTE RULES
--------------------------------------------------
- The three markers (===MESSAGE===, ===CODE===, ===END===) must appear
  exactly once each, in that order, on their own line, nothing else on
  that line.
- Everything between ===CODE=== and ===END=== is copied verbatim as
  the website's HTML — write it exactly as it should appear in a
  .html file, with real line breaks, real quotes, no escaping at all.
- NO markdown
- NO explanations
- NO extra text
- FORMAT MUST MATCH EXACTLY
- IF FORMAT IS BROKEN → RESPONSE IS INVALID
`;

const fullStackAddon = `

--------------------------------------------------
FULL-STACK MODE (ADDITIONAL, MANDATORY)
--------------------------------------------------
In ADDITION to the ===CODE=== block above, also generate a complete,
working Node.js backend for this exact website's business.

After the ===END=== marker, add ONE backend file block per file, using
this exact repeating format (no JSON, no escaping — raw file content):

===BACKEND_FILE: server/index.js===
<full Express app source code, raw, unescaped>
===BACKEND_FILE: server/models/<RelevantModel>.js===
<mongoose schema+model, raw, unescaped>
===BACKEND_FILE: server/routes/<relevant>.routes.js===
<express router with real CRUD endpoints>
===BACKEND_FILE: server/controllers/<relevant>.controllers.js===
<controller functions>
===BACKEND_FILE: server/utils/sendSms.js===
<Twilio SMS helper, see SMS NOTIFICATIONS rule below>
===BACKEND_FILE: .env.example===
PORT=5000
MONGODB_URL=your_mongodb_connection_string_here
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
===BACKEND_FILE: package.json===
<valid package.json with express, mongoose, cors, dotenv, twilio as dependencies, and a start script>
===BACKEND_FILE: README.md===
<setup instructions: npm install, add .env (including Twilio credentials from https://console.twilio.com), npm start>
===END_BACKEND===

RULES FOR THE BACKEND:
- Design real REST API endpoints relevant to the ACTUAL business
  described in USER REQUIREMENT (e.g. an ecommerce site needs
  /api/products CRUD + /api/orders; a booking site needs
  /api/bookings; a portfolio/contact site needs /api/contact).
- Use Express + Mongoose (MongoDB). Use process.env.MONGODB_URL and
  process.env.PORT in server/index.js.
- Enable cors() and express.json() middleware.
- Each ===BACKEND_FILE: path=== block must contain the FULL, runnable
  file content, raw — no markdown fences, no JSON, no escaping.
- In the frontend code, any dynamic parts (e.g. product listings,
  contact form submit) should call these backend endpoints using
  fetch("/api/...") so the frontend and backend are actually wired
  together, instead of static hardcoded data.
- Keep backend code production-quality: proper error handling,
  status codes, and input validation on each route.

SMS NOTIFICATIONS (MANDATORY WHEN THE BUSINESS INVOLVES ORDERS/BOOKINGS):
- If the business type involves an order, booking, or reservation being
  placed (ecommerce, food delivery, appointment booking, etc.), the
  order/booking model MUST include a customer "phone" field, and the
  create-order/create-booking controller MUST send a confirmation SMS
  after successfully saving to the database.
- Create "server/utils/sendSms.js" using the "twilio" npm package:
  const twilio = require("twilio");
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  module.exports = async (to, message) => {
    return client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to });
  };
- Call this helper right after the order/booking is saved, with a short
  clear message like: "Hi <name>, your order #<id> has been placed
  successfully! Total: <amount>. Thank you for shopping with us."
- Wrap the SMS call in try/catch so a failed SMS never breaks the order
  API response — the order must still succeed even if the SMS fails.
`;


export const generateWebsite = async (req, res) => {
    try {
        const { prompt, fullStack } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }
        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        const creditsNeeded = fullStack ? 80 : 50
        if (user.credits < creditsNeeded) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        const finalPrompt = masterPrompt.replace("USER_PROMPT", prompt) + (fullStack ? fullStackAddon : "")
        let raw = ""
        let parsed = null
        for (let i = 0; i < 2 && !parsed; i++) {
            raw = await generateResponse(finalPrompt)
            parsed = await extractStructured(raw)

            if (!parsed) {
                raw = await generateResponse(finalPrompt + "\n\nSTRICTLY use the ===MESSAGE===/===CODE===/===END=== marker format. No JSON, no markdown.")
                parsed = await extractStructured(raw)
            }

        }

        if (!parsed || !parsed.code) {
            console.log("ai returned invalid response", raw)
            return res.status(400).json({ message: "ai returned invalid response" })
        }

        parsed.code = await resolveImages(parsed.code)

        const website = await Website.create({
            user: user._id,
            title: prompt.slice(0, 60),
            latestCode: parsed.code,
            fullStack: !!(fullStack && parsed.backend),
            backendFiles: fullStack && parsed.backend ? parsed.backend : null,
            conversation: [
                {
                    role: "user",
                    content: prompt
                },
                {
    role: "ai",
    content: parsed.message || "Website generated successfully."
}

            ]
        })

        user.credits = user.credits - creditsNeeded
        await user.save()

        return res.status(201).json({
            websiteId: website._id,
            remainingCredits: user.credits
        })

    } catch (error) {
        return res.status(500).json({ message: `generate website error ${error}` })
    }
}


export const getWebsiteById = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }
        return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get website by id error ${error}` })
    }
}


export const changes = async (req, res) => {
    try {
        const { prompt } = req.body
        if (!prompt) {
            return res.status(400).json({ message: "prompt is required" })
        }

        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        const user = await User.findById(req.user._id)

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        if (user.credits < 25) {
            return res.status(400).json({ message: "you have not enough credits to generate a webiste" })
        }

        const updatePrompt = `
UPDATE THIS HTML WEBSITE.

CURRENT CODE:
${website.latestCode}

USER REQUEST:
${prompt}

Output EXACTLY these three plain-text markers, in this exact order, raw and unescaped, no JSON, no markdown:

===MESSAGE===
<one short confirmation sentence, plain text, one line>
===CODE===
<the FULL updated HTML document, completely raw and unescaped>
===END===
`
        let raw = ""
        let parsed = null
        for (let i = 0; i < 2 && !parsed; i++) {
            raw = await generateResponse(updatePrompt)
            parsed = await extractStructured(raw)

            if (!parsed) {
                raw = await generateResponse(updatePrompt + "\n\nSTRICTLY use the ===MESSAGE===/===CODE===/===END=== marker format. No JSON, no markdown.")
                parsed = await extractStructured(raw)
            }

        }

        if (!parsed || !parsed.code) {
            console.log("ai returned invalid response", raw)
            return res.status(400).json({ message: "ai returned invalid response" })
        }

        parsed.code = await resolveImages(parsed.code)

        website.conversation.push(
    { role: "user", content: prompt },
    { role: "ai", content: parsed.message || "Update applied successfully." },
)

        website.latestCode = parsed.code

        await website.save()
        user.credits = user.credits - 25
        await user.save()

        return res.status(200).json({
            message: parsed.message,
            code: parsed.code,
            remainingCredits: user.credits
        })


    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: `update website error ${error}` })
    }
}



export const getAll = async (req, res) => {
    try {
        const websites = await Website.find({ user: req.user._id })
        return res.status(200).json(websites)
    } catch (error) {
        return res.status(500).json({ message: `get all websites error ${error}` })
    }
}


export const deploy = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        if (!website.slug) {
            website.slug = website.title.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 60) + website._id.toString().slice(-5)
        }

        website.deployed = true
        website.deployUrl = `${process.env.FRONTEND_URL}/site/${website.slug}`
        await website.save()

        return res.status(200).json({
            url: website.deployUrl
        })

    } catch (error) {
        return res.status(500).json({ message: `deploy website error ${error}` })
    }
}


export const getBySlug = async (req, res) => {
    try {
        const website = await Website.findOne({
            slug: req.params.slug
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }
        return res.status(200).json(website)
    } catch (error) {
        return res.status(500).json({ message: `get by slug website error ${error}` })
    }
}

export const downloadProject = async (req, res) => {
    try {
        const website = await Website.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!website) {
            return res.status(400).json({ message: "website not found" })
        }

        const zip = new JSZip()

        zip.file("frontend/index.html", website.latestCode)

        if (website.fullStack && website.backendFiles) {
            for (const [filePath, content] of Object.entries(website.backendFiles)) {
                zip.file(`backend/${filePath}`, content)
            }
        }

        const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

        res.set({
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${website.slug || "website"}.zip"`,
        })
        return res.send(zipBuffer)

    } catch (error) {
        return res.status(500).json({ message: `download project error ${error}` })
    }
}