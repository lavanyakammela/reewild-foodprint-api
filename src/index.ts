import "dotenv/config";

import express from "express";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { errorHandler } from "./middleware/error.js";
import estimateRouter from "./routes/estimate.js";
import estimateImageRouter from "./routes/estimateImage.js";

const app = express();

// 🔐 Security middleware
app.use(helmet());
app.use(cors());

// 📝 JSON body parser (for /estimate)
app.use(express.json({ limit: "2mb" }));

// 🚫 Do NOT add express.urlencoded() globally
// (because multipart/form-data is handled by multer in estimateImage route)

// 🌍 Root route
app.get("/", (_req, res) => {
  res.send(`
    <h1>🌱 Foodprint API</h1>
    <p>Welcome to the Foodprint API 🚀</p>
    <p>Check <a href="/docs">/docs</a> for API documentation.</p>
  `);
});

// 🏥 Health check
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// 📦 Routes
app.use("/estimate", estimateRouter);            // JSON input
app.use("/estimate/image", estimateImageRouter); // Image upload input

// 📘 Minimal OpenAPI spec
const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Foodprint AI",
    version: "1.0.0",
    description: "API for estimating the carbon footprint of dishes from text or images."
  },
  paths: {
    "/estimate": {
      post: {
        summary: "Estimate carbon footprint from dish text",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  dish: { type: "string", example: "pasta with tomato sauce" },
                  servings: { type: "integer", example: 2 }
                },
                required: ["dish"]
              }
            }
          }
        },
        responses: {
          "200": { description: "Successful estimate" }
        }
      }
    },
    "/estimate/image": {
      post: {
        summary: "Estimate carbon footprint from dish image",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  image: {
                    type: "string",
                    format: "binary",
                    description: "Dish image file (field name must be 'image')"
                  }
                },
                required: ["image"]
              }
            }
          }
        },
        responses: {
          "200": { description: "Successful estimate" }
        }
      }
    }
  }
};

// 📘 Swagger UI
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi as any));

// 🚨 Error handler (must be last)
app.use(errorHandler);

const port = Number(process.env.PORT || 8080);

// Debug log for env (mask key for safety)
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY not found in environment!");
} else {
  console.log("✅ OPENAI_API_KEY loaded:", process.env.OPENAI_API_KEY.slice(0, 5) + "*****");
}

app.listen(port, () => {
  console.log(`✅ Foodprint API running at: http://localhost:${port}`);
  console.log(`📘 Swagger UI docs at: http://localhost:${port}/docs`);
});
