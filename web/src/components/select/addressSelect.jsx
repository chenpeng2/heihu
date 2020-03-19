import React, { Component } from 'react';
import _ from 'lodash';
import { injectIntl } from 'react-intl';
import { Cascader } from 'antd';
import { addressData } from 'src/constants';
import { changeChineseToLocale } from 'utils/locale/utils';

type propTypes = {
  onChange: () => {},
  showSearch: boolean,
  placeholder: String,
  intl: any,
};

class AddressSelect extends Component<propTypes> {
  props: propTypes;

  getFromatData = () => {
    return Object.keys(addressData).map(n => {
      return {
        value: n,
        label: n,
        children: addressData[n].map(n => ({ value: n, label: n })),
      };
    });
  };

  filter = (inputValue, path) => {
    return path.some(option => option.label.indexOf(inputValue) > -1);
  };

  render() {
    const { onChange, showSearch, placeholder, intl, ...rest } = this.props;
    const data = this.getFromatData();

    return (
      <Cascader
        showSearch={showSearch ? { filter: this.filter } : false}
        options={data}
        onChange={onChange}
        placeholder={changeChineseToLocale(placeholder || '请选择', intl)}
        {...rest}
      />
    );
  }
}

export default injectIntl(AddressSelect);
