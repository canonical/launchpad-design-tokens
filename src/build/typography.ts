import { type Category, mediaQueryMinWidths } from "./utils/consts.js";
import { isCommon } from "./utils/filters.js";
import {
  type ModeToCSSCompose,
  buildCSSComposedMode,
  buildSimpleModes,
  readModes,
} from "./utils/modes.js";

const category: Category = "typography";
const simpleModes = await readModes(category);

await buildSimpleModes(category, simpleModes);

{
  const modeName = "responsive";

  const configs: Array<Omit<ModeToCSSCompose, "path">> = [
    {
      modeName: "narrow",
    },
    {
      modeName: "medium",
      filesOptions: {
        rules: [
          {
            atRule: `@media (min-width: ${mediaQueryMinWidths.medium})`,
            matcher: (token) => !isCommon(token),
          },
        ],
      },
    },
    {
      modeName: "wide",
      filesOptions: {
        rules: [
          {
            atRule: `@media (min-width: ${mediaQueryMinWidths.large})`,
            matcher: (token) => !isCommon(token),
          },
        ],
      },
    },
    {
      modeName: "extraWide",
      filesOptions: {
        rules: [
          {
            atRule: `@media (min-width: ${mediaQueryMinWidths.xlarge})`,
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
