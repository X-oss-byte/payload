import { PayloadRequest } from '../../express/types';
declare function init(args: {
    req: PayloadRequest;
    collection: string;
}): Promise<boolean>;
export default init;
