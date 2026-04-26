import type { Model } from 'mongoose';
import mongoose from 'mongoose';
import { AppError } from '@backend/shared';
import type { IGraduationOption } from '@backend/graduation-options';
import type { IStudent } from '@backend/students';
import type { IGraduation } from '@backend/students';
import type {
  CreateGraduationInput,
  UpdateGraduationInput,
} from './schemas/graduations.schemas.js';

export interface GraduationPublic {
  id: string;
  studentId: string;
  graduationOptionId: string | null;
  graduationDate: string | null;
  scheduledDate: string | null;
  president: string;
  secretary: string;
  vocal: string;
  substituteVocal: string;
  notes: string | null;
  idCardNumber: string | null;
  idCardIssueDate: string | null;
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

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isGraduationDateInFuture(date: Date): boolean {
  return (
    startOfLocalDay(date).getTime() > startOfLocalDay(new Date()).getTime()
  );
}

export class GraduationsService {
  constructor(
    private readonly studentModel: Model<IStudent>,
    private readonly graduationModel: Model<IGraduation>,
    private readonly graduationOptionModel: Model<IGraduationOption>
  ) {}

  private toPublic(doc: IGraduation): GraduationPublic {
    const d = doc as IGraduation & { id?: string };
    const id = d.id ?? d._id.toString();
    const sid = d.studentId as mongoose.Types.ObjectId | string;
    const studentId = typeof sid === 'string' ? sid : sid.toString();
    const go = d.graduationOptionId as mongoose.Types.ObjectId | string | null;
    const graduationOptionId =
      go === null || go === undefined
        ? null
        : typeof go === 'string'
        ? go
        : go.toString();
    const fmt = (v: Date | null | undefined): string | null => {
      if (v === null || v === undefined) return null;
      const dt = v instanceof Date ? v : new Date(v);
      return dt.toISOString();
    };
    const createdAt =
      d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt);
    const updatedAt =
      d.updatedAt instanceof Date ? d.updatedAt : new Date(d.updatedAt);
    return {
      id,
      studentId,
      graduationOptionId,
      graduationDate: fmt(d.graduationDate ?? null),
      scheduledDate: fmt(d.scheduledDate ?? null),
      president: d.president,
      secretary: d.secretary,
      vocal: d.vocal,
      substituteVocal: d.substituteVocal,
      notes: d.notes,
      idCardNumber: d.idCardNumber ?? null,
      idCardIssueDate: fmt(d.idCardIssueDate ?? null),
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

  private async assertGraduationOptionExists(
    graduationOptionId: string
  ): Promise<void> {
    const opt = await this.graduationOptionModel.findById(graduationOptionId);
    if (!opt) {
      throw new AppError(
        404,
        'GRADUATION_OPTION_NOT_FOUND',
        'Opción de titulación no encontrada'
      );
    }
  }

  async getByStudentId(studentId: string): Promise<GraduationPublic> {
    const doc = await this.graduationModel.findOne({ studentId });
    if (!doc) {
      throw new AppError(
        404,
        'GRADUATION_NOT_FOUND',
        'Titulación no encontrada'
      );
    }
    return this.toPublic(doc);
  }

  async create(input: CreateGraduationInput): Promise<GraduationPublic> {
    const student = await this.loadStudentOrThrow(input.studentId);

    if (
      input.graduationOptionId !== undefined &&
      input.graduationOptionId !== null
    ) {
      await this.assertGraduationOptionExists(input.graduationOptionId);
    }

    const existing = await this.graduationModel.findOne({
      studentId: input.studentId,
    });
    if (existing) {
      throw new AppError(
        409,
        'DUPLICATE_ERROR',
        'Ya existe una titulación para este estudiante'
      );
    }

    const isGraduated = student.processStatus === 'GRADUATED';
    let graduationDate: Date | null = null;
    let idCardNumber: string | null = null;
    let idCardIssueDate: Date | null = null;

    if (isGraduated) {
      if (input.graduationDate === undefined) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'La fecha de titulación es requerida para estudiantes titulados'
        );
      }
      graduationDate = new Date(input.graduationDate);
      if (isGraduationDateInFuture(graduationDate)) {
        throw new AppError(
          400,
          'INVALID_GRADUATION_DATE',
          'La fecha de titulación debe ser menor o igual a la fecha actual'
        );
      }
      idCardNumber =
        input.idCardNumber !== undefined && input.idCardNumber.trim() !== ''
          ? input.idCardNumber.trim()
          : null;
      idCardIssueDate = input.idCardIssueDate
        ? new Date(input.idCardIssueDate)
        : null;
    }

