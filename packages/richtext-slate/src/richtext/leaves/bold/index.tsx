/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import BoldIcon from 'payload/src/admin/components/icons/Bold';
import LeafButton from '../Button';

const Bold = ({ attributes, children }) => (
  <strong {...attributes}>{children}</strong>
);

const bold = {
  Button: () => (
    <LeafButton format="bold">
      <BoldIcon />
    </LeafButton>
  ),
  Leaf: Bold,
};

export default bold;
