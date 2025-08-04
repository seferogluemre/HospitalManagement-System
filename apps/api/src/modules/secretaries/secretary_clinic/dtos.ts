import { errorResponseDto } from "#utils/common-dtos.ts";
import type { ControllerHook } from "#utils/elysia-types.ts";
import { t } from "elysia";

export const secretaryClinicResponseSchema = t.Object({
  id: t.Number(),
  secretary: t.Object({
    uuid: t.String(),
    user: t.Object({
      firstName: t.String(),
      lastName: t.String(),
      email: t.String(),
    }),
  }),
  clinic: t.Object({
    uuid: t.String(),
    name: t.String(),
  }),
  createdAt: t.Date(),
});

export const secretaryClinicIndexDto = {
  query: t.Object({
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    search: t.Optional(t.String()),
    secretaryUuid: t.Optional(t.String()),
    clinicUuid: t.Optional(t.String()),
  }),
  response: {
    200: t.Array(secretaryClinicResponseSchema),
  },
  detail: {
    summary: 'List Secretary-Clinic Assignments',
  },
} satisfies ControllerHook;

export const secretaryClinicShowDto = {
  params: t.Object({
    id: t.String(),
  }),
  response: {
    200: secretaryClinicResponseSchema,
    404: errorResponseDto[404],
  },
  detail: {
    summary: 'Show Secretary-Clinic Assignment',
  },
} satisfies ControllerHook;

export const secretaryClinicCreateDto = {
  body: t.Object({
    secretaryUuid: t.String({ minLength: 1 }),
    clinicUuid: t.String({ minLength: 1 }),
  }),
  response: {
    200: secretaryClinicResponseSchema,
    404: errorResponseDto[404],
    409: errorResponseDto[409],
    422: errorResponseDto[422],
  },
  detail: {
    summary: 'Create Secretary-Clinic Assignment',
  },
} satisfies ControllerHook;

export const secretaryClinicUpdateDto = {
  params: t.Object({
    id: t.String(),
  }),
  body: t.Object({
    secretaryUuid: t.Optional(t.String({ minLength: 1 })),
    clinicUuid: t.Optional(t.String({ minLength: 1 })),
  }),
  response: {
    200: secretaryClinicResponseSchema,
    404: errorResponseDto[404],
    409: errorResponseDto[409],
    422: errorResponseDto[422],
  },
  detail: {
    summary: 'Update Secretary-Clinic Assignment',
  },
} satisfies ControllerHook;

export const secretaryClinicDestroyDto = {
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
    summary: 'Delete Secretary-Clinic Assignment',
  },
} satisfies ControllerHook;