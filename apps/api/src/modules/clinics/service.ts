import { HandleError } from "#shared/error/index.ts";
import { ConflictException, InternalServerErrorException, NotFoundException } from "#utils/http-errors.ts";
import prisma from "@onlyjs/db";
import type { Clinic, Prisma } from "@onlyjs/db/client";
import type { ClinicCreatePayload, ClinicIndexQuery, ClinicUpdatePayload } from "./types";

export abstract class ClinicService {
    static async index(query?: ClinicIndexQuery): Promise<Clinic[]> {
        try {
            const filterQuery = query ? { ...query } : undefined

            const where: Prisma.ClinicWhereInput = {
                deletedAt: null
            }

            if (filterQuery?.search) {
                where.OR = [
                    { name: { contains: filterQuery.search, mode: 'insensitive' } },
                    { description: { contains: filterQuery.search, mode: 'insensitive' } },
                    { address: { contains: filterQuery.search, mode: 'insensitive' } },
                    { phone: { contains: filterQuery.search, mode: 'insensitive' } },
                ]
            }

            return prisma.clinic.findMany({
                where,
                include: {
                    doctors: {
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
                    secretaries: {
                        select: {
                            id: true,
                            secretary: {
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
                orderBy: {
                    createdAt: 'desc',
                },
            });

        } catch (error) {
            await HandleError.handlePrismaError(error, "clinic", "find")
            throw error
        }
    }

    static async show(where: { uuid: string }) {
        try {
            const clinic = await prisma.clinic.findFirst({
                where: {
                    uuid: where.uuid,
                    deletedAt: null,
                },
                include: {
                    doctors: {
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
                    secretaries: {
                        select: {
                            id: true,
                            secretary: {
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
            })

            if (!clinic) {
                throw new NotFoundException('Klinik bulunamadı');
            }

            return clinic;
        } catch (error) {
            await HandleError.handlePrismaError(error, "clinic", "find")
            throw error
        }
    }

    static async store(payload: ClinicCreatePayload): Promise<Clinic> {
        try {
            const existingClinic = await prisma.clinic.findFirst({
                where: {
                    name: payload.name,
                    deletedAt: null,
                }
            })

            if (existingClinic) {
                throw new ConflictException('Bu isimde bir klinik zaten mevcut');
            }

            const clinic = await prisma.clinic.create({
                data: {
                    name: payload.name,
                    description: payload.description,
                    address: payload.address,
                    phone: payload.phoneNumber,
                },
                include: {
                    doctors: {
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
                    secretaries: {
                        select: {
                            id: true,
                            secretary: {
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

            return clinic;
        } catch (error) {
            await HandleError.handlePrismaError(error, "clinic", "create")
            throw error
        }
    }

    static async update(uuid: string, payload: ClinicUpdatePayload): Promise<Clinic> {
        try {
            const clinic = await prisma.clinic.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!clinic) {
                throw new NotFoundException('Klinik bulunamadı');
            }

            const updatedClinic = await prisma.clinic.update({
                where: { uuid: uuid },
                data: {
                    name: payload.name,
                    description: payload.description,
                    address: payload.address,
                    phone: payload.phoneNumber,
                },
                include: {
                    doctors: {
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
                    secretaries: {
                        select: {
                            id: true,
                            secretary: {
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

            if (!updatedClinic) {
                throw new InternalServerErrorException('Bilinmeyen bir hata oluştu');
            }

            return updatedClinic;
        } catch (error) {
            await HandleError.handlePrismaError(error, 'clinic', 'update');
            throw error;
        }
    }

    static async destroy(uuid: string): Promise<void> {
        try {
            const clinic = await prisma.clinic.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!clinic) {
                throw new NotFoundException('Klinik bulunamadı');
            }

            // Soft delete clinic
            await prisma.clinic.update({
                where: { uuid: uuid },
                data: { deletedAt: new Date() },
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'clinic', 'delete');
            throw error;
        }
    }

    static async restore(uuid: string): Promise<Clinic> {
        try {
            const clinic = await prisma.clinic.findFirst({
                where: { uuid: uuid, deletedAt: { not: null } },
            });

            if (!clinic) {
                throw new NotFoundException('Klinik bulunamadı veya zaten aktif');
            }

            // Restore clinic
            return await prisma.clinic.update({
                where: { uuid: uuid },
                data: { deletedAt: null },
                include: {
                    doctors: {
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
                    secretaries: {
                        select: {
                            id: true,
                            secretary: {
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
        } catch (error) {
            await HandleError.handlePrismaError(error, 'clinic', 'update');
            throw error;
        }
    }
}