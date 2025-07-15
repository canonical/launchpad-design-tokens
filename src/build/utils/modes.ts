import { readdir, rm } from "node:fs/promises";
import { StyleDictionary } from "style-dictionary-utils";
import { baseConfig, logOptions } from "./baseConfig.js";
import { formats } from "style-dictionary/enums";
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
    matcher: () => boolean;
  }>;
};

export type ModeToCSSCompose = Mode & {
  options?: CSSAdvancedOptions;
};

export async function readModes(category: string): Promise<Mode[]> {
  const basePath = `src/tokens/semantic/${category}`;

  return (
    await readdir(basePath, {
      recursive: true,
    })
  )
    .filter((path) => path.endsWith(".json"))
    .map((path) => ({
      path: `${basePath}/${path}`,
      modeName: path.replace(/\.json$/, "").replace("/", "-"),
    }));
}

export async function buildSimpleModes(category: string, modes: Mode[]) {
  const dictionaries = await Promise.all(
    modes.map(({ path, modeName }) =>
      new StyleDictionary(baseConfig, logOptions).extend({
        source: [path],
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
                format: formats.json,
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
  const buildPath = `dist/css/${category}/${modeName}/`;
  const dictionaries = await Promise.all(
    modesToCompose.map(({ path, modeName, options }) =>
      new StyleDictionary(baseConfig, logOptions).extend({
        source: [path],
        platforms: {
          css: {
            buildPath,
            files: [
              {
                destination: `${modeName}.css`,
                format: "css/advanced",
                filter: isSemantic,
                options,
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

async function mergeDirectory(directory: string) {
  const files = (
    await readdir(directory, {
      withFileTypes: true,
      recursive: false,
    })
  ).filter((file) => file.isFile());

  if (files.length === 0) {
    console.warn(`No files found in directory: ${directory}`);
    return;
  }

  const extension = files[0].name.split(".").pop();
  if (files.some((file) => file.name.split(".").pop() !== extension)) {
    console.error(`Files in directory ${directory} have different extensions.`);
    return;
  }

  if (directory.endsWith("/")) {
    directory = directory.slice(0, -1);
  }

  const contents = (
    await Promise.all(
      files.map((file) => Bun.file(`${file.parentPath}/${file.name}`).text()),
    )
  ).join("\n\n");

  const outputPath = `${directory}.${extension}`;
  const outputFile = Bun.file(outputPath);

  await Bun.write(outputFile, contents);

  console.log(`Merged files into: ${outputPath}`);

  await rm(directory, { recursive: true });
}
