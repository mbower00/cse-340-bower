const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

/**
 * Build management view
 */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    classificationSelect,
  });
};

/**
 * Build add classification view
 */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav();
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  });
};

/**
 * Post a new classification
 */
invCont.postNewClassification = async function (req, res, next) {
  const { classification_name } = req.body;

  const createResult = await invModel.createClassification(classification_name);

  if (createResult) {
    const nav = await utilities.getNav();

    req.flash(
      "notice",
      `Classification <em>${classification_name}</em> has been added successfully.`
    );

    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    });
  } else {
    const nav = await utilities.getNav();

    req.flash("error", "Sorry, the classification creation failed.");

    res.status(501).render("./inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
  }
};

/**
 * Build add inventory item view
 */
invCont.buildAddInventoryItem = async function (req, res, next) {
  const nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList();
  res.render("./inventory/add-inventory", {
    title: "Add to Inventory",
    nav,
    errors: null,
    classificationList,
  });
};

/**
 * Post a new inventory item
 */
invCont.postNewInventoryItem = async function (req, res, next) {
  const nav = await utilities.getNav();
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

  const addResult = await invModel.addToInventory(
    inv_make,
    inv_model,
    inv_year,
    classification_id,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  );

  if (addResult) {
    req.flash(
      "notice",
      `<em>${inv_year} ${inv_make} ${inv_model}</em> added successfully.`
    );

    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null,
    });
  } else {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();

    req.flash("error", "Sorry, the inventory addition failed.");

    res.status(501).render("./inventory/add-inventory", {
      title: "Add to Inventory",
      nav,
      errors: null,
      classificationList,
    });
  }
};

/**
 * Build inventory by Classification view
 */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  });
};

invCont.buildVehicleDetail = async function (req, res, next) {
  const vehicleId = req.params.vehicleId;
  const data = await invModel.getVehicleById(vehicleId);
  const grid = await utilities.buildVehicleGrid(data[0]);
  let nav = await utilities.getNav();
  const vehicleName = `${data[0].inv_make} ${data[0].inv_model}`;
  res.render("./inventory/vehicleDetail", {
    title: vehicleName,
    nav,
    grid,
    errors: null,
  });
};

/**
 * Return Inventory by Classification As JSON
 */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

module.exports = invCont;
