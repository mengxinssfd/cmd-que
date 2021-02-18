import {execute, getParams} from "../src/utils";

const args = getParams();

async function mulExec(command: string[]) {
    for (const cmd of command) {
        await execute(cmd);
    }
}

mulExec((args.command as string).split(","));