import { Payload } from '../payload';
import type { SanitizedCollectionConfig } from '../collections/config/types';
import type { SanitizedGlobalConfig } from '../globals/config/types';
import { PayloadRequest } from '../types';
type Args = {
    payload: Payload;
    max: number;
    collection?: SanitizedCollectionConfig;
    global?: SanitizedGlobalConfig;
    id?: string | number;
    req?: PayloadRequest;
};
export declare const enforceMaxVersions: ({ payload, max, collection, global, id, req, }: Args) => Promise<void>;
export {};
