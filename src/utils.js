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
exports.createEnumByObj = exports.isEmptyParams = exports.getParams = exports.execute = exports.findDirBFS = exports.findDir = exports.forEachDir = exports.Debounce = exports.debouncePromise = exports.debounce = exports.typeOf = void 0;
var fs = require('fs');
var Path = require('path');
var childProcess = require('child_process');
var util = require("util");
var exec = util.promisify(childProcess.exec);
// 获取数据类型
function typeOf(target) {
    var tp = typeof target;
    if (tp !== 'object')
        return tp;
    return Object.prototype.toString.call(target).slice(8, -1).toLowerCase();
}
exports.typeOf = typeOf;
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
function debouncePromise(callback, delay) {
    var timer = null;
    var rej;
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            if (timer) {
                clearTimeout(timer);
                timer = null;
                rej("debounce promise reject");
            }
            rej = reject;
            timer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            timer = null;
                            return [4 /*yield*/, callback.apply(this, args)];
                        case 1:
                            result = _a.sent();
                            resolve(result);
                            return [2 /*return*/];
                    }
                });
            }); }, delay);
        });
    };
}
exports.debouncePromise = debouncePromise;
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
    // console.log(code);
});
process.stdin.setEncoding('utf8');
/**
 * 遍历文件夹
 * @param path
 * @param exclude
 * @param cb
 * @param showLog
 */
function forEachDir(path, exclude, cb, showLog) {
    if (exclude === void 0) { exclude = []; }
    if (showLog === void 0) { showLog = false; }
    return __awaiter(this, void 0, void 0, function () {
        var stats, isDir, basename, isExclude, callback, isStop, dir, _i, dir_1, d, p, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    showLog && console.log("遍历", path);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    stats = fs.statSync(path);
                    isDir = stats.isDirectory();
                    basename = Path.basename(path);
                    isExclude = function () {
                        var raw = String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", ""], ["", ""])), path);
                        return exclude.some(function (item) { return item.test(raw); });
                    };
                    if (isDir && isExclude())
                        return [2 /*return*/];
                    callback = cb || (function (path, isDir) { return undefined; });
                    return [4 /*yield*/, callback(path, basename, isDir)];
                case 2:
                    isStop = _a.sent();
                    if (!isDir || isStop === true) {
                        return [2 /*return*/];
                    }
                    dir = fs.readdirSync(path);
                    _i = 0, dir_1 = dir;
                    _a.label = 3;
                case 3:
                    if (!(_i < dir_1.length)) return [3 /*break*/, 6];
                    d = dir_1[_i];
                    p = Path.resolve(path, d);
                    return [4 /*yield*/, forEachDir(p, exclude, cb, showLog)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    e_1 = _a.sent();
                    showLog && console.log("forEachDir error", path, e_1);
                    return [3 /*break*/, 8];
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
                    stats = fs.statSync(path);
                    isDir = stats.isDirectory();
                    if (!isDir) {
                        return [2 /*return*/, null];
                    }
                    raw = String.raw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", ""], ["", ""])), path);
                    isExclude = exclude.some(function (item) { return item.test(raw); });
                    if (isExclude) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, fs.readdirSync(path)];
                case 2:
                    dir = _a.sent();
                    _i = 0, dir_2 = dir;
                    _a.label = 3;
                case 3:
                    if (!(_i < dir_2.length)) return [3 /*break*/, 6];
                    d = dir_2[_i];
                    p = Path.resolve(path, d);
                    return [4 /*yield*/, findDir(p, exclude, cb)];
                case 4:
                    rs = _a.sent();
                    if (rs)
                        return [2 /*return*/, rs];
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, null];
            }
        });
    });
}
exports.findDir = findDir;
function findDirBFS(path, exclude, cb) {
    return __awaiter(this, void 0, void 0, function () {
        var pathList, _loop_1, state_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pathList = [path];
                    _loop_1 = function () {
                        var p, v, stats, isDir, raw, isExclude, list;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    p = pathList.shift();
                                    console.log("findDirBFS", p);
                                    return [4 /*yield*/, cb(p)];
                                case 1:
                                    v = _a.sent();
                                    if (v) {
                                        return [2 /*return*/, { value: p }];
                                    }
                                    stats = fs.statSync(p);
                                    isDir = stats.isDirectory();
                                    if (!isDir)
                                        return [2 /*return*/, "continue"];
                                    raw = String.raw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", ""], ["", ""])), p);
                                    isExclude = exclude.some(function (item) { return item.test(raw); });
                                    if (isExclude)
                                        return [2 /*return*/, "continue"];
                                    list = (fs.readdirSync(p) || []).map(function (i) { return Path.resolve(p, i); });
                                    pathList.push.apply(pathList, list);
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _a.label = 1;
                case 1:
                    if (!pathList.length) return [3 /*break*/, 3];
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
                    console.log('success!');
                    // console.log('\n\n*************************命令输出start*************************');
                    console.log(stdout);
                    // console.log('*************************命令输出end*******************\n\n');
                    return [2 /*return*/, stdout];
                case 3:
                    e_2 = _a.sent();
                    console.log('执行失败');
                    console.log('\n\n*******************************************');
                    console.log(e_2);
                    console.log('*******************************************\n\n');
                    return [2 /*return*/, e_2.stderr];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.execute = execute;
/**
 * 获取命令行的参数
 * @param prefix 前缀
 */
function getParams(prefix) {
    if (prefix === void 0) { prefix = "-"; }
    return process.argv.slice(2).reduce(function (obj, it) {
        var sp = it.split("=");
        var key = sp[0].replace(prefix, "");
        obj[key] = sp[1] || true; // "",undefined,"string";前两个会转为true
        return obj;
    }, {});
}
exports.getParams = getParams;
function isEmptyParams() {
    return process.argv.length < 3;
}
exports.isEmptyParams = isEmptyParams;
function createEnumByObj(obj) {
    var res = {};
    for (var k in obj) {
        if (res.hasOwnProperty(k))
            throw new Error("key multiple");
        res[res[k] = obj[k]] = k;
    }
    Object.freeze(res); // freeze值不可变
    return res;
}
exports.createEnumByObj = createEnumByObj;
var templateObject_1, templateObject_2, templateObject_3;
