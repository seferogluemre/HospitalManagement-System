import { HandleError } from "#shared/error/index.ts";
import { ConflictException, NotFoundException } from "#utils/http-errors.ts";
import prisma from "@onlyjs/db";
import { AppointmentStatus, Prisma, type Appointment } from "@onlyjs/db/client";
import type { AppointmentCreatePayload, AppointmentIndexQuery, AppointmentUpdatePayload } from "./types";

export abstract class AppointmentService {
    static async index(query?: AppointmentIndexQuery): Promise<Appointment[]> {
        try {
            const filterQuery = query ? { ...query } : undefined

            const where: Prisma.AppointmentWhereInput = {
                deletedAt: null
            }

            if (filterQuery?.search) {
                where.OR = [
                    {
                        patient: {
                            user: {
                                OR: [
                                    { firstName: { contains: filterQuery.search, mode: 'insensitive' } },
                                    { lastName: { contains: filterQuery.search, mode: 'insensitive' } },
                                    { email: { contains: filterQuery.search, mode: 'insensitive' } },
                                    { tcNo: { contains: filterQuery.search, mode: 'insensitive' } },
                                ]
                            }
                        }
                    },
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
                    { description: { contains: filterQuery.search, mode: 'insensitive' } },
                    { notes: { contains: filterQuery.search, mode: 'insensitive' } },
                ]
            }

            if (filterQuery?.patientId) {
                where.patientId = filterQuery.patientId;
            }

            if (filterQuery?.doctorId) {
                where.doctorId = parseInt(filterQuery.doctorId);
            }

            if (filterQuery?.status) {
                where.status = filterQuery.status;
            }

            if (filterQuery?.clinicId) {
                where.doctor = {
                    clinic: {
                        uuid: filterQuery.clinicId
                    }
                };
            }

            if (filterQuery?.startDate && filterQuery?.endDate) {
                where.appointmentDate = {
                    gte: new Date(filterQuery.startDate),
                    lte: new Date(filterQuery.endDate)
                };
            }

            return prisma.appointment.findMany({
                where,
                include: {
                    patient: {
                        select: {
                            uuid: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    tcNo: true,
                                },
                            },
                            phoneNumber: true,
                        },
                    },
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
                    createdBySecretary: {
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
                orderBy: {
                    appointmentDate: 'desc',
                },
            });

        } catch (error) {
            await HandleError.handlePrismaError(error, "appointment", "find")
            throw error
        }
    }

    static async show(where: { uuid: string }) {
        try {
            const appointment = await prisma.appointment.findFirst({
                where: {
                    uuid: where.uuid,
                    deletedAt: null,
                },
                include: {
                    patient: {
                        select: {
                            uuid: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    tcNo: true,
                                },
                            },
                            phoneNumber: true,
                        },
                    },
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
                    createdBySecretary: {
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
            })

            if (!appointment) {
                throw new NotFoundException('Randevu bulunamadı');
            }

            return appointment;

        } catch (error) {
            await HandleError.handlePrismaError(error, "appointment", "find")
            throw error
        }
    }

