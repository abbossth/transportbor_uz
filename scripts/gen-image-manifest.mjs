// public/images/ dagi bezak rasmlarini topib, o‘lcham va blur-placeholder bilan manifest yaratadi.
// Fayl yo‘q bo‘lsa, manifestga kirmaydi va sayt gradient fallback ko‘rsatadi.
import fs from "node:fs";
import path from "node:path";

const NAMES = ["hero", "van-city", "boxes", "handover", "road-a", "road-b", "road-c", "night-road", "t-car", "t-mini", "t-pickup", "t-semi"];
const EXTS = [".jpg", ".jpeg", ".webp", ".avif", ".png"];
const dir = path.join(process.cwd(), "public", "images");
const outFile = path.join(process.cwd(), "src", "lib", "image-manifest.json");

let sharp = null;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("[images] sharp topilmadi — blur placeholder'siz davom etiladi");
}

const manifest = {};
const missing = [];
for (const name of NAMES) {
  const ext = EXTS.find((e) => fs.existsSync(path.join(dir, name + e)));
  if (!ext) {
    missing.push(name);
    continue;
  }
  const file = path.join(dir, name + ext);
  const entry = { src: `/images/${name}${ext}`, width: 1600, height: 1067, blurDataURL: undefined };
  if (sharp) {
    try {
      const meta = await sharp(file).metadata();
      entry.width = meta.width ?? entry.width;
      entry.height = meta.height ?? entry.height;
      const buf = await sharp(file).resize(24).blur(2).jpeg({ quality: 55 }).toBuffer();
      entry.blurDataURL = `data:image/jpeg;base64,${buf.toString("base64")}`;
    } catch (e) {
      console.warn(`[images] ${name}${ext} o‘qilmadi:`, e instanceof Error ? e.message : e);
      continue;
    }
  }
  manifest[name] = entry;
}

fs.writeFileSync(outFile, JSON.stringify(manifest, null, 2) + "\n");
console.log(`[images] ${Object.keys(manifest).length} ta rasm topildi${missing.length ? `, yetishmaydi: ${missing.join(", ")}` : ""}`);
