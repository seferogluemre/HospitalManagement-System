import { auth } from "#modules/auth/authentication/plugin.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../audit-logs";
import { patientShowDto } from "../patients";
import {
  appointmentCreateDto,
  appointmentDestroyDto,
  appointmentShowDto,
  appointmentsIndexDto,
  appointmentUpdateDto,
} from "./dtos";
import { AppointmentService } from "./service";
import { AppointmentFormatter } from "./formatters";

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
      return AppointmentFormatter.response(appointment);
    },
    dtoWithMiddlewares(
      appointmentCreateDto,
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: (context: any) => context.body.uuid,
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
      const response = appointments.map(AppointmentFormatter.response);
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
      const response = AppointmentFormatter.response(appointment);
      return response;
    },
    patientShowDto
  )
  .patch(
    "/:uuid", // update
    async ({ params: { uuid }, body }) => {
      const updatedAppointment = await AppointmentService.update(uuid, body);
      const response = AppointmentFormatter.response(updatedAppointment);
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
        getEntityUuid: ({ params }: any) => params.id.toString(),
        getDescription: () => "Randevu silindi",
      })
    )
  )
  .post(
    "/:uuid/restore", // restore
    async ({ params: { uuid } }) => {
      const appointment = await AppointmentService.restore(uuid);
      const response = AppointmentFormatter.response(appointment);
      return response;
    },
    // @ts-ignore - Complex middleware composition
    dtoWithMiddlewares(
      appointmentShowDto,
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.USER,
        getEntityUuid: ({ params }: any) => params.id.toString(),
        getDescription: () => "Randevu geri yüklendi",
      })
    )
  );

export default app;
