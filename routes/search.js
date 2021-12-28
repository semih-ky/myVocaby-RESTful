const express = require("express");
const router = express.Router();

const { isAuth } = require("../middleware/isAuth");
const { wordValidator } = require("../validators/validators");
const { searchWord } = require("../controllers/search");

router.post("/api/v1/search", isAuth, wordValidator, searchWord);

module.exports = router;
