import { errorResponseDto } from "#utils/common-dtos.ts";
import type { ControllerHook } from "#utils/elysia-types.ts";
import { TreatmentPlain } from "@onlyjs/db/prismabox/Treatment";
import { t } from "elysia";

export const treatmentResponseSchema = t.Composite([
  t.Omit(TreatmentPlain, [
    "id",
    "doctorId",
    "deletedAt",
  ]),
  t.Object({
    id: t.Number(),
    doctor: t.Object({
      id: t.Number(),
      uuid: t.String(),
      specialty: t.String(),
      user: t.Object({
        firstName: t.String(),
        lastName: t.String(),
        email: t.String(),
      }),
      clinic: t.Object({
        uuid: t.String(),
        name: t.String(),
      }),
    }),
    appointment: t.Object({
      uuid: t.String(),
      appointmentDate: t.Date(),
      patient: t.Object({
        uuid: t.String(),
        user: t.Object({
          firstName: t.String(),
          lastName: t.String(),
        }),
      }),
    }),
  }),
]);

export const treatmentsIndexDto = {
  query: t.Object({
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    search: t.Optional(t.String()),
    doctorId: t.Optional(t.String()),
    appointmentId: t.Optional(t.String()),
    aiStatus: t.Optional(t.String()),
  }),
  response: {
    200: t.Array(treatmentResponseSchema),
  },
  detail: {
    summary: "List Treatments",
  },
} satisfies ControllerHook;

export const treatmentShowDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  response: {
    200: treatmentResponseSchema,
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Show Treatment",
  },
} satisfies ControllerHook;

export const treatmentCreateDto = {
  body: t.Object({
    title: t.String({ minLength: 2, maxLength: 255 }),
    notes: t.Optional(t.String({ maxLength: 1000 })),
    diagnosis: t.Optional(t.String()),
    appointmentId: t.String(),
    doctorId: t.Number({ minimum: 1 }),
  }),
  response: {
    200: treatmentResponseSchema,
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Create Treatment",
  },
} satisfies ControllerHook;

export const treatmentCreateWithAIDto = {
  body: t.Object({
    title: t.String({ minLength: 2, maxLength: 255 }),
    appointmentId: t.String(),
    doctorId: t.Number({ minimum: 1 }),
    patientComplaint: t.String({ minLength: 5, maxLength: 2000 }),
    patientAge: t.Optional(t.Number({ minimum: 0, maximum: 150 })),
    patientGender: t.Optional(t.Union([t.Literal('male'), t.Literal('female'), t.Literal('other')])),
    symptoms: t.Optional(t.Array(t.String())),
    allergies: t.Optional(t.Array(t.String())),
    doctorNotes: t.Optional(t.String({ maxLength: 1000 })),
  }),
  response: {
    200: t.Object({
      treatment: treatmentResponseSchema,
      aiGenerated: t.Boolean(),
      aiConfidence: t.Optional(t.Number()),
      aiStatus: t.Optional(t.String()),
    }),
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Create Treatment with AI Support",
  },
} satisfies ControllerHook;

export const treatmentUpdateDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  body: t.Partial(
    t.Object({
      title: t.String({ minLength: 2, maxLength: 255 }),
      notes: t.String({ maxLength: 1000 }),
      diagnosis: t.String(),
    })
  ),
  response: {
    200: treatmentResponseSchema,
    404: errorResponseDto[404],
    422: errorResponseDto[422],
  },
  detail: {
    summary: "Update Treatment",
  },
} satisfies ControllerHook;

export const treatmentDestroyDto = {
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
    summary: "Delete Treatment",
  },
} satisfies ControllerHook;

export const treatmentAIReviewDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  body: t.Object({
    approved: t.Boolean(),
    aiReviewNotes: t.Optional(t.String({ maxLength: 1000 })),
    updatedDiagnosis: t.Optional(t.String()),
    updatedTreatment: t.Optional(t.String()),
  }),
  response: {
    200: treatmentResponseSchema,
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Review AI Treatment Report",
  },
} satisfies ControllerHook;

export const treatmentAIRegenerateDto = {
  params: t.Object({
    uuid: t.String(),
  }),
  response: {
    200: t.Object({
      success: t.Boolean(),
      treatment: t.Optional(treatmentResponseSchema),
      error: t.Optional(t.String()),
    }),
    404: errorResponseDto[404],
  },
  detail: {
    summary: "Regenerate AI Treatment Report",
  },
} satisfies ControllerHook;

export const treatmentAIHealthDto = {
  response: {
    200: t.Object({
      isHealthy: t.Boolean(),
      status: t.String(),
      responseTime: t.Optional(t.Number()),
      error: t.Optional(t.String()),
    }),
  },
  detail: {
    summary: "Check AI Service Health",
  },
} satisfies ControllerHook;

export const treatmentAIStatsDto = {
  response: {
    200: t.Object({
      totalAIReports: t.Number(),
      approvedReports: t.Number(),
      pendingReports: t.Number(),
      rejectedReports: t.Number(),
      averageConfidence: t.Number(),
    }),
  },
  detail: {
    summary: "Get AI Treatment Statistics",
  },
} satisfies ControllerHook;