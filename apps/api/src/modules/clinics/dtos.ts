import { errorResponseDto } from "#utils/common-dtos.ts";
import type { ControllerHook } from "#utils/elysia-types.ts";
import { ClinicPlain } from "@onlyjs/db/prismabox/Clinic";
import { t } from "elysia";

export const clinicResponseSchema = t.Composite([
  t.Omit(ClinicPlain, ["updatedAt", "createdAt", "deletedAt"]),
]);

export const clinicIndexDto = {
  query: t.Object({
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    search: t.Optional(t.String()),
  }),
  response: {
    200: t.Array(clinicResponseSchema),
  },
  detail: {
    summary: "List Clinics",
  },
} satisfies ControllerHook;

export const clinicShowDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  response: {
    200: clinicResponseSchema,
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Show Clinic",
  },
} satisfies ControllerHook;

export const clinicCreateDto = {
  body: t.Object({
    name: ClinicPlain.properties.name,
    description: ClinicPlain.properties.description,
    phone: t.Optional(t.String()),
    address: t.Optional(t.String()),
  }),
  response: {
    200: clinicResponseSchema,
    409: errorResponseDto[409],
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Create Clinic",
  },
} satisfies ControllerHook;

export const clinicUpdateDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  body: t.Partial(
    t.Object({
      name: t.Optional(ClinicPlain.properties.name),
      description: t.Optional(ClinicPlain.properties.description),
      phone: t.Optional(t.String()),
      address: t.Optional(t.String()),
    })
  ),
  response: {
    200: clinicResponseSchema,
    404: errorResponseDto[404],
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Update Clinic",
  },
} satisfies ControllerHook;

export const clinicDestroyDto = {
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
    summary: "Delete Clinic",
  },
} satisfies ControllerHook;