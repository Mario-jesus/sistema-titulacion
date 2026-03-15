import type { Model } from 'mongoose';
import type { IRefreshToken } from './models/RefreshToken.model.js';

const TTL_INDEX_NAME = 'createdAt_1_ttl';

/**
 * Ensures the RefreshToken collection has a TTL index on `createdAt`.
 * MongoDB will automatically delete documents when createdAt + expireAfterSeconds is in the past.
 *
 * Call this once after connecting to the database (e.g. on server startup).
 * Use a value >= refresh token expiry (e.g. JWT_REFRESH_EXPIRES + 1 day buffer).
 *
 * @param refreshTokenModel - The RefreshToken Mongoose model
 * @param expireAfterSeconds - Seconds after createdAt when the document should be deleted (e.g. 604800 for 7 days)
 */
export async function ensureRefreshTokenTTLIndex(
  refreshTokenModel: Model<IRefreshToken>,
  expireAfterSeconds: number
): Promise<void> {
  const coll = refreshTokenModel.collection;
  const indexes = await coll.indexes();

  const hasTTL = indexes.some(
    (idx) => idx.name === TTL_INDEX_NAME || idx.expireAfterSeconds != null
  );

  if (hasTTL) {
    return;
  }

  await coll.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds, name: TTL_INDEX_NAME }
  );
}
