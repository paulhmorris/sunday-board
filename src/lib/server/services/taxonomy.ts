import type { RegionWhereInput, RoleTagWhereInput, StyleTagWhereInput } from "$db/models";
import { db } from "$lib/server/db";

const byDisplayOrder = [{ sortOrder: "asc" as const }, { name: "asc" as const }];
const selectable = { retiredAt: null } satisfies RegionWhereInput | RoleTagWhereInput | StyleTagWhereInput;

export function listRegions() {
  return db.region.findMany({ orderBy: byDisplayOrder, where: selectable });
}

export function listRoleTags() {
  return db.roleTag.findMany({ orderBy: byDisplayOrder, where: selectable });
}

export function listStyleTags() {
  return db.styleTag.findMany({ orderBy: byDisplayOrder, where: selectable });
}

export function findRegionsBySlug(slugs: string[]) {
  return db.region.findMany({ orderBy: byDisplayOrder, where: { slug: { in: slugs } } });
}

export function findRoleTagsBySlug(slugs: string[]) {
  return db.roleTag.findMany({ orderBy: byDisplayOrder, where: { slug: { in: slugs } } });
}

export function findStyleTagsBySlug(slugs: string[]) {
  return db.styleTag.findMany({ orderBy: byDisplayOrder, where: { slug: { in: slugs } } });
}
