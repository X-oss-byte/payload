import { Response, NextFunction } from 'express';
import { PayloadRequest } from '../../express/types';
import { TypeWithID } from '../config/types';
import type { PaginatedDocs } from '../../database/types';
export default function findHandler<T extends TypeWithID = any>(req: PayloadRequest, res: Response, next: NextFunction): Promise<Response<PaginatedDocs<T>> | void>;
