const reviewModel = require("../models/review-model");
const utilities = require("../utilities");

/**
 * Posts a new review
 */
async function addReview(req, res, next) {
  const { review_text, inv_id, account_id } = req.body;
  const updateResult = await reviewModel.addReview(
    review_text,
    inv_id,
    account_id
  );
  if (updateResult) {
    req.flash("notice", "Review posted successfully.");
    res.redirect(`/inv/detail/${inv_id}`);
  } else {
    console.log("here");
    req.flash("error", "Sorry, the review failed to post.");
    res.status(501).redirect(`/inv/detail/${inv_id}`);
  }
}

/**
 * Builds the view to update a review
 */
async function getUpdateView(req, res, next) {
  const review_id = req.params.review_id;
  const reviewData = await reviewModel.getReviewById(review_id);

  const account_id = res.locals.accountData?.account_id;
  if (account_id !== reviewData.account_id) {
    req.flash(
      "warning",
      "You must be logged in to the proper account to access that part of the site."
    );
    res.status(400).redirect("/account/login");
    return;
  }

  const nav = await utilities.getNav();
  res.render("review/edit-review", {
    title: "Edit Review",
    errors: null,
    nav,
    review_text: reviewData.review_text,
    review_date: new Date(reviewData.review_date).toDateString(),
    review_id: reviewData.review_id,
    review_vehicle: `${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`,
  });
}

/**
 * Builds the view to delete a review
 */
async function getDeleteView(req, res, next) {
  const review_id = req.params.review_id;
  const reviewData = await reviewModel.getReviewById(review_id);

  const account_id = res.locals.accountData?.account_id;
  if (account_id !== reviewData.account_id) {
    req.flash(
      "warning",
      "You must be logged in to the proper account to access that part of the site."
    );
    res.status(400).redirect("/account/login");
    return;
  }

  const nav = await utilities.getNav();
  res.render("review/delete-review", {
    title: "Delete Review",
    errors: null,
    nav,
    review_text: reviewData.review_text,
    review_date: new Date(reviewData.review_date).toDateString(),
    review_id: reviewData.review_id,
    review_vehicle: `${reviewData.inv_year} ${reviewData.inv_make} ${reviewData.inv_model}`,
  });
}

/**
 * Updates a review
 */
async function updateReview(req, res, next) {
  const { review_text, review_id } = req.body;

  const reviewData = await reviewModel.getReviewById(review_id);
  const account_id = res.locals.accountData?.account_id;
  if (account_id !== reviewData.account_id) {
    req.flash(
      "warning",
      "You must be logged in to the proper account for that update."
    );
    res.status(400).redirect("/account/login");
    return;
  }

  const updateResult = await reviewModel.updateReview(review_id, review_text);
  if (updateResult) {
    req.flash("notice", "Review updated successfully.");
    res.redirect(`/account`);
  } else {
    req.flash("error", "Sorry, the review failed update.");
    res.status(501).redirect(`/account`);
  }
}

/**
 * Deletes a review
 */
async function deleteReview(req, res, next) {
  const { review_id } = req.body;

  const reviewData = await reviewModel.getReviewById(review_id);
  const account_id = res.locals.accountData?.account_id;
  if (account_id !== reviewData.account_id) {
    req.flash(
      "warning",
      "You must be logged in to the proper account for that deletion."
    );
    res.status(400).redirect("/account/login");
    return;
  }

  const updateResult = await reviewModel.deleteReview(review_id);
  if (updateResult) {
    req.flash("notice", "Review deleted successfully.");
    res.redirect(`/account`);
  } else {
    req.flash("error", "Sorry, the review failed delete.");
    res.status(501).redirect(`/account`);
  }
}

module.exports = {
  addReview,
  getUpdateView,
  getDeleteView,
  updateReview,
  deleteReview,
};
