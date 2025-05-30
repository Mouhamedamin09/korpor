const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const User = require('../models/User');
const { handleSuccess, handleError } = require('../utils/responseHandlers');

/**
 * Generate backup codes for 2FA recovery
 * @returns {Array} Array of backup codes
 */
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    // Generate 8-character alphanumeric codes
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

/**
 * Setup 2FA - Generate secret and QR code
 */
exports.setup2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔍 Setting up 2FA for user ID:', userId);
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'name', 'twoFactorEnabled', 'twoFactorSecret']
    });
    
    if (!user) {
      console.error('❌ User not found with ID:', userId);
      return handleError(res, 'User not found', 404);
    }

    console.log('👤 Found user:', { id: user.id, email: user.email, name: user.name });

    // Check if 2FA is already enabled
    if (user.twoFactorEnabled) {
      console.log('⚠️ 2FA already enabled for user:', user.email);
      return handleError(res, '2FA is already enabled for this account', 400);
    }

    // Ensure we have a valid email
    if (!user.email) {
      console.error('❌ User email is missing for user ID:', userId);
      return handleError(res, 'User email not found', 400);
    }

    console.log('🔑 Generating secret for user:', user.email);

    // Generate a new secret
    const secret = speakeasy.generateSecret({
      name: `Korpor (${user.email})`,
      issuer: 'Korpor',
      length: 32,
    });

    console.log('📱 Generated secret name:', `Korpor (${user.email})`);

    // Create otpauth URL for QR code
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: `Korpor:${user.email}`,
      issuer: 'Korpor',
      encoding: 'ascii',
    });

    console.log('🔗 Generated otpauth URL label:', `Korpor:${user.email}`);
    console.log('🔗 Full otpauth URL:', otpauthUrl);

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl);

    // Temporarily store the secret (not yet enabled)
    await user.update({
      twoFactorSecret: secret.base32,
    });

    console.log('✅ 2FA setup completed for user:', user.email);

    return handleSuccess(res, {
      secret: secret.base32,
      otpauthUrl: otpauthUrl,
      qrCode: qrCodeDataURL,
      manualEntryKey: secret.base32,
    }, '2FA setup initialized successfully');

  } catch (error) {
    console.error('❌ Error setting up 2FA:', error);
    return handleError(res, 'Failed to setup 2FA', 500);
  }
};

/**
 * Verify and enable 2FA
 */
exports.verify2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return handleError(res, 'Verification token is required', 400);
    }

    // Validate token format (6 digits)
    if (!/^\d{6}$/.test(token)) {
      return handleError(res, 'Invalid token format. Please enter a 6-digit code', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return handleError(res, 'User not found', 404);
    }

    if (!user.twoFactorSecret) {
      return handleError(res, 'No 2FA setup found. Please setup 2FA first', 400);
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time steps before/after current time (60 seconds tolerance)
    });

    if (!verified) {
      return handleError(res, 'Invalid verification code', 400);
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Enable 2FA
    await user.update({
      twoFactorEnabled: true,
      backupCodes: backupCodes,
      twoFactorSetupAt: new Date(),
    });

    return handleSuccess(res, {
      message: '2FA enabled successfully',
      backupCodes: backupCodes,
    }, '2FA has been enabled successfully');

  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return handleError(res, 'Failed to verify 2FA', 500);
  }
};

/**
 * Disable 2FA
 */
exports.disable2FA = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password, token } = req.body;

    if (!password) {
      return handleError(res, 'Password is required to disable 2FA', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return handleError(res, 'User not found', 404);
    }

    if (!user.twoFactorEnabled) {
      return handleError(res, '2FA is not enabled for this account', 400);
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return handleError(res, 'Invalid password', 401);
    }

    // If 2FA is enabled, also verify the token
    if (token) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2,
      });

      if (!verified) {
        return handleError(res, 'Invalid 2FA token', 400);
      }
    }

    // Disable 2FA
    await user.update({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: null,
      twoFactorSetupAt: null,
    });

    return handleSuccess(res, {
      message: '2FA disabled successfully',
    }, '2FA has been disabled');

  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return handleError(res, 'Failed to disable 2FA', 500);
  }
};

/**
 * Verify 2FA token during login
 */
exports.verifyLogin2FA = async (req, res) => {
  try {
    const { userId, token, backupCode } = req.body;

    if (!userId) {
      return handleError(res, 'User ID is required', 400);
    }

    if (!token && !backupCode) {
      return handleError(res, 'Either token or backup code is required', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return handleError(res, 'User not found', 404);
    }

    if (!user.twoFactorEnabled) {
      return handleError(res, '2FA is not enabled for this account', 400);
    }

    let verified = false;

    // Check backup code first
    if (backupCode) {
      if (user.backupCodes && user.backupCodes.includes(backupCode.toUpperCase())) {
        // Remove used backup code
        const updatedCodes = user.backupCodes.filter(code => code !== backupCode.toUpperCase());
        await user.update({ backupCodes: updatedCodes });
        verified = true;
      }
    } else if (token) {
      // Verify TOTP token
      verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2,
      });
    }

    if (!verified) {
      return handleError(res, 'Invalid verification code or backup code', 400);
    }

    return handleSuccess(res, {
      verified: true,
      message: '2FA verification successful',
    }, '2FA verification completed');

  } catch (error) {
    console.error('Error verifying login 2FA:', error);
    return handleError(res, 'Failed to verify 2FA', 500);
  }
};

/**
 * Get 2FA status for user
 */
exports.get2FAStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'email', 'twoFactorEnabled', 'twoFactorSetupAt', 'backupCodes']
    });

    if (!user) {
      return handleError(res, 'User not found', 404);
    }

    return handleSuccess(res, {
      enabled: user.twoFactorEnabled,
      setupAt: user.twoFactorSetupAt,
      backupCodesRemaining: user.backupCodes ? user.backupCodes.length : 0,
    }, '2FA status retrieved successfully');

  } catch (error) {
    console.error('Error getting 2FA status:', error);
    return handleError(res, 'Failed to get 2FA status', 500);
  }
};

/**
 * Regenerate backup codes
 */
exports.regenerateBackupCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return handleError(res, 'Password is required', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return handleError(res, 'User not found', 404);
    }

    if (!user.twoFactorEnabled) {
      return handleError(res, '2FA is not enabled for this account', 400);
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return handleError(res, 'Invalid password', 401);
    }

    // Generate new backup codes
    const newBackupCodes = generateBackupCodes();

    await user.update({
      backupCodes: newBackupCodes,
    });

    return handleSuccess(res, {
      backupCodes: newBackupCodes,
    }, 'Backup codes regenerated successfully');

  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    return handleError(res, 'Failed to regenerate backup codes', 500);
  }
}; 