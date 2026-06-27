import type { AuditEventInput, AuditEventRecord, TransactionClient, UserContext } from "./types.js";

export async function writeAuditEvent(
  tx: TransactionClient,
  userContext: UserContext,
  input: AuditEventInput
): Promise<AuditEventRecord> {
  return tx.insertAuditEvent({
    organizationId: userContext.organizationId,
    actorUserId: userContext.userId,
    eventType: input.eventType,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    beforeJson: input.beforeJson ?? null,
    afterJson: input.afterJson ?? null,
    requestId: input.requestId ?? null
  });
}
