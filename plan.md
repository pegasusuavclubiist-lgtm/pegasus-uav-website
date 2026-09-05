# Implementation Plan: Pegasus UAV x HOY Aesthetic

## Phase 1: Foundation & Global State (Sequential)
**Assigned to: System Architect Agent**
1. **Typography & Globals:** Configure `tailwind.config.ts` with brutalist sans-serif and monospace fonts. Strip default margins and set global background to pure black (`bg-black text-white`). Apply `cursor-none` globally.
2. **GSAP Setup:** Initialize GSAP plugins (ScrollTrigger) in a central utility file to ensure they register correctly in the Next.js SSR environment.
3. **Custom Cursor Component:** Build `<CustomCursor />` using GSAP `quickTo` for zero-latency tracking. Implement state hooks for `hovering-video` (Play) and `hovering-project` (View ->).

## Phase 2: Parallel Component Assembly (Asynchronous)
*Agents will build these components in isolation, strictly importing text from `src/data/data.ts`.*

**Agent Alpha: Hero Section & Navigation**
- Build `<Header />` with a minimalist, transparent navbar.
- Build `<Hero />` with the `hero.videoUrl` as a full-bleed, muted, auto-playing background.
- Implement GSAP text reveal (staggered `y: "110%"`) for the "Autonomy at Altitude" headline on load.
- Anchor the `hero.stats` at the bottom using a monospace brutalist grid.

**Agent Beta: Mission & Marquee Systems**
- Build `<Marquee text="INNOVATE. BUILD. FLY." />` with infinite X-axis translation. Tie its speed and direction to `ScrollTrigger` velocity.
- Build `<Mission />` section starting with `[ 01 ]`. Render the `mission.features` into a stark, border-separated 2x2 or 4x1 CSS grid.

**Agent Gamma: Interactive Project Roster**
- Build `<Projects />` module starting with `[ 02 ]`.
- Map `projects.list` into full-width layout rows. 
- **Interaction:** Add hover event listeners to trigger the Custom Cursor state. Implement GSAP image parallax where the project thumbnail scales down from `1.2` to `1.0` as it scrolls into view.

**Agent Delta: Team Hover Effects**
- Build `<Team />` list starting with `[ 04 ]`.
- Implement a minimalist list of names.
- **Interaction:** Create an image-trail effect. When hovering over a member's row, their `imageUrl` appears and smoothly follows the cursor's coordinates via GSAP.

## Phase 3: Integration & Responsive Polish (Sequential)
**Assigned to: Lead UI Agent**
1. Assemble all components inside `src/app/page.tsx` within a `useGSAP()` scope.
2. Implement `gsap.matchMedia()` logic to dial back extreme scroll effects on mobile viewports (e.g., disable image trails on touch devices, ensure text remains readable).
3. Final review against `design-system.md` constraints.