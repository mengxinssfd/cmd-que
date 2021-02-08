"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const test = "./test.cmd-que.js";
const config = require(test);
(async function () {
    const find = await utils_1.findDir("./", config.exclude, (p) => {
        const raw = String.raw `${p}`;
        // return /index\.js$/.test(raw);
        return /index\.js$/.test(raw);
    });
    console.log("find", find);
    const find2 = await utils_1.findDirBFS("./", config.exclude, (p) => {
        const raw = String.raw `${p}`;
        // return /index\.js$/.test(raw);
        return /index\.js$/.test(raw);
    });
    console.log("find2", find2);
})();
/*(async function exec() {
    const cwd = process.cwd();
    const map = {
        "\\$FileDir\\$": cwd,
        "\\$FileName\\$": "",
    };

    const mapKeys = Object.keys(map);
    for (let cmd of config.command) {
        cmd = mapKeys.reduce((c, k) => c.replace(new RegExp(k, "g"), map[k]), String.raw`${cmd}`);
        await execute(cmd);
    }
})();*/ 
