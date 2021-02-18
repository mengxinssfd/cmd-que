"use strict";
exports.__esModule = true;
var utils_1 = require("../src/utils");
var args = utils_1.getParams();
var search = args.search;
var flag = args["search-flag"];
var se = args["search-exclude"];
if (search === true || search === undefined || flag === true || se === true) {
    throw new TypeError();
}
var reg = new RegExp(search, flag);
console.log("search", reg);
var exclude = se === null || se === void 0 ? void 0 : se.split(",").filter(function (i) { return i; }).map(function (i) { return new RegExp(i); });
utils_1.forEachDir("./", exclude, function (path, basename) {
    if (reg.test(basename))
        console.log("result ", path);
});
