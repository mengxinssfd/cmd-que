const fs = require('fs');
const Path = require('path');
const childProcess = require('child_process');
const util = require("util");
const exec = util.promisify(childProcess.exec);

/**
 * 防抖函数
 * @param callback 回调
 * @param delay 延时
 * @returns {Function}
 */
export function debounce(callback: (...args: any[]) => void, delay: number) {
    let timer: any = null;
    return function (...args: any[]) {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(() => {
            timer = null;
            callback.apply(this, args);
        }, delay);
    };
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
    console.log(code);
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
 * @param cb
 */
export async function forEachDir(path: string, cb: (path: string, isDir: boolean) => boolean) {
    try {
        console.log("遍历", path);
        const stats = await fs.statSync(path);
        const isDir = stats.isDirectory();
        const isContinue = cb(path, isDir);
        if (!isDir || !isContinue) {
            return;
        }

        const dir = await fs.readdirSync(path);
        for (const d of dir) {
            const p = Path.resolve(path, d);
            await forEachDir(p, cb);
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
    const pathList = [path];
    let p;
    while (p = pathList.shift()) {
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

        const list = (await fs.readdirSync(p) || []).map(i => Path.resolve(p, i));
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


export async function execute(cmd: string) {
    console.log(getTime(), '执行"' + cmd + '"命令...');
    try {
        const {stdout} = await exec(cmd);
        console.log('\n\n*************************命令输出start*************************');
        console.log(stdout);
        console.log('*************************命令输出end*******************\n\n');
    } catch (e) {
        console.log('执行失败');
        console.log('\n\n*******************************************');
        console.log(e.stdout);
        console.log('*******************************************\n\n');
    }

}