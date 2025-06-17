const pool = require("../database/");

/**
 * Get all classification data
 */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/**
 * Get all inventory items and classification_name by classification_id
 */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationbyid error " + error);
  }
}

async function getVehicleById(vehicleId) {
  try {
    const data = await pool.query(
      `
        SELECT * 
        FROM inventory
        WHERE inv_id = $1
      `,
      [vehicleId]
    );
    return data.rows;
  } catch (error) {
    console.error("getvehiclebyid error " + error);
  }
}

/**
 * Inserts a new classification into the database
 */
async function createClassification(classification_name) {
  try {
    const sql = `
    INSERT INTO classification
    (classification_name)
    VALUES
    ($1)
    RETURNING *
    `;
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("createClassification error ", error);
    return false;
  }
}

/**
 * inserts a new inventory item into the database
 */
async function addToInventory(
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
) {
  try {
    const sql = `
    INSERT INTO inventory
    (
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
    )
    VALUES
    (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    )
    RETURNING *
    `;
    return await pool.query(sql, [
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
    ]);
  } catch (error) {
    console.error("addToInventory error ", error);
    return false;
  }
}

/**
 * Check for existing classification id
 */
async function checkExistingClassificationId(classification_id) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_id = $1";
    const email = await pool.query(sql, [classification_id]);
    return email.rowCount;
  } catch (error) {
    console.error("checkExistingClassificationId error ", error);
    throw new Error("There was an error. Please try again later.");
  }
}

/**
 * Check for existing classification name
 */
async function checkExistingClassificationName(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1";
    const email = await pool.query(sql, [classification_name]);
    return email.rowCount;
  } catch (error) {
    console.error("checkExistingClassificationName error ", error);
    throw new Error("There was an error. Please try again later.");
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  createClassification,
  addToInventory,
  checkExistingClassificationId,
  checkExistingClassificationName,
};
