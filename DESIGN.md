# Design System Specification: Technical Brutalism

## 1. Overview & Creative North Star: "The Industrial Manifesto"

This design system rejects the "softness" of modern web standards. Its Creative North Star is **Technical Brutalism**—an aesthetic that prioritizes architectural precision, high-density information, and an unapologetic commitment to the 90-degree angle.

We break the "template" look by treating the screen as a structural blueprint rather than a canvas. By stripping away gradients, border-radii, and shadows, we rely on **intentional asymmetry** and **harsh tonal shifts** to guide the eye. The interface should feel engineered, not "designed."

---

## 2. Colors & Surface Logic

The palette is rooted in absolute contrast. We use a monochrome foundation to establish authority, reserving our vibrant accent for surgical precision.

### The Palette

- **Primary (`#000000`)**: Used for the most critical text, primary CTAs, and structural "beams."
- **Surface (`#f9f9f9`)**: The base material. Clean, cold, and expansive.
- **Accent/Surface Tint (`#bc004b`)**: A surgical, pinkish-red. Used only for "Active" states, critical errors, or high-priority notifications.
- **Secondary (`#5e5e5e`)**: For supporting data and non-interactive UI metadata.

### The "No-Line" Rule

**Explicit Prohibition:** 1px solid borders are forbidden for sectioning.
Structure must be defined by **background color shifts**. To separate the Header from the Body, use `surface-container` against `surface`. To separate a sidebar, use `surface-dim`. Boundary is defined by the sudden termination of a color block, not a stroke.

### Surface Hierarchy & Nesting

Depth is achieved through "Tonal Stacking." Containers do not "lift" off the page; they are "carved" into it or "laid" flat upon it.

- **Level 0 (Base):** `surface` (#f9f9f9)
- **Level 1 (Sectioning):** `surface-container-low` (#f3f3f3)
- **Level 2 (In-page Containers):** `surface-container` (#eeeeee)
- **Level 3 (Interactive/Active):** `surface-container-high` (#e8e8e8)

---

## 3. Typography: Editorial Authority

We utilize two sans-serifs to create a hierarchy of "Technical" vs. "Functional."

- **Display & Headlines (Space Grotesk):** This is our "Voice." Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to create a bold, industrial header. Headlines should feel like newspaper mastheads—massive and immovable.
- **Body & Labels (Inter):** This is our "Data." `body-md` (0.875rem) provides the legibility required for dense information.

**Typographic Intent:** Use `all-caps` for `label-md` and `label-sm` to lean into the architectural blueprint aesthetic.

---

## 4. Elevation & Depth: Zero Gravity

Traditional UI uses shadows to mimic the real world. This design system ignores the real world.

- **The Layering Principle:** Depth is binary. An element is either "on" the surface or it "is" the surface. Use `surface-container-lowest` (#ffffff) for high-focus cards sitting on a `surface-container` (#eeeeee) background.
- **Ambient Shadows:** Prohibited. If a floating element (like a context menu) requires separation, use a high-contrast `outline` (#777777) with **zero blur**. It should look like a "cut-out."
- **Ghost Border Fallback:** If accessibility requires a border, use `outline-variant` (#c6c6c6) at 20% opacity. It must be 1px. A small border-radius (up to 4px) is permitted to soften edges where needed.

---

## 5. Components

### Buttons: The "Block" Action

- **Primary:** `on_primary_container` text on `primary` (#000000) background. Border-radius up to 4px is permitted.
- **Secondary:** `on_secondary_container` text on `secondary_container` (#d4d4d4) background.
- **Active/Critical:** `on_primary` text on `primary_fixed` (#bc004b).
- **Interaction:** On hover, do not use a shadow. Invert the colors (e.g., Black background becomes White background with a Black outline).

### Input Fields: The "Underline" Grid

Forgo the "box" input. Use a bottom-border only (`outline` #777777, 2px) to keep the layout feeling like a technical form. Labels (`label-md`) should be placed _above_ the line, never inside it.

### Cards & Lists: The "Block" Separation

- **No Dividers:** Lists are separated by alternating `surface` and `surface-container-low` backgrounds or by `spacing.8` (1.75rem) of dead white space.
- **Cards:** Strictly square. Use `surface-container-highest` for the header of a card to create a "header bar" effect within the component.

### Additional Component: The "Data Monolith"

For high-density data, use a "Monolith" table layout. No vertical lines. Only horizontal shifts in tone. Use `primary_fixed` (#bc004b) for the scrollbar thumb to turn a utility into a signature design element.

---

## 6. Do’s and Don'ts

### Do:

- **Embrace White Space:** Use `spacing.20` (4.5rem) between major sections to let the high-contrast typography breathe.
- **Align to Grid:** Every element must snap to a strict 4px or 8px grid. Asymmetry is encouraged, but misalignment is a failure.
- **Use "Hard" Transitions:** Animations should be "Instant" (0ms) or "Mechanical" (Linear, 150ms). No "bouncy" or "elastic" easing.

### Don’t:

- **No Large Rounded Corners:** Border-radius must not exceed 4px. Fully rounded or pill-shaped elements are prohibited. Subtle rounding (2–4px) is acceptable to soften edges without losing the industrial aesthetic.
- **No Shadows:** We do not use depth to hide poor layout choices. If elements are blending, adjust your `surface-container` tokens.
- **No Gradients:** Color must be flat and absolute. We find beauty in the purity of the hex code, not the transition between them.
- **No "Soft" Icons:** Use sharp, geometric icon sets (e.g., Phosphor Bold or custom paths with square caps). Avoid rounded terminals on strokes.
