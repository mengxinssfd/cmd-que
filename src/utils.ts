const fs = require('fs');
const Path = require('path');
const childProcess = require('child_process');
const util = require("util");
const exec = util.promisify(childProcess.exec);


export function debouncePromise<T, CB extends (...args: any[]) => Promise<T>>(callback: CB, delay: number): CB {
    let timer: any = null;
    let rej: Function;

    return function (this: unknown, ...args: any[]) {
        return new Promise<T>((resolve, reject) => {
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
    } as CB;
}

process.on('exit', function (code) {
    // console.log(code);
});
process.stdin.setEncoding('utf8');


/**
 * 遍历文件夹
 * @param path
 * @param exclude
 * @param cb
 * @param showLog
 */
export async function forEachDir(
    path: string,
    exclude: RegExp[] = [],
    cb?: (path: string, basename: string, isDir: boolean) => true | void | Promise<true | void>,
    showLog = false,
) {
    showLog && console.log("遍历", path);
    try {
        const stats = fs.statSync(path);
        const isDir = stats.isDirectory();
        const basename = Path.basename(path);

        const isExclude = () => {
            const raw = String.raw`${path}`;
            return exclude.some((item) => item.test(raw));
        };
        if (isDir && isExclude()) return;


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
    } catch (e) {
        showLog && console.log("forEachDir error", path, e);
        // 不能抛出异常，否则遍历到System Volume Information文件夹报错会中断遍历
        // return Promise.reject(e);
    }
}

export async function findDir(path: string, exclude: RegExp[], cb: (path: string) => boolean): Promise<null | string> {
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

    const raw = String.raw`${path}`;
    const isExclude = exclude.some((item) => item.test(raw));
    if (isExclude) {
        return null;
    }

    const dir = await fs.readdirSync(path);
    for (const d of dir) {
        const p = Path.resolve(path, d);
        const rs = await findDir(p, exclude, cb);
        if (rs) return rs;
    }
    return null;
}

export async function findDirBFS(path: string, exclude: RegExp[], cb: (path: string) => boolean): Promise<null | string> {
    const pathList: string[] = [path];

    while (pathList.length) {
        const p = pathList.shift() as string;
        console.log("findDirBFS", p);
        const v = await cb(p);
        if (v) {
            return p;
        }

        const stats = fs.statSync(p);
        const isDir = stats.isDirectory();
        if (!isDir) continue;

        const raw = String.raw`${p}`;
        const isExclude = exclude.some((item) => item.test(raw));
        if (isExclude) continue;

        const list = ((fs.readdirSync(p) as string[]) || []).map(i => Path.resolve(p, i));
        pathList.push(...list);

    }
    return null;
}


// 不足10前面加0
function addZero(time: number): string {
    return time > 9 ? String(time) : ('0' + time);
}

function getTime(): string {
    const date = new Date();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    return `${addZero(h)}:${addZero(m)}:${addZero(s)}`;
}


export async function execute(cmd: string): Promise<string> {
    console.log(getTime(), '执行"' + cmd + '"命令...');
    try {
        const {stdout} = await exec(cmd);
        console.log('success!');
        // console.log('\n\n*************************命令输出start*************************');
        console.log(stdout);
        // console.log('*************************命令输出end*******************\n\n');
        return stdout;
    } catch (e) {
        console.log('执行失败');
        console.log('\n\n*******************************************');
        console.log(e);
        console.log('*******************************************\n\n');
        return e.stderr;
    }
}

/**
 * 获取命令行的参数
 * @param prefix 前缀
 */
export function getParams(prefix = "-"): { [k: string]: string | true } {
    return process.argv.slice(2).reduce((obj, it) => {
        const sp = it.split("=");
        const key = sp[0].replace(prefix, "");
        obj[key] = sp[1] || true; // "",undefined,"string";前两个会转为true
        return obj;
    }, {} as ReturnType<typeof getParams>);
}

export function isEmptyParams(): boolean {
    return process.argv.length < 3;
}

export function createEnumByObj<T extends object, K extends keyof T, O extends { [k: string]: K }>(obj: T): T & { [k: string]: K } {
    const res: any = {};
    for (let k in obj) {
        if (res.hasOwnProperty(k)) throw new Error("key multiple");
        res[res[k] = obj[k]] = k;
    }

    Object.freeze(res); // freeze值不可变
    return res;
}