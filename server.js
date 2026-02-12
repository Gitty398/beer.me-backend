const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');
const authRoutes = require('./controllers/auth')
const userRoutes = require('./controllers/user');
const verifyToken = require('./middleware/verify-token');
const beerRoutes = require('./controllers/beer')

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});


const allowedOrigins = [
  "https://main.d1yyzdi58s6yy8.amplifyapp.com",
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


app.use(express.json());
app.use(logger('dev'));

app.get("/health", (req, res) => res.status(200).send("ok"));


// Routes go here
app.use('/auth', authRoutes)
app.use('/users', userRoutes)


// Any routes below this would require AUTH
app.use(verifyToken)
app.use('/beer', beerRoutes)



app.listen(PORT, () => {
  console.log('The express app is ready on', PORT);
});
