const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const accountValidate = require("../utilities/account-validation");

router.get("/login", utilities.handleErrors(accountController.buildLogin));

// get the registration view
router.get(
  "/registration",
  utilities.handleErrors(accountController.buildRegistration)
);

// post a registration
router.post(
  "/registration",
  accountValidate.registrationRules(),
  accountValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
  "/login",
  accountValidate.loginRules(),
  accountValidate.checkLoginData,
  (req, res) => {
    res.status(200).send("login process");
  }
);

module.exports = router;
