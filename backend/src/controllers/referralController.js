const User = require('../models/User');
const Referral = require('../models/Referral');
const crypto = require('crypto');

// Generate unique referral code
const generateReferralCode = async () => {
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate a random 7-character lowercase code (like 2d5fe81)
    code = crypto.randomBytes(4).toString('hex').substring(0, 5).toLowerCase();
    
    // Check if it's unique
    const existingUser = await User.findOne({ where: { referralCode: code } });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return code;
};

// Get referral info for authenticated user
exports.getReferralInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'currency', 'referralCode', 'referralStats']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate referral code ONLY if user doesn't have one (one-time generation)
    if (!user.referralCode) {
      const newCode = await generateReferralCode();
      await user.update({ referralCode: newCode });
      user.referralCode = newCode;
    }
    
    // Get referral statistics
    const referralStats = await Referral.findAll({
      where: { referrerId: userId },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalReferred'],
        [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN status = 'qualified' OR status = 'rewarded' THEN 1 END")), 'totalInvested']
      ],
      raw: true
    });
    
    const stats = referralStats[0] || { totalReferred: 0, totalInvested: 0 };
    
    // Referral amounts based on currency
    const referralAmounts = {
      TND: { referralAmount: 125, minInvestment: 2000 },
      EUR: { referralAmount: 50, minInvestment: 800 }
    };
    
    const amounts = referralAmounts[user.currency];
    
    res.json({
      success: true,
      data: {
        userId: user.id.toString(),
        currency: user.currency,
        code: user.referralCode,
        referralAmount: amounts.referralAmount,
        minInvestment: amounts.minInvestment,
        stats: {
          totalReferred: parseInt(stats.totalReferred) || 0,
          totalInvested: parseInt(stats.totalInvested) || 0
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching referral info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral information'
    });
  }
};

// Get user's permanent referral code (replaces generate new code)
exports.getReferralCode = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'referralCode']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate code if user doesn't have one (one-time generation)
    if (!user.referralCode) {
      const newCode = await generateReferralCode();
      await user.update({ referralCode: newCode });
      user.referralCode = newCode;
    }
    
    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        shareLink: user.referralCode
      }
    });
    
  } catch (error) {
    console.error('Error getting referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral code'
    });
  }
};

// Switch user currency preference
exports.switchCurrency = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currency } = req.body;
    
    if (!currency || !['TND', 'EUR'].includes(currency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid currency. Must be TND or EUR'
      });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await user.update({ currency });
    
    // Get updated referral info
    const referralAmounts = {
      TND: { referralAmount: 25, minInvestment: 2000 },
      EUR: { referralAmount: 10, minInvestment: 800 }
    };
    
    const amounts = referralAmounts[currency];
    
    res.json({
      success: true,
      message: `Currency switched to ${currency}`,
      data: {
        currency,
        referralAmount: amounts.referralAmount,
        minInvestment: amounts.minInvestment
      }
    });
    
  } catch (error) {
    console.error('Error switching currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to switch currency'
    });
  }
};

// Get user's currency preference
exports.getUserCurrency = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['currency']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        currency: user.currency
      }
    });
    
  } catch (error) {
    console.error('Error fetching user currency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user currency'
    });
  }
};

// Process referral signup (for later implementation)
exports.processReferralSignup = async (req, res) => {
  try {
    const { referralCode, newUserId } = req.body;
    
    if (!referralCode || !newUserId) {
      return res.status(400).json({
        success: false,
        message: 'Referral code and new user ID are required'
      });
    }
    
    // Find referrer by code
    const referrer = await User.findOne({ 
      where: { referralCode },
      attributes: ['id', 'currency']
    });
    
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }
    
    // Check if referral already exists
    const existingReferral = await Referral.findOne({
      where: { 
        referrerId: referrer.id,
        refereeId: newUserId
      }
    });
    
    if (existingReferral) {
      return res.status(409).json({
        success: false,
        message: 'Referral already exists'
      });
    }
    
    // Create new referral record
    const referralAmounts = {
      TND: { referrerReward: 25, refereeReward: 25 },
      EUR: { referrerReward: 10, refereeReward: 10 }
    };
    
    const amounts = referralAmounts[referrer.currency];
    
    const referral = await Referral.create({
      referrerId: referrer.id,
      refereeId: newUserId,
      currency: referrer.currency,
      referrerReward: amounts.referrerReward,
      refereeReward: amounts.refereeReward,
      status: 'pending'
    });
    
    // Update referred user
    await User.update(
      { referredBy: referrer.id },
      { where: { id: newUserId } }
    );
    
    res.json({
      success: true,
      message: 'Referral processed successfully',
      data: {
        referralId: referral.id,
        reward: amounts.refereeReward,
        currency: referrer.currency
      }
    });
    
  } catch (error) {
    console.error('Error processing referral signup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process referral signup'
    });
  }
}; 