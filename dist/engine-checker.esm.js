/*!
 * Engine Checker v2.0.0
 * https://github.com/muuvmuuv/engine-checker
 *
 * Copyright 2019 Marvin Heilemann
 * Released under the MIT license
 *
 * Date: 21.06.2019
 */

import Listr from 'listr';
import path from 'path';
import chalk from 'chalk';
import execa from 'execa';
import semver from 'semver';
import cosmiconfig from 'cosmiconfig';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
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
}

function sleep(ms) {
    return new Promise(function (r) { return setTimeout(r, ms); });
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

var PlainSyncLoader = function (_, content) {
    var returnArray = {};
    var matches = content.match(/([a-z]+)(.*)/g);
    if (!matches) {
        throw new Error("We had a problem finding matches in this file");
    }
    matches.forEach(function (e, i) {
        var engine = /([a-z]+)(.*)/.exec(e);
        if (!engine) {
            throw new Error("There was an error in your config file on line: " + i);
        }
        var prg = engine[1];
        var version = engine[2].replace(/\s/, '');
        returnArray[prg] = version;
    });
    return returnArray;
};

var EngineChecker = /** @class */ (function () {
    function EngineChecker(options) {
        this.results = {};
        this.pillow = 50;
        var defaultOptions = {
            debug: false,
            cwd: process.cwd(),
            ignoreLocal: true,
            silent: true,
            engines: {},
        };
        this.options = __assign({}, defaultOptions, options);
        var explorer = cosmiconfig('engines', {
            searchPlaces: ['engines', '.engines', '.engines.yaml', 'package.json'],
            loaders: {
                noExt: {
                    sync: PlainSyncLoader,
                },
            },
        });
        var configFromFile = explorer.searchSync();
        if (configFromFile) {
            if (this.options.debug) {
                console.log('Config', chalk.dim(configFromFile.filepath), '\n');
            }
            this.options.engines = configFromFile.config;
        }
        this.tasks = new Listr({
            renderer: this.options.debug
                ? 'verbose'
                : this.options.silent
                    ? 'silent'
                    : 'default',
            concurrent: false,
            exitOnError: false,
        });
        if (this.options.ignoreLocal) {
            this.ignoreLocal();
        }
        this.buildTasks();
    }
    EngineChecker.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.tasks) {
                            throw new Error('No tasks found!');
                        }
                        // modified `Listr` to prevent throwing errors when we test things
                        // see: node_modules/listr/index.js:104
                        return [4 /*yield*/, this.tasks.run()];
                    case 1:
                        // modified `Listr` to prevent throwing errors when we test things
                        // see: node_modules/listr/index.js:104
                        _a.sent();
                        return [2 /*return*/, this.results];
                }
            });
        });
    };
    EngineChecker.prototype.ignoreLocal = function () {
        var oldPath = process.env.PATH;
        if (oldPath) {
            var pathToBin = path.resolve(this.options.cwd, 'node_modules', '.bin');
            var binRegex = new RegExp(":?" + escapeRegExp(pathToBin) + ":?", 'i');
            var newPath = oldPath.replace(binRegex, ':');
            process.env.PATH = newPath; // override $PATH
        }
    };
    EngineChecker.prototype.buildTasks = function () {
        var _this = this;
        var engines = this.options.engines;
        if (!engines) {
            throw new Error('No engines found!');
        }
        Object.keys(engines).forEach(function (engine) {
            var version = engines[engine];
            _this.addTask(engine, version);
        });
    };
    EngineChecker.prototype.addTask = function (engine, range) {
        var _this = this;
        this.results[engine] = {
            success: false,
            tasks: [],
        };
        this.tasks.add({
            title: "Checking engine: " + chalk.green(engine) + " (" + chalk.dim(range) + ")",
            task: function () {
                return new Listr([
                    {
                        title: 'Check availability',
                        task: function (ctx, task) {
                            return _this.checkAvailability(ctx, task, engine);
                        },
                    },
                    {
                        title: 'Get command version',
                        task: function (ctx, task) {
                            return _this.getVersion(ctx, task, engine);
                        },
                    },
                    {
                        title: 'Validate range',
                        task: function (ctx, task) {
                            return _this.validateVersion(ctx, task, engine, range);
                        },
                    },
                    {
                        title: 'Check version against range',
                        task: function (ctx, task) {
                            return _this.checkVersion(ctx, task, engine, range);
                        },
                    },
                    {
                        title: chalk.dim('Update results'),
                        task: function () {
                            _this.results[engine].success = true;
                            return Promise.resolve();
                        },
                    },
                ], {
                    exitOnError: true,
                });
            },
        });
    };
    EngineChecker.prototype.checkAvailability = function (_, task, engine) {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, execa('command', ['-v', engine], {
                                preferLocal: false,
                            })];
                    case 1:
                        stdout = (_a.sent()).stdout;
                        return [4 /*yield*/, sleep(this.pillow)]; // don't be so shiny
                    case 2:
                        _a.sent(); // don't be so shiny
                        if (this.options.debug) {
                            console.log('Command:', stdout);
                        }
                        if (stdout.includes(engine)) {
                            this.results[engine].tasks.push({
                                task: task,
                                success: true,
                                message: "Executable found!",
                                data: stdout,
                            });
                            return [2 /*return*/, Promise.resolve("Executable found!")];
                        }
                        this.results[engine].tasks.push({
                            task: task,
                            success: false,
                            message: "Executable not found!",
                            data: stdout,
                        });
                        return [2 /*return*/, Promise.reject(new Error("Executable not found!"))];
                    case 3:
                        error_1 = _a.sent();
                        if (this.options.debug) {
                            console.log(error_1.message);
                        }
                        this.results[engine].tasks.push({
                            task: task,
                            success: false,
                            message: "Error executing program!",
                            data: error_1,
                        });
                        return [2 /*return*/, Promise.reject(new Error("Error executing program!"))];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EngineChecker.prototype.getVersion = function (ctx, task, engine) {
        return __awaiter(this, void 0, void 0, function () {
            var stdout, normalized, validVersion, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, execa(engine, ['--version'], {
                                preferLocal: false,
                            })];
                    case 1:
                        stdout = (_a.sent()).stdout;
                        return [4 /*yield*/, sleep(this.pillow)]; // don't be so shiny
                    case 2:
                        _a.sent(); // don't be so shiny
                        normalized = semver.coerce(stdout);
                        if (this.options.debug) {
                            console.log('Version:', stdout);
                            console.log('Normalized:', normalized ? normalized.version : null);
                        }
                        if (normalized) {
                            validVersion = semver.valid(normalized.version);
                            if (validVersion) {
                                ctx.version = validVersion;
                                this.results[engine].tasks.push({
                                    task: task,
                                    success: true,
                                    message: 'Got a valid version',
                                    data: {
                                        version: stdout,
                                        normalized: normalized,
                                        validVersion: validVersion,
                                    },
                                });
                                return [2 /*return*/, Promise.resolve()];
                            }
                        }
                        this.results[engine].tasks.push({
                            task: task,
                            success: false,
                            message: "No valid version found! Please fill in an issue on GitHub.",
                            data: { stdout: stdout, normalized: normalized },
                        });
                        return [2 /*return*/, Promise.reject(new Error("No valid version found! Please fill in an issue on GitHub."))];
                    case 3:
                        error_2 = _a.sent();
                        if (this.options.debug) {
                            console.log(error_2.message);
                        }
                        this.results[engine].tasks.push({
                            task: task,
                            success: false,
                            message: "Error fetching version!",
                            data: error_2,
                        });
                        return [2 /*return*/, Promise.reject(new Error("Error fetching version!"))];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EngineChecker.prototype.validateVersion = function (_, task, engine, range) {
        return __awaiter(this, void 0, void 0, function () {
            var valid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, semver.validRange(range)];
                    case 1:
                        valid = _a.sent();
                        return [4 /*yield*/, sleep(this.pillow)]; // don't be so shiny
                    case 2:
                        _a.sent(); // don't be so shiny
                        if (this.options.debug) {
                            console.log('Range:', range);
                            console.log('Valid:', valid);
                        }
                        if (valid) {
                            this.results[engine].tasks.push({
                                task: task,
                                success: true,
                                message: "This version is valid!",
                                data: {
                                    range: range,
                                },
                            });
                            return [2 /*return*/, Promise.resolve("This version is valid!")];
                        }
                        this.results[engine].tasks.push({
                            task: task,
                            success: false,
                            message: "This is not a valid version (" + range + ")!",
                            data: {
                                range: range,
                            },
                        });
                        return [2 /*return*/, Promise.reject(new Error("This is not a valid version (" + range + ")!"))];
                }
            });
        });
    };
    EngineChecker.prototype.checkVersion = function (_a, task, engine, range) {
        var version = _a.version;
        return __awaiter(this, void 0, void 0, function () {
            var satisfies;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, semver.satisfies(version, range)];
                    case 1:
                        satisfies = _b.sent();
                        return [4 /*yield*/, sleep(this.pillow)]; // don't be so shiny
                    case 2:
                        _b.sent(); // don't be so shiny
                        if (this.options.debug) {
                            console.log('Version:', version);
                            console.log('Range:', range);
                            console.log('Satisfies:', satisfies);
                        }
                        if (satisfies) {
                            this.results[engine].tasks.push({
                                task: task,
                                success: true,
                                message: "Yeah, your program version satisfies the required range!",
                                data: {
                                    version: version,
                                    range: range,
                                    satisfies: satisfies,
                                },
                            });
                            return [2 /*return*/, Promise.resolve("Yeah, your program version satisfies the required range!")];
                        }
                        this.results[engine].tasks.push({
                            task: task,
                            success: false,
                            message: "Ooh, the required range (" + range + ") does not satisfies your program version (" + version + ")!",
                            data: {
                                version: version,
                                range: range,
                                satisfies: satisfies,
                            },
                        });
                        return [2 /*return*/, Promise.reject(new Error("Ooh, the required range (" + range + ") does not satisfies your program version (" + version + ")!"))];
                }
            });
        });
    };
    return EngineChecker;
}());

export { EngineChecker };
