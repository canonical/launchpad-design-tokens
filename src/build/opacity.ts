import type { Category } from "./utils/consts.js";
import { buildSimpleModes, readModes } from "./utils/modes.js";

const category: Category = "opacity";
const simpleModes = await readModes(category);

await buildSimpleModes(category, simpleModes);
