import { auth } from "#modules/auth/authentication/plugin.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../audit-logs";
import {
    patientCreateDto,
    patientDestroyDto,
    patientShowDto,
    patientsIndexDto,
    patientUpdateDto,
} from "./dtos";
import { PatientFormatter } from "./formatters";
import { PatientService } from "./service";

const app = new Elysia({
  prefix: "/patients",
  detail: {
    tags: ["Patients"],
  },
})
  .use(auth())
  .post(
    "",
    async ({ body }) => {
      const patient = await PatientService.store(body);
      return PatientFormatter.response(patient);
    },
    dtoWithMiddlewares(
      patientCreateDto,
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: (context: any) => context.body.tcNo,
        getDescription: () => "Yeni hasta oluşturuldu",
      })
    )
  )
  .get(
    "",
    async ({ query }) => {
      const patients = await PatientService.index({
        search: query.search,
        familyDoctorId: query.familyDoctorId
          ? parseInt(query.familyDoctorId)
          : undefined,
        page: query.page,
        limit: query.limit,
      });
      const response = patients.map(PatientFormatter.response);
      return response;
    },
    patientsIndexDto
  )
  .get(
    "/:uuid", 
    async ({ params: { uuid } }) => {
      if (!uuid) {
        throw new BadRequestException("Hasta ID gereklidir");
      }
      const patient = await PatientService.show({ uuid: uuid });
      const response = PatientFormatter.response(patient);
      return response;
    },
    patientShowDto
  )
  .patch(
    "/:id", // update
    async ({ params: { id }, body }) => {
      const updatedPatient = await PatientService.update(id, body);
      const response = PatientFormatter.response(updatedPatient);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      patientUpdateDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.id.toString(),
        getDescription: () => "Hasta bilgileri güncellendi",
      })
    )
  )
  .delete(
    "/:id", // destroy
    async ({ params: { id } }) => {
      await PatientService.destroy(id);
      return { message: "Hasta başarıyla silindi" };
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      patientDestroyDto,
      withAuditLog({
        actionType: AuditLogAction.DELETE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.id.toString(),
        getDescription: () => "Hasta silindi",
      })
    )
  )
  .post(
    "/:id/restore", // restore
    async ({ params: { id } }) => {
      const patient = await PatientService.restore(id);
      const response = PatientFormatter.response(patient);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      patientShowDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.id.toString(),
        getDescription: () => "Hasta geri yüklendi",
      })
    )
  );

export default app;
