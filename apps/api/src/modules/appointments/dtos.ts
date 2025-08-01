import { errorResponseDto } from "#utils/common-dtos.ts";
import type { ControllerHook } from "#utils/elysia-types.ts";
import { AppointmentPlain } from "@onlyjs/db/prismabox/Appointment";
import { UserPlain } from "@onlyjs/db/prismabox/User";
import { t } from "elysia";

export const appointmentResponseSchema = t.Composite([
  t.Omit(AppointmentPlain, [
    "id",
    "patientId",
    "doctorId",
    "createdBySecretaryId",
    "deletedAt",
  ]),
  t.Object({
    id: t.Number(),
    patient: t.Object({
      uuid: t.String(),
      user: t.Pick(UserPlain, ["firstName", "lastName", "email", "tcNo"]),
      phoneNumber: t.Optional(t.String()),
    }),
    doctor: t.Object({
      id: t.Number(),
      uuid: t.String(),
      specialty: t.String(),
      user: t.Pick(UserPlain, ["firstName", "lastName", "email"]),
      clinic: t.Object({
        uuid: t.String(),
        name: t.String(),
      }),
    }),
    createdBySecretary: t.Optional(
      t.Object({
        uuid: t.String(),
        user: t.Pick(UserPlain, ["firstName", "lastName", "email"]),
      })
    ),
  }),
]);

export const appointmentsIndexDto = {
  query: t.Object({
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    search: t.Optional(t.String()),
    patientId: t.Optional(t.String()),
    doctorId: t.Optional(t.String()),
    status: t.Optional(AppointmentPlain.properties.status),
    startDate: t.Optional(t.String({ format: "date" })),
    endDate: t.Optional(t.String({ format: "date" })),
    clinicId: t.Optional(t.String()),
  }),
  response: {
    200: t.Array(appointmentResponseSchema),
  },
  detail: {
    summary: "List Appointments",
  },
} satisfies ControllerHook;

export const appointmentShowDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  response: {
    200: appointmentResponseSchema,
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Show Appointment",
  },
} satisfies ControllerHook;

export const appointmentCreateDto = {
  body: t.Object({
    patientId: t.String(),
    doctorId: t.Number({ minimum: 1 }),
    appointmentDate: t.Date(),
    status: t.Optional(AppointmentPlain.properties.status),
    description: t.Optional(t.String({ maxLength: 1000 })),
    notes: t.Optional(t.String({ maxLength: 1000 })),
    createdBySecretaryId: t.Optional(t.Number({ minimum: 1 })),
  }),
  response: {
    200: appointmentResponseSchema,
    409: errorResponseDto[409],
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Create Appointment",
  },
} satisfies ControllerHook;

export const appointmentUpdateDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  body: t.Partial(
    t.Object({
      appointmentDate: t.Date(),
      status: AppointmentPlain.properties.status,
      description: t.Optional(t.String({ maxLength: 1000 })),
      notes: t.Optional(t.String({ maxLength: 1000 })),
    })
  ),
  response: {
    200: appointmentResponseSchema,
    404: errorResponseDto[404],
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Update Appointment",
  },
} satisfies ControllerHook;

export const appointmentDestroyDto = {
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
    summary: "Delete Appointment",
  },
} satisfies ControllerHook;

export const appointmentConfirmDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  response: {
    200: appointmentResponseSchema,
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Confirm Appointment",
  },
} satisfies ControllerHook;

export const appointmentCompleteDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  body: t.Object({
    notes: t.Optional(t.String({ maxLength: 1000 })),
  }),
  response: {
    200: appointmentResponseSchema,
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Complete Appointment",
  },
} satisfies ControllerHook;

export const appointmentCancelDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  body: t.Object({
    reason: t.Optional(t.String({ maxLength: 500 })),
  }),
  response: {
    200: appointmentResponseSchema,
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Cancel Appointment",
  },
} satisfies ControllerHook;
