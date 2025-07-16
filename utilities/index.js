const jwt = require("jsonwebtoken");
require("dotenv").config();
const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const Util = {};

/**
 * Constructs the nav HTML unordered list
 */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();

  let list = '<li class="home-li"><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  return list;
};

/**
 * Builds the list of reviews, or a notice to be the first.
 */
Util.buildReviewList = function (reviews, forAccount = false) {
  let reviewList = "";
  if (reviews.length > 0) {
    reviewList += '<ul class="reviewList">';
    reviews.forEach((review) => {
      reviewList += "<li>";
      reviewList += '<div class="reviewInfo">';
      reviewList += "<strong>";
      if (forAccount) {
        reviewList += review.inv_year;
        reviewList += " ";
        reviewList += review.inv_make;
        reviewList += " ";
        reviewList += review.inv_model;
      } else {
        reviewList += review.account_firstname[0];
        reviewList += review.account_lastname;
      }
      reviewList += "</strong> - ";
      reviewList += new Date(review.review_date).toDateString();
      if (forAccount) {
        reviewList += ' - <a href="/inv/detail/';
        reviewList += review.inv_id;
        reviewList += '">View</a>';
        reviewList += ' <a href="/review/update/';
        reviewList += review.review_id;
        reviewList += '">Edit</a> ';
        reviewList += '<a href="/review/delete/';
        reviewList += review.review_id;
        reviewList += '">Delete</a>';
      }
      reviewList += "</div>";
      reviewList += "<div>";
      reviewList += review.review_text;
      reviewList += "</div>";
      reviewList += "</li>";
    });
    reviewList += "</ul>";
  } else {
    reviewList += '<p class="notice">';
    if (forAccount) {
      reviewList += "You do not have an reviews.";
    } else {
      reviewList += "Be the first to write a review.";
    }
    reviewList += "</p>";
  }
  return reviewList;
};

/**
 * Build the classification view HTML
 */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classification_id" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

Util.buildVehicleGrid = async function (data) {
  let grid = `
    <div class="vehicle-detail-grid">
      <section>
        <img src="${data.inv_image}" alt="Image of ${data.inv_make} ${
    data.inv_model
  } on CSE Motors">
      </section>
      <section>
        <h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>
        <div class="vehicle-detail-info-container">
          <div class="vehicle-detail-alt-info">
            <strong>Price: $${new Intl.NumberFormat("en-US").format(
              data.inv_price
            )}</strong>
          </div>
          <div><strong>Description:</strong> ${data.inv_description}</div>
          <div class="vehicle-detail-alt-info"><strong>Color:</strong> ${
            data.inv_color
          }</div>
          <div><strong>Miles:</strong> ${new Intl.NumberFormat("en-US").format(
            data.inv_miles
          )}</div>
        </div>
      </section>
    </div>
  `;
  return grid;
};

/**
 * Middleware For Handling Errors
 * Wrap other function in this for
 * General Error Handling
 */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/**
 * Middleware to check token validity
 */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("warning", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/**
 * Check Login
 */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("warning", "Please log in.");
    return res.redirect("/account/login");
  }
};

Util.createAccountClearanceMiddleware = (
  allowedTypes = ["Employee", "Admin"],
  warningText = "You are not authorized to reach that section of the site"
) => {
  return (req, res, next) => {
    let account_type = null;

    if (req.cookies.jwt) {
      jwt.verify(
        req.cookies.jwt,
        process.env.ACCESS_TOKEN_SECRET,
        (error, accountData) => {
          if (error) {
            req.flash("warning", warningText);
            return res.redirect("/account/login");
          }
          account_type = accountData.account_type;
        }
      );

      if (allowedTypes.includes(account_type)) {
        next();
        return;
      }
    }

    req.flash("warning", warningText);
    return res.redirect("/account/login");
  };
};

module.exports = Util;
