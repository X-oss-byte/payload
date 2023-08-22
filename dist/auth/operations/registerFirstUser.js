"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../errors");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
async function registerFirstUser(args) {
    const { collection: { config, config: { slug, auth: { verify, }, }, }, req: { payload, }, req, data, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        const doc = await payload.db.findOne({
            collection: config.slug,
            req,
        });
        if (doc)
            throw new errors_1.Forbidden(req.t);
        // /////////////////////////////////////
        // Register first user
        // /////////////////////////////////////
        const result = await payload.create({
            req,
            collection: slug,
            data,
            overrideAccess: true,
        });
        // auto-verify (if applicable)
        if (verify) {
            await payload.update({
                id: result.id,
                collection: slug,
                data: {
                    _verified: true,
                },
            });
        }
        // /////////////////////////////////////
        // Log in new user
        // /////////////////////////////////////
        const { token } = await payload.login({
            ...args,
            collection: slug,
        });
        const resultToReturn = {
            ...result,
            token,
        };
        if (shouldCommit)
            await payload.db.commitTransaction(req.transactionID);
        return {
            message: 'Registered and logged in successfully. Welcome!',
            user: resultToReturn,
        };
    }
    catch (error) {
        await (0, killTransaction_1.killTransaction)(req);
        throw error;
    }
}
exports.default = registerFirstUser;
//# sourceMappingURL=registerFirstUser.js.map