import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Ingredient type
export interface Ingredient {
  name: string;
  grams: number;
  carbon_kg: number;
}

// Safe JSON parse
function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Call GPT to infer ingredients with grams + carbon.
 */
export async function inferIngredientsFromDish(dish: string): Promise<Ingredient[]> {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a food sustainability assistant. Given a dish, list its key ingredients, approximate weight in grams, and estimated carbon footprint (kg CO₂).",
      },
      {
        role: "user",
        content: `Dish: ${dish}\n\nReturn ONLY JSON array like:\n[{"name":"Rice","grams":200,"carbon_kg":1.1},{"name":"Chicken","grams":150,"carbon_kg":2.5}]`,
      },
    ],
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content;
  return safeJsonParse<Ingredient[]>(raw, []);
}
