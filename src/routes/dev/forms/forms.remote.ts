import { form } from "$app/server";

import { kitchenSinkSchema } from "./forms.schema";

/** Echoes the parsed data back, so the demo page can show how each control was coerced. */
export const submitKitchenSink = form(kitchenSinkSchema, (data) => {
  const { avatar, ...rest } = data;

  return {
    ...rest,
    avatar: avatar ? { name: avatar.name, size: avatar.size } : null,
  };
});
