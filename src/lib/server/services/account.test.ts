import { ErrorReason } from "$lib/server/errors";
import { mockDb } from "$lib/server/testing/mock-db";

import { renameAccount } from "./account";

describe("renameAccount", () => {
  it("writes the name the user submitted and returns it", async () => {
    mockDb.user.updateMany.mockResolvedValue({ count: 1 });

    const result = await renameAccount({ name: "Ada Lovelace", userId: "user-1" });

    expect(result).toStrictEqual({ data: { name: "Ada Lovelace" }, ok: true });
    expect(mockDb.user.updateMany).toHaveBeenCalledWith({
      data: { name: "Ada Lovelace" },
      where: { id: "user-1" },
    });
  });

  it("refuses an unknown account with a reason rather than throwing", async () => {
    mockDb.user.updateMany.mockResolvedValue({ count: 0 });

    const result = await renameAccount({ name: "Ada Lovelace", userId: "missing" });

    expect(result).toStrictEqual({ ok: false, reason: ErrorReason.AccountNotFound });
  });
});
