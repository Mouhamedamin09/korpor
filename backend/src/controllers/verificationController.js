const { User, Verification } = require("../models");
const cloudinary = require("../config/cloudinary.config");
const axios = require("axios");

// Create or get verification record for user
const getOrCreateVerification = async (userId) => {
  let verification = await Verification.findOne({ where: { userId } });

  if (!verification) {
    verification = await Verification.create({ userId });
  }

  return verification;
};

// Upload identity documents (passport + selfie)
const uploadIdentityDocuments = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const { passportImage, selfieImage } = req.files || {};

    if (!passportImage || !selfieImage) {
      return res.status(400).json({
        error: "Both passport and selfie images are required",
      });
    }

    console.log("📋 Uploading identity documents for user:", userId);

    // Upload images to Cloudinary
    const passportUpload = await cloudinary.uploadBuffer(
      passportImage[0].buffer,
      {
        folder: "verifications/identity",
        resource_type: "image",
        public_id: `passport_${userId}_${Date.now()}`,
      }
    );

    const selfieUpload = await cloudinary.uploadBuffer(selfieImage[0].buffer, {
      folder: "verifications/identity",
      resource_type: "image",
      public_id: `selfie_${userId}_${Date.now()}`,
    });

    // Update verification record
    const verification = await getOrCreateVerification(userId);

    await verification.update({
      passportImageUrl: passportUpload.secure_url,
      selfieImageUrl: selfieUpload.secure_url,
      identityStatus: "under_review",
      identitySubmittedAt: new Date(),
      overallStatus:
        verification.addressStatus === "approved"
          ? "under_review"
          : "incomplete",
    });

    // Send to backoffice for review
    try {
      await sendToBackoffice({
        userId,
        type: "identity",
        passportUrl: passportUpload.secure_url,
        selfieUrl: selfieUpload.secure_url,
        verificationId: verification.id,
      });

      console.log("✅ Identity documents sent to backoffice successfully");
    } catch (backofficeError) {
      console.error("❌ Failed to send to backoffice:", backofficeError);
      // Continue anyway - documents are uploaded
    }

    res.json({
      success: true,
      message: "Identity documents uploaded successfully",
      status: "under_review",
      passportUrl: passportUpload.secure_url,
      selfieUrl: selfieUpload.secure_url,
    });
  } catch (error) {
    console.error("❌ Error uploading identity documents:", error);
    res.status(500).json({
      error: "Failed to upload identity documents",
      details: error.message,
    });
  }
};

// Upload address document
const uploadAddressDocument = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const { addressImage } = req.files || {};

    if (!addressImage) {
      return res.status(400).json({
        error: "Address document image is required",
      });
    }

    console.log("🏠 Uploading address document for user:", userId);

    // Upload image to Cloudinary
    const addressUpload = await cloudinary.uploadBuffer(
      addressImage[0].buffer,
      {
        folder: "verifications/address",
        resource_type: "image",
        public_id: `address_${userId}_${Date.now()}`,
      }
    );

    // Update verification record
    const verification = await getOrCreateVerification(userId);

    await verification.update({
      addressImageUrl: addressUpload.secure_url,
      addressStatus: "under_review",
      addressSubmittedAt: new Date(),
      overallStatus:
        verification.identityStatus === "approved"
          ? "under_review"
          : "incomplete",
    });

    // Send to backoffice for review
    try {
      await sendToBackoffice({
        userId,
        type: "address",
        addressUrl: addressUpload.secure_url,
        verificationId: verification.id,
      });

      console.log("✅ Address document sent to backoffice successfully");
    } catch (backofficeError) {
      console.error("❌ Failed to send to backoffice:", backofficeError);
      // Continue anyway - document is uploaded
    }

    res.json({
      success: true,
      message: "Address document uploaded successfully",
      status: "under_review",
      addressUrl: addressUpload.secure_url,
    });
  } catch (error) {
    console.error("❌ Error uploading address document:", error);
    res.status(500).json({
      error: "Failed to upload address document",
      details: error.message,
    });
  }
};

