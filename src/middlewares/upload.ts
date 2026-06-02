import multer, { FileFilterCallback } from "multer"
import { Request } from "express"

const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith("image/jpeg") && file.originalname.endsWith(".jpg")) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const uploadFile = multer({ storage: storage, fileFilter: imageFilter, limits: { fileSize: 8000000 } });
