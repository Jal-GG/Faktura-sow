import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../controllers/productsController.js';
import { authenticateToken } from '../utils/jwt.js';
import { validateRequest, validateQuery, validateParams } from '../middlewares/validationMiddleware.js';
import {
    createProductSchema,
    updateProductSchema,
    productQuerySchema,
    productIdSchema
} from '../validators/productSchemas.js';

const router = express.Router();

router.use(authenticateToken);

// GET /api/products?search=...&page=1&limit=20
router.get('/',
    validateQuery(productQuerySchema),
    getAllProducts
);

// GET /api/products/:id
router.get('/:id',
    validateParams(productIdSchema),
    getProductById
);

// POST /api/products
router.post('/',
    validateRequest(createProductSchema),
    createProduct
);

// PUT /api/products/:id
router.put('/:id',
    validateParams(productIdSchema),
    validateRequest(updateProductSchema),
    updateProduct
);

// DELETE /api/products/:id
router.delete('/:id',
    validateParams(productIdSchema),
    deleteProduct
);

export default router;