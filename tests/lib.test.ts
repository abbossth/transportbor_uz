import { test } from "node:test";
import assert from "node:assert/strict";
import { TRIPS, filterTrips, countByDestination, findTrip, routeLabel, groupByDate } from "../src/lib/trips.ts";
import { isBlank, validateRequest, MESSAGES } from "../src/lib/validate.ts";
import { dayLabel, untilLabel } from "../src/lib/dates.ts";
import { parseIntent } from "../src/lib/intent.ts";
import { sanitizeAction } from "../src/lib/assistant-types.ts";

const IDS = TRIPS.map((t) => t.id);

test("Hakam 1: 'B tumani' filtri faqat Y02 va Y03 ni qaytaradi", () => {
  assert.deepEqual(filterTrips(TRIPS, "B tumani").map((t) => t.id), ["Y02", "Y03"]);
});

test("Filtr sonlari 5/2/2/1", () => {
  assert.deepEqual(countByDestination(TRIPS), { Barchasi: 5, "A tumani": 2, "B tumani": 2, "C tumani": 1 });
});

test("Hakam 2: Y02 yo'nalishi", () => {
  const trip = findTrip(TRIPS, "Y02");
  assert.ok(trip);
  assert.equal(routeLabel(trip), "Viloyat markazi → B tumani");
  const r = validateRequest({ tripId: "Y02", name: "Sinovchi 01", cargo: "2 quti kitob" }, IDS);
  assert.deepEqual(r, { ok: true, data: { tripId: "Y02", name: "Sinovchi 01", cargo: "2 quti kitob" } });
});

test("Hakam 3: bo'sh yoki faqat bo'shliqli maydonlar rad etiladi", () => {
  for (const blank of ["", "   ", "\t\n", " ​﻿", undefined, null, 42]) {
    assert.equal(isBlank(blank), true, JSON.stringify(blank));
    const r1 = validateRequest({ tripId: "Y02", name: "Sinovchi 01", cargo: blank }, IDS);
    assert.equal(r1.ok, false);
    if (!r1.ok) assert.equal(r1.errors.cargo, MESSAGES.cargoRequired);
    const r2 = validateRequest({ tripId: "Y02", name: blank, cargo: "2 quti kitob" }, IDS);
    assert.equal(r2.ok, false);
    if (!r2.ok) assert.equal(r2.errors.name, MESSAGES.nameRequired);
  }
});

test("Matn tozalanadi, uzunlik va qatnov ID tekshiriladi", () => {
  const r = validateRequest({ tripId: " y02 ", name: "  Ali   Valiyev ", cargo: " 2  quti\nkitob " }, IDS);
  assert.deepEqual(r, { ok: true, data: { tripId: "Y02", name: "Ali Valiyev", cargo: "2 quti kitob" } });
  assert.equal(validateRequest({ tripId: "Y99", name: "A", cargo: "B" }, IDS).ok, false);
  assert.equal(validateRequest({ tripId: "Y01", name: "a".repeat(61), cargo: "B" }, IDS).ok, false);
  assert.equal(validateRequest({ tripId: "Y01", name: "A", cargo: "b".repeat(201) }, IDS).ok, false);
  assert.equal(validateRequest(null, IDS).ok, false);
});

test("Sana yorliqlari", () => {
  assert.equal(dayLabel("20.11.2026"), "20-noyabr, juma");
  assert.equal(dayLabel("21.11.2026"), "21-noyabr, shanba");
  assert.deepEqual(groupByDate(TRIPS).map((g) => [g.date, g.trips.length]), [["20.11.2026", 3], ["21.11.2026", 2]]);
  const iso = "2026-11-20T10:00:00+05:00";
  assert.equal(untilLabel(iso, new Date("2026-11-18T07:00:00+05:00")), "2 kun 3 soat qoldi");
  assert.equal(untilLabel(iso, new Date("2026-11-20T09:15:00+05:00")), "45 daqiqa qoldi");
  assert.equal(untilLabel(iso, new Date("2026-11-20T10:00:00+05:00")), "Jo‘nab ketgan");
});




test("Lokal tahlilchi buyruqlarni taniydi", () => {
  const now = new Date("2026-11-18T12:00:00+05:00");
  assert.deepEqual(parseIntent("B tumaniga qatnovlar", TRIPS, now).action, { type: "filter", value: "B tumani" });
  assert.deepEqual(parseIntent("б тумани", TRIPS, now).action, { type: "filter", value: "B tumani" });
  assert.deepEqual(parseIntent("C tumaniga", TRIPS, now).action, { type: "filter", value: "C tumani" });
  assert.deepEqual(parseIntent("с туманига", TRIPS, now).action, { type: "filter", value: "C tumani" });
  assert.deepEqual(parseIntent("Y02 ni tanla", TRIPS, now).action, { type: "select", value: "Y02" });
  assert.deepEqual(parseIntent("y 2 ni och", TRIPS, now).action, { type: "select", value: "Y02" });
  assert.deepEqual(parseIntent("ikkinchi qatnov", TRIPS, now).action, { type: "select", value: "Y02" });
  assert.deepEqual(parseIntent("barchasi", TRIPS, now).action, { type: "filter", value: "Barchasi" });
  assert.match(parseIntent("Eng yaqin qatnov qachon?", TRIPS, now).reply, /Y01/);
  assert.match(parseIntent("narxi qancha?", TRIPS, now).reply, /narx hisoblash yo‘q/);
  assert.equal(parseIntent("A tumanidan", TRIPS, now).action.type, "none");
  assert.equal(parseIntent("Y09", TRIPS, now).action.type, "none");
});

test("Gemini amali whitelist bo'yicha tekshiriladi", () => {
  assert.deepEqual(sanitizeAction({ type: "filter", value: "b tumani" }), { type: "filter", value: "B tumani" });
  assert.deepEqual(sanitizeAction({ type: "filter", value: "D tumani" }), { type: "none", value: "" });
  assert.deepEqual(sanitizeAction({ type: "select", value: "y05" }), { type: "select", value: "Y05" });
  assert.deepEqual(sanitizeAction({ type: "select", value: "Y06" }), { type: "none", value: "" });
  assert.deepEqual(sanitizeAction({ type: "delete", value: "x" }), { type: "none", value: "" });
  assert.deepEqual(sanitizeAction(null), { type: "none", value: "" });
});
