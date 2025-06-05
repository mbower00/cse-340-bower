const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");

router.get("/login", utilities.handleErrors(accountController.buildLogin));

// get the registration view
router.get(
  "/registration",
  utilities.handleErrors(accountController.buildRegistration)
);

// post a registration
router.post(
  "/registration",
  utilities.handleErrors(accountController.registerAccount)
);

module.exports = router;
