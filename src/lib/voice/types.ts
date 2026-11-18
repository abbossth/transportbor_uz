/**
 * Ovoz provayderlari interfeysi. Boshqa o‘zbekcha STT/TTS xizmatiga o‘tish uchun
 * shu interfeysni amalga oshiruvchi yangi fayl qo‘shib, `server.ts` da almashtirish kifoya.
 */
export type AudioInput = { data: string /* base64 */; mimeType: string };

export interface SpeechToTextProvider {
  readonly name: string;
  transcribe(audio: AudioInput, language: "uz"): Promise<string>;
}

export interface TextToSpeechProvider {
  readonly name: string;
  synthesize(text: string, language: "uz"): Promise<{ audio: ArrayBuffer; contentType: string }>;
}
