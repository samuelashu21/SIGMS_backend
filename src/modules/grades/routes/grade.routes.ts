
import { Router } from 'express';

import {
  createAcademicGradingConfigurationController,
  getAcademicGradingConfigurationsController,
  getAcademicGradingConfigurationController,
  updateAcademicGradingConfigurationController
} from '../controllers/academic-grading.controller.js';

import { authorizeSchoolRoles } from '../../schools/index.js';

import {
  calculateSubjectGradeController,
  getSubjectGradeResultsController
} from '../controllers/subject-grade.controller.js';

import {
  calculateSemesterAverageController,
  getSemesterAverageByStudentController,
  getSemesterAveragesController
} from '../controllers/semester-average.controller.js';

import {
  calculateAnnualAverageController,
  getAnnualAverageByStudentController,
  getAnnualAveragesController
} from '../controllers/annual-average.controller.js';
import {
  createSubjectWeightController,
  createSemesterWeightController,
  getSubjectWeightsController,
  getSemesterWeightsController,
  updateSubjectWeightController,
  updateSemesterWeightController,
  calculateWeightedSubjectGradeController,
  calculateWeightedSemesterAverageController,
  calculateWeightedAnnualAverageController
} from '../controllers/grade-weight.controller.js';
import {
  generateAcademicPerformanceSummaryController,
  getAcademicPerformanceSummariesController,
  getStudentAcademicPerformanceOverviewController
} from '../controllers/performance-summary.controller.js';

const router = Router();

// Roles allowed to manage academic grading configurations
const gradingManagementRoles = [
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL'
] as const;

// Roles allowed to calculate and view grades and averages
const gradeCalculationRoles = [
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'TEACHER'
] as const;

// ============================================
// ACADEMIC GRADING CONFIGURATIONS
// ============================================

router.post(
  '/grading-configurations',
  authorizeSchoolRoles(...gradingManagementRoles),
  createAcademicGradingConfigurationController
);

router.get(
  '/grading-configurations',
  authorizeSchoolRoles(...gradingManagementRoles),
  getAcademicGradingConfigurationsController
);

router.get(
  '/grading-configurations/:configurationId',
  authorizeSchoolRoles(...gradingManagementRoles),
  getAcademicGradingConfigurationController
);

router.patch(
  '/grading-configurations/:configurationId',
  authorizeSchoolRoles(...gradingManagementRoles),
  updateAcademicGradingConfigurationController
);

// ============================================
// ANNUAL AVERAGES
// ============================================

router.post(
  '/annual-averages/calculate',
  authorizeSchoolRoles(...gradeCalculationRoles),
  calculateAnnualAverageController
);

router.get(
  '/annual-averages',
  authorizeSchoolRoles(...gradeCalculationRoles),
  getAnnualAveragesController
);

router.get(
  '/annual-averages/students/:studentId',
  authorizeSchoolRoles(...gradeCalculationRoles),
  getAnnualAverageByStudentController
);

// ============================================
// SEMESTER AVERAGES
// ============================================

router.post(
  '/semester-averages/calculate',
  authorizeSchoolRoles(...gradeCalculationRoles),
  calculateSemesterAverageController
);

router.get(
  '/semester-averages',
  authorizeSchoolRoles(...gradeCalculationRoles),
  getSemesterAveragesController
);

router.get(
  '/semester-averages/students/:studentId',
  authorizeSchoolRoles(...gradeCalculationRoles),
  getSemesterAverageByStudentController
);

// ============================================
// SUBJECT GRADE RESULTS
// ============================================

router.post(
  '/subject-results/calculate',
  authorizeSchoolRoles(...gradeCalculationRoles),
  calculateSubjectGradeController
);

router.get(
  '/subject-results',
  authorizeSchoolRoles(...gradeCalculationRoles),
  getSubjectGradeResultsController
);

router.post(
  '/weights/subjects',
  authorizeSchoolRoles(...gradingManagementRoles),
  createSubjectWeightController
);

router.get(
  '/weights/subjects',
  authorizeSchoolRoles(...gradingManagementRoles),
  getSubjectWeightsController
);

router.patch(
  '/weights/subjects/:weightId',
  authorizeSchoolRoles(...gradingManagementRoles),
  updateSubjectWeightController
);

router.post(
  '/weights/semesters',
  authorizeSchoolRoles(...gradingManagementRoles),
  createSemesterWeightController
);

router.get(
  '/weights/semesters',
  authorizeSchoolRoles(...gradingManagementRoles),
  getSemesterWeightsController
);

router.patch(
  '/weights/semesters/:weightId',
  authorizeSchoolRoles(...gradingManagementRoles),
  updateSemesterWeightController
);

router.post(
  '/weighted-calculations/subject',
  authorizeSchoolRoles(...gradeCalculationRoles),
  calculateWeightedSubjectGradeController
);

router.post(
  '/weighted-calculations/semester',
  authorizeSchoolRoles(...gradeCalculationRoles),
  calculateWeightedSemesterAverageController
);

router.post(
  '/weighted-calculations/annual',
  authorizeSchoolRoles(...gradeCalculationRoles),
  calculateWeightedAnnualAverageController
);

router.post(
  '/performance-summaries/generate',
  authorizeSchoolRoles(...gradeCalculationRoles),
  generateAcademicPerformanceSummaryController
);

router.get(
  '/performance-summaries',
  authorizeSchoolRoles(...gradeCalculationRoles),
  getAcademicPerformanceSummariesController
);

router.get(
  '/performance-summaries/students/:studentId/overview',
  authorizeSchoolRoles(...gradeCalculationRoles),
  getStudentAcademicPerformanceOverviewController
);

export default router;
