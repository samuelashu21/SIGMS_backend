
import { unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

import { prisma } from '../../../database/index.js';
import { AppError } from '../../../utils/app-error.js';
import { storageRoot } from '../middleware/admission-upload.middleware.js';

import type { AdmissionDocumentType } from '../validators/admission-document.validator.js';

export const createAdmissionDocument = async (
  schoolId: string,
  applicationId: string,
  uploadedById: string,
  documentType: AdmissionDocumentType,
  file: Express.Multer.File
) => {
  const application = await prisma.admissionApplication.findFirst({
    where: { id: applicationId, schoolId }
  });

  if (!application) {
    throw new AppError('Admission application not found.', 404);
  }

  if (application.status !== 'DRAFT') {
    throw new AppError(
      'Documents can only be added to draft applications at this stage.',
      409
    );
  }

  return prisma.admissionDocument.create({
    data: {
      schoolId,
      applicationId,
      uploadedById,
      documentType,
      originalFilename: file.originalname,
      storedFilename: file.filename,
      storagePath: `admissions/${schoolId}/${applicationId}/${file.filename}`,
      mimeType: file.mimetype,
      sizeBytes: file.size
    }
  });
};

export const getAdmissionDocuments = async (
  schoolId: string,
  applicationId: string,
  documentType?: AdmissionDocumentType
) => {
  const application = await prisma.admissionApplication.findFirst({
    where: { id: applicationId, schoolId }
  });

  if (!application) {
    throw new AppError('Admission application not found.', 404);
  }

  return prisma.admissionDocument.findMany({
    where: {
      schoolId,
      applicationId,
      ...(documentType && { documentType })
    },
    orderBy: { createdAt: 'desc' }
  });
};

export const getAdmissionDocument = async (
  schoolId: string,
  applicationId: string,
  documentId: string
) => {
  const document = await prisma.admissionDocument.findFirst({
    where: {
      id: documentId,
      schoolId,
      applicationId
    }
  });

  if (!document) {
    throw new AppError('Admission document not found.', 404);
  }

  const absolutePath = resolve(storageRoot, document.storagePath);

  if (
    !absolutePath.startsWith(`${storageRoot}/`) &&
    !absolutePath.startsWith(`${storageRoot}\\`)
  ) {
    throw new AppError('Invalid document storage path.', 400);
  }

  return { document, absolutePath };
};

export const deleteAdmissionDocument = async (
  schoolId: string,
  documentId: string
) => {
  const { document, absolutePath } = await getAdmissionDocument(
    schoolId,
    documentId
  );

  const application = await prisma.admissionApplication.findFirst({
    where: {
      id: document.applicationId,
      schoolId
    }
  });

  if (!application || application.status !== 'DRAFT') {
    throw new AppError(
      'Documents can only be deleted from draft applications at this stage.',
      409
    );
  }

  await prisma.admissionDocument.delete({
    where: { id: documentId }
  });

  await unlink(absolutePath).catch(() => undefined);

  return { id: documentId };
};
