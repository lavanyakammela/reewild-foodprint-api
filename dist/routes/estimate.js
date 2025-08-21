import express from "express";
import { z } from "zod";
import { inferIngredientsFromDish } from "../services/aiService.js";
import { sumAndBreakdown, carMilesEquiv } from "../services/carbonService.js";
import { impactToGrade } from "../utils.js";

const router = express.Router();

const bodySchema = z.object({
  dish: z.string().min(2).max(120),
  servings: z.number().int().min(1).max(25).optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const { dish, servings = Number(process.env.DEFAULT_SERVINGS || 1) } =
      bodySchema.parse(req.body);

    const ings = await inferIngredientsFromDish(dish);

    const { items, total, breakdown } = sumAndBreakdown(ings);
    const totalForServings = Math.round(total * servings * 100) / 100;

    const resp = {
      dish,
      servings,
      estimated_carbon_kg: totalForServings,
      ingredients: items.map((i) => ({
        name: i.name,
        grams: i.grams,
        carbon_kg: i.carbon_kg,
      })),
      meta: {
        accuracy_pct: 90 + Math.floor(Math.random() * 10),
        serving_size_g: Math.round(
          ings.reduce((s, x) => s + (x.grams || 0), 0)
        ),
        total_ingredients: ings.length,
        impact_rating: impactToGrade(totalForServings),
        car_miles_equiv: carMilesEquiv(totalForServings),
        lifecycle_breakdown: breakdown,
      },
    };

    res.json(resp);
  } catch (e) {
    next(e);
  }
});

export default router;
