var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FormData } from "node-fetch";
import path from "path";
import esbuild from "esbuild";
import { fetch } from "./node-fetch.js";
import { createFile, exec, validateSpecName, createTempDir, createFileFrom } from "./utils.js";
import { API_BASE } from "./constants.js";
import { BuildError, GenerationError, GenericErrorEnum, PublishError, ValidationError, } from "./errors.js";
import { tryParseTokenFromCredentials } from "./credentials.js";
import testHelpers from "./test-helpers.js";
const DEFAULT_OPTION = {
    subcommandName: "generate-fig-spec",
};
export const run = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { name: optionalName, token: optionalToken, specPath, binaryPath, subcommandName, framework, team, } = options;
    let token = optionalToken;
    if (!token) {
        if (process.env.FIG_API_TOKEN) {
            token = process.env.FIG_API_TOKEN;
        }
        else {
            // try to read the token from the config file
            token = yield tryParseTokenFromCredentials();
        }
    }
    let name = optionalName;
    if (!name) {
        // if name is missing we extract it from the optional spec-name
        // NOTE: this won't work correctly for spec names that require being nested under a subfolder
        // e.g. `@withfig/autocomplete-tools.ts`
        if (specPath) {
            name = path.basename(specPath, ".ts");
        }
        else {
            throw new ValidationError(GenericErrorEnum.missingName);
        }
    }
    validateSpecName(name);
    let specOutput;
    if (binaryPath) {
        const cmd = framework || subcommandName
            ? `${binaryPath} ${subcommandName !== null && subcommandName !== void 0 ? subcommandName : DEFAULT_OPTION.subcommandName}`
            : binaryPath;
        try {
            specOutput = (yield exec(cmd)).trim();
        }
        catch (error) {
            const { message } = error;
            throw new GenerationError(`"${cmd}" exited with errors.\n${message}`);
        }
    }
    const formData = new FormData();
    if (specPath) {
        const tsSpecPath = path.resolve(specPath);
        const [tempDir, removeTempDir] = yield createTempDir(path.dirname(tsSpecPath));
        try {
            yield esbuild.build({
                entryPoints: {
                    [name]: tsSpecPath,
                },
                outdir: tempDir,
                bundle: true,
                format: "esm",
                minify: true,
                logLevel: "silent",
            });
            const jsSpecPath = path.resolve(tempDir, `${name}.js`);
            formData.append("jsSpec", yield createFileFrom(jsSpecPath, `${name}.js`));
        }
        catch (error) {
            throw new BuildError(error.message);
        }
        finally {
            yield removeTempDir();
        }
    }
    else if (specOutput) {
        try {
            const builtSpec = yield esbuild.transform(specOutput, {
                format: "esm",
                minify: true,
                logLevel: "silent",
            });
            formData.append("jsSpec", createFile(builtSpec.code, `${name}.js`));
        }
        catch (error) {
            throw new BuildError(error.message);
        }
    }
    else {
        throw new ValidationError(GenericErrorEnum.noSpecPassed);
    }
    formData.append("name", name);
    if (team)
        formData.append("team", team);
    try {
        // This fetch method is a wrapper over the node-fetch function
        // See node-fetch.ts
        const response = yield fetch(`${API_BASE}/cdn`, {
            headers: Object.assign({ Authorization: `Bearer ${token}`, Accept: "application/json" }, testHelpers.getAssertDataHeader()),
            method: "PUT",
            body: formData,
        });
        try {
            const { namespace, name: specName } = (yield response.json());
            console.log(`Successfully published ${specName} to ${namespace}`);
        }
        catch (error) {
            console.log("The spec was successfully published.");
        }
    }
    catch (error) {
        throw new PublishError(error.message);
    }
});
