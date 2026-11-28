
import { Router } from 'express';

import {
  createPromotionConfigurationController,
  getPromotionConfigurationsController,
  updatePromotionConfigurationController,
  deactivatePromotionConfigurationController
} from '../controllers/promotion-configuration.controller.js';

import {
  assessPromotionEligibilityController
} from '../controllers/promotion-eligibility.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';
import { retainStudentController } from '../controllers/student-retention.controller.js';
import { promoteStudentController } from '../controllers/student-promotion.controller.js';
import { createGradeProgressionRuleController, getGradeProgressionRulesController, updateGradeProgressionRuleController } from '../controllers/grade-progression.controller.js';
import { assessGraduationCandidateController, getGraduationCandidatesController, reviewGraduationCandidateController } from '../controllers/graduation-management.controller.js';
import { createGraduationConfigurationController, getGraduationConfigurationsController } from '../controllers/graduation-configuration.controller.js';
import { createGraduationRecordController, getGraduationRecordController, getStudentGraduationRecordsController, revokeGraduationRecordController } from '../controllers/graduation-record.controller.js';
import {
  getStudentAcademicProgressionHistoryController,
  getSchoolAcademicProgressionHistoryController
} from '../controllers/academic-progression-history.controller.js';
 
const router = Router({ mergeParams: true });

const managementRoles = [
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL'
] as const;

router.post(
  '/configurations',
  authorizeSchoolRoles(...managementRoles),
  createPromotionConfigurationController
);

router.get(
  '/configurations',
  authorizeSchoolRoles(...managementRoles),
  getPromotionConfigurationsController
);

router.patch(
  '/configurations/:configurationId',
  authorizeSchoolRoles(...managementRoles),
  updatePromotionConfigurationController
);

router.patch(
  '/configurations/:configurationId/deactivate',
  authorizeSchoolRoles(...managementRoles),
  deactivatePromotionConfigurationController
);

router.post(
  '/eligibility/assess',
  authorizeSchoolRoles(...managementRoles),
  assessPromotionEligibilityController
);
router.post(
  '/students/promote',
  authorizeSchoolRoles(...managementRoles),
  promoteStudentController
);

router.post(
  '/students/retain',
  authorizeSchoolRoles(...managementRoles),
  retainStudentController
);

router.post(
  '/grade-progression',
  authorizeSchoolRoles(...managementRoles),
  createGradeProgressionRuleController
);

router.get(
  '/grade-progression',
  authorizeSchoolRoles(...managementRoles),
  getGradeProgressionRulesController
);

router.patch(
  '/grade-progression/:ruleId',
  authorizeSchoolRoles(...managementRoles),
  updateGradeProgressionRuleController
);


// Graduation configuration
router.post(
  '/graduation/configurations',
  authorizeSchoolRoles(...managementRoles),
  createGraduationConfigurationController
);

router.get(
  '/graduation/configurations',
  authorizeSchoolRoles(...managementRoles),
  getGraduationConfigurationsController
);

// Graduation candidate assessment
router.post(
  '/graduation/candidates/assess',
  authorizeSchoolRoles(...managementRoles),
  assessGraduationCandidateController
);

// Graduation candidate listing
router.get(
  '/graduation/candidates',
  authorizeSchoolRoles(...managementRoles),
  getGraduationCandidatesController
);

// Graduation candidate review
router.patch(
  '/graduation/candidates/:candidateId/review',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  reviewGraduationCandidateController
);

router.post(
  '/graduation/records',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  createGraduationRecordController
);

router.get(
  '/graduation/records/:recordId',
  authorizeSchoolRoles(...managementRoles),
  getGraduationRecordController
);

router.get(
  '/graduation/students/:studentId/records',
  authorizeSchoolRoles(...managementRoles),
  getStudentGraduationRecordsController
);

router.patch(
  '/graduation/records/:recordId/revoke',
  authorizeSchoolRoles('SCHOOL_ADMIN', 'PRINCIPAL'),
  revokeGraduationRecordController
);

router.get(
  '/progression-history',
  authorizeSchoolRoles(...managementRoles),
  getSchoolAcademicProgressionHistoryController
);

router.get(
  '/students/:studentId/progression-history',
  authorizeSchoolRoles(...managementRoles),
  getStudentAcademicProgressionHistoryController
);

export default router;
