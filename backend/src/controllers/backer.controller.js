const { rawQuery } = require("../config/db.config");

// Get all backers
exports.getAllBackers = async (req, res) => {
  try {
    const [backers] = await rawQuery(
      "SELECT * FROM backers ORDER BY `order` ASC"
    );
    res.json(backers);
  } catch (error) {
    console.error("Error fetching backers:", error);
    res.status(500).json({ message: "Error fetching backers" });
  }
};

// Add a new backer
exports.addBacker = async (req, res) => {
  const { name, image_url, order } = req.body;

  if (!name || !image_url) {
    return res.status(400).json({ message: "Name and image URL are required" });
  }

  try {
    const [result] = await rawQuery(
      `INSERT INTO backers (name, image_url, \`order\`, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      [name, image_url, order || 0]
    );

    const [newBacker] = await rawQuery(
      "SELECT * FROM backers WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newBacker[0]);
  } catch (error) {
    console.error("Error adding backer:", error);
    res.status(500).json({ message: "Error adding backer" });
  }
};

// Update a backer
exports.updateBacker = async (req, res) => {
  const { id } = req.params;
  const { name, image_url, order } = req.body;

  try {
    await rawQuery(
      `UPDATE backers 
       SET name = ?, image_url = ?, \`order\` = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, image_url, order, id]
    );

    const [updatedBacker] = await rawQuery(
      "SELECT * FROM backers WHERE id = ?",
      [id]
    );

    if (!updatedBacker.length) {
      return res.status(404).json({ message: "Backer not found" });
    }

    res.json(updatedBacker[0]);
  } catch (error) {
    console.error("Error updating backer:", error);
    res.status(500).json({ message: "Error updating backer" });
  }
};

// Delete a backer
exports.deleteBacker = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await rawQuery(
      "DELETE FROM backers WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Backer not found" });
    }

    res.json({ message: "Backer deleted successfully" });
  } catch (error) {
    console.error("Error deleting backer:", error);
    res.status(500).json({ message: "Error deleting backer" });
  }
}; 