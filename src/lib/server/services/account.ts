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
 * Better Auth refuses to say whether an address is taken — `changeEmail` returns success and mails
 * nothing — which would strand a user waiting for a code. One email maps to one account and we
 * already say so at sign-up, so there is no enumeration left to protect here.
 */
export async function emailIsTaken(db: PrismaClient, input: { email: string }): Promise<boolean> {
  return (await db.user.count({ where: { email: input.email } })) > 0;
}

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
