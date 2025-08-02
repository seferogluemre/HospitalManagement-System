import type { Announcement } from "./types";

export abstract class AnnouncementFormatter {
  static response(announcement: Announcement) {
    return {
      id: announcement.id,
      uuid: announcement.uuid,
      title: announcement.title,
      content: announcement.content,
      isActive: announcement.isActive,
      targetRoles: announcement.targetRoles,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
      author: {
        uuid: announcement.author?.uuid,
        firstName: announcement.author?.firstName,
        lastName: announcement.author?.lastName,
        email: announcement.author?.email,
      },
    };
  }
}