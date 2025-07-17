import { TransformedToken } from "style-dictionary";
import { mediaQueryMinWidths } from "./utils/consts.js";
import { isCommon } from "./utils/filters.js";
import {
  type ModeToCSSCompose,
  buildCSSComposedMode,
  buildSimpleModes,
  readModes,
} from "./utils/modes.js";

const category = "typography";
const simpleModes = await readModes(category);

await buildSimpleModes(category, simpleModes);

{
  const modeName = "responsive";

  const configs: Array<Omit<ModeToCSSCompose, "path">> = [
    {
      modeName: "narrow",
      order: 1,
    },
    {
      modeName: "medium",
      order: 2,
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
      order: 3,
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
      order: 4,
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
