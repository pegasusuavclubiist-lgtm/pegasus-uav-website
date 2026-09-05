# Design System & Animation Spec: House of Yellow x Pegasus UAV

## 1. Core Aesthetic
- **Vibe:** Cinematic, Brutalist, High-Kinetic, Premium Agency.
- **Visual Hierarchy:** Massive typography, extreme contrast, deliberate whitespace, and structural grid lines.
- **Theme:** Dark mode default. Stark black backgrounds with pure white text, utilizing a bold accent color (e.g., Electric Aerospace Blue or High-Vis Yellow) for interactions.

## 2. Typography & Layout
- **Primary Display Font:** A bold, geometric sans-serif (e.g., `font-sans` configured to *Neue Montreal*, *Helvetica Now*, or *Inter*). Extremely tight tracking (`tracking-tighter`), uppercase for massive impact.
- **Secondary/Accent Font:** A monospace font (e.g., *Space Mono* or *JetBrains Mono*) for technical data, stats, and section numbering (e.g., `[ 01 ] Mission`).
- **Grid:** Use CSS Grid extensively. 12-column layouts for desktop (`grid-cols-12`).

## 3. Custom Cursor (Crucial for the HOY Vibe)
- **Mechanic:** Hide the default cursor (`cursor-none` globally).
- **Implementation:** Create a fixed, z-index-top `<CustomCursor />` component using GSAP `quickTo` for zero-latency x/y tracking.
- **States:** 
  - *Default:* Small dot.
  - *Hovering Video:* Expands into a larger circle reading "PLAY".
  - *Hovering Project:* Expands into a pill shape reading "VIEW ->".

## 4. GSAP Animation Patterns

### A. The Infinite Marquee (Text Ribbon)
- **Usage:** Section dividers (e.g., repeating "ACTIVE PROJECTS ACTIVE PROJECTS").
- **Mechanic:** Duplicate text nodes. Use GSAP to translate X from `0%` to `-100%` infinitely.
- **Scroll Hook:** Tie `ScrollTrigger` to the marquee timeline so scrolling down speeds up the marquee, and scrolling up reverses the direction.

### B. Cinematic Text Reveals
- **Usage:** Headers like "Autonomy at Altitude" and paragraph text.
- **Mechanic:** Wrap text in lines using `overflow-hidden`. Apply GSAP `fromTo`: starting at `y: "110%"` and `rotate: 2deg`, animating to `y: "0%"` and `rotate: 0deg` with a custom ease (e.g., `power4.out`).
- **Stagger:** Stagger lines by `0.05s`.

### C. Media Parallax & Scale (Projects / Hero)
- **Usage:** Project images/videos and the Hero background.
- **Mechanic:** Start media inside a `overflow-hidden` container at `scale: 1.2`. As the user scrolls into the section, use `ScrollTrigger` with `scrub: true` to slowly animate the image down to `scale: 1`.

## 5. Component Mappings (Pegasus Content -> HOY Design)
- **Hero Section:** Full-bleed background video (no margins). The words "Autonomy at Altitude" should dominate the viewport. Technical stats (`Founded: 2026`) sit at the bottom in monospace.
- **Mission Section:** Use the structural `[ 01 ]` numbering. Display features (Nav, Safe, Perc) in a strict, border-separated grid (brutalist tables).
- **Projects Section:** Large, full-width rows. On hover, the image reveals/fades in, pushing the text slightly, while the custom cursor expands.
- **Team Roster:** Minimalist list. Hovering over a name reveals their photo following the cursor (image trail effect).