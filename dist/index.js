import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "./middleware/error.js";
import estimateRouter from "./routes/estimate.js";
import estimateImageRouter from "./routes/estimateImage.js";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Health check
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Routes
app.use("/estimate", estimateRouter);
app.use("/estimate/image", estimateImageRouter);

// --- OpenAPI Documentation ---
const openapi = {
  openapi: "3.0.3",
  info: { title: "Foodprint AI", version: "1.0.0" },
  paths: {
    "/estimate": {
      post: {
        summary: "Dish -> estimate",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  dish: { type: "string", example: "Chicken Biryani" },
                },
                required: ["dish"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Carbon footprint estimation",
            content: {
              "application/json": {
                example: {
                  dish: "Chicken Biryani",
                  estimated_carbon_kg: 4.2,
                  ingredients: [
                    { name: "Rice", carbon_kg: 1.1 },
                    { name: "Chicken", carbon_kg: 2.5 },
                    { name: "Spices", carbon_kg: 0.2 },
                    { name: "Oil", carbon_kg: 0.4 },
                  ],
                },
              },
            },
          },
        },
      },
    },
    "/estimate/image": {
      post: {
        summary: "Image -> estimate",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
                required: ["file"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Carbon footprint estimation from image",
          },
        },
      },
    },
  },
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

// Error handler
app.use(errorHandler);

// --- Port handling with fallback if busy ---
const DEFAULT_PORT = Number(process.env.PORT) || 8080;
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`✅ Foodprint API listening on http://localhost:${port}`);
    console.log(`📄 Swagger UI at http://localhost:${port}/docs`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️ Port ${port} is in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      throw err;
    }
  });
}

startServer(DEFAULT_PORT);
