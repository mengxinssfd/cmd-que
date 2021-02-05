# cmd-que

command queue

```shell
npm i -g @mxssfd/cmd-que
cmd-que 
```

配置文件参数

```ts
interface ExecConfig {
    command: string[]; // 执行模式下的命令列表，command中的占位符会被替换
    test?: RegExp; // 如果test不为空的话会遍历文件夹，否则只执行command
    exclude?: RegExp[]; // 如果test不为空，路径包含改正则的话不遍历
}

interface WatchConfig {
    exclude?: RegExp[]; // 路径包含该正则的话不遍历
    include?: string[] | string; // 要监听的文件夹路径
    test: RegExp; // 文件监听改动后匹配则触发on事件
    /**
     * @param path 触发改动事件的路径
     * @param ext 触发改动事件的文件后缀
     * @param exec 执行命令函数
     */
    on: (path: string, ext: string, exec: execFn) => Promise<void>
}
```

## 只执行命令

config.js

```js
module.exports = {
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
    ],
    command: [
        "stylus E:\\project\\cmd-que\\test\\exec\\test1.styl",
        "npx postcss *.css --use autoprefixer cssnano -d ./ --no-map",
    ]
}
```

```shell
cmd-que config.js
```

## 遍历文件夹执行命令

config.js

```js
module.exports = {
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
    ],
    test: /\.styl$/,
    command: [
        "stylus <$FilePath$> $FileDir$\\$FileNameWithoutAllExtensions$.css",
        "npx postcss *.css --use autoprefixer cssnano -d ./ --no-map",
    ]
};
```
```shell
cmd-que config.js
```

## 监听文件改动执行命令
config.js
```js
module.exports = {
    exclude: [
        /node_modules/,
        /\.git/,
        /\.idea/,
    ],
    // include: ["./test", "./test2"],
    test: /\.(styl|ts|pug)$/,
    async on(path, ext, exec) {
        const types = {
            styl: "styl",
            ts: "ts",
            pug: "pug"
        };
        const command = {
            [types.styl]: "stylus $FilePath$",
            [types.ts]: "tsc $FilePath$",
            [types.pug]: "pug ./",
        };
        switch (ext) {
            case types.styl:
            case types.ts:
                await exec(command[ext], path);
            case types.pug:
                await exec(command[types.pug], path);
                break;
        }
    }
};
```
```shell
cmd-que config.js
```