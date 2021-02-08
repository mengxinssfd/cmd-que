const util = require("util");
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec); // 这里把exec promise化

async function execute(cmd: string) {
    console.log('执行"' + cmd + '"命令...');
    try {
        const {stdout} = await exec(cmd);  // 执行命令
        console.log('执行成功!!');
        console.log(stdout); // 输出命令结果
    } catch (e) {
        console.log('执行失败');
        console.log('\n\n*******************************************');
        console.log(e.stdout); // 输出命令错误信息
        console.log('*******************************************\n\n');
    }
}

const fs = require("fs");
const Path = require("path");
// execute("node -v")
export async function forEachDir(
    path: string,
    exclude: RegExp[],
    cb?: (path: string, isDir: boolean) => true | void | Promise<true | void>,
) {
    try {
        // 判读是否忽略文件夹
        const raw = String.raw`${path}`;
        const isExclude = exclude.some((item) => item.test(raw));
        if (isExclude) return;

        // 是否文件夹
        const stats = await fs.statSync(path);
        const isDir = stats.isDirectory();
        // 执行回调
        const callback = cb || ((path, isDir) => undefined);
        const isStop = await callback(path, isDir);

        // 如果是文件或者回调返回true则停止
        if (!isDir || isStop) {
            return;
        }

        // 如果是文件夹则递归遍历
        const dir = await fs.readdirSync(path);
        for (const d of dir) {
            const p = Path.resolve(path, d);
            await forEachDir(p, exclude, cb);
        }
    } catch (e) {
        return Promise.reject(e);
    }
}
/*
forEachDir("./", [], async (path, isDir) => {
    if(isDir || Path.extname(path) !== ".ts")return;
    const cmd = [
        "tsc "+path,
        ""
    ]
    if (!test.test(path)) return;
    await this.mulExec(path);
})*/;

console.log(Path.basename('/目录1/目录2'));