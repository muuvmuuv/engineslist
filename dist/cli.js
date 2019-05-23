"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const meow_1 = __importDefault(require("meow"));
const chalk_1 = __importDefault(require("chalk"));
const boxen_1 = __importDefault(require("boxen"));
const util_1 = __importDefault(require("util"));
const _1 = require(".");
// BUG: https://github.com/microsoft/TypeScript/issues/24744
const { version } = require('../package.json'); // tslint:disable-line:no-var-requires
const cli = meow_1.default(`
    Usage
    $ supervisor <directory>

    Options
    --ignoreLocal, -i  Ignore local installed node modules (true)

    --debug     Debug program
    --version   Show version
    --help      Show help
`, {
    flags: {
        debug: {
            type: 'boolean',
            default: false,
        },
        ignoreLocal: {
            type: 'boolean',
            alias: 'i',
            default: true,
        },
    },
});
const { debug, ignoreLocal } = cli.flags;
const cwd = cli.input[0] || process.cwd();
console.log(boxen_1.default(`${chalk_1.default.green('Supervisor')} (${chalk_1.default.dim(version)})`, {
    padding: {
        top: 1,
        bottom: 1,
        right: 8,
        left: 8,
    },
    margin: {
        top: 0,
        bottom: 0,
        right: 3,
        left: 3,
    },
    align: 'center',
    borderColor: 'white',
    dimBorder: true,
}) + '\n');
const supervisor = new _1.Supervisor({
    silent: false,
    ignoreLocal,
    cwd,
    debug,
});
supervisor.run().then(res => {
    const success = Object.values(res).every(v => v.success === true);
    if (!success) {
        console.log(`
    ${chalk_1.default.red('Oh, no!')}
    Seems like some engines does not satisfies or not
    exists. You may check them and install the correct
    version before using this project.
      `);
    }
    else {
        console.log(`
    ${chalk_1.default.green('Yeah!')}
    You are ready to go. All engines are compatible
    with you system environment.
      `);
    }
    if (debug) {
        console.log();
        Object.keys(res).forEach(r => {
            console.log(chalk_1.default.bold(r.toUpperCase()));
            console.log(util_1.default.inspect(res[r], {
                showHidden: false,
                depth: 3,
                colors: true,
            }));
            console.log();
        });
    }
});
