import { PrismaPg } from "@prisma/adapter-pg";
import { loadEnv } from "vite";

import { PrismaClient } from "./generated/client.js";

const REGIONS = ["North Texas"];

const ROLE_TAGS = [
  "Worship Leader",
  "Lead Vocals",
  "Backing Vocals",
  "Acoustic Guitar",
  "Electric Guitar",
  "Bass",
  "Drums",
  "Percussion",
  "Keys / Piano",
  "Organ",
  "Strings",
  "Horns / Brass",
  "Audio Engineer",
  "Media / Visuals",
  "Other",
];

const STYLE_TAGS = ["Contemporary", "Modern Worship", "Traditional", "Hymns", "Gospel", "Liturgical"];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface LookupDelegate {
  upsert(args: {
    create: { name: string; slug: string; sortOrder: number };
    update: Record<string, never>;
    where: { slug: string };
  }): Promise<unknown>;
}

/**
 * Creates a row only where its slug is absent. The database is authoritative once seeded — this is
 * the taxonomy the operator edits without a deploy — so a rewording, reorder, or retirement they
 * made survives every later run. `sortOrder` gaps by 10 to leave room to slot a value between two.
 */
function seedLookup(delegate: LookupDelegate, names: string[]) {
  return Promise.all(
    names.map((name, index) => {
      const slug = slugify(name);
      return delegate.upsert({
        create: { name, slug, sortOrder: (index + 1) * 10 },
        update: {},
        where: { slug },
      });
    }),
  );
}

const env = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: env["DATABASE_URL"] }) });

try {
  await Promise.all([
    seedLookup(db.region, REGIONS),
    seedLookup(db.roleTag, ROLE_TAGS),
    seedLookup(db.styleTag, STYLE_TAGS),
  ]);
  console.info(`Seeded ${REGIONS.length} regions, ${ROLE_TAGS.length} role tags, ${STYLE_TAGS.length} style tags.`);
} finally {
  await db.$disconnect();
}
