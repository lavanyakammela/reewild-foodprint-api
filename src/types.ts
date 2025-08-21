
export type IngredientEstimate = {
  name: string;
  grams?: number;
  confidence?: number; // 0..1
};

export type IngredientOut = { name: string; carbon_kg: number; grams?: number };

export type EstimateResponse = {
  dish: string;
  servings: number;
  estimated_carbon_kg: number;
  ingredients: IngredientOut[];
  meta: {
    accuracy_pct: number;
    serving_size_g?: number;
    total_ingredients: number;
    impact_rating?: "A" | "B" | "C" | "D" | "E";
    car_miles_equiv?: number;
    lifecycle_breakdown?: {
      farming: number;
      processing: number;
      packaging: number;
      transportation: number;
      retail: number;
      consumption: number;
    };
  };
};
