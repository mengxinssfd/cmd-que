"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const getParams = require("./utils").getParams;
// tsc src/file.ts --target es2017 --module commonjs
const utils_1 = require("./utils");
const FS = require("fs");
const PATH = require("path");
class FileCli {
    constructor() {
        const params = this.params = utils_1.getParams();
        if (params.move) {
            this.move();
            return;
        }
        if (params.copy) {
            this.copy();
            return;
        }
        if (params.find) {
            this.find();
            return;
        }
        if (params.delete) {
            this.delete();
            return;
        }
    }
    getParams(key) {
        const params = this.params;
        const value = params[key];
        if (value === true)
            throw new TypeError();
        const arr = value.split(",");
        return utils_1.chunk(arr, 2);
    }
    move() {
        const list = this.getParams("move");
        list.forEach((arr) => {
            FS.renameSync(arr[0], arr[1]);
        });
    }
    copy() {
        const list = this.getParams("copy");
        list.forEach((arr) => {
            FS.copyFileSync(arr[0], arr[1]);
        });
    }
    find() {
    }
    delete() {
        const { delete: del } = this.params;
        if (del === true)
            throw new TypeError();
        const list = del.split(",");
        list.forEach((p) => {
            const stat = FS.statSync(p);
            if (stat.isDirectory()) {
                FS.rmdirSync(p, { recursive: true });
            }
            else {
                FS.rmSync(p);
            }
        });
    }
}
new FileCli();
