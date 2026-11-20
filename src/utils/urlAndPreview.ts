import { DevicePreset, Orientation } from "../types/device";

export const SANDBOX_DEMO_URL = "https://sandbox.responsive-lab.dev";

export interface SampleSitePreset {
  label: string;
  url: string;
  badge: string;
  description: string;
}

export const SAMPLE_TEST_URLS: SampleSitePreset[] = [
  {
    label: "Responsive Diagnostic Page",
    url: SANDBOX_DEMO_URL,
    badge: "Built-in Live CSS",
    description: "Interactive page reporting live window.innerWidth, @media queries & CSS grid reflows",
  },
  {
    label: "example.com",
    url: "https://example.com",
    badge: "IANA Standard",
    description: "Lightweight, fast-loading standard HTTP/HTTPS embed verification page",
  },
  {
    label: "Wikipedia",
    url: "https://en.m.wikipedia.org/wiki/Responsive_web_design",
    badge: "Live Wiki",
    description: "Real-world editorial typography and mobile/tablet article reflows",
  },
  {
    label: "OpenStreetMap",
    url: "https://www.openstreetmap.org/export/embed.html",
    badge: "Interactive Map",
    description: "Touch/pan interactive canvas viewport sizing verification",
  },
];

// Well-known domains that enforce X-Frame-Options: DENY/SAMEORIGIN or CSP frame-ancestors 'none'/'self'
const KNOWN_FRAME_BLOCKED_DOMAINS = [
  "google.com",
  "github.com",
  "gitlab.com",
  "x.com",
  "twitter.com",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "youtube.com",
  "reddit.com",
  "netflix.com",
  "amazon.com",
  "apple.com",
  "microsoft.com",
  "stackoverflow.com",
  "figma.com",
  "notion.so",
  "discord.com",
  "paypal.com",
  "yahoo.com",
  "nytimes.com",
  "medium.com",
];

export interface UrlValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  errorMessage?: string;
  suggestedUrl?: string;
}

export function validateWebsiteUrl(rawInput: string): UrlValidationResult {
  const trimmed = rawInput.trim();

  if (!trimmed) {
    return {
      isValid: false,
      errorMessage: "Enter a valid HTTP or HTTPS website URL (for example, https://example.com).",
    };
  }

  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      errorMessage: "URL cannot contain spaces. Check the address and try again.",
    };
  }

  // Check if user omitted http:// or https:// on what looks like a valid domain or localhost
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    const candidate = trimmed.startsWith("localhost") || /^\d{1,3}(\.\d{1,3}){3}/.test(trimmed)
      ? `http://${trimmed}`
      : `https://${trimmed}`;

    try {
      const parsedCandidate = new URL(candidate);
      const host = parsedCandidate.hostname;
      if (host === "localhost" || host.includes(".")) {
        return {
          isValid: false,
          errorMessage: "Include http:// or https:// at the start of the URL.",
          suggestedUrl: parsedCandidate.toString(),
        };
      }
    } catch {
      // fall through to standard invalid message
    }

    return {
      isValid: false,
      errorMessage: "Invalid URL format. Enter a full address such as https://example.com.",
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      isValid: false,
      errorMessage: "Malformed URL syntax. Please enter a valid https:// or http:// address.",
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return {
      isValid: false,
      errorMessage: `Unsupported protocol "${parsed.protocol}". Only http:// and https:// URLs are supported.`,
    };
  }

  const host = parsed.hostname.toLowerCase();
  const isLocalhost = host === "localhost" || host === "127.0.0.1";
  const isIpv4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  const hasValidDomainDot = host.includes(".") && !host.startsWith(".") && !host.endsWith(".");

  if (!isLocalhost && !isIpv4 && !hasValidDomainDot) {
    return {
      isValid: false,
      errorMessage: `Invalid hostname "${parsed.hostname}". Include a valid domain extension (e.g., .com, .org, .dev).`,
    };
  }

  return {
    isValid: true,
    normalizedUrl: parsed.toString(),
  };
}

export function checkKnownEmbedRestriction(url: string): {
  isKnownBlocked: boolean;
  matchedDomain?: string;
} {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    for (const domain of KNOWN_FRAME_BLOCKED_DOMAINS) {
      if (host === domain || host.endsWith(`.${domain}`)) {
        return { isKnownBlocked: true, matchedDomain: domain };
      }
    }
    return { isKnownBlocked: false };
  } catch {
    return { isKnownBlocked: false };
  }
}

export function isSandboxDemoUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase() === "sandbox.responsive-lab.dev";
  } catch {
    return false;
  }
}

