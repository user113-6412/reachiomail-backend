require('dotenv').config()   
const helmet = require('helmet')
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()


// Security middleware - must come before other middleware
app.use(helmet({
    frameguard: {
        action: 'deny'
    }
}))

// Generic Middleware. CORS Configuration critical for requests from different origins
// In production, we need to explicitly allow:
// 1. Vercel deployment domains (frontend)
// 2. Main domain (gathrdcards.co.uk)
// 3. API subdomain
// 4. Backend domain
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [
         'https://www.mailmergefromsheets.com',
         'https://www.mailmergefromsheets.com',
         'https://api.mailmergefromsheets.com',
         'https://render-reachiomail-backend.onrender.com',
         'http://localhost:3000' // <-- Add this for local testing even in production
        ]
      : 'http://localhost:3000',
    credentials: true, // Important for sending cookies and auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With', 'x-user-email'], // Required headers for file upload and auth
}));


// Enable cookie parsing for session management
app.use(cookieParser());


// These middleware functions are crucial for handling different types of requests:
// 1. express.json() - Parses JSON bodies
// 2. express.urlencoded() - Parses form data (required for file uploads)
// 3. Custom logging middleware for debugging
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // Required for FormData parsing in file uploads
app.use((req, res, next) => {
    // console.log('Path and request method are: ', req.path, req.method)
    next()
})

// routes that run after generic server middleware
const mailMergeRoutes = require('./routes/mailMergeRoutes');
app.use('/api/mailmerge', mailMergeRoutes);

// Import cleanup service
const { cleanupOldPreviews } = require('./services/previewCleanupService');




// connect to db and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to DB');
        
        // Set up cleanup job to run every 24 hours
        setInterval(async () => {
            try {
                await cleanupOldPreviews();
            } catch (error) {
                console.error('Cleanup job failed:', error);
            }
        }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
        
        // Run initial cleanup
        cleanupOldPreviews().catch(error => {
            console.error('Initial cleanup failed:', error);
        });
        
        // Use a default port if PORT is not set or invalid
        const port = process.env.PORT && !isNaN(process.env.PORT) // does it exist and is it NOT not a number?
            ? parseInt(process.env.PORT) 
            : 10000;
            
        console.log('Starting server on port:', port);
        

        app.listen(port, () => {
            console.log('Server is running on port:', port);
            console.log('NODE_ENV:', process.env.NODE_ENV);
        });

    })
    .catch((error) => {
        console.log(error)
    });
