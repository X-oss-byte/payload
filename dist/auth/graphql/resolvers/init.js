"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const init_1 = __importDefault(require("../../operations/init"));
function initResolver(collection) {
    async function resolver(_, args, context) {
        const options = {
            collection,
            req: context.req,
        };
        return (0, init_1.default)(options);
    }
    return resolver;
}
exports.default = initResolver;
//# sourceMappingURL=init.js.map