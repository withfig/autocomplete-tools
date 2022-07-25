var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodeFetch from "node-fetch";
export const fetch = (...args) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield nodeFetch(...args);
    const { status, statusText, json } = response;
    if (status >= 400 && status < 600) {
        const baseError = `${status} ${statusText}`;
        try {
            const responseJSON = (yield json());
            throw new Error(`${baseError}: ${responseJSON.error}`);
        }
        catch (_a) {
            throw new Error(baseError);
        }
    }
    return response;
});
