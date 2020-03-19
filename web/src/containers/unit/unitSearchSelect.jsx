// TODO: 将components的SearchSelect改为基本组件。利用基本组件重新实现这个组件
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { queryUnits } from 'src/services/bom/material';
import { Spin, Select } from 'src/components';

const Option = Select.Option;

class UnitSearchSelect extends Component {
  constructor(props) {
    super(props);
    this.lastFetchId = 0;
    this.firstFocus = false; // 第一次focus不应该拉取数据
    this.handleSearch = _.debounce(this.handleSearch, 800);
    this.state = {
      data: [],
      fetching: false,
    };
  }

  componentDidMount() {
    if (!this.props.disabled) {
      this.handleSearch(this.props.params);
    }
  }

  handleSearch = search => {
    this.setState({ fetching: true });
    queryUnits({ status: 1, search, size: 50 })
      .then(res => {
        this.setState({ data: _.get(res, 'data.data') });
      })
      .finally(() => {
        this.setState({ fetching: false });
      });
  };

  render() {
    const { data, fetching } = this.state;
    const { style, ...rest } = this.props;

    return (
      <Select
        allowClear
        labelInValue
        placeholder="请选择"
        onSearch={this.handleSearch}
        style={{ width: 120, ...style }}
        filterOption={false}
        onFocus={() => {
          // 默认第一次focus是不拉数据的，若需要loadOnFocus则单独再拉一次
          if (this.firstFocus) {
            this.handleSearch();
          } else {
            this.firstFocus = true;
          }
        }}
        onBlur={() => {
          this.setState({ data: [] });
        }}
        notFoundContent={fetching ? <Spin size="small" /> : null}
        {...rest}
      >
        {data.filter(i => i && i.name && i.id).map(i => {
          const { id, name } = i || {};
          return (
            <Option unit={i} key={id} value={id} title={name}>
              {name}
            </Option>
          );
        })}
      </Select>
    );
  }
}

UnitSearchSelect.propTypes = {
  style: PropTypes.object,
  params: PropTypes.any,
  disabled: PropTypes.bool,
};

export default UnitSearchSelect;
