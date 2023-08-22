"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dataloader_1 = require("../../../collections/dataloader");
const findOne_1 = __importDefault(require("../findOne"));
const init_1 = require("../../../translations/init");
const errors_1 = require("../../../errors");
const setRequestContext_1 = require("../../../express/setRequestContext");
async function findOneLocal(payload, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { slug: globalSlug, depth, locale = payload.config.localization ? (_a = payload.config.localization) === null || _a === void 0 ? void 0 : _a.defaultLocale : null, fallbackLocale = null, user, overrideAccess = true, showHiddenFields, draft = false, } = options;
    const globalConfig = payload.globals.config.find((config) => config.slug === globalSlug);
    const defaultLocale = ((_b = payload === null || payload === void 0 ? void 0 : payload.config) === null || _b === void 0 ? void 0 : _b.localization) ? (_d = (_c = payload === null || payload === void 0 ? void 0 : payload.config) === null || _c === void 0 ? void 0 : _c.localization) === null || _d === void 0 ? void 0 : _d.defaultLocale : null;
    if (!globalConfig) {
        throw new errors_1.APIError(`The global with slug ${String(globalSlug)} can't be found.`);
    }
    const i18n = (0, init_1.i18nInit)(payload.config.i18n);
    const req = {
        user,
        payloadAPI: 'local',
        locale: (_f = locale !== null && locale !== void 0 ? locale : (_e = options.req) === null || _e === void 0 ? void 0 : _e.locale) !== null && _f !== void 0 ? _f : defaultLocale,
        fallbackLocale: (_h = fallbackLocale !== null && fallbackLocale !== void 0 ? fallbackLocale : (_g = options.req) === null || _g === void 0 ? void 0 : _g.fallbackLocale) !== null && _h !== void 0 ? _h : defaultLocale,
        payload,
        i18n,
        t: i18n.t,
    };
    (0, setRequestContext_1.setRequestContext)(req);
    if (!req.payloadDataLoader)
        req.payloadDataLoader = (0, dataloader_1.getDataLoader)(req);
    return (0, findOne_1.default)({
        slug: globalSlug,
        depth,
        globalConfig,
        overrideAccess,
        showHiddenFields,
        draft,
        req,
    });
}
exports.default = findOneLocal;
//# sourceMappingURL=findOne.js.map