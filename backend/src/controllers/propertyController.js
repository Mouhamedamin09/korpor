const Project = require("../models/Project");
const PropertyImage = require("../models/PropertyImage");
const ProjectDocument = require("../models/ProjectDocument");
const User = require("../models/User");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db.config");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

/**
 * Get all properties with pagination, filtering, and sorting
 */
exports.getAllProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 9,
      search = "",
      featured,
      status,
      property_type,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;

    const offset = (page - 1) * limit;

    // Build the where clause for filtering
    const whereClause = {};

    if (featured !== undefined) {
      whereClause.featured = featured === "true";
    }

    if (status) {
      whereClause.status = status;
    }

    if (property_type) {
      whereClause.property_type = property_type;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Find all properties with the given criteria
    const { count, rows: properties } = await Project.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PropertyImage,
          as: "images",
          attributes: ["id", "image_url", "is_primary"],
        },
        {
          model: ProjectDocument,
          as: "documents",
          attributes: ["id", "name", "file_url", "document_type"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["name", "surname"],
        },
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      distinct: true, // Important for correct count with includes
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      data: {
        properties,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page, 10),
          limit: parseInt(limit, 10),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).json({
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};

/**
 * Get a single property by ID
 */
exports.getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Project.findByPk(id, {
      include: [
        {
          model: PropertyImage,
          as: "images",
          attributes: ["id", "image_url", "is_primary", "cloudinary_public_id"],
        },
        {
          model: ProjectDocument,
          as: "documents",
          attributes: [
            "id",
            "name",
            "file_url",
            "document_type",
            "cloudinary_public_id",
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "surname"],
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.status(200).json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return res.status(500).json({
      message: "Failed to fetch property",
      error: error.message,
    });
  }
};

/**
 * Create a new property
 */
exports.createProperty = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    // Parse the property data from the form
    const propertyData = JSON.parse(req.body.data);

    // Set the creator to the logged-in user
    propertyData.created_by = req.user.userId;

    // Create the property
    const property = await Project.create(propertyData, { transaction });

    // Process images if they exist
    if (req.files && req.files.images) {
      const imagePromises = req.files.images.map(async (file, index) => {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, "property_images");

        // Create image record in the database
        return PropertyImage.create(
          {
            project_id: property.id,
            image_url: result.secure_url,
            cloudinary_public_id: result.public_id,
            is_primary: index === 0, // First image is primary by default
          },
          { transaction },
        );
      });

      await Promise.all(imagePromises);
    }

    // Process documents if they exist
    if (req.files && req.files.documents) {
      const documentPromises = req.files.documents.map(async (file) => {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          file.buffer,
          "property_documents",
        );

        // Create document record in the database
        return ProjectDocument.create(
          {
            project_id: property.id,
            name: file.originalname,
            file_url: result.secure_url,
            cloudinary_public_id: result.public_id,
            document_type: "other", // Default type - could be improved
            created_by: req.user.userId,
          },
          { transaction },
        );
      });

      await Promise.all(documentPromises);
    }

    // Handle existing images from the request (e.g., when duplicating a property)
    if (req.body.images) {
      const images = JSON.parse(req.body.images);
      if (Array.isArray(images) && images.length > 0) {
        const imagePromises = images.map((image, index) => {
          return PropertyImage.create(
            {
              project_id: property.id,
              image_url: image.image_url,
              cloudinary_public_id: image.cloudinary_public_id,
              is_primary: image.is_primary || false,
            },
            { transaction },
          );
        });

        await Promise.all(imagePromises);
      }
    }

    // Handle existing documents from the request
    if (req.body.documents) {
      const documents = JSON.parse(req.body.documents);
      if (Array.isArray(documents) && documents.length > 0) {
        const documentPromises = documents.map((doc) => {
          return ProjectDocument.create(
            {
              project_id: property.id,
              name: doc.name,
              file_url: doc.file_url,
              cloudinary_public_id: doc.cloudinary_public_id,
              document_type: doc.document_type || "other",
              created_by: req.user.userId,
            },
            { transaction },
          );
        });

        await Promise.all(documentPromises);
      }
    }

    await transaction.commit();

    res.status(201).json({
      message: "Property created successfully",
      property: {
        id: property.id,
        name: property.name,
      },
    });
  } catch (error) {
    console.error("Error creating property:", error);
    await transaction.rollback();

    return res.status(500).json({
      message: "Failed to create property",
      error: error.message,
    });
  }
};

/**
 * Update an existing property
 */
