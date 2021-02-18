import {execute, getParams} from "../src/utils";

const args = getParams();
execute(args.command as string);