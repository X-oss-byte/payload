import { PayloadRequest } from '../../express/types';
import { Collection, TypeWithID } from '../config/types';
import { TypeWithVersion } from '../../versions/types';
export type Arguments = {
    collection: Collection;
    id: string | number;
    req: PayloadRequest;
    disableErrors?: boolean;
    currentDepth?: number;
    overrideAccess?: boolean;
    showHiddenFields?: boolean;
    depth?: number;
};
declare function findVersionByID<T extends TypeWithID = any>(args: Arguments): Promise<TypeWithVersion<T>>;
export default findVersionByID;
