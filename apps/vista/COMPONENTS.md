# FIELIA Component Architecture

## 📁 Project Structure

```
src/
├── app/
│   ├── envelope/          # /envelope route
│   │   └── page.tsx
│   ├── invitation/        # /invitation route
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx          # Root - redirects to /envelope
│
└── components/
    ├── ui/               # Reusable UI primitives
    │   ├── Button.tsx
    │   ├── Logo.tsx
    │   ├── Input.tsx
    │   ├── Textarea.tsx
    │   └── index.ts
    │
    ├── envelope/         # Envelope page specific components
    │   ├── EnvelopeFlap.tsx
    │   ├── WaxSeal.tsx
    │   └── index.ts
    │
    ├── invitation/       # Invitation page specific components
    │   ├── InvitationCard.tsx
    │   ├── ParchmentBackground.tsx
    │   ├── ReferralForm.tsx
    │   └── index.ts
    │
    └── common/           # Shared components across pages
        ├── Footer.tsx
        └── index.ts
```

## 🧩 Component Categories

### UI Components (`/components/ui`)
Reusable, generic UI primitives that can be used across the entire application.

- **Button** - Primary and secondary button variants with optional href for Link behavior
- **Logo** - FIELIA logo with size variants (small, medium, large)
- **Input** - Styled form input with label and optional flag
- **Textarea** - Styled textarea with label

### Envelope Components (`/components/envelope`)
Components specific to the envelope page aesthetic.

- **EnvelopeFlap** - CSS-based envelope flap effect using clip-path
- **WaxSeal** - Layered wax seal with glow and emblem

### Invitation Components (`/components/invitation`)
Components specific to the invitation page.

- **ParchmentBackground** - Parchment gradient with paper texture and corner flourishes
- **InvitationCard** - Elevated card container with decorative border
- **ReferralForm** - Complete form with state management for referral requests

### Common Components (`/components/common`)
Shared components used across multiple pages.

- **Footer** - Copyright and membership text

## 🛣️ Routes

- **`/`** - Redirects to `/envelope`
- **`/envelope`** - Sealed envelope page with wax seal and "Open Invitation" CTA
- **`/invitation`** - Parchment invitation page with referral form

## 🎨 Design Tokens

All brand colors are defined in `globals.css`:
- `--fielia-1` through `--fielia-8` - Brand palette
- `--brand-main` (#370D10) - Primary brand color
- `--brand-contrast` (#F7F7F7) - Light contrast

Typography:
- `--font-great-vibes` - Script font for logo/decorative elements
- `--font-playfair` - Serif headings
- `--font-cormorant` - Serif body text

## 📦 Usage Examples

### Using UI Components
```tsx
import { Button, Logo, Input } from "@/components/ui";

<Logo size="medium" />
<Button variant="primary" href="/invitation">Click Me</Button>
<Input label="Full Name" required />
```

### Using Page-Specific Components
```tsx
import { WaxSeal, EnvelopeFlap } from "@/components/envelope";
import { ParchmentBackground, InvitationCard } from "@/components/invitation";

<EnvelopeFlap />
<WaxSeal />

<ParchmentBackground>
  <InvitationCard>
    {/* content */}
  </InvitationCard>
</ParchmentBackground>
```

## 🔄 Reusability Benefits

1. **DRY Principle** - No code duplication between pages
2. **Maintainability** - Update styles in one place
3. **Testability** - Components can be tested in isolation
4. **Scalability** - Easy to add new pages using existing components
5. **Type Safety** - Full TypeScript support with proper interfaces
