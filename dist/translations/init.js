"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nInit = void 0;
const i18next_1 = __importDefault(require("i18next"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const defaultOptions_1 = require("./defaultOptions");
function i18nInit(options) {
    if (i18next_1.default.isInitialized) {
        return i18next_1.default;
    }
    i18next_1.default.init({
        ...(0, deepmerge_1.default)(defaultOptions_1.defaultOptions, options || {}),
    });
    return i18next_1.default;
}
exports.i18nInit = i18nInit;
//# sourceMappingURL=init.js.map