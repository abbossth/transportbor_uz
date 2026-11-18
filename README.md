# TransportBor

**Yukingizga mos qatnovni bir daqiqada toping.**
Kichik yuk jo‘natmoqchi bo‘lgan foydalanuvchi uchun mos qatnovni topish va so‘rov yuborish sayti (Bilet 006).

🔗 Jonli sayt: https://transportbor-uz.vercel.app

> Bu sinov loyihasi: haqiqiy xarid, band qilish yoki xabar yuborish amalga oshirilmaydi.

## Imkoniyatlar

- **Ro‘yxat → tafsilot → amal:** 5 ta qatnov sana bo‘yicha guruhlangan, kartochkada ID, vizual yo‘nalish, jo‘nash vaqti va qolgan vaqt ko‘rsatiladi.
- **Filtr** “Qayerga” ustuni bo‘yicha: Barchasi / A / B / C tumani, har birida son (5/2/2/1). Tanlov URL'ga yoziladi (`?to=B+tumani`).
- **So‘rov shakli:** desktop'da modal, telefonda pastdan chiqadigan sheet. Esc, “Ortga”, “Yopish” va fonni bosish bilan yopiladi. Fokus birinchi maydonga tushadi.
- **Validatsiya** klient va serverda bitta umumiy kod bilan (`src/lib/validate.ts`): bo‘sh yoki faqat bo‘shliq/ko‘rinmas belgilardan iborat ism va tavsif qabul qilinmaydi.
- **Tasdiq chiptasi:** so‘rov raqami `TB-XXXXXX`, qatnov, yo‘nalish, vaqt, ism, yuk tavsifi. Tasdiq faqat server `ok` javob bergandan keyin chiqadi.
- **Yuborilgan so‘rovlar** sahifasi (`/sorovlar`): kompyuterda jadval, telefonda kartochkalar, eng yangisi tepada.
- **MongoDB** bilan ishlaydi. Baza yo‘q yoki ulanib bo‘lmasa, sayt avtomatik **demo rejimga** (xotiradagi ombor) o‘tadi va yiqilmaydi.
- **“Yo‘ldosh” AI yordamchisi** (Gemini): “B tumaniga qatnovlar” deyilsa filtrlaydi, “Y02 ni tanla” deyilsa so‘rov shaklini ochadi. Kalit yo‘q yoki internet bo‘lmasa, lokal buyruq tahlilchisi ishlaydi (kirill yozuvi ham tushuniladi).
- **Ovozli boshqaruv:** header va chatdagi mikrofon. O‘zbekcha nutq NeuronAI STT orqali tanib olinadi (zaxira: Gemini audio, keyin brauzerning `webkitSpeechRecognition`). Javob o‘zbekcha ovozda o‘qiladi (NeuronAI TTS, zaxira: `speechSynthesis`) va bu ovozni o‘chirish mumkin.
- **Tungi rejim** (tanlov `localStorage`da saqlanadi), 390px va 1366px uchun moslashgan, klaviatura va ekran o‘quvchilar uchun qulay.

## Texnologiyalar

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript (strict) · Tailwind CSS 4 · MongoDB Node.js drayveri · Gemini API · NeuronAI API · lucide-react · Vercel

## Ishga tushirish

```bash
npm install
cp .env.example .env.local   # kalitlarni kiriting (ixtiyoriy)
npm run dev                  # http://localhost:3000
```

Production rejimi: `npm run build && npm start`. Testlar: `npm test`.

Barcha kalitlar ixtiyoriy. Ularsiz ham sayt to‘liq ishlaydi (demo rejim + lokal yordamchi + brauzer ovozi).

## Muhit o‘zgaruvchilari

| O‘zgaruvchi | Vazifasi | Bo‘lmasa |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas ulanish satri | Xotiradagi ombor (demo rejim) |
| `MONGODB_DB` | Baza nomi (masalan `transportbor`) | URI'dagi baza nomi |
| `GEMINI_API_KEY` | Yo‘ldosh uchun Gemini kaliti | Lokal buyruq tahlilchisi |
| `GEMINI_MODEL` | Gemini modeli (standart: `gemini-3.5-flash`) | `gemini-3.5-flash` |
| `NEURONAI_API_KEY` | O‘zbekcha STT/TTS | Gemini audio yoki brauzer STT/TTS |
| `NEURONAI_VOICE` | TTS ovozi (standart: `kamron`) | `kamron` |

