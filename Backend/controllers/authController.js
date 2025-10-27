import bcrypt from 'bcryptjs';
import { supabase } from '../config/database.js';
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
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (fetchError || !user) {
            // Small delay to prevent attacks
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
        console.log(`Login: ${user.email} at ${new Date().toISOString()}`);

        // Return success response
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
        console.error('Login error:', {
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
 * Register endpoint
 * POST /api/auth/register
 * Body: { email, password }
 * 
 */
export async function register(req, res) {
    try {
        const { email, password } = req.body;

        // Checking if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .maybeSingle();

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hashing passwd
        const passwordHash = await bcrypt.hash(password, 10);

        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    email,
                    password_hash: passwordHash
                }
            ])
            .select()
            .single();

        if (insertError) {
            console.error('User creation error:', {
                message: insertError.message,
                email: email,
                timestamp: new Date().toISOString()
            });
            
            throw insertError;
        }

        // Generate token
        const token = generateToken(newUser.id, newUser.email);
        console.log(`New user: ${newUser.email} at ${new Date().toISOString()}`);

        // Return success response
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
        console.error('Registration error:', {
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
 * Verify token endpoint
 * GET /api/auth/verify
 * Headers: { Authorization: Bearer <token> }
 */
export async function verifyToken(req, res) {
    try {
        const userId = req.user.userId;

        // Fetch user data
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, created_at')
            .eq('id', userId)
            .single();

        if (error || !user) {
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
        console.error('Token verification error:', {
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
 * Logout endpoint
 * POST /api/auth/logout
 */
export async function logout(req, res) {
    try {
        console.log(`Logout: ${req.user?.email || 'unknown'} at ${new Date().toISOString()}`);

        return res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', {
            message: error.message,
            timestamp: new Date().toISOString()
        });
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}