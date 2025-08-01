import { auth } from "#modules/auth/authentication/plugin.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../audit-logs";
import { secretariesIndexDto, secretaryCreateDto, secretaryDestroyDto, secretaryShowDto, secretaryUpdateDto } from "./dtos";
import { SecretaryFormatter } from "./formatters";
import { SecretaryService } from "./service";

const app = new Elysia({
  prefix: "/secretaries",
  detail: {
    tags: ["Secretaries"],
  },
})
  .use(auth())
  .post(
    "",
    async ({ body }) => {
      const secretary = await SecretaryService.store(body);
      return SecretaryFormatter.response(secretary);
    },
    dtoWithMiddlewares(
      secretaryCreateDto,
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: (context: any) => context.body.tcNo,
        getDescription: () => "Yeni Sekreter oluşturuldu",
      })
    )
  )
  .get(
    "",
    async ({ query }) => {
      const secretaries = await SecretaryService.index({
        search: query.search,
        page: query.page,
        limit: query.limit,
      });
      const response = secretaries.map(SecretaryFormatter.response);
      return response;
    },
    secretariesIndexDto
  )
  .get(
    "/:uuid",
    async ({ params: { uuid } }) => {
      if (!uuid || uuid === "undefined") {
        throw new BadRequestException("Sekreter ID gereklidir");
      }
      const secretary = await SecretaryService.show({ uuid: uuid });
      const response = SecretaryFormatter.response(secretary);
      return response;
    },
    secretaryShowDto
  )
  .patch(
    "/:uuid", // update
    async ({ params: { uuid }, body }) => {
      const updatedSecretary = await SecretaryService.update(uuid, body);
      const response = SecretaryFormatter.response(updatedSecretary);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      secretaryUpdateDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Sekreter bilgileri güncellendi",
      })
    )
  )
  .delete(
    "/:uuid", // destroy
    async ({ params: { uuid } }) => {
      await SecretaryService.destroy(uuid);
      return { message: "Hasta başarıyla silindi" };
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      secretaryDestroyDto,
      withAuditLog({
        actionType: AuditLogAction.DELETE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.id.toString(),
        getDescription: () => "Sekreter silindi",
      })
    )
  )
  .post(
    "/:uuid/restore", // restore
    async ({ params: { uuid } }) => {
      const secretary = await SecretaryService.restore(uuid);
      const response = SecretaryFormatter.response(secretary);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      secretaryShowDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.uuid.toString(),
        getDescription: () => "Sekreter geri yüklendi",
      })
    )
  )
export default app;