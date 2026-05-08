import mongoose, { Schema } from 'mongoose';

export const STUDENT_STATUS = ['ACTIVO', 'PAUSADO', 'CANCELADO'] as const;
export type StudentStatus = (typeof STUDENT_STATUS)[number];

export const PROCESS_STATUS = [
  'NOT_STARTED',
  'IN_PROCESS',
  'SCHEDULED',
  'GRADUATED',
] as const;
export type ProcessStatus = (typeof PROCESS_STATUS)[number];

export const SEX_VALUES = ['MASCULINO', 'FEMENINO'] as const;
export type Sex = (typeof SEX_VALUES)[number];

export interface IStudent {
  _id: mongoose.Types.ObjectId;
  careerId: mongoose.Types.ObjectId;
  generationId: mongoose.Types.ObjectId;
  controlNumber: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  phoneNumber: string;
  email: string;
  birthDate: Date;
  sex: Sex;
  isEgressed: boolean;
  status: StudentStatus;
  processStatus: ProcessStatus;
  hasIdCard: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    careerId: {
      type: Schema.Types.ObjectId,
      ref: 'Career',
      required: true,
    },
    generationId: {
      type: Schema.Types.ObjectId,
      ref: 'Generation',
      required: true,
    },
    controlNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: { type: String, required: true, trim: true },
    paternalLastName: { type: String, required: true, trim: true },
    maternalLastName: { type: String, default: '', trim: true },
    phoneNumber: { type: String, default: '', trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    birthDate: { type: Date, required: true },
    sex: {
      type: String,
      required: true,
      enum: SEX_VALUES,
    },
    isEgressed: { type: Boolean, default: false },
    status: {
      type: String,
      default: 'ACTIVO',
      enum: STUDENT_STATUS,
    },
    processStatus: {
      type: String,
      default: 'NOT_STARTED',
      enum: PROCESS_STATUS,
    },
    hasIdCard: { type: Boolean, default: false },
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

export const StudentModel = mongoose.model<IStudent>('Student', studentSchema);
