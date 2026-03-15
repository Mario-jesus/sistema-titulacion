import mongoose, { Schema } from 'mongoose';

export interface INewAdmission {
  _id: mongoose.Types.ObjectId;
  generationId: mongoose.Types.ObjectId;
  careerId: mongoose.Types.ObjectId;
  maleCount: number;
  femaleCount: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const newAdmissionSchema = new Schema<INewAdmission>(
  {
    generationId: {
      type: Schema.Types.ObjectId,
      ref: 'Generation',
      required: true,
    },
    careerId: {
      type: Schema.Types.ObjectId,
      ref: 'Career',
      required: true,
    },
    maleCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    femaleCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      default: null,
      trim: true,
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

newAdmissionSchema.index({ careerId: 1, generationId: 1 }, { unique: true });

export const NewAdmissionModel = mongoose.model<INewAdmission>(
  'NewAdmission',
  newAdmissionSchema
);
