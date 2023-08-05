/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import ULIcon from 'payload/src/admin/components/icons/UnorderedList';
import ListButton from '../ListButton';

import './index.scss';

const UL = ({ attributes, children }) => (
  <ul
    className="rich-text-ul"
    {...attributes}
  >
    {children}
  </ul>
);

const ul = {
  Button: () => (
    <ListButton format="ul">
      <ULIcon />
    </ListButton>
  ),
  Element: UL,
};

export default ul;
