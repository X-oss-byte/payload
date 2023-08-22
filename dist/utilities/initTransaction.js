"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTransaction = void 0;
/**
 * Starts a new transaction using the db adapter with a random id and then assigns it to the req.transaction
 * @returns true if beginning a transaction and false when req already has a transaction to use
 */
async function initTransaction(req) {
    const { transactionID, payload, } = req;
    if (!transactionID && typeof payload.db.beginTransaction === 'function') {
        req.transactionID = await payload.db.beginTransaction();
        if (req.transactionID) {
            return true;
        }
    }
    return false;
}
exports.initTransaction = initTransaction;
//# sourceMappingURL=initTransaction.js.map