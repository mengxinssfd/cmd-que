"use strict";
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
exports.CommandQueue = void 0;
var utils_1 = require("./utils");
var configFileTypes_1 = require("./configFileTypes");
var Path = require("path");
var process = require("process");
// 指令全写对应的缩写
var Abb;
(function (Abb) {
    Abb["config"] = "c";
    Abb["search"] = "s";
    Abb["search-flag"] = "sf";
    Abb["search-exclude"] = "se";
    Abb["watch"] = "w";
    Abb["help"] = "h";
    Abb["time"] = "t";
    Abb["command"] = "cmd";
})(Abb || (Abb = {}));
var paramsAbb = utils_1.createEnumByObj(Abb);
var CommandQueue = /** @class */ (function () {
    function CommandQueue() {
        var _this = this;
        this.watchedList = [];
        this.params = utils_1.createObj(Array.from(utils_1.getParams().entries()));
        var time = this.getParamsValue(Abb.time);
        time && console.time("time");
        this.init()["finally"](function () {
            // watch模式下beforeEnd为第一次遍历完后的回调
            _this.config && _this.config.beforeEnd && _this.config.beforeEnd(utils_1.executeTemplate);
            time && console.timeEnd("time");
        });
    }
    CommandQueue.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cmd, command, cp, configPath, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (utils_1.isEmptyParams() || this.getParamsValue(Abb.help)) {
                            return [2 /*return*/, CommandQueue.showHelp()];
                        }
                        cmd = this.getParamsValue(Abb.command);
                        if (cmd) {
                            if (cmd === true) {
                                throw new TypeError();
                            }
                            command = cmd.split(",");
                            return [2 /*return*/, utils_1.mulExec(command)];
                        }
                        cp = this.getParamsValue(Abb.config);
                        configPath = Path.resolve(process.cwd(), cp);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        this.config = require(configPath);
                        if (!this.config.beforeStart) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.config.beforeStart(utils_1.executeTemplate)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        e_1 = _a.sent();
                        console.error("加载配置文件出错", process.cwd(), configPath);
                        return [2 /*return*/];
                    case 5:
                        if (this.getParamsValue(Abb.watch)) {
                            return [2 /*return*/, this.watch()];
                        }
                        else {
                            if (this.config.rules) {
                                return [2 /*return*/, this.testRules()];
                            }
                            else {
                                return [2 /*return*/, utils_1.mulExec(this.config.command)];
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    CommandQueue.prototype.getParamsValue = function (key) {
        var pAbb = paramsAbb;
        var params = this.params;
        return params[key] || params[pAbb[key]];
    };
    CommandQueue.prototype.testRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, include, includes, _i, includes_1, path;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = this.config;
                        include = config.include;
                        includes = include ? (Array.isArray(include) ? include : [include]) : ["./"];
                        _i = 0, includes_1 = includes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < includes_1.length)) return [3 /*break*/, 4];
                        path = includes_1[_i];
                        return [4 /*yield*/, this.foreach(path, config.exclude, function (path, basename) {
                                return _this.test("", path, basename);
                            })];
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
    };
    CommandQueue.prototype.foreach = function (path, exclude, cb) {
        if (exclude === void 0) { exclude = []; }
        return utils_1.forEachDir(path, exclude, function (path, basename, isDir) {
            return cb(path, basename, isDir);
        }, Boolean(this.params.log)); // 有可能会输入-log=*
    };
    CommandQueue.prototype.test = function (eventName, path, basename) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var rules, _i, rules_1, rule;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        rules = (_a = this.config.rules) !== null && _a !== void 0 ? _a : [];
                        _i = 0, rules_1 = rules;
                        _b.label = 1;
                    case 1:
                        if (!(_i < rules_1.length)) return [3 /*break*/, 6];
                        rule = rules_1[_i];
                        if (!rule.test.test(basename))
                            return [3 /*break*/, 5];
                        if (!configFileTypes_1.isRuleOn(rule)) return [3 /*break*/, 3];
                        return [4 /*yield*/, rule.on(eventName, path, Path.extname(path).substr(1), function (cmd) { return utils_1.executeTemplate(cmd, path); })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, utils_1.mulExec(rule.command, path)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    CommandQueue.prototype.watch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, watchedList, FS, watch, include, includes, _i, includes_2, path;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = this.config;
                        watchedList = this.watchedList;
                        if (!config.rules)
                            throw new TypeError("rules required");
                        // 编辑器修改保存时会触发多次change事件
                        config.rules.forEach(function (item) {
                            // 可能会有机器会慢一点 如果有再把间隔调大一点
                            item.on = utils_1.debouncePromise(configFileTypes_1.isRuleOn(item) ? item.on : function (e, p) {
                                return utils_1.mulExec(item.command, p);
                            }, 1);
                        });
                        FS = require("fs");
                        watch = function (path) {
                            if (watchedList.indexOf(path) > -1)
                                return;
                            console.log("对" + path + "文件夹添加监听\n");
                            var watchCB = function (eventType, filename) { return __awaiter(_this, void 0, void 0, function () {
                                var filePath, exist, index, stat, e_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!filename)
                                                throw new Error("文件名未提供");
                                            filePath = Path.resolve(path, filename);
                                            this.params.log && console.log(eventType, filePath);
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 3, , 4]);
                                            exist = FS.existsSync(filePath);
                                            return [4 /*yield*/, this.test(exist ? eventType : "delete", filePath, filename)];
                                        case 2:
                                            _a.sent();
                                            if (!exist) {
                                                this.params.log && console.log(filePath, "已删除!");
                                                index = watchedList.indexOf(filePath);
                                                if (index > -1) {
                                                    watchedList.splice(index, 1);
                                                }
                                                return [2 /*return*/];
                                            }
                                            stat = FS.statSync(filePath);
                                            if (stat.isDirectory()) {
                                                this.foreach(filePath, config.exclude, watch);
                                            }
                                            return [3 /*break*/, 4];
                                        case 3:
                                            e_2 = _a.sent();
                                            this.params.log && console.log("watch try catch", e_2, filePath);
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); };
                            var watcher = FS.watch(path, null, watchCB);
                            watchedList.push(path); // 记录到已watch列表中
                            watcher.addListener("error", function (e) {
                                console.log("addListener error", e);
                            });
                        };
                        include = config.include;
                        includes = include ? (Array.isArray(include) ? include : [include]) : ["./"];
                        _i = 0, includes_2 = includes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < includes_2.length)) return [3 /*break*/, 4];
                        path = includes_2[_i];
                        return [4 /*yield*/, this.foreach(path, config.exclude, function (path, basename, isDir) {
                                if (isDir)
                                    watch(path);
                            })];
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
    };
    CommandQueue.showHelp = function () {
        console.log("\n            -config/-c=             \u914D\u7F6E\u7684\u8DEF\u5F84\n            -help/-h                \u5E2E\u52A9\n            -watch/-w               \u76D1\u542C\u6587\u4EF6\u6539\u53D8 \u4E0E-config\u642D\u914D\u4F7F\u7528\n            -log                    \u904D\u5386\u6587\u4EF6\u5939\u65F6\u662F\u5426\u663E\u793A\u904D\u5386log\n            -time/t                 \u663E\u793A\u6267\u884C\u4EE3\u7801\u6240\u82B1\u8D39\u7684\u65F6\u95F4\n            -command/-cmd=          \u901A\u8FC7\u547D\u4EE4\u884C\u6267\u884C\u547D\u4EE4 \u591A\u4E2A\u5219\u7528\u9017\u53F7(,)\u9694\u5F00 \u5FC5\u987B\u8981\u7528\u5F15\u53F7\u5F15\u8D77\u6765\n        ");
    };
    return CommandQueue;
}());
exports.CommandQueue = CommandQueue;
