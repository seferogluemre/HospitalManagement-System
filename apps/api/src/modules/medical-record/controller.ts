import { auth } from "#modules/auth/authentication/plugin.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../audit-logs";
import {
  medicalRecordCreateDto,
  medicalRecordDestroyDto,
  medicalRecordShowDto,
  medicalRecordsIndexDto,
  medicalRecordUpdateDto,
} from "./dtos";
import { MedicalRecordFormatter } from "./formatters";
import { MedicalRecordService } from "./service";

const app = new Elysia({
  prefix: "/medical-records",
  detail: {
    tags: ["Medical Records"],
  },
})
  .use(auth())
  .post(
    "",
    async ({ body }) => {
      const medicalRecord = await MedicalRecordService.store(body);
      return MedicalRecordFormatter.response(medicalRecord);
    },
    dtoWithMiddlewares(
      medicalRecordCreateDto,
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.MEDICAL_RECORD,
        getEntityUuid: (context: any) => {
          return context.response?.uuid || context.body?.uuid || 'unknown';
        },
        getDescription: () => "Yeni tıbbi kayıt oluşturuldu",
      })
    )
  )
  .get(
    "",
    async ({ query }) => {
      const medicalRecords = await MedicalRecordService.index({
        doctorId: query.doctorId ? Number(query.doctorId) : undefined,
        patientId: query.patientId ? Number(query.patientId) : undefined,
        search: query.search,
        page: query.page,
        limit: query.limit,
      });
      return medicalRecords.map(MedicalRecordFormatter.response);
    },
    medicalRecordsIndexDto
  )
  .get(
    "/:uuid",
    async ({ params: { uuid } }) => {
      if (!uuid) {
        throw new BadRequestException("Tıbbi kayıt UUID gereklidir");
      }
      const medicalRecord = await MedicalRecordService.show({ uuid });
      return MedicalRecordFormatter.response(medicalRecord);
    },
    medicalRecordShowDto
  )
  .patch(
    "/:uuid",
    async ({ params: { uuid }, body }) => {
      const updatedMedicalRecord = await MedicalRecordService.update(uuid, body);
      return MedicalRecordFormatter.response(updatedMedicalRecord);
    },
    dtoWithMiddlewares(
      medicalRecordUpdateDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.MEDICAL_RECORD,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Tıbbi kayıt güncellendi",
      })
    )
  )
  .delete(
    "/:uuid",
    async ({ params: { uuid } }) => {
      await MedicalRecordService.destroy(uuid);
      return { message: "Tıbbi kayıt başarıyla silindi" };
    },
    dtoWithMiddlewares(
      medicalRecordDestroyDto,
      withAuditLog({
        actionType: AuditLogAction.DELETE,
        entityType: AuditLogEntity.MEDICAL_RECORD,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Tıbbi kayıt silindi",
      })
    )
  )
  .post(
    "/:uuid/restore",
    async ({ params: { uuid } }) => {
      const medicalRecord = await MedicalRecordService.restore(uuid);
      return MedicalRecordFormatter.response(medicalRecord);
    },
    dtoWithMiddlewares(
      medicalRecordShowDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.MEDICAL_RECORD,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Tıbbi kayıt geri yüklendi",
      })
    )
  );

export default app;