"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
const args = utils_1.getParams();
const search = args.search;
const flag = args["search-flag"];
const se = args["search-exclude"];
if (search === true || search === undefined || flag === true || se === true) {
    throw new TypeError();
}
const reg = new RegExp(search, flag);
console.log("search", reg);
const exclude = se === null || se === void 0 ? void 0 : se.split(",").filter(i => i).map(i => new RegExp(i));
utils_1.forEachDir("./", exclude, (path, basename) => {
    if (reg.test(basename))
        console.log("result ", path);
});
