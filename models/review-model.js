const pool = require("../database");

/**
 * Get the reviews for an inventory item
 */
async function getReviewsByInventoryId(inv_id) {
  try {
    const sql = `
      SELECT 
        review_id, review_text, review_date, inv_id, account_firstname, account_lastname 
      FROM 
        review AS r JOIN account AS a
        ON r.account_id = a.account_id
      WHERE inv_id = $1
      ORDER BY review_date DESC
    `;
    const data = await pool.query(sql, [inv_id]);
    return data.rows;
  } catch (error) {
    throw new Error(`model getReviewsByInventoryId error ${error}`);
  }
}

/**
 * Get the reviews for an account
 */
async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT 
        review_id, review_text, review_date, account_id, inv_model, inv_make, inv_year, r.inv_id
      FROM 
        review AS r JOIN inventory AS i
        ON r.inv_id = i.inv_id
      WHERE account_id = $1
      ORDER BY review_date DESC
    `;
    const data = await pool.query(sql, [account_id]);
    return data.rows;
  } catch (error) {
    throw new Error(`model getReviewsByInventoryId error ${error}`);
  }
}

/**
 * Get a review by id
 */
async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT 
        review_id, review_text, review_date, account_id, inv_model, inv_make, inv_year, r.inv_id
      FROM 
        review AS r JOIN inventory AS i
        ON r.inv_id = i.inv_id
      WHERE review_id = $1
    `;
    const data = await pool.query(sql, [review_id]);
    return data.rows[0];
  } catch (error) {
    throw new Error(`model getReviewsByInventoryId error ${error}`);
  }
}

/**
 * Adds a review
 */
async function addReview(review_text, inv_id, account_id) {
  try {
    const sql = `
      INSERT INTO review
      (review_text, inv_id, account_id)
      VALUES
      ($1, $2, $3)
      RETURNING *
    `;
    return await pool.query(sql, [review_text, inv_id, account_id]);
  } catch (error) {
    console.error("addReview error ", error);
    return false;
  }
}

/**
 * Updates a review
 */
async function updateReview(review_id, review_text) {
  try {
    const sql = `
      UPDATE review 
      SET review_text = $1
      WHERE review_id = $2
      RETURNING *
    `;
    return await pool.query(sql, [review_text, review_id]);
  } catch (error) {
    console.error("addReview error ", error);
    return false;
  }
}

/**
 * Deletes a review
 */
async function deleteReview(review_id) {
  try {
    const sql = `
      DELETE FROM review
      WHERE review_id = $1
    `;
    return await pool.query(sql, [review_id]);
  } catch (error) {
    console.error("addReview error ", error);
    return false;
  }
}

module.exports = {
  getReviewsByInventoryId,
  getReviewsByAccountId,
  getReviewById,
  addReview,
  updateReview,
  deleteReview,
};
