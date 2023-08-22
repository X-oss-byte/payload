import { Payload } from '..';
declare const docWithFilenameExists: (payload: Payload, collectionSlug: string, path: string, filename: string) => Promise<boolean>;
export default docWithFilenameExists;
