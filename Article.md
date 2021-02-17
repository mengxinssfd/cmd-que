# nodejs + ts手写一个命令批处理工具

## 前言

工作中遇到这样一些场景：在php混合html的老项目中写css，但是css写着不太好用，然后就想使用预编译语言来处理，或者写上ts。然后问题来了:
每次写完以后都要手动执行一次命令行把文件编译成css文件，然后又要再输入一行命令把css压缩添加前缀；或者把ts编译成js，然后js压缩混淆。

那么有没有办法不用手动输入命令行呢？如果只是为了不手动输入的话，那么可以在vscode上安装compile hero插件，或者在webstorm上开启file watch功能。
可惜的是这些工具或功能只能对当前文件做处理，处理编译后的文件又要手动去执行命令，不能连续监听或监听一次执行多个命令，比如webstorm的file watch监听了sass文件变化，
那么它不能再监听css变化去压缩代码，否则会无限编译下去。

那么为什么不使用webpack或者rollup之类的打包工具呢？首先是这些打包工具太重了不够灵活，毕竟原项目没到重构的时候， 要想使用新一点的技术，那么只能写一点手动编译一点了。

好在这些预编译语言都提供cli工具可在控制台输入命令行编译，那么完全可以把它们的命令关联起来，做一个批量执行的工具。其实shell脚本也可以完成这些功能， 但是其一shell在windows上的话只能在git
bash里运行，在cmd控制台上不能运行，需要专门打开一个git bash，少了一点便利性；其二在windows上不能监听文件变化。 那么既然nodejs能够胜任，那么用前端熟悉的js做岂不美哉。

## 需求：

1. 通过控制台输入指令启动
1. 运行
    - 控制台命令行输入命令执行
    - 通过指定配置文件执行
1. 执行方式
1. 执行命令
    - url模板替换；
1. 遍历文件夹
1. 监听文件改动
    - 多个监听文件夹入口
1. 接收控制台命令参数
1. 配置
    - 依次执行多个命令；
    - 生命周期回调
    - 忽略文件夹
    - 匹配规则
        - 匹配成功
            - 执行相应命令；
            - 执行相应js；
1. 前后生命周期

1. 可通过指令显示隐藏log
1. 可通过指令显示隐藏运行时间
1. npm全局一次安装，随处执行
1. 帮助功能
1. 搜索
    - 搜索文件或文件夹
    - 忽略大小写
    - 忽略文件夹

ok，那么接下来进入正文吧(源码见底部github链接)。

## 实现

### 通过控制台输入指令启动:获取控制台输入的命令

首先是获取到控制台输入的命令，这里抽取出来做为一个工具函数。 格式为以"="隔开的键值对，键名以"-"开头，值为空时设置该值为true，变量之间用空格隔开。    

```ts
// util.ts
/**
 * 获取命令行的参数
 * @param prefix 前缀
 */
export function getParams(prefix = "-"): { [k: string]: string | true } {
    return process.argv.slice(2).reduce((obj, it) => {
        const sp = it.split("=");
        const key = sp[0].replace(prefix, "");
        obj[key] = sp[1] || true;
        return obj;
    }, {} as ReturnType<typeof getParams>);
}
```

运行结果
![](https://cdn.jsdelivr.net/gh/mengxinssfd/imgBase@main/img/20210215142034.png)

### 执行命令
获取到命令行参数以后就好办了，接下来实现执行命令功能。

先实现一个简单的执行命令代码，这要用到child_process模块里的exec函数。

```ts
const util = require("util");
const childProcess = require('child_process');
const exec = util.promisify(childProcess.exec); // 这里把exec promisify
```

然后把它封装一下

```ts
async function execute(cmd: string): Promise<string> {
    console.log('执行"' + cmd + '"命令...');
    try {
        const {stdout} = await exec(cmd);
        console.log('success!');
        console.log(stdout); // 命令执行成功结果
        return stdout;
    } catch (e) {
        console.log('执行失败');
        console.log(e.stderr);
        return e.stderr; // 命令执行error信息
    }
}
```
调用
```ts
const args = getParams();
execute(args.command as string);
```
运行
```ts
const args = getParams();
execute(args.command as string);
```
![](https://cdn.jsdelivr.net/gh/mengxinssfd/imgBase@main/img/20210215161359.png)
看结果可以发现：两条命令只执行了第一条，把它改成顺序执行

```ts
async function mulExec(command: string[]) {
   for (const cmd of command) {
      await execute(cmd);
   }
}

```
运行
```ts
mulExec((args.command as string).split(","));
```
![](https://cdn.jsdelivr.net/gh/mengxinssfd/imgBase@main/img/20210215161946.png)


### 遍历文件夹

上面虽然能够执行命令，但是有时候需要编译的文件有很多，像stylus、pug这些可以直接编译整个文件夹的还好， 像ts的话就只能一个文件写一条命令，那也太麻烦了。所以得增加一个需求：遍历文件夹查找目标文件， 然后执行命令的功能。

首先写一个遍历文件夹的函数。

```ts
const fs = require("fs");
const Path = require("path");

/**
 * 遍历文件夹
 * @param path
 * @param exclude
 * @param cb
 */
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
```

然后正则验证文件名，如果符合就执行命令

```ts
forEachDir("../test", [], (path, basename, isDir) => {
    if (isDir) return;
    const test = /\.styl$/;
    if (!test.test(basename)) return;
    return execute("stylus " + path);
});
```

![](https://cdn.jsdelivr.net/gh/mengxinssfd/imgBase@main/img/20210214223843.png)


## 进阶

那么到这里，一个简单的命令批量执行工具代码就已经基本完成了。但是需求总是会变的，

## 工具化

上面这些做为工具肯定是不够的，接下来就把它做成一个npm包，全局安装时就可以

## git地址

https://github.com/mengxinssfd/cmd-que

[TOC]