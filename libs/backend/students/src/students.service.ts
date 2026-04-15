import type { Model } from 'mongoose';
import { AppError } from '@backend/shared';
import type {
  IStudent,
  StudentStatus,
  ProcessStatus,
} from './models/Student.model.js';
import type { IGraduation } from './models/Graduation.model.js';
import type { ICapturedFields } from './models/CapturedFields.model.js';
interface HasId {
  _id: { toString: () => string };
}
type CareerLike = HasId;
type GenerationLike = HasId;
import {
  buildPagination,
  parsePaginationQuery,
  type PaginationResult,
} from './utils/pagination.js';
import type {
  CreateStudentInput,
  UpdateStudentInput,
  ChangeStatusInput,
  ProcessStatusInput,
} from './schemas/students.schemas.js';

export interface StudentPublic {
  id: string;
  careerId: string;
  generationId: string;
  controlNumber: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  phoneNumber: string;
  email: string;
  birthDate: string;
  sex: string;
  isEgressed: boolean;
  status: string;
  processStatus: string;
  hasIdCard: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListStudentsParams {
  page?: number;
  limit?: number;
  careerId?: string;
  generationId?: string;
  status?: string;
  processStatus?: string;
  isEgressed?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ListSpecialParams {
  page?: number;
  limit?: number;
  careerId?: string;
  generationId?: string;
  sex?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

type StudentDoc = {
  _id: { toString: () => string };
  careerId: { toString: () => string };
  generationId: { toString: () => string };
  controlNumber: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  phoneNumber: string;
  email: string;
  birthDate: Date;
  sex: string;
  isEgressed: boolean;
  status: string;
  processStatus: string;
  hasIdCard: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toStudentPublic(doc: StudentDoc): StudentPublic {
  return {
    id: doc._id.toString(),
    careerId: doc.careerId.toString(),
    generationId: doc.generationId.toString(),
    controlNumber: doc.controlNumber,
    firstName: doc.firstName,
    paternalLastName: doc.paternalLastName,
    maternalLastName: doc.maternalLastName,
    phoneNumber: doc.phoneNumber,
    email: doc.email,
    birthDate: formatDate(doc.birthDate),
    sex: doc.sex,
    isEgressed: doc.isEgressed,
    status: doc.status,
    processStatus: doc.processStatus,
    hasIdCard: doc.hasIdCard,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseBoolish(val: unknown): boolean | undefined {
  if (val === 'true' || val === '1' || val === true) return true;
  if (val === 'false' || val === '0' || val === false) return false;
  return undefined;
}

const LIST_SORT_FIELDS = [
  'firstName',
  'paternalLastName',
  'controlNumber',
  'email',
  'birthDate',
  'createdAt',
  'isEgressed',
  'status',
] as const;

const IN_PROGRESS_SORT_FIELDS = [
  'fullName',
  'controlNumber',
  'sex',
  'careerId',
  'graduationOptionId',
] as const;

const SCHEDULED_SORT_FIELDS = [
  'controlNumber',
  'fullName',
  'sex',
  'careerId',
  'graduationOptionId',
  'graduationDate',
  'scheduledDate',
] as const;

export class StudentsService {
  constructor(
    private readonly studentModel: Model<IStudent>,
    private readonly careerModel: Model<CareerLike>,
    private readonly generationModel: Model<GenerationLike>,
    private readonly graduationModel: Model<IGraduation>,
    private readonly capturedFieldsModel: Model<ICapturedFields>
  ) {}

  async listStudents(
    params: ListStudentsParams,
    query: Record<string, unknown>
  ): Promise<{ data: StudentPublic[]; pagination: PaginationResult }> {
    const { page, limit, skip } = parsePaginationQuery(
      query as { page?: string; limit?: string }
    );
    const sortBy = params.sortBy ?? 'paternalLastName';
    const sortByField = (LIST_SORT_FIELDS as readonly string[]).includes(sortBy)
      ? sortBy
      : 'paternalLastName';
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
    const sortObj = { [sortByField]: sortOrder } as Record<string, 1 | -1>;

    const filter: Record<string, unknown> = {};
    if (params.careerId) filter.careerId = params.careerId;
    if (params.generationId) filter.generationId = params.generationId;
    if (params.status) filter.status = params.status;
    if (params.processStatus) filter.processStatus = params.processStatus;

    const egressed = parseBoolish(params.isEgressed);
    if (egressed !== undefined) filter.isEgressed = egressed;

    if (params.search?.trim()) {
      const search = escapeRegex(params.search.trim());
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { paternalLastName: { $regex: search, $options: 'i' } },
        { maternalLastName: { $regex: search, $options: 'i' } },
        { controlNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.studentModel.countDocuments(filter),
    ]);

    return {
      data: (data as StudentDoc[]).map(toStudentPublic),
      pagination: buildPagination({ page, limit, total }),
    };
  }

  async listInProgress(
    params: ListSpecialParams,
    query: Record<string, unknown>
  ): Promise<{
    data: Record<string, unknown>[];
    pagination: PaginationResult;
  }> {
    const { page, limit, skip } = parsePaginationQuery(
      query as { page?: string; limit?: string }
    );

    const filter: Record<string, unknown> = {
      status: 'ACTIVO',
      processStatus: 'IN_PROCESS',
    };
    if (params.careerId) filter.careerId = params.careerId;
    if (params.generationId) filter.generationId = params.generationId;
    if (params.sex) filter.sex = params.sex;
    if (params.search?.trim()) {
      const search = escapeRegex(params.search.trim());
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { paternalLastName: { $regex: search, $options: 'i' } },
        { maternalLastName: { $regex: search, $options: 'i' } },
        { controlNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const sortBy = params.sortBy ?? 'fullName';
    const sortByField = (IN_PROGRESS_SORT_FIELDS as readonly string[]).includes(
      sortBy
    )
      ? sortBy
      : 'fullName';
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;

    const mongoSort =
      sortByField === 'fullName'
        ? ({
            paternalLastName: sortOrder,
            maternalLastName: sortOrder,
            firstName: sortOrder,
          } as Record<string, 1 | -1>)
        : ({ [sortByField]: sortOrder } as Record<string, 1 | -1>);

    const [students, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .sort(mongoSort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.studentModel.countDocuments(filter),
    ]);

    const studentIds = students.map((s) => s._id);

    const [graduations, capturedFields] = await Promise.all([
      this.graduationModel
        .find({ studentId: { $in: studentIds } })
        .lean()
        .exec(),
      this.capturedFieldsModel
        .find({ studentId: { $in: studentIds } })
        .lean()
        .exec(),
    ]);

    const gradMap = new Map(
      graduations.map((g) => [g.studentId.toString(), g])
    );
    const cfMap = new Map(
      capturedFields.map((cf) => [cf.studentId.toString(), cf])
    );

    const data = students.map((s) => {
      const sid = s._id.toString();
      const grad = gradMap.get(sid);
      const cf = cfMap.get(sid);
      return {
        controlNumber: s.controlNumber,
        fullName: `${s.firstName} ${s.paternalLastName} ${
          s.maternalLastName || ''
        }`.trim(),
        sex: s.sex,
        careerId: s.careerId.toString(),
        graduationOptionId: grad?.graduationOptionId?.toString() ?? null,
        projectName: cf?.projectName ?? null,
      };
    });

    return {
      data,
      pagination: buildPagination({ page, limit, total }),
    };
  }

  async listScheduled(
    params: ListSpecialParams,
    query: Record<string, unknown>
  ): Promise<{
    data: Record<string, unknown>[];
    pagination: PaginationResult;
  }> {
    return this.listByProcessStatus('SCHEDULED', params, query);
  }

  async listGraduated(
    params: ListSpecialParams,
    query: Record<string, unknown>
  ): Promise<{
    data: Record<string, unknown>[];
    pagination: PaginationResult;
  }> {
    return this.listByProcessStatus('GRADUATED', params, query);
  }

  private async listByProcessStatus(
    processStatus: ProcessStatus,
    params: ListSpecialParams,
    query: Record<string, unknown>
  ): Promise<{
    data: Record<string, unknown>[];
    pagination: PaginationResult;
  }> {
    const { page, limit, skip } = parsePaginationQuery(
      query as { page?: string; limit?: string }
    );

    const filter: Record<string, unknown> = {
      status: 'ACTIVO',
      processStatus,
    };
    if (params.careerId) filter.careerId = params.careerId;
    if (params.generationId) filter.generationId = params.generationId;
    if (params.sex) filter.sex = params.sex;
    if (params.search?.trim()) {
      const search = escapeRegex(params.search.trim());
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { paternalLastName: { $regex: search, $options: 'i' } },
        { maternalLastName: { $regex: search, $options: 'i' } },
        { controlNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const sortBy = params.sortBy ?? 'fullName';
    const sortByField = (SCHEDULED_SORT_FIELDS as readonly string[]).includes(
      sortBy
    )
      ? sortBy
      : 'fullName';
    const sortOrder = params.sortOrder === 'desc' ? -1 : 1;

    const mongoSort =
      sortByField === 'fullName'
        ? ({
            paternalLastName: sortOrder,
            maternalLastName: sortOrder,
            firstName: sortOrder,
          } as Record<string, 1 | -1>)
        : ({ [sortByField]: sortOrder } as Record<string, 1 | -1>);

    const [students, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .sort(mongoSort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.studentModel.countDocuments(filter),
    ]);

    const studentIds = students.map((s) => s._id);

    const graduations = await this.graduationModel
      .find({ studentId: { $in: studentIds } })
      .lean()
      .exec();

    const gradMap = new Map(
      graduations.map((g) => [g.studentId.toString(), g])
    );

    const data = students.map((s) => {
      const sid = s._id.toString();
      const grad = gradMap.get(sid);
      return {
        controlNumber: s.controlNumber,
        fullName: `${s.firstName} ${s.paternalLastName} ${
          s.maternalLastName || ''
        }`.trim(),
        sex: s.sex,
        careerId: s.careerId.toString(),
        generationId: s.generationId.toString(),
        graduationOptionId: grad?.graduationOptionId?.toString() ?? null,
        hasIdCard: s.hasIdCard,
        graduationDate: grad?.graduationDate
          ? formatDate(grad.graduationDate)
          : null,
        scheduledDate: grad?.scheduledDate
          ? formatDate(grad.scheduledDate)
          : null,
      };
    });

    return {
      data,
      pagination: buildPagination({ page, limit, total }),
    };
  }

  async getStudentById(id: string): Promise<StudentPublic | null> {
    const student = await this.studentModel.findById(id).lean().exec();
    if (!student) return null;
    return toStudentPublic(student as StudentDoc);
  }

  async createStudent(input: CreateStudentInput): Promise<StudentPublic> {
    const career = await this.careerModel
      .findById(input.careerId)
      .lean()
      .exec();
    if (!career) {
      throw new AppError(404, 'CAREER_NOT_FOUND', 'Carrera no encontrada');
    }

    const generation = await this.generationModel
      .findById(input.generationId)
      .lean()
      .exec();
    if (!generation) {
      throw new AppError(
        404,
        'GENERATION_NOT_FOUND',
        'Generación no encontrada'
      );
    }

    const controlNumber = input.controlNumber.trim();
    const existingControlNumber = await this.studentModel
      .findOne({
        controlNumber: {
          $regex: new RegExp(`^${escapeRegex(controlNumber)}$`, 'i'),
        },
      })
      .lean()
      .exec();
    if (existingControlNumber) {
      throw new AppError(409, 'DUPLICATE_ERROR', 'controlNumber ya existe');
    }

    const email = input.email.trim().toLowerCase();
    const existingEmail = await this.studentModel
      .findOne({
        email: {
          $regex: new RegExp(`^${escapeRegex(email)}$`, 'i'),
        },
      })
      .lean()
      .exec();
    if (existingEmail) {
      throw new AppError(409, 'DUPLICATE_ERROR', 'email ya existe');
    }

    const hasIdCard =
      (input.processStatus ?? 'NOT_STARTED') === 'GRADUATED'
        ? input.hasIdCard ?? false
        : false;

    const student = await this.studentModel.create({
      careerId: input.careerId,
      generationId: input.generationId,
      controlNumber,
      firstName: input.firstName.trim(),
      paternalLastName: input.paternalLastName.trim(),
      maternalLastName: input.maternalLastName.trim(),
      phoneNumber: input.phoneNumber.trim(),
      email,
      birthDate: new Date(input.birthDate),
      sex: input.sex,
      isEgressed: input.isEgressed ?? false,
      status: input.status ?? 'ACTIVO',
      processStatus: input.processStatus ?? 'NOT_STARTED',
      hasIdCard,
    });

    const doc = await this.studentModel.findById(student._id).lean().exec();
    return toStudentPublic(doc as StudentDoc);
  }

  async updateStudent(
    id: string,
    input: UpdateStudentInput
  ): Promise<StudentPublic> {
    const student = await this.studentModel.findById(id);
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado');
    }

    if (input.careerId !== undefined) {
      const career = await this.careerModel
        .findById(input.careerId)
        .lean()
        .exec();
      if (!career) {
        throw new AppError(404, 'CAREER_NOT_FOUND', 'Carrera no encontrada');
      }
      student.careerId = input.careerId as unknown as typeof student.careerId;
    }

    if (input.generationId !== undefined) {
      const generation = await this.generationModel
        .findById(input.generationId)
        .lean()
        .exec();
      if (!generation) {
        throw new AppError(
          404,
          'GENERATION_NOT_FOUND',
          'Generación no encontrada'
        );
      }
      student.generationId =
        input.generationId as unknown as typeof student.generationId;
    }

    if (input.controlNumber !== undefined) {
      const cn = input.controlNumber.trim();
      const existing = await this.studentModel
        .findOne({
          controlNumber: {
            $regex: new RegExp(`^${escapeRegex(cn)}$`, 'i'),
          },
          _id: { $ne: id },
        })
        .lean()
        .exec();
      if (existing) {
        throw new AppError(409, 'DUPLICATE_ERROR', 'controlNumber ya existe');
      }
      student.controlNumber = cn;
    }

    if (input.email !== undefined) {
      const em = input.email.trim().toLowerCase();
      const existing = await this.studentModel
        .findOne({
          email: {
            $regex: new RegExp(`^${escapeRegex(em)}$`, 'i'),
          },
          _id: { $ne: id },
        })
        .lean()
        .exec();
      if (existing) {
        throw new AppError(409, 'DUPLICATE_ERROR', 'email ya existe');
      }
      student.email = em;
    }

    if (input.firstName !== undefined)
      student.firstName = input.firstName.trim();
    if (input.paternalLastName !== undefined)
      student.paternalLastName = input.paternalLastName.trim();
    if (input.maternalLastName !== undefined)
      student.maternalLastName = input.maternalLastName.trim();
    if (input.phoneNumber !== undefined)
      student.phoneNumber = input.phoneNumber.trim();
    if (input.birthDate !== undefined)
      student.birthDate = new Date(input.birthDate);
    if (input.sex !== undefined) student.sex = input.sex;
    if (input.isEgressed !== undefined) student.isEgressed = input.isEgressed;

    if (input.status !== undefined) {
      this.validateStatusTransition(
        student.status,
        input.status,
        student.processStatus,
        student.isEgressed
      );
      student.status = input.status;
    }

    if (input.processStatus !== undefined)
      student.processStatus = input.processStatus;

    const effectiveProcessStatus = input.processStatus ?? student.processStatus;
    if (input.hasIdCard !== undefined) {
      student.hasIdCard =
        effectiveProcessStatus === 'GRADUATED' ? input.hasIdCard : false;
    } else if (effectiveProcessStatus !== 'GRADUATED') {
      student.hasIdCard = false;
    }

    await student.save();

    const doc = await this.studentModel.findById(id).lean().exec();
    return toStudentPublic(doc as StudentDoc);
  }

  async deleteStudent(id: string): Promise<void> {
    const result = await this.studentModel.findByIdAndDelete(id);
    if (!result) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado');
    }
  }

  async changeStatus(
    id: string,
    input: ChangeStatusInput
  ): Promise<StudentPublic> {
    if (!input?.status) {
      throw new AppError(400, 'VALIDATION_ERROR', 'status es requerido');
    }

    const student = await this.studentModel.findById(id);
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado');
    }

    this.validateStatusTransition(
      student.status,
      input.status,
      student.processStatus,
      student.isEgressed
    );

    student.status = input.status;
    await student.save();

    const doc = await this.studentModel.findById(id).lean().exec();
    return toStudentPublic(doc as StudentDoc);
  }

  private validateStatusTransition(
    current: StudentStatus,
    next: StudentStatus,
    processStatus: ProcessStatus,
    isEgressed: boolean
  ): void {
    if (current === 'CANCELADO') {
      throw new AppError(
        400,
        'INVALID_STATUS_TRANSITION',
        'Un estudiante cancelado no puede cambiar su estado'
      );
    }

    if (
      processStatus === 'GRADUATED' &&
      (next === 'PAUSADO' || next === 'CANCELADO')
    ) {
      throw new AppError(
        400,
        'INVALID_STATUS_TRANSITION',
        'Un estudiante graduado no puede ser pausado ni cancelado'
      );
    }

    if (isEgressed && next === 'CANCELADO') {
      throw new AppError(
        400,
        'INVALID_STATUS_TRANSITION',
        'Un estudiante egresado no puede ser cancelado'
      );
    }

    if (current === 'ACTIVO' && next !== 'PAUSADO' && next !== 'CANCELADO') {
      throw new AppError(
        400,
        'INVALID_STATUS_TRANSITION',
        'Un estudiante activo solo puede ser pausado o cancelado'
      );
    }

    if (current === 'PAUSADO' && next !== 'ACTIVO') {
      throw new AppError(
        400,
        'INVALID_STATUS_TRANSITION',
        'Un estudiante pausado solo puede ser activado'
      );
    }
  }

  async markEgressed(id: string): Promise<StudentPublic> {
    const student = await this.studentModel.findById(id);
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado');
    }

    if (student.isEgressed) {
      throw new AppError(
        400,
        'ALREADY_EGRESSED',
        'El estudiante ya está marcado como egresado'
      );
    }

    student.isEgressed = true;
    await student.save();

    const doc = await this.studentModel.findById(id).lean().exec();
    return toStudentPublic(doc as StudentDoc);
  }

  async markUnegressed(id: string): Promise<StudentPublic> {
    const student = await this.studentModel.findById(id);
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado');
    }

    if (!student.isEgressed) {
      throw new AppError(
        400,
        'NOT_EGRESSED',
        'El estudiante no está marcado como egresado'
      );
    }

    const [hasCapturedFields, hasGraduation] = await Promise.all([
      this.capturedFieldsModel.findOne({ studentId: id }).lean().exec(),
      this.graduationModel.findOne({ studentId: id }).lean().exec(),
    ]);

    if (hasCapturedFields || hasGraduation) {
      throw new AppError(
        400,
        'CANNOT_UNEGRESS',
        'No se puede cambiar a no egresado: el estudiante está en proceso, programado o ya está titulado'
      );
    }

    student.isEgressed = false;
    await student.save();

    const doc = await this.studentModel.findById(id).lean().exec();
    return toStudentPublic(doc as StudentDoc);
  }

  async updateProcessStatus(
    id: string,
    body: ProcessStatusInput
  ): Promise<StudentPublic> {
    if (!body.processStatus) {
      throw new AppError(400, 'VALIDATION_ERROR', 'processStatus es requerido');
    }

    const student = await this.studentModel.findById(id);
    if (!student) {
      throw new AppError(404, 'STUDENT_NOT_FOUND', 'Estudiante no encontrado');
    }

    const current = student.processStatus;
    const next = body.processStatus;

    if (current === 'GRADUATED') {
      throw new AppError(
        400,
        'INVALID_PROCESS_STATUS_TRANSITION',
        'Un estudiante titulado no puede cambiar su estado de proceso'
      );
    }

    if (next === 'IN_PROCESS' && current !== 'NOT_STARTED') {
      throw new AppError(
        400,
        'INVALID_PROCESS_STATUS_TRANSITION',
        'Solo un estudiante sin iniciar puede marcarse como en progreso'
      );
    }

    if (current === 'NOT_STARTED' && next !== 'NOT_STARTED') {
      if (!student.isEgressed) {
        throw new AppError(
          400,
          'STUDENT_NOT_EGRESSED',
          'El estudiante debe estar egresado para iniciar su proceso de titulación'
        );
      }
      if (student.status !== 'ACTIVO') {
        throw new AppError(
          400,
          'INVALID_STATUS_FOR_PROCESS',
          'El estudiante debe estar activo para iniciar su proceso de titulación'
        );
      }
    }

    if (
      next !== 'NOT_STARTED' &&
      next !== 'IN_PROCESS' &&
      student.status !== 'ACTIVO'
    ) {
      throw new AppError(
        400,
        'INVALID_STATUS_FOR_PROCESS',
        'El estudiante debe estar ACTIVO para cambiar a este estado'
      );
    }

    if (next === 'IN_PROCESS' || next === 'SCHEDULED' || next === 'GRADUATED') {
      if (!student.isEgressed) {
        throw new AppError(
          400,
          'STUDENT_NOT_EGRESSED',
          'El estudiante debe estar egresado para cambiar a este estado'
        );
      }
    }

    if (next === 'SCHEDULED' && body.scheduledDate) {
      await this.graduationModel.findOneAndUpdate(
        { studentId: id },
        { scheduledDate: new Date(body.scheduledDate) },
        { upsert: false }
      );
    }

    if (next === 'GRADUATED') {
      const gradUpdate: Record<string, unknown> = {};
      if (body.graduationDate) {
        gradUpdate.graduationDate = new Date(body.graduationDate);
      }
      if (body.idCardNumber !== undefined) {
        gradUpdate.idCardNumber = body.idCardNumber;
      }
      if (body.idCardIssueDate) {
        gradUpdate.idCardIssueDate = new Date(body.idCardIssueDate);
      }

      if (Object.keys(gradUpdate).length > 0) {
        await this.graduationModel.findOneAndUpdate(
          { studentId: id },
          { $set: gradUpdate },
          { upsert: true }
        );
      }
    }

    student.processStatus = next;
    student.hasIdCard = next === 'GRADUATED' ? body.hasIdCard ?? false : false;

    await student.save();

    const doc = await this.studentModel.findById(id).lean().exec();
    return toStudentPublic(doc as StudentDoc);
  }
}
