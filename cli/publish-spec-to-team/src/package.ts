import { createRequire } from "module";

const require = createRequire(import.meta.url);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../package.json");

export default pkg;
