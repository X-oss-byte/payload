import { PayloadRequest } from '../types';
import { Payload } from '../payload';
import { SanitizedCollectionConfig, TypeWithID } from '../collections/config/types';
import type { FindOneArgs } from '../database/types';
type Args = {
    payload: Payload;
    query: FindOneArgs;
    id: string | number;
    config: SanitizedCollectionConfig;
    req?: PayloadRequest;
};
export declare const getLatestCollectionVersion: <T extends TypeWithID = any>({ payload, config, query, id, req, }: Args) => Promise<T>;
export {};
