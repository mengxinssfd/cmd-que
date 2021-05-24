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
    "search-flag" = "sf",
    "search-exclude" = "se",
}


const paramsAbb = createEnumByObj(Abb);

class FileCli {
    params: Map<string, string | boolean>;
    paramsObj: { [k: string]: string | true };

    constructor() {
        const params = this.params = getParams();
        this.paramsObj = createObj(Array.from(params.entries()));
        params.forEach((value, key) => {
            if (key === "move") {
                this.move();
            }
            if (key === "copy") {
                this.copy();
            }
            if (key === "find") {
                this.find();
            }
            if (key === "delete") {
                this.delete();
            }
        });

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
        const flag = this.getParamsValue(Abb["search-flag"]);
        const se = this.getParamsValue(Abb["search-exclude"]);
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