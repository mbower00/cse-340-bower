const express = require("express");
const router = new express.Router();
const triggerErrorController = require("../controllers/triggerErrorController");
const utilities = require("../utilities");

router.get("/", utilities.handleErrors(triggerErrorController.triggerError));

module.exports = router;
