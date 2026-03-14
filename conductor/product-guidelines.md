# Product Guidelines

## Core Principles
1. **Performance First:** As an application hosted on edge infrastructure (Cloudflare), prioritize fast page loads, optimal caching, and minimal blocking scripts.
2. **User-Centric Design:** Ensure the interface is intuitive, responsive on mobile devices, and accessible to a broad audience.
3. **Resilience & Reliability:** The underlying scraper and adapter architecture must fail gracefully, handling rate limits or source downtime with retries or informative error states.

## Branding & Aesthetics
- **Visual Style:** Maintain a modern, vibrant "pop/retro" aesthetic as defined by Tailwind 4 configurations (e.g., `shadow-hard-md`, `border-4`, high-contrast color palettes).
- **Tone & Voice:** Keep the language casual, welcoming, and enthusiastic, reflecting the anime community's spirit while remaining clear and professional in error messages.

## UX Principles
- **Unified Experience:** The UI should seamlessly aggregate content from multiple sources so the user feels like they are browsing a single, cohesive library.
- **Fast Navigation:** Optimize search and category browsing for immediate feedback, leveraging D1 caching.
- **Progressive Enhancement:** Ensure core functionalities work reliably while enhancing the experience with smooth transitions and rich interactions where supported.