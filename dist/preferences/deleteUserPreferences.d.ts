import type { Payload } from '../index';
import type { SanitizedCollectionConfig } from '../collections/config/types';
import { PayloadRequest } from '../express/types';
type Args = {
    payload: Payload;
    /**
     * User IDs to delete
     */
    ids: (string | number)[];
    collectionConfig: SanitizedCollectionConfig;
    req: PayloadRequest;
};
export declare const deleteUserPreferences: ({ payload, ids, collectionConfig, req }: Args) => void;
export {};
