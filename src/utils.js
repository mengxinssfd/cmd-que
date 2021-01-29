"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getParams = exports.execute = exports.findDirBFS = exports.findDir = exports.forEachDir = exports.Debounce = exports.debounce = void 0;
var fs = require('fs');
var Path = require('path');
var childProcess = require('child_process');
var util = require("util");
var exec = util.promisify(childProcess.exec);
/**
 * 防抖函数
 * @param callback 回调
 * @param delay 延时
 * @returns {Function}
 */
function debounce(callback, delay) {
    var timer = null;
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = setTimeout(function () {
            timer = null;
            callback.apply(_this, args);
        }, delay);
    };
}
exports.debounce = debounce;
/**
 * 防抖装饰器
 * @param delay
 * @constructor
 */
function Debounce(delay) {
    return function (target, propertyKey, descriptor) {
        // 在babel的网站编译的是target包含key，descriptor
        if (target.descriptor) {
            descriptor = target.descriptor;
        }
        descriptor.value = debounce(descriptor.value, delay);
    };
}
exports.Debounce = Debounce;
process.on('exit', function (code) {
    console.log(code);
});
process.stdin.setEncoding('utf8');
// 控制台输入
function input(tips) {
    process.stdout.write(tips);
    return new Promise(function (res) {
        process.stdin.on('data', function (input) {
            res(input.toString().trim());
            // if ([ 'NO', 'no'].indexOf(input) > -1) process.exit(0);
        });
    });
}
/**
 * 控制台循环输入，
 * @param tips
 * @param conditionFn 若返回false则一直输入
 * @returns {Promise<*>}
 */
function inputLoop(tips, conditionFn) {
    return __awaiter(this, void 0, void 0, function () {
        var words;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, input(tips)];
                case 1:
                    words = _a.sent();
                    _a.label = 2;
                case 2: return [4 /*yield*/, conditionFn(words)];
                case 3:
                    if (!(_a.sent())) return [3 /*break*/, 0];
                    _a.label = 4;
                case 4: return [2 /*return*/, words];
            }
        });
    });
}
/**
 * 遍历文件夹
 * @param path
 * @param cb
 */
function forEachDir(path, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, isDir, isContinue, dir, _i, dir_1, d, p, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    console.log("遍历", path);
                    return [4 /*yield*/, fs.statSync(path)];
                case 1:
                    stats = _a.sent();
                    isDir = stats.isDirectory();
                    isContinue = cb(path, isDir);
                    if (!isDir || !isContinue) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fs.readdirSync(path)];
                case 2:
                    dir = _a.sent();
                    _i = 0, dir_1 = dir;
                    _a.label = 3;
                case 3:
                    if (!(_i < dir_1.length)) return [3 /*break*/, 6];
                    d = dir_1[_i];
                    p = Path.resolve(path, d);
                    return [4 /*yield*/, forEachDir(p, cb)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    e_1 = _a.sent();
                    return [2 /*return*/, Promise.reject(e_1)];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.forEachDir = forEachDir;
function findDir(path, exclude, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var v, stats, isDir, raw, isExclude, dir, _i, dir_2, d, p, rs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("findDir", path);
                    return [4 /*yield*/, cb(path)];
                case 1:
                    v = _a.sent();
                    if (v) {
                        return [2 /*return*/, path];
                    }
                    return [4 /*yield*/, fs.statSync(path)];
                case 2:
                    stats = _a.sent();
                    isDir = stats.isDirectory();
                    if (!isDir) {
                        return [2 /*return*/, null];
                    }
                    raw = String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", ""], ["", ""])), path);
                    isExclude = exclude.some(function (item) { return item.test(raw); });
                    if (isExclude) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, fs.readdirSync(path)];
                case 3:
                    dir = _a.sent();
                    _i = 0, dir_2 = dir;
                    _a.label = 4;
                case 4:
                    if (!(_i < dir_2.length)) return [3 /*break*/, 7];
                    d = dir_2[_i];
                    p = Path.resolve(path, d);
                    return [4 /*yield*/, findDir(p, exclude, cb)];
                case 5:
                    rs = _a.sent();
                    if (rs)
                        return [2 /*return*/, rs];
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, null];
            }
        });
    });
}
exports.findDir = findDir;
function findDirBFS(path, exclude, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var pathList, p, _loop_1, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pathList = [path];
                    _loop_1 = function () {
                        var v, stats, isDir, raw, isExclude, list;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log("findDirBFS", p);
                                    return [4 /*yield*/, cb(p)];
                                case 1:
                                    v = _a.sent();
                                    if (v) {
                                        return [2 /*return*/, { value: p }];
                                    }
                                    return [4 /*yield*/, fs.statSync(p)];
                                case 2:
                                    stats = _a.sent();
                                    isDir = stats.isDirectory();
                                    if (!isDir)
                                        return [2 /*return*/, "continue"];
                                    raw = String.raw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", ""], ["", ""])), p);
                                    isExclude = exclude.some(function (item) { return item.test(raw); });
                                    if (isExclude)
                                        return [2 /*return*/, "continue"];
                                    return [4 /*yield*/, fs.readdirSync(p)];
                                case 3:
                                    list = ((_a.sent()) || []).map(function (i) { return Path.resolve(p, i); });
                                    pathList.push.apply(pathList, list);
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 1;
                case 1:
                    if (!(p = pathList.shift())) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, null];
            }
        });
    });
}
exports.findDirBFS = findDirBFS;
// 不足10前面加0
function addZero(time) {
    return time > 9 ? String(time) : ('0' + time);
}
function getTime() {
    var date = new Date();
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    return addZero(h) + ":" + addZero(m) + ":" + addZero(s);
}
function execute(cmd) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log(getTime(), '执行"' + cmd + '"命令...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, exec(cmd)];
                case 2:
                    stdout = (_a.sent()).stdout;
                    console.log('\n\n*************************命令输出start*************************');
                    console.log(stdout);
                    console.log('*************************命令输出end*******************\n\n');
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    console.log('执行失败');
                    console.log('\n\n*******************************************');
                    console.log(e_2.stdout);
                    console.log('*******************************************\n\n');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.execute = execute;
function getParams() {
    return process.argv.reduce(function (obj, item) {
        return obj;
    }, {});
}
exports.getParams = getParams;
var templateObject_1, templateObject_2;
