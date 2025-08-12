import type { Category } from "./utils/consts.js";
import { isCommon } from "./utils/filters.js";
import {
  type ModeToCSSCompose,
  buildCSSComposedMode,
  buildSimpleModes,
  readModes,
} from "./utils/modes.js";

const category: Category = "transition";
const simpleModes = await readModes(category);

await buildSimpleModes(category, simpleModes);

{
  const modeName = "preferred";

  const configs: Array<Omit<ModeToCSSCompose, "path">> = [
    {
      // For all the common tokens
      modeName: "normal",
      filesOptions: {
        rules: [
          {
            matcher: (token) => isCommon(token),
          },
        ],
      },
    },
    {
      modeName: "normal",
      filesOptions: {
        rules: [
          {
            atRule: "@media (prefers-reduced-motion: no-preference)",
            matcher: (token) => !isCommon(token),
          },
        ],
      },
    },
    {
      modeName: "reduced-motion",
      filesOptions: {
        rules: [
          {
            atRule: "@media (prefers-reduced-motion: reduce)",
            matcher: (token) => !isCommon(token),
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
