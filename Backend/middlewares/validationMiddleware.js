import { z } from 'zod';

export function validateRequest(schema) {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors
                });
            }
            
            console.error('Validation middleware error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}

export function validateQuery(schema) {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.query);
            req.query = validatedData;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                
                return res.status(400).json({
                    success: false,
                    message: 'Invalid query parameters',
                    errors: errors
                });
            }
            
            console.error('Query validation error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}

export function validateParams(schema) {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.params);
            req.params = validatedData;
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                
                return res.status(400).json({
                    success: false,
                    message: 'Invalid route parameters',
                    errors: errors
                });
            }
            
            console.error('Params validation error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };
}