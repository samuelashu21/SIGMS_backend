
import { Router } from 'express';

import {
  createExaminationTypeController,
  getExaminationTypesController,
  updateExaminationTypeController,
  deleteExaminationTypeController
} from '../controllers/examination-type.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';
import { getExaminationScheduleController, scheduleExaminationController } from '../controllers/examination-schedule.controller.js';
import { createExaminationController, deleteDraftExaminationController, getExaminationController, getExaminationsController, updateExaminationController } from '../controllers/examination.controller.js';
import { createAssignmentController, deleteDraftAssignmentController, getAssignmentController, getAssignmentsController, updateAssignmentController } from '../controllers/assignment.controller.js';
import { createQuizController, deleteDraftQuizController, getQuizController, getQuizzesController, updateQuizController } from '../controllers/quiz.controller.js';
import { getExaminationsByStatusController, updateExaminationStatusController } from '../controllers/examination-status.controller.js';
import { createExaminationGradingController, getExaminationGradingController, updateExaminationGradingController } from '../controllers/examination-grading.controller.js';
import { getExaminationHistoryController } from '../controllers/examination-history.controller.js';
 
const router = Router();

router.post(
  '/types',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  createExaminationTypeController
);

router.get(
  '/types',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationTypesController
);

router.patch(
  '/types/:typeId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  updateExaminationTypeController
);

router.delete(
  '/types/:typeId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  deleteExaminationTypeController
);

// Examination creation and management
router.post(
  '/',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  createExaminationController
);

router.get(
  '/',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationsController
);

// Schedule listing must be registered before /:examinationId.
router.get(
  '/schedule',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationScheduleController
);

// Quiz management
router.post(
  '/quizzes',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  createQuizController
);

router.get(
  '/quizzes',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getQuizzesController
);

router.get(
  '/quizzes/:quizId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  getQuizController
);

router.patch(
  '/quizzes/:quizId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  updateQuizController
);

router.delete(
  '/quizzes/:quizId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  deleteDraftQuizController
);

// Assignment management
router.post(
  '/assignments',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  createAssignmentController
);

router.get(
  '/assignments',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getAssignmentsController
);

router.get(
  '/assignments/:assignmentId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  getAssignmentController
);

router.patch(
  '/assignments/:assignmentId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  updateAssignmentController
);

router.delete(
  '/assignments/:assignmentId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  deleteDraftAssignmentController
);

// Examination grading configuration
router.post(
  '/:examinationId/grading-configuration',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  createExaminationGradingController
);

router.get(
  '/:examinationId/grading-configuration',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  getExaminationGradingController
);

router.patch(
  '/:examinationId/grading-configuration',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  updateExaminationGradingController
);

// Examination status management
router.get(
  '/by-status',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationsByStatusController
);

router.patch(
  '/:examinationId/status',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  updateExaminationStatusController
);

router.get(
  '/:examinationId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationController
);

router.patch(
  '/:examinationId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  updateExaminationController
);

router.get(
  '/:examinationId/history',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getExaminationHistoryController
);

router.delete(
  '/:examinationId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  deleteDraftExaminationController
);

// Examination scheduling
router.patch(
  '/:examinationId/schedule',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  scheduleExaminationController
);

export default router;
