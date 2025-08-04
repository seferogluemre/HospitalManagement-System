import { errorResponseDto } from "#utils/common-dtos.ts";
import type { ControllerHook } from "#utils/elysia-types.ts";
import { SecretaryPlain } from "@onlyjs/db/prismabox/Secretary";
import { UserPlain } from "@onlyjs/db/prismabox/User";
import { t } from "elysia";

export const secretariesResponseSchema = t.Composite([
    t.Omit(SecretaryPlain, ["id", "userId", "deletedAt"]),
     t.Object({ 
       id: t.Number(),
       user: t.Pick(UserPlain, [
         "id",
         "firstName",
         "lastName",
         "email",
         "tcNo",
         "gender",
       ]),
     }),
])

export const secretariesIndexDto = {
    query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        search: t.Optional(t.String()),
    }),
    response: {
        200: t.Array(secretariesResponseSchema)
    },
    detail: {
        summary: 'List Secretaries',
    },
} satisfies ControllerHook;


export const secretaryShowDto = {
    params: t.Object({
        uuid: t.String(),
    }),
    response: {
        200: secretariesResponseSchema,
        404: errorResponseDto[404],
    },
    detail: {
        summary: 'Show Secretary',
    },
} satisfies ControllerHook;

export const secretaryUpdateDto = {
    params: t.Object({
        uuid: t.String(),
    }),
    body: t.Partial(
        t.Pick(SecretaryPlain, [
            'phoneNumber',
            'address',
            'dateOfBirth',
        ])
    ),
    response: {
        200: secretariesResponseSchema,
        404: errorResponseDto[404],
        422: errorResponseDto[422],
    },
    detail: {
        summary: 'Update Secretary',
    },
} satisfies ControllerHook;


export const secretaryCreateDto = {
    body: t.Object({
        // User fields
        firstName: UserPlain.properties.firstName,
        lastName: UserPlain.properties.lastName,
        email: UserPlain.properties.email,
        tcNo: UserPlain.properties.tcNo,
        gender: UserPlain.properties.gender,
        password: t.String({ minLength: 8, maxLength: 32 }),

        // Secretary fields
        phoneNumber: t.Optional(SecretaryPlain.properties.phoneNumber),
        address: t.Optional(SecretaryPlain.properties.address),
        dateOfBirth: t.Optional(SecretaryPlain.properties.dateOfBirth),
    }),
    response: {
        200: secretariesResponseSchema,
        409: errorResponseDto[409],
        422: errorResponseDto[422],
    },
    detail: {
        summary: 'Create Secretary',
    },
} satisfies ControllerHook;

export const updateSecretaryDto = {
    params: t.Object({
        id: t.String(),
    }),
    body: t.Partial(
        t.Pick(SecretaryPlain,
            [
                "phoneNumber",
                "address",
                "dateOfBirth",
            ]
        )
    ),
    response: {
        200: secretariesResponseSchema,
        404: errorResponseDto[404],
        422: errorResponseDto[422],
    },
    detail: {
        summary: 'Update Secretary',
    },
} satisfies ControllerHook;

export const secretaryDestroyDto = {
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
        summary: 'Delete Secretary',
    },
} satisfies ControllerHook;

export const secretaryCreateResponseDto = secretaryCreateDto.response['200'];