import { Payload } from '../../..';
import { SanitizedCollectionConfig, TypeWithID } from '../../../collections/config/types';
import { PayloadRequest } from '../../../express/types';
type Args = {
    req: PayloadRequest;
    payload: Payload;
    doc: TypeWithID & Record<string, unknown>;
    collection: SanitizedCollectionConfig;
};
export declare const incrementLoginAttempts: ({ req, payload, doc, collection, }: Args) => Promise<void>;
export {};
