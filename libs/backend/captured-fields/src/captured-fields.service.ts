import type { Model } from 'mongoose';
import mongoose from 'mongoose';
import { AppError } from '@backend/shared';
import type { IStudent } from '@backend/students';
import type { ICapturedFields } from '@backend/students';
import type {
  CreateCapturedFieldsInput,
  UpdateCapturedFieldsInput,
} from './schemas/captured-fields.schemas.js';

export interface CapturedFieldsPublic {
  id: string;
  studentId: string;
  processDate: string;
  projectName: string;
  company: string;
  createdAt: string;
  updatedAt: string;
}

function isMongoDuplicateKey(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  );
}

export class CapturedFieldsService {
  constructor(
    private readonly studentModel: Model<IStudent>,
    private readonly capturedFieldsModel: Model<ICapturedFields>
  ) {}

  private toPublic(doc: ICapturedFields): CapturedFieldsPublic {
    const d = doc as ICapturedFields & { id?: string };
    const id = d.id ?? d._id.toString();
    const sid = d.studentId as mongoose.Types.ObjectId | string;
    const studentId = typeof sid === 'string' ? sid : sid.toString();
    const processDate =
      d.processDate instanceof Date ? d.processDate : new Date(d.processDate);
    const createdAt =
      d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt);
    const updatedAt =
      d.updatedAt instanceof Date ? d.updatedAt : new Date(d.updatedAt);
    return {
      id,
      studentId,
      processDate: processDate.toISOString().slice(0, 10),
      projectName: d.projectName,
      company: d.company,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }

  private async loadStudentOrThrow(studentId: string): Promise<IStudent> {
    const student = await this.studentModel.findById(studentId);
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado');
    }
    return student;
  }

  private assertStudentActiveForCapture(student: IStudent): void {
    if (student.status !== 'ACTIVO') {
      throw new AppError(
        400,
        'INVALID_STUDENT_STATUS',
        'Solo se pueden capturar campos para estudiantes activos (no pausados ni cancelados)'
      );
    }
  }

  private assertStudentActiveForUpdate(student: IStudent): void {
    if (student.status !== 'ACTIVO') {
      throw new AppError(
        400,
        'INVALID_STUDENT_STATUS',
        'Solo se pueden modificar campos capturados para estudiantes activos (no pausados ni cancelados)'
      );
    }
  }

  async getByStudentId(studentId: string): Promise<CapturedFieldsPublic> {
    const doc = await this.capturedFieldsModel.findOne({ studentId });
    if (!doc) {
      throw new AppError(
        404,
        'CAPTURED_FIELDS_NOT_FOUND',
        'Campos capturados no encontrados'
      );
    }
    return this.toPublic(doc);
  }

  async create(
    input: CreateCapturedFieldsInput
  ): Promise<CapturedFieldsPublic> {
    const student = await this.loadStudentOrThrow(input.studentId);
    this.assertStudentActiveForCapture(student);

    try {
      const doc = await this.capturedFieldsModel.create({
        studentId: new mongoose.Types.ObjectId(input.studentId),
        processDate: new Date(input.processDate),
        projectName: input.projectName.trim(),
        company: input.company.trim(),
      });
      return this.toPublic(doc);
    } catch (err) {
      if (isMongoDuplicateKey(err)) {
        throw new AppError(
          409,
          'DUPLICATE_ERROR',
          'Ya existe un registro de campos capturados para este estudiante'
        );
      }
      throw err;
    }
  }

  private async assertNoDuplicateForReassign(
    newStudentId: string,
    excludeDocId: mongoose.Types.ObjectId
  ): Promise<void> {
    const clash = await this.capturedFieldsModel.findOne({
      studentId: newStudentId,
    });
    if (clash && clash._id.toString() !== excludeDocId.toString()) {
      throw new AppError(
        409,
        'DUPLICATE_ERROR',
        'Ya existe un registro de campos capturados para este estudiante'
      );
    }
  }

  async updatePut(
    pathStudentId: string,
    input: UpdateCapturedFieldsInput
  ): Promise<CapturedFieldsPublic> {
    const existing = await this.capturedFieldsModel.findOne({
      studentId: pathStudentId,
    });
    if (!existing) {
      throw new AppError(
        404,
        'CAPTURED_FIELDS_NOT_FOUND',
        'Campos capturados no encontrados'
      );
    }

    const nextStudentId =
      input.studentId !== undefined
        ? input.studentId
        : existing.studentId.toString();

    const student = await this.loadStudentOrThrow(nextStudentId);
    this.assertStudentActiveForUpdate(student);

    if (
      input.studentId !== undefined &&
      input.studentId !== existing.studentId.toString()
    ) {
      await this.assertNoDuplicateForReassign(
        input.studentId,
        existing._id as mongoose.Types.ObjectId
      );
    }

    if (input.studentId !== undefined) {
      existing.set('studentId', new mongoose.Types.ObjectId(input.studentId));
    }
    if (input.processDate !== undefined) {
      existing.processDate = new Date(input.processDate);
    }
    if (input.projectName !== undefined) {
      existing.projectName = input.projectName.trim();
    }
    if (input.company !== undefined) {
      existing.company = input.company.trim();
    }

    await existing.save();
    return this.toPublic(existing);
  }

  async updatePatch(
    pathStudentId: string,
    input: UpdateCapturedFieldsInput
  ): Promise<CapturedFieldsPublic> {
    const existing = await this.capturedFieldsModel.findOne({
      studentId: pathStudentId,
    });
    if (!existing) {
      throw new AppError(
        404,
        'CAPTURED_FIELDS_NOT_FOUND',
        'Campos capturados no encontrados'
      );
    }

    const nextStudentId =
      input.studentId !== undefined
        ? input.studentId
        : existing.studentId.toString();

    const student = await this.loadStudentOrThrow(nextStudentId);
    this.assertStudentActiveForUpdate(student);

    if (
      input.studentId !== undefined &&
      input.studentId !== existing.studentId.toString()
    ) {
      await this.assertNoDuplicateForReassign(
        input.studentId,
        existing._id as mongoose.Types.ObjectId
      );
    }

    if (input.studentId !== undefined) {
      existing.set('studentId', new mongoose.Types.ObjectId(input.studentId));
    }
    if (input.processDate !== undefined) {
      existing.processDate = new Date(input.processDate);
    }
    if (input.projectName !== undefined) {
      existing.projectName = input.projectName.trim();
    }
    if (input.company !== undefined) {
      existing.company = input.company.trim();
    }

    await existing.save();
    return this.toPublic(existing);
  }

  async deleteByStudentId(studentId: string): Promise<void> {
    const result = await this.capturedFieldsModel.findOneAndDelete({
      studentId,
    });
    if (!result) {
      throw new AppError(
        404,
        'CAPTURED_FIELDS_NOT_FOUND',
        'Campos capturados no encontrados'
      );
    }
  }
}
