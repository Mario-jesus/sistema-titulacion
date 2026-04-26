import type { NextFunction, Request, Response } from 'express';
import {
  createStudentSchema,
  updateStudentSchema,
  changeStatusSchema,
  processStatusSchema,
} from './schemas/students.schemas.js';
import type { StudentsService } from './students.service.js';

export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  handleList = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query as Record<string, string>;
      const params = {
        careerId: query.careerId,
        generationId: query.generationId,
        status: query.status,
        processStatus: query.processStatus,
        isEgressed: query.isEgressed,
        search: query.search || query.q,
        sortBy: query.sortBy || 'paternalLastName',
        sortOrder: (query.sortOrder as 'asc' | 'desc') || 'asc',
      };
      const result = await this.studentsService.listStudents(params, query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  handleListInProgress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query as Record<string, string>;
      const params = {
        careerId: query.careerId,
        generationId: query.generationId,
        sex: query.sex,
        search: query.search || query.q,
        sortBy: query.sortBy || 'fullName',
        sortOrder: (query.sortOrder as 'asc' | 'desc') || 'asc',
      };
      const result = await this.studentsService.listInProgress(params, query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  handleListScheduled = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query as Record<string, string>;
      const params = {
        careerId: query.careerId,
        generationId: query.generationId,
        sex: query.sex,
        search: query.search || query.q,
        sortBy: query.sortBy || 'fullName',
        sortOrder: (query.sortOrder as 'asc' | 'desc') || 'asc',
      };
      const result = await this.studentsService.listScheduled(params, query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  handleListGraduated = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = req.query as Record<string, string>;
      const params = {
        careerId: query.careerId,
        generationId: query.generationId,
        sex: query.sex,
        search: query.search || query.q,
        sortBy: query.sortBy || 'fullName',
        sortOrder: (query.sortOrder as 'asc' | 'desc') || 'asc',
      };
      const result = await this.studentsService.listGraduated(params, query);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  handleGetById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const student = await this.studentsService.getStudentById(req.params.id);
      if (!student) {
        res.status(404).json({
          error: 'Estudiante no encontrado',
          code: 'STUDENT_NOT_FOUND',
        });
        return;
      }
      res.status(200).json(student);
    } catch (err) {
      next(err);
    }
  };

  handleCreate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = createStudentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const student = await this.studentsService.createStudent(parsed.data);
      res.status(201).json(student);
    } catch (err) {
      next(err);
    }
  };

  handleUpdate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = updateStudentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const student = await this.studentsService.updateStudent(
        req.params.id,
        parsed.data
      );
      res.status(200).json(student);
    } catch (err) {
      next(err);
    }
  };

  handlePatch = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = updateStudentSchema.partial().safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const student = await this.studentsService.updateStudent(
        req.params.id,
        parsed.data
      );
      res.status(200).json(student);
    } catch (err) {
      next(err);
    }
  };

  handleDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.studentsService.deleteStudent(req.params.id);
      res.status(200).json({ message: 'Estudiante eliminado exitosamente' });
    } catch (err) {
      next(err);
    }
  };

  handleChangeStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = changeStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const student = await this.studentsService.changeStatus(
        req.params.id,
        parsed.data
      );
      res.status(200).json(student);
    } catch (err) {
      next(err);
    }
  };

  handleEgress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const student = await this.studentsService.markEgressed(req.params.id);
      res.status(200).json(student);
    } catch (err) {
      next(err);
    }
  };

  handleUnegress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const student = await this.studentsService.markUnegressed(req.params.id);
      res.status(200).json(student);
    } catch (err) {
      next(err);
    }
  };

  handleProcessStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = processStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Error de validación',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        });
        return;
      }
      const student = await this.studentsService.updateProcessStatus(
        req.params.id,
        parsed.data
      );
      res.status(200).json(student);
    } catch (err) {
      next(err);
    }
  };
}
