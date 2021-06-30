"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
const Path = require("path");
var OpenTypes;
(function (OpenTypes) {
    OpenTypes["select"] = "select";
    OpenTypes["cmd"] = "cmd";
    OpenTypes["run"] = "run";
})(OpenTypes || (OpenTypes = {}));
const args = utils_1.getParams();
const open = args.open;
const path = Path.resolve(process.cwd(), open === true ? "./" : open);
const stat = require("fs").statSync(path);
const isDir = stat.isDirectory();
const ot = args["open-type"];
const type = !ot || ot === true ? OpenTypes.select : ot;
const spawnSync = require('child_process').spawnSync;
const match = {
    // 运行一次就会打开一个资源管理器，不能只打开一个相同的
    [OpenTypes.select]: ["explorer", [`/select,"${path}"`]],
    [OpenTypes.run]: ['start', [path]],
    [OpenTypes.cmd]: ["start", ["cmd", "/k", `"cd ${isDir ? path : Path.dirname(path)}"`]],
};
const exec = ([command, path]) => spawnSync(command, path, { shell: true });
console.log(path);
exec(match[type] || match[OpenTypes.select]);
