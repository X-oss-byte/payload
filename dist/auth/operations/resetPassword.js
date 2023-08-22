"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../../errors");
const getCookieExpiration_1 = __importDefault(require("../../utilities/getCookieExpiration"));
const getFieldsToSign_1 = require("./getFieldsToSign");
const authenticate_1 = require("../strategies/local/authenticate");
const generatePasswordSaltHash_1 = require("../strategies/local/generatePasswordSaltHash");
const initTransaction_1 = require("../../utilities/initTransaction");
const killTransaction_1 = require("../../utilities/killTransaction");
async function resetPassword(args) {
    if (!Object.prototype.hasOwnProperty.call(args.data, 'token')
        || !Object.prototype.hasOwnProperty.call(args.data, 'password')) {
        throw new errors_1.APIError('Missing required data.');
    }
    const { collection: { config: collectionConfig, }, req, req: { payload: { config, secret, }, payload, }, overrideAccess, data, depth, } = args;
    try {
        const shouldCommit = await (0, initTransaction_1.initTransaction)(req);
        // /////////////////////////////////////
        // Reset Password
        // /////////////////////////////////////
        const user = await payload.db.findOne({
            collection: collectionConfig.slug,
            where: {
                resetPasswordToken: { equals: data.token },
                resetPasswordExpiration: { greater_than: Date.now() },
            },
            req,
        });
        if (!user)
            throw new errors_1.APIError('Token is either invalid or has expired.');
        // TODO: replace this method
        const { salt, hash } = await (0, generatePasswordSaltHash_1.generatePasswordSaltHash)({ password: data.password });
        user.salt = salt;
        user.hash = hash;
        user.resetPasswordExpiration = Date.now();
        if (collectionConfig.auth.verify) {
            user._verified = true;
        }
        const doc = await payload.db.updateOne({
            collection: collectionConfig.slug,
            id: user.id,
            data: user,
            req,
        });
        await (0, authenticate_1.authenticateLocalStrategy)({ password: data.password, doc });
        const fieldsToSign = (0, getFieldsToSign_1.getFieldsToSign)({
            collectionConfig,
            user,
            email: user.email,
        });
        const token = jsonwebtoken_1.default.sign(fieldsToSign, secret, {
            expiresIn: collectionConfig.auth.tokenExpiration,
        });
        if (args.res) {
            const cookieOptions = {
                path: '/',
                httpOnly: true,
                expires: (0, getCookieExpiration_1.default)(collectionConfig.auth.tokenExpiration),
                secure: collectionConfig.auth.cookies.secure,
                sameSite: collectionConfig.auth.cookies.sameSite,
                domain: undefined,
            };
            if (collectionConfig.auth.cookies.domain)
                cookieOptions.domain = collectionConfig.auth.cookies.domain;
            args.res.cookie(`${config.cookiePrefix}-token`, token, cookieOptions);
        }
        const fullUser = await payload.findByID({ collection: collectionConfig.slug, id: user.id, overrideAccess, depth, req });
        if (shouldCommit)
            await payload.db.commitTransaction(req.transactionID);
        return { token, user: fullUser };
    }
    catch (error) {
        await (0, killTransaction_1.killTransaction)(req);
        throw error;
    }
}
exports.default = resetPassword;
//# sourceMappingURL=resetPassword.js.map