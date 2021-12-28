const { validationResult } = require("express-validator");

exports.getFilters = (req, res, next) => {
  const user = req.user;

  return res.status(200).json({ filters: user.filters });
};

exports.createFilter = async (req, res, next) => {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const error = new Error(validation.errors[0].msg);
    error.httpStatusCode = 401;
    error.data = validation.errors;
    return next(error);
  }

  const filter = req.body.filter;

  const user = req.user;

  if (user.filters.includes(filter)) {
    const error = new Error("This filter does exist!");
    error.httpStatusCode = 401;
    return next(error);
  }

  try {
    user.filters.push(filter);
    await user.save();
  } catch (err) {
    return next(err);
  }

  return res.status(201).json({ message: "Successful!" });
};

exports.deleteFilter = async (req, res, next) => {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const error = new Error(validation.errors[0].msg);
    error.httpStatusCode = 401;
    error.data = validation.errors;
    return next(error);
  }
  const filter = req.body.filter;

  const user = req.user;

  if (!user.filters.includes(filter)) {
    const error = new Error("This filter does not exist!");
    error.httpStatusCode = 401;
    return next(error);
  }

  try {
    user.filters = user.filters.filter((val) => val !== filter);
    // user.words = user.words.filter((word) => word.filter !== filter);
    user.words.forEach((word) => {
      if (word.filters.includes(filter)) {
        word.filters = word.filters.filter((val) => val !== filter);
      }
    });
    await user.save();
  } catch (err) {
    return next(err);
  }

  return res.status(201).json({ message: "Successful!" });
};
