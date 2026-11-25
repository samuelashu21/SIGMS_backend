
import { Router } from 'express';

import { authorizeSchoolRoles } from '../../schools/index.js';

import {
  createDailyAttendanceController,
  getDailyAttendanceController
} from '../controllers/daily-attendance.controller.js';

import {
  getClassAttendanceByIdController,
  getClassAttendanceListController,
  updateClassAttendanceController
} from '../controllers/class-attendance.controller.js';

import {
  getStudentAttendanceRecordsController,
  getStudentAttendanceRecordByIdController,
  updateStudentAttendanceRecordController
} from '../controllers/student-attendance.controller.js';

import {
  createAttendanceCorrectionController,
  getAttendanceCorrectionsController,
  reviewAttendanceCorrectionController
} from '../controllers/attendance-correction.controller.js';

import {
  submitClassAttendanceController,
  reviewClassAttendanceController,
  getPendingClassAttendanceController
} from '../controllers/attendance-approval.controller.js';
import { getSchoolAttendanceReportController, getSectionAttendanceReportController, getStudentAttendanceReportController } from '../controllers/attendance-report.controller.js';
import { getClassAttendanceSummaryController, getSchoolAttendanceSummaryController, getStudentAttendanceSummaryController } from '../controllers/attendance-summary.controller.js';
import { getAttendanceCorrectionHistoryController, getClassAttendanceHistoryController, getStudentAttendanceHistoryController } from '../controllers/attendance-history.controller.js';

const router = Router();

// Daily attendance
router.post(
  '/daily',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  createDailyAttendanceController
);

router.get(
  '/sections/:sectionId/daily',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getDailyAttendanceController
);

// Class attendance
router.get(
  '/classes',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getClassAttendanceListController
);

router.get(
  '/classes/:attendanceId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getClassAttendanceByIdController
);

router.patch(
  '/classes/:attendanceId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  updateClassAttendanceController
);

// Attendance submission
router.post(
  '/classes/:attendanceId/submit',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  submitClassAttendanceController
);

// Pending attendance approvals
router.get(
  '/approvals/pending',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  getPendingClassAttendanceController
);

// Attendance approval or rejection
router.patch(
  '/classes/:attendanceId/review',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  reviewClassAttendanceController
);

// Individual student attendance
router.get(
  '/students/records',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getStudentAttendanceRecordsController
);

router.get(
  '/students/:studentId/records/:recordId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getStudentAttendanceRecordByIdController
);

router.patch(
  '/students/records/:recordId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  updateStudentAttendanceRecordController
);

// Attendance correction requests
router.post(
  '/corrections',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'TEACHER'
  ),
  createAttendanceCorrectionController
);

router.get(
  '/corrections',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getAttendanceCorrectionsController
);

router.patch(
  '/corrections/:correctionId/review',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  reviewAttendanceCorrectionController
);

// Attendance summaries
router.get(
  '/summaries/students/:studentId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getStudentAttendanceSummaryController
);

router.get(
  '/summaries/sections/:sectionId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getClassAttendanceSummaryController
);

router.get(
  '/summaries/school',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  getSchoolAttendanceSummaryController
);

// Attendance reports
router.get(
  '/reports/students/:studentId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getStudentAttendanceReportController
);

router.get(
  '/reports/sections/:sectionId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getSectionAttendanceReportController
);

router.get(
  '/reports/school',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL'
  ),
  getSchoolAttendanceReportController
);

router.get(
  '/history/students/:studentId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getStudentAttendanceHistoryController
);

router.get(
  '/history/sections/:sectionId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  getClassAttendanceHistoryController
);

router.get(
  '/history/records/:attendanceRecordId/corrections',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getAttendanceCorrectionHistoryController
);

export default router;
