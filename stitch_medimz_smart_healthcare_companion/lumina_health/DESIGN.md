---
name: Lumina Health
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#56423b'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#8a726a'
  outline-variant: '#ddc0b7'
  surface-tint: '#a04117'
  primary: '#a04117'
  on-primary: '#ffffff'
  primary-container: '#ee7b4d'
  on-primary-container: '#5f1d00'
  inverse-primary: '#ffb59a'
  secondary: '#096490'
  on-secondary: '#ffffff'
  secondary-container: '#8aceff'
  on-secondary-container: '#005880'
  tertiary: '#006e2f'
  on-tertiary: '#ffffff'
  tertiary-container: '#00b351'
  on-tertiary-container: '#003c16'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#802a00'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#8aceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004b6f'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is anchored in a "Humanistic Futurism" aesthetic. It moves away from the cold, sterile visuals of traditional clinical software toward a warm, AI-augmented wellness experience. The brand personality is deeply caring yet intellectually sharp, designed to feel like a calm, knowledgeable companion rather than a rigid medical tool.

The visual style blends **Glassmorphism** with **Minimalism**. It utilizes soft-focus background blurs, translucent layers, and floating interface elements to create a sense of lightness and technical sophistication. Interactions should feel fluid and organic, mirroring the natural rhythms of human health. The goal is to evoke an emotional response of safety, clarity, and optimism.

## Colors

The palette is intentionally balanced between biological warmth and technological trust. 

- **Primary (Warm Coral):** Used for primary actions, vital health metrics, and elements requiring human attention. It prevents the UI from feeling "cold."
- **Secondary (Trust Blue):** Used for navigation, structural elements, and data visualization to establish a foundation of reliability and intelligence.
- **Background (Soft Slate):** A tinted off-white that reduces eye strain compared to pure white, providing a gentle canvas for glassmorphic effects.
- **Success (Vital Green):** Reserved strictly for positive health outcomes and completed tasks.

Use soft gradients blending Coral and Blue sparingly for "AI-powered" features or state-of-the-art diagnostic summaries to signal innovation.

## Typography

This design system prioritizes legibility and accessibility, particularly for users who may have visual impairments or be in high-stress situations. **Manrope** is used for its modern, geometric yet friendly proportions, ensuring that headlines feel authoritative but approachable.

For functional data and small-scale interface labels, **Hanken Grotesk** provides a sharper, technical edge that aids in quick information processing. 

- **Scale:** Body text starts at a generous 16px to ensure readability for elderly users. 
- **Weight:** Use Semibold (600) for interactive elements and Bold (700+) for critical health indicators.
- **Line Height:** Relaxed line heights (1.5x for body) are maintained to create a "breathable" reading experience.

## Layout & Spacing

The layout philosophy is rooted in a **Fluid Grid** system with generous negative space to minimize cognitive load. 

- **Grid:** Use a 12-column grid for desktop and a 4-column grid for mobile. 
- **Rhythm:** An 8px linear scale governs all spacing. 
- **Safe Areas:** Large internal paddings within cards (minimum 24px) prevent information density from feeling overwhelming.
- **Reflow:** On mobile, side-by-side card elements should stack vertically to maintain font scale and touch-target integrity. Center-align display typography on mobile for a more editorial, "Headspace-like" feel.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. 

1. **Base Layer:** The soft background (#F8FAFC).
2. **Surface Layer (Cards):** Pure white (#FFFFFF) with a very soft, diffused shadow (15% opacity of Trust Blue) and a 1px border (#E2E8F0) to define edges without harshness.
3. **Floating Layer (Modals/Action Sheets):** Glassmorphism effect—White at 80% opacity with a 20px backdrop blur and a more pronounced shadow to indicate temporary focus.

Avoid heavy blacks in shadows; always tint shadows with the Secondary (Blue) color to maintain the clean, "healthcare-tech" atmosphere.

## Shapes

The shape language is consistently "Rounded" to evoke friendliness and safety. 

- **Primary Elements:** Buttons and Input fields use a 0.5rem (8px) radius.
- **Containers:** Informational cards and dashboard modules use a 1rem (16px) radius to create a soft, pillowy appearance.
- **Featured Elements:** Large promotional banners or "AI Insight" cards may use a 1.5rem (24px) radius to stand out as premium "floating" objects.

## Components

- **Buttons:** Primary buttons use a solid Warm Coral fill with white text. Secondary buttons use a transparent background with a Trust Blue border. All buttons have a subtle "lift" hover effect.
- **Floating Cards:** The centerpiece of the UI. Cards should feature high-contrast headlines and plenty of whitespace. Vital metrics within cards should use the secondary Trust Blue for icons and primary Coral for the data values.
- **Inputs:** Fields should have a subtle background tint (#F1F5F9) when inactive, moving to a white background with a Trust Blue border on focus. Labels always sit above the field in Hanken Grotesk.
- **Chips/Badges:** Used for status (e.g., "Active," "Scheduled"). These should have a low-saturation background version of the status color (e.g., Success Green at 10% opacity) with high-saturation text.
- **Health Illustrations:** Use "Claymorphism" or soft-vector 3D illustrations. Avoid stock photos of hospitals; prefer abstract representations of DNA, pulse lines, or serene nature-inspired imagery to maintain the "calm" brand pillar.
- **Progress Bars:** Thicker, rounded tracks (8px height) with a gradient fill from Trust Blue to Warm Coral to represent health journeys or data processing.