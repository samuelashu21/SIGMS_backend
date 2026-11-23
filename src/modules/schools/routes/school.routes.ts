
import { Router } from 'express';

import {
  authenticate,
  authorizeRoles
} from '../../auth/middleware/index.js';

import {
  requireSchoolMembership,
  authorizeSchoolRoles
} from '../middleware/index.js';

import {
  registerSchoolController,
  getSchoolProfileController,
  updateSchoolProfileController
} from '../controllers/school.controller.js';

import {
  createSchoolAdministratorController
} from '../controllers/school-admin.controller.js';

import {
  getSchoolMembershipsController,
  updateSchoolMembershipController
} from '../controllers/school-membership.controller.js';

import {
  getSchoolConfigurationController,
  updateSchoolConfigurationController
} from '../controllers/school-configuration.controller.js';

import {
  getSchoolSettingsController,
  updateSchoolSettingsController
} from '../controllers/school-settings.controller.js';

import {
  tenantIsolationMiddleware
} from '../middleware/tenant-isolation.middleware.js';
import { getSchoolStudentController, getSchoolStudentsController } from '../controllers/tenant-data.controller.js';


import {
  createAcademicYearController,
  getAcademicYearsController,
  getAcademicYearController,
  updateAcademicYearController,
  setCurrentAcademicYearController
} from '../../academic/controllers/academic-year.controller.js';

import {
  createSemesterController,
  getSemestersController,
  updateSemesterController,
  setCurrentSemesterController
} from '../../academic/controllers/semester.controller.js';


import {
  createGradeController,
  getGradesController,
  getGradeController,
  updateGradeController
} from '../../academic/controllers/grade.controller.js';

import {
  createSectionController,
  getSectionsController,
  getSectionController,
  updateSectionController
} from '../../academic/controllers/section.controller.js';

import {
  createSubjectController,
  getSubjectsController,
  getSubjectController,
  updateSubjectController
} from '../../academic/controllers/subject.controller.js';

import {
  assignSubjectToGradeController,
  getGradeSubjectAssignmentsController,
  updateGradeSubjectAssignmentController,
  removeGradeSubjectAssignmentController
} from '../../academic/controllers/grade-subject.controller.js';

import {
  getAcademicConfigurationController,
  createAcademicConfigurationController,
  updateAcademicConfigurationController
} from '../../academic/controllers/academic-configuration.controller.js';

import {
  createGradingSystemController,
  getGradingSystemsController,
  getGradingSystemController,
  updateGradingSystemController,
  setDefaultGradingSystemController,
  replaceGradeScalesController
} from '../../academic/controllers/grading-system.controller.js';
import { createCalendarEventController, deleteCalendarEventController, getCalendarEventController, getCalendarEventsController, updateCalendarEventController } from '../../academic/controllers/academic-calendar.controller.js';
import { createAdmissionApplicationController, getAdmissionApplicationController, getAdmissionApplicationsController, updateAdmissionApplicationController } from '../../admissions/controllers/admission-application.controller.js';
import { getApplicantInformationController, saveApplicantInformationController } from '../../admissions/controllers/applicant-information.controller.js';
import { deleteAdmissionDocumentController, downloadAdmissionDocumentController, getAdmissionDocumentsController, uploadAdmissionDocumentController } from '../../admissions/controllers/admission-document.controller.js';
import { admissionUpload } from '../../admissions/middleware/admission-upload.middleware.js';
import { createAdmissionReviewController, getAdmissionReviewsController } from '../../admissions/controllers/admission-review.controller.js';
import { submitAdmissionApplicationController } from '../../admissions/controllers/admission-submission.controller.js';
import { approveAdmissionApplicationController, rejectAdmissionApplicationController } from '../../admissions/controllers/admission-decision.controller.js';
import { getAdmissionStatusHistoryController } from '../../admissions/controllers/admission-history.controller.js';
import { updateAdmissionStatusController } from '../../admissions/controllers/admission-status.controller.js';
import { getStudentProfileController, updateStudentProfileController } from '../../enrollments/controllers/student-profile.controller.js';
import { registerStudentController } from '../../enrollments/controllers/student-registration.controller.js';
import {
  assignStudentIdentificationController
} from '../../enrollments/controllers/student-identification.controller.js';
import { createAcademicEnrollmentController, getStudentAcademicEnrollmentsController } from '../../enrollments/controllers/academic-enrollment.controller.js';
import {
  assignStudentGradeController,
  getStudentGradeAssignmentsController
} from '../../enrollments/controllers/grade-assignment.controller.js';

import {
  assignStudentSectionController
} from '../../enrollments/controllers/section-assignment.controller.js';

import {
  createStudentTransferController,
  decideStudentTransferController,
  getStudentTransfersController
} from '../../enrollments/controllers/student-transfer.controller.js';

