import mongoose, { Schema } from 'mongoose';

export const BACKUP_STATUS = [
  'AVAILABLE',
  'IN_PROGRESS',
  'FAILED',
  'UNAVAILABLE',
] as const;
export type BackupStatus = (typeof BACKUP_STATUS)[number];

export interface IBackup {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  status: BackupStatus;
  size: number;
  tablesCount: number;
  recordsCount: number;
  completedAt: Date | null;
  createdBy: string;
  filePath: string | null;
  checksum: string | null;
  iv: string | null;
  authTag: string | null;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const backupSchema = new Schema<IBackup>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    status: {
      type: String,
      default: 'IN_PROGRESS',
      enum: BACKUP_STATUS,
    },
    size: { type: Number, default: 0 },
    tablesCount: { type: Number, default: 0 },
    recordsCount: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
    createdBy: { type: String, required: true },
    filePath: { type: String, default: null },
    checksum: { type: String, default: null },
    iv: { type: String, default: null },
    authTag: { type: String, default: null },
    errorMessage: { type: String, default: null },
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

export const BackupModel = mongoose.model<IBackup>('Backup', backupSchema);
