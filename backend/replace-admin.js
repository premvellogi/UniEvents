require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const replaceAdmin = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB...');

    // Remove old admin account(s)
    const deleted = await User.deleteMany({ role: 'admin' });
    console.log(`🗑️  Removed ${deleted.deletedCount} existing admin account(s)`);

    // Create new admin
    const newAdmin = await User.create({
        name: 'Prem Vellogi',
        email: 'premvellogi@gmail.com',
        password: 'PremVellogi@17',
        role: 'admin',
        department: '',
    });

    console.log(`✅ New admin created:`);
    console.log(`   Email   : ${newAdmin.email}`);
    console.log(`   Name    : ${newAdmin.name}`);
    console.log(`   Role    : ${newAdmin.role}`);
    console.log(`   ID      : ${newAdmin._id}`);

    await mongoose.disconnect();
    console.log('✅ Done! Admin migration complete.');
};

replaceAdmin().catch((err) => {
    console.error('❌ Migration error:', err);
    process.exit(1);
});
