"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const getParams = require("./utils").getParams;
// tsc src/file.ts --target es2017 --module commonjs
const utils_1 = require("./utils");
const FS = require("fs");
const Path = require("path");
// 指令全写对应的缩写
var Abb;
(function (Abb) {
    Abb["find"] = "f";
    Abb["delete"] = "d";
    Abb["move"] = "m";
    Abb["copy"] = "c";
    Abb["help"] = "h";
    Abb["open"] = "o";
    Abb["open-type"] = "ot";
    Abb["find-flag"] = "ff";
    Abb["find-exclude"] = "fe";
})(Abb || (Abb = {}));
const paramsAbb = utils_1.createEnumByObj(Abb);
class FileCli {
    constructor() {
        const params = this.params = utils_1.getParams();
        this.paramsObj = utils_1.createObj(Array.from(params.entries()));
        const fnObj = {
            move: () => this.move(),
            copy: () => this.copy(),
            find: () => this.find(),
            delete: () => this.delete(),
            open: () => this.open(),
        };
        for (let k in fnObj) {
            const alias = paramsAbb[k];
            fnObj[alias] = fnObj[k];
        }
        if (params.size) {
            params.forEach((value, key) => {
                const fn = fnObj[key];
                fn && fn();
            });
        }
        else {
            FileCli.showHelp();
        }
    }
    // 好处：普通的命令不能打开./
    open() {
        let OpenTypes;
        (function (OpenTypes) {
            OpenTypes["select"] = "select";
            OpenTypes["cmd"] = "cmd";
            OpenTypes["run"] = "run";
        })(OpenTypes || (OpenTypes = {}));
        const open = this.getParamsValue(Abb.open);
        const path = Path.resolve(process.cwd(), open === true ? "./" : open);
        const stat = FS.statSync(path);
        const isDir = stat.isDirectory();
        const ot = this.getParamsValue(Abb["open-type"]);
        const type = !ot || ot === true ? OpenTypes.select : ot;
        const spawnSync = require("child_process").spawnSync;
        const match = {
            // 运行一次就会打开一个资源管理器，不能只打开一个相同的
            [OpenTypes.select]: ["explorer", [`/select,"${path}"`]],
            [OpenTypes.run]: ["start", [path]],
            [OpenTypes.cmd]: ["start", ["cmd", "/k", `"cd ${isDir ? path : Path.dirname(path)}"`]],
        };
        const exec = ([command, path]) => spawnSync(command, path, { shell: true });
        console.log(path);
        exec(match[type] || match[OpenTypes.select]);
    }
    static showHelp() {
        // TODO 缺少*号删除
        console.log(`
            -help/-h                帮助
            -find/-f=               正则搜索文件或文件夹 输入会转为正则
            -find-flag/-sf=         搜索文件或文件夹 /\\w+/flag
            -find-exclude/-se=      搜索文件或文件夹 忽略文件夹 多个用逗号(,)隔开
            -open/-o=               打开资源管理器并选中文件或文件夹
            -open-type/-ot=         打开资源管理器并选中文件或文件夹
            -delete/-d              删除文件或文件夹
            -copy/-c                复制文件或文件夹
        `);
    }
    getParams(key) {
        const value = this.getParamsValue(key);
        if (value === true)
            throw new TypeError();
        const arr = value.split(",");
        return utils_1.chunk(arr, 2);
    }
    move() {
        const list = this.getParams("move");
        list.forEach((arr) => {
            FS.renameSync(arr[0], arr[1]);
        });
    }
    copy() {
        const list = this.getParams("copy");
        list.forEach((arr) => {
            const [f, t] = arr;
            const from = Path.resolve(process.cwd(), f);
            const to = Path.resolve(process.cwd(), t);
            if (!FS.existsSync(from)) {
                console.error(from + " not exists");
                return;
            }
            utils_1.forEachDirBfs(from, [], (path, basename, isDir) => {
                const diff = path.replace(from, "").substring(1);
                const p = Path.resolve(to, diff);
                if (isDir) {
                    if (!FS.existsSync(p)) {
                        FS.mkdirSync(p);
                    }
                }
                else {
                    FS.copyFileSync(path, p);
                }
            }, Boolean(this.paramsObj.log));
        });
    }
    getParamsValue(key) {
        const pAbb = paramsAbb;
        const params = this.paramsObj;
        return params[key] || params[pAbb[key]];
    }
    foreach(path, exclude = [], cb) {
        return utils_1.forEachDir(path, exclude, (path, basename, isDir) => {
            return cb(path, basename, isDir);
        }, Boolean(this.paramsObj.log)); // 有可能会输入-log=*
    }
    find() {
        const search = this.getParamsValue(Abb.find);
        const flag = this.getParamsValue(Abb["find-flag"]);
        const se = this.getParamsValue(Abb["find-exclude"]);
        if (search === true || search === undefined || flag === true || se === true) {
            throw new TypeError();
        }
        const reg = new RegExp(search, flag);
        console.log("search", reg);
        const exclude = se === null || se === void 0 ? void 0 : se.split(",").filter(i => i).map(i => new RegExp(i));
        return this.foreach("./", exclude, (path, basename) => {
            if (reg.test(basename))
                console.log("result ", path);
        });
    }
    delete() {
        const del = this.params.get("delete");
        if (del === true)
            throw new TypeError();
        const list = del.split(",");
        list.forEach((p) => {
            const stat = FS.statSync(p);
            if (stat.isDirectory()) {
                FS.rmdirSync(p, { recursive: true });
            }
            else {
                FS.rmSync(p);
            }
        });
    }
}
new FileCli();
