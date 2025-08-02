import Elysia from 'elysia';
import { appointmentController } from './appointments';
import { authenticationController, rolesController } from './auth';
import { clinicController } from './clinics';
import { doctorController } from './doctors';
import { fileLibraryAssetsController } from './file-library-assets';
import { locationsController } from './locations';
import { patientController } from './patients';
import { postsController } from './posts';
import { secretaryController } from './secretaries';
import { systemAdministrationController } from './system-administration';
import { usersController } from './users';
import { announcementController } from './announcements';

const app = new Elysia()
  .use(systemAdministrationController)
  .use(usersController)
  .use(authenticationController)
  .use(rolesController)
  .use(postsController)
  .use(locationsController)
  .use(fileLibraryAssetsController)
  .use(patientController)
  .use(doctorController)
  .use(secretaryController)
  .use(clinicController)
  .use(appointmentController)
  .use(announcementController)
  .get(
    '/',
    () => ({
      message: 'Hello Elysia',
    }),
    {
      detail: {
        summary: 'Hello World',
      },
    },
  );

export const swaggerTags: { name: string; description: string }[] = [
  {
    name: 'System Administration',
    description: 'System Administration endpoints',
  },
  { name: 'Audit Logs', description: 'Audit Logs endpoints' },
  { name: 'User', description: 'User endpoints' },
  { name: 'Auth', description: 'Auth endpoints' },
  { name: 'Role', description: 'Role endpoints' },
  { name: 'Post', description: 'Post endpoints' },
  { name: 'Country', description: 'Country endpoints' },
  { name: 'State', description: 'State endpoints' },
  { name: 'City', description: 'City endpoints' },
  { name: 'Region', description: 'Region endpoints' },
  { name: 'Subregion', description: 'Subregion endpoints' },
  { name: 'File Library Assets', description: 'File Library Assets endpoints' },
  { name: 'Patient', description: 'Patient endpoints' },
  { name: 'Doctor', description: 'Doctor endpoints' },
  { name: 'Secretary', description: 'Secretary endpoints' },
  { name: 'Clinic', description: 'Clinic endpoints' },
];

export default app;