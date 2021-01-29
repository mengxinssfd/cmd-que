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
var Path = require("path");
var process = require("process");
var CommandQueue = /** @class */ (function () {
    function CommandQueue() {
        var params = utils_1.getParams();
        this.params = params;
        if (params.help || params.h) {
            this.showHelp();
            return;
        }
        if (params.search) {
            this.search();
            return;
        }
        var configPath = params.config;
        this.config = require(configPath);
        if (params.watch) {
        }
        else {
            if (this.config.test) {
                this.foreach();
            }
            else {
                this.exec();
            }
        }
    }
    CommandQueue.prototype.foreach = function () {
        var _this = this;
        utils_1.forEachDir("./", this.config.exclude || [], function (path, isDir) { return __awaiter(_this, void 0, void 0, function () {
            var test;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (isDir)
                            return [2 /*return*/];
                        test = this.config.test;
                        if (!test.test(path))
                            return [2 /*return*/];
                        return [4 /*yield*/, this.exec(path)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    CommandQueue.prototype.search = function () {
        var _this = this;
        var search = this.params.search;
        if (typeof search !== "string")
            throw new TypeError("search");
        var reg = new RegExp(search);
        utils_1.forEachDir("./", [], function (path, isDir) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (reg.test(path))
                    console.log("search ", path);
                return [2 /*return*/];
            });
        }); });
    };
    CommandQueue.prototype.exec = function (path) {
        if (path === void 0) { path = ""; }
        return __awaiter(this, void 0, void 0, function () {
            var cwd, basename, map, mapKeys, _i, _a, cmd;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cwd = process.cwd();
                        basename = Path.basename(path);
                        map = {
                            "\\$FilePath\\$": path,
                            "\\$FileNameWithoutExtension\\$": basename.split(".").slice(0, -1).join("."),
                            "\\$FileNameWithoutAllExtensions\\$": basename.split(".")[0],
                            "\\$FileDir\\$": path ? Path.dirname(path) : cwd,
                            "\\$CmdDir\\$": cwd,
                            "\\$SourceFileDir\\$": __dirname
                        };
                        mapKeys = Object.keys(map);
                        _i = 0, _a = this.config.command;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        cmd = _a[_i];
                        cmd = mapKeys.reduce(function (c, k) { return c.replace(new RegExp(k, "g"), map[k]); }, String.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", ""], ["", ""])), cmd));
                        return [4 /*yield*/, utils_1.execute(cmd)];
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
    CommandQueue.prototype.watch = function () {
        // TODO
    };
    CommandQueue.prototype.showHelp = function () {
        console.log("\n            -config=         \u914D\u7F6E\u7684\u8DEF\u5F84\n            -help/-h         \u5E2E\u52A9\n            -search=         \u641C\u7D22\u6587\u4EF6\u6216\u6587\u4EF6\u5939\n        ");
    };
    return CommandQueue;
}());
new CommandQueue();
var templateObject_1;
