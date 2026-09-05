import { mockDb } from "$lib/server/testing/mock-db";

import {
  findRegionsBySlug,
  findRoleTagsBySlug,
  findStyleTagsBySlug,
  listRegions,
  listRoleTags,
  listStyleTags,
} from "./taxonomy";

const byDisplayOrder = [{ sortOrder: "asc" }, { name: "asc" }];

const seededAt = new Date("2026-01-01T00:00:00.000Z");

/** Every lookup table has the same shape, so one builder keeps a new column out of six literals. */
function row(fields: { id: number; name: string; retiredAt?: Date; slug: string; sortOrder: number }) {
  return { createdAt: seededAt, retiredAt: null, updatedAt: seededAt, ...fields };
}

describe("selection lists", () => {
  it("offers only regions that are not retired, in display order", async () => {
    const regions = [row({ id: 1, name: "North Texas", slug: "north-texas", sortOrder: 10 })];
    mockDb.region.findMany.mockResolvedValue(regions);

    await expect(listRegions()).resolves.toStrictEqual(regions);
    expect(mockDb.region.findMany).toHaveBeenCalledWith({ orderBy: byDisplayOrder, where: { retiredAt: null } });
  });

  it("offers only role tags that are not retired, in display order", async () => {
    const roleTags = [row({ id: 1, name: "Worship Leader", slug: "worship-leader", sortOrder: 10 })];
    mockDb.roleTag.findMany.mockResolvedValue(roleTags);

    await expect(listRoleTags()).resolves.toStrictEqual(roleTags);
    expect(mockDb.roleTag.findMany).toHaveBeenCalledWith({ orderBy: byDisplayOrder, where: { retiredAt: null } });
  });

  it("offers only style tags that are not retired, in display order", async () => {
    const styleTags = [row({ id: 1, name: "Contemporary", slug: "contemporary", sortOrder: 10 })];
    mockDb.styleTag.findMany.mockResolvedValue(styleTags);

    await expect(listStyleTags()).resolves.toStrictEqual(styleTags);
    expect(mockDb.styleTag.findMany).toHaveBeenCalledWith({ orderBy: byDisplayOrder, where: { retiredAt: null } });
  });
});

describe("resolving slugs already referenced", () => {
  it("resolves a retired region rather than dropping it", async () => {
    const retired = row({ id: 2, name: "East Texas", retiredAt: seededAt, slug: "east-texas", sortOrder: 20 });
    mockDb.region.findMany.mockResolvedValue([retired]);

    await expect(findRegionsBySlug(["east-texas"])).resolves.toStrictEqual([retired]);
    expect(mockDb.region.findMany).toHaveBeenCalledWith({
      orderBy: byDisplayOrder,
      where: { slug: { in: ["east-texas"] } },
    });
  });

  it("resolves a retired role tag rather than dropping it", async () => {
    const retired = row({ id: 2, name: "Bagpipes", retiredAt: seededAt, slug: "bagpipes", sortOrder: 20 });
    mockDb.roleTag.findMany.mockResolvedValue([retired]);

    await expect(findRoleTagsBySlug(["bagpipes"])).resolves.toStrictEqual([retired]);
    expect(mockDb.roleTag.findMany).toHaveBeenCalledWith({
      orderBy: byDisplayOrder,
      where: { slug: { in: ["bagpipes"] } },
    });
  });

  it("resolves a retired style tag rather than dropping it", async () => {
    const retired = row({ id: 2, name: "Chant", retiredAt: seededAt, slug: "chant", sortOrder: 20 });
    mockDb.styleTag.findMany.mockResolvedValue([retired]);

    await expect(findStyleTagsBySlug(["chant"])).resolves.toStrictEqual([retired]);
    expect(mockDb.styleTag.findMany).toHaveBeenCalledWith({
      orderBy: byDisplayOrder,
      where: { slug: { in: ["chant"] } },
    });
  });
});
