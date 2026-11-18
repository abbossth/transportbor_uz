import type { SpeechToTextProvider, TextToSpeechProvider } from "./types";
import { neuronAiStt, neuronAiTts } from "./neuronai";

/** Faol STT provayderi (yo‘q bo‘lsa — audio Gemini'ga beriladi yoki brauzer STT ishlatiladi). */
export function getSttProvider(): SpeechToTextProvider | null {
  return process.env.NEURONAI_API_KEY ? neuronAiStt : null;
}

/** Faol TTS provayderi (yo‘q bo‘lsa — brauzerdagi speechSynthesis). */
export function getTtsProvider(): TextToSpeechProvider | null {
  return process.env.NEURONAI_API_KEY ? neuronAiTts : null;
}
