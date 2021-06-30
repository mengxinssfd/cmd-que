import {
    createEnumByObj,
    debouncePromise,
    executeTemplate,
    forEachDir,
    getParams,
    isEmptyParams,
    mulExec,
} from "./utils";
import {createObj} from "@mxssfd/ts-utils/lib-cjs/object"
import {WatchConfig, ExecCmdConfig, isRuleOn, RuleOn} from "./configFileTypes";

const Path = require("path");
const process = require("process");

// 指令全写对应的缩写
enum Abb {
    config = "c",
    search = "s",
    "search-flag" = "sf",
    "search-exclude" = "se",
    watch = "w",
    help = "h",
    time = "t",
    command = "cmd",
}

const paramsAbb = createEnumByObj(Abb);

export class CommandQueue {
    private readonly params: { [k: string]: string | true };
    private config!: ExecCmdConfig | WatchConfig;
    private watchedList: string[] = [];

    constructor() {
        this.params = createObj(Array.from(getParams().entries()));
        const time = this.getParamsValue(Abb.time);
        time && console.time("time");
        this.init().finally(() => {
            // watch模式下beforeEnd为第一次遍历完后的回调
            this.config && this.config.beforeEnd && this.config.beforeEnd(executeTemplate);
            time && console.timeEnd("time");
        });
    }

    private async init() {
        if (isEmptyParams() || this.getParamsValue(Abb.help)) {
            return CommandQueue.showHelp();
        }

        const cmd = this.getParamsValue(Abb.command);

        if (cmd) {
            if (cmd === true) {
                throw new TypeError();
            }
            const command = cmd.split(",");
            return mulExec(command);
        }

        const cp = this.getParamsValue(Abb.config);
        const configPath = Path.resolve(process.cwd(), cp);
        try {
            this.config = require(configPath);
            if (this.config.beforeStart) await this.config.beforeStart(executeTemplate);
        } catch (e) {
            console.error("加载配置文件出错", process.cwd(), configPath);
            return;
        }
        if (this.getParamsValue(Abb.watch)) {
            return this.watch();
        } else {
            if ((this.config as WatchConfig).rules) {
                return this.testRules();
            } else {
                return mulExec((this.config as ExecCmdConfig).command);
            }
        }

    }

    private getParamsValue<T>(key: Abb): string | true | undefined {
        const pAbb: any = paramsAbb;
        const params = this.params;
        return params[key] || params[pAbb[key]];
    }

    private async testRules() {
        const config = this.config as WatchConfig;
        const include = config.include;
        const includes = include ? (Array.isArray(include) ? include : [include]) : ["./"];
        for (const path of includes) {
            await this.foreach(path, config.exclude, (path, basename) => {
                return this.test("", path, basename);
            });
        }
    }

    private foreach(
        path: string,
        exclude: RegExp[] = [],
        cb: (path: string, basename: string, isDir: boolean) => true | void | Promise<true | void>,
    ) {
        return forEachDir(path, exclude, (path: string, basename: string, isDir: boolean) => {
            return cb(path, basename, isDir);
        }, Boolean(this.params.log)); // 有可能会输入-log=*
    }


    private async test(eventName: string, path: string, basename: string) {
        const rules = (this.config as WatchConfig).rules ?? [];
        for (const rule of rules) {
            if (!rule.test.test(basename)) continue;
            if (isRuleOn(rule)) {
                await rule.on(
                    eventName,
                    path,
                    Path.extname(path).substr(1),
                    (cmd: string) => executeTemplate(cmd, path),
                );
            } else {
                await mulExec(rule.command, path);
            }
        }
    }

    private async watch() {
        const config = this.config as WatchConfig;
        const watchedList = this.watchedList;

        if (!config.rules) throw new TypeError("rules required");
        // 编辑器修改保存时会触发多次change事件
        config.rules.forEach(item => {
            // 可能会有机器会慢一点 如果有再把间隔调大一点
            (item as RuleOn).on = debouncePromise(isRuleOn(item) ? item.on : (e, p) => {
                return mulExec(item.command, p);
            }, 1);
        });

        const FS = require("fs");
        const watch = (path: string) => {
            if (watchedList.indexOf(path) > -1) return;
            console.log("对" + path + "文件夹添加监听\n");

            const watchCB = async (eventType: string, filename: string) => {
                if (!filename) throw new Error("文件名未提供");
                const filePath = Path.resolve(path, filename);
                this.params.log && console.log(eventType, filePath);
                // 判断是否需要监听的文件类型
                try {
                    const exist = FS.existsSync(filePath);
                    await this.test(exist ? eventType : "delete", filePath, filename);
                    if (!exist) {
                        this.params.log && console.log(filePath, "已删除!");
                        // 删除过的需要在watchArr里面去掉，否则重新建一个相同名称的目录不会添加监听
                        const index = watchedList.indexOf(filePath);
                        if (index > -1) {
                            watchedList.splice(index, 1);
                        }
                        return;
                    }
                    // 如果是新增的目录，必须添加监听否则不能监听到该目录的文件变化
                    const stat = FS.statSync(filePath);
                    if (stat.isDirectory()) {
                        this.foreach(filePath, config.exclude, watch);
                    }
                } catch (e) {
                    this.params.log && console.log("watch try catch", e, filePath);
                }

            };

            const watcher = FS.watch(path, null, watchCB);
            watchedList.push(path); // 记录到已watch列表中

            watcher.addListener("error", function (e: any) {
                console.log("addListener error", e);
            });
        };

        const include = config.include;

        const includes = include ? (Array.isArray(include) ? include : [include]) : ["./"];

        for (const path of includes) {
            await this.foreach(path, config.exclude, (path, basename, isDir) => {
                if (isDir) watch(path);
            });
        }
    }

    private static showHelp() {
        console.log(`
            -config/-c=             配置的路径
            -help/-h                帮助
            -watch/-w               监听文件改变 与-config搭配使用
            -log                    遍历文件夹时是否显示遍历log
            -time/t                 显示执行代码所花费的时间
            -command/-cmd=          通过命令行执行命令 多个则用逗号(,)隔开 必须要用引号引起来
        `);
    }


}