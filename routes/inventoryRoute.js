// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Route to management
router.get("/", utilities.handleErrors(invController.buildManagement));

// Route to get the add classification view
router.get(
  "/add/classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to post new classification
router.post(
  "/add/classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.postNewClassification)
);

// Route to get the add inventory item view
router.get("/add", utilities.handleErrors(invController.buildAddInventoryItem));

// Route get the inventory items as JSON according to the classification_id
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Route to post new inventory item
router.post(
  "/add",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.postNewInventoryItem)
);

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build vehicle detail view
router.get(
  "/detail/:vehicleId",
  utilities.handleErrors(invController.buildVehicleDetail)
);

module.exports = router;
