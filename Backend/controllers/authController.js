import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Login endpoint
 * POST /api/auth/login
 * Body: { email, password }
 */
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Find user by email
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken(user.id, user.email);
        console.log(`✅ Login: ${user.email} at ${new Date().toISOString()}`);

        return res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email
                }
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Register endpoint
 * POST /api/auth/register
 * Body: { email, password }
 */
export async function register(req, res) {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUserResult = await pool.query(
            'SELECT email FROM users WHERE email = $1',
            [email]
        );

        if (existingUserResult.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
            [email, passwordHash]
        );

        const newUser = result.rows[0];

        // Generate token
        const token = generateToken(newUser.id, newUser.email);
        console.log(`✅ New user: ${newUser.email} at ${new Date().toISOString()}`);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: newUser.id,
                    email: newUser.email
                }
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Verify token endpoint
 * GET /api/auth/verify
 * Headers: { Authorization: Bearer <token> }
 */
export async function verifyToken(req, res) {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            'SELECT id, email, created_at FROM users WHERE id = $1',
            [userId]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            message: 'Token is valid',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.created_at
                }
            }
        });

    } catch (error) {
        console.error('❌ Token verification error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

/**
 * Logout endpoint
 * POST /api/auth/logout
 */
export async function logout(req, res) {
    try {
        console.log(`✅ Logout: ${req.user?.email || 'unknown'} at ${new Date().toISOString()}`);

        return res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('❌ Logout error:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}