Kalitlar faqat serverda ishlatiladi va brauzerga hech qachon yuborilmaydi.

## Hakamlar uchun tekshirish ssenariysi

1. **“B tumani” filtri.** Bosh sahifada “B tumani” tugmasini bosing. Natija: faqat **Y02** va **Y03** kartochkalari ko‘rinadi, URL `?to=B+tumani` bo‘ladi.
2. **Y02 uchun so‘rov.** Y02 kartochkasida “Tanlash” ni bosing. “Ismingiz” maydoniga `Sinovchi 01`, “Yuk tavsifi” maydoniga `2 quti kitob` yozib, “So‘rov yuborish” ni bosing. Natija: “So‘rovingiz qabul qilindi” chiptasida **Viloyat markazi → B tumani**, `20.11.2026, 10:00`, `Sinovchi 01` va `2 quti kitob` ko‘rinadi.
3. **Bo‘sh maydonlar.** Istalgan qatnovni tanlang. Yuk tavsifini bo‘sh qoldiring yoki faqat bo‘shliq yozing va yuboring. Natija: “Yukning qisqa tavsifini kiriting.” xatosi chiqadi va tasdiq ko‘rsatilmaydi. Ism uchun ham xuddi shunday: “Ismingizni kiriting.” Server ham xuddi shu tekshiruvni qayta bajaradi (`POST /api/requests` → `400`).

Avtomatik testlar (`npm test`) shu uchala holatni hamda filtr, sana va yordamchi mantiqini tekshiradi.

## Demo ssenariysi (2 daqiqa)

1. **Filtr:** “B tumani” ni bosing. Ro‘yxatda Y02 va Y03 qoladi, keyin “Barchasi” ga qayting.
2. **Tanlash:** Y02 → “Tanlash”. Modal ichida qatnov tafsiloti ko‘rinadi.
3. **Validatsiya xatosi:** maydonlarni bo‘sh qoldirib “So‘rov yuborish” ni bosing. Xatolar chiqadi va fokus birinchi xatoli maydonga o‘tadi.
4. **Tasdiq:** `Sinovchi 01` va `2 quti kitob` ni kiriting. Natijada `TB-XXXXXX` raqamli chipta chiqadi, “Ro‘yxatga qaytish” ni bosing.
5. **AI'ga yozish:** o‘ng pastdagi “Yo‘ldosh” tugmasi → “C tumaniga nima bor?”. Ro‘yxat filtrlanadi va scroll qilinadi.
6. **Ovoz bilan:** header'dagi 🎤 tugmasi → “Y02 ni tanla” deb ayting → ■ tugmasini bosing. Y02 so‘rov shakli ochiladi va javob ovozda o‘qiladi.
7. **Yuborilgan so‘rovlar:** header → “Yuborilgan so‘rovlar”. Yangi so‘rov jadvalning tepasida turadi.

## Tuzilma

```
src/
  app/
    page.tsx               Bosh sahifa (Server Component → TripBoard)
    sorovlar/page.tsx      Yuborilgan so‘rovlar
    api/requests/          POST: so‘rovni tekshirish va saqlash, GET: ro‘yxat
    api/assistant/         POST: Yo‘ldosh (Gemini / lokal), GET: imkoniyatlar
    api/tts/               POST: o‘zbekcha ovozli javob
  components/              TripCard, DestinationFilter, RequestDialog, Confirmation,
                           AssistantPanel, VoiceButton, …
  lib/
    trips.ts               Qatnovlar, filtr, yordamchilar
    validate.ts            Umumiy validatsiya (klient + server)
    dates.ts               “20-noyabr, juma”, “2 kun 3 soat qoldi”
    store.ts, mongodb.ts   MongoDB + demo-rejim zaxirasi, seed
    gemini.ts, intent.ts   AI yordamchi va lokal tahlilchi
    voice/                 STT/TTS provayderlari (almashtirish oson), yozib olish, WAV
tests/lib.test.ts          node --test
```

Boshqa o‘zbekcha STT xizmatiga o‘tish uchun `src/lib/voice/types.ts` dagi interfeysni amalga oshiradigan yangi fayl qo‘shib, uni `src/lib/voice/server.ts` da ulash kifoya.
