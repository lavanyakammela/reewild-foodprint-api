export const errorHandler = (err, req, res, next) => {
    console.error(err);
    let status = 500;
    let message = "Internal Server Error";
    if (err instanceof Error) {
        message = err.message;
    }
    else if (typeof err === "string") {
        message = err;
    }
    if (typeof err.status === "number") {
        status = err.status;
    }
    res.status(status).json({ error: { message } });
};
