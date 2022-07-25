var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { randomUUID } from "crypto";
import fs from "fs";
import { mkdir, rm } from "fs/promises";
import path from "path";
import { exec as execCallback } from "child_process";
import { File, Blob } from "node-fetch";
import { ValidationError, ValidationErrorEnum } from "./errors.js";
export function exec(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            execCallback(cmd, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                }
                resolve(stdout || stderr);
            });
        });
    });
}
export function validateSpecName(name) {
    if (name.includes(" ")) {
        throw new ValidationError(ValidationErrorEnum.nameWithSpace);
    }
}
export function createFile(content, name) {
    const blob = new Blob([content]);
    return new File([blob], name);
}
export function createFileFrom(filePath, name) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const bytes = [];
            fs.createReadStream(filePath)
                .on("data", (byte) => bytes.push(byte))
                .once("end", () => {
                const blob = new Blob(bytes);
                resolve(new File([blob], name));
            })
                .once("error", reject);
        });
    });
}
export function createTempDir(rootDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = path.resolve(rootDir, randomUUID());
        if (!fs.existsSync(dir)) {
            yield mkdir(dir, { recursive: true });
        }
        const removeFn = () => __awaiter(this, void 0, void 0, function* () {
            if (fs.existsSync(dir)) {
                yield rm(dir, { recursive: true });
            }
        });
        return [dir, removeFn];
    });
}
