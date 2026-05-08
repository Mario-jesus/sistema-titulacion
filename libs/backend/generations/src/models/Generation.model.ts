import mongoose, { Schema } from 'mongoose';

export interface IGeneration {
  _id: mongoose.Types.ObjectId;
  name: string | null;
  startYear: Date;
  endYear: Date;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const generationSchema = new Schema<IGeneration>(
  {
    name: {
      type: String,
      default: null,
      trim: true,
      sparse: true,
      unique: true,
    },
    startYear: {
      type: Date,
      required: true,
    },
    endYear: {
      type: Date,
      required: true,
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
        if (ret.startYear instanceof Date) {
          ret.startYear = ret.startYear.toISOString();
        }
        if (ret.endYear instanceof Date) {
          ret.endYear = ret.endYear.toISOString();
        }
      },
    },
  }
);

export const GenerationModel = mongoose.model<IGeneration>(
  'Generation',
  generationSchema
);
