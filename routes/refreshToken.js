const express = require("express");

const router = express.Router();

const getReToken = require("../controllers/refreshToken");

router.get("/api/v1/refresh-token", getReToken);

module.exports = router;
