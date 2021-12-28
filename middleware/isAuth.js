const { jwtController } = require("../utils/jwt.util");

exports.isAuth = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Request not authenticated!");
    error.httpStatusCode = 401;
    return next(error);
  }
  const token = authHeader.split(" ")[1];

  try {
    const user = await jwtController(token);
    req.user = user;
    next();
  } catch (err) {
    err.message = "Authentication failed!";
    err.httpStatusCode = 403;
    return next(err);
  }
};
