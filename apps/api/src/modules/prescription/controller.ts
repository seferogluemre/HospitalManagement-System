import { auth } from "#modules/auth/authentication/plugin.ts";
import { PERMISSIONS, withPermission } from "#modules/auth/index.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../audit-logs";
import {
  prescriptionCreateDto,
  prescriptionDestroyDto,
  prescriptionShowDto,
  prescriptionsIndexDto,
  prescriptionUpdateDto,
} from "./dtos";
import { PrescriptionFormatter } from "./formatters";
import { PrescriptionService } from "./service";

const app = new Elysia({
  prefix: "/prescriptions",
  detail: {
    tags: ["Prescriptions"],
  },
})
  .use(auth())
  .post(
    "",
    async ({ body }) => {
      const prescription = await PrescriptionService.store(body);
      return PrescriptionFormatter.response(prescription);
    },
    dtoWithMiddlewares(
      prescriptionCreateDto,
      withPermission(PERMISSIONS.PRESCRIPTIONS.CREATE),
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.PRESCRIPTION,
        getEntityUuid: (context: any) => context.body.uuid,
        getDescription: () => "Yeni reçete oluşturuldu",
      })
    )
  )
  .get(
    "",
    async ({ query }) => {
      const prescriptions = await PrescriptionService.index({
        doctorId: query.doctorId ? Number(query.doctorId) : undefined,
        appointmentId: query.appointmentId ? Number(query.appointmentId) : undefined,
        search: query.search,
        isActive: typeof query.isActive === "string" ? query.isActive === "true" : undefined,
        page: query.page,
        limit: query.limit,
      });
      return prescriptions.map(PrescriptionFormatter.response);
    },
    dtoWithMiddlewares(
      prescriptionsIndexDto,
      withPermission(PERMISSIONS.PRESCRIPTIONS.READ)
    )
  )
  .get(
    "/:uuid",
    async ({ params: { uuid } }) => {
      if (!uuid) {
        throw new BadRequestException("Reçete ID gereklidir");
      }
      const prescription = await PrescriptionService.show({ uuid });
      return PrescriptionFormatter.response(prescription);
    },
    dtoWithMiddlewares(
      prescriptionShowDto,
      withPermission(PERMISSIONS.PRESCRIPTIONS.SHOW)
    )
  )
  .patch(
    "/:uuid",
    async ({ params: { uuid }, body }) => {
      const updatedPrescription = await PrescriptionService.update(uuid, body);
      return PrescriptionFormatter.response(updatedPrescription);
    },
    dtoWithMiddlewares(
      prescriptionUpdateDto,
      withPermission(PERMISSIONS.PRESCRIPTIONS.UPDATE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.PRESCRIPTION,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Reçete güncellendi",
      })
    )
  )
  .delete(
    "/:uuid",
    async ({ params: { uuid } }) => {
      await PrescriptionService.destroy(uuid);
      return { message: "Reçete başarıyla silindi" };
    },
    dtoWithMiddlewares(
      prescriptionDestroyDto,
      withPermission(PERMISSIONS.PRESCRIPTIONS.DESTROY),
      withAuditLog({
        actionType: AuditLogAction.DELETE,
        entityType: AuditLogEntity.PRESCRIPTION,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Reçete silindi",
      })
    )
  )
  .post(
    "/:uuid/restore",
    async ({ params: { uuid } }) => {
      const prescription = await PrescriptionService.restore(uuid);
      return PrescriptionFormatter.response(prescription);
    },
    dtoWithMiddlewares(
      prescriptionShowDto,
      withPermission(PERMISSIONS.PRESCRIPTIONS.UPDATE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.PRESCRIPTION,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Reçete geri yüklendi",
      })
    )
  );

export default app;