// const getParams = require("./utils").getParams;
// tsc src/file.ts --target es2017 --module commonjs
import {getParams, chunk, createEnumByObj, createObj, forEachDir} from "./utils";

const FS = require("fs");

// 指令全写对应的缩写
enum Abb {
    find = "f",
    delete = "d",
    move = "m",
    copy = "c",
    help = "h",
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
        };
        if (params.size) {
            params.forEach((value, key) => {
                const fn = fnObj[key];
                fn && fn();
            });
        } else {
            FileCli.showHelp();
        }

    }

    private static showHelp() {
        console.log(`
            -help/-h                帮助
            -find/-f=               搜索文件或文件夹
            -find-flag/-sf=         搜索文件或文件夹 /\\w+/flag
            -find-exclude/-se=      搜索文件或文件夹 忽略文件夹 多个用逗号(,)隔开
            -open/-o=               打开资源管理器并选中文件或文件夹
            -open-type/-ot=         打开资源管理器并选中文件或文件夹
            -delete/-d              删除文件或文件夹
            -copy/-c                复制文件或文件夹
        `);
    }

    getParams(key: "move" | "copy"): [from: string, to: string][] {
        const params = this.params;
        const value = params.get(key);
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
            FS.copyFileSync(arr[0], arr[1]);
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