
import type { Request, Response } from 'express';

import { asyncHandler } from '../../../utils/async-handler.js';
import { AppError } from '../../../utils/app-error.js';

import {
  createGuardianContact,
  getGuardianContacts,
  updateGuardianContact,
  deleteGuardianContact
} from '../services/guardian-contact.service.js';

import {
  createGuardianContactSchema,
  updateGuardianContactSchema
} from '../validators/guardian-contact.validator.js';

export const createGuardianContactController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const guardianId = req.params.guardianId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    if (typeof guardianId !== 'string' || !guardianId.trim()) {
      throw new AppError('A valid guardian ID is required.', 400);
    }

    const input = createGuardianContactSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid guardian contact information.', 400);
    }

    const data = await createGuardianContact(
      schoolId,
      guardianId,
      input.data
    );

    res.status(201).json({
      success: true,
      message: 'Guardian contact created.',
      data
    });
  }
);

export const getGuardianContactsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const guardianId = req.params.guardianId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    if (typeof guardianId !== 'string' || !guardianId.trim()) {
      throw new AppError('A valid guardian ID is required.', 400);
    }

    const data = await getGuardianContacts(schoolId, guardianId);

    res.status(200).json({
      success: true,
      results: data.length,
      data
    });
  }
);

export const updateGuardianContactController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const guardianId = req.params.guardianId;
    const contactId = req.params.contactId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    if (typeof guardianId !== 'string' || !guardianId.trim()) {
      throw new AppError('A valid guardian ID is required.', 400);
    }

    if (typeof contactId !== 'string' || !contactId.trim()) {
      throw new AppError('A valid contact ID is required.', 400);
    }

    const input = updateGuardianContactSchema.safeParse(req.body);

    if (!input.success) {
      throw new AppError('Invalid guardian contact information.', 400);
    }

    const data = await updateGuardianContact(
      schoolId,
      guardianId,
      contactId,
      input.data
    );

    res.status(200).json({
      success: true,
      message: 'Guardian contact updated.',
      data
    });
  }
);

export const deleteGuardianContactController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.tenant?.schoolId;
    const guardianId = req.params.guardianId;
    const contactId = req.params.contactId;

    if (!schoolId) {
      throw new AppError('School context required.', 400);
    }

    if (typeof guardianId !== 'string' || !guardianId.trim()) {
      throw new AppError('A valid guardian ID is required.', 400);
    }

    if (typeof contactId !== 'string' || !contactId.trim()) {
      throw new AppError('A valid contact ID is required.', 400);
    }

    const data = await deleteGuardianContact(
      schoolId,
      guardianId,
      contactId
    );

    res.status(200).json({
      success: true,
      message: 'Guardian contact deactivated.',
      data
    });
  }
);
