require('dotenv').config()
require('express-async-errors')
const express = require('express')
const app = express()
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')
// swagger
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')
// routers 
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')

// rest of packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// connect to db
const connectDB = require('./db/connect')


app.set('trust proxy',1)
app.use(rateLimiter({
    windows:15 * 60 * 1000,
    max: 60,
}))
app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())


app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

 app.use(express.static('./public'))
app.use(fileUpload())


app.get('/',(req,res) => {
    res.send('<h1>E-COMMERCE</h1><a href="/api-docs">Documentation</a>')
})
app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocument))



app.use('/api/v2/auth', authRouter)
app.use('/api/v2/users', userRouter)
app.use('/api/v2/products',productRouter)
app.use('/api/v2/reviews', reviewRouter)
app.use('/api/v2/orders',orderRouter)
 
// err middleware
app.use(notFoundMiddleware) 
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 4000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port,console.log(`Server is listening to the port ${port}..`))
    } catch (error) {
        console.log(error);
    }
}

start()