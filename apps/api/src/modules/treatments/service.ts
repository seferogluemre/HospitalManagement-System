import { HandleError } from "#shared/error/index.ts";
import { NotFoundException } from "#utils/http-errors.ts";
import prisma from "@onlyjs/db";
import { Prisma, type Treatment } from "@onlyjs/db/client";
import type {
  TreatmentCreatePayload,
  TreatmentIndexQuery,
  TreatmentUpdatePayload,
} from "./types";

export abstract class TreatmentService {
  static async index(query?: TreatmentIndexQuery): Promise<Treatment[]> {
    try {
      const filterQuery = query ? { ...query } : undefined;

      const where: Prisma.TreatmentWhereInput = {
        deletedAt: null,
      };

      if (filterQuery?.search) {
        where.OR = [
          { title: { contains: filterQuery.search, mode: "insensitive" } },
          { notes: { contains: filterQuery.search, mode: "insensitive" } },
          { diagnosis: { contains: filterQuery.search, mode: "insensitive" } },
          {
            doctor: {
              user: {
                OR: [
                  { firstName: { contains: filterQuery.search, mode: 'insensitive' } },
                  { lastName: { contains: filterQuery.search, mode: 'insensitive' } },
                ]
              }
            }
          },
        ];
      }

      if (filterQuery?.doctorId) {
        where.doctorId = parseInt(filterQuery.doctorId);
      }

      if (filterQuery?.appointmentId) {
        where.appointmentId = filterQuery.appointmentId;
      }

      if (filterQuery?.aiStatus) {
        where.aiStatus = filterQuery.aiStatus;
      }

      return prisma.treatment.findMany({
        where,
        include: {
          doctor: {
            select: {
              id: true,
              uuid: true,
              specialty: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              clinic: {
                select: {
                  uuid: true,
                  name: true,
                },
              },
            },
          },
          appointment: {
            select: {
              uuid: true,
              appointmentDate: true,
              patient: {
                select: {
                  uuid: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, "treatment", "find");
      throw error;
    }
  }

  static async show(where: { uuid: string }) {
    try {
      const treatment = await prisma.treatment.findFirst({
        where: {
          uuid: where.uuid,
          deletedAt: null,
        },
        include: {
          doctor: {
            select: {
              id: true,
              uuid: true,
              specialty: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              clinic: {
                select: {
                  uuid: true,
                  name: true,
                },
              },
            },
          },
          appointment: {
            select: {
              uuid: true,
              appointmentDate: true,
              patient: {
                select: {
                  uuid: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!treatment) {
        throw new NotFoundException("Treatment bulunamadı");
      }

      return treatment;
    } catch (error) {
      await HandleError.handlePrismaError(error, "treatment", "find");
      throw error;
    }
  }

  static async store(payload: TreatmentCreatePayload): Promise<Treatment> {
    try {
      // Validate appointment exists
      const appointment = await prisma.appointment.findFirst({
        where: {
          uuid: payload.appointmentId,
          deletedAt: null,
        },
      });

      if (!appointment) {
        throw new NotFoundException("Appointment bulunamadı");
      }

      // Validate doctor exists
      const doctor = await prisma.doctor.findFirst({
        where: {
          id: payload.doctorId,
          deletedAt: null,
        },
      });

      if (!doctor) {
        throw new NotFoundException("Doktor bulunamadı");
      }

      // Check appointment-doctor match
      if (appointment.doctorId !== payload.doctorId) {
        throw new Error("Bu appointment bu doktora ait değil");
      }

      const treatment = await prisma.treatment.create({
        data: {
          title: payload.title,
          notes: payload.notes,
          diagnosis: payload.diagnosis,
          appointmentId: payload.appointmentId,
          doctorId: payload.doctorId,
          // AI Fields
          patientComplaint: payload.patientComplaint,
          aiTreatment: payload.aiTreatment,
          aiRecommendations: payload.aiRecommendations,
          aiFollowUp: payload.aiFollowUp,
          aiStatus: payload.aiStatus,
          aiReviewNotes: payload.aiReviewNotes,
        },
        include: {
          doctor: {
            select: {
              id: true,
              uuid: true,
              specialty: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          appointment: {
            select: {
              uuid: true,
              appointmentDate: true,
              patient: {
                select: {
                  uuid: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return treatment;
    } catch (error) {
      await HandleError.handlePrismaError(error, "treatment", "create");
      throw error;
    }
  }

  static async update(
    uuid: string,
    payload: TreatmentUpdatePayload
  ): Promise<Treatment> {
    try {
      const treatment = await prisma.treatment.findFirst({
        where: {
          uuid: uuid,
          deletedAt: null,
        },
      });

      if (!treatment) {
        throw new NotFoundException("Treatment bulunamadı");
      }

      const updatedTreatment = await prisma.treatment.update({
        where: { uuid: uuid },
        data: {
          ...payload,
        },
        include: {
          doctor: {
            select: {
              id: true,
              uuid: true,
              specialty: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          appointment: {
            select: {
              uuid: true,
              appointmentDate: true,
              patient: {
                select: {
                  uuid: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return updatedTreatment;
    } catch (error) {
      await HandleError.handlePrismaError(error, "treatment", "update");
      throw error;
    }
  }

  static async destroy(uuid: string): Promise<void> {
    try {
      const treatment = await prisma.treatment.findFirst({
        where: {
          uuid: uuid,
          deletedAt: null,
        },
      });

      if (!treatment) {
        throw new NotFoundException("Treatment bulunamadı");
      }

      await prisma.treatment.update({
        where: { uuid: uuid },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, "treatment", "delete");
      throw error;
    }
  }

  static async restore(uuid: string): Promise<Treatment> {
    try {
      const treatment = await prisma.treatment.findFirst({
        where: { uuid: uuid, deletedAt: { not: null } },
      });

      if (!treatment) {
        throw new NotFoundException("Treatment bulunamadı veya zaten aktif");
      }

      return await prisma.treatment.update({
        where: { uuid: uuid },
        data: { deletedAt: null },
        include: {
          doctor: {
            select: {
              id: true,
              uuid: true,
              specialty: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          appointment: {
            select: {
              uuid: true,
              appointmentDate: true,
              patient: {
                select: {
                  uuid: true,
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      await HandleError.handlePrismaError(error, "treatment", "update");
      throw error;
    }
  }

  // Helper methods
  static async getByDoctor(doctorId: number): Promise<Treatment[]> {
    return this.index({ doctorId: doctorId.toString() });
  }

  static async getByAppointment(appointmentId: string): Promise<Treatment[]> {
    return this.index({ appointmentId });
  }

  static async getByAIStatus(aiStatus: string): Promise<Treatment[]> {
    return this.index({ aiStatus });
  }
}