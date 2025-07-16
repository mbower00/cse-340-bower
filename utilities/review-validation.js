// code below comes from
//  - https://regexr.com/
//  - VSC autocomplete/suggestions
//  - other course code
//  - https://github.com/validatorjs/validator.js?tab=readme-ov-file#validators

const utilities = require(".");
const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const reviewModel = require("../models/review-model");

/**
 * Rules for review add
 */
function rules() {
  return [
    // review_text is required
    body("review_text")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please enter a review."),
  ];
}

/**
 * Check for review add
 */
async function checkAddData(req, res, next) {
  const { review_text, inv_id } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    const data = await invModel.getVehicleById(inv_id);
    const reviews = await reviewModel.getReviewsByInventoryId(inv_id);
    const reviewList = await utilities.buildReviewList(reviews);
    const grid = await utilities.buildVehicleGrid(data);
    let nav = await utilities.getNav();
    const vehicleName = `${data.inv_make} ${data.inv_model}`;
    res.render("inventory/vehicleDetail", {
      title: vehicleName,
      nav,
      grid,
      reviewList,
      inv_id,
      review_text,
      errors,
    });
    return;
  }
  next();
}

/**
 * Check for review update
 */
async function checkUpdateData(req, res, next) {
  const { review_text, review_id, review_date, review_vehicle } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render(`review/edit-review`, {
      title: "Update Review",
      nav,
      review_text,
      review_date,
      review_id,
      review_vehicle,
      errors,
    });
    return;
  }
  next();
}

module.exports = { rules, checkAddData, checkUpdateData };
