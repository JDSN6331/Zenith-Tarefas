import fs from "fs";
import path from "path";
import sharp from "sharp";

const svgPath = path.resolve("public/pwa-512x512.svg");
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  console.log("Gerando ícones PWA e Favicon...");

  // 1. pwa-192x192.png
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile("public/pwa-192x192.png");
  console.log("✓ public/pwa-192x192.png");

  // 2. pwa-512x512.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile("public/pwa-512x512.png");
  console.log("✓ public/pwa-512x512.png");

  // 3. apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile("public/apple-touch-icon.png");
  console.log("✓ public/apple-touch-icon.png");

  // 4. pwa-maskable-512x512.png (padded to 80% inside a solid background for safe zone)
  const innerSize = Math.round(512 * 0.82);
  const padding = Math.round((512 - innerSize) / 2);
  const innerBuffer = await sharp(svgBuffer)
    .resize(innerSize, innerSize)
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 7, g: 11, b: 20, alpha: 1 },
    },
  })
    .composite([{ input: innerBuffer, top: padding, left: padding }])
    .png()
    .toFile("public/pwa-maskable-512x512.png");
  console.log("✓ public/pwa-maskable-512x512.png");

  // 5. favicon.ico (32x32 PNG inside favicon.ico)
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile("public/favicon.ico");
  console.log("✓ public/favicon.ico");

  console.log("Todos os ícones gerados com sucesso!");
}

generate().catch((err) => {
  console.error("Erro ao gerar ícones:", err);
  process.exit(1);
});
