import {
    createEnumByObj,
    debounce,
    Debounce,
    debouncePromise,
    execute,
    forEachDir,
    getParams,
    isEmptyParams,
    typeOf
} from "./utils";

const Path = require("path");
const process = require("process");

type execFn = (command: string, path?: string) => Promise<void>;

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
    beforeStart: (exec: (command, path?: string) => Promise<void>) => void;
    beforeEnd: (exec: (command, path?: string) => Promise<void>) => void;
}

interface ExecCmdConfig extends Config {
    command: string[]; // 直接执行命令列表 占位符会被替换
}

interface ExecTestCmdConfig extends Config {
    exclude?: RegExp[]; // 如果test不为空，路径包含改正则的话不遍历
    rules: Rules;
}


type ExecConfig = ExecCmdConfig | ExecTestCmdConfig

interface WatchConfig extends Config {
    exclude?: RegExp[]; // 路径包含该正则的话不遍历
    include?: string[] | string; // 要监听的文件夹路径 // 默认为当前文件夹
    rules: Rules
}

// 缩写对应的全写
enum abb {
    c = "config",
    s = "search",
    sf = "search-flag",
    se = "search-exclude",
    w = "watch",
    h = "help",
    t = "time"
}

const paramsAbb = createEnumByObj(abb);

function isRuleOn(rule: RuleOn | RuleCmd): rule is RuleOn {
    return (rule as RuleOn).on !== undefined;
}

class CommandQueue {
    private readonly params: any;
    private config: ExecConfig | WatchConfig;
    private watchArr: string[] = [];

    constructor() {
        this.params = getParams();
        const time = this.getParamsValue("t");
        time && console.time("time");
        this.init().finally(() => {
            this.config.beforeEnd && this.config.beforeEnd(this.exec);
            time && console.timeEnd("time");
        });
    }

    async init() {
        if (isEmptyParams() || this.getParamsValue("h")) {
            return this.showHelp();
        }

        if (this.getParamsValue("s")) {
            return this.search();
        }

        const cp = this.getParamsValue("c");
        const configPath = Path.resolve(process.cwd(), cp);
        try {
            this.config = require(configPath);
        } catch (e) {
            console.error("加载配置文件出错", process.cwd(), configPath);
            return;
        }
        this.config.beforeStart && this.config.beforeStart(this.exec);
        if (this.getParamsValue("w")) {
            return this.watch();
        } else {
            if ((this.config as ExecTestCmdConfig).rules) {
                return this.foreach();
            } else {
                return this.mulExec((this.config as ExecCmdConfig).command);
            }
        }

    }

    getParamsValue(key: keyof typeof abb): string {
        const pAbb: any = paramsAbb;
        const params = this.params;
        return params[key] || params[pAbb[key]];
    }

    async foreach() {
        const config = this.config as ExecTestCmdConfig;

        await forEachDir("./", config.exclude, async (path, basename, isDir) => {
            return this.test("", path, basename);
        }, this.params.log);
    }

    search() {
        const search = this.getParamsValue("s");
        const flag = this.getParamsValue("sf");
        if (typeof search !== "string") throw new TypeError("search");
        const reg = new RegExp(search, flag);
        console.log("search", reg);
        const exclude = this.getParamsValue("se")?.split(",").filter(i => i).map(i => new RegExp(i));
        return forEachDir("./", exclude, (path, basename) => {
            if (reg.test(basename)) console.log("result ", path);
        }, this.params.log);
    }

    exec(command: string, path = "") {
        const cwd = process.cwd();
        const basename = Path.basename(path);

        const map = {
            "\\$FilePath\\$": path,
            "\\$FileNameWithoutExtension\\$": basename.split(".").slice(0, -1).join("."),
            "\\$FileNameWithoutAllExtensions\\$": basename.split(".")[0],
            "\\$FileDir\\$": path ? Path.dirname(path) : cwd,
            "\\$Cwd\\$": cwd,
            "\\$SourceFileDir\\$": __dirname,
        };
        const mapKeys = Object.keys(map);
        command = mapKeys.reduce((c, k) => c.replace(new RegExp(k, "g"), map[k]), String.raw`${command}`);
        return execute(command);
    };

    async mulExec(command: string[], path = "") {
        for (const cmd of command) {
            await this.exec(cmd, path);
        }
    }

    async test(eventName: string, path: string, basename: string) {
        const rules = (this.config as WatchConfig).rules;
        if (!rules) return;
        for (const rule of rules) {
            if (!rule.test.test(basename)) continue;
            if (isRuleOn(rule)) {
                await rule.on(eventName, path, Path.extname(path).substr(1), this.exec);
            } else {
                await this.mulExec((rule as RuleCmd).command, path);
            }
        }
    }

    async watch() {
        const config = this.config as WatchConfig;
        const watchArr = this.watchArr;

        if (!config.rules) throw new TypeError("rules required");
        // 编辑器修改保存时会触发多次change事件
        config.rules.forEach(item => {
            if (!isRuleOn(item)) return;
            item.on = debouncePromise(item.on, 50);
        });

        const fs = require("fs");
        const watch = (path) => {
            if (watchArr.indexOf(path) > -1) return;
            watchArr.push(path);
            console.log("对" + path + "文件夹添加监听\n");

            const watchCB = async (eventType: string, filename: string) => {
                if (!filename) throw new Error("文件名未提供");
                const filePath = Path.resolve(path, filename);
                this.params.log && console.log(eventType, filePath);
                // 判断是否需要监听的文件类型
                try {
                    const exist = await fs.existsSync(filePath);
                    await this.test(exist ? eventType : "delete", filePath, filename);
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
                        forEachDir(filePath, config.exclude, watch, this.params.log);
                    }
                } catch (e) {
                    console.log("watch try catch", e, filePath);
                }

            };

            const watcher = fs.watch(path, null, watchCB);

            watcher.addListener("error", function (e) {
                console.log("addListener error", e);
            });
        };

        const include = config.include;

        const includes = include ? (Array.isArray(include) ? include : [include]) : ["./"];

        for (const path of includes) {
            await forEachDir(path, config.exclude, (path, basename, isDir) => {
                if (isDir) watch(path);
            }, this.params.log);
        }
    }

    showHelp() {
        console.log(`
            -config/-c=             配置的路径
            -help/-h                帮助
            -search/-s=             搜索文件或文件夹
            -search-flag/-sf=       搜索文件或文件夹 /\\w+/flag
            -search-exclude/-se=    搜索文件或文件夹 忽略文件夹 多个用逗号(,)隔开
            -watch/-w               监听文件改变 与-config搭配使用
            -log                    遍历文件夹时是否显示遍历log
            -time/t                 显示执行代码所花费的时间
        `);
    }
}

new CommandQueue();
