const express = require("express");
const router = new express.Router();
const accountController = require("../controllers/accountController");
const utilities = require("../utilities");
const accountValidate = require("../utilities/account-validation");

// get the account route
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccount)
);

// get the login view
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
  utilities.handleErrors(accountController.accountLogin)
);

// logout and redirect to the home view
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

module.exports = router;
