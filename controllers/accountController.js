const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const reviewModel = require("../models/review-model");

/**
 * Deliver the account view
 */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav();
  const reviews = await reviewModel.getReviewsByAccountId(
    res.locals.accountData.account_id
  );
  const reviewList = await utilities.buildReviewList(reviews, true);
  res.render("account/account", {
    title: "Account",
    nav,
    reviewList,
    errors: null,
  });
}

/**
 * Deliver login view
 */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/**
 * Deliver registration view
 */
async function buildRegistration(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/**
 * Process Registration
 */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash(
      "error",
      "Sorry, there was an error processing the registration."
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered, ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    });
  } else {
    req.flash("error", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
}

/**
 * Process login request
 */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("error", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash("error", "Please check your credentials and try again");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
}

function accountLogout(req, res) {
  // process log out
  res.clearCookie("jwt");
  res.locals.loggedin = 0;
  res.locals.accountData = null;

  // redirect to Home
  req.flash("notice", "Logged out successfully");
  res.redirect("/");
}

/**
 * Deliver account update view
 */
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav();
  const account_id = req.params.account_id;
  accountData = await accountModel.getAccountById(account_id);
  if (accountData) {
    res.render("account/edit-account", {
      title: `Edit ${accountData.account_firstname}'s Account`,
      nav,
      errors: null,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
    });
  } else {
    throw new Error("Could not get data for update on account: " + account_id);
  }
}

/**
 * Update Account Information
 */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const reviews = await reviewModel.getReviewsByAccountId(
    res.locals.accountData.account_id
  );
  const reviewList = await utilities.buildReviewList(reviews, true);
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;

  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  );

  if (updateResult) {
    const accountData = await accountModel.getAccountById(account_id);
    req.flash(
      "notice",
      `${accountData.account_firstname}'s account successfully updated.`
    );
    req.flash("notice", `First Name: ${accountData.account_firstname}`);
    req.flash("notice", `Last Name: ${accountData.account_lastname}`);
    req.flash("notice", `Email: ${accountData.account_email}`);
    res.status(201).render("account/account", {
      title: "Account",
      nav,
      errors: null,
      reviewList,
    });
  } else {
    req.flash("error", "Sorry, the update failed.");
    res.status(501).render("account/account", {
      title: "Account",
      nav,
      errors: null,
      reviewList,
    });
  }
}

/**
 * Change Account Password
 */
async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const reviews = await reviewModel.getReviewsByAccountId(
    res.locals.accountData.account_id
  );
  const reviewList = await utilities.buildReviewList(reviews, true);
  const { account_id, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("error", "Sorry, there was an error processing password change.");
    res.status(500).render("account/account", {
      title: "Account",
      nav,
      reviewList,
      errors: null,
    });
  }

  const updateResult = await accountModel.updatePassword(
    account_id,
    hashedPassword
  );

  if (updateResult) {
    const accountData = await accountModel.getAccountById(account_id);
    req.flash(
      "notice",
      `${accountData.account_firstname}'s password successfully updated.`
    );
    req.flash("notice", `First Name: ${accountData.account_firstname}`);
    req.flash("notice", `Last Name: ${accountData.account_lastname}`);
    req.flash("notice", `Email: ${accountData.account_email}`);
    res.status(201).render("account/account", {
      title: "Account",
      nav,
      reviewList,
      errors: null,
    });
  } else {
    req.flash("error", "Sorry, the password change failed.");
    res.status(501).render("account/account", {
      title: "Account",
      nav,
      reviewList,
      errors: null,
    });
  }
}

module.exports = {
  buildAccount,
  buildLogin,
  buildRegistration,
  registerAccount,
  accountLogin,
  accountLogout,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
};
