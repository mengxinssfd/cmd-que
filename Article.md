# nodejs+ts手写一个命令批处理工具

### 前言

工作中遇到这样一些场景：在php混合html的老项目中写css，但是css写着老不舒服了，然后理所当然的想使用预编译语言来处理，或者写上ts。然后问题来了，
每次写完以后都要手动执行一次命令行把文件编译成css文件，然后又要再输入一行命令把css压缩添加前缀；或者把ts编译成js，然后js压缩混淆。

那么有没有办法不用手动输入命令行呢？如果只是为了不手动输入的话，那么可以在vscode上安装compile hero插件，或者在webstorm上开启file watch功能。
可惜的是这些工具或功能只能对当前文件做处理，处理编译后的文件又要手动去执行命令，不能连续监听或监听一次执行多个命令，比如webstorm的file watch监听了sass文件变化，
那么它不能再监听css变化去压缩代码，否则会无限编译下去。

那么为什么不使用webpack或者rollup之类的打包工具呢？首先是这些打包工具太重了不够灵活，毕竟原项目没到重构的时候， 要想使用新一点的技术，那么只能写一点手动编译一点了(或许有办法做到，如果有大佬知道，望告知，谢谢)。

这些预编译语言都提供cli工具可输入命令行编译，那么完全可以把它们的命令关联起来，做一个批量执行的工具。其实shell脚本也可以完成这些功能， 但是其一shell在windows上的话只能在git
bash里运行，在cmd控制台上不能运行，需要专门打开一个git bash，少了一点便利性；其二在windows上不能监听文件变化。 那么既然nodejs能够胜任，那么用前端熟悉的js做岂不美哉。

ok，那么接下来进入正文吧(源码见底部github链接)。

### 执行命令

首先我们先实现一个简单的执行命令代码，这要用到child_process模块里的exec函数。

```ts
const util = require("util");
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec); // 这里把exec promise化
```

然后把它封装一下

```ts
export async function execute(cmd: string) {
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
```

那么一个简单的执行命令函数就搞定了。运行一下

```ts
execute("node -v");
// 执行"node -v"命令...
// 执行成功!!
// v10.15.2
```

### 顺序执行命令

上面虽然能够执行命令，但是有时候需要编译的文件有很多，像stylus、pug这些可以直接编译整个文件夹的还好， 像ts的话就只能一个文件写一条命令，那也太麻烦了，接下来我们就改成遍历文件夹查找目标文件， 然后执行命令的代码。
首先写一个遍历文件夹的函数。

```ts
const fs = require("fs");
const Path = require("path");
/**
 * 遍历文件夹
 * @param path
 * @param exclude 忽略数组
 * @param cb
 */
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
```

```ts
forEachDir("./", [], async (path, isDir) => {
    if (isDir) return;
    const test = this.config.test;
    if (!test.test(path)) return;
    await this.mulExec(path);
});
```
