import { ErrorReason } from "$lib/server/errors";
import { mockDb } from "$lib/server/testing/mock-db";

import { emailIsTaken, renameAccount } from "./account";

describe("emailIsTaken", () => {
  it("reports an address that already has an account", async () => {
    const db = mockDb();
    db.user.count.mockResolvedValue(1);

    await expect(emailIsTaken(db, { email: "ada@example.com" })).resolves.toBe(true);
  });

  it("reports an address that is free", async () => {
    const db = mockDb();
    db.user.count.mockResolvedValue(0);

    await expect(emailIsTaken(db, { email: "ada@example.com" })).resolves.toBe(false);
  });
});

describe("renameAccount", () => {
  it("writes the name the user submitted and returns it", async () => {
    const db = mockDb();
    db.user.updateMany.mockResolvedValue({ count: 1 });

    const result = await renameAccount(db, { name: "Ada Lovelace", userId: "user-1" });

    expect(result).toStrictEqual({ data: { name: "Ada Lovelace" }, ok: true });
    expect(db.user.updateMany).toHaveBeenCalledWith({
      data: { name: "Ada Lovelace" },
      where: { id: "user-1" },
    });
  });

  it("refuses an unknown account with a reason rather than throwing", async () => {
    const db = mockDb();
    db.user.updateMany.mockResolvedValue({ count: 0 });

    const result = await renameAccount(db, { name: "Ada Lovelace", userId: "missing" });

    expect(result).toStrictEqual({ ok: false, reason: ErrorReason.AccountNotFound });
  });
});
