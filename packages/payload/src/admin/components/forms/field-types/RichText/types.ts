import { RichTextField } from '../../../../../fields/config/types';

export type RichTextProps = Omit<RichTextField, 'type'> & {
  path?: string;
};

export interface RichTextAdapter {
  component: React.FC<RichTextProps>;
}

export interface RichTextAdapter {
  component: React.FC<Props>;
}
