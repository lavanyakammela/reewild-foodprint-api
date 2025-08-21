
import { normalizeName, round2 } from "../utils.js";
import type { IngredientEstimate } from "../types.js";

/** illustrative kg CO2e per kg */
const PER_KG: Record<string, number> = {
  chicken: 6.9,
  beef: 27.0,
  lamb: 39.2,
  pork: 12.1,
  rice: 2.7,
  wheat_flour: 1.2,
  potato: 0.5,
  tomato: 1.4,
  onion: 0.5,
  garlic: 1.6,
  ginger: 1.5,
  yogurt: 2.2,
  cream: 5.0,
  butter: 12.0,
  oil: 3.3,
  ghee: 7.0,
  coconut_milk: 2.1,
  spice_mix: 1.8,
  salt: 0.1,
  sugar: 0.8,
  fish: 13.6,
  egg: 4.8,
  paneer: 5.6,
  lentils: 0.9,
  chickpeas: 1.0,
  milk: 1.4
};
const DEFAULT_PER_KG = 2.0;

const LIFECYCLE = {
  farming: 0.68,
  processing: 0.07,
  packaging: 0.04,
  transportation: 0.05,
  retail: 0.03,
  consumption: 0.13
};

function perKgFor(name: string): number {
  const key = normalizeName(name).replace(/\s+/g, "_");
  return PER_KG[key] ?? DEFAULT_PER_KG;
}

export function carbonForIngredient(i: IngredientEstimate): number {
  const perKg = perKgFor(i.name);
  if (i.grams && i.grams > 0) return (perKg * i.grams) / 1000;
  return (perKg * 100) / 1000; // assume ~100g if unknown
}

export function sumAndBreakdown(ings: IngredientEstimate[]) {
  const items = ings.map(x => ({
    name: x.name,
    grams: x.grams,
    carbon_kg: round2(carbonForIngredient(x))
  }));
  const total = round2(items.reduce((a, b) => a + b.carbon_kg, 0));
  const breakdown = {
    farming: round2(total * LIFECYCLE.farming),
    processing: round2(total * LIFECYCLE.processing),
    packaging: round2(total * LIFECYCLE.packaging),
    transportation: round2(total * LIFECYCLE.transportation),
    retail: round2(total * LIFECYCLE.retail),
    consumption: round2(total * LIFECYCLE.consumption)
  };
  return { items, total, breakdown };
}

export function carMilesEquiv(totalKg: number): number {
  // 0.404 kg CO2e/mile (illustrative)
  return round2(totalKg / 0.404);
}
