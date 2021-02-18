import {getParams} from "../src/utils";
const Path = require("path")

enum OpenTypes {
    select = "select",
    cmd = "cmd",
    run = "run",
}

type ExecParams = [string, string[]];

const args = getParams();

const open = args.open;
const path = Path.resolve(process.cwd(), open === true ? "./" : open);
const stat = require("fs").statSync(path);
const isDir = stat.isDirectory();
const ot = args["open-type"];

const type: string = !ot || ot === true ? OpenTypes.select : ot;
const spawnSync = require('child_process').spawnSync;
const match: { [k in OpenTypes]: ExecParams } = {
    // 运行一次就会打开一个资源管理器，不能只打开一个相同的
    [OpenTypes.select]: ["explorer", [`/select,"${path}"`]],
    [OpenTypes.run]: ['start', [path]],
    [OpenTypes.cmd]: ["start", ["cmd", "/k", `"cd ${isDir ? path : Path.dirname(path)}"`]],
};
const exec = ([command, path]: ExecParams) => spawnSync(command, path, {shell: true});
console.log(path);
exec(match[type as OpenTypes] || match[OpenTypes.select]);