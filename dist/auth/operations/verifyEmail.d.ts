import { Collection } from '../../collections/config/types';
import { PayloadRequest } from '../../express/types';
export type Args = {
    req: PayloadRequest;
    token: string;
    collection: Collection;
};
declare function verifyEmail(args: Args): Promise<boolean>;
export default verifyEmail;
