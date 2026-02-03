# @canonical/launchpad-design-tokens

Design tokens for Canonical's Launchpad, providing consistent styling across the platform. This package generates CSS custom properties and Figma tokens from a centralized token system.

## Installation

```bash
npm install @canonical/launchpad-design-tokens
```

## Usage

### CSS Tokens

The package provides CSS files with custom properties for different categories:

#### Colors

- `dist/css/color/light.css` - Light mode colors
- `dist/css/color/dark.css` - Dark mode colors
- `dist/css/color/system.css` - System preference based colors

#### Typography

- `dist/css/typography/narrow.css` - Typography for narrow screens
- `dist/css/typography/medium.css` - Typography for medium screens
- `dist/css/typography/wide.css` - Typography for wide screens
- `dist/css/typography/extraWide.css` - Typography for extra wide screens
- `dist/css/typography/responsive.css` - Responsive typography system

#### Dimensions

- `dist/css/dimension/narrow.css` - Dimensions for narrow screens
- `dist/css/dimension/medium.css` - Dimensions for medium screens
- `dist/css/dimension/wide.css` - Dimensions for wide screens
- `dist/css/dimension/extraWide.css` - Dimensions for extra wide screens
- `dist/css/dimension/responsive.css` - Responsive dimension system

#### Opacity

- `dist/css/opacity/opacity.css` - Opacity levels for transparency effects

#### Transition

- `dist/css/transition/normal.css` - Standard transition timings
- `dist/css/transition/preferred.css` - Transitions based on prefers-motion setting
- `dist/css/transition/reduced-motion.css` - Transitions for reduced motion preferences

### Figma Tokens

Figma-compatible token files are available in `dist/figma/` with the same structure as CSS tokens, plus manifest files for easy import.

## Development

### Prerequisites

- [Bun](https://bun.sh) - JavaScript runtime and package manager

### Setup

```bash
bun install
```

### Available Scripts

```bash
# Build all tokens
bun run build

# Build specific categories
bun run build:color
bun run build:typography
bun run build:dimension
bun run build:opacity
bun run build:transition

# Run linting and type checking
bun run check

# Fix linting issues
bun run check:fix
```

### Project Structure

```
src/
├── tokens/
│   ├── primitives/     # Base token values
│   └── semantic/       # Semantic token definitions
│       ├── color/
│       ├── typography/
│       ├── dimension/
│       ├── opacity/
│       └── transition/
└── build/              # Build scripts
    ├── color.ts
    ├── typography.ts
    ├── dimension.ts
    ├── opacity.ts
    └── transition.ts
```

## Token Categories

### Colors

- Light and dark mode support
- System preference detection
- Semantic color names for consistent theming

### Typography

- Responsive font sizes and line heights
- Breakpoint-specific typography scales
- Consistent font family definitions

### Dimensions

- Spacing and layout dimensions
- Responsive sizing systems
- Breakpoint-specific dimension scales

### Opacity

- Transparency level definitions
- Semantic opacity values for consistent visual hierarchy

### Transition

- Animation and transition timing functions
- Motion preferences support (normal and reduced motion)
- Consistent animation durations

## License

LGPL-3.0

## Contributing

This project is maintained by the Canonical Webteam. For questions or contributions, please contact webteam@canonical.com.
