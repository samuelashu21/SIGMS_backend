
import { Router } from 'express';

import { getAccessibleReportController } from '../controllers/accessible-report.controller.js';
import { requirePublishedReportAccess } from '../middleware/report-access.middleware.js';

const router = Router({ mergeParams: true });

router.get(
  '/:reportType/:reportId',
  (req, _res, next) => {
    const supportedTypes = [
      'REPORT_CARD',
      'TRANSCRIPT',
      'ATTENDANCE',
      'EXAMINATION'
    ];

    if (!supportedTypes.includes(req.params.reportType ?? '')) {
      return next(new Error('Unsupported report type.'));
    }

    next();
  },
  (req, res, next) => {
    const reportType = req.params.reportType;

    if (
      reportType !== 'REPORT_CARD' &&
      reportType !== 'TRANSCRIPT' &&
      reportType !== 'ATTENDANCE' &&
      reportType !== 'EXAMINATION'
    ) {
      return next(new Error('Unsupported report type.'));
    }

    return requirePublishedReportAccess(reportType)(
      req,
      res,
      next
    );
  },
  getAccessibleReportController
);

export default router;
