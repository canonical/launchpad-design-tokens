import {
  type Category,
  type Platform,
  type TokenType,
  baseBuildPath,
  baseTokensPath,
} from "./consts.js";

export function getBaseCategoryPath(
  category: Category,
  tokensType: TokenType = "semantic",
): string {
  return `${baseTokensPath}/${tokensType}/${category}`;
}

export function getBuildPath(platform: Platform, category: Category): string {
  return `${baseBuildPath}/${platform}/${category}`;
}
