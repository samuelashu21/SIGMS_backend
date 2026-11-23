export { registerSchool } from './services/school.service.js';
export * from './types/school.types.js';
export * from './validators/create-school.validator.js';


export {
  getSchoolProfile,
  updateSchoolProfile
} from './services/school.service.js';

export {
  getSchoolConfiguration,
  updateSchoolConfiguration
} from './services/school-configuration.service.js';

export * from './validators/update-school.validator.js';
export * from './validators/school-configuration.validator.js';


export {
  createSchoolAdministrator
} from './services/school-admin.service.js';

export {
  getSchoolMemberships,
  updateSchoolMembership
} from './services/school-membership.service.js';

export * from './validators/create-school-admin.validator.js';
export * from './validators/update-school-membership.validator.js';


export {
  requireSchoolMembership,
  authorizeSchoolRoles
} from './middleware/index.js';

export * from './types/school-auth.types.js';
export * from './validators/school-settings.validator.js';

export {
  getSchoolSettings,
  updateSchoolSettings
} from './services/school-settings.service.js';