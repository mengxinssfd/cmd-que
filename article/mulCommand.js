"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../src/utils");
const args = utils_1.getParams();
async function mulExec(command) {
    for (const cmd of command) {
        await utils_1.execute(cmd);
    }
}
mulExec(args.command.split(","));
