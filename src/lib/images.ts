import manifest from "./image-manifest.json";

export type ImageName = "hero" | "van-city" | "boxes" | "handover" | "road-a" | "road-b" | "road-c" | "night-road" | "t-car" | "t-mini" | "t-pickup" | "t-semi";
export type ImageEntry = { src: string; width: number; height: number; blurDataURL?: string };

const entries = manifest as Partial<Record<ImageName, ImageEntry>>;

export function getImage(name: ImageName): ImageEntry | null {
  return entries[name] ?? null;
}
