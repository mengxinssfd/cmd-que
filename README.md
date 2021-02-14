# cmd-que

command queue

## 安装方法
```shell
npm i -g @mxssfd/cmd-que
cmd-que 
```
## 使用方法

### 方式1：直接在命令行上输入命令执行命令队列
方便挂载在webstorm上的file watcher里   
注意：多条命令用,隔开，命令用引号"包起来
```shell
cmd-que -command="node -v,node -h"
```
### 方式2：使用配置文件执行命令队列

#### 配置文件参数

```ts
type execFn = (command: string) => Promise<string>;

/**
 * @param eventName 事件名
 * @param path 触发改动事件的路径
 * @param ext 触发改动事件的文件后缀
 * @param exec 执行命令函数
 */
type onFn = (eventName: string, path: string, ext: string, exec: execFn) => Promise<void>


type Rule = {
    test: RegExp,
    on: onFn,
    command: string[];
};

type RuleOn = Omit<Rule, "command">;
type RuleCmd = Omit<Rule, "on">;
type Rules = Array<RuleOn | RuleCmd>;

interface Config {
    beforeStart: (exec: execFn) => void;
    beforeEnd: (exec: execFn) => void;
}

interface ExecCmdConfig extends Config {
    command: string[]; // 直接执行命令列表 占位符会被替换
}


interface WatchConfig extends Config {
    exclude?: RegExp[]; // 遍历时忽略的文件夹
    include?: string[] | string; // 要遍历/监听的文件夹路径 // 默认为当前文件夹
    rules: Rules
}
```

#### 只执行命令
注意相对路径是相对于启动命令所在路径   
config.js
```js
module.exports = {
    command: [
        "stylus test/test.styl",
        "stylus E:\\project\\cmd-que\\test\\test1.styl",
    ]
}
```

```shell
cmd-que -c=config.js
```
#### 遍历文件夹，匹配路径执行命令 
config.js
```js
module.exports = {
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
    ],
    rules: [
        {
            test: /\.styl$/,
            command: [
                // $FilePath$占位符
                "stylus <$FilePath$> $FileDir$\\$FileNameWithoutAllExtensions$.wxss",
                "node -v"
            ]
        }
    ]
};
```
```shell
cmd-que -c=config.js
```

#### 遍历文件夹，匹配路径执行代码
config.js
```js
module.exports = {
    beforeEnd(exec) {
        return exec("pug $Cwd$")
    },
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
        /src/,
        /bin/,
    ],
    include: ["./test"],
    rules: [
        {
            test: /\.styl$/,
            on: async (eventName, path, ext, exec) => {
                if (eventName === "delete") return;
                const result = await exec("stylus $FilePath$");
                console.log(result)
            }
        },
        {
            test: /\.ts$/,
            on: (eventName, path, ext, exec) => {
                if (eventName === "delete") return;
                return exec("tsc $FilePath$");
            }
        },
    ]
};
```
```shell
cmd-que -c=config.js
```

#### 遍历文件夹，监听文件改动执行命令
config.js
```js
module.exports = {
    beforeEnd() {
        console.log("end")
    },
    rules: [
        {
            test: /\.styl$/,
            // on 和 command二选一 都存在时用on
            /*on: async (eventName, path, ext, exec) => {
                if (eventName === "delete") return;
                const result = await exec("stylus $FilePath$");
                console.log(result)
            },*/
            command: [
                "stylus $FilePath$",
                "node -v"
            ]
        },
    ],
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
        /src/,
        /bin/,
    ],
    include: ["./test"],
};
```
```shell
cmd-que -c=config.js -w
```

### 其他功能
#### 搜索
```shell
cmd-que -s=test\.js -sf=ig -se=node_modules,\.git
```
#### 更多
可以在config.js里的rules.on里更加自由的操作，比如查找并删除文件，搜索文本内容等功能