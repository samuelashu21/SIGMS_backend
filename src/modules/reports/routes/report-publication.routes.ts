
import { Router } from 'express';

import { updateReportPublicationController } from '../controllers/report-publication.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';
 
const router = Router({ mergeParams: true });

router.patch(
  '/',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  updateReportPublicationController
);

export default router;