    const scheduledDate = input.scheduledDate
      ? new Date(input.scheduledDate)
      : null;

    const goId =
      input.graduationOptionId === undefined
        ? null
        : input.graduationOptionId === null
        ? null
        : new mongoose.Types.ObjectId(input.graduationOptionId);

    try {
      const doc = await this.graduationModel.create({
        studentId: new mongoose.Types.ObjectId(input.studentId),
        graduationOptionId: goId,
        graduationDate,
        scheduledDate,
        president: input.president.trim(),
        secretary: input.secretary.trim(),
        vocal: input.vocal.trim(),
        substituteVocal: input.substituteVocal.trim(),
        notes:
          input.notes === undefined
            ? null
            : input.notes === null
            ? null
            : input.notes.trim() || null,
        idCardNumber,
        idCardIssueDate,
      });
      return this.toPublic(doc);
    } catch (err) {
      if (isMongoDuplicateKey(err)) {
        throw new AppError(
          409,
          'DUPLICATE_ERROR',
          'Ya existe una titulación para este estudiante'
        );
      }
      throw err;
    }
  }

  private async assertNoDuplicateForReassign(
    newStudentId: string,
    excludeDocId: mongoose.Types.ObjectId
  ): Promise<void> {
    const clash = await this.graduationModel.findOne({
      studentId: newStudentId,
    });
    if (clash && clash._id.toString() !== excludeDocId.toString()) {
      throw new AppError(
        409,
        'DUPLICATE_ERROR',
        'Ya existe una titulación para este estudiante'
      );
    }
  }

