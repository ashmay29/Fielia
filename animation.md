Here is the updated **Technical Specification** for the Envelope Animation integration, revised to reflect **Next.js 16.0.1**, **React 19.2.0**, and **Tailwind CSS v4** as seen in your project files `apps/vista/package.json` and `apps/vista/src/app/globals.css`.

-----

# Technical Specification: Envelope Animation Integration (v2)

## 1\. Executive Summary

**Objective:** Seamlessly transition users from the locked "Envelope" state to the "Invitation" content using the provided high-fidelity video animation.
**Current State:** Static React components (`EnvelopeFlap`, `WaxSeal`) mimic the envelope.
**Target State:**

1.  User lands on `/envelope` showing the closed envelope (Video Frame 0).
2.  User clicks "Open Invitation".
3.  Video plays (Envelope opens, card slides out).
4.  UI transitions seamlessly into the interactive `ReferralForm` and content.

-----

## 2\. Requirements & Environment

### 2.1 Asset Preparation

The video `Envelope_Opens_To_Website_Animation.mp4` is the core asset.

  * **Compression:** Compress to \~1-2MB (H.264/MP4 and WebM variants).
  * **Poster:** Extract the **first frame** (closed envelope) as a high-res JPEG to prevent layout shift before the video loads.

### 2.2 Technology Stack

Based on `apps/vista/package.json`:

  * **Framework:** **Next.js 16.0.1** (App Router)
  * **Core:** **React 19.2.0**
  * **Styling:** **Tailwind CSS v4** (using `@import "tailwindcss";` syntax)
  * **Animation:** `framer-motion` (v10.18.0)
  * **Language:** TypeScript 5.x

-----

## 3\. Architecture & Logic Flow

We will refactor `apps/vista/src/app/envelope/page.tsx` to act as the "Stage" that handles the animation before handing off to the Invitation content.

### 3.1 State Machine

The page will exist in three phases:

1.  **IDLE:** Video is paused at 0:00. "Open Invitation" button is visible.
2.  **PLAYING:** Button fades out. Video plays to completion.
3.  **REVEAL:** Video ends. The interactive Invitation/Referral content fades in *over* the video.

### 3.2 Routing Strategy

**Recommendation:** **Single Route Transition.**
Do *not* use `router.push('/invitation')` immediately after the video. Since Next.js 16.0.1 utilizes React 19's concurrent rendering features, keeping the transition within the same route (conditionally rendering the `Invitation` component) ensures the smoothest visual handover without a full page navigation/repaint.

-----

## 4\. Implementation Steps

### Step 1: Create the Envelope Animation Container

This component wraps the video logic. Note the usage of `use client` which is mandatory for event listeners in App Router.

**File:** `apps/vista/src/components/envelope/EnvelopeAnimation.tsx` (New File)

```tsx
"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

// React 19 allows cleaner ref handling, but standard useRef is perfect here
export function EnvelopeAnimation({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleOpen = () => {
    if (videoRef.current) {
      setIsPlaying(true);
      videoRef.current.play();
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#501515]">
      {/* 1. The Video Actor */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
        preload="auto"
        poster="/assets/envelope-start-frame.jpg" // Extract this from your video
        onEnded={onComplete}
      >
        {/* Ideally serve both for browser compatibility */}
        <source src="/assets/Envelope_Opens_To_Website_Animation.webm" type="video/webm" />
        <source src="/assets/Envelope_Opens_To_Website_Animation.mp4" type="video/mp4" />
      </video>

      {/* 2. The UI Overlay (Button & Text) */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-8 pb-12"
          >
             {/* Note: WaxSeal component removed as it is baked into the video */} 

             <div className="mt-[20vh] flex flex-col items-center gap-6">
                <p className="font-(family-name:--font-cormorant) text-sm uppercase tracking-[0.3em] text-[#E1D6C7]">
                  An invite-only bar and supper club
                </p>
                <Button onClick={handleOpen} variant="secondary">
                  Open Invitation
                </Button>
                <p className="font-(family-name:--font-cormorant) text-xs tracking-wider text-[#D8CBBB]/70">
                  Membership by referral only
                </p>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 3. Vignette Overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-radial from-transparent via-transparent to-[#0A0A08]/40" />
    </div>
  );
}
```

### Step 2: Integrate into Envelope Page

We will modify `apps/vista/src/app/envelope/page.tsx` to serve as the orchestrator.

**File:** `apps/vista/src/app/envelope/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { EnvelopeAnimation } from "@/components/envelope/EnvelopeAnimation";
// Import the Invitation Page content directly component-style
import InvitationPageContent from "../invitation/page"; 
import { motion } from "framer-motion";

export default function EnvelopePage() {
  const [showInvitation, setShowInvitation] = useState(false);

  return (
    <main className="relative min-h-screen w-full">
      {/* The Video Layer */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
          showInvitation ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
         <EnvelopeAnimation onComplete={() => setShowInvitation(true)} />
      </div>

      {/* The Invitation Content Layer */}
      {showInvitation && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-30"
        >
          {/* Reuse the existing Invitation Page layout */}
          <InvitationPageContent />
        </motion.div>
      )}
    </main>
  );
}
```

### Step 3: Global CSS Updates (Tailwind v4)

Since you are using Tailwind v4 (`@import "tailwindcss";` in `globals.css`), ensure any new utility classes used in the components above are supported.

  * `bg-gradient-radial`: This is a custom utility often missing in default Tailwind.
  * **Action:** Verify `apps/vista/src/app/globals.css` contains the custom utility definition you already have:
    ```css
    @import "tailwindcss";
    /* ... existing variables ... */

    /* Ensure this utility exists for the Vignette effect */
    .bg-gradient-radial {
      background-image: radial-gradient(circle, var(--tw-gradient-stops));
    }
    ```

-----

## 5\. Deployment & Optimization for Next.js 16

### 5.1 Static Assets

Move your video file to `apps/vista/public/assets/`.

  * **Path:** `apps/vista/public/assets/Envelope_Opens_To_Website_Animation.mp4`
  * **Poster:** `apps/vista/public/assets/envelope-start-frame.jpg`

### 5.2 Server Components vs Client Components

  * `EnvelopeAnimation.tsx` requires `"use client"` because of `useRef`, `useState`, and event handlers.
  * `page.tsx` (Envelope) is now a Client Component because it imports `EnvelopeAnimation`. This is acceptable for this specific route.
  * `InvitationPageContent` (imported from `../invitation/page`) serves as a standard React component here. If `invitation/page.tsx` has `"use client"`, it will work seamlessly. If it is a Server Component, it can still be imported into a Client Component in Next.js 16, though passing it as `children` is preferred for optimization.
      * *Optimization Tip:* If `InvitationPageContent` is heavy, consider passing it as a prop or using `children` pattern, but for a simple animation transition, direct import is the pragmatic solution.

### 5.3 React 19 Compatibility

The code provided uses standard React hooks (`useState`, `useRef`) which remain the standard in React 19. No experimental APIs (like `useFormStatus`) are required for this specific animation logic, ensuring stability.