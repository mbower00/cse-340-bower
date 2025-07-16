const express = require("express");
const router = new express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");
const reviewValidate = require("../utilities/review-validation");

router.post(
  "/add/",
  utilities.createAccountClearanceMiddleware(
    ["Client", "Employee", "Admin"],
    "You must be logged in to post a review."
  ),
  reviewValidate.rules(),
  reviewValidate.checkAddData,
  utilities.handleErrors(reviewController.addReview)
);

router.get(
  "/update/:review_id",
  utilities.createAccountClearanceMiddleware(
    ["Client", "Employee", "Admin"],
    "You must be logged in to update a review."
  ),
  utilities.handleErrors(reviewController.getUpdateView)
);

router.get(
  "/delete/:review_id",
  utilities.createAccountClearanceMiddleware(
    ["Client", "Employee", "Admin"],
    "You must be logged in to delete a review."
  ),
  utilities.handleErrors(reviewController.getDeleteView)
);

router.post(
  "/update",
  utilities.createAccountClearanceMiddleware(
    ["Client", "Employee", "Admin"],
    "You must be logged in to update a review."
  ),
  reviewValidate.rules(),
  reviewValidate.checkUpdateData,
  utilities.handleErrors(reviewController.updateReview)
);

router.post(
  "/delete",
  utilities.createAccountClearanceMiddleware(
    ["Client", "Employee", "Admin"],
    "You must be logged in to delete a review."
  ),
  utilities.handleErrors(reviewController.deleteReview)
);

module.exports = router;
