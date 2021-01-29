import {execute, forEachDir, getParams} from "./utils";

const Path = require("path");
const process = require("process");

interface Config {
    exclude?: RegExp[],
    test?: RegExp,
    command: string[]
}

class CommandQueue {
    private config: Config;
    private params: any;

    constructor() {
        const params = getParams();
        this.params = params;
        if (params.help || params.h) {
            this.showHelp();
            return;
        }

        if (params.search) {
            this.search();
            return;
        }

        const configPath = params.config;
        this.config = require(configPath);
        if (params.watch) {
        } else {
            if (this.config.test) {
                this.foreach();
            } else {
                this.exec();
            }
        }
    }

    foreach() {
        forEachDir("./", this.config.exclude || [], async (path, isDir) => {
            if (isDir) return;
            const test = this.config.test;
            if (!test.test(path)) return;
            await this.exec(path);
        });
    }

    search() {
        const search = this.params.search;
        if (typeof search !== "string") throw new TypeError("search");
        const reg = new RegExp(search);
        forEachDir("./", [], async (path, isDir) => {
            if (reg.test(path)) console.log("search ", path);
        });
    }

    async exec(path = "") {
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
        for (let cmd of this.config.command) {
            cmd = mapKeys.reduce((c, k) => c.replace(new RegExp(k, "g"), map[k]), String.raw`${cmd}`);
            await execute(cmd);
        }
    }

    watch() {
        // TODO
    }

    showHelp() {
        console.log(`
            -config=         配置的路径
            -help/-h         帮助
            -search=         搜索文件或文件夹
        `);
    }
}

new CommandQueue();