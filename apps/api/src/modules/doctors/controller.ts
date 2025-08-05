import { auth } from "#modules/auth/authentication/plugin.ts";
import { PERMISSIONS, withPermission } from "#modules/auth/index.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../audit-logs";
import {
  doctorCreateDto,
  doctorDestroyDto,
  doctorShowDto,
  doctorsIndexDto,
  doctorUpdateDto
} from "./dtos";
import { DoctorFormatter } from "./formatters";
import { DoctorService } from "./service";

const app = new Elysia({
  prefix: "/doctors",
  detail: {
    tags: ["Doctors"],
  },
})
  .use(auth())
  .post(
    "",
    async ({ body }) => {
      const doctor = await DoctorService.store(body);
      return DoctorFormatter.response(doctor);
    },
    dtoWithMiddlewares(
      doctorCreateDto,
      withPermission(PERMISSIONS.DOCTORS.CREATE),
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: (context: any) => context.body.tcNo,
        getDescription: () => "Yeni doktor oluşturuldu",
      })
    )
  )
  .get(
    "",
    async ({ query }) => {
      const doctors = await DoctorService.index({
        search: query.search,
        specialty: query.specialty,
        page: query.page,
        limit: query.limit,
      });
      const response = doctors.map(DoctorFormatter.response);
      return response;
    },
    dtoWithMiddlewares(
      doctorsIndexDto,
      withPermission(PERMISSIONS.DOCTORS.READ)
    )
  )
  .get(
    "/:uuid",
    async ({ params: { uuid } }) => {
      if (!uuid) {
        throw new BadRequestException("Doktor ID gereklidir");
      }
      const doctor = await DoctorService.show({ uuid: uuid });
      const response = DoctorFormatter.response(doctor);
      return response;
    },
    dtoWithMiddlewares(
      doctorShowDto,
      withPermission(PERMISSIONS.DOCTORS.SHOW)
    )
  )
  .patch(
    "/:uuid", // update
    async ({ params: { uuid }, body }) => {
      const updatedDoctor = await DoctorService.update(uuid, body);
      const response = DoctorFormatter.response(updatedDoctor);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      doctorUpdateDto,
      withPermission(PERMISSIONS.DOCTORS.UPDATE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Doktor bilgileri güncellendi",
      })
    )
  )
  .delete(
    "/:uuid", // destroy
    async ({ params: { uuid } }) => {
      await DoctorService.destroy(uuid);
      return { message: "Doktor başarıyla silindi" };
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      doctorDestroyDto,
      withPermission(PERMISSIONS.DOCTORS.DESTROY),
      withAuditLog({
        actionType: AuditLogAction.DELETE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Doktor silindi",
      })
    )
  )
  .post(
    "/:uuid/restore", // restore
    async ({ params: { uuid } }) => {
      const doctor = await DoctorService.restore(uuid);
      const response = DoctorFormatter.response(doctor);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      doctorShowDto,
      withPermission(PERMISSIONS.DOCTORS.UPDATE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Doktor geri yüklendi",
      })
    )
  )

export default app;