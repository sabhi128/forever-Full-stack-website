import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from '../backend/config/mongodb.js'
import connectCloudinary from '../backend/config/cloudinary.js'
import userRouter from '../backend/routes/userRoute.js'
import productRouter from '../backend/routes/productRoute.js'
import cartRouter from '../backend/routes/cartRoute.js'
import orderRouter from '../backend/routes/orderRoute.js'

const app = express()

// Initialize Cloudinary
connectCloudinary()

app.use(express.json())
app.use(cors())

// Ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (error) {
    console.error('Database connection error:', error)
    res.status(500).json({ success: false, message: 'Database connection failed' })
  }
})

app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

app.get('/api/health', async (req, res) => {
  const hasMongoUri = !!process.env.MONGODB_URI;
  const hasCloudinaryKey = !!process.env.CLOUDINARY_API_KEY;

  res.json({
    success: true,
    env: {
      MONGODB_URI: hasMongoUri ? 'SET' : 'NOT SET',
      CLOUDINARY_API_KEY: hasCloudinaryKey ? 'SET' : 'NOT SET',
    },
    mongooseState: ['disconnected', 'connected', 'connecting', 'disconnecting'][require('mongoose').connection.readyState] || 'unknown'
  });
})

app.get('/api', (req, res) => {
  res.send("API Working")
})

export default app
