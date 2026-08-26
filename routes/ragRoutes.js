const express = require("express");

const router =
  express.Router();

const ragController =
  require("../controllers/ragController");


router.post(
  "/index",
  ragController.index
);


router.post(
  "/ask",
  ragController.ask
);


module.exports = router;