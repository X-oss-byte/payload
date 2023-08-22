import { Payload } from '../payload';
import { PayloadRequest } from '../express/types';
type Args = {
    payload: Payload;
    slug: string;
    id?: string | number;
    req?: PayloadRequest;
};
export declare const deleteCollectionVersions: ({ payload, slug, id, req, }: Args) => Promise<void>;
export {};
