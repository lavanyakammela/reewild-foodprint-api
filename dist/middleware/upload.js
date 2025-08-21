import multer from "multer";
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) => {
        if (!/image\/(png|jpe?g|webp)/i.test(file.mimetype)) {
            return cb(new Error("Only image files allowed (png|jpg|jpeg|webp)"));
        }
        cb(null, true);
    }
});
