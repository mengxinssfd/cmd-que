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
    Abb["open"] = "o";
    Abb["open-type"] = "ot";
})(Abb || (Abb = {}));
var paramsAbb = utils_1.createEnumByObj(Abb);
var CommandQueue = /** @class */ (function () {
    function CommandQueue() {
        var _this = this;
        this.watchArr = [];
        this.params = utils_1.getParams();
        var time = this.getParamsValue(Abb.time);
        time && console.time("time");
        this.init()["finally"](function () {
            // watch模式下beforeEnd为第一次遍历完后的回调
            _this.config && _this.config.beforeEnd && _this.config.beforeEnd(_this.exec);
            time && console.timeEnd("time");
        });
    }
    CommandQueue.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cmd, command, cp, configPath;
            return __generator(this, function (_a) {
                if (utils_1.isEmptyParams() || this.getParamsValue(Abb.help)) {
                    return [2 /*return*/, CommandQueue.showHelp()];
                }
                if (this.getParamsValue(Abb.search)) {
                    return [2 /*return*/, this.search()];
                }
                if (this.getParamsValue(Abb.open)) {
                    return [2 /*return*/, this.open()];
                }
                cmd = this.getParamsValue(Abb.command);
                if (cmd) {
                    if (cmd === true) {
                        throw new TypeError();
                    }
                    command = cmd.split(",");
                    return [2 /*return*/, this.mulExec(command)];
                }
                cp = this.getParamsValue(Abb.config);
                configPath = Path.resolve(process.cwd(), cp);
                try {
                    this.config = require(configPath);
                }
                catch (e) {
                    console.error("加载配置文件出错", process.cwd(), configPath);
                    return [2 /*return*/];
                }
                this.config.beforeStart && this.config.beforeStart(this.exec);
                if (this.getParamsValue(Abb.watch)) {
                    return [2 /*return*/, this.watch()];
                }
                else {
                    if (this.config.rules) {
                        return [2 /*return*/, this.testRules()];
                    }
                    else {
                        return [2 /*return*/, this.mulExec(this.config.command)];
                    }
                }
                return [2 /*return*/];
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
    CommandQueue.prototype.search = function () {
        var search = this.getParamsValue(Abb.search);
        var flag = this.getParamsValue(Abb["search-flag"]);
        var se = this.getParamsValue(Abb["search-exclude"]);
        if (search === true || search === undefined || flag === true || se === true) {
            throw new TypeError();
        }
        var reg = new RegExp(search, flag);
        console.log("search", reg);
        var exclude = se === null || se === void 0 ? void 0 : se.split(",").filter(function (i) { return i; }).map(function (i) { return new RegExp(i); });
        return this.foreach("./", exclude, function (path, basename) {
            if (reg.test(basename))
                console.log("result ", path);
        });
    };
    CommandQueue.prototype.exec = function (command, path) {
        if (path === void 0) { path = ""; }
        var cwd = process.cwd();
        path = path || cwd;
        var basename = Path.basename(path);
        var map = {
            "\\$FilePath\\$": path,
            "\\$FileNameWithoutExtension\\$": basename.split(".").slice(0, -1).join("."),
            "\\$FileNameWithoutAllExtensions\\$": basename.split(".")[0],
            "\\$FileDir\\$": Path.dirname(path),
            "\\$Cwd\\$": cwd,
            "\\$SourceFileDir\\$": __dirname
        };
        var mapKeys = Object.keys(map);
        command = mapKeys.reduce(function (c, k) { return c.replace(new RegExp(k, "g"), map[k]); }, String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", ""], ["", ""])), command));
        return utils_1.execute(command);
    };
    ;
    CommandQueue.prototype.mulExec = function (command, path) {
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
                        return [4 /*yield*/, this.exec(cmd, path)];
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
    CommandQueue.prototype.test = function (eventName, path, basename) {
        return __awaiter(this, void 0, void 0, function () {
            var rules, _i, rules_1, rule;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rules = this.config.rules;
                        if (!rules)
                            return [2 /*return*/];
                        _i = 0, rules_1 = rules;
                        _a.label = 1;
                    case 1:
                        if (!(_i < rules_1.length)) return [3 /*break*/, 6];
                        rule = rules_1[_i];
                        if (!rule.test.test(basename))
                            return [3 /*break*/, 5];
                        if (!configFileTypes_1.isRuleOn(rule)) return [3 /*break*/, 3];
                        return [4 /*yield*/, rule.on(eventName, path, Path.extname(path).substr(1), function (cmd) { return _this.exec(cmd, path); })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.mulExec(rule.command, path)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
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
            var config, watchArr, FS, watch, include, includes, _i, includes_2, path;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = this.config;
                        watchArr = this.watchArr;
                        if (!config.rules)
                            throw new TypeError("rules required");
                        // 编辑器修改保存时会触发多次change事件
                        config.rules.forEach(function (item) {
                            // 可能会有机器会慢一点 如果有再把间隔调大一点
                            item.on = utils_1.debouncePromise(configFileTypes_1.isRuleOn(item) ? item.on : function (e, p) {
                                return _this.mulExec(item.command, p);
                            }, 1);
                        });
                        FS = require("fs");
                        watch = function (path) {
                            if (watchArr.indexOf(path) > -1)
                                return;
                            watchArr.push(path);
                            console.log("对" + path + "文件夹添加监听\n");
                            var watchCB = function (eventType, filename) { return __awaiter(_this, void 0, void 0, function () {
                                var filePath, exist, index, stat, e_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!filename)
                                                throw new Error("文件名未提供");
                                            filePath = Path.resolve(path, filename);
                                            this.params.log && console.log(eventType, filePath);
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 5, , 6]);
                                            return [4 /*yield*/, FS.existsSync(filePath)];
                                        case 2:
                                            exist = _a.sent();
                                            return [4 /*yield*/, this.test(exist ? eventType : "delete", filePath, filename)];
                                        case 3:
                                            _a.sent();
                                            if (!exist) {
                                                this.params.log && console.log(filePath, "已删除!");
                                                index = watchArr.indexOf(filePath);
                                                if (index > -1) {
                                                    watchArr.splice(index, 1);
                                                }
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, FS.statSync(filePath)];
                                        case 4:
                                            stat = _a.sent();
                                            if (stat.isDirectory()) {
                                                this.foreach(filePath, config.exclude, watch);
                                            }
                                            return [3 /*break*/, 6];
                                        case 5:
                                            e_1 = _a.sent();
                                            this.params.log && console.log("watch try catch", e_1, filePath);
                                            return [3 /*break*/, 6];
                                        case 6: return [2 /*return*/];
                                    }
                                });
                            }); };
                            var watcher = FS.watch(path, null, watchCB);
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
        console.log("\n            -config/-c=             \u914D\u7F6E\u7684\u8DEF\u5F84\n            -help/-h                \u5E2E\u52A9\n            -search/-s=             \u641C\u7D22\u6587\u4EF6\u6216\u6587\u4EF6\u5939\n            -search-flag/-sf=       \u641C\u7D22\u6587\u4EF6\u6216\u6587\u4EF6\u5939 /\\w+/flag\n            -search-exclude/-se=    \u641C\u7D22\u6587\u4EF6\u6216\u6587\u4EF6\u5939 \u5FFD\u7565\u6587\u4EF6\u5939 \u591A\u4E2A\u7528\u9017\u53F7(,)\u9694\u5F00\n            -open/-o=               \u6253\u5F00\u8D44\u6E90\u7BA1\u7406\u5668\u5E76\u9009\u4E2D\u6587\u4EF6\u6216\u6587\u4EF6\u5939\n            -open-type/-ot=               \u6253\u5F00\u8D44\u6E90\u7BA1\u7406\u5668\u5E76\u9009\u4E2D\u6587\u4EF6\u6216\u6587\u4EF6\u5939\n            -watch/-w               \u76D1\u542C\u6587\u4EF6\u6539\u53D8 \u4E0E-config\u642D\u914D\u4F7F\u7528\n            -log                    \u904D\u5386\u6587\u4EF6\u5939\u65F6\u662F\u5426\u663E\u793A\u904D\u5386log\n            -time/t                 \u663E\u793A\u6267\u884C\u4EE3\u7801\u6240\u82B1\u8D39\u7684\u65F6\u95F4\n            -command/-cmd=          \u901A\u8FC7\u547D\u4EE4\u884C\u6267\u884C\u547D\u4EE4 \u591A\u4E2A\u5219\u7528\u9017\u53F7(,)\u9694\u5F00 \u5FC5\u987B\u8981\u7528\u5F15\u53F7\u5F15\u8D77\u6765\n        ");
    };
    // 好处：普通的命令不能打开./
    CommandQueue.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var OpenTypes, open, path, stat, isDir, ot, type, spawnSync, match, exec;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (function (OpenTypes) {
                            OpenTypes["select"] = "select";
                            OpenTypes["cmd"] = "cmd";
                            OpenTypes["run"] = "run";
                        })(OpenTypes || (OpenTypes = {}));
                        open = this.getParamsValue(Abb.open);
                        path = Path.resolve(process.cwd(), open === true ? "./" : open);
                        return [4 /*yield*/, require("fs").statSync(path)];
                    case 1:
                        stat = _b.sent();
                        isDir = stat.isDirectory();
                        ot = this.getParamsValue(Abb["open-type"]);
                        type = !ot || ot === true ? OpenTypes.select : ot;
                        spawnSync = require('child_process').spawnSync;
                        match = (_a = {},
                            // 运行一次就会打开一个资源管理器，不能只打开一个相同的
                            _a[OpenTypes.select] = ["explorer", ["/select,\"" + path + "\""]],
                            _a[OpenTypes.run] = ['start', [path]],
                            _a[OpenTypes.cmd] = ["start", ["cmd", "/k", "\"cd " + (isDir ? path : Path.dirname(path)) + "\""]],
                            _a);
                        exec = function (_a) {
                            var command = _a[0], path = _a[1];
                            return spawnSync(command, path, { shell: true });
                        };
                        console.log(path);
                        exec(match[type] || match[OpenTypes.select]);
                        return [2 /*return*/];
                }
            });
        });
    };
    return CommandQueue;
}());
exports.CommandQueue = CommandQueue;
var templateObject_1;
