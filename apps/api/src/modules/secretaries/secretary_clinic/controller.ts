import { auth } from "#modules/auth/authentication/plugin.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../../audit-logs";
import {
  secretaryClinicCreateDto,
  secretaryClinicDestroyDto,
  secretaryClinicIndexDto,
  secretaryClinicShowDto,
  secretaryClinicUpdateDto
} from "./dtos";
import { SecretaryClinicFormatter } from "./formatters";
import { SecretaryClinicService } from "./service";

const app = new Elysia({
  prefix: "/secretary-clinics",
  detail: {
    tags: ["Secretary Clinics"],
  },
})
  .use(auth())
  .post(
    "",
    async ({ body }) => {
      const secretaryClinic = await SecretaryClinicService.store(body);
      return SecretaryClinicFormatter.response(secretaryClinic);
    },
    dtoWithMiddlewares(
      secretaryClinicCreateDto,
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: (context: any) => context.body.secretaryUuid,
        getDescription: () => "Sekreter-Klinik ataması oluşturuldu",
      })
    )
  )
  .get(
    "",
    async ({ query }) => {
      const secretaryClinics = await SecretaryClinicService.index({
        search: query.search,
        page: query.page,
        limit: query.limit,
        secretaryUuid: query.secretaryUuid,
        clinicUuid: query.clinicUuid,
      });
      const response = secretaryClinics.map(SecretaryClinicFormatter.response);
      return response;
    },
    secretaryClinicIndexDto
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const numericId = parseInt(id);
      if (!numericId || isNaN(numericId)) {
        throw new BadRequestException("Geçerli bir ID gereklidir");
      }
      const secretaryClinic = await SecretaryClinicService.show({ id: numericId });
      const response = SecretaryClinicFormatter.response(secretaryClinic);
      return response;
    },
    secretaryClinicShowDto
  )
  .patch(
    "/:id", // update
    async ({ params: { id }, body }) => {
      const numericId = parseInt(id);
      if (!numericId || isNaN(numericId)) {
        throw new BadRequestException("Geçerli bir ID gereklidir");
      }
      const updatedSecretaryClinic = await SecretaryClinicService.update(numericId, body);
      const response = SecretaryClinicFormatter.response(updatedSecretaryClinic);
      return response;
    },
    dtoWithMiddlewares(
      secretaryClinicUpdateDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.id,
        getDescription: () => "Sekreter-Klinik ataması güncellendi",
      })
    )
  )
  .delete(
    "/:id", // destroy
    async ({ params: { id } }) => {
      const numericId = parseInt(id);
      if (!numericId || isNaN(numericId)) {
        throw new BadRequestException("Geçerli bir ID gereklidir");
      }
      await SecretaryClinicService.destroy(numericId);
      return { message: "Sekreter-Klinik ataması başarıyla silindi" };
    },
    dtoWithMiddlewares(
      secretaryClinicDestroyDto,
      withAuditLog({
        actionType: AuditLogAction.DELETE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.id.toString(),
        getDescription: () => "Sekreter-Klinik ataması silindi",
      })
    )
  );

export default app;