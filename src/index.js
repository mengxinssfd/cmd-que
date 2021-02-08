"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var Path = require("path");
var process = require("process");
var abb = {
    c: "config",
    s: "search",
    sf: "search-flag",
    se: "search-exclude",
    w: "watch",
    h: "help",
    t: "time",
};
var paramsAbb = utils_1.createEnumByObj(abb);
var CommandQueue = /** @class */ (function () {
    function CommandQueue() {
        var _this = this;
        this.watchArr = [];
        this.on = function (path) {
            var on = _this.config.on || (function () { return Promise.resolve(); });
            var ext = Path.extname(path).substr(1);
            return on(path, ext, _this.exec);
        };
        this.params = utils_1.getParams();
        var time = this.getParamsValue("t");
        time && console.time("time");
        this.init().finally(function () { return time && console.timeEnd("time"); });
    }
    CommandQueue.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cp, configPath;
            return __generator(this, function (_a) {
                if (utils_1.isEmptyParams() || this.getParamsValue("h")) {
                    return [2 /*return*/, this.showHelp()];
                }
                if (this.getParamsValue("s")) {
                    return [2 /*return*/, this.search()];
                }
                cp = this.getParamsValue("c");
                configPath = Path.resolve(process.cwd(), cp);
                try {
                    this.config = require(configPath);
                }
                catch (e) {
                    console.error("加载配置文件出错", process.cwd(), configPath);
                    return [2 /*return*/];
                }
                if (this.getParamsValue("w")) {
                    return [2 /*return*/, this.watch()];
                }
                else {
                    if (this.config.test) {
                        return [2 /*return*/, this.foreach()];
                    }
                    else {
                        return [2 /*return*/, this.mulExec()];
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
    CommandQueue.prototype.foreach = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, on, test, _loop_1, this_1, _i, test_1, reg;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = this.config;
                        on = config.on ? this.on : this.mulExec;
                        test = Array.isArray(config.test) ? config.test : [config.test];
                        _loop_1 = function (reg) {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, utils_1.forEachDir("./", config.exclude || [], function (path, basename, isDir) { return __awaiter(_this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (isDir)
                                                            return [2 /*return*/];
                                                        if (!reg.test(basename))
                                                            return [2 /*return*/];
                                                        return [4 /*yield*/, on(path)];
                                                    case 1:
                                                        _a.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        }); }, this_1.params.log)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, test_1 = test;
                        _a.label = 1;
                    case 1:
                        if (!(_i < test_1.length)) return [3 /*break*/, 4];
                        reg = test_1[_i];
                        return [5 /*yield**/, _loop_1(reg)];
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
    CommandQueue.prototype.search = function () {
        var _a;
        var search = this.getParamsValue("s");
        var flag = this.getParamsValue("sf");
        if (typeof search !== "string")
            throw new TypeError("search");
        var reg = new RegExp(search, flag);
        console.log("search", reg);
        var exclude = (_a = this.getParamsValue("se")) === null || _a === void 0 ? void 0 : _a.split(",").filter(function (i) { return i; }).map(function (i) { return new RegExp(i); });
        return utils_1.forEachDir("./", exclude || [], function (path, basename) {
            if (reg.test(basename))
                console.log("result ", path);
        }, this.params.log);
    };
    CommandQueue.prototype.exec = function (command, path) {
        if (path === void 0) { path = ""; }
        var cwd = process.cwd();
        var basename = Path.basename(path);
        var map = {
            "\\$FilePath\\$": path,
            "\\$FileNameWithoutExtension\\$": basename.split(".").slice(0, -1).join("."),
            "\\$FileNameWithoutAllExtensions\\$": basename.split(".")[0],
            "\\$FileDir\\$": path ? Path.dirname(path) : cwd,
            "\\$CmdDir\\$": cwd,
            "\\$SourceFileDir\\$": __dirname,
        };
        var mapKeys = Object.keys(map);
        command = mapKeys.reduce(function (c, k) { return c.replace(new RegExp(k, "g"), map[k]); }, String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", ""], ["", ""])), command));
        return utils_1.execute(command);
    };
    ;
    CommandQueue.prototype.mulExec = function (path) {
        if (path === void 0) { path = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, cmd;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = this.config.command;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        cmd = _a[_i];
                        return [4 /*yield*/, this.exec(cmd, path)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CommandQueue.prototype.dbOn = function (path) {
        this.on(path);
    };
    ;
    CommandQueue.prototype.watch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, watchArr, fs, watch, include, includes, _i, includes_1, path;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = this.config;
                        watchArr = this.watchArr;
                        if (utils_1.typeOf(config.on) !== "function")
                            throw new TypeError("on required");
                        if (utils_1.typeOf(config.test) !== "regexp")
                            throw new TypeError("test required");
                        fs = require("fs");
                        watch = function (path) {
                            if (watchArr.indexOf(path) > -1)
                                return;
                            watchArr.push(path);
                            console.log("对" + path + "文件夹添加监听\n");
                            var watchCB = function (e, f) { return __awaiter(_this, void 0, void 0, function () {
                                var filePath, exist, index, stat, e_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!f)
                                                throw new Error("文件名未提供");
                                            filePath = Path.resolve(path, f);
                                            // 判断是否需要监听的文件类型
                                            if (!config.test.test(String.raw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", ""], ["", ""])), f)))
                                                return [2 /*return*/];
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 4, , 5]);
                                            return [4 /*yield*/, fs.existsSync(filePath)];
                                        case 2:
                                            exist = _a.sent();
                                            if (!exist) {
                                                console.log(filePath, "已删除!");
                                                index = watchArr.indexOf(filePath);
                                                if (index > -1) {
                                                    watchArr.splice(index, 1);
                                                }
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, fs.statSync(filePath)];
                                        case 3:
                                            stat = _a.sent();
                                            if (stat.isDirectory()) {
                                                utils_1.forEachDir(filePath, config.exclude, watch, this.params.log);
                                            }
                                            return [3 /*break*/, 5];
                                        case 4:
                                            e_1 = _a.sent();
                                            console.log("watch try catch", e_1, filePath);
                                            return [3 /*break*/, 5];
                                        case 5:
                                            console.log('监听到', filePath, '文件有改动');
                                            // 改动一个文件会触发多次该回调
                                            this.dbOn(filePath);
                                            return [2 /*return*/];
                                    }
                                });
                            }); };
                            var watcher = fs.watch(path, null, watchCB);
                            watcher.addListener("error", function (e) {
                                console.log("addListener error", e);
                            });
                        };
                        include = config.include;
                        includes = include ? (Array.isArray(include) ? include : [include]) : ["./"];
                        _i = 0, includes_1 = includes;
                        _a.label = 1;
                    case 1:
                        if (!(_i < includes_1.length)) return [3 /*break*/, 4];
                        path = includes_1[_i];
                        return [4 /*yield*/, utils_1.forEachDir(path, config.exclude, function (path, basename, isDir) {
                                if (isDir)
                                    watch(path);
                            }, this.params.log)];
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
    CommandQueue.prototype.showHelp = function () {
        console.log("\n            -config/-c=             \u914D\u7F6E\u7684\u8DEF\u5F84\n            -help/-h                \u5E2E\u52A9\n            -search/-s=             \u641C\u7D22\u6587\u4EF6\u6216\u6587\u4EF6\u5939\n            -search-flag/-sf=       \u641C\u7D22\u6587\u4EF6\u6216\u6587\u4EF6\u5939 /\\w+/flag\n            -search-exclude/-se=    \u641C\u7D22\u6587\u4EF6\u6216\u6587\u4EF6\u5939 \u5FFD\u7565\u6587\u4EF6\u5939 \u591A\u4E2A\u7528\u9017\u53F7(,)\u9694\u5F00\n            -watch/-w               \u76D1\u542C\u6587\u4EF6\u6539\u53D8 \u4E0E-config\u642D\u914D\u4F7F\u7528\n            -log                    \u904D\u5386\u6587\u4EF6\u5939\u65F6\u662F\u5426\u663E\u793A\u904D\u5386log\n            -time/t                 \u663E\u793A\u6267\u884C\u4EE3\u7801\u6240\u82B1\u8D39\u7684\u65F6\u95F4\n        ");
    };
    __decorate([
        utils_1.Debounce(500)
    ], CommandQueue.prototype, "dbOn", null);
    return CommandQueue;
}());
new CommandQueue();
var templateObject_1, templateObject_2;