import {
  updateEnrollmentStatusController
} from '../../enrollments/controllers/enrollment-status.controller.js';
import { getEnrollmentHistoryController } from '../../enrollments/controllers/enrollment-history.controller.js';
import { createStudentAcademicRecordController, getStudentAcademicRecordsController } from '../../enrollments/controllers/student-academic-record.controller.js';

const router = Router();

router.use(authenticate);

// Platform-level school registration
router.post(
  '/',
  authorizeRoles('SUPER_ADMIN'),
  registerSchoolController
);

// Platform-level administrator creation
router.post(
  '/:schoolId/administrators',
  authorizeRoles('SUPER_ADMIN'),
  createSchoolAdministratorController
);

// School-specific authorization
router.use('/:schoolId', requireSchoolMembership);

// School profile
router.get(
  '/:schoolId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getSchoolProfileController
);

router.patch(
  '/:schoolId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  updateSchoolProfileController
);

// Membership management
router.get(
  '/:schoolId/memberships',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  getSchoolMembershipsController
);

router.patch(
  '/:schoolId/memberships/:membershipId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  updateSchoolMembershipController
);

// School configuration
router.get(
  '/:schoolId/configuration',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  getSchoolConfigurationController
);

router.patch(
  '/:schoolId/configuration',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  updateSchoolConfigurationController
);

// School settings
router.get(
  '/:schoolId/settings',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  getSchoolSettingsController
);

router.patch(
  '/:schoolId/settings',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN'),
  updateSchoolSettingsController
);

router.use('/:schoolId', requireSchoolMembership);


router.get(
  '/:schoolId/students',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getSchoolStudentsController
);

router.get(
  '/:schoolId/students/:studentId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getSchoolStudentController
);


// Academic year management
router.post(
  '/:schoolId/academic-years',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  createAcademicYearController
);

router.get(
  '/:schoolId/academic-years',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getAcademicYearsController
);

router.get(
  '/:schoolId/academic-years/:academicYearId',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getAcademicYearController
);

router.patch(
  '/:schoolId/academic-years/:academicYearId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  updateAcademicYearController
);

router.patch(
  '/:schoolId/academic-years/:academicYearId/current',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  setCurrentAcademicYearController
);

// Semester management
router.post(
  '/:schoolId/academic-years/:academicYearId/semesters',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  createSemesterController
);

router.get(
  '/:schoolId/academic-years/:academicYearId/semesters',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getSemestersController
);

router.patch(
  '/:schoolId/semesters/:semesterId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  updateSemesterController
);

router.patch(
  '/:schoolId/semesters/:semesterId/current',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  setCurrentSemesterController
);


// Grade management
router.post(
  '/:schoolId/grades',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  createGradeController
);

router.get(
  '/:schoolId/grades',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getGradesController
);

router.get(
  '/:schoolId/grades/:gradeId',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getGradeController
);

router.patch(
  '/:schoolId/grades/:gradeId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  updateGradeController
);

// Section management
router.post(
  '/:schoolId/sections',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  createSectionController
);

router.get(
  '/:schoolId/sections',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getSectionsController
);

router.get(
  '/:schoolId/sections/:sectionId',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getSectionController
);

router.patch(
  '/:schoolId/sections/:sectionId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  updateSectionController
);


// Subject management
router.post(
  '/:schoolId/subjects',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  createSubjectController
);

router.get(
  '/:schoolId/subjects',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getSubjectsController
);

router.get(
  '/:schoolId/subjects/:subjectId',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getSubjectController
);

router.patch(
  '/:schoolId/subjects/:subjectId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  updateSubjectController
);

// Subject-grade assignments
router.post(
  '/:schoolId/grade-subjects',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  assignSubjectToGradeController
);

router.get(
  '/:schoolId/grades/:gradeId/subjects',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getGradeSubjectAssignmentsController
);

router.patch(
  '/:schoolId/grade-subjects/:assignmentId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  updateGradeSubjectAssignmentController
);

router.delete(
  '/:schoolId/grade-subjects/:assignmentId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  removeGradeSubjectAssignmentController
);


// Academic configuration
router.post(
  '/:schoolId/academic-configuration',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  createAcademicConfigurationController
);

router.get(
  '/:schoolId/academic-configuration',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getAcademicConfigurationController
);

router.patch(
  '/:schoolId/academic-configuration',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  updateAcademicConfigurationController
);

// Grading systems
router.post(
  '/:schoolId/grading-systems',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  createGradingSystemController
);

router.get(
  '/:schoolId/grading-systems',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getGradingSystemsController
);

router.get(
  '/:schoolId/grading-systems/:gradingSystemId',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR', 'TEACHER'
  ),
  getGradingSystemController
);

router.patch(
  '/:schoolId/grading-systems/:gradingSystemId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  updateGradingSystemController
);

router.patch(
  '/:schoolId/grading-systems/:gradingSystemId/default',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  setDefaultGradingSystemController
);

router.put(
  '/:schoolId/grading-systems/:gradingSystemId/grade-scales',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  replaceGradeScalesController
);

// Academic calendar
router.post(
  '/:schoolId/calendar-events',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  createCalendarEventController
);