  private assertCommitteeNonEmpty(
    field: string | undefined,
    label: string
  ): void {
    if (field !== undefined && field.trim().length === 0) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        `${label} no puede estar vacío`
      );
    }
  }

  async updatePut(
    pathStudentId: string,
    input: UpdateGraduationInput
  ): Promise<GraduationPublic> {
    return this.applyUpdate(pathStudentId, input);
  }

  async updatePatch(
    pathStudentId: string,
    input: UpdateGraduationInput
  ): Promise<GraduationPublic> {
    return this.applyUpdate(pathStudentId, input);
  }

  private async applyUpdate(
    pathStudentId: string,
    input: UpdateGraduationInput
  ): Promise<GraduationPublic> {
    const existing = await this.graduationModel.findOne({
      studentId: pathStudentId,
    });
    if (!existing) {
      throw new AppError(
        404,
        'GRADUATION_NOT_FOUND',
        'Titulación no encontrada'
      );
    }

    this.assertCommitteeNonEmpty(input.president, 'El presidente del comité');
    this.assertCommitteeNonEmpty(input.secretary, 'El secretario del comité');
    this.assertCommitteeNonEmpty(input.vocal, 'El vocal del comité');
    this.assertCommitteeNonEmpty(
      input.substituteVocal,
      'El vocal suplente del comité'
    );

    const nextStudentId =
      input.studentId !== undefined
        ? input.studentId
        : existing.studentId.toString();

    if (
      input.graduationOptionId !== undefined &&
      input.graduationOptionId !== null
    ) {
      await this.assertGraduationOptionExists(input.graduationOptionId);
    }

    if (
      input.studentId !== undefined &&
      input.studentId !== existing.studentId.toString()
    ) {
      await this.assertNoDuplicateForReassign(
        input.studentId,
        existing._id as mongoose.Types.ObjectId
      );
    }

    const student = await this.loadStudentOrThrow(nextStudentId);

    if (input.studentId !== undefined) {
      existing.set('studentId', new mongoose.Types.ObjectId(input.studentId));
    }

    if (input.graduationOptionId !== undefined) {
      existing.graduationOptionId =
        input.graduationOptionId === null
          ? null
          : new mongoose.Types.ObjectId(input.graduationOptionId);
    }

    if (input.scheduledDate !== undefined) {
      existing.scheduledDate = input.scheduledDate
        ? new Date(input.scheduledDate)
        : null;
    }

    if (input.president !== undefined) {
      existing.president = input.president.trim();
    }
    if (input.secretary !== undefined) {
      existing.secretary = input.secretary.trim();
    }
    if (input.vocal !== undefined) {
      existing.vocal = input.vocal.trim();
    }
    if (input.substituteVocal !== undefined) {
      existing.substituteVocal = input.substituteVocal.trim();
    }
    if (input.notes !== undefined) {
      existing.notes = input.notes === null ? null : input.notes.trim() || null;
    }

    const dateToValidate =
      input.graduationDate !== undefined
        ? new Date(input.graduationDate)
        : existing.graduationDate
        ? new Date(existing.graduationDate)
        : null;

    if (dateToValidate && isGraduationDateInFuture(dateToValidate)) {
      throw new AppError(
        400,
        'INVALID_GRADUATION_DATE',
        'La fecha de titulación debe ser menor o igual a la fecha actual'
      );
    }

    if (student.processStatus === 'GRADUATED') {
      if (input.graduationDate !== undefined) {
        existing.graduationDate = input.graduationDate
          ? new Date(input.graduationDate)
          : null;
      }
      if (input.idCardNumber !== undefined) {
        existing.idCardNumber =
          input.idCardNumber.trim() !== '' ? input.idCardNumber.trim() : null;
      }
      if (input.idCardIssueDate !== undefined) {
        existing.idCardIssueDate = input.idCardIssueDate
          ? new Date(input.idCardIssueDate)
          : null;
      }
    } else {
      existing.graduationDate = null;
      existing.idCardNumber = null;
      existing.idCardIssueDate = null;
    }

    await existing.save();
    return this.toPublic(existing);
  }

  async deleteByStudentId(studentId: string): Promise<void> {
    const result = await this.graduationModel.findOneAndDelete({ studentId });
    if (!result) {
      throw new AppError(
        404,
        'GRADUATION_NOT_FOUND',
        'Titulación no encontrada'
      );
    }
  }

  async graduate(studentId: string): Promise<GraduationPublic> {
    const graduation = await this.graduationModel.findOne({ studentId });
    if (!graduation) {
      throw new AppError(
        404,
        'GRADUATION_NOT_FOUND',
        'Titulación no encontrada para este estudiante'
      );
    }

    const student = await this.studentModel.findById(graduation.studentId);
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado');
    }

    if (!student.isEgressed) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Solo los estudiantes egresados pueden estar titulados'
      );
    }

    if (student.status !== 'ACTIVO') {
      throw new AppError(
        400,
        'INVALID_STUDENT_STATUS',
        'No se puede marcar como graduado: el estudiante debe estar activo (no puede estar pausado o cancelado)'
      );
    }

    if (
      graduation.graduationDate &&
      isGraduationDateInFuture(new Date(graduation.graduationDate))
    ) {
      throw new AppError(
        400,
        'INVALID_GRADUATION_DATE',
        'La fecha de titulación debe ser menor o igual a la fecha actual'
      );
    }

    student.processStatus = 'GRADUATED';
    student.hasIdCard = true;
    await student.save();

    graduation.updatedAt = new Date();
    await graduation.save();

    return this.toPublic(graduation);
  }

  async ungraduate(studentId: string): Promise<GraduationPublic> {
    const graduation = await this.graduationModel.findOne({ studentId });
    if (!graduation) {
      throw new AppError(
        404,
        'GRADUATION_NOT_FOUND',
        'Titulación no encontrada para este estudiante'
      );
    }

    const student = await this.studentModel.findById(studentId);
    if (student && student.processStatus === 'GRADUATED') {
      student.processStatus = 'IN_PROCESS';
      student.hasIdCard = false;
      await student.save();
    }

    graduation.graduationDate = null;
    graduation.idCardNumber = null;
    graduation.idCardIssueDate = null;
    await graduation.save();

    return this.toPublic(graduation);
  }
}
