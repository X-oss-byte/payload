import { PreferenceUpdateRequest } from '../types';
declare function update(args: PreferenceUpdateRequest): Promise<{
    key: string;
    value: undefined;
    user: {
        value: string;
        relationTo: string;
    };
}>;
export default update;
