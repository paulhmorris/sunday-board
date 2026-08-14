import * as v from "valibot";

export const instruments = ["drums", "guitar", "keys"] as const;
export const genres = ["hymns", "gospel", "modern"] as const;
export const languages = ["html", "css", "js"] as const;
export const operatingSystems = ["mac", "windows", "linux"] as const;

export const kitchenSinkSchema = v.object({
  name: v.pipe(v.string("Name is required"), v.trim(), v.minLength(1, "Name is required")),
  bio: v.optional(v.string(), ""),
  instrument: v.picklist(instruments, "Pick an instrument"),
  // Checkboxes and multi-selects submit nothing when empty, so both need a default
  genres: v.optional(v.array(v.picklist(genres)), []),
  languages: v.optional(v.array(v.picklist(languages)), []),
  subscribe: v.optional(v.boolean(), false),
  // A radio group submits nothing until one is picked, so the key can be absent entirely — accept
  // that and reject the empty case ourselves, rather than showing valibot's missing-key message.
  operatingSystem: v.pipe(
    v.optional(v.string(), ""),
    v.check((value) => (operatingSystems as readonly string[]).includes(value), "Pick an operating system"),
  ),
  avatar: v.optional(v.file("Avatar must be a file")),
  profile: v.object({
    city: v.pipe(v.string("City is required"), v.trim(), v.minLength(1, "City is required")),
    height: v.pipe(v.number("Height is required"), v.minValue(1, "Height must be greater than zero")),
  }),
  // The `check` issue belongs to the array itself rather than any one entry
  tags: v.pipe(
    v.array(v.pipe(v.string(), v.trim(), v.minLength(1, "Tags cannot be empty"))),
    v.check((tags) => new Set(tags).size === tags.length, "Tags must be unique"),
  ),
});
