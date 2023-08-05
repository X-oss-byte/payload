/* eslint-disable import/no-extraneous-dependencies */
import type { RichTextAdapter } from 'payload/src/admin/components/forms/field-types/RichText/types';
import { lazy } from 'react';

const RichText = lazy(() => import('./richtext/RichText'));

export function slateAdapter(): RichTextAdapter {
  return {
    component: RichText,
  };
}
