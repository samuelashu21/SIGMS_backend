import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createAdmissionDocument,
  getAdmissionDocuments,
  getAdmissionDocument,
  deleteAdmissionDocument
} from '../services/admission-document.service.js';

import {
  admissionDocumentTypeSchema,
  admissionDocumentQuerySchema
} from '../validators/admission-document.validator.js';

const getSchoolId = (req: Request): string => {
  const id = req.tenant?.schoolId;

  if (typeof id !== 'string' || !id.trim()) {
    throw new AppError('Tenant context required.', 403);
  }

  return id;
};

const getUserId = (req: Request): string => {
  const id = req.auth?.sub;

  if (typeof id !== 'string' || !id.trim()) {
    throw new AppError('Authenticated user required.', 401);
  }

  return id;
};

const getRouteParam = (
  req: Request,
  paramName: string,
  errorMessage: string
): string => {
  const value = req.params[paramName];

  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(errorMessage, 400);
  }

  return value;
};

export const uploadAdmissionDocumentController = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getRouteParam(
      req,
      'applicationId',
      'Application ID required.'
    );

    if (!req.file) {
      throw new AppError('Document file is required.', 400);
    }

    const documentType = admissionDocumentTypeSchema.safeParse(
      req.body.documentType
    );

    if (!documentType.success) {
      throw new AppError('Invalid document type.', 400);
    }

    const data = await createAdmissionDocument(
      getSchoolId(req),
      applicationId,
      getUserId(req),
      documentType.data,
      req.file
    );

    res.status(201).json({
      success: true,
      message: 'Admission document uploaded.',
      data
    });
  }
);

export const getAdmissionDocumentsController = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getRouteParam(
      req,
      'applicationId',
      'Application ID required.'
    );

    const filters = admissionDocumentQuerySchema.safeParse(req.query);

    if (!filters.success) {
      throw new AppError('Invalid document filters.', 400);
    }

    const data = await getAdmissionDocuments(
      getSchoolId(req),
      applicationId,
      filters.data.documentType
    );

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const downloadAdmissionDocumentController = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getRouteParam(
      req,
      'applicationId',
      'Application ID required.'
    );

    const documentId = getRouteParam(
      req,
      'documentId',
      'Document ID required.'
    );

    const { document, absolutePath } = await getAdmissionDocument(
      getSchoolId(req),
      applicationId,
      documentId
    );

    res.download(absolutePath, document.originalFilename);
  }
);

export const deleteAdmissionDocumentController = asyncHandler(
  async (req: Request, res: Response) => {
    const applicationId = getRouteParam(
      req,
      'applicationId',
      'Application ID required.'
    );

    const documentId = getRouteParam(
      req,
      'documentId',
      'Document ID required.'
    );

    const data = await deleteAdmissionDocument(
      getSchoolId(req),
      applicationId,
      documentId
    );

    res.status(200).json({
      success: true,
      message: 'Admission document deleted.',
      data
    });
  }
);