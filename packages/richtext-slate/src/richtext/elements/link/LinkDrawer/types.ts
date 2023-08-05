/* eslint-disable import/no-extraneous-dependencies */
import { Field } from 'payload/src/fields/config/types';
import { Fields } from 'payload/src/admin/components/forms/Form/types';

export type Props = {
  drawerSlug: string;
  handleClose: () => void;
  handleModalSubmit: (fields: Fields, data: Record<string, unknown>) => void;
  initialState?: Fields;
  fieldSchema: Field[];
};
