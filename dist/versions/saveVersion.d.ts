import { Payload } from '../payload';
import { SanitizedCollectionConfig, TypeWithID } from '../collections/config/types';
import { PayloadRequest } from '../express/types';
import { SanitizedGlobalConfig } from '../globals/config/types';
type Args = {
    payload: Payload;
    global?: SanitizedGlobalConfig;
    collection?: SanitizedCollectionConfig;
    docWithLocales: any;
    id?: string | number;
    autosave?: boolean;
    draft?: boolean;
    req?: PayloadRequest;
};
export declare const saveVersion: ({ payload, collection, global, id, docWithLocales: doc, autosave, draft, req, }: Args) => Promise<TypeWithID>;
export {};
