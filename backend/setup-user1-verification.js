require('dotenv').config();
const { User, Verification } = require('./src/models');

async function setupUser1Verification() {
  try {
    console.log('🔄 Setting up verification record for user ID 1 (admin kraiem)...');
    
    // Find user 1
    const user = await User.findByPk(1);
    if (!user) {
      console.error('❌ User with ID 1 not found');
      return;
    }
    
    console.log(`✅ Found user: ${user.name || user.email}`);
    
    // Check if verification record already exists
    let verification = await Verification.findOne({ where: { userId: 1 } });
    
    if (verification) {
      console.log('📋 Verification record already exists, updating...');
      
      await verification.update({
        identityStatus: 'pending',
        addressStatus: 'pending',
        overallStatus: 'incomplete',
        passportImageUrl: null,
        selfieImageUrl: null,
        addressImageUrl: null,
        identitySubmittedAt: null,
        addressSubmittedAt: null,
        identityReviewedAt: null,
        addressReviewedAt: null,
        identityRejectionReason: null,
        addressRejectionReason: null,
        backofficeRequestId: null
      });
      
      console.log('✅ Verification record updated successfully');
    } else {
      console.log('📋 Creating new verification record...');
      
      verification = await Verification.create({
        userId: 1,
        identityStatus: 'pending',
        addressStatus: 'pending',
        overallStatus: 'incomplete'
      });
      
      console.log('✅ Verification record created successfully');
    }
    
    // Display the current status
    console.log('\n📊 Current verification status for user 1:');
    console.log(`- Identity Status: ${verification.identityStatus}`);
    console.log(`- Address Status: ${verification.addressStatus}`);
    console.log(`- Overall Status: ${verification.overallStatus}`);
    console.log('- Progress: 2/4 (Account setup complete, verification pending)');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up verification:', error);
    process.exit(1);
  }
}

setupUser1Verification(); 