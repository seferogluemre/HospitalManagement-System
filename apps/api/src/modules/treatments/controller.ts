import { auth } from "#modules/auth/authentication/plugin.ts";
import { PERMISSIONS, withPermission } from "#modules/auth/index.ts";
import { BadRequestException } from "#utils/http-errors.ts";
import { dtoWithMiddlewares } from "#utils/middleware-utils.ts";
import Elysia from "elysia";
import { AuditLogAction, AuditLogEntity, withAuditLog } from "../audit-logs";
import { AIReportService } from "./ai/services/ai-report.service";
import {
  treatmentAIHealthDto,
  treatmentAIRegenerateDto,
  treatmentAIReviewDto,
  treatmentAIStatsDto,
  treatmentCreateDto,
  treatmentCreateWithAIDto,
  treatmentDestroyDto,
  treatmentShowDto,
  treatmentsIndexDto,
  treatmentUpdateDto,
} from "./dtos";
import { TreatmentFormatter } from "./formatters";
import { TreatmentService } from "./service";

const app = new Elysia({
  prefix: "/treatments",
  detail: {
    tags: ["Treatments"],
  },
})
  .use(auth())
  .post(
    "",
    async ({ body }) => {
      console.log("Teşhis kontrolüne girildi", body);
      const treatment = await TreatmentService.store(body);
      console.log("Teşhis kontrolünden çıkıldı", treatment);
      return TreatmentFormatter.response(treatment);
    },
    dtoWithMiddlewares(
      treatmentCreateDto, 
      withPermission(PERMISSIONS.TREATMENTS.CREATE),
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.APPOINTMENT, 
        getEntityUuid: (context: any) => context.response?.uuid || "unknown",
        getDescription: () => "Yeni treatment oluşturuldu",
      })
    )
  )
  .post(
    "/ai-generate",
    async ({ body }) => {
      const { TreatmentService: TreatmentServiceAI } = await import("./services");
      const result = await TreatmentServiceAI.createWithAI(body);
      
      return {
        treatment: TreatmentFormatter.response(result.treatment),
        aiGenerated: result.aiGenerated,
        aiConfidence: result.aiConfidence,
        aiStatus: result.aiStatus,
      };
    },
    dtoWithMiddlewares(
      treatmentCreateWithAIDto,
      withAuditLog({
        actionType: AuditLogAction.CREATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: (context: any) => context.response?.treatment?.uuid || "unknown",
        getDescription: () => "AI destekli treatment oluşturuldu",
      })
    )
  )
  .get(
    "",
    async ({ query }) => {
      const treatments = await TreatmentService.index({
        search: query.search,
        doctorId: query.doctorId,
        appointmentId: query.appointmentId,
        aiStatus: query.aiStatus,
        page: query.page,
        limit: query.limit,
      });
      const response = treatments.map((treatment: any) => TreatmentFormatter.response(treatment));
      return response;
    },
    dtoWithMiddlewares(
      treatmentsIndexDto,
      withPermission(PERMISSIONS.TREATMENTS.READ)
    )
  )
  .get(
    "/:uuid",
    async ({ params: { uuid } }) => {
      if (!uuid) {
        throw new BadRequestException("Treatment ID gereklidir");
      }
      const treatment = await TreatmentService.show({ uuid: uuid });
      const response = TreatmentFormatter.response(treatment);
      return response;
    },
    dtoWithMiddlewares(
      treatmentShowDto,
      withPermission(PERMISSIONS.TREATMENTS.SHOW)
    )
  )
  .patch(
    "/:uuid",
    async ({ params: { uuid }, body }) => {
      const updatedTreatment = await TreatmentService.update(uuid, body);
      const response = TreatmentFormatter.response(updatedTreatment);
      return response;
    },
    dtoWithMiddlewares(
      treatmentUpdateDto,
      withPermission(PERMISSIONS.TREATMENTS.UPDATE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Treatment bilgileri güncellendi",
      })
    )
  )
  .delete(
    "/:uuid",
    async ({ params: { uuid } }) => {
      await TreatmentService.destroy(uuid);
      return { message: "Treatment başarıyla silindi" };
    },
    dtoWithMiddlewares(
      treatmentDestroyDto,
      withPermission(PERMISSIONS.TREATMENTS.DESTROY),
      withAuditLog({
        actionType: AuditLogAction.DELETE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Treatment silindi",
      })
    )
  )
  .post(
    "/:uuid/restore",
    async ({ params: { uuid } }) => {
      const treatment = await TreatmentService.restore(uuid);
      const response = TreatmentFormatter.response(treatment);
      return response;
    },
    dtoWithMiddlewares(
      treatmentShowDto,
      withPermission(PERMISSIONS.TREATMENTS.UPDATE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "Treatment geri yüklendi",
      })
    )
  )
  .post(
    "/:uuid/ai-review",
    async ({ params: { uuid }, body }) => {
      const { TreatmentService: TreatmentServiceAI } = await import("./services");
      const treatment = await TreatmentServiceAI.reviewAIReport(uuid, body);
      return TreatmentFormatter.response(treatment);
    },
    dtoWithMiddlewares(
      treatmentAIReviewDto,
      withPermission(PERMISSIONS.TREATMENTS.UPDATE),
      withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: ({ body }: any) => body.approved ? "AI raporu onaylandı" : "AI raporu reddedildi",
      })
    )
  )
  .post(
    "/:uuid/ai-regenerate",
    async ({ params: { uuid } }) => {
      const { TreatmentService: TreatmentServiceAI } = await import("./services");
      const result = await TreatmentServiceAI.regenerateAIReport(uuid);
      return {
        success: result.success,
        treatment: result.treatment ? TreatmentFormatter.response(result.treatment) : undefined,
        error: result.error,
      };
    },
    dtoWithMiddlewares(
      treatmentAIRegenerateDto,
      withPermission(PERMISSIONS.TREATMENTS.UPDATE),
        withAuditLog({
        actionType: AuditLogAction.UPDATE,
        entityType: AuditLogEntity.APPOINTMENT,
        getEntityUuid: ({ params }: any) => params.uuid,
        getDescription: () => "AI raporu yeniden oluşturuldu",
      })
    )
  )
  .get(
    "/ai/health",
    async () => {
      const health = await AIReportService.checkAIHealth();
      return health;
    },
    dtoWithMiddlewares(
      treatmentAIHealthDto,
      withPermission(PERMISSIONS.TREATMENTS.READ)
    )
  )
  .get(
    "/ai/stats",
    async () => {
      const { AIReportService } = await import("./ai/services/ai-report.service");

      // You should replace these with actual values from your service
      const stats = {
        totalAIReports: 0,
        approvedReports: 0,
        pendingReports: 0,
        rejectedReports: 0,
        averageConfidence: 0
      };
      return stats;
    },
    dtoWithMiddlewares(
      treatmentAIStatsDto,
      withPermission(PERMISSIONS.TREATMENTS.READ)
    )
  );

export default app;