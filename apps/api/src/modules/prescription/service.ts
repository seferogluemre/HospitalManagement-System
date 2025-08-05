import { HandleError } from "#shared/error/index.ts";
import { ConflictException, InternalServerErrorException, NotFoundException } from "#utils/http-errors.ts";
import prisma from "@onlyjs/db";
import { Prisma, type Prescription } from "@onlyjs/db/client";
import type { PrescriptionCreatePayload, PrescriptionIndexQuery, PrescriptionUpdatePayload } from "./types";

export abstract class PrescriptionService {
  static async index(query?: PrescriptionIndexQuery): Promise<Prescription[]> {
    try {
      const filterQuery = query ?? {};

      const where: Prisma.PrescriptionWhereInput = {
        deletedAt: null, 
      };

      if (filterQuery.doctorId) {
        where.doctorId = filterQuery.doctorId;
      }

      if (filterQuery.appointmentId) {
        where.appointmentId = filterQuery.appointmentId;
      }

      if (filterQuery.isActive !== undefined) {
        where.isActive = filterQuery.isActive;
      }

      if (filterQuery.search) {
        where.content = { contains: filterQuery.search, mode: "insensitive" };
      }

      return await prisma.prescription.findMany({
        where,
        include: {
          appointment: true,
          doctor: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, "prescription", "find");
      throw error;
    }
  }

  static async show(where: { uuid: string }): Promise<Prescription | null> {
    try {
      const prescription = await prisma.prescription.findFirst({
        where: {
          uuid: where.uuid,
          deletedAt: null,
        },
        include: {
          appointment: true,
          doctor: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!prescription) {
        throw new NotFoundException("Prescription not found");
      }

      return prescription;
    } catch (error) {
      await HandleError.handlePrismaError(error, "prescription", "find");
      throw error;
    }
  }

  static async store(payload: PrescriptionCreatePayload): Promise<Prescription> {
    try {
      const prescription = await prisma.prescription.create({
        data: {
          appointmentId: payload.appointmentId,
          doctorId: payload.doctorId,
          content: payload.content,
          isActive: payload.isActive ?? true,
          deletedAt: null,
        },
        include: {
          appointment: true,
          doctor: {
            include: {
              user: true,
            },
          },
        },
      });

      return prescription;
    } catch (error) {
      await HandleError.handlePrismaError(error, "prescription", "create");
      throw error;
    }
  }

  static async update(uuid: string, payload: PrescriptionUpdatePayload): Promise<Prescription> {
    try {
      const existing = await prisma.prescription.findFirst({
        where: {
          uuid,
          deletedAt: null,
        },
      });

      if (!existing) {
        throw new NotFoundException("Prescription not found");
      }

      const updated = await prisma.prescription.update({
        where: { uuid },
        data: payload,
        include: {
          appointment: true,
          doctor: {
            include: {
              user: true,
            },
          },
        },
      });

      return updated;
    } catch (error) {
      await HandleError.handlePrismaError(error, "prescription", "update");
      throw error;
    }
  }

  static async destroy(uuid: string): Promise<void> {
    try {
      const existing = await prisma.prescription.findFirst({
        where: {
          uuid,
          deletedAt: null,
        },
      });

      if (!existing) {
        throw new NotFoundException("Prescription not found");
      }

      await prisma.prescription.update({
        where: { uuid },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, "prescription", "delete");
      throw error;
    }
  }

  static async restore(uuid: string): Promise<Prescription> {
    try {
      const existing = await prisma.prescription.findFirst({
        where: {
          uuid,
          deletedAt: { not: null },
        },
      });

      if (!existing) {
        throw new NotFoundException("Prescription not found or already active");
      }

      const restored = await prisma.prescription.update({
        where: { uuid },
        data: { deletedAt: null },
        include: {
          appointment: true,
          doctor: {
            include: {
              user: true,
            },
          },
        },
      });

      return restored;
    } catch (error) {
      await HandleError.handlePrismaError(error, "prescription", "update");
      throw error;
    }
  }
}
