import {findDir, findDirBFS, forEachDir} from "./utils";

const test = "./test.cmd-que.js";
const config = require(test);
const process = require("process");

function watch() {
    forEachDir("./", function (p, d) {
        if (!config) return true;
        const raw = String.raw`${p}`;
        return (config.exclude || []).every((item) => !item.test(raw));
    });
}


console.log(process.cwd(), __dirname);


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

if (process.argv.some(item => ["-h", "-help"].includes(item))) {
    console.log(`
        -config   设置所在路径
    `)
}

