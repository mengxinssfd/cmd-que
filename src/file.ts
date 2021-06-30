// const getParams = require("./utils").getParams;
// tsc src/file.ts --target es2017 --module commonjs
import {chunk, createEnumByObj, createObj} from "@mxssfd/ts-utils/";
import {getParams, forEachDir, forEachDirBfs} from "./utils";

const FS = require("fs");
const Path = require("path");

// 指令全写对应的缩写
enum Abb {
    find = "f",
    delete = "d",
    move = "m",
    copy = "c",
    help = "h",
    open = "o",
    "open-type" = "ot",
    "find-flag" = "ff",
    "find-exclude" = "fe",
}

const paramsAbb = createEnumByObj(Abb);

class FileCli {
    params: Map<string, string | boolean>;
    paramsObj: { [k: string]: string | true };

    constructor() {
        const params = this.params = getParams();
        this.paramsObj = createObj(Array.from(params.entries()));
        const fnObj: any = {
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
        } else {
            FileCli.showHelp();
        }

    }

    // 好处：普通的命令不能打开./
    private open() {
        enum OpenTypes {
            select = "select",
            cmd = "cmd",
            run = "run",
        }

        type ExecParams = [string, string[]];

        const open = this.getParamsValue(Abb.open)!;
        const path = Path.resolve(process.cwd(), open === true ? "./" : open);
        const stat = FS.statSync(path);
        const isDir = stat.isDirectory();
        const ot = this.getParamsValue(Abb["open-type"]);

        const type: string = !ot || ot === true ? OpenTypes.select : ot;
        const spawnSync = require("child_process").spawnSync;
        const match: { [k in OpenTypes]: ExecParams } = {
            // 运行一次就会打开一个资源管理器，不能只打开一个相同的
            [OpenTypes.select]: ["explorer", [`/select,"${path}"`]],
            [OpenTypes.run]: ["start", [path]],
            [OpenTypes.cmd]: ["start", ["cmd", "/k", `"cd ${isDir ? path : Path.dirname(path)}"`]],
        };
        const exec = ([command, path]: ExecParams) => spawnSync(command, path, {shell: true});
        console.log(path);
        exec(match[type as OpenTypes] || match[OpenTypes.select]);
    }

    private static showHelp() {
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

    getParams(key: "move" | "copy"): [from: string, to: string][] {
        const value = this.getParamsValue(key as Abb);
        if (value === true) throw new TypeError();
        const arr = (value as string).split(",");
        return chunk(arr, 2);
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
            forEachDirBfs(from, [], (path, basename, isDir) => {
                const diff = path.replace(from, "").substring(1);
                const p = Path.resolve(to, diff);
                if (isDir) {
                    if (!FS.existsSync(p)) {
                        FS.mkdirSync(p);
                    }
                } else {
                    FS.copyFileSync(path, p);
                }

            }, Boolean(this.paramsObj.log));
        });
    }

    private getParamsValue<T>(key: Abb): string | true | undefined {
        const pAbb: any = paramsAbb;
        const params = this.paramsObj;
        return params[key] || params[pAbb[key]];
    }

    private foreach(
        path: string,
        exclude: RegExp[] = [],
        cb: (path: string, basename: string, isDir: boolean) => true | void | Promise<true | void>,
    ) {
        return forEachDir(path, exclude, (path: string, basename: string, isDir: boolean) => {
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
        const exclude = se?.split(",").filter(i => i).map(i => new RegExp(i));
        return this.foreach("./", exclude, (path, basename) => {
            if (reg.test(basename)) console.log("result ", path);
        });
    }

    delete() {
        const del = this.params.get("delete");
        if (del === true) throw new TypeError();
        const list = (del as string).split(",");
        list.forEach((p) => {
            const stat = FS.statSync(p);
            if (stat.isDirectory()) {
                FS.rmdirSync(p, {recursive: true});
            } else {
                FS.rmSync(p);
            }
        });
    }
}

new FileCli();