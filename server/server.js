import express from "express";
import 'dotenv/config';
import cors from 'cors';
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

// Check environment variables
console.log('🔧 Environment Check:');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('MONGODB_URL exists:', !!process.env.MONGODB_URL);
console.log('PORT:', process.env.PORT);

if (!process.env.JWT_SECRET) {
    console.error('CRITICAL: JWT_SECRET is not set in environment variables!');
    process.exit(1);
}

if (!process.env.MONGODB_URL) {
    console.error('CRITICAL: MONGODB_URL is not set in environment variables!');
    process.exit(1);
}

const app = express();

// Middleware - Enhanced CORS configuration
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true, // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Log all incoming requests for debugging (Disabled for production/cleanliness)
// app.use((req, res, next) => {
//     console.log('🌐 Incoming Request:', {
//         method: req.method,
//         url: req.url,
//         headers: req.headers,
//         body: req.body
//     });
//     next();
// });

// Routes
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "YoumaX AI Server is running",
        timestamp: new Date().toISOString()
    });
});

app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter)

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// Start server after database connection
const startServer = async () => {
    try {
        await connectDB();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`CORS enabled for all origins`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();