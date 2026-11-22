
import type { Response } from 'express';

interface SuccessResponseOptions<T> {
  message: string;
  data?: T;
  statusCode?: number;
}

interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export const sendSuccess = <T>(
  res: Response,
  options: SuccessResponseOptions<T>
) => {
  const {
    message,
    data,
    statusCode = 200
  } = options;

  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data })
  });
};

export const sendCreated = <T>(
  res: Response,
  message: string,
  data: T
) => {
  return sendSuccess(res, {
    message,
    data,
    statusCode: 201
  });
};

export const sendPaginated = <T>(
  res: Response,
  message: string,
  data: T[],
  pagination: PaginationOptions
) => {
  const totalPages = Math.ceil(
    pagination.total / pagination.limit
  );

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages
    }
  });
};
