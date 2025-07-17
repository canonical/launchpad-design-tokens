import type {
  Config,
  TransformedToken,
  TransformedTokens,
} from "style-dictionary";
import { StyleDictionary } from "style-dictionary-utils";
import { getReferences, usesReferences } from "style-dictionary/utils";

import {
  transformGroups,
  transformTypes,
  transforms,
} from "style-dictionary/enums";
import { isSemantic } from "./filters.js";

enum customTransforms {
  flattenPropertiesDimension = "flatten-properties-dimension",
}

// This is needed, until https://github.com/style-dictionary/style-dictionary/issues/1398 is resolved
StyleDictionary.registerTransform({
  name: customTransforms.flattenPropertiesDimension,
  transitive: false,
  type: transformTypes.value,
  filter: (token) =>
    token.$type === "dimension" && typeof token.$value === "object",
  transform: (token, platform) => {
    const { $value } = token;
    if (typeof $value !== "object" || $value === null) return $value;
    const { unit, value } = $value as { unit?: string; value?: number };
    if (typeof unit !== "string" || typeof value !== "number") return $value;

    return `${value}${unit}`;
  },
});

export const baseConfig = {
  include: ["src/tokens/primitives/**/*.json"],
  platforms: {
    css: {
      options: {
        outputReferences: (token, { dictionary: { tokens } }) =>
          areReferencedOnlySemantic(token, tokens),
      },
      basePxFontSize: 16,
      transformGroup: transformGroups.css,
      transforms: [customTransforms.flattenPropertiesDimension],
    },
    figma: {
      options: {
        stripMeta: {
          keep: ["$type", "$value"],
        },
      },
      basePxFontSize: 16,
      transforms: [
        customTransforms.flattenPropertiesDimension,
        "dimension/remToPixel", // From style-dictionary-utils. In contrary to the build-in it takes the unit into account and only transforms rems.
        transforms.nameKebab,
      ],
    },
  },
} satisfies Config;

export const logOptions = {
  verbosity: "verbose",
} satisfies ConstructorParameters<typeof StyleDictionary>[1];

function areReferencedOnlySemantic(
  token: TransformedToken,
  tokens: TransformedTokens,
) {
  try {
    const referenced = getReferences(token.original.$value, tokens);
    return referenced.every(isSemantic);
  } catch {
    // Getting references can fail if the referenced tokens are filtered out.
    // But if that's the case, they were primitive in the first place, and we don't want the references
    return false;
  }
}
