import { errorResponseDto } from "#utils/common-dtos.ts";
import type { ControllerHook } from "#utils/elysia-types.ts";
import { UserPlain } from "@onlyjs/db/prismabox/User";
import { t } from "elysia";

export const medicalRecordResponseSchema = t.Composite([
    t.Object({
        uuid: t.String(),
        id: t.String(),
        description: t.String(),
        createdAt: t.String(),
        updatedAt: t.String(),
    }),
    t.Object({
        patient: t.Object({
            id: t.Number(),
            uuid: t.String(),
            user: t.Pick(UserPlain, [
                "firstName",
                "lastName",
                "email",
            ]),
        }),
        doctor: t.Object({
            id: t.Number(),
            specialty: t.String(),
            user: t.Pick(UserPlain, [
                "firstName",
                "lastName",
                "email",
            ]),
        }),
    }),
]);

export const medicalRecordsIndexDto = {
    query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        doctorId: t.Optional(t.String()),
        patientId: t.Optional(t.String()),
    }),
    response: {
        200: t.Array(medicalRecordResponseSchema),
    },
    detail: {
        summary: "List Medical Records",
    },
} satisfies ControllerHook;

export const medicalRecordShowDto = {
    params: t.Object({
        uuid: t.String(),
    }),
    response: {
        200: medicalRecordResponseSchema,
        404: errorResponseDto[404],
    },
    detail: {
        summary: "Show Medical Record",
    },
} satisfies ControllerHook;

export const medicalRecordCreateDto = {
    body: t.Object({
        patientId: t.Number(),
        doctorId: t.Number(),
        description: t.String(),
    }),
    response: {
        200: medicalRecordResponseSchema,
        422: errorResponseDto[422],
    },
    detail: {
        summary: "Create Medical Record",
    },
} satisfies ControllerHook;

export const medicalRecordUpdateDto = {
    params: t.Object({
        uuid: t.String(),
    }),
    body: t.Partial(
        t.Object({
            description: t.String(),
        })
    ),
    response: {
        200: medicalRecordResponseSchema,
        404: errorResponseDto[404],
        422: errorResponseDto[422],
    },
    detail: {
        summary: "Update Medical Record",
    },
} satisfies ControllerHook;

export const medicalRecordDestroyDto = {
    params: t.Object({
        uuid: t.String(),
    }),
    response: {
        200: t.Object({
            message: t.String(),
        }),
        404: errorResponseDto[404],
    },
    detail: {
        summary: "Delete Medical Record",
    },
} satisfies ControllerHook;