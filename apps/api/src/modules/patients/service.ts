import { HandleError } from "#shared/error/index.ts";
import { ConflictException, InternalServerErrorException, NotFoundException } from "#utils/http-errors.ts";
import prisma from "@onlyjs/db";
import { Prisma, type Patient } from "@onlyjs/db/client";
import type { PatientCreatePayload, PatientIndexQuery, PatientUpdatePayload } from "./types";

export abstract class PatientService {
    static async index(query?: PatientIndexQuery): Promise<Patient[]> {
        try {
            const filterQuery = query ? { ...query, familyDoctorId: query.familyDoctorId === null ? undefined : query.familyDoctorId } : undefined

            const where: Prisma.PatientWhereInput = {
                deletedAt: null
            }


            if (filterQuery?.search) {
                where.OR = [
                    { user: { firstName: { contains: filterQuery.search, mode: 'insensitive' } } },
                    { user: { lastName: { contains: filterQuery.search, mode: 'insensitive' } } },
                    { user: { email: { contains: filterQuery.search, mode: 'insensitive' } } },
                    { user: { tcNo: { contains: filterQuery.search, mode: 'insensitive' } } },
                ]
            }

            if (filterQuery?.familyDoctorId) {
                where.familyDoctorId = filterQuery.familyDoctorId;
            }

            return prisma.patient.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            tcNo: true,
                            gender: true,
                        },
                    },
                    familyDoctor: {
                        select: {
                            id: true,
                            specialty: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

        } catch (error) {
            await HandleError.handlePrismaError(error, "patient", "find")
            throw error
        }
    }

    static async show(where: { uuid: string }) {
        try {
            const patient = await prisma.patient.findFirst({
                where: {
                    uuid: where.uuid,
                    deletedAt: null,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            tcNo: true,
                            gender: true,
                        },
                    },
                    familyDoctor: {
                        select: {
                            id: true,
                            specialty: true,
                        },
                    },
                },
            })

            if (!patient) {
                throw new NotFoundException('Hasta bulunamadı');
            }

            return patient;

        } catch (error) {
            await HandleError.handlePrismaError(error, "patient", "find")
            throw error
        }
    }


    static async store(payload: PatientCreatePayload): Promise<Patient> {
        try {
            const existingUser = await prisma.patient.findFirst({
                where: {
                    OR: [
                        {
                            user: {
                                email: payload.email
                            }
                        },
                        {
                            user: {
                                tcNo: payload.tcNo
                            }
                        }
                    ],
                    deletedAt: null,

                }
            })

            if (existingUser) {
                throw new ConflictException('Bu email veya TC kimlik numarası zaten kullanılıyor');
            }



            const result = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        firstName: payload.firstName,
                        lastName: payload.lastName,
                        name: `${payload.firstName} ${payload.lastName}`,
                        email: payload.email,
                        tcNo: payload.tcNo,
                        gender: payload.gender,
                        emailVerified: false,
                        rolesSlugs: ['patient'],

                    }
                })

                // Create patient
                const patient = await tx.patient.create({
                    data: {
                        userId: user.id,
                        phoneNumber: payload.phoneNumber,
                        address: payload.address,
                        dateOfBirth: payload.dateOfBirth,
                        familyDoctorId: payload.familyDoctorId,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                tcNo: true,
                                gender: true,
                            },
                        },
                        familyDoctor: {
                            select: {
                                id: true,
                                specialty: true,
                            },
                        },
                    },
                });

                return patient;
            })

            return result
        } catch (error) {
            await HandleError.handlePrismaError(error, "patient", "create")
            throw error
        }
    }

    static async update(id: string, payload: PatientUpdatePayload): Promise<Patient> {
        try {
            const patient = await prisma.patient.findFirst({
                where: {
                    uuid: id,
                    deletedAt: null,
                },
            });

            if (!patient) {
                throw new NotFoundException('Hasta bulunamadı');
            }

            const updatedPatient = await prisma.patient.update({
                where: { uuid: id },
                data: payload,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            tcNo: true,
                            gender: true,
                        },
                    },
                    familyDoctor: {
                        select: {
                            id: true,
                            specialty: true,
                        },
                    },
                },
            });

            if (!updatedPatient) {
                throw new InternalServerErrorException('Bilinmeyen bir hata oluştu');
            }

            return updatedPatient;
        } catch (error) {
            await HandleError.handlePrismaError(error, 'patient', 'update');
            throw error;
        }
    }

    static async destroy(uuid: string): Promise<void> {
        try {
            const patient = await prisma.patient.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!patient) {
                throw new NotFoundException('Hasta bulunamadı');
            }

            // Soft delete both patient and user
            await prisma.$transaction(async (tx) => {
                await tx.patient.update({
                    where: { uuid: uuid },
                    data: { deletedAt: new Date() },
                });

                await tx.user.update({
                    where: { id: patient.userId },
                    data: { deletedAt: new Date() },
                });
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'patient', 'delete');
            throw error;
        }
    }

    static async restore(uuid: string) {
        try {
            const patient = await prisma.patient.findFirst({
                where: { uuid: uuid, deletedAt: { not: null } },
                include: { user: true },
            });

            if (!patient) {
                throw new NotFoundException('Hasta bulunamadı veya zaten aktif');
            }

            // Restore both patient and user
            return await prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: patient.userId },
                    data: { deletedAt: null },
                });

                return await tx.patient.update({
                    where: { uuid: uuid },
                    data: { deletedAt: null },
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                tcNo: true,
                                gender: true,
                            },
                        },
                        familyDoctor: {
                            select: {
                                id: true,
                                specialty: true,
                            },
                        },
                    },
                });
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'patient', 'update');
            throw error;
        }
    }

    static async getAppointments(uuid: string) {
        try {
            const patient = await prisma.patient.findFirst({
                where: { uuid },
            })

            if (!patient) {
                throw NotFoundException("Hasta bulunamadı.")
            }

            const appointments = await prisma.appointment.findMany({
                where: {
                    patientId: uuid
                },
                select: {
                    patient: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    gender: true,
                                }
                            }
                        }
                    },
                    completedAt: true,
                    appointmentDate: true,
                    notes: true,
                    description: true,
                    doctor: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                    email: true,
                                    gender: true,
                                }
                            }
                        }
                    },
                }
            })

            console.log("Hasta randevuları", appointments)
            return appointments;
        } catch (error) {
            await HandleError.handlePrismaError(error, "patient", "find")
        }
    }

}