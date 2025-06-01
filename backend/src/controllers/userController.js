const User = require("../models/User");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const Role = require("../models/Role");
const { Sequelize, Op } = require("sequelize");

exports.getProfile = async (req, res) => {
  try {
    console.log("Getting profile for user:", req.user);
    const user = await User.findByPk(req.user.userId, {
      attributes: [
        "name",
        "email",
        "phone",
        "accountType",
        "korporSince",
        "intro",
        "investmentUsedPct",
        "investmentTotal",
        "globalUsers",
        "globalCountries",
        "isVerified",
        "approvalStatus",
        "profilePicture",
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accountData = {
      id: req.user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone || "+21629453228",
      accountType: user.accountType || "Individual Account",
      korporSince: new Date(user.korporSince).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      intro: user.intro || "Korpor Intro",
      investmentUsedPct: user.investmentUsedPct || 0,
      investmentTotal: user.investmentTotal || 367000,
      globalUsers: user.globalUsers || 1000000,
      globalCountries: user.globalCountries || 209,
      isVerified: user.isVerified || false,
      approvalStatus: user.approvalStatus || "pending",
      profilePicture: user.profilePicture || null,
      verificationProgress: {
        completed: user.isVerified ? 4 : 2,
        total: 4,
      },
    };

    res.json(accountData);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      accountType,
      intro,
      investmentUsedPct,
      investmentTotal,
      globalUsers,
      globalCountries,
    } = req.body;

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user fields
    await user.update({
      name: name || user.name,
      phone: phone || user.phone,
      accountType: accountType || user.accountType,
      intro: intro || user.intro,
      investmentUsedPct: investmentUsedPct || user.investmentUsedPct,
      investmentTotal: investmentTotal || user.investmentTotal,
      globalUsers: globalUsers || user.globalUsers,
      globalCountries: globalCountries || user.globalCountries,
    });

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.cloudinaryPublicId)
      await cloudinary.uploader.destroy(user.cloudinaryPublicId);

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "profile_pictures" },
      async (error, result) => {
        if (error) {
          console.error(error);
          return res
            .status(500)
            .json({ message: "Cloudinary upload error", error });
        }
        user.profilePicture = result.secure_url;
        user.cloudinaryPublicId = result.public_id;
        await user.save();
        return res.json({
          message: "Profile picture updated",
          profilePicture: user.profilePicture,
        });
      }
    );
    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Get all users
 * @route GET /api/users
 * @access Private (authenticated users)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "accountType",
        "korporSince",
        "investmentTotal",
        "globalUsers",
        "globalCountries",
      ],
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};
