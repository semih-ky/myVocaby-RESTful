require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//import routes
const authRoutes = require("./routes/auth");
const reTokenRoutes = require("./routes/refreshToken");
const searchRoutes = require("./routes/search");
const wordsRoutes = require("./routes/words");
const filterRoutes = require("./routes/filter");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());
// app.use(cookieParser());

//routes
app.use(authRoutes);
app.use(reTokenRoutes);
app.use(searchRoutes);
app.use(wordsRoutes);
app.use(filterRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    message: "404 Not Found!",
  });
});

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.httpStatusCode || 500;
  res.status(status).json({
    message: status === 500 ? "Something went wrong!" : error.message,
    data: error.data,
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    console.log("Database connection successful!");
    app.listen(process.env.PORT);
  })
  .catch((err) => {
    console.log(err);
    console.log("Database connection failed!");
    process.exit();
  });
