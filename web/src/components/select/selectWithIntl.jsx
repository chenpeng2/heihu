import React from 'react';
import { injectIntl } from 'react-intl';
import { arrayIsEmpty } from 'utils/array';
import { changeChineseToLocale } from 'utils/locale/utils';

import Select from './index';

const SelectWithIntl = injectIntl(props => {
  const { children, intl, ...rest } = props;
  const renderOption = child => {
    const _children = child.props.children;
    if (typeof _children === 'string') {
      return React.cloneElement(child, { children: changeChineseToLocale(_children, intl) });
    }
    return child;
  };
  const renderOptGroup = child => {
    const _children = child.props.children;
    if (typeof _children === 'string') {
      return React.cloneElement(child, { children: changeChineseToLocale(_children, intl) });
    }
    return child;
  };
  const renderChild = child => {
    if (!child) return null;
    if (child.type.displayName === 'Option') {
      return renderOption(child);
    }
    return renderOptGroup(child);
  };
  return <Select {...rest}>{arrayIsEmpty(children) ? null : children.map(child => renderChild(child))}</Select>;
});

export default SelectWithIntl;
