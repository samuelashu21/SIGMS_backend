
import { Router } from 'express';

 
import {
  createSubjectSchedulingRequirementController,
  listSubjectSchedulingRequirementsController,
  updateSubjectSchedulingRequirementController
} from '../controllers/subject-scheduling.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';

const router = Router();

router.post(
  '/requirements',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  createSubjectSchedulingRequirementController
);

router.get(
  '/requirements',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  listSubjectSchedulingRequirementsController
);

router.patch(
  '/requirements/:requirementId',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  updateSubjectSchedulingRequirementController
);

export default router;
