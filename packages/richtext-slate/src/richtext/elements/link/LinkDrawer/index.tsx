/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer } from 'payload/src/admin/components/elements/Drawer';
import Form from 'payload/src/admin/components/forms/Form';
import FormSubmit from 'payload/src/admin/components/forms/Submit';
import fieldTypes from 'payload/src/admin/components/forms/field-types';
import RenderFields from 'payload/src/admin/components/forms/RenderFields';
import { Props } from './types';

import './index.scss';

const baseClass = 'rich-text-link-edit-modal';

export const LinkDrawer: React.FC<Props> = ({
  handleModalSubmit,
  initialState,
  fieldSchema,
  drawerSlug,
}) => {
  const { t } = useTranslation('fields');

  return (
    <Drawer
      slug={drawerSlug}
      className={baseClass}
      title={t('editLink')}
    >
      <Form
        onSubmit={handleModalSubmit}
        initialState={initialState}
      >
        <RenderFields
          fieldTypes={fieldTypes}
          readOnly={false}
          fieldSchema={fieldSchema}
          forceRender
        />
        <FormSubmit>
          {t('general:submit')}
        </FormSubmit>
      </Form>
    </Drawer>
  );
};
