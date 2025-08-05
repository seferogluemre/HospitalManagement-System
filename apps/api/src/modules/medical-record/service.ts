import { HandleError } from "#shared/error/index.ts";
import { NotFoundException } from "#utils/http-errors.ts";
import prisma from "@onlyjs/db";
import { Prisma } from "@onlyjs/db/client";
import type { MedicalRecordCreatePayload, MedicalRecordIndexQuery, MedicalRecordUpdatePayload, MedicalRecordWithRelations } from "./types";

export abstract class MedicalRecordService {
  static async index(query?: MedicalRecordIndexQuery): Promise<MedicalRecordWithRelations[]> {
    try {
      const filterQuery = query ?? {};

      const where: Prisma.MedicalRecordWhereInput = {
        deletedAt: null, 
      };

      if (filterQuery.doctorId) {
        where.doctorId = filterQuery.doctorId;
      }

      if (filterQuery.patientId) {
        where.patientId = filterQuery.patientId;
      }

      if (filterQuery.search) {
        where.description = { contains: filterQuery.search, mode: "insensitive" };
      }

      const page = filterQuery.page ? parseInt(filterQuery.page) : 1;
      const limit = filterQuery.limit ? parseInt(filterQuery.limit) : 10;
      const skip = (page - 1) * limit;

      return await prisma.medicalRecord.findMany({
        where,
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          doctor: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, "medicalRecord", "find");
      throw error;
    }
  }

  static async show(where: { uuid: string }): Promise<MedicalRecordWithRelations> {
    try {
      const medicalRecord = await prisma.medicalRecord.findFirst({
        where: {
          uuid: where.uuid,
          deletedAt: null,
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          doctor: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!medicalRecord) {
        throw new NotFoundException("Medical record not found");
      }

      return medicalRecord;
    } catch (error) {
      await HandleError.handlePrismaError(error, "medicalRecord", "find");
      throw error;
    }
  }

  static async store(payload: MedicalRecordCreatePayload): Promise<MedicalRecordWithRelations> {
    try {
      // Önce patient ve doctor'ın var olduğunu kontrol et
      const patient = await prisma.patient.findFirst({
        where: { id: payload.patientId, deletedAt: null },
      });

      if (!patient) {
        throw new NotFoundException("Patient not found");
      }

      const doctor = await prisma.doctor.findFirst({
        where: { id: payload.doctorId, deletedAt: null },
      });

      if (!doctor) {
        throw new NotFoundException("Doctor not found");
      }

      const medicalRecord = await prisma.medicalRecord.create({
        data: {
          patientId: payload.patientId,
          doctorId: payload.doctorId,
          description: payload.description,
        },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          doctor: {
            include: {
              user: true,
            },
          },
        },
      });

      return medicalRecord;
    } catch (error) {
      await HandleError.handlePrismaError(error, "medicalRecord", "create");
      throw error;
    }
  }

  static async update(uuid: string, payload: MedicalRecordUpdatePayload): Promise<MedicalRecordWithRelations> {
    try {
      const existing = await prisma.medicalRecord.findFirst({
        where: {
          uuid,
          deletedAt: null,
        },
      });

      if (!existing) {
        throw new NotFoundException("Medical record not found");
      }

      const updated = await prisma.medicalRecord.update({
        where: { uuid },
        data: payload,
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          doctor: {
            include: {
              user: true,
            },
          },
        },
      });

      return updated;
    } catch (error) {
      await HandleError.handlePrismaError(error, "medicalRecord", "update");
      throw error;
    }
  }

  static async destroy(uuid: string): Promise<void> {
    try {
      const existing = await prisma.medicalRecord.findFirst({
        where: {
          uuid,
          deletedAt: null,
        },
      });

      if (!existing) {
        throw new NotFoundException("Medical record not found");
      }

      await prisma.medicalRecord.update({
        where: { uuid },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, "medicalRecord", "delete");
      throw error;
    }
  }

  static async restore(uuid: string): Promise<MedicalRecordWithRelations> {
    try {
      const existing = await prisma.medicalRecord.findFirst({
        where: {
          uuid,
          deletedAt: { not: null },
        },
      });

      if (!existing) {
        throw new NotFoundException("Medical record not found or already active");
      }

      const restored = await prisma.medicalRecord.update({
        where: { uuid },
        data: { deletedAt: null },
        include: {
          patient: {
            include: {
              user: true,
            },
          },
          doctor: {
            include: {
              user: true,
            },
          },
        },
      });

      return restored;
    } catch (error) {
      await HandleError.handlePrismaError(error, "medicalRecord", "update");
      throw error;
    }
  }
}