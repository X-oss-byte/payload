import { PayloadRequest } from '../../types';
import { AccessResult } from '../../config/types';
import { SanitizedCollectionConfig, TypeWithID } from '../../collections/config/types';
import { SanitizedGlobalConfig } from '../../globals/config/types';
type Arguments<T> = {
    entity: SanitizedCollectionConfig | SanitizedGlobalConfig;
    entityType: 'collection' | 'global';
    doc: T;
    req: PayloadRequest;
    overrideAccess: boolean;
    accessResult: AccessResult;
};
declare const replaceWithDraftIfAvailable: <T extends TypeWithID>({ entity, entityType, doc, req, accessResult, }: Arguments<T>) => Promise<T>;
export default replaceWithDraftIfAvailable;
