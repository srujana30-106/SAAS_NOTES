const mongoose = require('mongoose');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-notes';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const initializeData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Tenant.deleteMany({});
    await User.deleteMany({});

    console.log('Cleared existing data');

    // Create tenants
    const acmeTenant = new Tenant({
      name: 'Acme Corporation',
      slug: 'acme',
      subscription: 'free',
      noteLimit: 3
    });

    const globexTenant = new Tenant({
      name: 'Globex Corporation',
      slug: 'globex',
      subscription: 'free',
      noteLimit: 3
    });

    await acmeTenant.save();
    await globexTenant.save();

    console.log('Created tenants');

    // Create users
    const users = [
      {
        email: 'admin@acme.test',
        password: 'password',
        role: 'admin',
        tenantId: acmeTenant._id
      },
      {
        email: 'user@acme.test',
        password: 'password',
        role: 'member',
        tenantId: acmeTenant._id
      },
      {
        email: 'admin@globex.test',
        password: 'password',
        role: 'admin',
        tenantId: globexTenant._id
      },
      {
        email: 'user@globex.test',
        password: 'password',
        role: 'member',
        tenantId: globexTenant._id
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    console.log('Created test users');

    // Create some sample notes for testing
    const Note = require('../models/Note');
    
    const sampleNotes = [
      {
        title: 'Welcome to Acme Notes',
        content: 'This is your first note in the Acme tenant. You can create up to 3 notes on the free plan.',
        tags: ['welcome', 'getting-started'],
        tenantId: acmeTenant._id,
        createdBy: (await User.findOne({ email: 'admin@acme.test' }))._id
      },
      {
        title: 'Project Ideas',
        content: 'Brainstorming ideas for our next project. Need to think about scalability and user experience.',
        tags: ['project', 'ideas'],
        tenantId: acmeTenant._id,
        createdBy: (await User.findOne({ email: 'user@acme.test' }))._id
      },
      {
        title: 'Globex Corporation Notes',
        content: 'Welcome to Globex Corporation notes system. This is a separate tenant from Acme.',
        tags: ['welcome', 'globex'],
        tenantId: globexTenant._id,
        createdBy: (await User.findOne({ email: 'admin@globex.test' }))._id
      }
    ];

    for (const noteData of sampleNotes) {
      const note = new Note(noteData);
      await note.save();
    }

    console.log('Created sample notes');

    console.log('\n=== Initialization Complete ===');
    console.log('Test Accounts Created:');
    console.log('- admin@acme.test (Admin, Acme)');
    console.log('- user@acme.test (Member, Acme)');
    console.log('- admin@globex.test (Admin, Globex)');
    console.log('- user@globex.test (Member, Globex)');
    console.log('All passwords: password');
    console.log('\nTenants:');
    console.log('- Acme (slug: acme)');
    console.log('- Globex (slug: globex)');
    console.log('Both on Free plan (3 note limit)');

    process.exit(0);
  } catch (error) {
    console.error('Initialization error:', error);
    process.exit(1);
  }
};

initializeData();
