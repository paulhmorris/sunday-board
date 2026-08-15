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

interface Display {
  name: string;
  sortOrder: number;
}

interface LookupDelegate {
  upsert(args: { create: Display & { slug: string }; update: Display; where: { slug: string } }): Promise<unknown>;
}

/**
 * Upserts on `slug`, so re-running only reconciles wording and order. `retiredAt` is never in the
 * payload: a value the operator retired stays retired across every later seed run.
 *
 * `sortOrder` is gapped by 10 so an operator can slot a new value between two existing ones
 * without renumbering the rest.
 */
function seedLookup(delegate: LookupDelegate, names: string[]) {
  return Promise.all(
    names.map((name, index) => {
      const display = { name, sortOrder: (index + 1) * 10 };
      const slug = slugify(name);
      return delegate.upsert({ create: { ...display, slug }, update: display, where: { slug } });
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
