import { readdir, rm } from "node:fs/promises";
import type { PlatformConfig, TransformedToken } from "style-dictionary";
import { StyleDictionary } from "style-dictionary-utils";
import { formats } from "style-dictionary/enums";
import { baseConfig, customFormats, logOptions } from "./baseConfig.js";
import { type Category, commonModesTokensName } from "./consts.js";
import { isPrimitive } from "./filters.js";
import { getBaseCategoryPath, getBuildPath } from "./path.js";

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
};

export async function readModes(category: Category): Promise<Mode[]> {
  const basePath = getBaseCategoryPath(category);

  return (
    await readdir(basePath, {
      recursive: true,
    })
  )
    .filter(
      (path) => path.endsWith(".json") && !path.endsWith(commonModesTokensName),
    )
    .map((path) => ({
      path: `${basePath}/${path}`,
      modeName: path.replace(/\.json$/, "").replace("/", "-"),
    }));
}

export async function buildSimpleModes(category: Category, modes: Mode[]) {
  const commonModesComponentPath = `${getBaseCategoryPath(category)}/${commonModesTokensName}`;
  const componentTokensPath = `${getBaseCategoryPath(category, "component")}.json`;

  const dictionaries = await Promise.all(
    modes.map(({ path, modeName }) =>
      new StyleDictionary(baseConfig, logOptions).extend({
        source: [commonModesComponentPath, path, componentTokensPath],
        platforms: {
          css: {
            buildPath: getBuildPath("css", category),
            files: [
              {
                destination: `${modeName}.css`,
                format: formats.cssVariables,
                filter: (token) => !isPrimitive(token),
              },
            ],
          },
          figma: {
            buildPath: getBuildPath("figma", category),
            files: [
              {
                destination: `${modeName}.json`,
                format: customFormats.figma,
                filter: (token) => !isPrimitive(token),
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
  category: Category,
  modeName: string,
  modesToCompose: ModeToCSSCompose[],
) {
  const commonModesTokensPath = `${getBaseCategoryPath(category)}/${commonModesTokensName}`;
  const componentTokensPath = `${getBaseCategoryPath(category, "component")}.json`;
  const buildPath = `${getBuildPath("css", category)}/${modeName}/`;

  const dictionaries = await Promise.all(
    modesToCompose.map(({ path, filesOptions, platformOptions }, i) =>
      new StyleDictionary(baseConfig, logOptions).extend({
        source: [commonModesTokensPath, path, componentTokensPath],
        platforms: {
          css: {
            options: {
              ...baseConfig.platforms.css.options,
              ...platformOptions,
            },
            buildPath,
            files: [
              {
                destination: `${i}.css`,
                format: "css/advanced",
                filter: (token) => !isPrimitive(token),
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

  await mergeDirectory(buildPath);
}

async function writeFigmaManifest(category: Category, modes: Mode[]) {
  await Bun.write(
    `${getBuildPath("figma", category)}/manifest.json`,
    JSON.stringify(
      {
        name: `Launchpad ${category} tokens`,
        collections: {
          [category]: {
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

async function mergeDirectory(directory: string) {
  const files = (
    await readdir(directory, {
      withFileTypes: true,
      recursive: false,
    })
  ).filter((file) => file.isFile());

  files.sort((a, b) => {
    const aNum = Number.parseInt(a.name.replace(/\.css$/, ""));
    const bNum = Number.parseInt(b.name.replace(/\.css$/, ""));
    if (Number.isNaN(aNum) || Number.isNaN(bNum))
      return a.name.localeCompare(b.name);
    return aNum - bNum;
  });

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
