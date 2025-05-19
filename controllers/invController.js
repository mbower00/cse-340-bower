const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

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
  });
};

module.exports = invCont;
