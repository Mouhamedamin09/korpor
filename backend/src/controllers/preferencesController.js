const User = require('../models/User');
const { handleSuccess, handleError } = require('../utils/responseHandlers');

/**
 * Get user's investment preferences
 */
exports.getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'investmentPreference', 'investmentRegion']
    });
    
    if (!user) {
      return handleError(res, 'User not found', 404);
    }
    
    const response = {
      preference: user.investmentPreference,
      region: user.investmentRegion
    };
    
    return handleSuccess(res, response, 'User preferences retrieved successfully');
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return handleError(res, 'Failed to fetch user preferences', 500);
  }
};

/**
 * Update user's investment preference
 */
exports.setUserPreference = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preference } = req.body;
    
    // Validate preference value
    if (!preference || !['all', 'local'].includes(preference)) {
      return handleError(res, 'Invalid preference. Must be "all" or "local"', 400);
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return handleError(res, 'User not found', 404);
    }
    
    // Update the preference
    await user.update({
      investmentPreference: preference
    });
    
    const response = {
      preference: user.investmentPreference,
      region: user.investmentRegion
    };
    
    return handleSuccess(res, response, 'Investment preference updated successfully');
  } catch (error) {
    console.error('Error updating user preference:', error);
    return handleError(res, 'Failed to update user preference', 500);
  }
};

/**
 * Update user's investment region
 */
exports.setUserRegion = async (req, res) => {
  try {
    const userId = req.user.id;
    const { region } = req.body;
    
    // Validate region value
    if (!region || !['Tunisia', 'France'].includes(region)) {
      return handleError(res, 'Invalid region. Must be "Tunisia" or "France"', 400);
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return handleError(res, 'User not found', 404);
    }
    
    // Update the region
    await user.update({
      investmentRegion: region
    });
    
    const response = {
      preference: user.investmentPreference,
      region: user.investmentRegion
    };
    
    return handleSuccess(res, response, 'Investment region updated successfully');
  } catch (error) {
    console.error('Error updating user region:', error);
    return handleError(res, 'Failed to update user region', 500);
  }
}; 