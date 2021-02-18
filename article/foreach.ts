import {getParams, mulExec, forEachDir, executeTemplate} from "../src/utils";
import {isRuleOn, Rules} from "../src/configFileTypes";


(async function () {

    // 获取命令行参数
    const args = getParams();


    // 匹配正则
    async function test(eventName: string, path: string, basename: string, rules: Rules = []) {
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

    // 遍历文件夹
    function foreach(
        path: string,
        exclude: RegExp[] = [],
        cb: (path: string, basename: string, isDir: boolean) => true | void | Promise<true | void>,
    ) {
        return forEachDir(path, exclude, (path: string, basename: string, isDir: boolean) => {
            return cb(path, basename, isDir);
        });
    }

    const Path = require("path");
    const configPath = Path.resolve(process.cwd(), args.config);
    try {
        const config = require(configPath);
        // beforeStart调用
        if (config.beforeStart) await config.beforeStart(executeTemplate);
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
        config.beforeEnd && config.beforeEnd(executeTemplate);
    } catch (e) {
        console.error("加载配置文件出错", process.cwd(), configPath);
    }
})();
