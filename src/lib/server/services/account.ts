import type { PrismaClient } from "$db/client.js";
import { Logger } from "$lib/logger";
import { ErrorReason, Result } from "$lib/server/errors";

const logger = new Logger("AccountService");

interface RenameAccountInput {
  userId: string;
  name: string;
}
type RenameAccountResult = Result<{ name: string }, typeof ErrorReason.AccountNotFound>;

/**
 * Reference implementation of the service conventions — see
 * `docs/adr/0001-service-layer-and-test-seam.md`. Kept deliberately small; the Phase 1
 * domain services replace it as examples.
 */
export async function renameAccount(db: PrismaClient, input: RenameAccountInput): Promise<RenameAccountResult> {
  logger.debug("Renaming account", { userId: input.userId });

  // `updateMany` rather than read-then-`update`: a missing row is a count of zero, not a throw.
  const { count } = await db.user.updateMany({
    data: { name: input.name },
    where: { id: input.userId },
  });

  if (count === 0) {
    logger.info("Rename refused, no such account", { reason: ErrorReason.AccountNotFound, userId: input.userId });
    return Result.fail(ErrorReason.AccountNotFound);
  }

  logger.info("Account renamed", { userId: input.userId });

  return Result.ok({ name: input.name });
}
