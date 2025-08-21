import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log full error in terminal
  console.error("❌ Error occurred:");
  console.error("Message:", err instanceof Error ? err.message : String(err));
  if (err instanceof Error && err.stack) {
    console.error("Stack:", err.stack);
  }

  // Default status and message
  let status = 500;
  let message = "Internal Server Error";

  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  }

  // Use custom status code if provided
  if (typeof (err as any).status === "number") {
    status = (err as any).status;
  }

  // Return clean JSON response
  res.status(status).json({
    error: {
      message,
      status,
      path: req.originalUrl,
      method: req.method,
    },
  });
};
