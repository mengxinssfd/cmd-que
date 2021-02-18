"use strict";
var _a;
exports.__esModule = true;
var utils_1 = require("../src/utils");
var Path = require("path");
var OpenTypes;
(function (OpenTypes) {
    OpenTypes["select"] = "select";
    OpenTypes["cmd"] = "cmd";
    OpenTypes["run"] = "run";
})(OpenTypes || (OpenTypes = {}));
var args = utils_1.getParams();
var open = args.open;
var path = Path.resolve(process.cwd(), open === true ? "./" : open);
var stat = require("fs").statSync(path);
var isDir = stat.isDirectory();
var ot = args["open-type"];
var type = !ot || ot === true ? OpenTypes.select : ot;
var spawnSync = require('child_process').spawnSync;
var match = (_a = {},
    // 运行一次就会打开一个资源管理器，不能只打开一个相同的
    _a[OpenTypes.select] = ["explorer", ["/select,\"" + path + "\""]],
    _a[OpenTypes.run] = ['start', [path]],
    _a[OpenTypes.cmd] = ["start", ["cmd", "/k", "\"cd " + (isDir ? path : Path.dirname(path)) + "\""]],
    _a);
var exec = function (_a) {
    var command = _a[0], path = _a[1];
    return spawnSync(command, path, { shell: true });
};
console.log(path);
exec(match[type] || match[OpenTypes.select]);
