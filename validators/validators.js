const { body } = require("express-validator");

exports.loginValidator = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must at least 3 character long!")
    .isAlphanumeric()
    .withMessage("Username must be Alphanumeric!"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must at least 8 character long!")
    .not()
    .matches(/\s+/gm)
    .withMessage("Password must not contain whitespace!"),
];

exports.signupValidator = [
  body("username")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must at least 3 character long!")
    .isAlphanumeric()
    .withMessage("Username must be Alphanumeric!"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must at least 8 character long!")
    .not()
    .matches(/\s+/gm)
    .withMessage("Password must not contain whitespace!"),
  body("rePassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Re Password does not match!");
    }
    return true;
  }),
];

exports.wordValidator = [
  body("word")
    .isAlpha()
    .withMessage("Word must be only contains [A-Z][a-z]!")
    .isLength({ max: 29 })
    .withMessage("Word must be shorter than 29 characters!")
    .custom((value) => {
      if (Object.prototype.toString.call(value) !== "[object String]") {
        throw new Error("Word must be a String!");
      }
      return true;
    }),
];

exports.filterValidator = [
  body("filter")
    .isAlphanumeric()
    .withMessage("Filter must be Alphanumeric!")
    .isLength({ max: 20 })
    .withMessage("Filter must be shorter than 20 characters!")
    .custom((value) => {
      if (Object.prototype.toString.call(value) !== "[object String]") {
        throw new Error("Filter must be a String!");
      }
      return true;
    }),
];
