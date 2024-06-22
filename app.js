const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require('cors');
require("dotenv").config();

const setupRoutes = require("./middleware/routesMiddleware");
const conditionalAuth=require("./middleware/jwtMiddleware")
const app = express();
// const allowedOrigins = ['http://example.com', 'http://localhost:3000'];

// // CORS options
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   optionsSuccessStatus: 200
// };

// Use CORS with options
// app.use(cors(corsOptions));
app.use(cors({
  origin: '*'
}));
app.use(conditionalAuth);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

setupRoutes(app);

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {}
  });
});

console.log("running on 4000");

module.exports = app;
