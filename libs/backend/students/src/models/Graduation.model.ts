import mongoose, { Schema } from 'mongoose';

export interface IGraduation {
  _id: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  graduationOptionId: mongoose.Types.ObjectId | null;
  graduationDate: Date | null;
  scheduledDate: Date | null;
  president: string;
  secretary: string;
  vocal: string;
  substituteVocal: string;
  notes: string | null;
  idCardNumber: string | null;
  idCardIssueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const graduationSchema = new Schema<IGraduation>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
    },
    graduationOptionId: {
      type: Schema.Types.ObjectId,
      ref: 'GraduationOption',
      default: null,
    },
    graduationDate: { type: Date, default: null },
    scheduledDate: { type: Date, default: null },
    president: { type: String, default: '' },
    secretary: { type: String, default: '' },
    vocal: { type: String, default: '' },
    substituteVocal: { type: String, default: '' },
    notes: { type: String, default: null },
    idCardNumber: { type: String, default: null },
    idCardIssueDate: { type: Date, default: null },
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

export const GraduationModel = mongoose.model<IGraduation>(
  'Graduation',
  graduationSchema
);
