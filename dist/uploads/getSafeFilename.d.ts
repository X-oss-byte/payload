import { Payload } from '..';
declare function getSafeFileName(payload: Payload, collectionSlug: string, staticPath: string, desiredFilename: string): Promise<string>;
export default getSafeFileName;
