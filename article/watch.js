"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
const configFileTypes_1 = require("../src/configFileTypes");
(async function () {
    // 获取命令行参数
    const args = utils_1.getParams();
    /**
     * @param config 配置
     * @param watchedList watch列表用于遍历文件夹时判断是否已经watch过的文件夹
     */
    async function watch(config, watchedList) {
        if (!config.rules)
            throw new TypeError("rules required");
        // 编辑器修改保存时会触发多次change事件
        config.rules.forEach(item => {
            // 可能会有机器会慢一点 如果有再把间隔调大一点
            item.on = utils_1.debouncePromise(configFileTypes_1.isRuleOn(item) ? item.on : (e, p) => {
                return utils_1.mulExec(item.command, p);
            }, 1);
        });
        const FS = require("fs");
        const HandleForeach = (path) => {
            if (watchedList.indexOf(path) > -1)
                return;
            console.log("对" + path + "文件夹添加监听\n");
            const watchCB = async (eventType, filename) => {
                if (!filename)
                    throw new Error("文件名未提供");
                const filePath = Path.resolve(path, filename);
                console.log(eventType, filePath);
                // 判断是否需要监听的文件类型
                try {
                    const exist = FS.existsSync(filePath);
                    await test(exist ? eventType : "delete", filePath, filename, config.rules);
                    if (!exist) {
                        console.log(filePath, "已删除!");
                        // 删除过的需要在watchArr里面去掉，否则重新建一个相同名称的目录不会添加监听
                        const index = watchedList.indexOf(filePath);
                        if (index > -1) {
                            watchedList.splice(index, 1);
                        }
                        return;
                    }
                    // 如果是新增的目录，必须添加监听否则不能监听到该目录的文件变化
                    const stat = await FS.statSync(filePath);
                    if (stat.isDirectory()) {
                        foreach(filePath, config.exclude, HandleForeach);
                    }
                }
                catch (e) {
                    console.log("watch try catch", e, filePath);
                }
            };
            const watcher = FS.watch(path, null, watchCB);
            watchedList.push(path); // 记录已watch的
            watcher.addListener("error", function (e) {
                console.log("addListener error", e);
            });
        };
        const include = config.include;
        const includes = include ? (Array.isArray(include) ? include : [include]) : ["./"];
        for (const path of includes) {
            await foreach(path, config.exclude, (path, basename, isDir) => {
                if (isDir)
                    HandleForeach(path);
            });
        }
    }
    // 匹配正则
    async function test(eventName, path, basename, rules) {
        for (const rule of rules) {
            if (!rule.test.test(basename))
                continue;
            if (configFileTypes_1.isRuleOn(rule)) {
                await rule.on(eventName, path, Path.extname(path).substr(1), (cmd) => utils_1.executeTemplate(cmd, path));
            }
            else {
                await utils_1.mulExec(rule.command, path);
            }
        }
    }
    // 遍历文件夹
    function foreach(path, exclude = [], cb) {
        return utils_1.forEachDir(path, exclude, (path, basename, isDir) => {
            return cb(path, basename, isDir);
        });
    }
    const Path = require("path");
    const configPath = Path.resolve(process.cwd(), args.config);
    try {
        const config = require(configPath);
        // beforeStart调用
        if (config.beforeStart)
            await config.beforeStart(utils_1.executeTemplate);
        await watch(config, []);
        // beforeEnd调用
        config.beforeEnd && config.beforeEnd(utils_1.executeTemplate);
    }
    catch (e) {
        console.error("加载配置文件出错", process.cwd(), configPath);
    }
})();
