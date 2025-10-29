import { supabase } from '../config/database.js';

export async function getAllProducts(req, res) {
    try {
        const userId = req.user.userId;
        const { search, page, limit } = req.query;

        // Calculate pagination
        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('user_id', userId);

        // Add search if provided
        if (search) {
            query = query.or(`article_no.ilike.%${search}%,product_service.ilike.%${search}%`);
        }

        // Add pagination and ordering
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: products, error, count } = await query;

        if (error) {
            console.error('❌ Error fetching products:', error);
            throw error;
        }

        return res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    totalPages: Math.ceil(count / limit)
                }
            }
        });

    } catch (error) {
        console.error('❌ Get products error:', {
            message: error.message,
            timestamp: new Date().toISOString()
        });
        
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

        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        return res.json({
            success: true,
            data: { product }
        });

    } catch (error) {
        console.error('❌ Get product error:', {
            message: error.message,
            timestamp: new Date().toISOString()
        });
        
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

        const { data: product, error } = await supabase
            .from('products')
            .insert([
                {
                    article_no: articleNo,
                    product_service: productService,
                    in_price: inPrice || null,
                    price,
                    unit: unit || null,
                    in_stock: inStock || null,
                    description: description || null,
                    user_id: userId
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('❌ Create product error:', error);
            throw error;
        }

        console.log(`✅ Product created: ${product.id} by ${req.user.email}`);

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });

    } catch (error) {
        console.error('❌ Create product error:', {
            message: error.message,
            timestamp: new Date().toISOString()
        });
        
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

        // Check if product exists and belongs to user
        const { data: existingProduct } = await supabase
            .from('products')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Build update object with snake_case keys
        const updateData = {};
        if (updates.articleNo !== undefined) updateData.article_no = updates.articleNo;
        if (updates.productService !== undefined) updateData.product_service = updates.productService;
        if (updates.inPrice !== undefined) updateData.in_price = updates.inPrice;
        if (updates.price !== undefined) updateData.price = updates.price;
        if (updates.unit !== undefined) updateData.unit = updates.unit;
        if (updates.inStock !== undefined) updateData.in_stock = updates.inStock;
        if (updates.description !== undefined) updateData.description = updates.description;
        updateData.updated_at = new Date().toISOString();

        const { data: product, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('❌ Update product error:', error);
            throw error;
        }

        console.log(`✅ Product updated: ${product.id} by ${req.user.email}`);

        return res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });

    } catch (error) {
        console.error('❌ Update product error:', {
            message: error.message,
            timestamp: new Date().toISOString()
        });
        
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

        // Check if product exists and belongs to user
        const { data: existingProduct } = await supabase
            .from('products')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error('❌ Delete product error:', error);
            throw error;
        }

        console.log(`✅ Product deleted: ${id} by ${req.user.email}`);

        return res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('❌ Delete product error:', {
            message: error.message,
            timestamp: new Date().toISOString()
        });
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}