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