exports.updateProperty = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Check if property exists
    const property = await Project.findByPk(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Parse the property data from the form
    const propertyData = JSON.parse(req.body.data);

    // Update the property
    await property.update(propertyData, { transaction });

    // Process new images if they exist
    if (req.files && req.files.images) {
      const imagePromises = req.files.images.map(async (file) => {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, "property_images");

        // Create image record in the database
        return PropertyImage.create(
          {
            project_id: property.id,
            image_url: result.secure_url,
            cloudinary_public_id: result.public_id,
            is_primary: false, // New uploads are not primary by default
          },
          { transaction },
        );
      });

      await Promise.all(imagePromises);
    }

    // Process new documents if they exist
    if (req.files && req.files.documents) {
      const documentPromises = req.files.documents.map(async (file) => {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          file.buffer,
          "property_documents",
        );

        // Create document record in the database
        return ProjectDocument.create(
          {
            project_id: property.id,
            name: file.originalname,
            file_url: result.secure_url,
            cloudinary_public_id: result.public_id,
            document_type: "other", // Default type
            created_by: req.user.userId,
          },
          { transaction },
        );
      });

      await Promise.all(documentPromises);
    }

    // Update existing images (e.g., changing primary status)
    if (req.body.images) {
      try {
        const images = JSON.parse(req.body.images);
        if (Array.isArray(images) && images.length > 0) {
          // First set all images to non-primary
          await PropertyImage.update(
            { is_primary: false },
            {
              where: { project_id: property.id },
              transaction,
            },
          );

          // Then update each image
          for (const image of images) {
            if (image.id) {
              await PropertyImage.update(
                { is_primary: image.is_primary || false },
                {
                  where: { id: image.id, project_id: property.id },
                  transaction,
                },
              );
            }
          }
        }
      } catch (error) {
        console.error("Error updating images:", error);
      }
    }

    // Handle deleted images
    if (req.body.deletedImages) {
      try {
        const deletedImages = JSON.parse(req.body.deletedImages);
        if (Array.isArray(deletedImages) && deletedImages.length > 0) {
          // First get the images to delete
          const imagesToDelete = await PropertyImage.findAll({
            where: {
              id: deletedImages,
              project_id: property.id,
            },
            transaction,
          });

          // Delete from Cloudinary
          for (const image of imagesToDelete) {
            if (image.cloudinary_public_id) {
              await deleteFromCloudinary(image.cloudinary_public_id);
            }
          }

          // Delete from database
          await PropertyImage.destroy({
            where: {
              id: deletedImages,
              project_id: property.id,
            },
            transaction,
          });
        }
      } catch (error) {
        console.error("Error deleting images:", error);
      }
    }

    // Handle deleted documents
    if (req.body.deletedDocuments) {
      try {
        const deletedDocuments = JSON.parse(req.body.deletedDocuments);
        if (Array.isArray(deletedDocuments) && deletedDocuments.length > 0) {
          // First get the documents to delete
          const docsToDelete = await ProjectDocument.findAll({
            where: {
              id: deletedDocuments,
              project_id: property.id,
            },
            transaction,
          });

          // Delete from Cloudinary
          for (const doc of docsToDelete) {
            if (doc.cloudinary_public_id) {
              await deleteFromCloudinary(doc.cloudinary_public_id);
            }
          }

          // Delete from database
          await ProjectDocument.destroy({
            where: {
              id: deletedDocuments,
              project_id: property.id,
            },
            transaction,
          });
        }
      } catch (error) {
        console.error("Error deleting documents:", error);
      }
    }

    await transaction.commit();

    res.status(200).json({
      message: "Property updated successfully",
      property: {
        id: property.id,
        name: property.name,
      },
    });
  } catch (error) {
    console.error("Error updating property:", error);
    await transaction.rollback();

    return res.status(500).json({
      message: "Failed to update property",
      error: error.message,
    });
  }
};

/**
 * Delete a property
 */
exports.deleteProperty = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Check if property exists
    const property = await Project.findByPk(id, {
      include: [
        {
          model: PropertyImage,
          as: "images",
        },
        {
          model: ProjectDocument,
          as: "documents",
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Delete images from Cloudinary
    if (property.images && property.images.length > 0) {
      for (const image of property.images) {
        if (image.cloudinary_public_id) {
          await deleteFromCloudinary(image.cloudinary_public_id);
        }
      }
    }

    // Delete documents from Cloudinary
    if (property.documents && property.documents.length > 0) {
      for (const doc of property.documents) {
        if (doc.cloudinary_public_id) {
          await deleteFromCloudinary(doc.cloudinary_public_id);
        }
      }
    }

    // Delete property (will cascade delete images and documents)
    await property.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      message: "Property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    await transaction.rollback();

    return res.status(500).json({
      message: "Failed to delete property",
      error: error.message,
    });
  }
};

/**
 * Toggle the featured status of a property
 */
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property exists
    const property = await Project.findByPk(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Toggle the featured status
    await property.update({
      featured: !property.featured,
    });

    res.status(200).json({
      message: `Property ${property.featured ? "featured" : "unfeatured"} successfully`,
      featured: property.featured,
    });
  } catch (error) {
    console.error("Error toggling property featured status:", error);

    return res.status(500).json({
      message: "Failed to toggle property featured status",
      error: error.message,
    });
  }
};

/**
 * Helper function to upload a file to Cloudinary
 */
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Helper function to delete a file from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Error deleting file ${publicId} from Cloudinary:`, error);
    // Don't throw - just log the error and continue
  }
};
