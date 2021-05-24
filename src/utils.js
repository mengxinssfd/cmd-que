"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyDir = exports.chunk = exports.createObj = exports.createEnumByObj = exports.isEmptyParams = exports.getParams = exports.mulExec = exports.executeTemplate = exports.execute = exports.findDirBFS = exports.findDir = exports.forEachDirBfs = exports.forEachDir = exports.debouncePromise = void 0;
const fs = require("fs");
const Path = require("path");
const childProcess = require("child_process");
const util = require("util");
const exec = util.promisify(childProcess.exec);
function debouncePromise(callback, delay) {
    let timer = null;
    let rej;
    return function (...args) {
        return new Promise((resolve, reject) => {
            if (timer) {
                clearTimeout(timer);
                timer = null;
                rej("debounce promise reject");
            }
            rej = reject;
            timer = setTimeout(async () => {
                timer = null;
                const result = await callback.apply(this, args);
                resolve(result);
            }, delay);
        });
    };
}
exports.debouncePromise = debouncePromise;
process.on("exit", function (code) {
    // console.log(code);
});
process.stdin.setEncoding("utf8");
/**
 * 遍历文件夹
 * @param path
 * @param exclude
 * @param cb
 * @param showLog
 */
async function forEachDir(path, exclude = [], cb, showLog = false) {
    showLog && console.log("遍历", path);
    try {
        const stats = fs.statSync(path);
        const isDir = stats.isDirectory();
        const basename = Path.basename(path);
        const isExclude = () => {
            const raw = String.raw `${path}`;
            return exclude.some((item) => item.test(raw));
        };
        if (isDir && isExclude())
            return;
        const callback = cb || ((path, isDir) => undefined);
        const isStop = await callback(path, basename, isDir);
        if (!isDir || isStop === true) {
            return;
        }
        const dir = fs.readdirSync(path);
        for (const d of dir) {
            const p = Path.resolve(path, d);
            await forEachDir(p, exclude, cb, showLog);
        }
    }
    catch (e) {
        showLog && console.log("forEachDir error", path, e);
        // 不能抛出异常，否则遍历到System Volume Information文件夹报错会中断遍历
        // return Promise.reject(e);
    }
}
exports.forEachDir = forEachDir;
/**
 * 遍历文件夹
 * @param path
 * @param exclude
 * @param cb
 * @param showLog
 */
