"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const listr_1 = __importDefault(require("listr"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const execa_1 = __importDefault(require("execa"));
const read_pkg_1 = __importDefault(require("read-pkg"));
const semver_1 = __importDefault(require("semver"));
const utils_1 = require("./utils");
class Supervisor {
    constructor(options) {
        this.results = {};
        const defaultOptions = {
            debug: false,
            cwd: process.cwd(),
            ignoreLocal: true,
            silent: true,
        };
        this.options = { ...defaultOptions, ...options };
        this.tasks = new listr_1.default({
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
        if (!this.options.engines) {
            this.findEngines();
        }
        this.buildTasks();
    }
    async run() {
        if (!this.tasks) {
            throw new Error('No tasks found!');
        }
        // modified `Listr` to prevent throwing errors when we test things
        // see: node_modules/listr/index.js:104
        await this.tasks.run();
        return this.results;
    }
    ignoreLocal() {
        const oldPath = process.env.PATH;
        if (oldPath) {
            const pathToBin = path_1.default.resolve(this.options.cwd, 'node_modules', '.bin');
            const binRegex = new RegExp(`:?${utils_1.escapeRegExp(pathToBin)}:?`, 'i');
            const newPath = oldPath.replace(binRegex, '');
            process.env.PATH = newPath; // override $PATH
        }
    }
    buildTasks() {
        const engines = this.options.engines;
        if (!engines) {
            throw new Error('No engines found!');
        }
        Object.keys(engines).forEach(engine => {
            const version = engines[engine];
            this.addTask(engine, version);
        });
    }
    addTask(engine, range) {
        this.results[engine] = {
            success: false,
            tasks: [],
        };
        this.tasks.add({
            title: `Checking engine: ${chalk_1.default.green(engine)} (${chalk_1.default.dim(range)})`,
            task: () => {
                return new listr_1.default([
                    {
                        title: 'Check availability',
                        task: (ctx, task) => this.checkAvailability(ctx, task, engine),
                    },
                    {
                        title: 'Get command version',
                        task: (ctx, task) => this.getVersion(ctx, task, engine),
                    },
                    {
                        title: 'Validate range',
                        task: (ctx, task) => this.validateVersion(ctx, task, engine, range),
                    },
                    {
                        title: 'Check version against range',
                        task: (ctx, task) => this.checkVersion(ctx, task, engine, range),
                    },
                    {
                        title: chalk_1.default.dim('Update results'),
                        task: () => {
                            this.results[engine].success = true;
                            return Promise.resolve();
                        },
                    },
                ], {
                    exitOnError: true,
                });
            },
        });
    }
    findEngines() {
        const pkg = read_pkg_1.default.sync({
            cwd: this.options.cwd,
        });
        if (!pkg) {
            throw new Error('No package.json found!');
        }
        this.options.engines = pkg.engines;
    }
    checkAvailability(_, task, engine) {
        try {
            const { stdout } = execa_1.default.sync('command', ['-v', engine], {
                preferLocal: false,
            });
            if (this.options.debug) {
                console.log('Command:', stdout);
            }
            if (stdout.includes(engine)) {
                this.results[engine].tasks.push({
                    task,
                    success: true,
                    message: `Executable found!`,
                    data: stdout,
                });
                return Promise.resolve(`Executable found!`);
            }
            this.results[engine].tasks.push({
                task,
                success: false,
                message: `Executable not found!`,
                data: stdout,
            });
            return Promise.reject(new Error(`Executable not found!`));
        }
        catch (error) {
            if (this.options.debug) {
                console.log(error.message);
            }
            this.results[engine].tasks.push({
                task,
                success: false,
                message: `Error executing program!`,
                data: error,
            });
            return Promise.reject(new Error(`Error executing program!`));
        }
    }
    getVersion(ctx, task, engine) {
        try {
            const { stdout } = execa_1.default.sync(engine, ['--version'], {
                preferLocal: false,
            });
            const normalized = semver_1.default.coerce(stdout);
            if (this.options.debug) {
                console.log('Version:', stdout);
                console.log('Normalized:', normalized ? normalized.version : null);
            }
            if (normalized) {
                const validVersion = semver_1.default.valid(normalized.version);
                if (validVersion) {
                    ctx.version = validVersion;
                    this.results[engine].tasks.push({
                        task,
                        success: true,
                        message: 'Got a valid version',
                        data: {
                            version: stdout,
                            normalized,
                            validVersion,
                        },
                    });
                    return Promise.resolve();
                }
            }
            this.results[engine].tasks.push({
                task,
                success: false,
                message: `No valid version found! Please fill in an issue on GitHub.`,
                data: { stdout, normalized },
            });
            return Promise.reject(new Error(`No valid version found! Please fill in an issue on GitHub.`));
        }
        catch (error) {
            if (this.options.debug) {
                console.log(error.message);
            }
            this.results[engine].tasks.push({
                task,
                success: false,
                message: `Error fetching version!`,
                data: error,
            });
            return Promise.reject(new Error(`Error fetching version!`));
        }
    }
    validateVersion(_, task, engine, range) {
        const valid = semver_1.default.validRange(range);
        if (this.options.debug) {
            console.log('Range:', range);
            console.log('Valid:', valid);
        }
        if (valid) {
            this.results[engine].tasks.push({
                task,
                success: true,
                message: `This version is valid!`,
                data: {
                    range,
                },
            });
            return Promise.resolve(`This version is valid!`);
        }
        this.results[engine].tasks.push({
            task,
            success: false,
            message: `This is not a valid version (${range})!`,
            data: {
                range,
            },
        });
        return Promise.reject(new Error(`This is not a valid version (${range})!`));
    }
    checkVersion({ version }, task, engine, range) {
        const satisfies = semver_1.default.satisfies(version, range);
        if (this.options.debug) {
            console.log('Version:', version);
            console.log('Range:', range);
            console.log('Satisfies:', satisfies);
        }
        if (satisfies) {
            this.results[engine].tasks.push({
                task,
                success: true,
                message: `Yeah, your program version satisfies the required range!`,
                data: {
                    version,
                    range,
                    satisfies,
                },
            });
            return Promise.resolve(`Yeah, your program version satisfies the required range!`);
        }
        this.results[engine].tasks.push({
            task,
            success: false,
            message: `Ooh, the required range (${range}) does not satisfies your program version (${version})!`,
            data: {
                version,
                range,
                satisfies,
            },
        });
        return Promise.reject(new Error(`Ooh, the required range (${range}) does not satisfies your program version (${version})!`));
    }
}
exports.Supervisor = Supervisor;
