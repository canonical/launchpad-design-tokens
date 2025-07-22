import { readdir, rm } from "node:fs/promises";
import type { PlatformConfig, TransformedToken } from "style-dictionary";
import { StyleDictionary } from "style-dictionary-utils";
import { formats } from "style-dictionary/enums";
import { baseConfig, customFormats, logOptions } from "./baseConfig.js";
import { commonModesComponentName } from "./consts.js";
import { isSemantic } from "./filters.js";

type Mode = {
  path: string;
  modeName: string;
};

/**
 * On how to use, see {@link https://github.com/lukasoppermann/style-dictionary-utils?tab=readme-ov-file#cssadvanced|style-dictionary-utils#cssadvanced}.
 */
type CSSAdvancedOptions = {
  selector?: string;
  rules?: Array<{
    atRule?: string;
    selector?: string;
    matcher: (token: TransformedToken) => boolean;
  }>;
};

export type ModeToCSSCompose = Mode & {
  platformOptions?: PlatformConfig["options"];
  filesOptions?: CSSAdvancedOptions;
  order?: number;
};

export async function readModes(category: string): Promise<Mode[]> {
  const basePath = getBaseCategoryPath(category);

  return (
    await readdir(basePath, {
      recursive: true,
    })
  )
    .filter(
      (path) =>
        path.endsWith(".json") && !path.endsWith(commonModesComponentName),
    )
    .map((path) => ({
      path: `${basePath}/${path}`,
      modeName: path.replace(/\.json$/, "").replace("/", "-"),
    }));
}

export async function buildSimpleModes(category: string, modes: Mode[]) {
  const commonModesComponentPath = `${getBaseCategoryPath(category)}/${commonModesComponentName}`;

  const dictionaries = await Promise.all(
    modes.map(({ path, modeName }) =>
      new StyleDictionary(baseConfig, logOptions).extend({
        source: [commonModesComponentPath, path],
        platforms: {
          css: {
            buildPath: `dist/css/${category}/`,
            files: [
              {
                destination: `${modeName}.css`,
                format: formats.cssVariables,
                filter: isSemantic,
              },
            ],
          },
          figma: {
            buildPath: `dist/figma/${category}/`,
            files: [
              {
                destination: `${modeName}.json`,
                format: customFormats.figma,
                filter: isSemantic,
              },
            ],
          },
        },
      }),
    ),
  );

  await Promise.all(
    dictionaries.map((dictionary) => dictionary.buildAllPlatforms()),
  );

  await writeFigmaManifest(category, modes);
}

export async function buildCSSComposedMode(
  category: string,
  modeName: string,
  modesToCompose: ModeToCSSCompose[],
) {
  const commonModesComponentPath = `${getBaseCategoryPath(category)}/${commonModesComponentName}`;
  const buildPath = `dist/css/${category}/${modeName}/`;
  const dictionaries = await Promise.all(
    modesToCompose.map(({ path, modeName, filesOptions, platformOptions }) =>
      new StyleDictionary(baseConfig, logOptions).extend({
        source: [commonModesComponentPath, path],
        platforms: {
          css: {
            options: {
              ...baseConfig.platforms.css.options,
              ...platformOptions,
            },
            buildPath,
            files: [
              {
                destination: `${modeName}.css`,
                format: "css/advanced",
                filter: isSemantic,
                options: filesOptions,
              },
            ],
          },
        },
      }),
    ),
  );

  await Promise.all(
    dictionaries.map((dictionary) => dictionary.buildPlatform("css")),
  );

  const modeNamesInOrder = modesToCompose.some(
    (mode) => mode.order !== undefined,
  )
    ? [...modesToCompose]
        .sort((a, b) => {
          if (a.order === undefined && b.order === undefined) return 0;
          if (a.order === undefined) return 1;
          if (b.order === undefined) return -1;
          return a.order - b.order;
        })
        .map((mode) => mode.modeName)
    : null;

  await mergeDirectory(buildPath, modeNamesInOrder);
}

async function writeFigmaManifest(collection: string, modes: Mode[]) {
  await Bun.write(
    `dist/figma/${collection}/manifest.json`,
    JSON.stringify(
      {
        name: `Launchpad ${collection} tokens`,
        collections: {
          [collection]: {
            modes: modes.reduce<Record<string, [string]>>(
              (acc, { modeName }) => {
                acc[modeName] = [`${modeName}.json`];
                return acc;
              },
              {},
            ),
          },
        },
      },
      null,
      2,
    ),
  );
}

async function mergeDirectory(
  directory: string,
  modeNamesInOrder: string[] | null,
) {
  const files = (
    await readdir(directory, {
      withFileTypes: true,
      recursive: false,
    })
  ).filter((file) => file.isFile());

  if (modeNamesInOrder) {
    files.sort((a, b) => {
      const aName = a.name.replace(/\.css$/, "");
      const bName = b.name.replace(/\.css$/, "");
      return modeNamesInOrder.indexOf(aName) - modeNamesInOrder.indexOf(bName);
    });
  }

  if (files.length === 0) {
    console.warn(`No files found in directory: ${directory}`);
    return;
  }

  const extension = files[0].name.split(".").pop();
  if (files.some((file) => file.name.split(".").pop() !== extension)) {
    console.error(`Files in directory ${directory} have different extensions.`);
    return;
  }

  const normalizedDirectory = directory.endsWith("/")
    ? directory.slice(0, -1)
    : directory;

  const contents = (
    await Promise.all(
      files.map((file) => Bun.file(`${file.parentPath}/${file.name}`).text()),
    )
  ).join("\n\n");

  const outputPath = `${normalizedDirectory}.${extension}`;
  const outputFile = Bun.file(outputPath);

  await Bun.write(outputFile, contents);

  console.log(`Merged files into: ${outputPath}`);

  await rm(directory, { recursive: true });
}

function getBaseCategoryPath(category: string): string {
  return `src/tokens/semantic/${category}`;
}
