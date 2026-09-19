import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const imagesToOptimize = [
  { path: "public/trainers/faiza-ghaffar.png", maxWidth: 800, quality: 85 },
  { path: "public/trainers/talha-iqbal.png", maxWidth: 800, quality: 85 },
  { path: "public/trainers/tatheer-hussain.png", maxWidth: 800, quality: 85 },
  { path: "public/trainers/zunira-rehman.png", maxWidth: 800, quality: 85 },
  { path: "public/sample-easypaisa-receipt.png", maxWidth: 600, quality: 85 },
  { path: "public/eest-logo.png", maxWidth: 1024, quality: 90 },
];

async function main() {
  console.log("Starting static asset optimization...");
  let totalSaved = 0;

  for (const item of imagesToOptimize) {
    const fullPath = path.resolve(process.cwd(), item.path);
    const statBefore = await fs.stat(fullPath);
    const beforeSize = statBefore.size;

    const pipeline = sharp(fullPath);
    if (item.maxWidth) {
      pipeline.resize({ width: item.maxWidth, withoutEnlargement: true });
    }
    const optimizedBuffer = await pipeline
      .png({ quality: item.quality, compressionLevel: 9, effort: 7 })
      .toBuffer();

    const afterSize = optimizedBuffer.length;
    if (afterSize < beforeSize) {
      await fs.writeFile(fullPath, optimizedBuffer);
      const saved = beforeSize - afterSize;
      totalSaved += saved;
      const pct = Math.round((saved / beforeSize) * 100);
      console.log(`✓ ${item.path}: ${(beforeSize / 1024).toFixed(1)}KB -> ${(afterSize / 1024).toFixed(1)}KB (-${pct}%)`);
    } else {
      console.log(`- ${item.path}: already optimal (${(beforeSize / 1024).toFixed(1)}KB)`);
    }
  }

  console.log(`\nOptimization complete! Total bandwidth saved: ${(totalSaved / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error("Asset optimization error:", err);
  process.exit(1);
});
