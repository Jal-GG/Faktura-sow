import { z } from 'zod';

export const createProductSchema = z.object({
    articleNo: z
        .string({
            required_error: 'Article number is required'
        })
        .min(1, 'Article number cannot be empty')
        .max(50, 'Article number must not exceed 50 characters')
        .trim(),
    
    productService: z
        .string({
            required_error: 'Product/Service name is required'
        })
        .min(1, 'Product/Service name cannot be empty')
        .trim(),
    
    inPrice: z
        .number({
            invalid_type_error: 'In price must be a number'
        })
        .min(0, 'In price cannot be negative')
        .optional()
        .nullable(),
    
    price: z
        .number({
            required_error: 'Price is required',
            invalid_type_error: 'Price must be a number'
        })
        .min(0, 'Price cannot be negative'),
    
    unit: z
        .string()
        .max(50, 'Unit must not exceed 50 characters')
        .trim()
        .optional()
        .nullable(),
    
    inStock: z
        .number({
            invalid_type_error: 'Stock must be a number'
        })
        .int('Stock must be an integer')
        .min(0, 'Stock cannot be negative')
        .optional()
        .nullable(),
    
    description: z
        .string()
        .trim()
        .optional()
        .nullable()
});

export const updateProductSchema = z.object({
    articleNo: z
        .string()
        .min(1, 'Article number cannot be empty')
        .max(50, 'Article number must not exceed 50 characters')
        .trim()
        .optional(),
    
    productService: z
        .string()
        .min(1, 'Product/Service name cannot be empty')
        .trim()
        .optional(),
    
    inPrice: z
        .number()
        .min(0, 'In price cannot be negative')
        .optional()
        .nullable(),
    
    price: z
        .number()
        .min(0, 'Price cannot be negative')
        .optional(),
    
    unit: z
        .string()
        .max(50, 'Unit must not exceed 50 characters')
        .trim()
        .optional()
        .nullable(),
    
    inStock: z
        .number()
        .int('Stock must be an integer')
        .min(0, 'Stock cannot be negative')
        .optional()
        .nullable(),
    
    description: z
        .string()
        .trim()
        .optional()
        .nullable()
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
);

export const productQuerySchema = z.object({
    search: z
        .string()
        .trim()
        .optional(),
    
    page: z
        .string()
        .regex(/^\d+$/, 'Page must be a number')
        .transform(Number)
        .pipe(z.number().int().min(1))
        .optional()
        .default('1'),
    
    limit: z
        .string()
        .regex(/^\d+$/, 'Limit must be a number')
        .transform(Number)
        .pipe(z.number().int().min(1).max(100))
        .optional()
        .default('20')
});

export const productIdSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/, 'Product ID must be a valid number')
        .transform(Number)
});