const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { validationResult } = require("express-validator");

const { jwtGenerator } = require("../utils/jwt.util");
const User = require("../models/user");

exports.postLogin = async (req, res, next) => {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const error = new Error(validation.errors[0].msg);
    error.httpStatusCode = 401;
    error.data = validation.errors;
    return next(error);
  }

  const username = req.body.username;
  const password = req.body.password;

  try {
    let user = await User.findOne({ username: username });
    if (!user) {
      const error = new Error("Invalid username!");
      error.httpStatusCode = 401;
      throw error;
    }

    let isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      const error = new Error("Wrong password!");
      error.httpStatusCode = 401;
      throw error;
    }

    const { tkn, expTime } = await jwtGenerator(
      user.username,
      user._id.toString()
    );

    return res.status(200).json({
      token: tkn,
      expTime: expTime,
    });
  } catch (err) {
    return next(err);
  }
};

exports.postSignUp = async (req, res, next) => {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const error = new Error(validation.errors[0].msg);
    error.httpStatusCode = 401;
    error.data = validation.errors;
    return next(error);
  }

  const username = req.body.username;
  const password = req.body.password;

  try {
    let user = await User.findOne({ username: username });
    if (user) {
      const error = new Error("Username already have taken!");
      error.httpStatusCode = 401;
      throw error;
    }
  } catch (err) {
    return next(err);
  }

  const user = new User({
    username: username,
  });

  try {
    await user.setPassword(password);
    await user.save();
  } catch (err) {
    return next(err);
  }

  return res.status(201).json({ message: "Successful!" });
};
