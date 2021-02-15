import {getParams, execute} from "./utils";

const childProcess = require('child_process');
const util = require("util");
const exec = util.promisify(childProcess.exec);


(async function () {

    const args = getParams();

    async function mulExec(command: string[]) {
        for (const cmd of command) {
            await execute(cmd);
        }
    }

    mulExec((args.command as string).split(","));

    return;

    const fs = require("fs");
    const Path = require("path");

    async function forEachDir(
        path: string,
        exclude: RegExp[] = [],
        cb?: (path: string, basename: string, isDir: boolean) => true | void | Promise<true | unknown>,
    ) {
        try {
            const stats = await fs.statSync(path);
            const isDir = stats.isDirectory();
            const basename = Path.basename(path);

            const isExclude = () => {
                const raw = String.raw`${path}`; // 路径必须raw，否则正则匹配不上
                return exclude.some((item) => item.test(raw)); // 判断该路径是否是忽略的
            };
            if (isDir && isExclude()) return;

            const callback = cb || ((path, isDir) => undefined);
            const isStop = await callback(path, basename, isDir); // 当回调函数返回true的时候停止执行后面的

            if (!isDir || isStop) {
                return;
            }

            // 递归遍历文件夹
            const dir = await fs.readdirSync(path);
            for (const d of dir) {
                const p = Path.resolve(path, d);
                await forEachDir(p, exclude, cb);
            }
        } catch (e) {
            return Promise.reject(e);
        }
    }

    forEachDir("../test", [], (path, basename, isDir) => {
        if (isDir) return;
        const test = /\.styl$/;
        if (!test.test(basename)) return;
        return execute("stylus " + path);
    });
})();
