import mongoose from 'mongoose';

let mongoMemoryServerInstance = null;

/**
 * Connect to MongoDB with automatic fallback to in-memory MongoDB
 * if no MONGO_URI is specified or connection is unreachable.
 */
export const connectDB = async () => {
  let uri = process.env.MONGO_URI;

  try {
    if (!uri) {
      console.log('ℹ️ No MONGO_URI provided in environment. Initializing embedded in-memory MongoDB...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServerInstance = await MongoMemoryServer.create();
      uri = mongoMemoryServerInstance.getUri();
      console.log(`✅ In-memory MongoDB initialized at: ${uri}`);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🚀 MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Failed to connect to ${uri || 'configured MongoDB'}: ${error.message}`);
    
    // Fallback if configured URI failed
    if (!mongoMemoryServerInstance) {
      console.log('🔄 Attempting fallback to embedded in-memory MongoDB for development...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoMemoryServerInstance = await MongoMemoryServer.create();
        const fallbackUri = mongoMemoryServerInstance.getUri();
        const conn = await mongoose.connect(fallbackUri);
        console.log(`✅ In-memory MongoDB connected as fallback at: ${fallbackUri}`);
        return conn;
      } catch (fallbackError) {
        console.error('❌ Could not start in-memory MongoDB fallback:', fallbackError.message);
        throw fallbackError;
      }
    }

    throw error;
  }
};

/**
 * Disconnect from MongoDB and stop memory server if running
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
    }
    console.log('🛑 MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('Error during MongoDB disconnect:', err.message);
  }
};
