// code below comes from
//  - https://regexr.com/
//  - VSC autocomplete/suggestions
//  - other course code
//  - https://github.com/validatorjs/validator.js?tab=readme-ov-file#validators

const inventoryModel = require("../models/inventory-model");
const utilities = require(".");
const { body, validationResult } = require("express-validator");

function getCustomRegexFunction(pattern) {
  return (value) => {
    if (!value) {
      return false;
    }
    if (value.match(pattern)[0] !== value) {
      return false;
    }
    return true;
  };
}

function classificationRules() {
  return [
    body("classification_name")
      .trim()
      .custom(
        getCustomRegexFunction(
          /[QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890]+/g
        )
      )
      .withMessage("Classification name does not meet requirements.")
      .custom(async (classification_name) => {
        if (classification_name) {
          const classificationExists =
            await inventoryModel.checkExistingClassificationName(
              classification_name
            );
          if (classificationExists) {
            throw new Error("Classification already exists.");
          }
        }
      }),
  ];
}

function inventoryRules() {
  return [
    body("inv_make")
      .trim()
      .custom(getCustomRegexFunction(/.{3,}/g))
      .withMessage("Make needs a minimum of 3 characters."),

    body("inv_model")
      .trim()
      .custom(getCustomRegexFunction(/.{3,}/g))
      .withMessage("Model needs a minimum of 3 characters."),

    body("inv_year")
      .trim()
      .custom(getCustomRegexFunction(/[0-9]{4}/g))
      .withMessage("Year (required) must be a 4-digit number."),

    body("classification_id")
      .trim()
      .custom(getCustomRegexFunction(/.+/g))
      .withMessage("Classification is required.")
      .custom(async (classification_id) => {
        if (classification_id || classification == 0) {
          const classificationExists =
            await inventoryModel.checkExistingClassificationId(
              classification_id
            );
          if (!classificationExists) {
            throw new Error("Classification does not exist.");
          }
        }
      }),

    body("inv_description")
      .trim()
      .custom(getCustomRegexFunction(/.+/g))
      .withMessage("Description is required."),

    body("inv_image")
      .trim()
      .custom(getCustomRegexFunction(/.+/g))
      .withMessage("Image Path is required"),

    body("inv_thumbnail")
      .trim()
      .custom(getCustomRegexFunction(/.+/g))
      .withMessage("Thumbnail Path is required"),

    body("inv_price")
      .trim()
      .custom((inv_price) => {
        if (!inv_price) {
          return false;
        }
        if (
          inv_price.match(/[0-9]+/g)[0] === inv_price ||
          inv_price.match(/[0-9]+\.[0-9]{1,2}/g)[0] === inv_price
        ) {
          return true;
        }
        return false;
      })
      .withMessage(
        "Price (required) must be an integer or decimal (up to hundreths place)."
      ),

    body("inv_miles")
      .trim()
      .custom(getCustomRegexFunction(/[0-9]+/g))
      .withMessage("Miles (required) must be digits."),

    body("inv_color")
      .trim()
      .custom(getCustomRegexFunction(/.+/g))
      .withMessage("Color is required."),
  ];
}

async function checkClassificationData(req, res, next) {
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
    });
  } else {
    next();
  }
}

/**
 * Validate inventory item data for posting
 * Errors will be directed to the add-inventory view
 */
async function checkInventoryData(req, res, next) {
  const {
    inv_make,
    inv_model,
    inv_year,
    classification_id,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.render("./inventory/add-inventory", {
      errors,
      title: "Add to Inventory",
      nav,
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      classification_id,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
  } else {
    next();
  }
}

/**
 * Validate inventory item data for updating (include inv_id in body)
 * Errors will be directed to the edit-inventory view
 */
async function checkUpdateData(req, res, next) {
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    classification_id,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const name = `${inv_make} ${inv_model}`;
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    res.render("./inventory/edit-inventory", {
      errors,
      title: "Edit " + name,
      nav,
      classificationList,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      classification_id,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    });
  } else {
    next();
  }
}

module.exports = {
  classificationRules,
  checkClassificationData,
  inventoryRules,
  checkInventoryData,
  checkUpdateData,
};
