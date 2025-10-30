import express from 'express';
import {
    getTranslationsByPage,
    getAllTranslations,
    getTranslationByKey,
    createTranslation,
    updateTranslation
} from '../controllers/translationController.js';
import { authenticateToken } from '../utils/jwt.js';
import { validateRequest, validateParams } from '../middlewares/validationMiddleware.js';
import {
    createTranslationSchema,
    updateTranslationSchema,
    translationPageSchema,
    translationKeySchema,
    translationIdSchema
} from '../validators/translationSchemas.js';

const router = express.Router();

// Public routes 
router.get('/', getAllTranslations);

router.get('/:page',
    validateParams(translationPageSchema),
    getTranslationsByPage
);

router.get('/:page/:key',
    validateParams(translationKeySchema),
    getTranslationByKey
);

export default router;