import { t } from "elysia";
import { PatientPlain } from "../../../../../packages/database/prismabox/Patient"
import { UserPlain } from "@onlyjs/db/prismabox/User";
import { DoctorPlain } from "@onlyjs/db/prismabox/Doctor";
import type { ControllerHook } from "#utils/elysia-types.ts";
import { errorResponseDto } from "#utils/common-dtos.ts";

export const patientResponseSchema = t.Composite([
    t.Omit(PatientPlain, ["userId", "familyDoctorId"]),
    t.Object({
        user: t.Pick(UserPlain, ["id", "firstName", "lastName", "email", "tcNo", "gender"]),
        familyDoctor: t.Optional(
            t.Pick(DoctorPlain, ['id', 'specialty'])
        ),
    })

])

export const patientsIndexDto = {
    query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
        familyDoctorId: t.Optional(t.String()),
    }),
    response: {
        200: t.Array(patientResponseSchema)
    },
    detail: {
        summary: 'List Patients',
    },
} satisfies ControllerHook;


export const patientShowDto = {
    params: t.Object({
        id: t.String(),
    }),
    response: {
        200: patientResponseSchema,
        404: errorResponseDto[404],
    },
    detail: {
        summary: 'Show Patient',
    },
} satisfies ControllerHook;

export const patientCreateDto = {
    body: t.Object({
        // User fields
        firstName: UserPlain.properties.firstName,
        lastName: UserPlain.properties.lastName,
        email: UserPlain.properties.email,
        tcNo: UserPlain.properties.tcNo,
        gender: UserPlain.properties.gender,

        // Patient fields
        phoneNumber: t.Optional(PatientPlain.properties.phoneNumber),
        address: t.Optional(PatientPlain.properties.address),
        dateOfBirth: t.Optional(PatientPlain.properties.dateOfBirth),
        familyDoctorId: t.Optional(t.Integer({ minimum: 1 })),
    }),
    response: {
        200: patientResponseSchema,
        409: errorResponseDto[409],
        422: errorResponseDto[422],
    },
    detail: {
        summary: 'Create Patient',
    },
} satisfies ControllerHook;

export const updatePatientDto = {
    params: t.Object({
        id: t.String(),
    }),
    body: t.Partial(
        t.Pick(PatientPlain,
            [
                "phoneNumber",
                "address",
                "dateOfBirth",
                "familyDoctorId"
            ]
        )
    ),
    response: {
        200: patientResponseSchema,
        404: errorResponseDto[404],
        422: errorResponseDto[422],
    },
    detail: {
        summary: 'Update Patient',
    },
} satisfies ControllerHook;


export const patientDestroyDto = {
    params: t.Object({
        id: t.String(),
    }),
    response: {
        200: t.Object({
            message: t.String(),
        }),
        404: errorResponseDto[404],
    },
    detail: {
        summary: 'Delete Patient',
    },
} satisfies ControllerHook;

export const patientCreateResponseDto = patientCreateDto.response['200'];