import mongoose, { Schema } from 'mongoose';

export interface ICapturedFields {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  processDate: Date;
  projectName: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
}

const capturedFieldsSchema = new Schema<ICapturedFields>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
    },
    processDate: { type: Date, required: true },
    projectName: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
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

export const CapturedFieldsModel = mongoose.model<ICapturedFields>(
  'CapturedFields',
  capturedFieldsSchema
);
