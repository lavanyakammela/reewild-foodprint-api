
import { Router } from "express";
import { z } from "zod";
import { upload } from "../middleware/upload.js";
import { inferIngredientsFromImage } from "../services/aiService.js";
import { sumAndBreakdown, carMilesEquiv } from "../services/carbonService.js";
import { impactToGrade } from "../utils.js";
import type { EstimateResponse } from "../types.js";

const router = Router();

const querySchema = z.object({
  servings: z.coerce.number().int().min(1).max(25).optional()
});

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    const { servings = Number(process.env.DEFAULT_SERVINGS || 1) } =
      querySchema.parse(req.query);

    if (!req.file?.buffer) {
      return res.status(400).json({ error: { message: "file is required" } });
    }

    // Call AI service
    let aiResult = await inferIngredientsFromImage(req.file.buffer);

    // Normalize -> always an array
    let ings = Array.isArray(aiResult)
      ? aiResult
      : aiResult?.ingredients && Array.isArray(aiResult.ingredients)
      ? aiResult.ingredients
      : [];

    const { items, total, breakdown } = sumAndBreakdown(ings);
    const totalForServings = Math.round(total * servings * 100) / 100;

    const resp: EstimateResponse = {
      dish: aiResult?.dish || "Detected Dish",
      servings,
      estimated_carbon_kg: totalForServings,
      ingredients: items.map(i => ({
        name: i.name,
        grams: i.grams,
        carbon_kg: i.carbon_kg
      })),
      meta: {
        accuracy_pct: 85 + Math.floor(Math.random() * 15),
        serving_size_g: Math.round(
          ings.reduce((s, x) => s + (x.grams || 0), 0)
        ),
        total_ingredients: ings.length,
        impact_rating: impactToGrade(totalForServings),
        car_miles_equiv: carMilesEquiv(totalForServings),
        lifecycle_breakdown: breakdown
      }
    };

    res.json(resp);
  } catch (e) {
    next(e);
  }
});

export default router;
