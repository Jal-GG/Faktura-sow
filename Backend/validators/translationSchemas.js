import { z } from 'zod';

const validPages = ['login', 'terms', 'pricelist', 'register'];

export const createTranslationSchema = z.object({
    key: z
        .string({
            required_error: 'Translation key is required'
        })
        .min(1, 'Translation key cannot be empty')
        .max(100, 'Translation key must not exceed 100 characters')
        .trim()
        .regex(/^[a-z0-9_]+$/, 'Translation key must contain only lowercase letters, numbers, and underscores'),
    
    english: z
        .string({
            required_error: 'English translation is required'
        })
        .min(1, 'English translation cannot be empty')
        .trim(),
    
    swedish: z
        .string({
            required_error: 'Swedish translation is required'
        })
        .min(1, 'Swedish translation cannot be empty')
        .trim(),
    
    page: z
        .enum(validPages, {
            required_error: 'Page is required',
            invalid_type_error: `Page must be one of: ${validPages.join(', ')}`
        })
});

export const updateTranslationSchema = z.object({
    english: z
        .string()
        .min(1, 'English translation cannot be empty')
        .trim()
        .optional(),
    
    swedish: z
        .string()
        .min(1, 'Swedish translation cannot be empty')
        .trim()
        .optional(),
    
    page: z
        .enum(validPages, {
            invalid_type_error: `Page must be one of: ${validPages.join(', ')}`
        })
        .optional()
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
);

export const translationPageSchema = z.object({
    page: z
        .enum(validPages, {
            required_error: 'Page parameter is required',
            invalid_type_error: `Page must be one of: ${validPages.join(', ')}`
        })
});

export const translationKeySchema = z.object({
    page: z
        .enum(validPages, {
            required_error: 'Page parameter is required',
            invalid_type_error: `Page must be one of: ${validPages.join(', ')}`
        }),
    
    key: z
        .string({
            required_error: 'Key parameter is required'
        })
        .min(1, 'Key parameter cannot be empty')
        .regex(/^[a-z0-9_]+$/, 'Key must contain only lowercase letters, numbers, and underscores')
});

export const translationIdSchema = z.object({
    id: z
        .string()
        .regex(/^\d+$/, 'Translation ID must be a valid number')
        .transform(Number)
});