import { auth } from "#modules/auth/authentication/plugin.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../audit-logs";
import {
  appointmentCancelDto,
  appointmentCompleteDto,
  appointmentConfirmDto,
  appointmentCreateDto,
  appointmentDestroyDto,
  appointmentShowDto,
  appointmentsIndexDto,
  appointmentUpdateDto,
} from "./dtos";
import { AppointmentFormatter } from "./formatters";
import { AppointmentService } from "./service";

const app = new Elysia({
  prefix: "/appointments",
  detail: {
    tags: ["Appointments"],
  },
})
  .use(auth())
  .post(
    "",
    async ({ body }) => {
      const appointment = await AppointmentService.store(body);
      return AppointmentFormatter.response(appointment as any);
    },
    dtoWithMiddlewares(
      appointmentCreateDto,
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: (context: any) => context.response?.uuid || "unknown",
        getDescription: () => "Yeni randevu oluşturuldu",
      })
    )
  )
  .get(
    "",
    async ({ query }) => {
      const appointments = await AppointmentService.index({
        search: query.search,
        doctorId: query.doctorId,
        patientId: query.patientId,
        status: query.status,
        startDate: query.startDate,
        endDate: query.endDate,
        clinicId: query.clinicId,
        page: query.page,
        limit: query.limit,
      });
      const response = appointments.map((appointment: any) => AppointmentFormatter.response(appointment));
      return response;
    },
    appointmentsIndexDto
  )
  .get(
    "/:uuid",
    async ({ params: { uuid } }) => {
      if (!uuid) {
        throw new BadRequestException("Randevu ID gereklidir");
      }
      const appointment = await AppointmentService.show({ uuid: uuid });
      const response = AppointmentFormatter.response(appointment as any);
      return response;
    },
    appointmentShowDto
  )
  .patch(
    "/:uuid", // update
    async ({ params: { uuid }, body }) => {
      const updatedAppointment = await AppointmentService.update(uuid, body);
      const response = AppointmentFormatter.response(updatedAppointment as any);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      appointmentUpdateDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Randevu bilgileri güncellendi",
      })
    )
  )
  .delete(
    "/:uuid", // destroy
    async ({ params: { uuid } }) => {
      await AppointmentService.destroy(uuid);
      return { message: "Randevu başarıyla silindi" };
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      appointmentDestroyDto,
      withAuditLog({
        actionType: AuditLogAction.DELETE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Randevu silindi",
      })
    )
  )
  .post(
    "/:uuid/restore", // restore
    async ({ params: { uuid } }) => {
      const appointment = await AppointmentService.restore(uuid);
      const response = AppointmentFormatter.response(appointment as any);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      appointmentShowDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Randevu geri yüklendi",
      })
    )
  )
  .post(
    "/:uuid/confirm", // confirm appointment
    async ({ params: { uuid } }) => {
      const appointment = await AppointmentService.confirm(uuid);
      const response = AppointmentFormatter.response(appointment as any);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      appointmentConfirmDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Randevu onaylandı",
      })
    )
  )
  .post(
    "/:uuid/complete", // complete appointment
    async ({ params: { uuid }, body }) => {
      const appointment = await AppointmentService.complete(uuid, body.notes);
      const response = AppointmentFormatter.response(appointment as any);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      appointmentCompleteDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Randevu tamamlandı",
      })
    )
  )
  .post(
    "/:uuid/cancel", // cancel appointment
    async ({ params: { uuid }, body }) => {
      const appointment = await AppointmentService.cancel(uuid, body.reason);
      const response = AppointmentFormatter.response(appointment as any);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      appointmentCancelDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Randevu iptal edildi",
      })
    )
  )
  .post(
    "/:uuid/no-show", // mark as no show
    async ({ params: { uuid } }) => {
      const appointment = await AppointmentService.markNoShow(uuid);
      const response = AppointmentFormatter.response(appointment as any);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      appointmentConfirmDto, // Same as confirm, just params
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Randevu gelmedi olarak işaretlendi",
      })
    )
  );

export default app;
