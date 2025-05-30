const User = require('./src/models/User');
const { sequelize } = require('./src/config/db.config');

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'isVerified'],
      limit: 5
    });
    
    console.log(`📊 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}, Verified: ${user.isVerified}`);
    });
    
    if (users.length === 0) {
      console.log('⚠️ No users found in database. You may need to create a test user first.');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkUsers(); 