
import { Router } from 'express';

import {
  generateTranscriptController,
  getTranscriptController,
  getTranscriptsController
} from '../controllers/transcript.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';

 
const router = Router({ mergeParams: true });

router.post(
  '/',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  generateTranscriptController
);

router.get(
  '/',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getTranscriptsController
);

router.get(
  '/:transcriptId',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getTranscriptController
);

export default router;
