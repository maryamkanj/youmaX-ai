import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Send response utility
const sendTokenResponse = (user, statusCode, res, message) => {
    const token = generateToken(user._id);

    const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    };

    res.status(statusCode).json({
        success: true,
        message,
        token,
        user: userData
    });
};

// Register User
export const registerUser = async (req, res) => {
    try {
        console.log('Registration attempt:', { name: req.body.name, email: req.body.email });

        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email and password"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Hash password manually (no pre-save hook)
        const salt = await bcryptjs.genSalt(12);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create user with hashed password
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        console.log('User created successfully:', user.email);
        sendTokenResponse(user, 201, res, "User registered successfully");

    } catch (error) {
        console.error('Registration error details:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);

        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: errors.join(', ')
            });
        }

        // Mongoose duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};

// Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password using bcrypt directly (since we removed the method)
        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        sendTokenResponse(user, 200, res, "Login successful");

    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

// Get User Data - Updated function name for clarity
export const getUser = async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json({
            success: true,
            message: "User data retrieved successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error('Get user error:', error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching user data"
        });
    }
};

// Update User Profile
export const updateUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        const userId = req.user._id;

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.toLowerCase().trim();

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }
        });

    } catch (error) {
        console.error('Update user error:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error while updating profile"
        });
    }
};