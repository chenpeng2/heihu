// 用户工作部门的仓库选择
import React from 'react';
import debounce from 'lodash.debounce';
import _ from 'lodash';

import { queryMaterialList } from 'src/services/bom/materialType';
import { Select } from 'src/components';
import log from 'src/utils/log';

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

  handleSearch = async () => {
    const { params } = this.props;
    try {
      const res = await queryMaterialList(params);
      const data = _.get(res, 'data.data');
      const _data = data.map(i => {
        const { id, name } = i || {};
        return { key: id, label: name };
      });

      this.setState({
        data: _data || [],
        fetching: false,
      });
    } catch (e) {
      log.error(e);
    }
  };

  render() {
    const { data } = this.state;
    const { style, disabled, ...rest } = this.props;

    return (
      <Select
        allowClear
        disabled={disabled}
        labelInValue
        placeholder="请选择"
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

export default SearchSelect;
