import OpenAI from "openai";
const textModel = process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini";
const visionModel = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";
const hasKey = Boolean(process.env.OPENAI_API_KEY);
const client = hasKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
function mockFromDish(dish) {
    const d = dish.toLowerCase();
    if (d.includes("biryani")) {
        return [
            { name: "Rice", grams: 180, confidence: 0.98 },
            { name: "Chicken", grams: 150, confidence: 0.97 },
            { name: "Onion", grams: 40, confidence: 0.9 },
            { name: "Tomato", grams: 30, confidence: 0.86 },
            { name: "Yogurt", grams: 30, confidence: 0.8 },
            { name: "Oil", grams: 15, confidence: 0.8 },
            { name: "Spice Mix", grams: 8, confidence: 0.9 },
            { name: "Garlic", grams: 6, confidence: 0.85 },
            { name: "Ginger", grams: 5, confidence: 0.84 },
            { name: "Salt", grams: 3, confidence: 0.99 }
        ];
    }
    if (d.includes("chicken") && d.includes("curry")) {
        return [
            { name: "Chicken", grams: 160, confidence: 0.98 },
            { name: "Onion", grams: 50, confidence: 0.92 },
            { name: "Tomato", grams: 60, confidence: 0.9 },
            { name: "Garlic", grams: 6, confidence: 0.86 },
            { name: "Ginger", grams: 6, confidence: 0.86 },
            { name: "Yogurt", grams: 30, confidence: 0.8 },
            { name: "Spice Mix", grams: 8, confidence: 0.9 },
            { name: "Oil", grams: 15, confidence: 0.85 },
            { name: "Salt", grams: 3, confidence: 0.99 }
        ];
    }
    return [
        { name: "Rice", grams: 150, confidence: 0.6 },
        { name: "Oil", grams: 10, confidence: 0.6 },
        { name: "Onion", grams: 30, confidence: 0.6 },
        { name: "Spice Mix", grams: 5, confidence: 0.6 }
    ];
}
export async function inferIngredientsFromDish(dish) {
    if (!client)
        return mockFromDish(dish);
    const prompt = [
        {
            role: "user",
            content: [
                {
                    type: "text",
                    text: `Dish: "${dish}". Return ONLY JSON array of objects {name, grams, confidence(0-1)} for 1 serving, 5-12 items.`
                }
            ]
        }
    ];
    const resp = await client.responses.create({
        model: textModel,
        input: prompt,
        temperature: 0.2
    });
    const text = resp.output_text || "[]";
    try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : parsed.ingredients || [];
    }
    catch {
        return mockFromDish(dish);
    }
}
export async function inferIngredientsFromImage(image) {
    if (!client) {
        return [
            { name: "Chicken", grams: 160, confidence: 0.85 },
            { name: "Rice", grams: 150, confidence: 0.8 },
            { name: "Curry Sauce", grams: 100, confidence: 0.75 },
            { name: "Onion", grams: 40, confidence: 0.7 },
            { name: "Spice Mix", grams: 8, confidence: 0.7 }
        ];
    }
    const base64 = image.toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    const prompt = [
        {
            role: "user",
            content: [
                { type: "text", text: "Identify dish and return ONLY a JSON array of {name, grams, confidence} for 1 serving." },
                { type: "image_url", image_url: dataUrl }
            ]
        }
    ];
    const resp = await client.responses.create({
        model: visionModel,
        input: prompt,
        temperature: 0.2
    });
    const text = resp.output_text || "[]";
    try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : parsed.ingredients || [];
    }
    catch {
        return [
            { name: "Rice", grams: 150, confidence: 0.6 },
            { name: "Chicken", grams: 150, confidence: 0.6 }
        ];
    }
}
