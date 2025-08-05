import { HandleError } from "#shared/error/index.ts";
import { ConflictException, InternalServerErrorException, NotFoundException } from "#utils/http-errors.ts";
import prisma from "@onlyjs/db";
import { Prisma, type Secretary } from "@onlyjs/db/client";
import { UsersService } from "../users";
import type { SecretaryCreatePayload, SecretaryIndexQuery, SecretaryUpdatePayload } from "./types";

export abstract class SecretaryService {
    static async index(query?: SecretaryIndexQuery): Promise<Secretary[]> {
        try {
            const filterQuery = query ? { ...query } : undefined

            const where: Prisma.SecretaryWhereInput = {
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

            return prisma.secretary.findMany({
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
            await HandleError.handlePrismaError(error, "secretary", "find")
            throw error
        }
    }

    static async show(where: { uuid: string }) {
        try {
            const secretary = await prisma.secretary.findFirst({
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

            if (!secretary) {
                throw new NotFoundException('Sekreter bulunamadı');
            }

            return secretary;
        } catch (error) {
            await HandleError.handlePrismaError(error, "secretary", "find")
            throw error
        }
    }

    static async store(payload: SecretaryCreatePayload): Promise<Secretary> {
        try {
            const existingUser = await prisma.secretary.findFirst({
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

            // Create user with authentication and secretary role
            const user = await UsersService.store({
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: payload.email,
                tcNo: payload.tcNo,
                gender: payload.gender,
                password: payload.password,
                rolesSlugs: ['secretary'], // Assign secretary role
            });

            // Create Secretary
            const secretary = await prisma.secretary.create({
                data: {
                    userId: user.id,
                    phoneNumber: payload.phoneNumber,
                    address: payload.address,
                    dateOfBirth: payload.dateOfBirth,
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

            // Try to assign secretary role after successful creation
            try {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { rolesSlugs: ['secretary'] }
                });
            } catch (error) {
                console.log('Secretary role assignment failed, user created with basic role');
            }

            return secretary
        } catch (error) {
            await HandleError.handlePrismaError(error, "secretary", "create")
            throw error
        }
    }

    static async update(id: string, payload: SecretaryUpdatePayload): Promise<Secretary> {
        try {
            const secretary = await prisma.secretary.findFirst({
                where: {
                    uuid: id,
                    deletedAt: null,
                },
            });

            if (!secretary) {
                throw new NotFoundException('Sekreter bulunamadı');
            }

            const updatedSecretary = await prisma.secretary.update({
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
                    }
                },
            });

            if (!updatedSecretary) {
                throw new InternalServerErrorException('Bilinmeyen bir hata oluştu');
            }

            return updatedSecretary;
        } catch (error) {
            await HandleError.handlePrismaError(error, 'secretary', 'update');
            throw error;
        }
    }

    static async destroy(uuid: string): Promise<void> {
        try {
            const secretary = await prisma.secretary.findFirst({
                where: {
                    uuid: uuid,
                    deletedAt: null,
                },
            });

            if (!secretary) {
                throw new NotFoundException('Sekreter bulunamadı');
            }

            await prisma.$transaction(async (tx) => {
                await tx.secretary.update({
                    where: { uuid: uuid },
                    data: { deletedAt: new Date() },
                });

                await tx.user.update({
                    where: { id: secretary.userId },
                    data: { deletedAt: new Date() },
                });
            });
        } catch (error) {
            await HandleError.handlePrismaError(error, 'secretary', 'delete');
            throw error;
        }
    }

    static async restore(uuid: string) {
        try {
            const secretary = await prisma.secretary.findFirst({
                where: { uuid: uuid, deletedAt: { not: null } },
                include: { user: true },
            });

            if (!secretary) {
                throw new NotFoundException('Sekreter bulunamadı veya zaten aktif');
            }

            // Restore both patient and user
            return await prisma.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: secretary.userId },
                    data: { deletedAt: null },
                });

                return await tx.secretary.update({
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
            await HandleError.handlePrismaError(error, 'secretary', 'update');
            throw error;
        }
    }
}