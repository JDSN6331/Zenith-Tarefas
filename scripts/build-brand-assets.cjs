const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Palettes configuration for the new Zenith Brand Identity
 */
const PALETTES = {
  escuro: {
    id: 'escuro',
    name: 'Escuro (Midnight Cyan)',
    bg1: '#060B17',
    bg2: '#0B152B',
    border: 'rgba(0, 229, 255, 0.35)',
    innerRim: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(0, 229, 255, 0.35)',
    c1: '#E0F7FA', // white/cyan highlight
    c2: '#00E5FF', // electric cyan
    c3: '#00B0FF', // deep cyan
    c4: '#6366F1', // indigo accent
    star: '#00E5FF',
    accent: '#00E5FF',
    subtext: '#38BDF8',
  },
  claro: {
    id: 'claro',
    name: 'Claro (Sky Cyan & Navy)',
    bg1: '#091326',
    bg2: '#102042',
    border: 'rgba(56, 189, 248, 0.35)',
    innerRim: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(56, 189, 248, 0.35)',
    c1: '#F0F9FF',
    c2: '#38BDF8',
    c3: '#0284C7',
    c4: '#4F46E5',
    star: '#38BDF8',
    accent: '#0284C7',
    subtext: '#0284C7',
  },
  verde: {
    id: 'verde',
    name: 'Verde (Emerald Aurora)',
    bg1: '#03140C',
    bg2: '#062617',
    border: 'rgba(74, 222, 128, 0.35)',
    innerRim: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(16, 185, 129, 0.35)',
    c1: '#F0FDF4',
    c2: '#4ADE80',
    c3: '#10B981',
    c4: '#059669',
    star: '#4ADE80',
    accent: '#10B981',
    subtext: '#4ADE80',
  },
  quente: {
    id: 'quente',
    name: 'Quente (Amber Sunset)',
    bg1: '#180B03',
    bg2: '#2B1405',
    border: 'rgba(245, 158, 11, 0.35)',
    innerRim: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(245, 158, 11, 0.35)',
    c1: '#FEFCE8',
    c2: '#FDE047',
    c3: '#F59E0B',
    c4: '#EA580C',
    star: '#FDE047',
    accent: '#F59E0B',
    subtext: '#F59E0B',
  },
  roxo: {
    id: 'roxo',
    name: 'Roxo (Cosmic Amethyst)',
    bg1: '#140420',
    bg2: '#25073B',
    border: 'rgba(236, 72, 153, 0.35)',
    innerRim: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(168, 85, 247, 0.35)',
    c1: '#FDF2F8',
    c2: '#F472B6',
    c3: '#EC4899',
    c4: '#A855F7',
    star: '#F472B6',
    accent: '#EC4899',
    subtext: '#EC4899',
  },
};

/**
 * Builds the pure SVG for the Zenith Apex Emblem
 */
