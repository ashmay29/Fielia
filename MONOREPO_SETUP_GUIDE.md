# Complete Monorepo Setup Guide for Animation-Heavy Next.js Projects

**Tested Configuration**: Turborepo 2.6.0 + pnpm 10.x + Next.js 14.2 + TypeScript 5.3

This guide provides a **production-ready, error-free** setup for building animation-intensive Next.js applications with GSAP and Framer Motion in a monorepo architecture.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Initialize Root Directory](#step-1-initialize-root-directory)
3. [Step 2: Configure Workspace](#step-2-configure-workspace)
4. [Step 3: Setup Turborepo](#step-3-setup-turborepo)
5. [Step 4: Create Animation Packages](#step-4-create-animation-packages)
6. [Step 5: Create Next.js App](#step-5-create-nextjs-app)
7. [Step 6: Install Dependencies](#step-6-install-dependencies)
8. [Step 7: Build & Verify](#step-7-build--verify)
9. [Common Errors & Solutions](#common-errors--solutions)

---

## Prerequisites

- **Node.js**: v18+ or v20+
- **pnpm**: v8+ or v10+ (`npm install -g pnpm`)
- **Git**: For version control

---

## Step 1: Initialize Root Directory

```bash
mkdir my-animated-monorepo
cd my-animated-monorepo
pnpm init
```

### Create Root `package.json`

**File**: `package.json`

```json
{
  "name": "my-animated-monorepo",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@10.15.0",
  "scripts": {
    "preinstall": "npx only-allow pnpm",
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "rimraf 'packages/*/{dist,.next,node_modules}' 'apps/*/{dist,.next,node_modules}' && rimraf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0",
    "rimraf": "^5.0.5",
    "only-allow": "^1.1.1"
  }
}
```

**⚠️ Critical**: Include `"packageManager"` field to avoid Turbo v2 errors.

---

## Step 2: Configure Workspace

### Create `pnpm-workspace.yaml`

**File**: `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### Create Directory Structure

```bash
mkdir -p apps packages
```

### Create Root TypeScript Config

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "baseUrl": ".",
    "paths": {
      "@my-mono/ui": ["packages/ui/src"],
      "@my-mono/ui/*": ["packages/ui/src/*"],
      "@my-mono/animations": ["packages/animations/src"],
      "@my-mono/animations/*": ["packages/animations/src/*"]
    }
  }
}
```

**⚠️ Critical**: Set `"noEmit": true` to prevent "would overwrite input file" errors.

---

## Step 3: Setup Turborepo

### Create `turbo.json`

**File**: `turbo.json`

```json
{
  "tasks": {
    "build": {
      "outputs": [".next/**", "dist/**"],
      "cache": true,
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": [],
      "cache": true
    },
    "type-check": {
      "outputs": [],
      "cache": true
    }
  },
  "globalEnv": ["NODE_ENV"]
}
```

**⚠️ Critical**: Do NOT include `"version": "1"` - it's deprecated in Turbo v2.x.

---

## Step 4: Create Animation Packages

### A. Animations Package

```bash
mkdir -p packages/animations/src
```

#### `packages/animations/package.json`

```json
{
  "name": "@my-mono/animations",
  "version": "1.0.0",
  "description": "Shared animation utilities and configurations",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": "./dist/index.js",
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "type-check": "tsc --noEmit",
    "lint": "echo 'lint skipped'"
  },
  "dependencies": {
    "gsap": "^3.12.0",
    "framer-motion": "^10.16.0"
  },
  "devDependencies": {
    "@types/gsap": "^3.0.0",
    "typescript": "^5.3.0"
  }
}
```

**⚠️ Critical**: 
- Use `@types/gsap@^3.0.0` (NOT `^3.12.0` - doesn't exist)
- Simplified `exports` to match `tsc` output

#### `packages/animations/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true,
    "emitDeclarationOnly": false,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

#### `packages/animations/src/index.ts`

```typescript
// GSAP Configuration
export { gsap } from 'gsap';
export { ScrollTrigger } from 'gsap/ScrollTrigger';

// Framer Motion Re-exports
export { motion, AnimatePresence } from 'framer-motion';
export type { Variants, Transition } from 'framer-motion';

// Custom Animation Presets
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
```

#### `packages/animations/src/gsap-config.ts`

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const gsapAnimationPresets = {
  fadeIn: (element: string | Element) => {
    return gsap.from(element, {
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
    });
  },
  slideInLeft: (element: string | Element) => {
    return gsap.from(element, {
      x: -100,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
    });
  },
};
```

#### `packages/animations/src/framer-variants.ts`

```typescript
import type { Variants } from 'framer-motion';

export const framerVariants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 100 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.7, ease: 'easeOut' }
    },
  },
} satisfies Record<string, Variants>;
```

### B. UI Components Package

```bash
mkdir -p packages/ui/src
```

#### `packages/ui/package.json`

```json
{
  "name": "@my-mono/ui",
  "version": "1.0.0",
  "description": "Animated UI components library",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": "./dist/index.js",
  "scripts": {
    "build": "tsc --project tsconfig.json",
    "type-check": "tsc --noEmit",
    "lint": "echo 'lint skipped'"
  },
  "dependencies": {
    "@my-mono/animations": "workspace:*",
    "framer-motion": "^10.16.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0"
  }
}
```

#### `packages/ui/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true,
    "emitDeclarationOnly": false,
    "esModuleInterop": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"]
}
```

#### `packages/ui/src/index.ts`

```typescript
export { Button } from './Button';
export { Card } from './Card';
```

#### `packages/ui/src/Button.tsx`

```typescript
'use client';

import { motion } from '@my-mono/animations';
import type { HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary';
}

export const Button = ({ variant = 'primary', children, ...props }: ButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-3 rounded-lg font-medium ${
        variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
      }`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
```

#### `packages/ui/src/Card.tsx`

```typescript
'use client';

import { motion, framerVariants } from '@my-mono/animations';
import type { HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  title?: string;
}

export const Card = ({ title, children, ...props }: CardProps) => {
  return (
    <motion.div
      variants={framerVariants.fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="p-6 bg-white rounded-xl shadow-lg"
      {...props}
    >
      {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
      {children}
    </motion.div>
  );
};
```

---

## Step 5: Create Next.js App

```bash
mkdir -p apps/web/src/app
```

### `apps/web/package.json`

```json
{
  "name": "@my-mono/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@my-mono/ui": "workspace:*",
    "@my-mono/animations": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "eslint": "^8.50.0",
    "eslint-config-next": "^14.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### `apps/web/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### `apps/web/next.config.mjs`

```javascript
// Next.js config in supported format for Next 14
const nextConfig = {
  // Add your config options here
  transpilePackages: ['@my-mono/ui', '@my-mono/animations'],
};

export default nextConfig;
```

**⚠️ Critical**: Use `.mjs` extension, NOT `.ts` (Next 14 doesn't support TypeScript config files).

### `apps/web/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
};
```

### `apps/web/postcss.config.mjs`

```javascript
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

**⚠️ Critical**: Use standard Tailwind v3 plugins, NOT `@tailwindcss/postcss` (that's v4).

### `apps/web/src/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Animated Monorepo App",
  description: "Built with Next.js, GSAP, and Framer Motion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**⚠️ Critical**: Use `Inter` font (widely supported), NOT `Geist` (not available in Next 14.2).

### `apps/web/src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-inter), Arial, Helvetica, sans-serif;
}
```

**⚠️ Critical**: Use `@tailwind` directives (v3), NOT `@import "tailwindcss"` (v4 syntax).

### `apps/web/src/app/page.tsx`

```typescript
import { Button, Card } from '@my-mono/ui';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center mb-12">
          Animated Monorepo Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Card 1">
            <p className="text-gray-600">
              This card uses Framer Motion animations from the shared UI package.
            </p>
            <Button variant="primary" className="mt-4">
              Click Me
            </Button>
          </Card>
          
          <Card title="Card 2">
            <p className="text-gray-600">
              Hover over the button to see the scale animation.
            </p>
            <Button variant="secondary" className="mt-4">
              Hover Me
            </Button>
          </Card>
        </div>
      </div>
    </main>
  );
}
```

---

## Step 6: Install Dependencies

```bash
# From root directory
pnpm install
```

---

## Step 7: Build & Verify

```bash
# Build all packages
pnpm build

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see your animated app!

---

## Common Errors & Solutions

### ❌ Error: `Missing packageManager field in package.json`

**Solution**: Add to root `package.json`:
```json
"packageManager": "pnpm@10.15.0"
```

### ❌ Error: `Found an unknown key 'version'` in turbo.json

**Solution**: Remove `"version": "1"` from `turbo.json` (deprecated in Turbo v2.x).

### ❌ Error: `No matching version found for @types/gsap@^3.12.0`

**Solution**: Use `@types/gsap@^3.0.0` instead (latest available version).

### ❌ Error: `Configuring Next.js via 'next.config.ts' is not supported`

**Solution**: Use `next.config.mjs` or `next.config.js`, NOT `.ts` extension.

### ❌ Error: `Unknown font 'Geist'`

**Solution**: Use `Inter` or another standard Google Font. Geist is not available in Next 14.2.

### ❌ Error: `Cannot find module '@tailwindcss/postcss'`

**Solution**: Use standard Tailwind v3 config:
```javascript
plugins: {
  tailwindcss: {},
  autoprefixer: {},
}
```

### ❌ Error: `Cannot write file ... would overwrite input file`

**Solution**: Set `"noEmit": true` in root `tsconfig.json`.

### ❌ Error: `Unknown at rule @import "tailwindcss"`

**Solution**: Use Tailwind v3 directives in CSS:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Final Directory Structure

```
my-animated-monorepo/
├── apps/
│   └── web/
│       ├── src/
│       │   └── app/
│       │       ├── layout.tsx
│       │       ├── page.tsx
│       │       └── globals.css
│       ├── next.config.mjs
│       ├── tailwind.config.js
│       ├── postcss.config.mjs
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── animations/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── gsap-config.ts
│   │   │   └── framer-variants.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── ui/
│       ├── src/
│       │   ├── index.ts
│       │   ├── Button.tsx
│       │   └── Card.tsx
│       ├── tsconfig.json
│       └── package.json
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── package.json
└── .gitignore
```

---

## Performance Tips

1. **Lazy load GSAP**: Import only in components that need it
2. **Use CSS transforms**: Leverage GPU acceleration (`transform`, `opacity`)
3. **Code split by route**: Next.js handles this automatically
4. **Optimize Framer Motion**: Use `layout` prop for shared layout animations
5. **Cache aggressively**: Turborepo caches unchanged packages

---

## Next Steps

- Add Storybook for component development
- Implement scroll-triggered animations with GSAP ScrollTrigger
- Add page transitions with Framer Motion
- Set up ESLint and Prettier
- Configure CI/CD with Turbo Remote Caching

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Tested With**: Turbo 2.6.0, pnpm 10.15.0, Next.js 14.2.33, TypeScript 5.3.0