router.get(
  '/:schoolId/calendar-events',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER',
    'STUDENT',
    'PARENT'
  ),
  getCalendarEventsController
);

router.get(
  '/:schoolId/calendar-events/:eventId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER',
    'STUDENT',
    'PARENT'
  ),
  getCalendarEventController
);

router.patch(
  '/:schoolId/calendar-events/:eventId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'),
  updateCalendarEventController
);

router.delete(
  '/:schoolId/calendar-events/:eventId',
  authorizeSchoolRoles('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'),
  deleteCalendarEventController
);


// Registrar-managed admission applications

router.post(
  '/:schoolId/admissions',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  createAdmissionApplicationController
);

router.get(
  '/:schoolId/admissions',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getAdmissionApplicationsController
);

router.get(
  '/:schoolId/admissions/:applicationId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getAdmissionApplicationController
);

router.patch(
  '/:schoolId/admissions/:applicationId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  updateAdmissionApplicationController
);

router.get(
  '/:schoolId/admissions/:applicationId/applicant-information',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR'
  ),
  getApplicantInformationController
);

router.put(
  '/:schoolId/admissions/:applicationId/applicant-information',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'
  ),
  saveApplicantInformationController
);

// Admission document management

router.post(
  '/:schoolId/admissions/:applicationId/documents',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'
  ),
  admissionUpload,
  uploadAdmissionDocumentController
);

router.get(
  '/:schoolId/admissions/:applicationId/documents',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR'
  ),
  getAdmissionDocumentsController
);

router.get(
  '/:schoolId/admissions/:applicationId/documents/:documentId/download',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL',
    'VICE_PRINCIPAL', 'REGISTRAR'
  ),
  downloadAdmissionDocumentController
);

router.delete(
  '/:schoolId/admissions/:applicationId/documents/:documentId',
  authorizeSchoolRoles(
    'SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'REGISTRAR'
  ),
  deleteAdmissionDocumentController
);

// Application submission
router.post(
  '/:schoolId/admissions/:applicationId/submit',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  submitAdmissionApplicationController
);

// Application review
router.post(
  '/:schoolId/admissions/:applicationId/reviews',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  createAdmissionReviewController
);

router.get(
  '/:schoolId/admissions/:applicationId/reviews',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getAdmissionReviewsController
);

// Admission application approval
router.post(
  '/:schoolId/admissions/:applicationId/approve',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  approveAdmissionApplicationController
);

// Admission application rejection
router.post(
  '/:schoolId/admissions/:applicationId/reject',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  rejectAdmissionApplicationController
);

// Admission status management
router.patch(
  '/:schoolId/admissions/:applicationId/status',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  updateAdmissionStatusController
);

// Admission status history
router.get(
  '/:schoolId/admissions/:applicationId/history',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getAdmissionStatusHistoryController
);

// Student registration from approved admission
router.post(
  '/:schoolId/students/from-admission/:applicationId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  registerStudentController
);

// Student profile management
router.get(
  '/:schoolId/students/:studentId/profile',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getStudentProfileController
);

router.patch(
  '/:schoolId/students/:studentId/profile',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  updateStudentProfileController
);

router.post(
  '/:schoolId/students/:studentId/identification-number',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  assignStudentIdentificationController
);

// Academic enrollment
router.post(
  '/:schoolId/students/:studentId/enrollments',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  createAcademicEnrollmentController
);

router.get(
  '/:schoolId/students/:studentId/enrollments',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getStudentAcademicEnrollmentsController
);

// Grade assignment
router.patch(
  '/:schoolId/enrollments/:enrollmentId/grade',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  assignStudentGradeController
);

// Student grade assignment history
router.get(
  '/:schoolId/students/:studentId/grade-assignments',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getStudentGradeAssignmentsController
);

// Section assignment
router.patch(
  '/:schoolId/enrollments/:enrollmentId/section',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  assignStudentSectionController
);

// Student transfer requests
router.post(
  '/:schoolId/students/:studentId/transfers',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  createStudentTransferController
);

// Review and approve/reject transfer requests
router.patch(
  '/:schoolId/transfers/:transferId/decision',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL'
  ),
  decideStudentTransferController
);

// Retrieve student transfer records
router.get(
  '/:schoolId/students/:studentId/transfers',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getStudentTransfersController
);

// Academic enrollment status
router.patch(
  '/:schoolId/enrollments/:enrollmentId/status',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'REGISTRAR'
  ),
  updateEnrollmentStatusController
);

router.get(
  '/:schoolId/enrollments/:enrollmentId/history',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getEnrollmentHistoryController
);

// Create academic record
router.post(
  '/:schoolId/students/:studentId/academic-records',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER',
    'REGISTRAR'
  ),
  createStudentAcademicRecordController
);

// Retrieve academic records
router.get(
  '/:schoolId/students/:studentId/academic-records',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER',
    'REGISTRAR'
  ),
  getStudentAcademicRecordsController
);

export default router;
