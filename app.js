const express = require('express');
const path = require('path')
const morgan = require('morgan');
const ratelimt = require('express-rate-limit')
const helmet = require('helmet')
const monosanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const compression = require("compression")
const cookieParser = require('cookie-parser')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes')
const viewRouter = require('./routes/viewRoutes')
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 1) MIDDLEWARES
app.use(compression())
app.use(helmet())
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
const limiter = ratelimt({
  max:100,
  windowMs:60*60*1000,
  Message:'Try After An Hour'
})
app.use('/api',limiter)
app.use(express.json({limit:'10KB'}))
app.use (express.urlencoded({extended:true,limit:'10KB'}))
app.use(cookieParser())
app.use(monosanitize())
app.use(xss())
app.use(hpp({
  whitelist:['duration','ratingsQuantity',
  'ratingsAverage',
  'maxGroupSize',
  'difficulty',
  'price']
}))
app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});


app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES

app.use('/',viewRouter)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

module.exports = app;
