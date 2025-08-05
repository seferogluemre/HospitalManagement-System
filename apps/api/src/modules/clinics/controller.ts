import { auth } from "#modules/auth/authentication/plugin.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../audit-logs";
import { clinicCreateDto, clinicDestroyDto, clinicIndexDto, clinicShowDto, clinicUpdateDto } from "./dtos";
import { ClinicFormatter } from "./formatters";
import { ClinicService } from "./service";
import { PERMISSIONS, withPermission } from "../auth";

const app = new Elysia({
  prefix: "/clinics",
  detail: {
    tags: ["Clinics"],
  },
})
  .use(auth())
  .post(
    "",
    async ({ body }) => {
      const clinic = await ClinicService.store(body);
      return ClinicFormatter.response(clinic);
    },
    dtoWithMiddlewares(
      clinicCreateDto,
      withPermission(PERMISSIONS.CLINICS.CREATE),
       withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.CLINIC,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Klinik Oluşturuldu",
      })
    )
  )
  .get(
    "",
    async ({ query }) => {
      const clinics = await ClinicService.index({
        search: query.search,
        page: query.page,
        limit: query.limit,
      });
      const response = clinics.map(ClinicFormatter.response);
      return response;
    },
    clinicIndexDto
  )
  .get(
    "/:uuid",
    async ({ params: { uuid } }) => {
      if (!uuid) {
        throw new BadRequestException("Doktor ID gereklidir");
      }
      const clinic = await ClinicService.show({ uuid: uuid });
      const response = ClinicFormatter.response(clinic);
      return response;
    },
    clinicShowDto
  )
  .patch(
    "/:uuid", 
    async ({ params: { uuid }, body }) => {
      const updatedClinic = await ClinicService.update(uuid, body);
      const response = ClinicFormatter.response(updatedClinic);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      clinicUpdateDto,
      withPermission(PERMISSIONS.CLINICS.UPDATE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.CLINIC,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Klinik bilgileri güncellendi",
      })
    )
  )
  .delete(
    "/:uuid", // destroy
    async ({ params: { uuid } }) => {
      await ClinicService.destroy(uuid);
      return { message: "Klinik başarıyla silindi" };
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      clinicDestroyDto,
      withPermission(PERMISSIONS.CLINICS.DESTROY),
      withAuditLog({
        actionType: AuditLogAction.DELETE,
        entityType: AuditLogEntity.CLINIC,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Klinik silindi",
      })
    )
  )
  .post(
    "/:uuid/restore", // restore
    async ({ params: { uuid } }) => {
      const clinic = await ClinicService.restore(uuid);
      const response = ClinicFormatter.response(clinic);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      clinicShowDto,
      withPermission(PERMISSIONS.CLINICS.RESTORE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.CLINIC,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Klinik geri yüklendi",
      })
    )
  )

export default app;