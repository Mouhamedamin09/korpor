const db = require("../config/db.config");
const cloudinary = require("../utils/cloudinary");
const { logger } = require("../utils/logger");

/**
 * Get all properties with optional filtering
 * @param {Object} filters - Filter options (status, type, featured, etc)
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise<Object>} Properties and pagination data
 */
const getAllProperties = async (filters = {}, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, u.name as creator_name, u.surname as creator_surname,
             COUNT(DISTINCT i.id) as investor_count, 
             COALESCE(SUM(i.amount), 0) as total_invested
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN investments i ON p.id = i.project_id AND i.status = 'confirmed'
    `;

    let whereConditions = [];
    let params = [];

    // Add filters
    if (filters.status) {
      whereConditions.push("p.status = ?");
      params.push(filters.status);
    }

    if (filters.propertyType) {
      whereConditions.push("p.property_type = ?");
      params.push(filters.propertyType);
    }

    if (filters.featured !== undefined) {
      whereConditions.push("p.featured = ?");
      params.push(filters.featured ? 1 : 0);
    }

    if (filters.minSize) {
      whereConditions.push("p.property_size >= ?");
      params.push(filters.minSize);
    }

    if (filters.maxSize) {
      whereConditions.push("p.property_size <= ?");
      params.push(filters.maxSize);
    }

    if (filters.location) {
      whereConditions.push("p.location LIKE ?");
      params.push(`%${filters.location}%`);
    }

    if (filters.search) {
      whereConditions.push("(p.name LIKE ? OR p.description LIKE ?)");
      params.push(`%${filters.search}%`);
      params.push(`%${filters.search}%`);
    }

    // Add WHERE clause if there are conditions
    if (whereConditions.length > 0) {
      query += " WHERE " + whereConditions.join(" AND ");
    }

    // Add GROUP BY
    query += " GROUP BY p.id";

    // Add ORDER BY with safe default
    const safeColumns = [
      "p.created_at",
      "p.name",
      "p.id",
      "p.updated_at",
      "p.goal_amount",
    ];
    let sortColumn = "p.created_at"; // Default sort column

    if (filters.sortBy && safeColumns.includes(filters.sortBy)) {
      sortColumn = filters.sortBy;
    }

    const sortOrder =
      filters.sortOrder &&
      ["ASC", "DESC"].includes(filters.sortOrder.toUpperCase())
        ? filters.sortOrder.toUpperCase()
        : "DESC";

    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Add LIMIT and OFFSET
    query += " LIMIT ? OFFSET ?";
    params.push(parseInt(limit));
    params.push(parseInt(offset));

    // Execute query
    const [properties] = await db.query(query, params);

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM projects p";

    if (whereConditions.length > 0) {
      countQuery += " WHERE " + whereConditions.join(" AND ");
    }

    const [countResult] = await db.query(countQuery, params.slice(0, -2));

    // Get primary images for each property
    for (let property of properties) {
      const [images] = await db.query(
        `SELECT * FROM property_images 
         WHERE project_id = ? 
         ORDER BY is_primary DESC, id ASC`,
        [property.id],
      );

      property.images = images || [];

      // Get documents
      const [documents] = await db.query(
        "SELECT * FROM project_documents WHERE project_id = ?",
        [property.id],
      );

      property.documents = documents || [];
    }

    return {
      properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalItems: countResult[0].total,
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    };
  } catch (error) {
    logger.error("Error getting properties:", error);
    throw error;
  }
};

/**
 * Get property by ID
 * @param {number} id - Property ID
 * @returns {Promise<Object>} Property details
 */
const getPropertyById = async (id) => {
  try {
    // Get property details
    const [properties] = await db.query(
      `SELECT p.*, u.name as creator_name, u.surname as creator_surname
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = ?`,
      [id],
    );

    if (!properties.length) {
      return null;
    }

    const property = properties[0];

    // Get property images
    const [images] = await db.query(
      "SELECT * FROM property_images WHERE project_id = ? ORDER BY is_primary DESC, id ASC",
      [id],
    );

    property.images = images || [];

    // Get property documents
    const [documents] = await db.query(
      "SELECT * FROM project_documents WHERE project_id = ?",
      [id],
    );

    property.documents = documents || [];

    // Get investment statistics
    const [investments] = await db.query(
      `SELECT COUNT(id) as investor_count, SUM(amount) as total_invested
       FROM investments
       WHERE project_id = ? AND status = 'confirmed'`,
      [id],
    );

    if (investments.length) {
      property.investor_count = investments[0].investor_count || 0;
      property.total_invested = investments[0].total_invested || 0;
    }

    return property;
  } catch (error) {
    logger.error(`Error getting property with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new property
 * @param {Object} propertyData - Property details
 * @param {number} userId - ID of the user creating the property
 * @returns {Promise<Object>} Created property
 */
const createProperty = async (propertyData, userId) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Insert property
    const [result] = await connection.query(
      `INSERT INTO projects (
        name, description, goal_amount, current_amount, status, property_status,
        location, coordinates, address_details, property_size, property_type,
        bedrooms, bathrooms, construction_year, amenities, expected_roi,
        rental_yield, investment_period, minimum_investment, featured, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        propertyData.name,
        propertyData.description,
        propertyData.goal_amount || 0,
        propertyData.current_amount || 0,
        propertyData.status || "Pending",
        propertyData.property_status || "under_review",
        propertyData.location,
        propertyData.coordinates
          ? `POINT(${propertyData.coordinates.longitude} ${propertyData.coordinates.latitude})`
          : null,
        propertyData.address_details
          ? JSON.stringify(propertyData.address_details)
          : null,
        propertyData.property_size,
        propertyData.property_type,
        propertyData.bedrooms,
        propertyData.bathrooms,
        propertyData.construction_year,
        propertyData.amenities ? JSON.stringify(propertyData.amenities) : null,
        propertyData.expected_roi,
        propertyData.rental_yield,
        propertyData.investment_period,
        propertyData.minimum_investment,
        propertyData.featured ? 1 : 0,
        userId,
      ],
    );

    const propertyId = result.insertId;

    // Handle image uploads if provided
    if (propertyData.images && propertyData.images.length) {
      for (let i = 0; i < propertyData.images.length; i++) {
        const image = propertyData.images[i];
        const isPrimary = i === 0; // First image is primary

        // Upload to cloudinary if image is a base64 string
        let imageUrl = image.url;
        let publicId = null;

        if (image.data && image.data.startsWith("data:image")) {
          const uploadResult = await cloudinary.uploader.upload(image.data, {
            folder: "properties",
          });

          imageUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id;
        }

        // Save image to database
        await connection.query(
          `INSERT INTO property_images (
            project_id, image_url, cloudinary_public_id, is_primary
          ) VALUES (?, ?, ?, ?)`,
          [propertyId, imageUrl, publicId, isPrimary ? 1 : 0],
        );
      }
    }

    // Handle document uploads if provided
    if (propertyData.documents && propertyData.documents.length) {
      for (const document of propertyData.documents) {
        let docUrl = document.url;
        let publicId = null;

        // Upload to cloudinary if document is a base64 string
        if (document.data) {
          const uploadResult = await cloudinary.uploader.upload(document.data, {
            folder: "property_documents",
            resource_type: "auto",
          });

          docUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id;
        }

        // Save document to database
        await connection.query(
          `INSERT INTO project_documents (
            project_id, name, file_url, cloudinary_public_id, document_type, created_by
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            propertyId,
            document.name,
            docUrl,
            publicId,
            document.document_type || "other",
            userId,
          ],
        );
      }
    }

    // Update main image URL for the property if images were uploaded
    if (propertyData.images && propertyData.images.length) {
      const [images] = await connection.query(
        "SELECT image_url FROM property_images WHERE project_id = ? AND is_primary = 1",
        [propertyId],
      );

      if (images.length) {
        await connection.query(
          "UPDATE projects SET image_url = ? WHERE id = ?",
          [images[0].image_url, propertyId],
        );
      }
    }

    await connection.commit();

    // Return the created property
    return await getPropertyById(propertyId);
  } catch (error) {
    await connection.rollback();
    logger.error("Error creating property:", error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Update a property
 * @param {number} id - Property ID
 * @param {Object} propertyData - Updated property details
 * @returns {Promise<Object>} Updated property
 */
const updateProperty = async (id, propertyData) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check if property exists
    const [properties] = await connection.query(
      "SELECT * FROM projects WHERE id = ?",
      [id],
    );

    if (!properties.length) {
      throw new Error(`Property with ID ${id} not found`);
    }

    // Update property data
    const updateFields = [];
    const updateValues = [];

    // Process all fields that could be updated
    const fields = [
      "name",
      "description",
      "goal_amount",
      "current_amount",
      "status",
      "property_status",
      "location",
      "property_size",
      "property_type",
      "bedrooms",
      "bathrooms",
      "construction_year",
      "expected_roi",
      "rental_yield",
      "investment_period",
      "minimum_investment",
      "featured",
    ];

    fields.forEach((field) => {
      if (propertyData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(propertyData[field]);
      }
    });

    // Handle JSON fields
    if (propertyData.amenities !== undefined) {
      updateFields.push("amenities = ?");
      updateValues.push(JSON.stringify(propertyData.amenities));
    }

    if (propertyData.address_details !== undefined) {
      updateFields.push("address_details = ?");
      updateValues.push(JSON.stringify(propertyData.address_details));
    }

    // Handle coordinates
    if (propertyData.coordinates) {
      updateFields.push("coordinates = ST_GeomFromText(?)");
      updateValues.push(
        `POINT(${propertyData.coordinates.longitude} ${propertyData.coordinates.latitude})`,
      );
    }

    // If there are fields to update
    if (updateFields.length > 0) {
      updateValues.push(id); // Add ID for WHERE clause

      await connection.query(
        `UPDATE projects SET ${updateFields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        updateValues,
      );
    }

    // Handle image updates if provided
    if (propertyData.images) {
      // Delete images that need to be removed
      if (propertyData.deletedImages && propertyData.deletedImages.length) {
        for (const imageId of propertyData.deletedImages) {
          // Get image data to delete from cloudinary
          const [image] = await connection.query(
            "SELECT cloudinary_public_id FROM property_images WHERE id = ? AND project_id = ?",
            [imageId, id],
          );

          if (image.length && image[0].cloudinary_public_id) {
            await cloudinary.uploader.destroy(image[0].cloudinary_public_id);
          }

          // Delete from database
          await connection.query(
            "DELETE FROM property_images WHERE id = ? AND project_id = ?",
            [imageId, id],
          );
        }
      }

      // Add new images
      for (let i = 0; i < propertyData.images.length; i++) {
        const image = propertyData.images[i];

        // Skip if this is an existing image without changes
        if (image.id && !image.data) continue;

        const isPrimary = image.is_primary || false;

        // Upload to cloudinary if image is a base64 string
        let imageUrl = image.url;
        let publicId = null;

        if (image.data && image.data.startsWith("data:image")) {
          const uploadResult = await cloudinary.uploader.upload(image.data, {
            folder: "properties",
          });

          imageUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id;
        }

        if (image.id) {
          // Update existing image
          await connection.query(
            `UPDATE property_images SET 
             image_url = ?, cloudinary_public_id = ?, is_primary = ?
             WHERE id = ? AND project_id = ?`,
            [imageUrl, publicId, isPrimary ? 1 : 0, image.id, id],
          );
        } else {
          // Insert new image
          await connection.query(
            `INSERT INTO property_images (
              project_id, image_url, cloudinary_public_id, is_primary
            ) VALUES (?, ?, ?, ?)`,
            [id, imageUrl, publicId, isPrimary ? 1 : 0],
          );
        }
      }

      // Make sure there's exactly one primary image
      const [primaryImages] = await connection.query(
        "SELECT id FROM property_images WHERE project_id = ? AND is_primary = 1",
        [id],
      );

      if (primaryImages.length === 0) {
        // No primary image, make the first one primary
        const [images] = await connection.query(
          "SELECT id FROM property_images WHERE project_id = ? ORDER BY id ASC LIMIT 1",
          [id],
        );

        if (images.length) {
          await connection.query(
            "UPDATE property_images SET is_primary = 1 WHERE id = ?",
            [images[0].id],
          );
        }
      } else if (primaryImages.length > 1) {
        // Multiple primary images, keep only the first one
        await connection.query(
          "UPDATE property_images SET is_primary = 0 WHERE project_id = ? AND id != ?",
          [id, primaryImages[0].id],
        );
      }

      // Update main image URL for the property
      const [primaryImage] = await connection.query(
        "SELECT image_url FROM property_images WHERE project_id = ? AND is_primary = 1",
        [id],
      );

      if (primaryImage.length) {
        await connection.query(
          "UPDATE projects SET image_url = ? WHERE id = ?",
          [primaryImage[0].image_url, id],
        );
      }
    }

    // Handle document updates if provided
    if (propertyData.documents) {
      // Delete documents that need to be removed
      if (
        propertyData.deletedDocuments &&
        propertyData.deletedDocuments.length
      ) {
        for (const docId of propertyData.deletedDocuments) {
          // Get document data to delete from cloudinary
          const [doc] = await connection.query(
            "SELECT cloudinary_public_id FROM project_documents WHERE id = ? AND project_id = ?",
            [docId, id],
          );

          if (doc.length && doc[0].cloudinary_public_id) {
            await cloudinary.uploader.destroy(doc[0].cloudinary_public_id, {
              resource_type: "raw",
            });
          }

          // Delete from database
          await connection.query(
            "DELETE FROM project_documents WHERE id = ? AND project_id = ?",
            [docId, id],
          );
        }
      }

      // Add new documents
      for (const document of propertyData.documents) {
        // Skip if this is an existing document without changes
        if (document.id && !document.data) continue;

        let docUrl = document.url;
        let publicId = null;

        // Upload to cloudinary if document is a base64 string
        if (document.data) {
          const uploadResult = await cloudinary.uploader.upload(document.data, {
            folder: "property_documents",
            resource_type: "auto",
          });

          docUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id;
        }

        if (document.id) {
          // Update existing document
          await connection.query(
            `UPDATE project_documents SET 
             name = ?, file_url = ?, cloudinary_public_id = ?, document_type = ?
             WHERE id = ? AND project_id = ?`,
            [
              document.name,
              docUrl,
              publicId,
              document.document_type || "other",
              document.id,
              id,
            ],
          );
        } else {
          // Insert new document
          await connection.query(
            `INSERT INTO project_documents (
              project_id, name, file_url, cloudinary_public_id, document_type, created_by
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              id,
              document.name,
              docUrl,
              publicId,
              document.document_type || "other",
              propertyData.userId, // User making the update
            ],
          );
        }
      }
    }

    await connection.commit();

    // Return the updated property
    return await getPropertyById(id);
  } catch (error) {
    await connection.rollback();
    logger.error(`Error updating property with ID ${id}:`, error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Delete a property
 * @param {number} id - Property ID
 * @returns {Promise<boolean>} Success status
 */
const deleteProperty = async (id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check if property exists
    const [properties] = await connection.query(
      "SELECT * FROM projects WHERE id = ?",
      [id],
    );

    if (!properties.length) {
      throw new Error(`Property with ID ${id} not found`);
    }

    // Get all images to delete from cloudinary
    const [images] = await connection.query(
      "SELECT cloudinary_public_id FROM property_images WHERE project_id = ?",
      [id],
    );

    // Delete images from cloudinary
    for (const image of images) {
      if (image.cloudinary_public_id) {
        await cloudinary.uploader.destroy(image.cloudinary_public_id);
      }
    }

    // Get all documents to delete from cloudinary
    const [documents] = await connection.query(
      "SELECT cloudinary_public_id FROM project_documents WHERE project_id = ?",
      [id],
    );

    // Delete documents from cloudinary
    for (const doc of documents) {
      if (doc.cloudinary_public_id) {
        await cloudinary.uploader.destroy(doc.cloudinary_public_id, {
          resource_type: "raw",
        });
      }
    }

    // Cascade delete will handle related tables
    await connection.query("DELETE FROM projects WHERE id = ?", [id]);

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    logger.error(`Error deleting property with ID ${id}:`, error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Toggle the featured status of a property
 * @param {number} id - Property ID
 * @returns {Promise<Object>} Updated property
 */
const toggleFeaturedStatus = async (id) => {
  try {
    // Get current featured status
    const [properties] = await db.query(
      "SELECT featured FROM projects WHERE id = ?",
      [id],
    );

    if (!properties.length) {
      throw new Error(`Property with ID ${id} not found`);
    }

    const newStatus = properties[0].featured ? 0 : 1;

    // Update status
    await db.query("UPDATE projects SET featured = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    return await getPropertyById(id);
  } catch (error) {
    logger.error(
      `Error toggling featured status for property with ID ${id}:`,
      error,
    );
    throw error;
  }
};

module.exports = {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  toggleFeaturedStatus,
};
