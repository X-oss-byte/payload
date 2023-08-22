import { Payload } from '../../..';
import { SanitizedCollectionConfig } from '../../../collections/config/types';
import { PayloadRequest } from '../../../express/types';
type Args = {
    collection: SanitizedCollectionConfig;
    doc: Record<string, unknown>;
    password: string;
    payload: Payload;
    req: PayloadRequest;
};
export declare const registerLocalStrategy: ({ collection, doc, password, payload, req, }: Args) => Promise<Record<string, unknown>>;
export {};
