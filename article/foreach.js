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
var utils_1 = require("../src/utils");
var configFileTypes_1 = require("../src/configFileTypes");
(function () {
    return __awaiter(this, void 0, void 0, function () {
        // 匹配正则
        function test(eventName, path, basename, rules) {
            if (rules === void 0) { rules = []; }
            return __awaiter(this, void 0, void 0, function () {
                var _i, rules_1, rule;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _i = 0, rules_1 = rules;
                            _a.label = 1;
                        case 1:
                            if (!(_i < rules_1.length)) return [3 /*break*/, 6];
                            rule = rules_1[_i];
                            if (!rule.test.test(basename))
                                return [3 /*break*/, 5];
                            if (!configFileTypes_1.isRuleOn(rule)) return [3 /*break*/, 3];
                            return [4 /*yield*/, rule.on(eventName, path, Path.extname(path).substr(1), function (cmd) { return utils_1.executeTemplate(cmd, path); })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, utils_1.mulExec(rule.command, path)];
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
        }
        // 遍历文件夹
        function foreach(path, exclude, cb) {
            if (exclude === void 0) { exclude = []; }
            return utils_1.forEachDir(path, exclude, function (path, basename, isDir) {
                return cb(path, basename, isDir);
            });
        }
        var args, Path, configPath, config, include, includes, rules_2, _i, includes_1, path, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = utils_1.getParams();
                    Path = require("path");
                    configPath = Path.resolve(process.cwd(), args.config);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    config = require(configPath);
                    if (!config.beforeStart) return [3 /*break*/, 3];
                    return [4 /*yield*/, config.beforeStart(utils_1.executeTemplate)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    include = config.include;
                    includes = include ? (Array.isArray(include) ? include : [include]) : ["./"];
                    rules_2 = config.rules;
                    _i = 0, includes_1 = includes;
                    _a.label = 4;
                case 4:
                    if (!(_i < includes_1.length)) return [3 /*break*/, 7];
                    path = includes_1[_i];
                    return [4 /*yield*/, foreach(path, config.exclude, function (path, basename) {
                            return test("", path, basename, rules_2);
                        })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    // beforeEnd调用
                    config.beforeEnd && config.beforeEnd(utils_1.executeTemplate);
                    return [3 /*break*/, 9];
                case 8:
                    e_1 = _a.sent();
                    console.error("加载配置文件出错", process.cwd(), configPath);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
})();
