# Fielia

Animation-heavy Next.js monorepo built with Turborepo, pnpm, GSAP, and Framer Motion.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build all packages
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint
```

## 📦 Project Structure

```
Fielia/
├── apps/
│   └── web/              # Next.js 14 application
├── packages/
│   ├── animations/       # Shared animation utilities (GSAP + Framer Motion)
│   └── ui/              # Reusable UI components
├── turbo.json           # Turborepo configuration
├── pnpm-workspace.yaml  # pnpm workspace config
└── package.json         # Root package.json
```

## 🎨 Packages

### `@fielia/animations`
Shared animation utilities and configurations for GSAP and Framer Motion.

### `@fielia/ui`
Reusable animated UI components built with React and Framer Motion.

### `@fielia/web`
Main Next.js application consuming the shared packages.

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Package Manager**: pnpm
- **Build System**: Turborepo
- **Styling**: Tailwind CSS
- **Animations**: GSAP + Framer Motion
- **Language**: TypeScript

## 📚 Documentation

See [MONOREPO_SETUP_GUIDE.md](./MONOREPO_SETUP_GUIDE.md) for detailed setup instructions.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm build` to ensure everything builds
4. Submit a pull request

## 📄 License

MIT
