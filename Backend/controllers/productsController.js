import pool from '../config/database.js';

/**
 * Get all products with pagination and search
 * GET /api/products?search=...&page=1&limit=20
 */
export async function getAllProducts(req, res) {
    try {
        const userId = req.user.userId;
        const { search, page = 1, limit = 20 } = req.query;

        const offset = (page - 1) * limit;

        let countQuery = 'SELECT COUNT(*) FROM products WHERE user_id = $1';
        let dataQuery = 'SELECT * FROM products WHERE user_id = $1';
        let queryParams = [userId];
        let countParams = [userId];

        // Add search if provided
        if (search) {
            const searchCondition = ' AND (article_no ILIKE $2 OR product_service ILIKE $2)';
            dataQuery += searchCondition;
            countQuery += searchCondition;
            queryParams.push(`%${search}%`);
            countParams.push(`%${search}%`);
        }

        dataQuery += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
        queryParams.push(limit, offset);

        // Execute queries
        const [countResult, dataResult] = await Promise.all([
            pool.query(countQuery, countParams),
            pool.query(dataQuery, queryParams)
        ]);

        const total = parseInt(countResult.rows[0].count);

        return res.json({
            success: true,
            data: {
                products: dataResult.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        console.error('❌ Get products error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Get single product by ID
 * GET /api/products/:id
 */
export async function getProductById(req, res) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM products WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        return res.json({
            success: true,
            data: { product: result.rows[0] }
        });

    } catch (error) {
        console.error('❌ Get product error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Create new product
 * POST /api/products
 */
export async function createProduct(req, res) {
    try {
        const userId = req.user.userId;
        const { articleNo, productService, inPrice, price, unit, inStock, description } = req.body;

        const result = await pool.query(
            `INSERT INTO products 
            (article_no, product_service, in_price, price, unit, in_stock, description, user_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *`,
            [articleNo, productService, inPrice || null, price, unit || null, inStock || null, description || null, userId]
        );

        console.log(`✅ Product created: ${result.rows[0].id}`);

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product: result.rows[0] }
        });

    } catch (error) {
        console.error('❌ Create product error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Update product
 * PUT /api/products/:id
 */
export async function updateProduct(req, res) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const updates = req.body;

        // Check if product exists
        const checkResult = await pool.query(
            'SELECT id FROM products WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Build update query
        const updateFields = [];
        const updateValues = [];
        let paramCounter = 1;

        if (updates.articleNo !== undefined) {
            updateFields.push(`article_no = $${paramCounter++}`);
            updateValues.push(updates.articleNo);
        }
        if (updates.productService !== undefined) {
            updateFields.push(`product_service = $${paramCounter++}`);
            updateValues.push(updates.productService);
        }
        if (updates.inPrice !== undefined) {
            updateFields.push(`in_price = $${paramCounter++}`);
            updateValues.push(updates.inPrice);
        }
        if (updates.price !== undefined) {
            updateFields.push(`price = $${paramCounter++}`);
            updateValues.push(updates.price);
        }
        if (updates.unit !== undefined) {
            updateFields.push(`unit = $${paramCounter++}`);
            updateValues.push(updates.unit);
        }
        if (updates.inStock !== undefined) {
            updateFields.push(`in_stock = $${paramCounter++}`);
            updateValues.push(updates.inStock);
        }
        if (updates.description !== undefined) {
            updateFields.push(`description = $${paramCounter++}`);
            updateValues.push(updates.description);
        }

        updateFields.push(`updated_at = NOW()`);
        updateValues.push(id, userId);

        const updateQuery = `
            UPDATE products 
            SET ${updateFields.join(', ')}
            WHERE id = $${paramCounter++} AND user_id = $${paramCounter}
            RETURNING *
        `;

        const result = await pool.query(updateQuery, updateValues);

        console.log(`✅ Product updated: ${result.rows[0].id}`);

        return res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product: result.rows[0] }
        });

    } catch (error) {
        console.error('❌ Update product error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Delete product
 * DELETE /api/products/:id
 */
export async function deleteProduct(req, res) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.log(`✅ Product deleted: ${id}`);

        return res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete product error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}