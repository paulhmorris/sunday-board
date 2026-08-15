import { db } from "$lib/server/db";

/** `sortOrder` is operator-curated; `name` only settles ties between rows seeded at the same rank. */
const byDisplayOrder = [{ sortOrder: "asc" as const }, { name: "asc" as const }];

/** Retirement takes a value out of the pickers; the `findBySlug` reads below still resolve it. */
const selectable = { retiredAt: null };

export function listRegions() {
  return db.region.findMany({ orderBy: byDisplayOrder, where: selectable });
}

export function listRoleTags() {
  return db.roleTag.findMany({ orderBy: byDisplayOrder, where: selectable });
}

export function listStyleTags() {
  return db.styleTag.findMany({ orderBy: byDisplayOrder, where: selectable });
}

/** Resolves slugs a profile already holds — retired rows included, so nobody loses a choice. */
export function findRegionsBySlug(slugs: string[]) {
  return db.region.findMany({ orderBy: byDisplayOrder, where: { slug: { in: slugs } } });
}

/** @see {@link findRegionsBySlug} */
export function findRoleTagsBySlug(slugs: string[]) {
  return db.roleTag.findMany({ orderBy: byDisplayOrder, where: { slug: { in: slugs } } });
}

/** @see {@link findRegionsBySlug} */
export function findStyleTagsBySlug(slugs: string[]) {
  return db.styleTag.findMany({ orderBy: byDisplayOrder, where: { slug: { in: slugs } } });
}
