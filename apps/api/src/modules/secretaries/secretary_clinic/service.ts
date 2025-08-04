import { HandleError } from "#shared/error/index.ts";
import { ConflictException, NotFoundException } from "#utils/http-errors.ts";
import prisma from "@onlyjs/db";
import { Prisma } from "@onlyjs/db/client";
import type {
    SecretaryClinicCreatePayload,
    SecretaryClinicIndexQuery,
    SecretaryClinicUpdatePayload,
    SecretaryClinicWithRelations
} from "./types";

export abstract class SecretaryClinicService {
  static async index(query?: SecretaryClinicIndexQuery): Promise<SecretaryClinicWithRelations[]> {
    try {
      const filterQuery = query ? { ...query } : undefined;

      const where: Prisma.SecretaryClinicWhereInput = {};

      if (filterQuery?.secretaryUuid) {
        where.secretary = {
          uuid: filterQuery.secretaryUuid,
        };
      }

      if (filterQuery?.clinicUuid) {
        where.clinic = {
          uuid: filterQuery.clinicUuid,
        };
      }

      if (filterQuery?.search) {
        where.OR = [
          {
            secretary: {
              user: {
                OR: [
                  { firstName: { contains: filterQuery.search, mode: 'insensitive' } },
                  { lastName: { contains: filterQuery.search, mode: 'insensitive' } },
                  { email: { contains: filterQuery.search, mode: 'insensitive' } },
                ],
              },
            },
          },
          {
            clinic: {
              name: { contains: filterQuery.search, mode: 'insensitive' },
            },
          },
        ];
      }

      const secretaryClinics = await prisma.secretaryClinic.findMany({
        where,
        include: {
          secretary: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          clinic: {
            select: {
              id: true,
              uuid: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }) as SecretaryClinicWithRelations[];

      return secretaryClinics;
    } catch (error) {
      await HandleError.handlePrismaError(error, "secretary_clinic", "find");
      throw error;
    }
  }

  static async show(where: { id: number }): Promise<SecretaryClinicWithRelations> {
    try {
      const secretaryClinic = await prisma.secretaryClinic.findFirst({
        where: {
          id: where.id,
        },
        include: {
          secretary: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          clinic: {
            select: {
              id: true,
              uuid: true,
              name: true,
            },
          },
        },
      }) as SecretaryClinicWithRelations | null;

      if (!secretaryClinic) {
        throw new NotFoundException('Sekreter-Klinik ataması bulunamadı');
      }

      return secretaryClinic;
    } catch (error) {
      await HandleError.handlePrismaError(error, "secretary_clinic", "find");
      throw error;
    }
  }

  static async store(payload: SecretaryClinicCreatePayload): Promise<SecretaryClinicWithRelations> {
    try {
      // Validate secretary exists
      const secretary = await prisma.secretary.findFirst({
        where: {
          uuid: payload.secretaryUuid,
          deletedAt: null,
        },
      });

      if (!secretary) {
        throw new NotFoundException('Sekreter bulunamadı');
      }

      // Validate clinic exists
      const clinic = await prisma.clinic.findFirst({
        where: {
          uuid: payload.clinicUuid,
          deletedAt: null,
        },
      });

      if (!clinic) {
        throw new NotFoundException('Klinik bulunamadı');
      }

      // Check if assignment already exists
      const existingAssignment = await prisma.secretaryClinic.findFirst({
        where: {
          secretaryId: secretary.id,
          clinicId: clinic.id,
        },
      });

      if (existingAssignment) {
        throw new ConflictException('Bu sekreter zaten bu kliniğe atanmış');
      }

      const secretaryClinic = await prisma.secretaryClinic.create({
        data: {
          secretaryId: secretary.id,
          clinicId: clinic.id,
        },
        include: {
          secretary: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          clinic: {
            select: {
              id: true,
              uuid: true,
              name: true,
            },
          },
        },
      }) as SecretaryClinicWithRelations;

      return secretaryClinic;
    } catch (error) {
      await HandleError.handlePrismaError(error, "secretary_clinic", "create");
      throw error;
    }
  }

  static async update(id: number, payload: SecretaryClinicUpdatePayload): Promise<SecretaryClinicWithRelations> {
    try {
      const existingAssignment = await prisma.secretaryClinic.findFirst({
        where: { id },
      });

      if (!existingAssignment) {
        throw new NotFoundException('Sekreter-Klinik ataması bulunamadı');
      }

      let updateData: { secretaryId?: number; clinicId?: number } = {};

      // Validate and get secretary if provided
      if (payload.secretaryUuid) {
        const secretary = await prisma.secretary.findFirst({
          where: {
            uuid: payload.secretaryUuid,
            deletedAt: null,
          },
        });

        if (!secretary) {
          throw new NotFoundException('Sekreter bulunamadı');
        }

        updateData.secretaryId = secretary.id;
      }

      // Validate and get clinic if provided
      if (payload.clinicUuid) {
        const clinic = await prisma.clinic.findFirst({
          where: {
            uuid: payload.clinicUuid,
            deletedAt: null,
          },
        });

        if (!clinic) {
          throw new NotFoundException('Klinik bulunamadı');
        }

        updateData.clinicId = clinic.id;
      }

      // Check for duplicate assignment if updating
      if (Object.keys(updateData).length > 0) {
        const checkSecretaryId = updateData.secretaryId || existingAssignment.secretaryId;
        const checkClinicId = updateData.clinicId || existingAssignment.clinicId;

        const duplicateAssignment = await prisma.secretaryClinic.findFirst({
          where: {
            secretaryId: checkSecretaryId,
            clinicId: checkClinicId,
            id: { not: id },
          },
        });

        if (duplicateAssignment) {
          throw new ConflictException('Bu sekreter zaten bu kliniğe atanmış');
        }
      }

      const updatedSecretaryClinic = await prisma.secretaryClinic.update({
        where: { id },
        data: updateData,
        include: {
          secretary: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          clinic: {
            select: {
              id: true,
              uuid: true,
              name: true,
            },
          },
        },
      }) as SecretaryClinicWithRelations;

      return updatedSecretaryClinic;
    } catch (error) {
      await HandleError.handlePrismaError(error, 'secretary_clinic', 'update');
      throw error;
    }
  }

  static async destroy(id: number): Promise<void> {
    try {
      const secretaryClinic = await prisma.secretaryClinic.findFirst({
        where: { id },
      });

      if (!secretaryClinic) {
        throw new NotFoundException('Sekreter-Klinik ataması bulunamadı');
      }

      await prisma.secretaryClinic.delete({
        where: { id },
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, 'secretary_clinic', 'delete');
      throw error;
    }
  }
}