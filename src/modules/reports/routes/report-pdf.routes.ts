
import { Router } from 'express';

import {
  downloadReportCardPdfController,
  downloadTranscriptPdfController,
  downloadAttendanceReportPdfController,
  downloadExaminationReportPdfController
} from '../controllers/report-pdf.controller.js';

 
import { requirePublishedReportAccess } from '../middleware/report-access.middleware.js';
import { authorizeSchoolRoles } from '../../schools/index.js';

const router = Router({ mergeParams: true });

router.get(
  '/cards/:reportId/pdf',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  downloadReportCardPdfController
);

router.get(
  '/transcripts/:transcriptId/pdf',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  downloadTranscriptPdfController
);

router.get(
  '/attendance/:reportId/pdf',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  downloadAttendanceReportPdfController
);

router.get(
  '/examinations/:reportId/pdf',
  authorizeSchoolRoles(
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR',
    'TEACHER'
  ),
  downloadExaminationReportPdfController
);




 
router.get(
  '/cards/:reportId/pdf',
  requirePublishedReportAccess('REPORT_CARD'),
  downloadReportCardPdfController
);

router.get(
  '/transcripts/:transcriptId/pdf',
  requirePublishedReportAccess('TRANSCRIPT', 'transcriptId'),
  downloadTranscriptPdfController
);

router.get(
  '/attendance/:reportId/pdf',
  requirePublishedReportAccess('ATTENDANCE'),
  downloadAttendanceReportPdfController
);

router.get(
  '/examinations/:reportId/pdf',
  requirePublishedReportAccess('EXAMINATION'),
  downloadExaminationReportPdfController
);

export default router;


