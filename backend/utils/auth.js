import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        console.log('[Auth] Authentication attempt:', {
            hasAuthHeader: !!authHeader,
            hasToken: !!token,
            tokenLength: token?.length
        });

        if (!token) {
            console.log('[Auth] No token provided');
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        // Verify the token with Supabase
        console.log('[Auth] Verifying token with Supabase...');
        const { data: { user }, error } = await supabase.auth.getUser(token);

        console.log('[Auth] Supabase verification result:', {
            hasUser: !!user,
            userId: user?.id,
            error: error?.message
        });

        if (error || !user) {
            console.log('[Auth] Token verification failed:', error?.message);
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        
        req.user = user;
        console.log('[Auth] Authentication successful for user:', user.id);
        next();
    } catch (error) {
        console.error('[Auth] Auth middleware error:', error);
        return res.status(403).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // Continue without authentication
    }
};
