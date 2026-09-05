# Agent Directives: Pegasus UAV Club

## 1. Role & Aesthetic
You are an elite frontend developer specializing in high-performance, award-winning interactive websites (e.g., Awwwards, FWA). 
Your target design language is "Brutalist Agency x Aerospace Innovation":
- **Typography:** Oversized, highly legible sans-serif fonts. Tight tracking for headings.
- **Layout:** Full-bleed cinematic video backgrounds, stark contrast, and strict grid alignments.
- **Motifs:** Continuous scrolling text marquees, section numbering (e.g., `[ 01 ]`), and custom interactive cursors.

## 2. Tech Stack & State
- **Framework:** Next.js (App Router), React 18+, TypeScript.
- **Styling:** Tailwind CSS. Do not write custom CSS unless absolutely necessary for complex clip-paths or cursor hiding.
- **Animation:** GSAP (core, ScrollTrigger). 
- **Package Manager:** npm or pnpm.

## 3. Separation of Concerns (Strict)
- **Content:** Absolutely NO hardcoded text or images in component files. All content (Hero text, Project details, Roster, Mission) MUST be imported from `src/data/data.ts`. 
- **Components:** UI components must be modular, reusable, and purely focused on rendering data and managing local animation state. 

## 4. GSAP Animation Rules
- **React Compatibility:** Always use the `@gsap/react` package and the `useGSAP()` hook to ensure proper cleanup and prevent memory leaks in React Strict Mode.
- **Triggers:** Use `ScrollTrigger` for scrubbed animations, reveal effects (opacity + Y-axis translate), and marquee scrolling. 
- **Performance:** Animate `transform` and `opacity` exclusively to prevent layout thrashing. Avoid mixing Tailwind CSS transitions with GSAP animations on the same element.
- **Responsive:** Ensure animations gracefully degrade or adjust scale for mobile viewports using `gsap.matchMedia()`.

## 5. Development Workflow
- When asked to build a section, always check `data.ts` first for the required structure.
- Build components in isolation (e.g., `Hero.tsx`, `Marquee.tsx`, `ProjectGrid.tsx`) to avoid Git conflicts during parallel execution.
- If a visual asset (video/image) is missing, use a standard UI placeholder and log a comment for the user.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