export function openUrlInNewTab(url: string): void {
  if (!url) return;
  if (isSandboxDemoUrl(url)) {
    const html = buildResponsiveDiagnosticHtml();
    const blob = new Blob([html], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export function buildResponsiveDiagnosticHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Responsive Diagnostic Test Page</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0b1120;
      --card: #111827;
      --border: #1e293b;
      --accent: #38bdf8;
      --accent2: #818cf8;
      --text: #f1f5f9;
      --muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding-bottom: 48px;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      background: rgba(11, 17, 32, 0.88);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: -0.01em;
    }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 10px var(--accent);
    }
    .desktop-nav { display: none; gap: 16px; font-size: 13px; color: var(--muted); }
    .mobile-menu-btn {
      display: inline-flex;
      padding: 5px 10px;
      border-radius: 6px;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--text);
      font-size: 12px;
    }
    @media (min-width: 768px) {
      .desktop-nav { display: flex; }
      .mobile-menu-btn { display: none; }
    }
    .container {
      max-width: 1180px;
      margin: 0 auto;
      padding: 20px 18px;
    }
    .hero {
      padding: 22px;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(56,189,248,0.13), rgba(129,140,248,0.10));
      border: 1px solid rgba(56,189,248,0.28);
      margin-bottom: 18px;
    }
    .live-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 11px;
      padding: 3px 9px;
      border-radius: 999px;
      background: rgba(56,189,248,0.16);
      color: #7dd3fc;
      margin-bottom: 10px;
    }
    h1 {
      font-size: clamp(1.25rem, 4vw, 2.1rem);
      line-height: 1.2;
      margin-bottom: 8px;
    }
    .readout {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .metric {
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid var(--border);
      border-radius: 8px;
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 12px;
    }
    .metric strong { color: var(--accent); }
    .bp-banner {
      margin-bottom: 18px;
      padding: 10px 14px;
      border-radius: 10px;
      background: var(--card);
      border: 1px solid var(--border);
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    .bp-tag::after {
      content: "XS Mobile (< 640px)";
      color: #38bdf8;
      font-weight: 700;
    }
    @media (min-width: 640px) { .bp-tag::after { content: "SM Large Mobile (≥ 640px)"; color: #22d3ee; } }
    @media (min-width: 768px) { .bp-tag::after { content: "MD Tablet (≥ 768px)"; color: #818cf8; } }
    @media (min-width: 1024px) { .bp-tag::after { content: "LG Desktop / Landscape Tablet (≥ 1024px)"; color: #c084fc; } }
    @media (min-width: 1280px) { .bp-tag::after { content: "XL Widescreen (≥ 1280px)"; color: #fbbf24; } }

    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }
    @media (min-width: 600px) {
      .grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (min-width: 1024px) {
      .grid { grid-template-columns: repeat(3, 1fr); }
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
    }
    .card h3 { font-size: 14px; margin-bottom: 6px; color: #e2e8f0; }
    .card p { font-size: 12.5px; color: var(--muted); }
    .btn-row {
      margin-top: 16px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .touch-btn {
      min-height: 44px;
      padding: 0 16px;
      border-radius: 8px;
      border: 1px solid rgba(56,189,248,0.4);
      background: rgba(56,189,248,0.12);
      color: #e0f2fe;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .touch-btn:active { transform: scale(0.98); }
  </style>
</head>
<body>
  <header>
    <div class="brand"><span class="dot"></span><span>Viewport Test Target</span></div>
    <nav class="desktop-nav">
      <span>Layout</span>
      <span>Typography</span>
      <span>Media Queries</span>
      <span>Touch Targets</span>
    </nav>
    <button class="mobile-menu-btn" type="button">☰ Menu</button>
  </header>
  <main class="container">
    <section class="hero">
      <div class="live-pill">LIVE IFRAME VIEWPORT TELEMETRY</div>
      <h1>True CSS Viewport Simulation Verified</h1>
      <p style="color:#94a3b8;font-size:13px;">Rotate the device, click quick breakpoints, or change zoom — notice that zoom scales visually while CSS pixels remain exact.</p>
      <div class="readout">
        <div class="metric">innerWidth: <strong id="vw">--</strong>px</div>
        <div class="metric">innerHeight: <strong id="vh">--</strong>px</div>
        <div class="metric">Orientation: <strong id="ori">--</strong></div>
      </div>
    </section>

    <div class="bp-banner">
      <span style="color:#94a3b8;">Active CSS @media Breakpoint:</span>
      <span class="bp-tag"></span>
    </div>

    <section class="grid">
      <article class="card">
        <h3>1 → 2 → 3 Column Grid</h3>
        <p>Single column below 600px, two columns from 600px–1023px, and three columns at 1024px and wider.</p>
      </article>
      <article class="card">
        <h3>Adaptive Header Navigation</h3>
        <p>Displays a compact menu button below 768px and switches to horizontal links on tablets and desktops.</p>
      </article>
      <article class="card">
        <h3>Fluid Clamp Typography</h3>
        <p>Headings smoothly scale using CSS <code>clamp(1.25rem, 4vw, 2.1rem)</code> across foldable and tablet screens.</p>
      </article>
      <article class="card">
        <h3>44×44px Touch Target Check</h3>
        <p>Interactive buttons below use WCAG recommended 44 CSS px minimum touch height for mobile ergonomics.</p>
      </article>
      <article class="card">
        <h3>Safe Area & Scroll Flow</h3>
        <p>Toggle Safe Area Guides and Grid Overlay in the toolbar above to inspect top notch and home-bar clearances.</p>
      </article>
      <article class="card">
        <h3>Side-by-Side Compare Ready</h3>
        <p>Switch to Compare Mode in the top header to view Phone, Foldable, and Tablet breakpoints simultaneously.</p>
      </article>
    </section>

    <div class="btn-row">
      <button class="touch-btn" onclick="this.textContent = 'Tapped at ' + window.innerWidth + '×' + window.innerHeight + 'px ✓'">Test 44px Touch Target</button>
    </div>
  </main>
  <script>
    function updateMetrics() {
      document.getElementById('vw').textContent = window.innerWidth;
      document.getElementById('vh').textContent = window.innerHeight;
      document.getElementById('ori').textContent = window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
    }
    window.addEventListener('resize', updateMetrics);
    updateMetrics();
  </script>
</body>
</html>`;
}

export function exportViewportSpecCardPng(params: {
  device: DevicePreset;
  width: number;
  height: number;
  orientation: Orientation;
  url: string;
}): void {
  const { device, width, height, orientation, url } = params;
  const pad = 64;
  const headerH = 92;
  const footerH = 68;
  // Scale large viewports gently so PNG stays crisp and reasonable
  const previewScale = Math.min(1, 900 / Math.max(width, height));
  const drawW = Math.round(width * previewScale);
  const drawH = Math.round(height * previewScale);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(620, drawW + pad * 2);
  canvas.height = drawH + headerH + footerH + pad;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle dot pattern
  ctx.fillStyle = "rgba(148, 163, 184, 0.14)";
  for (let x = 20; x < canvas.width; x += 24) {
    for (let y = 20; y < canvas.height; y += 24) {
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  // Header metadata
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 20px Inter, system-ui, sans-serif";
  ctx.fillText(`${device.name} (${device.manufacturer})`, pad, 44);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "600 14px monospace";
  ctx.fillText(
    `${width} × ${height} CSS px  •  @${device.dpr}x DPR  •  ${orientation.toUpperCase()}  •  ${device.accuracy.toUpperCase()}`,
    pad,
    70
  );

  // Centered device bezel
  const frameX = Math.round((canvas.width - drawW) / 2);
  const frameY = headerH + 16;

  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(frameX - 12, frameY - 12, drawW + 24, drawH + 24, 24);
  ctx.fill();
  ctx.stroke();

  // Screen interior
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(frameX, frameY, drawW, drawH);

  // Grid guides inside screen
  ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
  ctx.lineWidth = 1;
  const cols = 4;
  for (let i = 1; i < cols; i++) {
    const gx = frameX + (drawW / cols) * i;
    ctx.beginPath();
    ctx.moveTo(gx, frameY);
    ctx.lineTo(gx, frameY + drawH);
    ctx.stroke();
  }

  // Center spec stamp
  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "center";
  ctx.font = "bold 22px monospace";
  ctx.fillText(`${width} × ${height} CSS px`, frameX + drawW / 2, frameY + drawH / 2 - 14);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px Inter, system-ui, sans-serif";
  const displayUrl = url ? (url.length > 52 ? url.slice(0, 49) + "..." : url) : "No URL loaded";
  ctx.fillText(displayUrl, frameX + drawW / 2, frameY + drawH / 2 + 14);

  ctx.fillStyle = "#64748b";
  ctx.font = "11px Inter, system-ui, sans-serif";
  ctx.fillText(
    "Cross-origin iframe pixels omitted per browser Same-Origin Policy",
    frameX + drawW / 2,
    frameY + drawH / 2 + 38
  );

  // Footer
  ctx.textAlign = "left";
  ctx.fillStyle = "#64748b";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillText(
    `Responsive Device Testing Lab • Exported ${new Date().toLocaleString()}`,
    pad,
    canvas.height - 24
  );

  const link = document.createElement("a");
  const slug = device.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  link.download = `viewport-${slug}-${width}x${height}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
