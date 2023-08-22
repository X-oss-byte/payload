import { Response } from 'express';
import { Collection, TypeWithID } from '../../config/types';
import { PayloadRequest } from '../../../express/types';
import type { TypeWithVersion } from '../../../versions/types';
export type Resolver<T extends TypeWithID = any> = (_: unknown, args: {
    locale?: string;
    fallbackLocale?: string;
    draft: boolean;
    id: number | string;
}, context: {
    req: PayloadRequest;
    res: Response;
}) => Promise<TypeWithVersion<T>>;
export default function findVersionByIDResolver(collection: Collection): Resolver;
