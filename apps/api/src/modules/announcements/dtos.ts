import { errorResponseDto } from "#utils/common-dtos.ts";
import type { ControllerHook } from "#utils/elysia-types.ts";
import { AnnouncementPlain } from "@onlyjs/db/prismabox/Announcement";
import { t } from "elysia";

export const announcementResponseSchema = t.Composite([
  t.Omit(AnnouncementPlain, ["id", "authorId", "deletedAt"]),
  t.Object({
    id: t.Number(),
    author: t.Object({
      uuid: t.Optional(t.String()),
      firstName: t.Optional(t.String()),
      lastName: t.Optional(t.String()),
      email: t.Optional(t.String()),
    }),
  }),
]);

export const announcementsIndexDto = {
  query: t.Object({
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    search: t.Optional(t.String()),
    isActive: t.Optional(t.String()),
    authorId: t.Optional(t.String()),
    targetRole: t.Optional(t.String()),
  }),
  response: {
    200: t.Array(announcementResponseSchema),
  },
  detail: {
    summary: "List Announcements",
  },
} satisfies ControllerHook;

export const announcementShowDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  response: {
    200: announcementResponseSchema,
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Show Announcement",
  },
} satisfies ControllerHook;

export const announcementCreateDto = {
  body: t.Object({
    title: t.String({ minLength: 2, maxLength: 255 }),
    content: t.String({ minLength: 2 }),
    isActive: t.Optional(t.Boolean()),
    targetRoles: t.Optional(t.Array(t.String())),
    authorId: t.String(),
  }),
  response: {
    200: announcementResponseSchema,
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Create Announcement",
  },
} satisfies ControllerHook;

export const announcementUpdateDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  body: t.Partial(
    t.Object({
      title: t.String({ minLength: 2, maxLength: 255 }),
      content: t.String({ minLength: 2 }),
      isActive: t.Boolean(),
      targetRoles: t.Array(t.String()),
    })
  ),
  response: {
    200: announcementResponseSchema,
    404: errorResponseDto[404],
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Update Announcement",
  },
} satisfies ControllerHook;

export const announcementDestroyDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  response: {
    200: t.Object({
      message: t.String(),
    }),
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Delete Announcement",
  },
} satisfies ControllerHook;
