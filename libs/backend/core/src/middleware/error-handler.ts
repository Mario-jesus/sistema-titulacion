import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '@backend/shared';
import { logger } from '../logger/logger.js';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Resource not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
  });
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
      path: req.originalUrl,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: err.flatten(),
      path: req.originalUrl,
    });
    return;
  }

  logger.error({ err, path: req.originalUrl }, 'Unhandled error');

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    path: req.originalUrl,
  });
};
