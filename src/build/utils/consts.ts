/**
 * Reference: {@link https://www.figma.com/design/aQ5c7JIEIOYyOkvgi3CzlW/Merge-Proposal-page?node-id=1393-392253&m=dev|Figma}
 */
export enum mediaQueryMinWidths {
  medium = "621px",
  large = "1037px",
  xlarge = "1681px",
}

export const commonModesTokensName = "+common.json";

export const baseTokensPath = "src/tokens";
export const baseBuildPath = "dist";
export const categories = [
  "color",
  "typography",
  "dimension",
  "opacity",
  "transition",
] as const;
export const tokenTypes = ["primitives", "semantic"] as const;
export const platforms = ["css", "figma"] as const;

export type Category = (typeof categories)[number];
export type TokenType = (typeof tokenTypes)[number];
export type Platform = (typeof platforms)[number];
