// 物料的单位选择
// 包括主单位，转换单位
import React from 'react';
import debounce from 'lodash.debounce';
import _ from 'lodash';
import { injectIntl } from 'react-intl';

import { changeChineseToLocale } from 'src/utils/locale/utils';
import { queryMaterialDetail } from 'src/services/bom/material';
import log from 'src/utils/log';
import Select from '../select';

const Option = Select.Option;

type propsType = {
  id: any,
  style: mixed,
  params: mixed,
  onChange: () => {},
  disabled: boolean,
};

class SearchSelect extends React.Component<propsType> {
  constructor(props) {
    super(props);
    this.handleSearch = debounce(this.handleSearch, 800);
    this.state = {
      data: [],
    };
  }

  componentDidMount() {
    if (!this.props.disabled) {
      this.handleSearch();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.params, this.props.params)) {
      this.handleSearch(nextProps.params);
    }
  }

  handleSearch = async params => {
    try {
      const { materialCode } = params || this.props.params || {};

      if (!materialCode) return;

      const res = await queryMaterialDetail(materialCode);
      const { unitName, unitId, unitConversions } = _.get(res, 'data.data') || {};

      let units = Array.isArray(unitConversions) ? unitConversions.map(i => {
        const { slaveUnitId, slaveUnitName } = i || {};
        return { key: slaveUnitId, label: slaveUnitName };
      }) : [];
      units = unitId && unitName ? units.concat({ key: unitId, label: unitName }) : units;

      this.setState({
        data: units || [],
        fetching: false,
      });
    } catch (e) {
      log.error(e);
    }
  };

  render() {
    const { data } = this.state;
    const { style, disabled, intl, ...rest } = this.props;

    return (
      <Select
        allowClear
        disabled={disabled}
        labelInValue
        placeholder={changeChineseToLocale('请选择', intl)}
        onSearch={this.handleSearch}
        style={{ width: 120, ...style }}
        filterOption
        {...rest}
      >
        {data.map(({ key, label, ...rest }) => (
          <Option key={`key-${key}`} value={key} title={label} {...rest}>
            {label}
          </Option>
        ))}
      </Select>
    );
  }
}

export default injectIntl(SearchSelect);