// Get verification status
const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.params.userId;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const verification = await Verification.findOne({
      where: { userId },
      // Removing the include for now to avoid association issues
    });

    if (!verification) {
      return res.json({
        userId: parseInt(userId),
        identityStatus: "pending",
        addressStatus: "pending",
        overallStatus: "incomplete",
        canProceed: true,
        nextStep: "identity",
      });
    }

    // Determine next step and if user can proceed
    let nextStep = null;
    let canProceed = false;

    if (
      verification.identityStatus === "pending" ||
      verification.identityStatus === "rejected"
    ) {
      nextStep = "identity";
      canProceed = true;
    } else if (
      verification.identityStatus === "approved" &&
      (verification.addressStatus === "pending" ||
        verification.addressStatus === "rejected")
    ) {
      nextStep = "address";
      canProceed = true;
    } else if (
      verification.identityStatus === "under_review" &&
      (verification.addressStatus === "pending" ||
        verification.addressStatus === "rejected")
    ) {
      // Allow proceeding to address verification even if identity is under review
      nextStep = "address";
      canProceed = true;
    } else if (
      verification.identityStatus === "under_review" &&
      verification.addressStatus === "under_review"
    ) {
      // Only disable when both are under review
      nextStep = "waiting_review";
      canProceed = false;
    } else if (verification.overallStatus === "verified") {
      nextStep = "completed";
      canProceed = false;
    } else {
      // Fallback case
      nextStep = "waiting_review";
      canProceed = false;
    }

    res.json({
      userId: verification.userId,
      identityStatus: verification.identityStatus,
      addressStatus: verification.addressStatus,
      overallStatus: verification.overallStatus,
      canProceed,
      nextStep,
      identitySubmittedAt: verification.identitySubmittedAt,
      addressSubmittedAt: verification.addressSubmittedAt,
      identityRejectionReason: verification.identityRejectionReason,
      addressRejectionReason: verification.addressRejectionReason,
    });
  } catch (error) {
    console.error("❌ Error getting verification status:", error);
    res.status(500).json({
      error: "Failed to get verification status",
      details: error.message,
    });
  }
};

// Backoffice webhook to update verification status
const updateVerificationStatus = async (req, res) => {
  try {
    const {
      verificationId,
      type, // 'identity' or 'address'
      status, // 'approved' or 'rejected'
      rejectionReason,
    } = req.body;

    if (!verificationId || !type || !status) {
      return res.status(400).json({
        error: "verificationId, type, and status are required",
      });
    }

    const verification = await Verification.findByPk(verificationId);

    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    console.log(
      `📋 Updating ${type} verification status to ${status} for verification ${verificationId}`
    );

    // Update specific verification type
    const updateData = {};

    if (type === "identity") {
      updateData.identityStatus = status;
      updateData.identityReviewedAt = new Date();
      if (status === "rejected") {
        updateData.identityRejectionReason = rejectionReason;
      }
    } else if (type === "address") {
      updateData.addressStatus = status;
      updateData.addressReviewedAt = new Date();
      if (status === "rejected") {
        updateData.addressRejectionReason = rejectionReason;
      }
    }

    // Update overall status
    if (status === "approved") {
      const otherType = type === "identity" ? "address" : "identity";
      const otherStatus =
        type === "identity"
          ? verification.addressStatus
          : verification.identityStatus;

      if (otherStatus === "approved") {
        updateData.overallStatus = "verified";
      } else {
        updateData.overallStatus = "under_review";
      }
    } else if (status === "rejected") {
      updateData.overallStatus = "rejected";
    }

    await verification.update(updateData);

    console.log(`✅ Verification status updated successfully`);

    res.json({
      success: true,
      message: "Verification status updated successfully",
      verification: {
        id: verification.id,
        identityStatus: verification.identityStatus,
        addressStatus: verification.addressStatus,
        overallStatus: updateData.overallStatus || verification.overallStatus,
      },
    });
  } catch (error) {
    console.error("❌ Error updating verification status:", error);
    res.status(500).json({
      error: "Failed to update verification status",
      details: error.message,
    });
  }
};

// Send documents to backoffice (mock implementation)
const sendToBackoffice = async (data) => {
  // This would be replaced with actual backoffice API integration
  console.log("📤 Sending to backoffice:", {
    type: data.type,
    userId: data.userId,
    verificationId: data.verificationId,
  });

  // Mock backoffice endpoint
  if (process.env.BACKOFFICE_WEBHOOK_URL) {
    try {
      await axios.post(process.env.BACKOFFICE_WEBHOOK_URL, {
        ...data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Backoffice API error:", error.message);
      throw error;
    }
  } else {
    console.log(
      "ℹ️  BACKOFFICE_WEBHOOK_URL not configured, skipping backoffice notification"
    );
  }
};

module.exports = {
  uploadIdentityDocuments,
  uploadAddressDocument,
  getVerificationStatus,
  updateVerificationStatus,
};
