import { Payload } from '../payload';
import { Document, PayloadRequest, Where } from '../types';
import { SanitizedGlobalConfig } from '../globals/config/types';
type Args = {
    payload: Payload;
    where: Where;
    slug: string;
    config: SanitizedGlobalConfig;
    locale?: string;
    req?: PayloadRequest;
};
export declare const getLatestGlobalVersion: ({ payload, config, slug, where, locale, req, }: Args) => Promise<{
    global: Document;
    globalExists: boolean;
}>;
export {};
