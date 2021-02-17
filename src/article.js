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
var utils_1 = require("./utils");
var childProcess = require('child_process');
var util = require("util");
var exec = util.promisify(childProcess.exec);
(function () {
    return __awaiter(this, void 0, void 0, function () {
        function mulExec(command) {
            return __awaiter(this, void 0, void 0, function () {
                var _i, command_1, cmd;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, command_1 = command;
                            _a.label = 1;
                        case 1:
                            if (!(_i < command_1.length)) return [3 /*break*/, 4];
                            cmd = command_1[_i];
                            return [4 /*yield*/, utils_1.execute(cmd)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        function forEachDir(path, exclude, cb) {
            if (exclude === void 0) { exclude = []; }
            return __awaiter(this, void 0, void 0, function () {
                var stats, isDir, basename, isExclude, callback, isStop, dir, _i, dir_1, d, p, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 8, , 9]);
                            return [4 /*yield*/, fs.statSync(path)];
                        case 1:
                            stats = _a.sent();
                            isDir = stats.isDirectory();
                            basename = Path.basename(path);
                            isExclude = function () {
                                var raw = String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", ""], ["", ""])), path); // 路径必须raw，否则正则匹配不上
                                return exclude.some(function (item) { return item.test(raw); }); // 判断该路径是否是忽略的
                            };
                            if (isDir && isExclude())
                                return [2 /*return*/];
                            callback = cb || (function (path, isDir) { return undefined; });
                            return [4 /*yield*/, callback(path, basename, isDir)];
                        case 2:
                            isStop = _a.sent();
                            if (!isDir || isStop) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, fs.readdirSync(path)];
                        case 3:
                            dir = _a.sent();
                            _i = 0, dir_1 = dir;
                            _a.label = 4;
                        case 4:
                            if (!(_i < dir_1.length)) return [3 /*break*/, 7];
                            d = dir_1[_i];
                            p = Path.resolve(path, d);
                            return [4 /*yield*/, forEachDir(p, exclude, cb)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            _i++;
                            return [3 /*break*/, 4];
                        case 7: return [3 /*break*/, 9];
                        case 8:
                            e_1 = _a.sent();
                            return [2 /*return*/, Promise.reject(e_1)];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        }
        var args, fs, Path;
        return __generator(this, function (_a) {
            args = utils_1.getParams();
            mulExec(args.command.split(","));
            return [2 /*return*/];
        });
    });
})();
var templateObject_1;
