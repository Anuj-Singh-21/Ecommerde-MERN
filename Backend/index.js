require('dotenv').config();
const express = require('express');
const server = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const cookieParser = require('cookie-parser');
const { createProduct } = require('./controller/Product');
const productsRouter = require('./routes/Products');
const categoriesRouter = require('./routes/Categories');
const brandsRouter = require('./routes/Brands');
const usersRouter = require('./routes/Users');
const authRouter = require('./routes/Auth');
const cartRouter = require('./routes/Cart');
const ordersRouter = require('./routes/Order');
const { User } = require('./model/User');
const { isAuth, sanitizeUser, cookieExtractor } = require('./services/common');
const path = require('path');
const { Order } = require('./model/Order');
const { env } = require('process');

// Webhook

const endpointSecret = process.env.ENDPOINT_SECRET;

// server.post(
//   '/webhook',
//   express.raw({ type: 'application/json' }),
//   async (request, response) => {
//     const sig = request.headers['stripe-signature'];

//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
//     } catch (err) {
//       response.status(400).send(`Webhook Error: ${err.message}`);
//       return;
//     }

//     // Handle the event
//     switch (event.type) {
//       case 'payment_intent.succeeded':
//         const paymentIntentSucceeded = event.data.object;

//         const order = await Order.findById(
//           paymentIntentSucceeded.metadata.orderId
//         );
//         order.paymentStatus = 'received';
//         await order.save();

//         break;
//       // ... handle other event types
//       default:
//         console.log(`Unhandled event type ${event.type}`);
//     }

//     // Return a 200 response to acknowledge receipt of the event
//     response.send();
//   }
// );

// JWT options

const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY; 

//middlewares

server.use(express.static(path.resolve(__dirname, 'build')));
server.use(cookieParser());
server.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);
server.use(passport.authenticate('session'));
server.use(
  cors({
    exposedHeaders: ['X-Total-Count'],
  })
);
server.use(express.json()); // to parse req.body

server.use('/products', isAuth(), productsRouter.router);
// we can also use JWT token for client-only auth
server.use('/categories', isAuth(), categoriesRouter.router);
server.use('/brands', isAuth(), brandsRouter.router);
server.use('/users', isAuth(), usersRouter.router);
server.use('/auth', authRouter.router);
server.use('/cart', isAuth(), cartRouter.router);
server.use('/orders', isAuth(), ordersRouter.router);

// this line we add to make react router work in case of other routes doesnt match
server.get('*', (req, res) =>
  res.sendFile(path.resolve('build', 'index.html'))
);

// Passport Strategies
passport.use(
  'local',
  new LocalStrategy({ usernameField: 'email' }, async function (
    email,
    password,
    done
  ) {
    // by default passport uses username
    console.log({ email, password });
    try {
      const user = await User.findOne({ email: email });
      console.log(email, password, user);
      if (!user) {
        return done(null, false, { message: 'invalid credentials' }); // for safety
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        'sha256',
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            return done(null, false, { message: 'invalid credentials' });
          }
          const token = jwt.sign(
            sanitizeUser(user),
            process.env.JWT_SECRET_KEY
          );
          done(null, { id: user.id, usertype: user.usertype, token }); // this lines sends to serializer
        }
      );
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  'jwt',
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, sanitizeUser(user)); // this calls serializer
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, { id: user.id, usertype: user.usertype });
  });
});

// this changes session variable req.user when called from authorized request

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

// Payments

const bodyParser = require('body-parser');

server.use(bodyParser.json());  // Add this line to parse JSON requests
server.use(bodyParser.urlencoded({ extended: true })); 

// This is your test secret API key.
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

server.post('/create-payment-intent', async (req, res) => {
  const { totalAmount, orderId } = req.body;

  // Create an order with Razorpay
  const options = {
    amount: totalAmount * 100, // amount in the smallest currency unit (paise for INR)
    currency: 'INR',
    receipt: orderId.toString(),
  };

  try {
    const razorpayOrder = await razorpay.orders.create(options);

    res.send({
      orderId: razorpayOrder.id,
      orderAmount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

server.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  bodyParser.json(),
  async (request, response) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.get('x-razorpay-signature');

    let event;

    try {
      event = razorpay.webhooks.verify(request.rawBody, signature, secret);
    } catch (err) {
      console.error('Razorpay Webhook Verification Error:', err);
      return response.status(400).send('Webhook Verification Error');
    }

    // Handle the Razorpay event
    switch (event.event) {
      case 'payment.captured':
        const paymentCaptured = event.payload.payment.entity;

        // Process the payment captured event
        const orderId = paymentCaptured.order_id;
        const order = await Order.findById(orderId);
        
        // Update your order status or perform any other necessary actions
        // ...

        break;
      // Handle other Razorpay events as needed
      default:
        console.log(`Unhandled Razorpay event type ${event.event}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);


main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log('database connected');
}

server.listen(process.env.PORT, () => {
  console.log(`server running at port ${process.env.PORT}`);
});


server.patch('/orders/:orderId/cancel', async (req, res) => {
  const { orderId } = req.params;

  // Fetch the order from the database
  const order = await Order.findById(orderId);

  // Update the order status and totalAmount
  order.status = 'cancelled';
  order.totalAmount = 0;

  // Fetch the user from the database
  const user = await User.findById(order.userIdz);

  // Update the user's wallet balance
  user.wallet += order.totalAmount;

  // Save the updated order and user to the database
  await order.save();
  await user.save();

  // Send the updated order in the response
  res.json(order);
});
