"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../errors");
const executeAccess_1 = __importDefault(require("../executeAccess"));
const resetLoginAttempts_1 = require("../strategies/local/resetLoginAttempts");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
async function unlock(args) {
    if (!Object.prototype.hasOwnProperty.call(args.data, 'email')) {
        throw new errors_1.APIError('Missing email.');
    }
    const { collection: { config: collectionConfig, }, req, req: { payload, locale, }, overrideAccess, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // Access
        // /////////////////////////////////////
        if (!overrideAccess) {
            await (0, executeAccess_1.default)({ req }, collectionConfig.access.unlock);
        }
        const options = { ...args };
        const { data } = options;
        // /////////////////////////////////////
        // Unlock
        // /////////////////////////////////////
        if (!data.email) {
            throw new errors_1.APIError('Missing email.');
        }
        const user = await req.payload.db.findOne({
            collection: collectionConfig.slug,
            where: { email: { equals: data.email.toLowerCase() } },
            locale,
            req,
        });
        let result;
        if (user) {
            await (0, resetLoginAttempts_1.resetLoginAttempts)({
                req,
                payload: req.payload,
                collection: collectionConfig,
                doc: user,
            });
            result = true;
        }
        else {
            result = null;
        }
        if (shouldCommit)
            await payload.db.commitTransaction(req.transactionID);
        return result;
    }
    catch (error) {
        await (0, killTransaction_1.killTransaction)(req);
        throw error;
    }
}
exports.default = unlock;
//# sourceMappingURL=unlock.js.map