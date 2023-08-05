/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import StrikethroughIcon from 'payload/src/admin/components/icons/Strikethrough';
import LeafButton from '../Button';

const Strikethrough = ({ attributes, children }) => (
  <del {...attributes}>
    {children}
  </del>
);

const strikethrough = {
  Button: () => (
    <LeafButton format="strikethrough">
      <StrikethroughIcon />
    </LeafButton>
  ),
  Leaf: Strikethrough,
};

export default strikethrough;