    static async store(payload: AppointmentCreatePayload): Promise<Appointment> {
        try {
            // Validate patient exists
            const patient = await prisma.patient.findFirst({
                where: {
                    uuid: payload.patientId,
                    deletedAt: null,
                }
            });

            if (!patient) {
                throw new NotFoundException('Hasta bulunamadı');
            }

            // Validate doctor exists
            const doctor = await prisma.doctor.findFirst({
                where: {
                    id: payload.doctorId,
                    deletedAt: null,
                }
            });

            if (!doctor) {
                throw new NotFoundException('Doktor bulunamadı');
            }

            // Check for conflicting appointments (same doctor, same time)
            const conflictingAppointment = await prisma.appointment.findFirst({
                where: {
                    doctorId: payload.doctorId,
                    appointmentDate: payload.appointmentDate,
                    status: {
                        not: AppointmentStatus.CANCELLED
                    },
                    deletedAt: null,
                }
            });

            if (conflictingAppointment) {
                throw new ConflictException('Bu doktor için bu saatte zaten bir randevu mevcut');
            }

            const appointment = await prisma.appointment.create({
                data: {
                    patientId: payload.patientId,
                    doctorId: payload.doctorId,
                    appointmentDate: payload.appointmentDate,
                    status: payload.status || AppointmentStatus.SCHEDULED,
                    description: payload.description,
                    notes: payload.notes,
                    createdBySecretaryId: payload.createdBySecretaryId,
                },
                include: {
                    patient: {
                        select: {
                            uuid: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    tcNo: true,
                                },
                            },
                            phoneNumber: true,
                        },
                    },
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
                    createdBySecretary: {
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
            });

            return appointment;
        } catch (error) {
            await HandleError.handlePrismaError(error, "appointment", "create")
            throw error
        }
    }

