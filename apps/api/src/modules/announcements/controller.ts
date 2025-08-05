import { auth } from "#modules/auth/authentication/plugin.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../audit-logs";
import { PERMISSIONS, withPermission } from "../auth";
import {
  announcementCreateDto,
  announcementDestroyDto,
  announcementShowDto,
  announcementsIndexDto,
  announcementUpdateDto,
} from "./dtos";
import { AnnouncementFormatter } from "./formatters";
import { AnnouncementService } from "./service";
import type { Announcement } from "./types";

const app = new Elysia({
  prefix: "/announcements",
  detail: {
    tags: ["Announcements"],
  },
})
  .use(auth())
  .post(
    "",
    async ({ body }) => {
      const announcement = await AnnouncementService.store(body);
      return AnnouncementFormatter.response(announcement as unknown as Announcement);
    },
    dtoWithMiddlewares(
      announcementCreateDto,
      withPermission(PERMISSIONS.ANNOUNCEMENTS.CREATE),
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.ANNOUNCEMENT,
        getEntityUuid: (context: any) => context.response?.uuid || "unknown",
        getDescription: () => "Yeni duyuru oluşturuldu",
      })
    )
  )
  .get(
    "",
    async ({ query }) => {
      const announcements = await AnnouncementService.index({
        search: query.search,
        isActive: query.isActive,
        authorId: query.authorId,
        targetRole: query.targetRole,
        page: query.page,
        limit: query.limit,
      });
      const response = announcements.map((announcement: any) => AnnouncementFormatter.response(announcement));
      return response;
    },
    dtoWithMiddlewares(
      announcementsIndexDto,
      withPermission(PERMISSIONS.ANNOUNCEMENTS.READ)
    )
  )
  .get(
    "/:uuid",
    async ({ params: { uuid } }) => {
      if (!uuid) {
        throw new BadRequestException("Duyuru ID gereklidir");
      }
      const announcement = await AnnouncementService.show({ uuid: uuid });
      const response = AnnouncementFormatter.response(announcement as unknown as Announcement);
      return response;
    },
    dtoWithMiddlewares(
      announcementShowDto,
      withPermission(PERMISSIONS.ANNOUNCEMENTS.SHOW)
    )
  )
  .patch(
    "/:uuid", // update
    async ({ params: { uuid }, body }) => {
      const updatedAnnouncement = await AnnouncementService.update(uuid, body);
      const response = AnnouncementFormatter.response(updatedAnnouncement as unknown as Announcement);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      announcementUpdateDto,
      withPermission(PERMISSIONS.ANNOUNCEMENTS.UPDATE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.ANNOUNCEMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Duyuru bilgileri güncellendi",
      })
    )
  )
  .delete(
    "/:uuid", // destroy
    async ({ params: { uuid } }) => {
      await AnnouncementService.destroy(uuid);
      return { message: "Duyuru başarıyla silindi" };
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      announcementDestroyDto,
      withPermission(PERMISSIONS.ANNOUNCEMENTS.DESTROY),
      withAuditLog({
        actionType: AuditLogAction.DELETE,
        entityType: AuditLogEntity.ANNOUNCEMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Duyuru silindi",
      })
    )
  )
  .post(
    "/:uuid/restore", // restore
    async ({ params: { uuid } }) => {
      const announcement = await AnnouncementService.restore(uuid);
      const response = AnnouncementFormatter.response(announcement as unknown as Announcement);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      announcementShowDto,
      withPermission(PERMISSIONS.ANNOUNCEMENTS.UPDATE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.ANNOUNCEMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Duyuru geri yüklendi",
      })
    )
  );

export default app;