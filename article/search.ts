import {getParams, forEachDir} from "../src/utils";

const args = getParams()
const search = args.search;

const flag = args["search-flag"];
const se = args["search-exclude"];
if (search === true || search === undefined || flag === true || se === true) {
    throw new TypeError();
}
const reg = new RegExp(search, flag);
console.log("search", reg);
const exclude = se?.split(",").filter(i => i).map(i => new RegExp(i));
forEachDir("./", exclude, (path, basename) => {
    if (reg.test(basename)) console.log("result ", path);
});