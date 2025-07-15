import {
  type ModeToCSSCompose,
  buildCSSComposedMode,
  buildSimpleModes,
  readModes,
} from "./utils/modes.js";

const category = "color";
const simpleModes = await readModes(category);

await buildSimpleModes(category, simpleModes);

{
  const modeName = "system";

  const cssModesToCompose = [
    {
      modeName: "light",
      options: {
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
      options: {
        rules: [
          {
            atRule: "@media (prefers-color-scheme: dark)",
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
