import mongoose, { Schema } from 'mongoose';

export interface IRefreshToken {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User',
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const RefreshTokenModel = mongoose.model<IRefreshToken>(
  'RefreshToken',
  refreshTokenSchema
);
