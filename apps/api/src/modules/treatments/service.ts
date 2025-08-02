import { HandleError } from "#shared/error/index.ts";
import { NotFoundException } from "#utils/http-errors.ts";
import prisma from "@onlyjs/db";
import { Prisma, type Announcement } from "@onlyjs/db/client";
import type {
  AnnouncementCreatePayload,
  AnnouncementIndexQuery,
  AnnouncementUpdatePayload,
} from "./types";

export abstract class AnnouncementService {
  static async index(query?: AnnouncementIndexQuery): Promise<Announcement[]> {
    try {
      const filterQuery = query ? { ...query } : undefined;

      const where: Prisma.AnnouncementWhereInput = {
        deletedAt: null,
      };

      if (filterQuery?.search) {
        where.OR = [
          { title: { contains: filterQuery.search, mode: "insensitive" } },
          { content: { contains: filterQuery.search, mode: "insensitive" } },
          {
            author: {
              OR: [
                { firstName: { contains: filterQuery.search, mode: 'insensitive' } },
                { lastName: { contains: filterQuery.search, mode: 'insensitive' } },
              ]
            }
          },
        ];
      }

      if (filterQuery?.isActive !== undefined) {
        where.isActive = filterQuery.isActive === "true";
      }

      if (filterQuery?.authorId) {
        where.authorId = filterQuery.authorId;
      }

      if (filterQuery?.targetRole) {
        where.targetRoles = {
          has: filterQuery.targetRole,
        };
      }

      return prisma.announcement.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, "announcement", "find");
      throw error;
    }
  }

  static async show(where: { uuid: string }) {
    try {
      const announcement = await prisma.announcement.findFirst({
        where: {
          uuid: where.uuid,
          deletedAt: null,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      if (!announcement) {
        throw new NotFoundException("Duyuru bulunamadı");
      }

      return announcement;
    } catch (error) {
      await HandleError.handlePrismaError(error, "announcement", "find");
      throw error;
    }
  }

  static async store(
    payload: AnnouncementCreatePayload
  ): Promise<Announcement> {
    try {
      // Validate author exists
      const author = await prisma.user.findFirst({
        where: {
          id: payload.authorId, 
          deletedAt: null,
        },
      });

      if (!author) {
        throw new NotFoundException("Yazar bulunamadı");
      }

      const announcement = await prisma.announcement.create({
        data: {
          title: payload.title,
          content: payload.content,
          isActive: payload.isActive ?? true,
          targetRoles: payload.targetRoles ?? [],
          authorId: payload.authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return announcement;
    } catch (error) {
      await HandleError.handlePrismaError(error, "announcement", "create");
      throw error;
    }
  }

  static async update(
    uuid: string,
    payload: AnnouncementUpdatePayload
  ): Promise<Announcement> {
    try {
      const announcement = await prisma.announcement.findFirst({
        where: {
          uuid: uuid,
          deletedAt: null,
        },
      });

      if (!announcement) {
        throw new NotFoundException("Duyuru bulunamadı");
      }

      const updatedAnnouncement = await prisma.announcement.update({
        where: { uuid: uuid },
        data: {
          ...payload,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return updatedAnnouncement;
    } catch (error) {
      await HandleError.handlePrismaError(error, "announcement", "update");
      throw error;
    }
  }

  static async destroy(uuid: string): Promise<void> {
    try {
      const announcement = await prisma.announcement.findFirst({
        where: {
          uuid: uuid,
          deletedAt: null,
        },
      });

      if (!announcement) {
        throw new NotFoundException("Duyuru bulunamadı");
      }

      await prisma.announcement.update({
        where: { uuid: uuid },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, "announcement", "delete");
      throw error;
    }
  }

  static async restore(uuid: string): Promise<Announcement> {
    try {
      const announcement = await prisma.announcement.findFirst({
        where: { uuid: uuid, deletedAt: { not: null } },
      });

      if (!announcement) {
        throw new NotFoundException("Duyuru bulunamadı veya zaten aktif");
      }

      return await prisma.announcement.update({
        where: { uuid: uuid },
        data: { deletedAt: null },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, "announcement", "update");
      throw error;
    }
  }

  // Helper methods for role-based filtering
  static async getByTargetRole(role: string): Promise<Announcement[]> {
    return this.index({ targetRole: role, isActive: "true" });
  }

  static async getActiveAnnouncements(): Promise<Announcement[]> {
    return this.index({ isActive: "true" });
  }

  static async getByAuthor(authorId: string): Promise<Announcement[]> {
    return this.index({ authorId });
  }
}