function buildZenithSvg(p, size = 512) {
  return `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg-${p.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}" />
      <stop offset="100%" stop-color="${p.bg2}" />
    </linearGradient>

    <!-- Core Ambient Radial Glow -->
    <radialGradient id="glow-${p.id}" cx="50%" cy="46%" r="46%">
      <stop offset="0%" stop-color="${p.glow}" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>

    <!-- Upper Facet: Top Bar + Apex Wedge -->
    <linearGradient id="facet-top-${p.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.c1}" />
      <stop offset="35%" stop-color="${p.c2}" />
      <stop offset="100%" stop-color="${p.c3}" />
    </linearGradient>

    <!-- Diagonal Blade: Center Precision Prism -->
    <linearGradient id="blade-${p.id}" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${p.c4}" />
      <stop offset="50%" stop-color="${p.c3}" />
      <stop offset="100%" stop-color="${p.c2}" />
    </linearGradient>

    <!-- Lower Facet: Base Wing Foundation -->
    <linearGradient id="facet-bot-${p.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.c2}" />
      <stop offset="60%" stop-color="${p.c3}" />
      <stop offset="100%" stop-color="${p.c4}" />
    </linearGradient>

    <!-- Star Radiant Flare -->
    <radialGradient id="star-flare-${p.id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="35%" stop-color="${p.star}" stop-opacity="0.95" />
      <stop offset="100%" stop-color="${p.star}" stop-opacity="0" />
    </radialGradient>

    <!-- Drop Shadow for Upper Elements -->
    <filter id="shadow-${p.id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="3.5" stdDeviation="4" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- Luxury Squircle Badge -->
  <rect x="2" y="2" width="96" height="96" rx="24" fill="url(#bg-${p.id})" />
  <circle cx="50" cy="46" r="42" fill="url(#glow-${p.id})" />
  <rect x="2" y="2" width="96" height="96" rx="24" stroke="${p.border}" stroke-width="1.2" fill="none" />
  <rect x="3.5" y="3.5" width="93" height="93" rx="22.5" stroke="${p.innerRim}" stroke-width="0.8" fill="none" />

  <!-- Astronomical Orbit Arc (Celestial Trajectory) -->
  <ellipse cx="50" cy="50" rx="36" ry="17" transform="rotate(-28 50 50)" stroke="${p.c2}" stroke-width="1.2" stroke-dasharray="3 4" opacity="0.3" fill="none" />

  <!-- === THE ZENITH APEX Z MONOGRAM === -->
  <!-- 
    Master Geometry:
    An ultra-clean, architectural Z composed of three solid precision-beveled components:
    1. Base Foundation Bar: anchors the bottom with forward momentum.
    2. Diagonal Blade: a sharp 48-degree dynamic chiseled prism.
    3. Upper Apex Wing: ascends upward and forms a sharp mountain peak / arrow pointing to the zenith star.
  -->

  <!-- 1. Base Wing (Ground / Foundation) -->
  <path
    d="M 28 66 H 72 C 75.5 66 77.5 70 75 73 L 73 75 C 71.5 76.5 69.5 76.5 67.5 76.5 H 24 C 20.5 76.5 18.5 72.5 21 69.5 L 24 66 Z"
    fill="url(#facet-bot-${p.id})"
  />

  <!-- 2. Diagonal Blade (Connecting Prism) -->
  <path
    d="M 68 31 L 28 73 C 26 75 22 74 23 71 L 27 65 L 61 27 C 63 25 67 26 66 29 L 68 31 Z"
    fill="url(#blade-${p.id})"
  />

  <!-- 3. Upper Apex Wing (Reaching the Zenith) with Shadow -->
  <g filter="url(#shadow-${p.id})">
    <!-- Main Top Bar -->
    <path
      d="M 24 25 H 68 C 72 25 74 28 72 31.5 L 70 34 C 68.5 36 66 36 63.5 36 H 32 C 28.5 36 26.5 32 29 29 L 32 25 Z"
      fill="url(#facet-top-${p.id})"
    />

    <!-- Apex Needle Crest pointing up to star -->
    <path
      d="M 62 25 L 74 21 L 70 33 Z"
      fill="#FFFFFF"
      opacity="0.9"
    />

    <!-- Razor Specular Highlight Line on Upper Crest -->
    <line x1="28" y1="26" x2="69" y2="26" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.9" />
    <line x1="64" y1="28" x2="29" y2="69" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" opacity="0.8" />
  </g>

  <!-- === THE RADIANT ZENITH SUMMIT STAR === -->
  <!-- Ambient Flare at (74, 21) -->
  <circle cx="74" cy="21" r="14" fill="url(#star-flare-${p.id})" />

  <!-- 4-point Diamond Star -->
  <path
    d="M 74 9 Q 74 21 64 21 Q 74 21 74 33 Q 74 21 84 21 Q 74 21 74 9 Z"
    fill="#FFFFFF"
  />
  <!-- Core Brilliant Specular Dot -->
  <circle cx="74" cy="21" r="1.8" fill="#FFFFFF" />
</svg>
`.trim();
}

async function run() {
  const publicDir = path.join(__dirname, '..', 'public');
  const logosDir = path.join(publicDir, 'logos');
  if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir, { recursive: true });

  // Generate SVG and PNG for each palette
  for (const key of Object.keys(PALETTES)) {
    const p = PALETTES[key];
    const svg = buildZenithSvg(p, 512);
    
    // Save SVG
    fs.writeFileSync(path.join(logosDir, `zenith-${p.id}.svg`), svg, 'utf-8');
    
    // Save 512x512 PNG
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(logosDir, `zenith-${p.id}.png`));
    
    console.log(`Generated logo assets for palette: ${p.id}`);
  }

  // Use the Escuro (Official Midnight Cyan) emblem for system PWA assets & favicons
  const defaultSvg = buildZenithSvg(PALETTES.escuro, 512);
  const defaultPngBuffer = await sharp(Buffer.from(defaultSvg)).png().toBuffer();

  // 1. Favicon SVG
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), buildZenithSvg(PALETTES.escuro, 96), 'utf-8');
  console.log('✓ public/favicon.svg');

  // 2. Favicon ICO (48x48)
  await sharp(defaultPngBuffer)
    .resize(48, 48)
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ public/favicon.ico');

  // 3. Apple Touch Icon (180x180)
  await sharp(defaultPngBuffer)
    .resize(180, 180)
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ public/apple-touch-icon.png');

  // 4. PWA 192x192 PNG
  await sharp(defaultPngBuffer)
    .resize(192, 192)
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ public/pwa-192x192.png');

  // 5. PWA 512x512 PNG
  await sharp(defaultPngBuffer)
    .resize(512, 512)
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ public/pwa-512x512.png');

  // 6. PWA Maskable 512x512 PNG (with 15% safe zone margin)
  const innerIcon = await sharp(defaultPngBuffer)
    .resize(410, 410)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 6, g: 11, b: 23, alpha: 1 },
    },
  })
    .composite([{ input: innerIcon, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ public/pwa-maskable-512x512.png');

  // Also update SVG PWA icons
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.svg'), buildZenithSvg(PALETTES.escuro, 192), 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.svg'), buildZenithSvg(PALETTES.escuro, 512), 'utf-8');

  console.log('All brand assets generated successfully!');
}

run().catch(console.error);
