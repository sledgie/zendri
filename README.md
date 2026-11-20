# Responsive Device Testing Lab

A modern, interactive browser-based responsive website testing laboratory built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**.

Designed for web developers, UI/UX designers, QA testers, and website owners to preview and inspect websites across **243 device presets** (smartphones, tablets, foldables, and generic viewports) plus custom user-defined screen profiles.

---

## Quick Start

```bash
npm install
npm run dev
```

To build a production bundle:

```bash
npm run build
npm run preview
```

---

## Key Features

- **243-Preset JSON Device Catalog (`responsive-device-catalog.json`)**:
  - Covers **26 manufacturers** (`Apple`, `Samsung`, `Google`, `OnePlus`, `Xiaomi`, `Redmi`, `POCO`, `Motorola`, `Nothing`, `OPPO`, `Vivo`, `Huawei`, `Honor`, `Sony`, `ASUS`, `ZTE`, `Nubia`, `RedMagic`, `Infinix`, `Tecno`, `Lenovo`, `Amazon`, `TCL`, `Nokia`, `Fairphone`, and `Generic`).
  - Organized into 6 collapsible categories: **iPhone**, **Android Phones**, **Foldable Phones**, **iPad**, **Android Tablets**, and **Generic Devices**.
  - Includes both **Compact List View** and **Card View**, instant multi-token search, brand/category/OS filters, **Favorites**, and **Recently Used** devices.
- **True CSS Viewport Simulation**:
  - Renders the target URL inside an `<iframe>` sized to the selected preset's exact CSS pixel dimensions (`width × height`).
  - Visual Zoom (`Fit to workspace`, `50%`, `75%`, `100%`, `125%`, and `Custom` slider) scales the outer presentation without altering CSS `@media` queries or `window.innerWidth` inside the page.
- **Side-by-Side Device Comparison Mode**:
  - Preview and synchronize a website across 2 or more devices simultaneously (e.g., `iPhone 17 Pro`, `Samsung Galaxy S25`, `iPad Air`).
  - Supports independent per-slot device selection, zoom, reload, independent or synchronized rotation, and side-by-side or stacked layouts.
- **Quick Breakpoint Toolbar**:
  - One-click responsive width testing (`320px` through `1440px`), Phone/Tablet/Desktop filters, and savable custom quick viewport sizes.
- **Developer Overlays & Tools**:
  - Pixel rulers, approximate Safe Area guides, 12-column CSS grid overlay, breakpoint range HUD, Copy Dimensions (`393 × 852 CSS px`), CSS `@media` snippet copy, and Viewport Spec Snapshot PNG export.
- **Custom Device Builder**:
  - Create, validate, edit, and delete custom device profiles persisted to `localStorage`.

---

## Project Architecture

```text
src/
├── components/
│   ├── AppShell.tsx
│   ├── BreakpointToolbar.tsx
│   ├── CompareMode.tsx
│   ├── CustomDeviceBuilder.tsx
│   ├── DeviceCard.tsx
│   ├── DeviceExplorer.tsx
│   ├── DeviceFilters.tsx
│   ├── DeviceFrame.tsx
│   ├── DeviceInformationPanel.tsx
│   ├── DeviceList.tsx
│   ├── DeviceSearch.tsx
│   ├── Header.tsx
│   ├── HelpDialog.tsx
│   ├── PreviewCanvas.tsx
│   ├── PreviewToolbar.tsx
│   ├── SettingsPanel.tsx
│   └── URLBar.tsx
├── data/
│   ├── deviceCatalog.ts
│   └── responsive-device-catalog.json
├── hooks/
│   └── useLocalStorage.ts
├── types/
│   └── device.ts
└── utils/
    └── urlAndPreview.ts
```

---

## Important Limitations

This application is a **CSS viewport simulation tool**, not a physical hardware or OS emulator:

1. It does **not** emulate actual iOS Safari WebKit or Android Chrome rendering engines, device-specific `User-Agent` headers, hardware touch sensors, native mobile keyboards, or hardware pixel density (`window.devicePixelRatio`) inside cross-origin frames.
2. Websites that send `X-Frame-Options: DENY` / `SAMEORIGIN` or `Content-Security-Policy: frame-ancestors` intentionally block third-party iframe embedding. When a site blocks framing, the lab displays a clear security explanation and an **Open in New Tab** action rather than bypassing website security headers.
3. Device presets marked **Est.** and safe-area overlays are approximations; always verify critical production releases on physical hardware.
