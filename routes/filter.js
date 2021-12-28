const express = require("express");
const router = express.Router();

const { filterValidator } = require("../validators/validators");
const { isAuth } = require("../middleware/isAuth");

const {
  createFilter,
  deleteFilter,
  getFilters,
} = require("../controllers/filter");

router.get("/api/v1/filters", isAuth, getFilters);

router.post("/api/v1/create-filter", isAuth, filterValidator, createFilter);

router.delete("/api/v1/delete-filter", isAuth, filterValidator, deleteFilter);

module.exports = router;
