
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { extname, resolve } from 'node:path';

import { env } from '../../../config/env.js';
import { AppError } from '../../../utils/app-error.js';

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png'
];

const storageRoot = resolve(env.STORAGE_PATH);

const storage = multer.diskStorage({
  destination: (req, _file, callback) => {
    const schoolId = req.tenant?.schoolId;
    const applicationId = req.params.applicationId;

    if (!schoolId || !applicationId) {
      return callback(new Error('Admission storage context missing.'), '');
    }

    const directory = resolve(
      storageRoot,
      'admissions',
      schoolId,
      applicationId
    );

    mkdirSync(directory, { recursive: true });
    callback(null, directory);
  },

  filename: (_req, file, callback) => {
    callback(
      null,
      `${randomUUID()}${extname(file.originalname).toLowerCase()}`
    );
  }
});

export const admissionUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new AppError('Only PDF, JPEG and PNG files are allowed.', 400)
      );
    }

    callback(null, true);
  }
}).single('document');

export { storageRoot };
