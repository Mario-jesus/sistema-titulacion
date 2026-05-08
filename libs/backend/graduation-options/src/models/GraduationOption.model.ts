import mongoose, { Schema } from 'mongoose';

export interface IGraduationOption {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const graduationOptionSchema = new Schema<IGraduationOption>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = (ret._id as { toString: () => string }).toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const GraduationOptionModel = mongoose.model<IGraduationOption>(
  'GraduationOption',
  graduationOptionSchema
);
