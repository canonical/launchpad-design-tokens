import type { Category } from "./utils/consts.js";
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
      modeName: "light",
      filesOptions: {
        rules: [
          {
            atRule: "@media (prefers-color-scheme: light)",
            matcher: () => true,
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
            matcher: () => true,
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
