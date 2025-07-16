import type { TransformedToken } from "style-dictionary";
import { commonModesComponentName } from "./consts.js";

export function isSemantic(token: TransformedToken) {
  return token.filePath.includes("semantic");
}

export function isCommon(token: TransformedToken) {
  return token.filePath.endsWith(commonModesComponentName);
}
