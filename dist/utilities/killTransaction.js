"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.killTransaction = void 0;
/**
 * Rollback the transaction from the req using the db adapter and removes it from the req
 */
async function killTransaction(req) {
    const { transactionID, payload, } = req;
    if (transactionID) {
        await payload.db.rollbackTransaction(req.transactionID);
        delete req.transactionID;
    }
}
exports.killTransaction = killTransaction;
//# sourceMappingURL=killTransaction.js.map