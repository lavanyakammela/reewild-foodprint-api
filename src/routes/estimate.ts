// routes/estimate.js
import express from "express";
import OpenAI from "openai";

const router = express.Router();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: extract structured JSON safely
function safeJsonParse(input = "{}", fallback = {}) {
  try {
    if (input == null) return fallback;         // null or undefined
    if (typeof input === "object") return input; // already an object
    if (typeof input !== "string") return fallback; // not string
    return JSON.parse(input);
  } catch {
    return fallback;
  }
}



router.post("/", async (req, res, next) => {
  try {
    const { dish, servings = process.env.DEFAULT_SERVINGS || 1 } = req.body;

    if (!dish) {
      return res.status(400).json({ error: "❌ 'dish' is required" });
    }

    // 🧠 Call OpenAI for text-based estimation
    const resp = await client.chat.completions.create({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a food carbon footprint estimator. Given a dish name, break it down into ingredients and estimate CO2 emissions (kgCO2e). Return JSON only.",
        },
        {
          role: "user",
          content: `Dish: ${dish}, Servings: ${servings}`,
        },
      ],
      temperature: 0.2,
    });

    const raw = resp.choices[0].message?.content ?? "{}";
    const data = safeJsonParse(raw, {});

    // ✅ Response
    res.json({
      dish,
      servings: Number(servings),
      ...data,
    });
  } catch (err) {
    next(err);
  }
});

export default router;  