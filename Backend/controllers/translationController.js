import pool from '../config/database.js';

/**
 * Get all translations for a specific page
 * GET /api/translations/:page
 */
export async function getTranslationsByPage(req, res) {
    try {
        const { page } = req.params;

        const result = await pool.query(
            'SELECT * FROM translations WHERE page = $1 ORDER BY key ASC',
            [page]
        );

        const translationsMap = {
            english: {},
            swedish: {}
        };

        result.rows.forEach(translation => {
            translationsMap.english[translation.key] = translation.english;
            translationsMap.swedish[translation.key] = translation.swedish;
        });

        return res.json({
            success: true,
            data: {
                page,
                translations: translationsMap,
                raw: result.rows
            }
        });

    } catch (error) {
        console.error('Get translations error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Get all translations (all pages)
 * GET /api/translations
 */
export async function getAllTranslations(req, res) {
    try {
        const result = await pool.query(
            'SELECT * FROM translations ORDER BY page ASC, key ASC'
        );

        // Group by page
        const translationsByPage = {};

        result.rows.forEach(translation => {
            if (!translationsByPage[translation.page]) {
                translationsByPage[translation.page] = {
                    english: {},
                    swedish: {}
                };
            }

            translationsByPage[translation.page].english[translation.key] = translation.english;
            translationsByPage[translation.page].swedish[translation.key] = translation.swedish;
        });

        return res.json({
            success: true,
            data: {
                translations: translationsByPage,
                raw: result.rows
            }
        });

    } catch (error) {
        console.error('Get all translations error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Get a specific translation by key
 * GET /api/translations/:page/:key
 */
export async function getTranslationByKey(req, res) {
    try {
        const { page, key } = req.params;

        const result = await pool.query(
            'SELECT * FROM translations WHERE page = $1 AND key = $2',
            [page, key]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Translation not found'
            });
        }

        const translation = result.rows[0];

        return res.json({
            success: true,
            data: {
                translation: {
                    key: translation.key,
                    english: translation.english,
                    swedish: translation.swedish,
                    page: translation.page
                }
            }
        });

    } catch (error) {
        console.error('Get translation by key error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}
