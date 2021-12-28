const jose = require("jose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { getKeys, jwtGenerator, jwtController } = require("../utils/jwt.util");
const User = require("../models/user");

const getReToken = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Request not authenticated!");
    error.httpStatusCode = 401;
    return next(error);
  }
  const oldToken = authHeader.split(" ")[1];

  try {
    const user = await jwtController(oldToken);

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

module.exports = getReToken;
