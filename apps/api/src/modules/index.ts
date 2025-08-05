import Elysia from 'elysia';
import { announcementController } from './announcements';
import { appointmentController } from './appointments';
import { authenticationController, rolesController } from './auth';
import { clinicController } from './clinics';
import { doctorController } from './doctors';
import { fileLibraryAssetsController } from './file-library-assets';
import { locationsController } from './locations';
import { patientController } from './patients';
import { postsController } from './posts';
import { secretaryController } from './secretaries';
import { secretaryClinicController } from './secretaries/secretary_clinic';
import { systemAdministrationController } from './system-administration';
import { treatmentController } from './treatments';
import { usersController } from './users';
import { prescriptionController } from './prescription';

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
  .use(secretaryClinicController)
  .use(clinicController)
  .use(appointmentController)
  .use(announcementController)
  .use(treatmentController)
  .use(prescriptionController)
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
  { name: 'Secretaries', description: 'Secretary endpoints' },
  { name: 'Secretary Clinics', description: 'Secretary-Clinic Assignment endpoints' },
  { name: 'Clinic', description: 'Clinic endpoints' },
  { name: 'Treatment', description: 'Treatment endpoints' },
  { name: 'Prescription', description: 'Prescription endpoints' },
];

export default app;