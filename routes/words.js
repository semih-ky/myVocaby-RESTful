const express = require("express");
const router = express.Router();

const { isAuth } = require("../middleware/isAuth");
const { getWords } = require("../controllers/words/getWords");
const { saveWord } = require("../controllers/words/saveWord");
const { deleteWord } = require("../controllers/words/deleteWord");

router.get("/api/v1/words", isAuth, getWords);

router.post("/api/v1/save-word", isAuth, saveWord);

router.delete("/api/v1/delete-word", isAuth, deleteWord);

module.exports = router;
