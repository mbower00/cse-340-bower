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
  const grid = await utilities.buildVehicleGrid(data);
  let nav = await utilities.getNav();
  const vehicleName = `${data.inv_make} ${data.inv_model}`;
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

/**
 * Build edit inventory item view
 */
invCont.buildInventoryItemEdit = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventory_id);

  const nav = await utilities.getNav();
  const inventoryItem = await invModel.getVehicleById(inventory_id);
  const name = `${inventoryItem.inv_make} ${inventoryItem.inv_model}`;
  const classificationList = await utilities.buildClassificationList(
    inventoryItem.classification_id
  );
  res.render("./inventory/edit-inventory", {
    title: "Edit " + name,
    inv_id: inventoryItem.inv_id,
    inv_make: inventoryItem.inv_make,
    inv_model: inventoryItem.inv_model,
    inv_year: inventoryItem.inv_year,
    classification_id: inventoryItem.classification_id,
    inv_description: inventoryItem.inv_description,
    inv_image: inventoryItem.inv_image,
    inv_thumbnail: inventoryItem.inv_thumbnail,
    inv_price: inventoryItem.inv_price,
    inv_miles: inventoryItem.inv_miles,
    inv_color: inventoryItem.inv_color,
    nav,
    errors: null,
    classificationList,
  });
};

/**
 * Update Inventory Data
 */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
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

  const updateResult = await invModel.updateInventory(
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
    inv_color
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash(
      "notice",
      `The <em>${inv_make} ${inv_model}</em> was successfully updated.`
    );
    res.redirect("/inv/");
  } else {
    const classificationList = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;

    req.flash("error", "Sorry, the update failed.");

    res.status(501).render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      errors: null,
      classificationList,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

module.exports = invCont;
