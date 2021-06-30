"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
const configFileTypes_1 = require("../src/configFileTypes");
(async function () {
    // 获取命令行参数
    const args = utils_1.getParams();
    // 匹配正则
    async function test(eventName, path, basename, rules = []) {
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
        const include = config.include;
        // 设置默认路径为命令启动所在路径
        const includes = include ? (Array.isArray(include) ? include : [include]) : ["./"];
        const rules = config.rules;
        for (const path of includes) {
            await foreach(path, config.exclude, (path, basename) => {
                return test("", path, basename, rules);
            });
        }
        // beforeEnd调用
        config.beforeEnd && config.beforeEnd(utils_1.executeTemplate);
    }
    catch (e) {
        console.error("加载配置文件出错", process.cwd(), configPath);
    }
})();
