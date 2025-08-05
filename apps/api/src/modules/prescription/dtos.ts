import { errorResponseDto } from "#utils/common-dtos.ts";
import type { ControllerHook } from "#utils/elysia-types.ts";
import { UserPlain } from "@onlyjs/db/prismabox/User";
import { AppointmentPlain } from "../../../../../packages/database/prismabox/Appointment";
import { t } from "elysia";

export const prescriptionResponseSchema = t.Composite([
    t.Object({
        uuid: t.String(),
        content: t.String(),
        isActive: t.Boolean(),
        createdAt: t.String(),
        updatedAt: t.String(),
    }),
    t.Object({
        appointment: t.Pick(AppointmentPlain, [
            "id",
            "appointmentDate",
            "status",
            "notes",
        ]),
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

export const prescriptionsIndexDto = {
    query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        doctorId: t.Optional(t.String()),
        appointmentId: t.Optional(t.String()),
        isActive: t.Optional(t.Boolean()),
    }),
    response: {
        200: t.Array(prescriptionResponseSchema),
    },
    detail: {
        summary: "List Prescriptions",
    },
} satisfies ControllerHook;

export const prescriptionShowDto = {
    params: t.Object({
        uuid: t.String(),
    }),
    response: {
        200: prescriptionResponseSchema,
        404: errorResponseDto[404],
    },
    detail: {
        summary: "Show Prescription",
    },
} satisfies ControllerHook;

export const prescriptionCreateDto = {
    body: t.Object({
        appointmentId: t.Number(),
        doctorId: t.Number(),
        content: t.String(),
        isActive: t.Optional(t.Boolean()),
    }),
    response: {
        200: prescriptionResponseSchema,
        422: errorResponseDto[422],
    },
    detail: {
        summary: "Create Prescription",
    },
} satisfies ControllerHook;

export const prescriptionUpdateDto = {
    params: t.Object({
        uuid: t.String(),
    }),
    body: t.Partial(
        t.Pick(prescriptionResponseSchema, [
            "content",
            "isActive",
        ])
    ),
    response: {
        200: prescriptionResponseSchema,
        404: errorResponseDto[404],
        422: errorResponseDto[422],
    },
    detail: {
        summary: "Update Prescription",
    },
} satisfies ControllerHook;

export const prescriptionDestroyDto = {
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
        summary: "Delete Prescription",
    },
} satisfies ControllerHook;