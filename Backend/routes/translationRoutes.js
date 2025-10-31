import express from "express";
import {
  getTranslationsByPage,
  getAllTranslations,
  getTranslationByKey,
} from "../controllers/translationController.js";
import {
  validateRequest,
  validateParams,
} from "../middlewares/validationMiddleware.js";
import {
  translationPageSchema,
  translationKeySchema,
} from "../validators/translationSchemas.js";

const router = express.Router();

// Public routes
router.get("/", getAllTranslations);

router.get(
  "/:page",
  validateParams(translationPageSchema),
  getTranslationsByPage
);

router.get(
  "/:page/:key",
  validateParams(translationKeySchema),
  getTranslationByKey
);

export default router;
