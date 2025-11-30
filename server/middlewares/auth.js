import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
    try {
        // console.log('Auth Middleware - All Headers:', JSON.stringify(req.headers, null, 2));

        // Get token from header - multiple possible locations
        let token;

        // Check Authorization header (standard)
        if (req.headers.authorization) {
            // console.log('Found Authorization header:', req.headers.authorization);

            if (req.headers.authorization.startsWith('Bearer ')) {
                token = req.headers.authorization.split(' ')[1]?.trim();
                // console.log('Extracted token from Bearer:', token ? 'Token exists' : 'Token missing');
            } else {
                // Try without Bearer prefix
                token = req.headers.authorization.trim();
                // console.log('Using raw Authorization header as token');
            }
        }

        // Check other common header locations
        if (!token && req.headers['x-access-token']) {
            token = req.headers['x-access-token'].trim();
            // console.log('Using x-access-token header');
        }

        if (!token && req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'].trim();
            // console.log('Using x-auth-token header');
        }

        if (!token) {
            // console.log('No token found in any header location');
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided in Authorization header.",
                help: "Send token as: Authorization: Bearer <your_token>"
            });
        }

        // console.log('Final token to verify:', token.substring(0, 20) + '...');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log('Token decoded successfully for user ID:', decoded.id);

        // Get user from database
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            // console.log('User not found in database for ID:', decoded.id);
            return res.status(401).json({
                success: false,
                message: "User not found. Please log in again."
            });
        }

        // console.log('✅ User authenticated:', user.email);

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error details:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        if (error.name === 'JsonWebTokenError') {
            console.log('JWT Error - Invalid token');
            return res.status(401).json({
                success: false,
                message: "Invalid token. Please log in again."
            });
        }

        if (error.name === 'TokenExpiredError') {
            console.log('JWT Error - Token expired');
            return res.status(401).json({
                success: false,
                message: "Token expired. Please log in again."
            });
        }

        console.error('Unknown authentication error:', error);
        return res.status(500).json({
            success: false,
            message: "Authentication failed. Please try again."
        });
    }
};