#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const picocolors_1 = __importDefault(require("picocolors"));
function runProgram() {
    const boilerplateDir = path_1.default.resolve(__dirname, "..", "boilerplate");
    const dirs = [
        path_1.default.join(process.cwd(), ".fig", "autocomplete"),
        path_1.default.join(process.cwd(), ".fig", "user", "autocomplete"),
    ];
    console.log(picocolors_1.default.yellow("Copying boilerplate directory..."));
    for (const dir of dirs) {
        fs_1.default.mkdirSync(dir, { recursive: true });
        (0, child_process_1.execSync)(`cp -a ${boilerplateDir}/. ${dir}`);
    }
    console.log(picocolors_1.default.green("Finished copying boilerplate directory."));
    console.log("----");
    console.log(picocolors_1.default.yellow("Installing npm deps..."));
    for (const dir of dirs) {
        try {
            (0, child_process_1.execSync)("npm i", { cwd: dir });
        }
        catch (error) {
            continue;
        }
    }
    console.log(picocolors_1.default.green("Finished installing npm deps"));
}
exports.default = runProgram;
