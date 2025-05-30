const User = require('../models/User');

// Get user's investment data
exports.getUserInvestmentData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'currency', 'investmentTotal', 'investmentUsedPct']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate user's investment data
    const totalInvested = parseFloat(user.investmentTotal) || 0;
    const usedPct = parseFloat(user.investmentUsedPct) || 0;
    
    // Estimate monthly contribution (this could be from actual investment history)
    const estimatedMonthlyContribution = Math.round(totalInvested / 12); // Assume 1 year of investments
    
    // Default yield rates based on currency
    const yieldRates = {
      TND: 6.5,
      EUR: 5.8
    };
    
    const averageYield = yieldRates[user.currency] || 6.0;
    
    // Calculate projected returns
    const projectedReturns = {
      year1: Math.round(totalInvested * 1.065),
      year5: Math.round(totalInvested * Math.pow(1.065, 5)),
      year10: Math.round(totalInvested * Math.pow(1.065, 10)),
      year15: Math.round(totalInvested * Math.pow(1.065, 15))
    };
    
    res.json({
      success: true,
      data: {
        currency: user.currency,
        totalInvested,
        monthlyContribution: estimatedMonthlyContribution > 0 ? estimatedMonthlyContribution : 6000,
        averageYield,
        projectedReturns
      }
    });
    
  } catch (error) {
    console.error('Error fetching user investment data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment data'
    });
  }
};

// Calculate investment projection
exports.calculateProjection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { monthlyDeposit, years, yieldPct } = req.body;
    
    if (!monthlyDeposit || !years || !yieldPct) {
      return res.status(400).json({
        success: false,
        message: 'Monthly deposit, years, and yield percentage are required'
      });
    }
    
    const user = await User.findByPk(userId, {
      attributes: ['currency']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate projections for each year
    const projections = [];
    
    for (let year = 0; year <= years; year++) {
      const totalDeposited = monthlyDeposit * 12 * year;
      
      // Compound interest calculation: FV = PMT × [((1 + r)^n - 1) / r]
      let futureValue = 0;
      if (year > 0) {
        const monthlyRate = yieldPct / 100 / 12;
        const months = year * 12;
        futureValue = monthlyDeposit * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;
      }
      
      const totalValue = Math.round(futureValue);
      const monthlyIncome = Math.round((totalValue * (yieldPct / 100)) / 12);
      const totalReturns = totalValue - totalDeposited;
      
      projections.push({
        year,
        totalValue,
        monthlyIncome,
        totalDeposited,
        totalReturns
      });
    }
    
    res.json({
      success: true,
      data: {
        years,
        monthlyDeposit,
        yieldPct,
        currency: user.currency,
        projections
      }
    });
    
  } catch (error) {
    console.error('Error calculating projection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate projection'
    });
  }
}; 