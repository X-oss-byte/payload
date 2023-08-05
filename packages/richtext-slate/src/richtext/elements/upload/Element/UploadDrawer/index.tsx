/* eslint-disable import/no-extraneous-dependencies */
import { useModal } from '@faceless-ui/modal';
import { Transforms } from 'slate';
import { ReactEditor, useSlateStatic } from 'slate-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SanitizedCollectionConfig } from 'payload/src/collections/config/types';
import fieldTypes from 'payload/src/admin/components/forms/field-types';
import { Drawer } from 'payload/src/admin/components/elements/Drawer';
import { useAuth } from 'payload/src/admin/components/utilities/Auth';
import { useLocale } from 'payload/src/admin/components/utilities/Locale';
import Form from 'payload/src/admin/components/forms/Form';
import RenderFields from 'payload/src/admin/components/forms/RenderFields';
import FormSubmit from 'payload/src/admin/components/forms/Submit';
import buildStateFromSchema from 'payload/src/admin/components/forms/Form/buildStateFromSchema';
import { getTranslation } from 'payload/src/utilities/getTranslation';
import deepCopyObject from 'payload/src/utilities/deepCopyObject';
import { useDocumentInfo } from 'payload/src/admin/components/utilities/DocumentInfo';
import { ElementProps } from '..';

export const UploadDrawer: React.FC<ElementProps & {
  drawerSlug: string
  relatedCollection: SanitizedCollectionConfig
}> = (props) => {
  const editor = useSlateStatic();

  const {
    fieldProps,
    relatedCollection,
    drawerSlug,
    element,
  } = props;

  const { t, i18n } = useTranslation();
  const locale = useLocale();
  const { user } = useAuth();
  const { closeModal } = useModal();
  const { getDocPreferences } = useDocumentInfo();
  const [initialState, setInitialState] = useState({});
  const fieldSchema = fieldProps?.admin?.upload?.collections?.[relatedCollection.slug]?.fields;

  const handleUpdateEditData = useCallback((_, data) => {
    const newNode = {
      fields: data,
    };

    const elementPath = ReactEditor.findPath(editor, element);

    Transforms.setNodes(
      editor,
      newNode,
      { at: elementPath },
    );
    closeModal(drawerSlug);
  }, [closeModal, editor, element, drawerSlug]);

  useEffect(() => {
    const awaitInitialState = async () => {
      const preferences = await getDocPreferences();
      const state = await buildStateFromSchema({ fieldSchema, preferences, data: deepCopyObject(element?.fields || {}), user, operation: 'update', locale, t });
      setInitialState(state);
    };

    awaitInitialState();
  }, [fieldSchema, element.fields, user, locale, t, getDocPreferences]);

  return (
    <Drawer
      slug={drawerSlug}
      title={t('general:editLabel', { label: getTranslation(relatedCollection.labels.singular, i18n) })}
    >
      <Form
        onSubmit={handleUpdateEditData}
        initialState={initialState}
      >
        <RenderFields
          readOnly={false}
          fieldTypes={fieldTypes}
          fieldSchema={fieldSchema}
        />
        <FormSubmit>
          {t('fields:saveChanges')}
        </FormSubmit>
      </Form>
    </Drawer>
  );
};
