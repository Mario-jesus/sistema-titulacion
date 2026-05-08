import mongoose, { type Model } from 'mongoose';
import type { IRefreshToken } from './models/RefreshToken.model.js';

/**
 * Store for refresh tokens (userId -> token).
 * Used for token rotation: only the latest refresh token per user is valid.
 */
export interface RefreshTokenStore {
  set(userId: string, token: string): Promise<void>;
  get(userId: string): Promise<string | undefined>;
  delete(userId: string): Promise<boolean>;
  has(userId: string, token: string): Promise<boolean>;
}

/**
 * In-memory store. Tokens are lost on restart.
 * Use for development or testing.
 */
export function createInMemoryRefreshTokenStore(): RefreshTokenStore {
  const store = new Map<string, string>();

  return {
    async set(userId: string, token: string): Promise<void> {
      store.set(userId, token);
    },
    async get(userId: string): Promise<string | undefined> {
      return store.get(userId);
    },
    async delete(userId: string): Promise<boolean> {
      return store.delete(userId);
    },
    async has(userId: string, token: string): Promise<boolean> {
      return store.get(userId) === token;
    },
  };
}

function toObjectId(userId: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(userId);
}

/**
 * MongoDB store. Persists refresh tokens across restarts.
 */
export function createMongoRefreshTokenStore(
  refreshTokenModel: Model<IRefreshToken>
): RefreshTokenStore {
  return {
    async set(userId: string, token: string): Promise<void> {
      await refreshTokenModel
        .findOneAndUpdate(
          { userId: toObjectId(userId) },
          { $set: { token, createdAt: new Date() } },
          { upsert: true, new: true }
        )
        .exec();
    },
    async get(userId: string): Promise<string | undefined> {
      const doc = await refreshTokenModel
        .findOne({ userId: toObjectId(userId) })
        .lean()
        .exec();
      return doc?.token;
    },
    async delete(userId: string): Promise<boolean> {
      const result = await refreshTokenModel
        .deleteOne({ userId: toObjectId(userId) })
        .exec();
      return (result.deletedCount ?? 0) > 0;
    },
    async has(userId: string, token: string): Promise<boolean> {
      const doc = await refreshTokenModel
        .findOne({ userId: toObjectId(userId) })
        .lean()
        .exec();
      return doc?.token === token;
    },
  };
}
