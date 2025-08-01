import { errorResponseDto } from "#utils/common-dtos.ts";
import type { ControllerHook } from "#utils/elysia-types.ts";
import { AppointmentPlain } from "@onlyjs/db/prismabox/Appointment";
import { DoctorPlain } from "@onlyjs/db/prismabox/Doctor";
import { UserPlain } from "@onlyjs/db/prismabox/User";
import { t } from "elysia";

export const doctorResponseSchema = t.Composite([
  t.Omit(DoctorPlain, ["id", "userId", "clinicId", "deletedAt"]),
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
]);

export const doctorsIndexDto = {
  query: t.Object({
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    search: t.Optional(t.String()),
    specialty: t.Optional(t.String()),
  }),
  response: {
    200: t.Array(doctorResponseSchema),
  },
  detail: {
    summary: "List Doctors",
  },
} satisfies ControllerHook;

export const doctorShowDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  response: {
    200: doctorResponseSchema,
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Show Doctor",
  },
} satisfies ControllerHook;

export const doctorCreateDto = {
  body: t.Object({
    firstName: t.String(),
    lastName: UserPlain.properties.lastName,
    email: UserPlain.properties.email,
    tcNo: UserPlain.properties.tcNo,
    gender: UserPlain.properties.gender,

    clinicId: t.Number({ minimum: 1 }),
    phoneNumber: t.Optional(t.String()),
    address: t.Optional(t.String()),
    dateOfBirth: t.Optional(t.Date()),
    specialty: t.String(),
  }),
  response: {
    200: doctorResponseSchema,
    409: errorResponseDto[409],
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Create Doctor",
  },
} satisfies ControllerHook;

export const doctorUpdateDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  body: t.Partial(
    t.Object({
      clinicId: t.Number({ minimum: 1 }),
      phoneNumber: t.Optional(t.String()),
      address: t.Optional(t.String()),
      dateOfBirth: t.Optional(t.Date()),
      specialty: t.String(),
    })
  ),
  response: {
    200: doctorResponseSchema,
    404: errorResponseDto[404],
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Update Doctor",
  },
} satisfies ControllerHook;

export const doctorDestroyDto = {
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
    summary: "Delete Doctor",
  },
} satisfies ControllerHook;

const appointmentResponseSchema = t.Composite([
  t.Pick(AppointmentPlain, [
    "notes",
    "completedAt",
    "appointmentDate",
    "status",
  ]),
  t.Object({
    patient: t.Object({
      id: t.Number(),
      user: t.Pick(UserPlain, ["firstName", "lastName", "email", "gender"]),
    }),
    doctor: t.Object({
      id: t.Number(),
      user: t.Pick(UserPlain, ["firstName", "lastName", "email", "gender"]),
    }),
  }),
]);

export const appointmentsGetDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  response: {
    200: t.Array(appointmentResponseSchema),
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Get Doctor Appointments",
  },
} satisfies ControllerHook;
