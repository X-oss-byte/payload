import { NextFunction, Response } from 'express';
import { PayloadRequest } from '../express/types';
import { SanitizedCollectionConfig } from '../collections/config/types';
declare const getExecuteStaticAccess: (config: SanitizedCollectionConfig) => (req: PayloadRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export default getExecuteStaticAccess;
