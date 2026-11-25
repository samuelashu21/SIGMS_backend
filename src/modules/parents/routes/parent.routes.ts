
import { Router } from 'express';

import {
  createStudentGuardianController,
  getStudentGuardianRelationshipsController,
  getGuardianStudentRelationshipsController
} from '../controllers/student-guardian.controller.js';

import {
  verifyGuardianRelationshipController,
  getPendingGuardianRelationshipsController
} from '../controllers/guardian-relationship-verification.controller.js';

//import { authorizeSchoolRoles } from '../../schools/middlewares/school-role.middleware.js';

import {
  getGuardianChildrenController,
  getGuardianChildDetailsController
} from '../controllers/guardian-child-access.controller.js';
 
import {
  getGuardianPermissionsController,
  updateGuardianPermissionsController
} from '../controllers/guardian-permission.controller.js';

import {
  createGuardianContactController,
  getGuardianContactsController,
  updateGuardianContactController,
  deleteGuardianContactController
} from '../controllers/guardian-contact.controller.js';
import { authorizeSchoolRoles } from '../../schools/index.js';


// Authenticated parent access to verified children
const router = Router(); 

// Create and review relationships
const authorizeRelationshipManagement = authorizeSchoolRoles(
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'REGISTRAR'
);

// View relationship records
const authorizeRelationshipView = authorizeSchoolRoles(
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'PRINCIPAL',
  'VICE_PRINCIPAL',
  'REGISTRAR',
  'TEACHER'
);

// Student-guardian relationships
router.post(
  '/relationships',
  authorizeRelationshipManagement,
  createStudentGuardianController
);

router.get(
  '/students/:studentId/relationships',
  authorizeRelationshipView,
  getStudentGuardianRelationshipsController
);

router.get(
  '/guardians/:guardianId/relationships',
  authorizeRelationshipView,
  getGuardianStudentRelationshipsController
);

// Relationship verification
router.get(
  '/relationships/pending',
  authorizeRelationshipManagement,
  getPendingGuardianRelationshipsController
);

router.patch(
  '/relationships/:relationshipId/verification',
  authorizeRelationshipManagement,
  verifyGuardianRelationshipController
);



// Authenticated parent access to verified children
router.get(
  '/my-children',
  authorizeSchoolRoles('PARENT'),
  getGuardianChildrenController
);

router.get(
  '/my-children/:studentId',
  authorizeSchoolRoles('PARENT'),
  getGuardianChildDetailsController
);



router.get(
  '/relationships/:relationshipId/permissions',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getGuardianPermissionsController
);

router.patch(
  '/relationships/:relationshipId/permissions',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  updateGuardianPermissionsController
);



router.post(
  '/guardians/:guardianId/contacts',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  createGuardianContactController
);

router.get(
  '/guardians/:guardianId/contacts',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  getGuardianContactsController
);

router.patch(
  '/guardians/:guardianId/contacts/:contactId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  updateGuardianContactController
);

router.delete(
  '/guardians/:guardianId/contacts/:contactId',
  authorizeSchoolRoles(
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'VICE_PRINCIPAL',
    'REGISTRAR'
  ),
  deleteGuardianContactController
);



export default router;
