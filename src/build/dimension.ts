import { mediaQueryMinWidths } from "./utils/consts.js";
import {
  type ModeToCSSCompose,
  buildCSSComposedMode,
  buildSimpleModes,
  readModes,
} from "./utils/modes.js";

const category = "dimension";
const simpleModes = await readModes(category);

await buildSimpleModes(category, simpleModes);

{
  const modeName = "responsive";

  const cssModesToCompose = [
    {
      modeName: "narrow",
      order: 1,
    },
    {
      modeName: "medium",
      order: 2,
      options: {
        rules: [
          {
            atRule: `@media (min-width: ${mediaQueryMinWidths.medium})`,
            matcher: () => true,
          },
        ],
      },
    },
    {
      modeName: "wide",
      order: 3,
      options: {
        rules: [
          {
            atRule: `@media (min-width: ${mediaQueryMinWidths.large})`,
            matcher: () => true,
          },
        ],
      },
    },
    {
      modeName: "extraWide",
      order: 4,
      options: {
        rules: [
          {
            atRule: `@media (min-width: ${mediaQueryMinWidths.xlarge})`,
            matcher: () => true,
          },
        ],
      },
    },
  ].map((mode) => {
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
