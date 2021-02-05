import {debounce, execute, forEachDir, getParams, isEmptyParams, typeOf} from "./utils";

const Path = require("path");
const process = require("process");

type execFn = (command: string, path?: string) => Promise<void>;


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

class CommandQueue {
    private readonly config: ExecConfig | WatchConfig;
    private readonly params: any;
    private watchArr: string[] = [];

    constructor() {
        const params = getParams();
        this.params = params;
        if (isEmptyParams() || params.help || params.h) {
            this.showHelp();
            return;
        }

        if (params.search) {
            this.search();
            return;
        }

        const configPath = Path.resolve(process.cwd(), params.config);
        try {
            this.config = require(configPath);
        } catch (e) {
            console.error("加载配置文件出错", process.cwd(), configPath);
            return;
        }
        if (params.watch) {
            this.watch();
            return;
        } else {
            if (this.config.test) {
                this.foreach();
            } else {
                this.mulExec();
            }
            return;
        }

    }

    foreach() {
        forEachDir("./", this.config.exclude || [], async (path, isDir) => {
            if (isDir) return;
            const test = this.config.test;
            if (!test.test(path)) return;
            await this.mulExec(path);
        });
    }

    search() {
        const search = this.params.search;
        if (typeof search !== "string") throw new TypeError("search");
        const reg = new RegExp(search);
        forEachDir("./", [], async (path) => {
            if (reg.test(path)) console.log("search ", path);
        });
    }

    exec(command, path = "") {
        const cwd = process.cwd();
        const basename = Path.basename(path);

        const map = {
            "\\$FilePath\\$": path,
            "\\$FileNameWithoutExtension\\$": basename.split(".").slice(0, -1).join("."),
            "\\$FileNameWithoutAllExtensions\\$": basename.split(".")[0],
            "\\$FileDir\\$": path ? Path.dirname(path) : cwd,
            "\\$CmdDir\\$": cwd,
            "\\$SourceFileDir\\$": __dirname,
        };
        const mapKeys = Object.keys(map);
        command = mapKeys.reduce((c, k) => c.replace(new RegExp(k, "g"), map[k]), String.raw`${command}`);
        return execute(command);
    };

    async mulExec(path = "") {
        for (let cmd of (this.config as ExecConfig).command) {
            await this.exec(cmd, path);
        }
    }

    async watch() {
        const config = this.config as WatchConfig;
        const watchArr = this.watchArr;
        if (typeOf(config.on) !== "function") throw new TypeError("on required");
        if (typeOf(config.test) !== "regexp") throw new TypeError("test required");

        const dbOn = debounce(config.on, 500);
        const fs = require("fs");
        const cb = (path) => {

            if (watchArr.indexOf(path) > -1) return;
            watchArr.push(path);
            console.log("对" + path + "文件夹添加监听\n");

            const watcher = fs.watch(path, null, async (e, f) => {
                const filePath = Path.resolve(path, f);
                // 判断是否需要监听的文件类型
                if (!this.config.test.test(String.raw`${filePath}`)) return;
                try {
                    const exist = await fs.existsSync(filePath);
                    if (!exist) {
                        console.log(filePath, "已删除!");
                        // 删除过的需要在watchArr里面去掉，否则重新建一个相同名称的目录不会添加监听
                        const index = watchArr.indexOf(filePath);
                        if (index > -1) {
                            watchArr.splice(index, 1);
                        }
                        return;
                    }
                    // 如果是新增的目录，必须添加监听否则不能监听到该目录的文件变化
                    const stat = await fs.statSync(filePath);
                    if (stat.isDirectory()) {
                        forEachDir(filePath, this.config.exclude, cb);
                    }
                } catch (e) {
                    console.log("watch try catch", e, filePath);
                }

                console.log('监听到', filePath, '文件有改动');

                // 改动一个文件会触发多次该回调
                await dbOn(filePath, Path.extname(filePath).substr(1), this.exec);
            });

            watcher.addListener("error", function (e) {
                console.log("addListener error", e);
            });
        };

        const include = config.include;

        const includes = include ? (Array.isArray(include) ? include : [include]) : ["./"];

        for (const path of includes) {
            await forEachDir(path, this.config.exclude, (path, isDir) => {
                if (isDir) cb(path);
            });
        }
    }

    showHelp() {
        console.log(`
            -config=         配置的路径
            -help/-h         帮助
            -search=         搜索文件或文件夹
            -watch=          监听文件改变 与-config搭配使用
        `);
    }
}

new CommandQueue();