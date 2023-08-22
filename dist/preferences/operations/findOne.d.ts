import { Config as GeneratedTypes } from 'payload/generated-types';
import { PreferenceRequest } from '../types';
declare function findOne(args: PreferenceRequest): Promise<GeneratedTypes['collections']['_preference']>;
export default findOne;
