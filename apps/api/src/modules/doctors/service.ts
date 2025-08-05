import { HandleError } from "#shared/error/index.ts";
import { ConflictException, InternalServerErrorException, NotFoundException } from "#utils/http-errors.ts";
import prisma from "@onlyjs/db";
import { Prisma, type Doctor } from "@onlyjs/db/client";
import { UsersService } from "../users";
import type { DoctorCreatePayload, DoctorIndexQuery, DoctorUpdatePayload } from "./types";

export abstract class DoctorService {
    static async index(query?: DoctorIndexQuery): Promise<Doctor[]> {
        try {
            const filterQuery = query ? { ...query } : undefined

            const where: Prisma.DoctorWhereInput = {
                deletedAt: null
            }

            if (filterQuery?.search) {
                where.OR = [
                    { user: { firstName: { contains: filterQuery.search, mode: 'insensitive' } } },
                    { user: { lastName: { contains: filterQuery.search, mode: 'insensitive' } } },
                    { user: { email: { contains: filterQuery.search, mode: 'insensitive' } } },
                    { user: { tcNo: { contains: filterQuery.search, mode: 'insensitive' } } },
                    { specialty: { contains: filterQuery.search, mode: 'insensitive' } },
                ]
            }

            if (filterQuery?.specialty) {
                where.specialty = { contains: filterQuery.specialty, mode: 'insensitive' };
            }

            return prisma.doctor.findMany({
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
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

        } catch (error) {
            await HandleError.handlePrismaError(error, "doctor", "find")
            throw error
        }
    }

    static async show(where: { uuid: string }) {
        try {
            const doctor = await prisma.doctor.findFirst({
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
                },
            })

            if (!doctor) {
                throw new NotFoundException('Doktor bulunamadı');
            }

            return doctor;
        } catch (error) {
            await HandleError.handlePrismaError(error, "doctor", "find")
            throw error
        }
    }

    static async store(payload: DoctorCreatePayload): Promise<Doctor> {
        try {
            const existingUser = await prisma.doctor.findFirst({
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

            // Create user with authentication and doctor role
            const user = await UsersService.store({
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                tcNo: payload.tcNo,
                gender: payload.gender,
                password: payload.password,
                rolesSlugs: ['doctor'], // Assign doctor role
            });

            const doctor = await prisma.doctor.create({
                data: {
                    userId: user.id,
                    clinicId: payload.clinicId,
                    phoneNumber: payload.phoneNumber,
                    address: payload.address,
                    dateOfBirth: payload.dateOfBirth,
                    specialty: payload.specialty,
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
                },
            });

            // Try to assign doctor role after successful creation
            try {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { rolesSlugs: ['doctor'] }
                });
            } catch (error) {
                console.log('Doctor role assignment failed, user created with basic role');
            }

            return doctor
        } catch (error) {
            await HandleError.handlePrismaError(error, "doctor", "create")
            throw error
        }
    }

    static async update(uuid: string, payload: DoctorUpdatePayload): Promise<Doctor> {
        try {
            const doctor = await prisma.doctor.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!doctor) {
                throw new NotFoundException('Doktor bulunamadı');
            }

            const updatedDoctor = await prisma.doctor.update({
                where: { uuid: uuid },
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
                },
            });

            if (!updatedDoctor) {
                throw new InternalServerErrorException('Bilinmeyen bir hata oluştu');
            }

            return updatedDoctor;
        } catch (error) {
            await HandleError.handlePrismaError(error, 'doctor', 'update');
            throw error;
        }
    }

    static async destroy(uuid: string): Promise<void> {
        try {
            const doctor = await prisma.doctor.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!doctor) {
                throw new NotFoundException('Doktor bulunamadı');
            }

            // Soft delete both doctor and user
            await prisma.$transaction(async (tx) => {
                await tx.doctor.update({
                    where: { uuid: uuid },
                    data: { deletedAt: new Date() },
                });

                await tx.user.update({
                    where: { id: doctor.userId },
                    data: { deletedAt: new Date() },
                });
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'doctor', 'delete');
            throw error;
        }
    }

    static async restore(uuid: string) {
        try {
            const doctor = await prisma.doctor.findFirst({
                where: { uuid: uuid, deletedAt: { not: null } },
                include: { user: true },
            });

            if (!doctor) {
                throw new NotFoundException('Doktor bulunamadı veya zaten aktif');
            }

            // Restore both doctor and user
            return await prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: doctor.userId },
                    data: { deletedAt: null },
                });

                return await tx.doctor.update({
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
                    },
                });
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'doctor', 'update');
            throw error;
        }
    }
}