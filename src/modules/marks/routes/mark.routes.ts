
import { Router } from 'express';
 
import {
  createMarkEntryController,
  updateMarkEntryController,
  getMarkEntryController,
  getExaminationMarkEntriesController
} from '../controllers/mark-entry.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';
import { createAssignmentMarkController, getAssignmentMarksController } from '../controllers/assignment-mark.controller.js';
import { createQuizMarkController, getQuizMarksController } from '../controllers/quiz-mark.controller.js';
import { createExaminationMarkController, getExaminationMarksController } from '../controllers/examination-mark.controller.js';
import { createBulkMarkEntriesController } from '../controllers/bulk-mark.controller.js';
import { getSubmittedExaminationMarksController, submitExaminationMarksController } from '../controllers/mark-submission.controller.js';
import { getMarksPendingApprovalController, reviewExaminationMarksController } from '../controllers/mark-approval.controller.js';
import { getMarkCorrectionsController, getPendingMarkCorrectionsController, requestMarkCorrectionController, reviewMarkCorrectionController } from '../controllers/mark-correction.controller.js';
import { getPublishedExaminationMarksController, publishExaminationMarksController } from '../controllers/mark-publication.controller.js';

const router = Router();

const marksEntryRoles = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'TEACHER'
] as const;

const marksViewRoles = [
  ...marksEntryRoles,
  'REGISTRAR'
] as const;

router.post(
  '/',
  authorizeSchoolRoles(...marksEntryRoles),
  createMarkEntryController
);

router.get(
  '/examinations/:examinationId',
  authorizeSchoolRoles(...marksViewRoles),
  getExaminationMarkEntriesController
);
router.post(
  '/assignments/:assignmentId',
  authorizeSchoolRoles(...marksEntryRoles),
  createAssignmentMarkController
);

router.get(
  '/assignments/:assignmentId',
  authorizeSchoolRoles(...marksViewRoles),
  getAssignmentMarksController
);
router.post(
  '/quizzes/:quizId',
  authorizeSchoolRoles(...marksEntryRoles),
  createQuizMarkController
);

router.get(
  '/quizzes/:quizId',
  authorizeSchoolRoles(...marksViewRoles),
  getQuizMarksController
);
router.post(
  '/examinations/:examinationId',
  authorizeSchoolRoles(...marksEntryRoles),
  createExaminationMarkController
);

router.get(
  '/examinations/:examinationId',
  authorizeSchoolRoles(...marksViewRoles),
  getExaminationMarksController
);
router.post(
  '/bulk',
  authorizeSchoolRoles(...marksEntryRoles),
  createBulkMarkEntriesController
);
router.post(
  '/examinations/:examinationId/submit',
  authorizeSchoolRoles(...marksEntryRoles),
  submitExaminationMarksController
);

router.get(
  '/examinations/:examinationId/submitted',
  authorizeSchoolRoles(...marksViewRoles),
  getSubmittedExaminationMarksController
);

const marksApprovalRoles = [
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL'
] as const;

router.get(
  '/examinations/:examinationId/pending-approval',
  authorizeSchoolRoles(...marksApprovalRoles),
  getMarksPendingApprovalController
);

router.post(
  '/examinations/:examinationId/review',
  authorizeSchoolRoles(...marksApprovalRoles),
  reviewExaminationMarksController
);

const marksPublicationRoles = [
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL'
] as const;

router.post(
  '/examinations/:examinationId/publish',
  authorizeSchoolRoles(...marksPublicationRoles),
  publishExaminationMarksController
);

router.get(
  '/examinations/:examinationId/published',
  authorizeSchoolRoles(...marksViewRoles),
  getPublishedExaminationMarksController
);

router.post(
  '/:markRecordId/corrections',
  authorizeSchoolRoles(
    'TEACHER',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  requestMarkCorrectionController
);

router.get(
  '/:markRecordId/corrections',
  authorizeSchoolRoles(...marksViewRoles),
  getMarkCorrectionsController
);

router.get(
  '/examinations/:examinationId/pending-corrections',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  getPendingMarkCorrectionsController
);

router.post(
  '/corrections/:correctionId/review',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  reviewMarkCorrectionController
);

router.get(
  '/:markRecordId',
  authorizeSchoolRoles(...marksViewRoles),
  getMarkEntryController
);

router.patch(
  '/:markRecordId',
  authorizeSchoolRoles(...marksEntryRoles),
  updateMarkEntryController
);

export default router;
