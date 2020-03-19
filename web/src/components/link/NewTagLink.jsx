import React from 'react';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

const NewTagLink = ({ href, children, ...rest }) => (
  <a href={href} target="_blank" without rel="noopener noreferrer" {...rest}>
    {typeof children === 'string' ? changeChineseToLocaleWithoutIntl(children) : children}
  </a>
);

export default NewTagLink;
