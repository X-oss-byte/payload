import React, { Suspense } from 'react';
import { ShimmerEffect } from '../../../elements/ShimmerEffect';
import { RichTextProps as Props } from './types';
import { useConfig } from '../../../utilities/Config';


const RichTextField: React.FC<Props> = (props) => {
  const config = useConfig();
  const RichText = config.admin.richText.component;


  return (
    <Suspense fallback={<ShimmerEffect height="35vh" />}>
      <RichText {...props} />
    </Suspense>
  );
};

export default RichTextField;
