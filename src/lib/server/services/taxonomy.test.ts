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

describe("selection lists", () => {
  it("offers only regions that are not retired, in display order", async () => {
    const regions = [{ id: 1, name: "North Texas", retiredAt: null, slug: "north-texas", sortOrder: 10 }];
    mockDb.region.findMany.mockResolvedValue(regions);

    await expect(listRegions()).resolves.toStrictEqual(regions);
    expect(mockDb.region.findMany).toHaveBeenCalledWith({ orderBy: byDisplayOrder, where: { retiredAt: null } });
  });

  it("offers only role tags that are not retired, in display order", async () => {
    const roleTags = [{ id: 1, name: "Worship Leader", retiredAt: null, slug: "worship-leader", sortOrder: 10 }];
    mockDb.roleTag.findMany.mockResolvedValue(roleTags);

    await expect(listRoleTags()).resolves.toStrictEqual(roleTags);
    expect(mockDb.roleTag.findMany).toHaveBeenCalledWith({ orderBy: byDisplayOrder, where: { retiredAt: null } });
  });

  it("offers only style tags that are not retired, in display order", async () => {
    const styleTags = [{ id: 1, name: "Contemporary", retiredAt: null, slug: "contemporary", sortOrder: 10 }];
    mockDb.styleTag.findMany.mockResolvedValue(styleTags);

    await expect(listStyleTags()).resolves.toStrictEqual(styleTags);
    expect(mockDb.styleTag.findMany).toHaveBeenCalledWith({ orderBy: byDisplayOrder, where: { retiredAt: null } });
  });
});

describe("resolving slugs already referenced", () => {
  it("resolves a retired region rather than dropping it", async () => {
    const retired = { id: 2, name: "East Texas", retiredAt: new Date(), slug: "east-texas", sortOrder: 20 };
    mockDb.region.findMany.mockResolvedValue([retired]);

    await expect(findRegionsBySlug(["east-texas"])).resolves.toStrictEqual([retired]);
    expect(mockDb.region.findMany).toHaveBeenCalledWith({
      orderBy: byDisplayOrder,
      where: { slug: { in: ["east-texas"] } },
    });
  });

  it("resolves a retired role tag rather than dropping it", async () => {
    const retired = { id: 2, name: "Bagpipes", retiredAt: new Date(), slug: "bagpipes", sortOrder: 20 };
    mockDb.roleTag.findMany.mockResolvedValue([retired]);

    await expect(findRoleTagsBySlug(["bagpipes"])).resolves.toStrictEqual([retired]);
    expect(mockDb.roleTag.findMany).toHaveBeenCalledWith({
      orderBy: byDisplayOrder,
      where: { slug: { in: ["bagpipes"] } },
    });
  });

  it("resolves a retired style tag rather than dropping it", async () => {
    const retired = { id: 2, name: "Chant", retiredAt: new Date(), slug: "chant", sortOrder: 20 };
    mockDb.styleTag.findMany.mockResolvedValue([retired]);

    await expect(findStyleTagsBySlug(["chant"])).resolves.toStrictEqual([retired]);
    expect(mockDb.styleTag.findMany).toHaveBeenCalledWith({
      orderBy: byDisplayOrder,
      where: { slug: { in: ["chant"] } },
    });
  });
});
