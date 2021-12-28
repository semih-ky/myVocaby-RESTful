const express = require("express");
const router = express.Router();

const { loginValidator, signupValidator } = require("../validators/validators");

const { postLogin, postSignUp } = require("../controllers/auth");

router.post("/api/v1/login", loginValidator, postLogin);

router.post("/api/v1/signup", signupValidator, postSignUp);

module.exports = router;
