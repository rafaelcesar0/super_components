# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack and Tools

This is a Next.js 15 project using:
- **Package Manager**: Bun (not npm/yarn)
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **TypeScript**: Full TypeScript setup
- **UI Components**: shadcn/ui with "new-york" style
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Geist Mono via next/font

## Common Commands

Development:
```bash
bun dev                 # Start development server with Turbopack
bun run build          # Build for production with Turbopack
bun start              # Start production server
bun lint               # Run ESLint
```

## Architecture

### Directory Structure
```
src/
├── app/                 # Next.js 15 App Router
│   ├── layout.tsx      # Root layout with Geist fonts
│   ├── page.tsx        # Homepage
│   └── globals.css     # Global styles with Tailwind v4 and theme variables
├── components/
│   └── ui/             # shadcn/ui components (40+ components pre-installed)
├── lib/
│   └── utils.ts        # Shared utilities (cn function for className merging)
└── hooks/
    └── use-mobile.ts   # Custom hooks
```

### shadcn/ui Configuration
- Style: "new-york"
- Base color: neutral
- CSS variables enabled
- Import aliases configured (@/components, @/lib, @/hooks, etc.)
- Components path: src/components/ui
- Full component library installed including forms, charts, sidebar, etc.

### Styling System
- **Tailwind CSS v4**: Uses new @import syntax and @theme inline configuration
- **CSS Variables**: Extensive theme system with light/dark mode support
- **Color System**: Uses oklch color space for better color interpolation
- **Custom Variants**: Dark mode variant defined as `@custom-variant dark (&:is(.dark *))`
- **Animation**: tw-animate-css package for enhanced animations

### TypeScript Configuration
- Path alias `@/*` maps to `./src/*`
- Next.js TypeScript plugin enabled
- Strict mode enabled

## Development Notes

- Uses Bun as package manager - always use `bun` commands, not npm/yarn
- Tailwind v4 syntax in globals.css (not traditional config file)
- All shadcn/ui components are pre-installed and ready to use
- Dark mode theming is fully configured with CSS variables
- Development server uses Turbopack for faster builds