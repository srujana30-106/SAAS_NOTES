const mongoose = require('mongoose');
require('dotenv').config();

const connectAndReset = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saas-notes';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    // Get the database name from the connection
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Current database: ${dbName}`);

    // Drop the entire database
    await mongoose.connection.db.dropDatabase();
    console.log(`Database '${dbName}' dropped successfully`);

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    // Reconnect to create a fresh database
    await mongoose.connect(mongoURI);
    console.log('Reconnected to create fresh database');

    // Disconnect again
    await mongoose.disconnect();
    console.log('Fresh database created successfully');

  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
};

connectAndReset();
