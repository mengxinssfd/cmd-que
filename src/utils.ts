const fs = require('fs');
const Path = require('path');
const childProcess = require('child_process');
const util = require("util");
const exec = util.promisify(childProcess.exec);

// 获取数据类型
export function typeOf(target: any): string {
    const tp = typeof target;
    if (tp !== 'object') return tp;
    return Object.prototype.toString.call(target).slice(8, -1).toLowerCase();
}


/**
 * 防抖函数
 * @param callback 回调
 * @param delay 延时
 * @returns {Function}
 */
export function debounce<CB extends (...args: any[]) => void>(callback: CB, delay: number): CB {
    let timer: any = null;
    return function (this: unknown, ...args: any[]) {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            timer = null;
            callback.apply(this, args);
        }, delay);
    } as CB;
}

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

/**
 * 防抖装饰器
 * @param delay
 * @constructor
 */
export function Debounce(delay: number) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        // 在babel的网站编译的是target包含key，descriptor
        if (target.descriptor) {
            descriptor = target.descriptor;
        }
        descriptor.value = debounce(descriptor.value, delay);
    };
}

process.on('exit', function (code) {
    // console.log(code);
});
process.stdin.setEncoding('utf8');

// 控制台输入
function input(tips: string): Promise<string> {
    process.stdout.write(tips);
    return new Promise((res) => {
        process.stdin.on('data', (input: Buffer) => {
            res(input.toString().trim());
            // if ([ 'NO', 'no'].indexOf(input) > -1) process.exit(0);
        });
    });
}

/**
 * 控制台循环输入，
 * @param tips
 * @param conditionFn 若返回false则一直输入
 * @returns {Promise<*>}
 */
async function inputLoop(
    tips: string,
    conditionFn: (words: string) => boolean | Promise<boolean>,
): Promise<string> {
    let words;
    do {
        words = await input(tips);
    } while (!await conditionFn(words));
    return words;
}


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
    showLog = false
) {
    try {
        showLog && console.log("遍历", path);
        const stats = await fs.statSync(path);
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

        const dir = await fs.readdirSync(path);
        for (const d of dir) {
            const p = Path.resolve(path, d);
            await forEachDir(p, exclude, cb, showLog);
        }
    } catch (e) {
        return Promise.reject(e);
    }
}

export async function findDir(path: string, exclude: RegExp[], cb: (path: string) => boolean): Promise<null | string> {
    console.log("findDir", path);
    const v = await cb(path);
    if (v) {
        return path;
    }

    const stats = await fs.statSync(path);
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

        const stats = await fs.statSync(p);
        const isDir = stats.isDirectory();
        if (!isDir) continue;

        const raw = String.raw`${p}`;
        const isExclude = exclude.some((item) => item.test(raw));
        if (isExclude) continue;

        const list = ((await fs.readdirSync(p) as string[]) || []).map(i => Path.resolve(p, i));
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
        console.log(e.stderr);
        console.log('*******************************************\n\n');
        return e.stderr;
    }
}

export function getParams() {
    const params: any = {};
    (process.argv.slice(2) || []).forEach(it => {
        const sp = it.split("=");
        params[sp[0].replace("-", "")] = sp[1] || true;
    });
    return params;
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