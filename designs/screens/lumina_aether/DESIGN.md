# Design System Strategy: The Ethereal Curator

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Ethereal Curator."** 

We are moving away from the "SaaS-standard" look of rigid borders and flat containers. Instead, we are building a digital environment that feels like a premium, AI-powered sanctuary for health. The experience must feel breathable, light-filled, and intelligently organized. 

By leveraging **Organic Bento-Grid layouts** and **Deep Glassmorphism**, we break the "template" feel. We prioritize intentional asymmetry—where large, airy whitespace balances dense, data-rich clusters. This is not just a dashboard; it is a high-end editorial experience that guides the user through their wellness journey with the soft authority of a concierge.

---

## 2. Colors & Atmospheric Depth
Our palette is rooted in sophisticated transitions. We use color not just to decorate, but to define space and "mood" without the need for structural lines.

### Color Roles
- **Primary (`#ac3044` / `primary_container: #ff6e7f`):** Used sparingly for vital health insights and primary calls to action.
- **Secondary (`#3b6476` / `secondary_container: #bfe9ff`):** Represents the "Sky Blue" calming influence, ideal for baseline data.
- **Surface & Background (`#f8f9ff`):** A tinted off-white that prevents eye strain and feels more premium than pure hex white.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to section off content. Boundaries must be created through:
1.  **Background Color Shifts:** Placing a `surface_container_low` card on a `surface` background.
2.  **Tonal Transitions:** Using the padding between elements to let the background color "breathe" as the separator.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of frosted glass.
*   **Level 0:** `surface` (The base canvas).
*   **Level 1:** `surface_container_low` (Large bento sections).
*   **Level 2:** `surface_container_lowest` (Inner cards or highlighted data points to create a "lifted" effect).

### The "Glass & Gradient" Rule
To achieve the signature look, apply **Deep Glassmorphism** to floating elements (like top navigation and modal overlays). Use semi-transparent surface colors with a `backdrop-filter: blur(20px)`. 
*   **Signature Textures:** Incorporate subtle linear gradients (e.g., `primary` to `primary_container` at 15% opacity) as backgrounds for hero cards to provide a "vibrant yet refined" soul.

---

## 3. Typography: Editorial Authority
We utilize **Inter** as our primary driver, focusing on extreme scale contrasts to establish hierarchy.

*   **Display (3.5rem - 2.25rem):** Set with tight tracking (-0.02em) to feel like a premium health journal. These are the "Curator’s Voice."
*   **Headlines (2rem - 1.5rem):** Used for bento-grid section headers.
*   **Body (1rem - 0.75rem):** Clean, legible, and airy. Use `body-lg` for curated insights and `body-md` for secondary data.
*   **Labels (0.75rem - 0.68rem):** Often set in all-caps with slightly increased letter spacing (+0.05em) for a technical, AI-precise feel.

The typography is the anchor. While the backgrounds are soft and fluid, the type remains sharp and authoritative.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "heavy" for an ethereal system. We use **Ambient Light** principles.

*   **The Layering Principle:** Stacking `surface_container_lowest` on `surface_container` creates a natural "pop" without a single pixel of shadow. This is our preferred method of elevation.
*   **Ambient Shadows:** If a floating action button or card requires a shadow, use: `box-shadow: 0 20px 40px rgba(22, 28, 35, 0.06)`. It should be barely perceptible, mimicking soft, diffused studio lighting.
*   **The "Ghost Border" Fallback:** If accessibility requirements demand a container edge, use a **Ghost Border**: `outline-variant` at 15% opacity. Never use 100% opaque borders.

---

## 5. Components & Layout Specs

### The Top-Navigation Token
The navigation must remain anchored and ethereal.
*   **Token:** `surface_container_lowest` at 80% opacity.
*   **Effect:** `backdrop-filter: blur(12px)`.
*   **Layout:** Centered floating pill shape or full-width with a subtle gradient "glow" on the bottom edge using `secondary_container`.

### Bento-Grid Cards
*   **Corner Radius:** Use the **XL (3rem)** for main containers and **LG (2rem)** for internal cards.
*   **Spacing:** Enforce high whitespace (minimum 24px/32px between bento blocks).
*   **Content separation:** Forbid divider lines. Use `surface_dim` background shifts or vertical whitespace to separate list items.

### Buttons
*   **Primary:** A vibrant gradient from `primary` to `primary_container`. High-rounded (Full/9999px).
*   **Secondary:** `secondary_container` background with `on_secondary_container` text. No border.
*   **Tertiary:** Ghost style. Text only, with a subtle `surface_bright` hover state.

### Input Fields
*   **Style:** Minimalist. A subtle `surface_container_high` background. 
*   **Interaction:** On focus, the background transitions to `surface_container_lowest` with a soft `secondary` outer glow (4px blur).

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use asymmetrical layouts. A large 2/3 width card next to two 1/3 stacked cards creates visual interest.
*   **Do** use the "Sky Blue" (`secondary_fixed`) and "Amber" (custom accent) for data visualization to keep it feeling like a health curator.
*   **Do** utilize `backdrop-filter` on any element that sits "above" the main content.

### Don't:
*   **Don't** use black (`#000000`) for text. Use `on_surface` (`#161c23`) to maintain the "soft" aesthetic.
*   **Don't** use 90-degree sharp corners. Everything in this system should feel organic and approachable.
*   **Don't** use standard "Material Design" shadows. If you can see the shadow clearly, it’s too dark.
*   **Don't** use dividers or lines to separate list items; let the whitespace do the work.