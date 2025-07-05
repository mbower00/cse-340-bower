// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const invValidate = require("../utilities/inventory-validation");

// Route to management
router.get(
  "/",
  utilities.createAccountClearanceMiddleware(),
  utilities.handleErrors(invController.buildManagement)
);

// Route to get the add classification view
router.get(
  "/add/classification",
  utilities.createAccountClearanceMiddleware(),
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to post new classification
router.post(
  "/add/classification",
  utilities.createAccountClearanceMiddleware(),
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.postNewClassification)
);

// Route to get the add inventory item view
router.get(
  "/add",
  utilities.createAccountClearanceMiddleware(),
  utilities.handleErrors(invController.buildAddInventoryItem)
);

// Route get the inventory items as JSON according to the classification_id
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Route to post new inventory item
router.post(
  "/add",
  utilities.createAccountClearanceMiddleware(),
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

// Route to build the edit inventory item view
router.get(
  "/edit/:inventory_id",
  utilities.createAccountClearanceMiddleware(),
  utilities.handleErrors(invController.buildInventoryItemEdit)
);

// Route to post an update to an inventory item
router.post(
  "/update/",
  utilities.createAccountClearanceMiddleware(),
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// Route to get the delete inventory item view
router.get(
  "/delete/:inventory_id",
  utilities.createAccountClearanceMiddleware(),
  utilities.handleErrors(invController.buildInventoryItemDelete)
);

// Route to delete an inventory item
router.post(
  "/delete",
  utilities.createAccountClearanceMiddleware(),
  utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;
