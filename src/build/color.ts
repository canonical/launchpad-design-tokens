import type { Category } from "./utils/consts.js";
import { isComponent } from "./utils/filters.js";
import {
  type ModeToCSSCompose,
  buildCSSComposedMode,
  buildSimpleModes,
  readModes,
} from "./utils/modes.js";

const category: Category = "color";
const simpleModes = await readModes(category);

await buildSimpleModes(category, simpleModes);

{
  const modeName = "system";

  const configs: Array<Omit<ModeToCSSCompose, "path">> = [
    {
      // Not an actual mode, but a way to keep the component tokens defined once, outside the media queries.
      // `modeName` is of an actual mode, to allow StyleDictionary to resolve and verify references to semantic tokens.
      // If it was something else, StyleDictionary would complain (and rightfully so) that referenced tokens don't exist.
      modeName: "light",
      filesOptions: {
        rules: [
          {
            matcher: (token) => isComponent(token),
          },
        ],
      },
    },
    {
      modeName: "light",
      filesOptions: {
        rules: [
          {
            atRule: "@media (prefers-color-scheme: light)",
            matcher: (token) => !isComponent(token),
          },
        ],
      },
    },
    {
      modeName: "dark",
      filesOptions: {
        rules: [
          {
            atRule: "@media (prefers-color-scheme: dark)",
            matcher: (token) => !isComponent(token),
          },
        ],
      },
    },
  ];

  const cssModesToCompose = configs.map((mode) => {
    const path = simpleModes.find((m) => m.modeName === mode.modeName)?.path;
    if (!path)
      throw new Error(`Mode ${mode.modeName} not found in ${category}`);
    return {
      ...mode,
      path,
    };
  }) satisfies ModeToCSSCompose[];

  await buildCSSComposedMode(category, modeName, cssModesToCompose);
}