    static async update(uuid: string, payload: AppointmentUpdatePayload): Promise<Appointment> {
        try {
            const appointment = await prisma.appointment.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!appointment) {
                throw new NotFoundException('Randevu bulunamadı');
            }

            // Check for conflicting appointments if date is being updated
            if (payload.appointmentDate) {
                const conflictingAppointment = await prisma.appointment.findFirst({
                    where: {
                        doctorId: appointment.doctorId,
                        appointmentDate: payload.appointmentDate,
                        uuid: { not: uuid },
                        status: {
                            not: AppointmentStatus.CANCELLED
                        },
                        deletedAt: null,
                    }
                });

                if (conflictingAppointment) {
                    throw new ConflictException('Bu doktor için bu saatte zaten bir randevu mevcut');
                }
            }

            const updatedAppointment = await prisma.appointment.update({
                where: { uuid: uuid },
                data: {
                    ...payload,
                    // Set completedAt when status is COMPLETED
                    completedAt: payload.status === AppointmentStatus.COMPLETED ? new Date() : payload.completedAt,
                },
                include: {
                    patient: {
                        select: {
                            uuid: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    tcNo: true,
                                },
                            },
                            phoneNumber: true,
                        },
                    },
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
                    createdBySecretary: {
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
            });

            return updatedAppointment;
        } catch (error) {
            await HandleError.handlePrismaError(error, 'appointment', 'update');
            throw error;
        }
    }

    static async destroy(uuid: string): Promise<void> {
        try {
            const appointment = await prisma.appointment.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!appointment) {
                throw new NotFoundException('Randevu bulunamadı');
            }

            await prisma.appointment.update({
                where: { uuid: uuid },
                data: { deletedAt: new Date() },
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'appointment', 'delete');
            throw error;
        }
    }

    static async restore(uuid: string): Promise<Appointment> {
        try {
            const appointment = await prisma.appointment.findFirst({
                where: { uuid: uuid, deletedAt: { not: null } },
            });

            if (!appointment) {
                throw new NotFoundException('Randevu bulunamadı veya zaten aktif');
            }

            return await prisma.appointment.update({
                where: { uuid: uuid },
                data: { deletedAt: null },
                include: {
                    patient: {
                        select: {
                            uuid: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    tcNo: true,
                                },
                            },
                            phoneNumber: true,
                        },
                    },
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
                    createdBySecretary: {
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
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'appointment', 'update');
            throw error;
        }
    }

    // Status-specific methods
    static async confirm(uuid: string): Promise<Appointment> {
        try {
            const appointment = await prisma.appointment.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!appointment) {
                throw new NotFoundException('Randevu bulunamadı');
            }

            if (appointment.status !== AppointmentStatus.SCHEDULED) {
                throw new ConflictException('Sadece planlanmış randevular onaylanabilir');
            }

            return await prisma.appointment.update({
                where: { uuid: uuid },
                data: { status: AppointmentStatus.CONFIRMED },
                include: {
                    patient: {
                        select: {
                            uuid: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    tcNo: true,
                                },
                            },
                            phoneNumber: true,
                        },
                    },
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
                    createdBySecretary: {
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
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'appointment', 'update');
            throw error;
        }
    }

    static async complete(uuid: string, notes?: string): Promise<Appointment> {
        try {
            const appointment = await prisma.appointment.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!appointment) {
                throw new NotFoundException('Randevu bulunamadı');
            }

            if (appointment.status === AppointmentStatus.COMPLETED) {
                throw new ConflictException('Randevu zaten tamamlanmış');
            }

            if (appointment.status === AppointmentStatus.CANCELLED) {
                throw new ConflictException('İptal edilmiş randevu tamamlanamaz');
            }

            return await prisma.appointment.update({
                where: { uuid: uuid },
                data: { 
                    status: AppointmentStatus.COMPLETED,
                    completedAt: new Date(),
                    notes: notes || appointment.notes,
                },
                include: {
                    patient: {
                        select: {
                            uuid: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    tcNo: true,
                                },
                            },
                            phoneNumber: true,
                        },
                    },
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
                    createdBySecretary: {
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
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'appointment', 'update');
            throw error;
        }
    }

    static async cancel(uuid: string, reason?: string): Promise<Appointment> {
        try {
            const appointment = await prisma.appointment.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!appointment) {
                throw new NotFoundException('Randevu bulunamadı');
            }

            if (appointment.status === AppointmentStatus.COMPLETED) {
                throw new ConflictException('Tamamlanmış randevu iptal edilemez');
            }

            if (appointment.status === AppointmentStatus.CANCELLED) {
                throw new ConflictException('Randevu zaten iptal edilmiş');
            }

            return await prisma.appointment.update({
                where: { uuid: uuid },
                data: { 
                    status: AppointmentStatus.CANCELLED,
                    notes: reason ? `${appointment.notes || ''}\nİptal nedeni: ${reason}`.trim() : appointment.notes,
                },
                include: {
                    patient: {
                        select: {
                            uuid: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    tcNo: true,
                                },
                            },
                            phoneNumber: true,
                        },
                    },
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
                    createdBySecretary: {
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
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'appointment', 'update');
            throw error;
        }
    }

    static async markNoShow(uuid: string): Promise<Appointment> {
        try {
            const appointment = await prisma.appointment.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!appointment) {
                throw new NotFoundException('Randevu bulunamadı');
            }

            if (appointment.status !== AppointmentStatus.CONFIRMED && appointment.status !== AppointmentStatus.SCHEDULED) {
                throw new ConflictException('Sadece onaylanmış veya planlanmış randevular gelmedi olarak işaretlenebilir');
            }

            return await prisma.appointment.update({
                where: { uuid: uuid },
                data: { status: AppointmentStatus.NO_SHOW },
                include: {
                    patient: {
                        select: {
                            uuid: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    tcNo: true,
                                },
                            },
                            phoneNumber: true,
                        },
                    },
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
                    createdBySecretary: {
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
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'appointment', 'update');
            throw error;
        }
    }

    // Helper methods for filtering
    static async getByPatient(patientId: string): Promise<Appointment[]> {
        return this.index({ patientId });
    }

    static async getByDoctor(doctorId: string): Promise<Appointment[]> {
        return this.index({ doctorId });
    }

    static async getByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
        return this.index({ startDate, endDate });
    }

    static async getTodaysAppointments(): Promise<Appointment[]> {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        
        return this.index({ 
            startDate: startOfDay.toISOString().split('T')[0], 
            endDate: endOfDay.toISOString().split('T')[0] 
        });
    }

    static async getUpcomingAppointments(doctorId?: string): Promise<Appointment[]> {
        const now = new Date();
        const query: AppointmentIndexQuery = {
            startDate: now.toISOString().split('T')[0],
            status: AppointmentStatus.CONFIRMED
        };
        
        if (doctorId) {
            query.doctorId = doctorId;
        }
        
        return this.index(query);
    }
}