async function forEachDirBfs(path, exclude = [], cb, showLog = false) {
    showLog && console.log("遍历", path);
    try {
        const queue = [path];
        while (queue.length) {
            const path = queue.shift();
            const stats = fs.statSync(path);
            const isDir = stats.isDirectory();
            const basename = Path.basename(path);
            const isExclude = () => {
                const raw = String.raw `${path}`;
                return exclude.some((item) => item.test(raw));
            };
            if (isDir && isExclude())
                continue;
            const callback = cb || ((path, isDir) => undefined);
            const isStop = await callback(path, basename, isDir);
            if (!isDir || isStop === true) {
                continue;
            }
            const dir = fs.readdirSync(path);
            for (const d of dir) {
                const p = Path.resolve(path, d);
                queue.push(p);
            }
        }
    }
    catch (e) {
        showLog && console.log("forEachDirBfs error", path, e);
        // 不能抛出异常，否则遍历到System Volume Information文件夹报错会中断遍历
        // return Promise.reject(e);
    }
}
exports.forEachDirBfs = forEachDirBfs;
async function findDir(path, exclude, cb) {
    console.log("findDir", path);
    const v = await cb(path);
    if (v) {
        return path;
    }
    const stats = fs.statSync(path);
    const isDir = stats.isDirectory();
    if (!isDir) {
        return null;
    }
    const raw = String.raw `${path}`;
    const isExclude = exclude.some((item) => item.test(raw));
    if (isExclude) {
        return null;
    }
    const dir = await fs.readdirSync(path);
    for (const d of dir) {
        const p = Path.resolve(path, d);
        const rs = await findDir(p, exclude, cb);
        if (rs)
            return rs;
    }
    return null;
}
exports.findDir = findDir;
async function findDirBFS(path, exclude, cb) {
    const pathList = [path];
    while (pathList.length) {
        const p = pathList.shift();
        console.log("findDirBFS", p);
        const v = await cb(p);
        if (v) {
            return p;
        }
        const stats = fs.statSync(p);
        const isDir = stats.isDirectory();
        if (!isDir)
            continue;
        const raw = String.raw `${p}`;
        const isExclude = exclude.some((item) => item.test(raw));
        if (isExclude)
            continue;
        const list = (fs.readdirSync(p) || []).map(i => Path.resolve(p, i));
        pathList.push(...list);
    }
    return null;
}
exports.findDirBFS = findDirBFS;
// 不足10前面加0
function addZero(time) {
    return time > 9 ? String(time) : ("0" + time);
}
function getTime() {
    const date = new Date();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    return `${addZero(h)}:${addZero(m)}:${addZero(s)}`;
}
async function execute(cmd) {
    console.log(getTime(), "执行\"" + cmd + "\"命令...");
    // try {
    const { stdout } = await exec(cmd);
    console.log("success!");
    // console.log('\n\n*************************命令输出start*************************');
    console.log(stdout);
    // console.log('*************************命令输出end*******************\n\n');
    return stdout;
    /*} catch (e) {
        console.log('执行失败');
        console.log('\n\n*******************************************');
        console.log(e);
        console.log('*******************************************\n\n');
        process.exit(0);
    }*/
}
exports.execute = execute;
function executeTemplate(command, path = "") {
    const cwd = process.cwd();
    path = path || cwd;
    const basename = Path.basename(path);
    const map = {
        "\\$FilePath\\$": path,
        "\\$FileName\\$": basename,
        "\\$FileNameWithoutExtension\\$": basename.split(".").slice(0, -1).join("."),
        "\\$FileNameWithoutAllExtensions\\$": basename.split(".")[0],
        "\\$FileDir\\$": Path.dirname(path),
        "\\$Cwd\\$": cwd,
        "\\$SourceFileDir\\$": __dirname,
    };
    const mapKeys = Object.keys(map);
    command = mapKeys.reduce((c, k) => c.replace(new RegExp(k, "g"), map[k]), String.raw `${command}`);
    return execute(command);
}
exports.executeTemplate = executeTemplate;
async function mulExec(command, path) {
    for (const cmd of command) {
        await executeTemplate(cmd, path);
    }
}
exports.mulExec = mulExec;
/**
 * 获取命令行的参数
 * @param prefix 前缀
 */
function getParams(prefix = "-") {
    return process.argv.slice(2).reduce((map, it) => {
        const sp = it.split("=");
        const key = sp[0].replace(prefix, "");
        map.set(key, sp[1] || true); // "",undefined,"string";前两个会转为true
        return map;
    }, new Map());
}
exports.getParams = getParams;
function isEmptyParams() {
    return process.argv.length < 3;
}
exports.isEmptyParams = isEmptyParams;
function createEnumByObj(obj) {
    const res = {};
    for (let k in obj) {
        if (res.hasOwnProperty(k))
            throw new Error("key multiple");
        res[res[k] = obj[k]] = k;
    }
    Object.freeze(res); // freeze值不可变
    return res;
}
exports.createEnumByObj = createEnumByObj;
/**
 * 创建一个object 代替es6的动态key object 与Object.fromEntries一样
 * @example
 * const k1 = "a",k2 = "b"
 * createObj([[k1, 1], [k2, 2]]); // {a:1, b:2}
 * @param entries
 * @return {{}}
 */
function createObj(entries) {
    return entries.reduce((initValue, item) => {
        if (!Array.isArray(item) || item.length < 1)
            throw new TypeError("createObj args type error");
        const [key, value] = item;
        if (key !== void 0) {
            initValue[key] = value;
        }
        return initValue;
    }, {});
}
exports.createObj = createObj;
/**
 * 数组分片
 * @example
 * chunk([0,1,2,3,4,5,6], 3) // => [[0,1,2],[3,4,5],[6]]
 * @param arr
 * @param chunkLen
 */
function chunk(arr, chunkLen) {
    if (!Array.isArray(arr))
        throw new TypeError("chunk param arr type error");
    if (chunkLen < 1)
        return arr.slice();
    const result = [];
    let i = 0;
    while (i < arr.length) {
        result.push(arr.slice(i, i += chunkLen));
    }
    return result;
}
exports.chunk = chunk;
function copyDir(path) {
}
exports.copyDir = copyDir;
