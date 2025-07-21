import type {
  Config,
  Dictionary,
  PreprocessedTokens,
  TransformedToken,
} from "style-dictionary";
import { StyleDictionary } from "style-dictionary-utils";
import { getReferences } from "style-dictionary/utils";

import {
  transformGroups,
  transformTypes,
  transforms,
} from "style-dictionary/enums";
import { isSemantic } from "./filters.js";

enum customTransforms {
  flattenPropertiesDimension = "flatten-properties-dimension",
}

export enum customFormats {
  figma = "figma",
}

/**
 * This is needed, because {@link https://styledictionary.com/reference/hooks/formats/predefined/#json|build in JSON format} does not support controlling whether references are output or not
 */
StyleDictionary.registerFormat({
  name: customFormats.figma,
  format: ({ dictionary, options: { outputReferences } }) => {
    function recurse(
      currentObject: PreprocessedTokens,
      targetObject: PreprocessedTokens,
    ) {
      for (const key in currentObject) {
        const value = currentObject[key];

        if (isToken(value)) {
          let { $value, $type, $description, original } = value;

          if (
            outputReferences &&
            (typeof outputReferences !== "function" ||
              outputReferences(value, { dictionary }))
          ) {
            $value = original.$value;
          }

          targetObject[key] = { $value, $type, $description };
        } else {
          if (!targetObject[key]) {
            targetObject[key] = {};
          }
          recurse(value, targetObject[key]);
        }
      }
    }

    const output: PreprocessedTokens = {};
    recurse(dictionary.tokens, output);

    return `${JSON.stringify(output, null, 2)}\n`;
  },
});

/**
 * This is needed, until {@link https://github.com/style-dictionary/style-dictionary/issues/1398} is resolved
 */
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
        outputReferences: areReferencedOnlySemantic,
      },
      basePxFontSize: 16,
      transformGroup: transformGroups.css,
      transforms: [customTransforms.flattenPropertiesDimension],
    },
    figma: {
      options: {
        outputReferences: areReferencedOnlySemantic,
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
  options: {
    dictionary: Dictionary;
  },
): boolean {
  const {
    dictionary: { unfilteredTokens, tokens },
  } = options;

  const referenced = getReferences(
    token.original.$value,
    unfilteredTokens ?? tokens,
  );

  return referenced.length > 0 && referenced.every(isSemantic);
}

function isToken(object: PreprocessedTokens): object is TransformedToken {
  return (
    typeof object === "object" &&
    object !== null &&
    Object.hasOwn(object, "$type") &&
    typeof object.$type === "string"
  );
}
