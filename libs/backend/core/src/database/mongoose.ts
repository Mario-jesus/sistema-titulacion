import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../logger/logger.js';

export const connectToDatabase = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);
  logger.info({ uri: env.MONGODB_URI }, 'MongoDB connection established');
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
  logger.info('MongoDB connection closed');
};
