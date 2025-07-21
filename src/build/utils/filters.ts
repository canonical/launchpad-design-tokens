import type { TransformedToken } from "style-dictionary";
import { commonModesTokensName } from "./consts.js";

export function isPrimitive(token: TransformedToken) {
  return token.filePath.includes("primitive");
}

export function isSemantic(token: TransformedToken) {
  return token.filePath.includes("semantic");
}

export function isComponent(token: TransformedToken) {
  return token.filePath.includes("component");
}

export function isCommon(token: TransformedToken) {
  return token.filePath.endsWith(commonModesTokensName);
}
