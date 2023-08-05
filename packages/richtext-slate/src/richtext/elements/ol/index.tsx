/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import OLIcon from 'payload/src/admin/components/icons/OrderedList';
import ListButton from '../ListButton';

import './index.scss';

const OL = ({ attributes, children }) => (
  <ol
    className="rich-text-ol"
    {...attributes}
  >
    {children}
  </ol>
);

const ol = {
  Button: () => (
    <ListButton format="ol">
      <OLIcon />
    </ListButton>
  ),
  Element: OL,
};

export default ol;
