import mongoose, { Schema } from 'mongoose';

export interface ICareer {
  _id: mongoose.Types.ObjectId;
  name: string;
  shortName: string;
  modalityId: mongoose.Types.ObjectId;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const careerSchema = new Schema<ICareer>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
    },
    modalityId: {
      type: Schema.Types.ObjectId,
      ref: 'Modality',
      required: true,
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

export const CareerModel = mongoose.model<ICareer>('Career', careerSchema);
