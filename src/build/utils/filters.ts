import { TransformedToken } from "style-dictionary";

export function isSemantic(token: TransformedToken) {
  return token.filePath.includes("semantic");
}
