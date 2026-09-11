const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Palettes configuration matching ZenithLogo.tsx
 */
const PALETTES = {
  escuro: {
    id: 'escuro',
    name: 'Escuro (Midnight Cyan)',
    bg1: '#0A1628',
    bg2: '#060B17',
    border: 'rgba(0, 229, 255, 0.30)',
    innerRim: 'rgba(255, 255, 255, 0.06)',
    glow: 'rgba(0, 229, 255, 0.20)',
    g1: '#6366F1',
    g2: '#00E5FF',
    star: '#00E5FF',
    accent: '#00E5FF',
  },
  claro: {
    id: 'claro',
    name: 'Claro (Sky Cyan & Navy)',
    bg1: '#102042',
    bg2: '#091326',
    border: 'rgba(56, 189, 248, 0.30)',
    innerRim: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(56, 189, 248, 0.20)',
    g1: '#0284C7',
    g2: '#00F2FE',
    star: '#38BDF8',
    accent: '#0284C7',
  },
  verde: {
    id: 'verde',
    name: 'Verde (Emerald Aurora)',
    bg1: '#062617',
    bg2: '#03140C',
    border: 'rgba(74, 222, 128, 0.30)',
    innerRim: 'rgba(255, 255, 255, 0.06)',
    glow: 'rgba(16, 185, 129, 0.20)',
    g1: '#059669',
    g2: '#4ADE80',
    star: '#4ADE80',
    accent: '#10B981',
  },
  quente: {
    id: 'quente',
    name: 'Quente (Amber Sunset)',
    bg1: '#2B1405',
    bg2: '#180B03',
    border: 'rgba(245, 158, 11, 0.30)',
    innerRim: 'rgba(255, 255, 255, 0.06)',
    glow: 'rgba(245, 158, 11, 0.20)',
    g1: '#EA580C',
    g2: '#FDE047',
    star: '#FDE047',
    accent: '#F59E0B',
  },
  roxo: {
    id: 'roxo',
    name: 'Roxo (Cosmic Amethyst)',
    bg1: '#25073B',
    bg2: '#140420',
    border: 'rgba(168, 85, 247, 0.30)',
    innerRim: 'rgba(255, 255, 255, 0.06)',
    glow: 'rgba(168, 85, 247, 0.20)',
    g1: '#EC4899',
    g2: '#A855F7',
    star: '#F472B6',
    accent: '#EC4899',
  },
};

/**
 * Builds the exact SVG for the Zenith Badge Emblem
 */
function buildZenithSvg(p, size = 512) {
  return `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bb-${p.id}" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop offset="0%" stop-color="${p.bg1}" />
      <stop offset="100%" stop-color="${p.bg2}" />
    </linearGradient>
    <radialGradient id="bg-${p.id}" cx="50%" cy="45%" r="45%">
      <stop offset="0%" stop-color="${p.glow}" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
    <linearGradient id="zg-${p.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${p.g1}" />
      <stop offset="100%" stop-color="${p.g2}" />
    </linearGradient>
    <linearGradient id="ag-${p.id}" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="${p.g1}" stop-opacity="0.6" />
      <stop offset="50%" stop-color="${p.g2}" />
      <stop offset="100%" stop-color="${p.g2}" stop-opacity="0.6" />
    </linearGradient>
    <radialGradient id="sf-${p.id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="30%" stop-color="${p.star}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${p.star}" stop-opacity="0" />
    </radialGradient>
    <filter id="ds-${p.id}" x="-15%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#000000" flood-opacity="0.4" />
    </filter>
    <clipPath id="cp-${p.id}">
      <rect x="2" y="2" width="96" height="96" rx="24" />
    </clipPath>
  </defs>

  <!-- Fundo squircle -->
  <rect x="2" y="2" width="96" height="96" rx="24" fill="url(#bb-${p.id})" />
  <circle cx="50" cy="45" r="40" fill="url(#bg-${p.id})" />

  <g clip-path="url(#cp-${p.id})">
    <!-- Arco decorativo semicircular atras do Z -->
    <path
      d="M 18 68 A 34 34 0 0 1 82 68"
      stroke="url(#ag-${p.id})"
      stroke-width="2.5"
      stroke-linecap="round"
      fill="none"
      opacity="0.45"
    />

    <!-- Z geometrico bold — bloco estilizado -->
    <g filter="url(#ds-${p.id})">
      <!-- Barra superior do Z -->
      <path
        d="M 24 26 H 76 L 74 36 H 42"
        fill="url(#zg-${p.id})"
      />
      <!-- Diagonal do Z -->
      <path
        d="M 42 36 L 74 36 L 58 64 L 26 64"
        fill="url(#zg-${p.id})"
        opacity="0.85"
      />
      <!-- Barra inferior do Z -->
      <path
        d="M 26 64 H 58 L 24 74 H 76 L 58 64"
        fill="url(#zg-${p.id})"
      />
      <!-- Highlight de brilho na aresta superior -->
      <path
        d="M 24 26 H 76"
        stroke="rgba(255,255,255,0.5)"
        stroke-width="1"
        stroke-linecap="round"
      />
    </g>

    <!-- Sparkle / Estrela no canto superior direito -->
    <circle cx="78" cy="22" r="10" fill="url(#sf-${p.id})" />
    <path
      d="M 78 14 Q 78 22 72 22 Q 78 22 78 30 Q 78 22 84 22 Q 78 22 78 14 Z"
      fill="#FFFFFF"
    />
    <circle cx="78" cy="22" r="1.4" fill="#FFFFFF" />
  </g>

  <!-- Bordas do squircle -->
  <rect x="2" y="2" width="96" height="96" rx="24" stroke="${p.border}" stroke-width="1.2" fill="none" />
  <rect x="3.5" y="3.5" width="93" height="93" rx="22.5" stroke="${p.innerRim}" stroke-width="0.8" fill="none" />
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

  // 6. PWA Maskable 512x512 PNG (with safe zone margin)
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
  console.log('✓ public/pwa-192x192.svg & pwa-512x512.svg');

  console.log('All brand assets generated successfully!');
}

run().catch(console.error);
