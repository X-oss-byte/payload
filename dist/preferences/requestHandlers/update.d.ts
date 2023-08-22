import { NextFunction, Response } from 'express';
import { Config as GeneratedTypes } from 'payload/generated-types';
import { PayloadRequest } from '../../express/types';
export default function updateHandler(req: PayloadRequest, res: Response, next: NextFunction): Promise<Response<GeneratedTypes['collections']['_preference']> | void>;
